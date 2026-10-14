'use strict';
const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async page=>{
 await page.evaluate(()=>{const g=__game;g.enter('village');const p=g.points().find(p=>p.id==='master');Object.assign(g.player,{x:p.x,y:p.y});g.events=[];});
 await page.waitForFunction(()=>ArtPreview.ensureWorld('murim'));await page.keyboard.press('g');await page.locator('.training-screen').waitFor();
 assert.equal(await page.locator('[data-element-card]').count(),20);
 assert.equal(await page.locator('[data-element-card][data-owned=true]').count(),4);
 assert.equal(await page.locator('[data-element-card][data-owned=false]:disabled').count(),16);
 for(const a of ['form','qi','flow','intent'])assert.match(await page.locator('[data-training-axis='+a+'] .training-selection').innerText(),/선택 안 함/);
 await page.getByRole('button',{name:'미획득',exact:true}).click();assert.equal(await page.locator('[data-element-card]').count(),16);
 await page.getByRole('button',{name:'획득',exact:true}).click();assert.equal(await page.locator('[data-element-card]').count(),4);
 for(const id of ['front','slash','instant','breath'])await page.locator('[data-element-card='+id+']').click();
 await page.getByRole('button',{name:'전체',exact:true}).click();assert.equal(await page.locator('[data-element-card][aria-pressed=true]').count(),4);
 // Persistence failure cannot announce success or advance the story.
 await page.evaluate(()=>{window.__set=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('storage full');};});
 await page.getByRole('button',{name:'구성 확인',exact:true}).click();assert.equal(await page.locator('.training-completion').count(),0);assert.doesNotMatch(await page.locator('.training-meta').innerText(),/습득 완료/);
 await page.evaluate(()=>Storage.prototype.setItem=window.__set);
 await page.getByRole('button',{name:'구성 확인',exact:true}).click();await page.locator('.training-completion').waitFor();
 assert.match(await page.locator('.training-completion').innerText(),/월영참/);assert.equal(await page.evaluate(()=>__game.training),1);assert.equal(await page.evaluate(()=>__game.martialRuntime?.practice||null),null);
 assert.equal(await page.evaluate(()=>MartialTraining.state(WorldGame.Game.load(__game.save())).learned.includes('sword')),true);
 await page.getByRole('button',{name:'무공 목록으로',exact:true}).click();await page.keyboard.press('Escape');await page.locator('.training-nav').click();
 assert.equal(await page.locator('.training-completion').count(),0);assert.match(await page.locator('.training-meta').innerText(),/습득 완료/);
 const g=require('./helpers/world-journey.cjs').five('ripple','inherited');g.enter('village');
 await page.keyboard.press('Escape');await page.evaluate(raw=>{Object.assign(__game,WorldGame.Game.load(raw));__game.events=[];},g.save());
 await page.locator('.training-nav').click();await page.getByRole('button',{name:'무공 창안',exact:true}).click();await page.getByRole('button',{name:'무공 창안하기',exact:true}).click();await page.locator('.training-completion').waitFor();assert.match(await page.locator('.training-completion').innerText(),/반류일선/);
 assert.equal(await page.evaluate(()=>MartialTraining.state(__game).linkProof.includes('ripple')),false);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.training-completion-glyph').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.waitForFunction(()=>document.querySelector('.training-completion').getAnimations({subtree:true}).every(a=>a.playState==='finished'));
 for(const width of [1280,390,360]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);require('fs').mkdirSync('.skillform-review/integration',{recursive:true});await page.screenshot({path:'.skillform-review/integration/completion-'+width+'.png'});}
 await page.getByRole('button',{name:'무공 목록으로',exact:true}).click();await page.getByRole('button',{name:'무공 습득',exact:true}).click();
 await page.getByRole('button',{name:'전체',exact:true}).click();await page.locator('[data-training-axis=flow]').scrollIntoViewIfNeeded();await page.screenshot({path:'.skillform-review/integration/elements-mobile.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'무공 창안',exact:true}).click();
 console.log('full element filters, manual selection, immediate saved learning, optional practice, creation celebration, mobile and storage rollback passed');
});
