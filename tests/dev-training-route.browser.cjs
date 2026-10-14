'use strict';
const acquisition=require('./helpers/martial-acquisition-browser.cjs');
const {chromium}=require('playwright'),{createServer}=require('../server.cjs'),assert=require('node:assert/strict');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,channel:process.env.CHROMIUM_PATH?undefined:'chrome',executablePath:process.env.CHROMIUM_PATH});
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.setDefaultTimeout(12000);
  await page.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get:()=>api,set(v){api=v;for(const k of ['step','save']){const old=v.Game.prototype[k];v.Game.prototype[k]=function(...args){window.__game=this;return old.apply(this,args);};}}});});
  const base='http://127.0.0.1:'+server.address().port;
  await page.goto(base+'/art-play.html?dev=1');await page.waitForFunction(()=>globalThis.ArtPreview?.ready);
  await page.evaluate(()=>{localStorage.setItem(SaveSlots.keys.current,'public-sentinel');localStorage.setItem(SaveSlots.keys.test,'dev-sentinel');});
  await page.getByRole('button',{name:'무공 순차 테스트',exact:true}).click();
  await page.waitForURL('**/art-play.html?dev=1&training=1');await page.waitForFunction(()=>globalThis.ArtPreview?.ready);
  await page.locator('#continue').click();await page.locator('.training-screen').waitFor();
  const recipes={sword:['slash','breath','instant','front'],thunder:['cleave','thunder','explode','surround'],ripple:['guard','rebound','store','self'],echo:['step','echo','burst','origin'],seal:['field','bind','hold','point']};
  const compose=async recipe=>{for(const [i,axis]of ['form','qi','flow','intent'].entries())await page.locator('[data-element-card="'+recipe[i]+'"]').click();await page.getByRole('button',{name:'구성 확인',exact:true}).click();await page.locator('.training-completion').waitFor();await page.getByRole('button',{name:'무공 목록으로',exact:true}).click();};
  const move=async()=>{await page.locator('.training-dev-route button').click();await page.waitForFunction(()=>ArtPreview.ensureWorld(WorldGrowth.worldOf(__game))===true);};
  const respond=async f=>{if(f==='echo')await page.evaluate(()=>{__game.player.face=-Math.PI/2;});await page.waitForFunction(()=>__game.enemies.some(e=>e.wind>.2&&e.wind<.8));await page.keyboard.press('e');};
  for(const [f,recipe]of Object.entries(recipes)){
   await move();
   if(['ripple','echo','seal'].includes(f)){
    await page.keyboard.press('g');await page.locator('.training-screen').waitFor();
    await page.getByRole('button',{name:'청운촌으로 돌아가 구성하기',exact:true}).click();
    assert.match(await page.locator('.training-ownership').innerText(),/2\/4/);
    await page.getByRole('button',{name:'단서 해독 · 지도 받기',exact:true}).click();
    assert.match(await page.locator('.training-ownership').innerText(),/2\/4/);
    assert.equal(await page.locator('[data-element-card="'+recipe[2]+'"]').isDisabled(),true);
    await move();await acquisition.flow(page,f);
    await move();await acquisition.quest(page,f);
    await move();assert.match(await page.locator('.training-ownership').innerText(),/4\/4/);
    for(const width of [390,360]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
    await page.setViewportSize({width:1280,height:900});
   }
   if(f==='thunder')assert.match(await page.locator('[data-action="storm"]').getAttribute('aria-label'),/미습득/);
   await compose(recipe);
   assert.equal(await page.evaluate(f=>MartialTraining.state(__game).learned.includes(f),f),true);
   assert.equal(await page.evaluate(()=>__game.martialRuntime?.practice||null),null);
  }
  for(const kind of ['create','reality'])for(const f of ['ripple','echo','seal']){
   assert.equal(await page.evaluate(()=>DevTrainingRoute.next(__game,MartialTraining,DevTrainingRoute.completed()).family),f);
   await move();
   await page.getByRole('button',{name:kind==='create'?'무공 창안하기':'현실에 적용',exact:true}).click();
   if(kind==='create'){await page.locator('.training-completion').waitFor();await page.getByRole('button',{name:'무공 목록으로',exact:true}).click();}
   await page.getByRole('button',{name:kind==='create'?'무림 연계 실습':'현실 연계 실습',exact:true}).click();
   await respond(f);await page.waitForFunction(()=>!!__game.martialRuntime?.ready);await page.keyboard.press('q');
   await page.waitForFunction(({kind,f})=>kind==='create'?MartialTraining.state(__game).linkProof.includes(f):DevTrainingRoute.completed().includes(f),{kind,f});
   assert.equal(await page.locator('#dialog').evaluate(e=>e.open),false);await page.getByRole('button',{name:'수련 종료',exact:true}).click();await page.locator('.training-screen').waitFor();
  }
  assert.match(await page.locator('.training-dev-route').innerText(),/20 \/ 20 완료/);
  for(const width of [390,360]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  await page.reload();await page.waitForFunction(()=>globalThis.ArtPreview?.ready);await page.locator('#continue').click();
  assert.match(await page.locator('.training-dev-route').innerText(),/20 \/ 20 완료/);
  assert.deepEqual(await page.evaluate(()=>[localStorage.getItem(SaveSlots.keys.current),localStorage.getItem(SaveSlots.keys.test)]),['public-sentinel','dev-sentinel']);
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'무공 순차 테스트',exact:true}).click();
  await page.waitForFunction(()=>globalThis.ArtPreview?.ready);await page.locator('#continue').click();
  assert.match(await page.locator('.training-dev-route').innerText(),/1 \/ 20 · 월영참/);
  assert.deepEqual(await page.evaluate(()=>DevTrainingRoute.completed()),[]);assert.deepEqual(errors,[]);
  console.log('dev route: all 20 stages via actual UI/combat, reload, reset, isolated saves and mobile layout passed');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
