'use strict';
const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async page=>{
 await page.evaluate(()=>{const g=__game;g.enter('village');const p=g.points().find(x=>x.id==='master');g.player.x=p.x;g.player.y=p.y+30;g.events=[];});
 await page.waitForFunction(()=>ArtPreview.ensureWorld('murim')===true);
 await page.locator('#interact').click();
 await page.locator('.training-screen').waitFor();
 assert.equal(await page.locator('#dialogTitle').innerText(),'무공 수련');
 assert.equal(await page.evaluate(()=>__game.training),0);
 assert.ok(await page.getByRole('button',{name:'무공 습득',exact:true}).isVisible());
 assert.ok(await page.getByRole('button',{name:'무공 창안',exact:true}).isVisible());
 for(const [axis,value]of [['form','slash'],['qi','breath'],['flow','instant'],['intent','front']])await page.locator('[data-training-axis="'+axis+'"]').selectOption(value);
 await page.getByRole('button',{name:'구성 확인',exact:true}).click();
 await page.getByRole('button',{name:'목인 수련 시작',exact:true}).click();
 assert.equal(await page.locator('#dialog').evaluate(e=>e.open),false);
 await page.keyboard.press('q');
 await page.waitForFunction(()=>__game.training===1);
 await page.locator('.training-screen').waitFor();
 assert.match(await page.locator('.training-meta').innerText(),/습득 완료/);
 await page.keyboard.press('Escape');
 for(const [family,recipe]of [['ripple',['guard','rebound','store','self']],['echo',['step','echo','burst','origin']],['seal',['field','bind','hold','point']]]){
  // Skip unrelated chapter travel, but investigate, compose and prove through actual UI/combat.
  await page.evaluate(f=>{const g=__game;g.progress=12;g.training=3;g.fate.stage=Math.max(2,g.fate.stage);g.enter('sanctum');g.events=[];const p=g.points().find(p=>p.path===f&&p.kind==='relic');Object.assign(g.player,{x:p.x,y:p.y});},family);
  await page.waitForFunction(()=>ArtPreview.ensureWorld('murim')===true);
  await page.locator('#interact').click();
  await page.locator('.training-screen').waitFor();
  assert.equal(await page.locator('.training-answer').filter({hasText:'미해독'}).count(),2);
  assert.match(await page.locator('.training-guidance').innerText(),/청운촌으로 돌아가 구성하기/);
  await page.getByRole('button',{name:'청운촌으로 돌아가 구성하기',exact:true}).click();
  assert.match(await page.locator('.training-guidance').innerText(),/추가 재료나 비용은 없습니다/);
  assert.equal(await page.locator('[data-training-axis=flow]').isDisabled(),true);
  await page.getByRole('button',{name:'단서 해독 · 지도 받기',exact:true}).click();
  assert.equal(await page.locator('.training-answer').filter({hasText:'미해독'}).count(),0);
  assert.equal(await page.locator('[data-training-axis=flow]').isEnabled(),true);
  for(const [i,axis]of ['form','qi','flow','intent'].entries())await page.locator('[data-training-axis="'+axis+'"]').selectOption(recipe[i]);
  await page.getByRole('button',{name:'구성 확인',exact:true}).click();
  await page.getByRole('button',{name:'기본 무공 실습',exact:true}).click();
  if(family==='echo')await page.evaluate(()=>{__game.player.face=-Math.PI/2;});
  await page.waitForFunction(()=>__game.enemies.some(e=>e.wind>.2&&e.wind<.8));
  await page.keyboard.press('e');
  await page.waitForFunction(f=>MartialTraining.state(__game).learned.includes(f),family);
  await page.locator('.training-screen').waitFor();
  await page.keyboard.press('Escape');
 }
 await page.evaluate(()=>{__game.enter('village');__game.events=[];});
 await page.locator('.training-nav').click();
 await page.getByRole('button',{name:'무공 창안',exact:true}).click();
 assert.equal(await page.locator('[data-training-link]').count(),3);
 for(const f of ['ripple','echo','seal']){
  await page.locator('[data-training-link="'+f+'"]').click();
  await page.getByRole('button',{name:'창안 초안 저장',exact:true}).click();
  assert.ok(await page.getByRole('button',{name:'무림 연계 실습',exact:true}).isEnabled());
  await page.getByRole('button',{name:'무림 연계 실습',exact:true}).click();
  if(f==='echo')await page.evaluate(()=>{__game.player.face=-Math.PI/2;});
  await page.waitForFunction(()=>__game.enemies.some(e=>e.wind>.2&&e.wind<.8));
  await page.keyboard.press('e');
  await page.waitForFunction(()=>!!__game.martialRuntime?.ready);
  await page.keyboard.press('q');
  await page.waitForFunction(f=>MartialTraining.state(__game).linkProof.includes(f),f);
  await page.evaluate(()=>{__game.enter('village');__game.events=[];});
  await page.locator('.training-nav').click();
  await page.getByRole('button',{name:'무공 창안',exact:true}).click();
 }
 for(const width of [1280,390,360]){
  await page.setViewportSize({width,height:900});
  await page.locator('#dialogBody').evaluate(e=>e.scrollTop=0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  require('node:fs').mkdirSync('.skillform-review/integration',{recursive:true});
  await page.screenshot({path:'.skillform-review/integration/training-'+width+'.png'});
 }
 assert.deepEqual(await page.evaluate(()=>MartialTraining.state(WorldGame.Game.load(__game.save())).learned),['sword','ripple','echo','seal']);
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:1280,height:900});
 for(const f of ['ripple','echo','seal']){
  await page.evaluate(()=>{__game.enter('city');__game.events=[];});
  await page.waitForFunction(()=>ArtPreview.ensureWorld('reality')===true);
  await page.locator('.training-nav').click();
  await page.getByRole('button',{name:'무공 창안',exact:true}).click();
  await page.locator('[data-training-link="'+f+'"]').click();
  await page.getByRole('button',{name:'현실에 적용',exact:true}).click();
  await page.getByRole('button',{name:'현실 연계 실습',exact:true}).click();
  if(f==='echo')await page.evaluate(()=>{__game.player.face=-Math.PI/2;});
  await page.waitForFunction(()=>__game.enemies.some(e=>e.wind>.2&&e.wind<.8));
  await page.keyboard.press('e');
  await page.waitForFunction(()=>!!__game.martialRuntime?.ready);
  await page.keyboard.press('q');
  await page.waitForFunction(()=>!__game.martialRuntime?.practice);
  assert.equal(await page.evaluate(()=>__game.martialRuntime?.ready),null);
 }
 await page.evaluate(()=>{__game.enter('village');__game.events=[];});
 await page.locator('.training-nav').click();
 await page.evaluate(()=>{window.__originalStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError');};});
 await page.getByRole('button',{name:'수련 지원 끄기',exact:true}).click();
 assert.match(await page.getByRole('alert').innerText(),/저장하지 못했습니다/);
 assert.ok(await page.getByRole('button',{name:'수련 지원 끄기',exact:true}).isVisible(),'failed storage restores previous support setting');
 await page.evaluate(()=>{Storage.prototype.setItem=window.__originalStorageSet;});
 console.log('actual game: four acquired arts, three creations proved in both worlds, persistence and mobile UI passed');
});
