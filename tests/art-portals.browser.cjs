'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const out=path.resolve('.superpowers/art-production/evidence/portals');fs.mkdirSync(out,{recursive:true});
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;if(!window.__pause)return step.apply(this,args);};}});});
  await p.goto('http://127.0.0.1:'+server.address().port+'/art-play.html?campaign=classic');await p.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await p.evaluate(()=>ArtPreview.error),null);
  await p.click('#start');await p.locator('#dialogActions button').first().click();await p.waitForFunction(()=>window.__game);
  await p.evaluate(()=>{__pause=true;const o=DualWorld.AREAS.city.points.find(o=>o.id==='portal');__game.player.x=o.x;__game.player.y=o.y+25;});
  const state=()=>p.evaluate(()=>ArtRuntime.portalState(__game,DualWorld.AREAS[__game.area].points.find(o=>o.id==='portal')));
  const capture=async name=>{await p.waitForFunction(()=>ArtPreview.residency.pending===0);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.screenshot({path:path.join(out,name+'.png')});};
  assert.equal(await state(),'locked');assert.equal(await p.evaluate(()=>__game.interact().type),'dialog');assert.equal(await p.evaluate(()=>__game.area),'city');await capture('reality-locked');
  await p.evaluate(()=>{const o=DualWorld.AREAS.city.points.find(o=>o.id==='warden');__game.player.x=o.x;__game.player.y=o.y;__game.interact();});
  assert.equal(await p.evaluate(()=>__game.progress),1);
  for(const area of ['city','village']){
   await p.evaluate(area=>{if(__game.area!==area)__game.enter(area);__game.events=[];__game.playTime+=1;const o=DualWorld.AREAS[area].points.find(o=>o.id==='portal');__game.player.x=o.x-150;__game.player.y=o.y;},area);
   assert.equal(await state(),'available');await capture(area+'-available');
   await p.evaluate(()=>{const o=DualWorld.AREAS[__game.area].points.find(o=>o.id==='portal');__game.player.x=o.x;__game.player.y=o.y+25;});
   assert.equal(await state(),'active');await capture(area+'-active');
   const proportions=await p.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=600;const ctx=canvas.getContext('2d');
    const measure=kind=>{ctx.clearRect(0,0,600,600);WorldArt.portal(ctx,{id:kind,x:300,y:500,kind},0,'',false);const data=ctx.getImageData(0,0,600,600).data;let top=600,bottom=-1;for(let y=0;y<600;y++)for(let x=0;x<600;x++)if(data[(y*600+x)*4+3]>32){top=Math.min(top,y);bottom=Math.max(bottom,y);}return bottom-top+1;};
    return {portal:measure('portal'),gate:measure('gate')};
   });
   assert.ok(proportions.gate>0&&proportions.portal>=proportions.gate*1.5,JSON.stringify(proportions));
   assert.equal(await p.evaluate(()=>__game.interact().type),'travel');
   assert.equal(await state(),'transition');
   await p.evaluate(()=>{const o=DualWorld.AREAS[__game.area].points.find(o=>o.id==='portal');__game.player.x=o.x;__game.player.y=o.y+25;});
   await capture(area+'-arrival-transition');
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({introductoryLock:true,worlds:2,states:['locked','available','active','transition'],pageErrors:errors,approved:false}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
