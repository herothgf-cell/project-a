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
   await p.waitForTimeout(150);await p.screenshot({path:path.join(out,'scene-'+area+'-candidate.png')});
  }
  for(const [area,world,kind]of [['forest','murim','bandit'],['rift','reality','shade']]){
   await p.evaluate(area=>{__game.progress=8;__game.enter(area);__game.events=[];const e=__game.enemies.find(e=>!e.boss);__game.player.x=e.x-100;__game.player.y=e.y+60;__game.player.invuln=10;},area);
   await p.waitForFunction(([area,world,kind])=>[...ArtPreview.diagnostics.entries()].some(([k,v])=>k.startsWith(area+':')&&v.id===world+'.enemy.'+kind),[area,world,kind]);
   await p.waitForTimeout(150);await p.screenshot({path:path.join(out,'enemy-'+area+'-candidate.png')});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({scenes:['city','village','forest','rift'],NPCPortraits:'independent',pageErrors:errors,artApproved:false}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
