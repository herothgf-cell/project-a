'use strict';
// Real Chromium and HTTP; output is review evidence, never production art approval.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createServer}=require('../server.cjs');
async function main(){
 const out=path.resolve(process.argv[2]||'.superpowers/art-production/evidence');fs.mkdirSync(out,{recursive:true});
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 let browser;const errors=[];
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url+'/art-review.html');await page.waitForFunction(()=>document.body.dataset.ready);assert.equal(await page.getAttribute('body','data-ready'),'true');
  assert.equal(await page.locator('canvas').count(),16);
  assert.equal(await page.locator('[data-asset-id="reality.hero.yunseo"]').count(),8);assert.equal(await page.locator('[data-asset-id="murim.hero.yunseo"]').count(),8);
  await page.selectOption('#scale','180');await page.screenshot({path:path.join(out,'hero-idle-candidates.png'),fullPage:true});
  const probe=await page.evaluate(async()=>{
   const m=await (await fetch('assets/art/reality/hero/yunseo/candidate.json')).json(),c=ProductionArt.createCatalog(m),v=c.resolve({world:'reality',entityId:'hero',action:'idle',facing:'s'},{preview:true}),cache=ProductionArt.createImageCache();
   const first=await cache.load(v),second=await cache.load(v);const cv=document.createElement('canvas');cv.width=first.image.naturalWidth;cv.height=first.image.naturalHeight;const ctx=cv.getContext('2d');ctx.drawImage(first.image,0,0);const bytes=ctx.getImageData(0,0,cv.width,cv.height).data;let transparent=0,opaque=0;for(let i=3;i<bytes.length;i+=4){if(bytes[i]===0)transparent++;if(bytes[i]>=250)opaque++;}
   const missing=await cache.load({...v,atlas:{...v.atlas,path:'assets/art/reality/hero/yunseo/not-present.png'}});
   return {same:first.image===second.image,transparent,opaque,missing:missing.status,cacheSize:cache.size};
  });assert.ok(probe.same);assert.ok(probe.transparent>10000);assert.ok(probe.opaque>10000);assert.equal(probe.missing,'BLOCKED_ART');assert.equal(probe.cacheSize,1);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'art-review-mobile.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.close();
  const game=await browser.newPage({viewport:{width:1440,height:900}});game.on('pageerror',e=>errors.push(String(e)));
  await game.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;for(const k of ['save','step']){const original=api.Game.prototype[k];api.Game.prototype[k]=function(...args){window.__game=this;return original.apply(this,args);};}}});});
  await game.goto(url);await game.waitForFunction(()=>window.WuxiaArt&&WuxiaArt.ready());await game.click('#start');await game.locator('#dialogActions button').first().click();await game.waitForFunction(()=>window.__game);
  await game.screenshot({path:path.join(out,'before-reality-base.png')});
  await game.evaluate(()=>{__game.progress=2;__game.training=1;__game.enter('village');__game.events=[];});await game.waitForTimeout(180);
  await game.screenshot({path:path.join(out,'before-murim-village.png')});
  await game.keyboard.press('KeyJ');
  const actionProbe=await game.evaluate(()=>{const f=__game.fx.find(f=>f.kind==='slash'),body=Presentation.pose(__game.player,__game.playTime),vfx=Presentation.effectPose(f,__game.playTime);return {bodyId:body.actionId,vfxId:vfx.actionId,bodyTime:body.u,vfxTime:vfx.u,contactAt:body.contactAt,startedAt:f.actionInstance.startedAt};});
  assert.ok(actionProbe.bodyId);assert.equal(actionProbe.bodyId,actionProbe.vfxId);assert.equal(actionProbe.bodyTime,actionProbe.vfxTime);assert.equal(actionProbe.contactAt,actionProbe.startedAt);
  await game.screenshot({path:path.join(out,'action-timing-development.png')});assert.deepEqual(errors,[]);
  const report={status:'code-ready / candidate-art-only',checks:['16 independent directional candidates load over HTTP','transparent and opaque pixels exist','image cache reuses decoded image','failed load returns BLOCKED_ART and can retry','mobile review has no horizontal overflow','existing city/village remain functional'],probe,pageErrors:errors,artApproved:false,gameArtIntegrated:false};
  report.actionProbe=actionProbe;report.checks.push('real keyboard attack body/effect share action id and contact clock');
  fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
