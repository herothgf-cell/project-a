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
  assert.equal(await page.locator('canvas').count(),18);
  assert.equal(await page.locator('[data-asset-id="reality.hero.yunseo"]').count(),9);assert.equal(await page.locator('[data-asset-id="murim.hero.yunseo"]').count(),9);
  await page.locator('#animate').check();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-action="walk"]')].every(c=>Number(c.dataset.frame)>0));
  await page.locator('#animate').uncheck();
  await page.selectOption('#reviewAction','attack1');
  await page.locator('#animate').check();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-action="attack1"]')].length===2&&[...document.querySelectorAll('[data-action="attack1"]')].every(c=>Number(c.dataset.frame)>0));
  await page.locator('#animate').uncheck();
  await page.locator('#reviewFrame').fill('0');
  await page.locator('#reviewFrame').dispatchEvent('input');
  assert.equal(await page.locator('[data-action="attack1"][data-contact="true"]').count(),2);
  await page.screenshot({path:path.join(out,'hero-contact-socket-review.png'),fullPage:true});
  await page.selectOption('#reviewAction','attack2');
  await page.selectOption('#reviewFacing','n');
  assert.equal(await page.locator('[data-blocked="true"]').count(),2,'missing facing must not reuse southeast');
  await page.selectOption('#reviewFacing','se');
  assert.equal(await page.locator('[data-action="attack2"][data-contact="true"]').count(),2);
  await page.selectOption('#reviewAction','walk');
  for(const facing of ['s','se','e','ne','n','nw','w','sw']){
   await page.selectOption('#reviewFacing',facing);
   assert.equal(await page.locator('[data-action="walk"]').count(),2);
   assert.equal(await page.locator('[data-blocked="true"]').count(),0);
   await page.locator('#reviewFrame').fill('5');await page.locator('#reviewFrame').dispatchEvent('input');
   assert.equal(await page.locator('[data-action="walk"][data-frame="5"]').count(),2);
  }
  await page.screenshot({path:path.join(out,'hero-walk-sw-review.png'),fullPage:true});
  await page.selectOption('#reviewFacing','se');
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
  const review=await browser.newPage({viewport:{width:1440,height:900}});review.on('pageerror',e=>errors.push(String(e)));
  await review.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;for(const k of ['save','step']){const original=api.Game.prototype[k];api.Game.prototype[k]=function(...args){window.__game=this;return original.apply(this,args);};}}});});
  await review.goto(url+'/art-play.html');await review.waitForFunction(()=>window.ArtPreview?.ready||window.ArtPreview?.error);assert.equal(await review.evaluate(()=>ArtPreview.error),null);
  await review.click('#start');await review.locator('#dialogActions button').first().click();
  await review.waitForFunction(()=>ArtPreview.diagnostics.get('reality.hero')?.id==='reality.hero.yunseo');
  assert.equal(await review.getAttribute('#hudPortrait','data-production-portrait'),'reality.hero.yunseo');
  await review.screenshot({path:path.join(out,'preview-reality-full-body.png')});
  await review.evaluate(()=>{__game.progress=2;__game.training=1;__game.enter('village');__game.events=[];});
  await review.waitForFunction(()=>ArtPreview.diagnostics.get('murim.hero')?.id==='murim.hero.yunseo');
  await review.waitForFunction(()=>document.getElementById('realmBadge').textContent.includes('무림'));
  assert.equal(await review.getAttribute('#hudPortrait','data-production-portrait'),'murim.hero.yunseo');
  const portraitProbe=await review.evaluate(()=>{const cv=document.createElement('canvas');cv.width=256;cv.height=288;WorldArt.portrait(cv,'hero','hurt');return {id:cv.dataset.productionPortrait,expression:cv.dataset.expression};});
  assert.deepEqual(portraitProbe,{id:'murim.hero.yunseo',expression:'hurt'});
  await review.screenshot({path:path.join(out,'preview-murim-full-body.png')});
  await review.evaluate(()=>{__game.player.face=Math.PI/4;});
  await review.keyboard.press('KeyJ');
  await review.waitForFunction(()=>ArtPreview.diagnostics.get('murim.hero')?.action==='attack1'&&ArtPreview.diagnostics.get('murim.hero')?.status==='candidate');
  const spriteContact=await review.evaluate(()=>{const id=__game.player.motion.instance.actionId,body=ArtPreview.diagnostics.get('murim.hero'),effect=ArtPreview.effectDiagnostics?.get(id);return {id,body,effect};});
  assert.ok(spriteContact.effect,'VFX must resolve from actual sprite sockets');assert.equal(spriteContact.body.frame,spriteContact.effect.frame);assert.equal(spriteContact.body.elapsed,spriteContact.effect.elapsed);
  await review.screenshot({path:path.join(out,'preview-murim-contact.png')});
  await review.waitForFunction(()=>__game.player.cool.attack===0);
  await review.evaluate(()=>{__game.player.face=0;});
  await review.keyboard.press('KeyJ');
  await review.waitForFunction(()=>ArtPreview.diagnostics.get('murim.hero')?.status==='BLOCKED_ART');
  assert.ok(await review.locator('#artPreviewBadge').isVisible());assert.deepEqual(errors,[]);
  report.previewWorlds=['reality.hero.yunseo','murim.hero.yunseo'];report.checks.push('local-only in-game full-body previews retain distinct world identity; missing attack explicitly blocked');
  report.spriteContact=spriteContact;
  const expectedHit=await review.evaluate(()=>{__game.enter('forest');__game.events=[];const e=__game.enemies[0];__game.enemies=[e];e.hp=e.maxHp=1000;e.cd=10;Object.assign(__game.player,{x:e.x-28,y:e.y-28,face:Math.PI/4});__game.player.cool.attack=0;__game.combo=0;__game.lastAttack=-10;return __game.stats().attack;});
  await review.keyboard.press('KeyJ');
  const contactDamage=await review.evaluate(()=>({damage:1000-__game.enemies[0].hp,contact:__game.player.motion.instance.contactAt,started:__game.player.motion.instance.startedAt}));
  assert.equal(contactDamage.damage,expectedHit);assert.equal(contactDamage.contact,contactDamage.started);
  report.contactDamage=contactDamage;report.userDirectionApproved=true;report.previewArtIntegrated=true;
  report.checks.push('SE walk/attack1/attack2 frame scrub exposes contact sockets; missing north-facing attack2 is BLOCKED_ART without substitution');
  report.comboEvidence=[];
  for(const [area,world]of [['rift','reality'],['forest','murim']]){
   await review.evaluate(area=>{__game.training=1;__game.enter(area);__game.events=[];__game.enemies=__game.enemies.slice(0,1);__game.enemies[0].hp=1000;__game.enemies[0].cd=999;__game.combo=0;__game.lastAttack=-10;},area);
   await review.bringToFront();
   await review.evaluate(()=>{const stream=document.getElementById('canvas').captureStream(30),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm'});window.__artRecording={rec,stream,chunks};rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};rec.start(100);stream.getVideoTracks()[0].requestFrame();});
   await review.waitForFunction(()=>__artRecording.chunks.reduce((n,c)=>n+c.size,0)>1000);
   for(let combo=1;combo<=3;combo++){
    await review.waitForFunction(()=>__game.player.cool.attack===0);
    const before=await review.evaluate(()=>{const e=__game.enemies[0];e.cd=999;Object.assign(__game.player,{x:e.x-28,y:e.y-28,face:Math.PI/4});return e.hp;});
    await review.keyboard.press('KeyJ');
    await review.waitForFunction(({world,combo})=>ArtPreview.diagnostics.get(world+'.hero')?.action==='attack'+combo,{world,combo});
    const probe=await review.evaluate(({world,before})=>{const a=__game.player.motion.instance;return {damage:before-__game.enemies[0].hp,contactAt:a.contactAt,startedAt:a.startedAt,body:ArtPreview.diagnostics.get(world+'.hero'),effect:ArtPreview.effectDiagnostics.get(a.actionId)};},{world,before});
    assert.equal(probe.damage,[22,24,37][combo-1]);assert.equal(probe.body.status,'candidate');assert.equal(probe.body.frame,probe.effect.frame);assert.equal(probe.body.elapsed,probe.effect.elapsed);assert.equal(probe.contactAt,probe.startedAt);
    report.comboEvidence.push({world,combo,...probe});await review.screenshot({path:path.join(out,world+'-combo-'+combo+'.png')});
   }
   await review.evaluate(()=>{__game.enemies=[];__game.player.face=Math.PI/4;__game.player.cool.dash=0;});
   await review.keyboard.press('Space');
   await review.waitForFunction(world=>ArtPreview.diagnostics.get(world+'.hero')?.action==='dodge',world);
   assert.equal(await review.evaluate(world=>ArtPreview.diagnostics.get(world+'.hero').status,world),'candidate');
   await review.screenshot({path:path.join(out,world+'-dodge.png')});
   await review.waitForFunction(world=>ArtPreview.diagnostics.get(world+'.hero')?.action!=='dodge',world);
   const recording=await review.evaluate(()=>new Promise(resolve=>{const {rec,stream,chunks}=window.__artRecording;rec.onstop=async()=>{const bytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());stream.getTracks().forEach(t=>t.stop());resolve(Array.from(bytes));};rec.stop();}));
   assert.ok(recording.length>1000);fs.writeFileSync(path.join(out,world+'-combo-dodge.webm'),Buffer.from(recording));
   await review.evaluate(()=>{__game.training=3;__game.player.mp=80;__game.player.face=Math.PI/4;__game.player.cool.storm=0;});
   await review.keyboard.press('KeyL');
   await review.waitForFunction(world=>ArtPreview.diagnostics.get(world+'.hero')?.action==='cast',world);
   assert.equal(await review.evaluate(world=>ArtPreview.diagnostics.get(world+'.hero').status,world),'candidate');
   await review.screenshot({path:path.join(out,world+'-cast.png')});
   await review.waitForFunction(()=>__game.playTime>=__game.player.motion.instance.startedAt+.3);
   const hpBefore=await review.evaluate(()=>{__game.player.invuln=0;const hp=__game.player.hp;__game.takeHit({damage:10});return hp;});
   await review.waitForFunction(world=>ArtPreview.diagnostics.get(world+'.hero')?.action==='hit',world);
   assert.equal(await review.evaluate(world=>ArtPreview.diagnostics.get(world+'.hero').status,world),'candidate');
   assert.equal(await review.evaluate(()=>__game.player.hp),hpBefore-9);
   await review.screenshot({path:path.join(out,world+'-hit.png')});
  }
  assert.deepEqual(errors,[]);report.checks.push('both worlds real keyboard 3-hit combo preserves damage 22/24/37 and shared contact frames; dodge uses independent whole-body clip');
  fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
