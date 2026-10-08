'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const out=path.resolve('.superpowers/art-production/evidence/dodge-eight');fs.mkdirSync(out,{recursive:true});const errors=[],results=[];
 const facings=['e','se','s','sw','w','nw','n','ne'];
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;return step.apply(this,args);};}});});
  const url='http://127.0.0.1:'+server.address().port;await p.goto(url+'/art-play.html?campaign=classic');await p.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await p.evaluate(()=>ArtPreview.error),null);
  await p.click('#start');await p.locator('#dialogActions button').first().click();await p.waitForFunction(()=>window.__game);
  for(const world of ['reality','murim'])for(const [direction,facing] of facings.entries()){
   await p.evaluate(({world,direction})=>{const g=__game;g.progress=8;g.training=1;g.enter(world==='reality'?'city':'village');g.events=[];Object.assign(g.player,{x:700,y:650,face:direction*Math.PI/4});g.player.cool.dash=0;g.hitStop=0;},{world,direction});
   await p.keyboard.press('Space');await p.waitForFunction(({world,facing})=>{const d=ArtPreview.diagnostics.get(world+'.hero');return d?.action==='dodge'&&d.facing===facing&&d.status==='candidate';},{world,facing});
   const result=await p.evaluate(world=>{const g=__game;return {world,x:g.player.x,query:ArtPreview.diagnostics.get(world+'.hero'),action:g.player.motion.instance.action};},world);assert.equal(result.action,'dash');results.push(result);
   await p.screenshot({path:path.join(out,world+'-'+facing+'-game.png')});await p.waitForFunction(world=>ArtPreview.diagnostics.get(world+'.hero')?.action==='idle',world);
  }
  await p.goto(url+'/art-review.html');await p.waitForFunction(()=>document.body.dataset.ready==='true');await p.selectOption('#reviewAction','dodge');await p.selectOption('#reviewFacing','e');
  for(const world of ['reality','murim'])for(const facing of facings)for(let frame=0;frame<4;frame++){
   await p.selectOption('#reviewFacing',facing);
   await p.locator('#reviewFrame').fill(String(frame));await p.locator('#reviewFrame').dispatchEvent('input');const canvas=p.locator('canvas[data-asset-id="'+world+'.hero.yunseo"][data-action="dodge"]');assert.equal(await canvas.getAttribute('data-blocked'),'false');await p.waitForFunction(()=>[...document.querySelectorAll('canvas[data-action]')].every(c=>c.dataset.loading==='false'));await canvas.screenshot({path:path.join(out,world+'-'+facing+'-'+frame+'.png')});
  }
  for(const world of ['reality','murim']){
   const frame=require('../assets/art/'+world+'/hero/yunseo/candidate.json').assets[0].clips.dodge.ne[3];
   const canvas=p.locator('canvas[data-asset-id="'+world+'.hero.yunseo"][data-action="dodge"]');
   assert.ok(Math.abs(Number(await canvas.getAttribute('data-render-height'))-frame.displayHeight)<1e-8,'review must use game frame scale, not hide scale jumps with a constant box');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,pageErrors:errors,finalMotionApproved:false},null,2));console.log(JSON.stringify({worlds:2,facings:8,frames:64,pageErrors:errors,finalMotionApproved:false}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
