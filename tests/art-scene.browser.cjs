'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const errors=[],out=path.resolve('.superpowers/art-production/evidence');fs.mkdirSync(out,{recursive:true});
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});const p=await browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;return step.apply(this,args);};}});});
  await p.goto('http://127.0.0.1:'+server.address().port+'/art-play.html');await p.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await p.evaluate(()=>ArtPreview.error),null);
  await p.click('#start');await p.locator('#dialogActions button').first().click();await p.waitForFunction(()=>window.__game);
  for(const [area,world,npc]of [['city','reality','npc.seorin'],['village','murim','npc.baekryun']]){
   await p.evaluate(area=>{__game.progress=5;__game.enter(area);__game.events=[];},area);await p.waitForFunction(k=>ArtPreview.diagnostics.get(k)?.status==='candidate',world+'.'+npc);
   const id=await p.evaluate(([world,kind])=>{const c=document.createElement('canvas');c.width=c.height=256;RealmArt.begin(__game);WorldArt.portrait(c,kind);return c.dataset.productionPortrait;},[world,area==='city'?'warden':'master']);assert.equal(id,world+'.'+npc);
   await p.waitForFunction(world=>ArtPreview.diagnostics.get(world+'.ground-dressing')?.count>0,world);
   await p.waitForFunction(world=>ArtPreview.diagnostics.get(world+'.foreground')?.status==='candidate',world);
   const seams=await p.evaluate(async world=>{
    const manifest=await (await fetch('assets/art/scene-candidate.json')).json(),asset=manifest.assets.find(a=>a.id===world+'.environment.ground');
    const image=ArtPreview.residency.get(asset.atlas.path),tile=document.createElement('canvas');tile.width=tile.height=512;const c=tile.getContext('2d');
    ArtRuntime.drawTerrainRepeat(c,image,asset.clips['cell-0'].none[0].rect,256);const pixels=c.getImageData(0,0,512,512).data;let delta=0;
    for(let n=0;n<512;n++)for(let channel=0;channel<4;channel++){
     delta+=Math.abs(pixels[(n*512)*4+channel]-pixels[(n*512+511)*4+channel]);
     delta+=Math.abs(pixels[n*4+channel]-pixels[(511*512+n)*4+channel]);
    }
    return delta;
   },world);assert.equal(seams,0,'real material pixels must meet at repeat boundaries');
   const occlusion=await p.evaluate(world=>{
    const player=__game.player,saved={x:player.x,y:player.y};
    const c=document.createElement('canvas');c.width=c.height=800;const ctx=c.getContext('2d');
    const object={world,cell:0,x:400,y:500,scale:1};
    const pixels=()=>{const data=ctx.getImageData(0,0,800,800).data;let sum=0;for(let i=3;i<data.length;i+=4)sum+=data[i];return sum;};
    try{
     player.x=400;player.y=550;WorldArt.foreground(ctx,object);const front=pixels();
     ctx.clearRect(0,0,800,800);player.y=480;WorldArt.foreground(ctx,object);const behind=pixels();
     return {front,behind,identity:ArtPreview.diagnostics.get(world+'.foreground').id};
    }finally{Object.assign(player,saved);}
   },world);
   assert.ok(occlusion.front>0,'foreground must draw actual pixels');
   assert.ok(occlusion.behind/occlusion.front>.38&&occlusion.behind/occlusion.front<.42,'foreground must reveal a player behind it');
   assert.equal(occlusion.identity,world+'.environment.foreground');
   await p.waitForFunction(()=>ArtPreview.residency.pending===0);await p.screenshot({path:path.join(out,'scene-'+area+'-candidate.png')});
   assert.equal(await p.evaluate(world=>ArtPreview.diagnostics.get(world+'.rest')?.status,world),'candidate');
  }
  for(const [area,world,kind]of [['forest','murim','bandit'],['rift','reality','shade']]){
   await p.evaluate(area=>{__game.progress=8;__game.enter(area);__game.events=[];const e=__game.enemies.find(e=>!e.boss);__game.player.x=e.x+100;__game.player.y=e.y+100;__game.player.invuln=10;},area);
   await p.waitForFunction(([area,world,kind])=>[...ArtPreview.diagnostics.entries()].some(([k,v])=>k.startsWith(area+':')&&v.id===world+'.enemy.'+kind),[area,world,kind]);
   await p.waitForTimeout(150);await p.screenshot({path:path.join(out,'enemy-'+area+'-candidate.png')});
   await p.evaluate(()=>{const e=__game.enemies.find(e=>!e.boss);__game.strike(e,999999);});
   await p.waitForFunction(area=>[...ArtPreview.diagnostics.entries()].some(([k,v])=>k.startsWith(area+':')&&v.action==='death'),area);
   await p.screenshot({path:path.join(out,'death-'+area+'-candidate.png')});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({scenes:['city','village','forest','rift'],NPCPortraits:'independent',pageErrors:errors,artApproved:false}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
