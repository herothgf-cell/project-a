'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
require('../chapter-five.js');
const {g0,experiment}=require('./helpers/journey.cjs');
const {createServer}=require('../server.cjs');
const fixtures=[];
function combatFixture(family){const g=g0(family);g.progress=12;g.training=3;g.fate.stage=3;return g;}
for(const [action,combo]of [['attack',1],['attack',2],['attack',3],['moon',0],['storm',0],['dash',0]]){const g=combatFixture('ripple');fixtures.push({name:'common-'+action+(combo||''),save:g.save(),family:'ripple',action,combo});}
for(const family of ['ripple','echo','seal'])for(const action of ['signature1','signature2','ultimate']){const g=combatFixture(family);fixtures.push({name:family+'-'+action,save:g.save(),family,action});}
for(const [family,mode]of [['ripple','return'],['ripple','guard'],['echo','return'],['echo','replay'],['seal','hold'],['seal','guide']]){const g=combatFixture(family);experiment(g,family,mode);assert.ok(g.chooseInterpretation(family+'-'+mode));fixtures.push({name:family+'-'+mode,save:g.save(),family,action:['guard','hold'].includes(mode)?'signature1':'signature2',interpret:true,mode});}
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const reduced=process.env.REDUCED_MOTION==='1';
 const out=path.resolve('.superpowers/art-production/evidence/skill-matrix'+(reduced?'-reduced':''));fs.mkdirSync(out,{recursive:true});
 const errors=[],report=[];
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:reduced?'reduce':'no-preference'});page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;return step.apply(this,args);};}});});
  await page.goto('http://127.0.0.1:'+server.address().port+'/art-play.html?campaign=classic');await page.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await page.evaluate(()=>ArtPreview.error),null);
  await page.click('#start');await page.locator('#dialogActions button').first().click();await page.waitForFunction(()=>window.__game);
  await page.evaluate(()=>{const draw=RealmArt.effect;window.__drawn=[];RealmArt.effect=function(c,f,...args){const result=draw(c,f,...args);window.__drawn.push({kind:f.kind,phase:f.presentationPhase||null,quality:args[0],drawn:result===true});return result;};});
  for(const fixture of fixtures){
   const actual=await page.evaluate(f=>{
    const g=__game;Object.assign(g,DualWorld.Game.load(f.save));g.enter('forest');g.events=[];
    Object.assign(g.player,{x:850,y:700,face:Math.PI/4,mp:g.stats().mp,invuln:0});g.fate.focus=100;g.enemies=g.enemies.filter(e=>!e.boss).slice(0,1);
    const enemy=g.enemies[0];Object.assign(enemy,{x:885,y:735,hp:5000,maxHp:5000,cd:999,wind:0});
    if(f.family==='echo'&&f.action==='signature2'){if(!g.act('signature1'))throw Error('echo setup failed');g.player.dash=0;g.player.cool.signature2=0;}
    if(f.interpret&&['hold','guide'].includes(f.mode))enemy.wind=.7;
    if(f.combo){g.combo=f.combo-1;g.lastAttack=g.playTime;}
    g.fx=[];window.__drawn=[];const before=enemy.hp,ok=g.act(f.action);if(!ok)throw Error('actual action rejected: '+f.name);
    const prepare=g.fx.map(e=>({kind:e.kind,phase:e.presentationPhase||null}));
    if(f.mode==='replay'){for(let i=0;i<10;i++){g.hitStop=0;g.step(.05);} }
    if(f.mode==='return'&&f.family==='ripple'){g.player.cool.attack=0;g.act('attack');}
    g.events=[];g.hitStop=.3;
    return {ok,damage:before-enemy.hp,prepare,effects:g.fx.map(e=>({kind:e.kind,phase:e.presentationPhase||null}))};
   },fixture);
   if(fixture.interpret)assert.ok(actual.effects.some(e=>e.kind==='interpret-'+fixture.name),fixture.name);
   if(fixture.mode==='replay'){assert.ok(actual.prepare.some(e=>e.phase==='prepare'));assert.ok(actual.effects.some(e=>e.phase==='contact'));}
   await page.waitForTimeout(170);await page.screenshot({path:path.join(out,fixture.name+'.png')});
   const drawn=await page.evaluate(()=>window.__drawn.filter(e=>e.drawn));assert.ok(drawn.length,fixture.name+' must render candidate VFX');if(reduced)assert.ok(drawn.every(e=>e.quality===0));report.push({name:fixture.name,...actual,drawn});
   if(fixture.family==='seal'&&['signature1','ultimate'].includes(fixture.action)||fixture.name==='ripple-guard'){
    await page.evaluate(()=>{const g=__game;for(let i=0;i<40;i++){g.hitStop=0;g.step(.05);}g.hitStop=.3;});
    await page.waitForTimeout(100);
    const field=await page.evaluate(()=>({live:__game.combat.field||__game.experimentRuntime.guard,burst:__game.fx.some(f=>['fate-seal','fate-ultimate','interpret-ripple-guard'].includes(f.kind)),drawn:ArtPreview.effectDiagnostics.get('persistent-field')}));
    assert.ok(field.live?.life>0);assert.equal(field.burst,false);assert.equal(field.drawn?.status,'candidate',fixture.name+' persistent field must retain artwork after burst expires');
    await page.screenshot({path:path.join(out,fixture.name+'-sustain.png')});
    await page.evaluate(()=>{const g=__game;for(let i=0;i<140;i++){g.hitStop=0;g.step(.05);}g.hitStop=.3;});await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>__game.combat.field),null);
    assert.equal(await page.evaluate(()=>ArtPreview.effectDiagnostics.has('persistent-field')),false);
   }
  }
  assert.deepEqual(errors,[]);
  if(reduced){const baseline=JSON.parse(fs.readFileSync(path.resolve('.superpowers/art-production/evidence/skill-matrix/report.json'),'utf8'));assert.deepEqual(report.map(c=>[c.name,c.damage]),baseline.report.map(c=>[c.name,c.damage]),'reduced motion must not change actual damage');}
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({report,pageErrors:errors,technicalCaptureOnly:true,reduced},null,2));console.log(JSON.stringify({cases:report.length,pageErrors:errors,technicalCaptureOnly:true,reduced}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
