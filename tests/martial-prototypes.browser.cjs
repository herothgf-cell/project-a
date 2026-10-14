'use strict';
const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async page=>{
 await page.evaluate(()=>{const g=__game;g.enter('village');MartialTraining.introduce(g);MartialTraining.compose(g,'sword',['slash','breath','instant','front']);g.events=[];});
 await page.locator('.training-nav').click();
 await page.locator('[data-training-family="flash"]').click();
 assert.equal(await page.getByRole('button',{name:'백련에게 원형 배우기',exact:true}).isEnabled(),true);
 await page.getByRole('button',{name:'백련에게 원형 배우기',exact:true}).click();
 assert.equal(await page.evaluate(()=>MartialPrototypes.state(__game).learned.includes('flash')),false);
 const recipe=await page.evaluate(()=>MartialPrototypes.catalog.flash.recipe);
 await page.getByRole('button',{name:'미획득',exact:true}).click();
 assert.equal(await page.locator('[data-prototype-element][data-owned="true"]').count(),0);
 await page.getByRole('button',{name:'획득',exact:true}).click();
 for(const id of recipe)await page.locator('[data-prototype-element="'+id+'"]').click();
 await page.getByRole('button',{name:'구성 확인',exact:true}).click();
 await page.locator('.training-completion').waitFor();assert.match(await page.locator('.training-completion').innerText(),/섬광검/);
 assert.equal(await page.evaluate(()=>__game.martialRuntime?.practice||null),null);
 await page.getByRole('button',{name:'실습하기 (선택)',exact:true}).click();
 await page.keyboard.press('q');await page.waitForFunction(()=>MartialPrototypes.state(__game).proven.includes('flash'));
 assert.equal(await page.locator('#dialog').evaluate(e=>e.open),false);
 await page.getByRole('button',{name:'수련 종료',exact:true}).click();
 assert.match(await page.locator('.training-detail').innerText(),/원리 성취 완료/);
 for(const width of [390,360]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
 await page.getByRole('button',{name:'무공 창안',exact:true}).click();await page.locator('[data-training-link="sideFlash"]').click();
 assert.equal(await page.getByRole('button',{name:'무공 창안하기',exact:true}).isDisabled(),true);
 assert.match(await page.locator('.training-detail').innerText(),/측행보/);
 require('fs').mkdirSync('.skillform-review/extension',{recursive:true});await page.screenshot({path:'.skillform-review/extension/prototype-mobile.png'});
 console.log('prototype acquisition, owned element filter, instant learning, manual practice exit and creation requirements passed');
});
