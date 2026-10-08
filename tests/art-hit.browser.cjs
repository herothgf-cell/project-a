'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const world=process.env.ART_WORLD||'reality';assert.ok(['reality','murim'].includes(world));
 const facings=['e','se','s','sw','w','nw','n','ne'],errors=[],results=[];
 const out=path.resolve('.superpowers/art-production/evidence/hit-eight-'+world);fs.mkdirSync(out,{recursive:true});
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;return step.apply(this,args);};}});});
  const url='http://127.0.0.1:'+server.address().port;await p.goto(url+'/art-play.html?campaign=classic');await p.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await p.evaluate(()=>ArtPreview.error),null);
  await p.click('#start');await p.locator('#dialogActions button').first().click();await p.waitForFunction(()=>window.__game);
  for(const [direction,facing]of facings.entries()){
   await p.evaluate(({world,direction})=>{const g=__game;g.progress=8;g.training=3;g.enter(world==='reality'?'city':'village');g.events=[];Object.assign(g.player,{x:700,y:650,face:direction*Math.PI/4,mp:g.stats().mp,hp:g.stats().hp,invuln:0});g.player.cool.storm=0;g.hitStop=0;},{world,direction});
   const damage=await p.evaluate(()=>{const g=__game,before=g.player.hp;g.takeHit({damage:10,x:710,y:650});const reaction=g.player.motion.reaction,after=g.player.hp;g.takeHit({damage:10,x:710,y:650});if(g.player.hp!==after||g.player.motion.reaction!==reaction)throw Error('invulnerability changed hit reaction');return before-after;});assert.equal(damage,9);await p.waitForFunction(({world,facing})=>{const d=ArtPreview.diagnostics.get(world+'.hero');return d?.action==='hit'&&d.facing===facing&&d.status==='candidate';},{world,facing});
   const result=await p.evaluate(world=>{const g=__game;return{query:ArtPreview.diagnostics.get(world+'.hero'),action:g.player.motion.reaction.action,duration:g.player.motion.reaction.duration};},world);assert.equal(result.action,'hit');assert.equal(result.duration,.18);results.push(result);
   await p.screenshot({path:path.join(out,facing+'-game.png')});await p.waitForFunction(world=>ArtPreview.diagnostics.get(world+'.hero')?.action==='idle',world);
  }
  await p.goto(url+'/art-review.html');await p.waitForFunction(()=>document.body.dataset.ready==='true');await p.selectOption('#reviewAction','hit');
  for(const facing of facings)for(let frame=0;frame<4;frame++){
   await p.selectOption('#reviewFacing',facing);await p.locator('#reviewFrame').fill(String(frame));await p.locator('#reviewFrame').dispatchEvent('input');
   const canvas=p.locator('canvas[data-asset-id="'+world+'.hero.yunseo"][data-action="hit"]');assert.equal(await canvas.getAttribute('data-blocked'),'false');await p.waitForFunction(()=>[...document.querySelectorAll('canvas[data-action]')].every(c=>c.dataset.loading==='false'));await canvas.screenshot({path:path.join(out,facing+'-'+frame+'.png')});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,pageErrors:errors,approved:false},null,2));console.log(JSON.stringify({world,facings:8,frames:32,pageErrors:errors,approved:false}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
