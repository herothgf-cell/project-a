'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const kind=['shade','sentinel','chief','masked','guardian','drone','tide'].includes(process.env.ART_ENEMY)?process.env.ART_ENEMY:'bandit',world=['shade','sentinel','drone','tide'].includes(kind)?'reality':'murim',area=['drone','tide'].includes(kind)?'harbor':['masked','guardian'].includes(kind)?'ruins':world==='reality'?'rift':'forest',identity=world+'.enemy.'+kind;
 const facing=['se','nw'].includes(process.env.ART_FACING)?process.env.ART_FACING:['bandit','shade'].includes(kind)?'nw':'se',sign=facing==='se'?1:-1;
 const actions=['move','idle','telegraph','attack','hit','death'];
 const errors=[],out=path.resolve('.superpowers/art-production/evidence/enemy-'+kind+'-'+facing);fs.mkdirSync(out,{recursive:true});
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;if(!window.__pause)return step.apply(this,args);};window.__simulationStep=step;}});});
  await p.goto('http://127.0.0.1:'+server.address().port+'/art-play.html');await p.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await p.evaluate(()=>ArtPreview.error),null);
  await p.click('#start');await p.locator('#dialogActions button').first().click();await p.waitForFunction(()=>window.__game);
  await p.evaluate(({area,kind,sign})=>{window.__pause=true;window.__advance=dt=>{__pause=false;__game.step(dt);__pause=true;};const g=__game;g.progress=5;g.training=1;g.enter(area);g.events=[];g.enemies=g.enemies.filter(e=>e.kind===kind).slice(0,1);const e=g.enemies[0];Object.assign(e,{x:850,y:700,cd:99,wind:0});Object.assign(g.player,{x:850+100*sign,y:700+100*sign,invuln:99});__advance(.05);},{area,kind,sign});
  // Bosses correctly refuse to act until the existing area seals are cleared.
  await p.evaluate(()=>{__game.activated=__game.seals().map(o=>o.id);__advance(.05);});
  const results=[];
  for(const action of actions){
   await p.evaluate(({action,sign})=>{const g=__game,e=g.enemies[0];
    if(action==='idle'){e.cd=99;g.player.x=e.x+20*sign;g.player.y=e.y+20*sign;__advance(.05);}
    if(action==='telegraph'){e.cd=0;__advance(.05);}
    if(action==='attack'){e.wind=.02;__advance(.05);}
    if(action==='hit'){g.playTime+=.5;e.walking=false;g.strike(e,1);}
    if(action==='death'){g.strike(e,999999);g.playTime+=.5;}
   },{action,sign});
   try{await p.waitForFunction(({action,identity,facing})=>[...ArtPreview.diagnostics.values()].some(d=>d.id===identity&&d.action===action&&d.facing===facing&&d.status==='candidate'),{action,identity,facing});}catch(error){console.error(action,await p.evaluate(()=>({enemy:__game.enemies[0],diagnostics:[...ArtPreview.diagnostics.entries()],error:ArtPreview.error})));throw error;}
   results.push(await p.evaluate(identity=>[...ArtPreview.diagnostics.values()].find(d=>d.id===identity),identity));
   if(action==='death'){
    await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    if(await p.locator('#dialog').isVisible())await p.locator('#dialogActions button').last().click();
   }
   await p.screenshot({path:path.join(out,action+'.png')});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({actions:results,pageErrors:errors,approved:false}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
