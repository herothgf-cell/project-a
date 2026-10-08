'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const world=process.env.ART_WORLD||'murim';assert.ok(['murim','reality'].includes(world));
 const action=process.env.ART_ACTION||'attack1';assert.ok(['attack1','attack2','attack3'].includes(action));const combo=Number(action.slice(-1));
 const out=path.resolve('.superpowers/art-production/evidence/'+action+'-directions'+(world==='reality'?'-reality':''));fs.mkdirSync(out,{recursive:true});
 const errors=[],results=[];
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
  const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;return step.apply(this,args);};}});});
  const url='http://127.0.0.1:'+server.address().port;
  await p.goto(url+'/art-play.html?campaign=classic');await p.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await p.evaluate(()=>ArtPreview.error),null);
  await p.click('#start');await p.locator('#dialogActions button').first().click();await p.waitForFunction(()=>window.__game);
  for(const [facing,angle]of [['s',Math.PI/2],['se',Math.PI/4],['e',0],['ne',-Math.PI/4],['n',-Math.PI/2],['nw',-3*Math.PI/4],['w',Math.PI],['sw',3*Math.PI/4]]){
   const expected=await p.evaluate(([angle,world,combo])=>{const g=__game;g.progress=8;g.training=1;g.enter(world==='murim'?'forest':'rift');g.events=[];g.enemies=g.enemies.filter(e=>!e.boss).slice(0,1);Object.assign(g.player,{x:850,y:700,face:angle});Object.assign(g.enemies[0],{x:850+Math.cos(angle)*35,y:700+Math.sin(angle)*35,hp:1000,maxHp:1000,cd:999});g.player.cool.attack=0;g.combo=combo-1;g.lastAttack=g.playTime;g.hitStop=0;return Math.round(g.stats().attack*(combo===3?1.7:combo===2?1.1:1));},[angle,world,combo]);
   await p.keyboard.press('KeyJ');
   await p.waitForFunction(([facing,world,action])=>{const d=ArtPreview.diagnostics.get(world+'.hero');return d?.action===action&&d.facing===facing&&d.status==='candidate';},[facing,world,action]);
   const probe=await p.evaluate(world=>{const g=__game,a=g.player.motion.instance;return{damage:1000-g.enemies[0].hp,body:ArtPreview.diagnostics.get(world+'.hero'),effect:ArtPreview.effectDiagnostics.get(a.actionId)};},world);
   assert.equal(probe.damage,expected);assert.equal(probe.body.frame,probe.effect.frame);assert.equal(probe.body.elapsed,probe.effect.elapsed);
   results.push({facing,...probe});await p.screenshot({path:path.join(out,'game-'+facing+'.png')});
  }
  await p.goto(url+'/art-review.html');await p.waitForFunction(()=>document.body.dataset.ready==='true');await p.selectOption('#reviewAction',action);
  const canvas=p.locator('canvas[data-asset-id="'+world+'.hero.yunseo"][data-action="'+action+'"]');
  for(const facing of ['s','se','e','ne','n','nw','w','sw']){await p.selectOption('#reviewFacing',facing);for(let frame=0;frame<4;frame++){await p.locator('#reviewFrame').fill(String(frame));await p.locator('#reviewFrame').dispatchEvent('input');assert.equal(await canvas.getAttribute('data-blocked'),'false');await p.waitForFunction(()=>[...document.querySelectorAll('canvas[data-action]')].every(c=>c.dataset.loading==='false'));await canvas.screenshot({path:path.join(out,facing+'-'+frame+'.png')});}}
  assert.deepEqual(errors,[]);console.log(JSON.stringify({world,facings:results.length,frames:32,pageErrors:errors,approved:false}));
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,pageErrors:errors,approved:false},null,2));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
