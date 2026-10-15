const {chromium}=require('playwright'),{createServer}=require('../server.cjs'),assert=require('node:assert/strict');
(async()=>{
 require('node:fs').mkdirSync('.skillform-review/npc-flow',{recursive:true});
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});const p=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.setDefaultTimeout(12000);
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'ExclusiveGame',{configurable:true,get:()=>api,set(v){api=v;for(const key of ['save','step']){const old=v.Game.prototype[key];v.Game.prototype[key]=function(...args){window.__game=this;return old.apply(this,args);};}}});});
  await p.goto('http://127.0.0.1:'+server.address().port+'/art-play.html');await p.waitForFunction(()=>globalThis.ArtPreview?.ready);await p.click('#start');
  assert.equal(await p.locator('#dialog').evaluate(d=>d.open),false);
  await p.click('#exclusiveStory');assert.match(await p.locator('#dialogBody').innerText(),/의뢰인 만나기/);assert.equal(await p.getByRole('button',{name:'이야기 진행',exact:true}).count(),0);await p.click('#closeDialog');
  // Approach Minjae using real keyboard movement from the initial spawn.
  await p.keyboard.down('ArrowRight');await p.waitForFunction(()=>__game.player.x>315);await p.keyboard.up('ArrowRight');await p.keyboard.press('g');
  await p.locator('.exclusive-conversation').waitFor();assert.match(await p.locator('#dialogBody').innerText(),/민재/);assert.ok(await p.locator('.exclusive-line').count()>=2);
  await p.screenshot({path:'.skillform-review/npc-flow/dialogue-desktop.png'});
  await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:'.skillform-review/npc-flow/dialogue-mobile.png'});
  await p.getByRole('button',{name:'맡겠습니다',exact:true}).click();assert.equal(await p.evaluate(()=>__game.enemies.length),3);
  // Resolve combat as a fixture; verify manual reporting instead of forced advance.
  await p.evaluate(()=>{for(const enemy of __game.enemies)__game.strike(enemy,9999);});await p.waitForFunction(()=>ExclusiveField.state(__game).ready.includes('recovery-work'));
  assert.equal(await p.locator('#dialog').evaluate(d=>d.open),false);assert.equal(await p.evaluate(()=>__game.storyObjective().id),'recovery-work');
  await p.keyboard.press('g');await p.getByRole('button',{name:'결과를 전한다',exact:true}).click();assert.equal(await p.evaluate(()=>__game.storyObjective().id),'stone-accident');
  await p.reload();await p.waitForFunction(()=>globalThis.ArtPreview?.ready);await p.click('#continue');assert.equal(await p.evaluate(()=>__game.storyObjective().id),'stone-accident');
  assert.deepEqual(errors,[]);console.log('NPC approach, offer, field completion, manual report, reload and responsive dialogue passed');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
