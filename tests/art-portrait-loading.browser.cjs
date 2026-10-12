'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,release;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;return step.apply(this,args);};}});});
  const hold=new Promise(r=>release=r);
  await page.route('**/reality/npc/seorin-candidate-v1.png',async route=>{await hold;await route.continue();});
  await page.goto('http://127.0.0.1:'+server.address().port+'/art-play.html');
  await page.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await page.evaluate(()=>ArtPreview.error),null);
  await page.click('#start');await page.locator('#dialogActions button').first().click();
  await page.waitForFunction(()=>window.__game);
  await page.evaluate(()=>{const o=DualWorld.AREAS.city.points.find(o=>o.id==='warden');__game.player.x=o.x;__game.player.y=o.y+30;});
  await page.keyboard.press('KeyE');await page.waitForFunction(()=>!document.getElementById('dialog').hidden);
  assert.equal(await page.getAttribute('#portrait','data-production-portrait'),null);
  release();
  await page.waitForFunction(()=>ArtPreview.diagnostics.get('reality.npc.seorin')?.status==='candidate');
  await page.waitForFunction(()=>document.getElementById('portrait').dataset.productionPortrait==='reality.npc.seorin',{},{timeout:5000});
  assert.deepEqual(errors,[]);console.log('delayed NPC atlas refreshes the already-open conversation portrait');
 }finally{release?.();if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
