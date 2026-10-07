const assert=require('node:assert/strict'),{run}=require('./browser-harness.cjs'),{inherited}=require('./world-fixtures.cjs');
run(async p=>{
 await p.evaluate(raw=>Object.assign(__game,WorldGame.Game.load(raw)),inherited().save());
 await p.evaluate(async()=>{await ArtPreview.prepare('murim');__game.enter('forest');__game.events=[];__game.player.invuln=999;const old=WorldRenderer.prototype.scenery;WorldRenderer.prototype.scenery=function(...args){window.testRenderer=this;return old.apply(this,args);};});
 await p.waitForFunction(()=>ArtPreview.diagnostics.get('murim.ground-dressing')?.count>0&&ArtPreview.residency.pending===0&&window.testRenderer);
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await p.evaluate(()=>{window.savedTerrain=testRenderer.scenery('forest');window.savedPixels=savedTerrain.terrain.toDataURL();});
 await p.evaluate(()=>dispatchEvent(new CustomEvent('wuxia-assets-ready',{detail:{paths:['assets/art/murim/enemy/bandit-candidate-v2.png']}})));
 assert.equal(await p.evaluate(()=>testRenderer.scenery('forest')===savedTerrain),true,'enemy-only loads must not invalidate terrain');
 // Decode a burst of real combat atlases between frames, as on a stalled/backgrounded frame.
 // Keep the actual 128 MiB budget: the ground source must be evicted, not mocked away.
 await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+100));
 await p.evaluate(async()=>{const m=await(await fetch('assets/art/scene-candidate.json')).json();for(const a of m.assets.filter(a=>a.kind==='enemy'&&a.world==='murim'))for(const atlas of [a.atlas,...Object.values(a.atlases||{})])ArtPreview.residency.request({status:'candidate',atlas});});
 for(let n=0;n<250;n++){if(!await p.evaluate(()=>ArtPreview.residency.pending))break;await new Promise(r=>setTimeout(r,20));}
 assert.equal(await p.evaluate(()=>ArtPreview.residency.pending),0,'combat textures finish decoding');
 assert.equal(await p.evaluate(()=>!!ArtPreview.residency.get('assets/art/murim/environment/ground-candidate-v2.png')),false,'reproduce real terrain source eviction');
 await p.evaluate(()=>{const old=WorldRenderer.prototype.scenery;window.blankTerrainFrames=0;WorldRenderer.prototype.scenery=function(id){const scene=old.call(this,id);if(id==='forest'&&scene!==savedTerrain&&scene.terrain.toDataURL()!==savedPixels)blankTerrainFrames++;return scene;};});
 await p.clock.resume();await p.waitForTimeout(200);
 assert.equal(await p.evaluate(()=>blankTerrainFrames),0,'combat atlas loads must not replace completed ground with a loading fallback');
 assert.equal(await p.evaluate(()=>testRenderer.scenery('forest').terrain.toDataURL()===savedPixels),true,'ground pixels stay identical');
 assert.ok(await p.evaluate(()=>ArtPreview.residency.bytes<=128*1024*1024),'retain image memory budget');
 // Terrain asset notifications still refresh their dependent scenery.
 await p.evaluate(()=>{window.afterCombatTerrain=testRenderer.scenery('forest');dispatchEvent(new CustomEvent('wuxia-assets-ready',{detail:{paths:['assets/art/murim/environment/ground-candidate-v2.png']}}));});
 await p.waitForFunction(()=>testRenderer.scenery('forest')!==afterCombatTerrain&&ArtPreview.residency.pending===0);
 assert.equal(await p.evaluate(()=>testRenderer.scenery('forest').terrain.toDataURL()===savedPixels),true,'reloaded terrain preserves the same scene');
 console.log('combat terrain continuity passed under real atlas eviction and reload');
}).catch(e=>{console.error(e);process.exitCode=1;});
