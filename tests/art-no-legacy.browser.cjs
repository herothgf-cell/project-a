'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {createServer}=require('../server.cjs');
(async()=>{const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});const p=await browser.newPage();
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...a){window.__game=this;return step.apply(this,a);};}});});
  await p.route('**/art-preview-runtime.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:`window.__legacy=[];for(const key of ['human','portrait','prop','portal']){const fn=WorldArt[key];WorldArt[key]=function(...a){__legacy.push(key);return fn.apply(this,a);};}\n`+await r.text()});});
  await p.route('**/attack1-e-candidate-v2.png',async route=>{await new Promise(r=>setTimeout(r,1500));await route.continue();});
  await p.route('**/murim/environment/*.png',async route=>{await new Promise(r=>setTimeout(r,800));await route.continue();});
  await p.route('**/scene-candidate.json',async route=>{await new Promise(r=>setTimeout(r,1600));await route.continue();});
  await p.goto('http://127.0.0.1:'+server.address().port+'/art-play.html',{waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('#cover').evaluate(el=>getComputedStyle(el).visibility),'hidden','bootstrap must not expose old canvas');
  await p.waitForFunction(()=>ArtPreview.ready);await p.click('#start');await p.locator('#dialogActions button').first().click();await p.waitForFunction(()=>window.__game);
  await p.waitForFunction(()=>ArtPreview.diagnostics.get('reality.hero')?.status==='candidate');
  await p.evaluate(()=>{__legacy=[];__game.player.face=0;__game.act('attack');});await p.waitForTimeout(700);
  assert.deepEqual(await p.evaluate(()=>__legacy),[],'loading an action must not call the retired renderer');
  await p.evaluate(()=>{__legacy=[];__game.enter('village');__game.events=[];});await p.waitForTimeout(500);
  assert.deepEqual(await p.evaluate(()=>__legacy),[],'world transition must not flash old portraits/buildings/portals');
  await p.evaluate(()=>{__game.enter('forest');__game.events=[];__game.player.invuln=999;const e=__game.enemies[0];__game.player.x=e.x-100;__game.player.y=e.y;__legacy=[];});await p.waitForTimeout(1000);
  assert.deepEqual(await p.evaluate(()=>__legacy.filter(x=>x==='human')),[],'missing enemy directions must keep the same identity, never old bodies');
  console.log('No retired actor renderer during delayed hero action or missing enemy facing');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
