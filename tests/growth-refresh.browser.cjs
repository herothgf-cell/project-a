const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),fs=require('fs');
run(async p=>{

 await p.evaluate(()=>{__game.training=2;__game.progress=7;__game.enter('village');__game.events=[];});
 await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');await p.click('#growthStatus');
 assert.equal(await p.locator('.tree-connections [data-from]').count(),4);
 assert.deepEqual(await p.locator('.tree-connections [data-from]').evaluateAll(es=>es.map(e=>e.dataset.from+'>'+e.dataset.to).sort()),['F0>F1','F0>F2','F1>F3','F2>F5']);
 const snapshot=()=>p.evaluate(()=>JSON.stringify({stats:__game.stats(),passive:__game.worldState.passive}));const before=await snapshot();
 await p.locator('[data-node=F2]').click();assert.equal(await snapshot(),before);
 await p.getByRole('button',{name:'집중심법',exact:false}).first().click();assert.equal(await p.locator('.tree-connections [data-from]').count(),4);
 for(const [w,h]of [[1280,900],[360,640],[390,844],[844,390],[640,450]]){await p.setViewportSize({width:w,height:h});if(w<=700&&await p.getByRole('button',{name:'목록으로',exact:true}).isVisible())await p.getByRole('button',{name:'목록으로',exact:true}).click();await p.locator('[data-node=C2]').scrollIntoViewIfNeeded();await p.screenshot({path:'.ssanggye-v12-review/refresh-tree-'+w+'.png'});assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2));await p.locator('[data-node=C2]').click();await p.screenshot({path:'.ssanggye-v12-review/refresh-detail-'+w+'.png'});assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2));if(w<=700)await p.getByRole('button',{name:'목록으로',exact:true}).click();}
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>document.documentElement.style.fontSize='200%');await p.locator('[data-node=C2]').click();assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2));await p.screenshot({path:'.ssanggye-v12-review/refresh-200.png'});await p.evaluate(()=>document.documentElement.style.fontSize='');
 await p.setViewportSize({width:1280,height:900});await p.keyboard.press('Escape');
 await p.evaluate(()=>{__game.revision.inherited=['ripple'];__game.journey.worlds=['murim','reality'];__game.journey.realm=1;Advancement.state(__game).realm=1;});await p.click('#growthStatus');await p.getByRole('button',{name:'경지 돌파',exact:true}).click();
 assert.equal(await p.locator('.growth-stat-row').count(),6);const allocation=()=>p.evaluate(()=>JSON.stringify(Advancement.state(__game).realmAllocation));const original=await allocation();
 await p.getByRole('button',{name:'공격 포인트 추가',exact:true}).click();assert.equal(await allocation(),original);await p.getByRole('button',{name:'배분 적용',exact:true}).click();assert.equal(await allocation(),original);await p.getByRole('button',{name:'배분 확정 · 적용',exact:true}).click();assert.notEqual(await allocation(),original);
 await p.screenshot({path:'.ssanggye-v12-review/refresh-realm.png'});
 await p.keyboard.press('Escape');await p.evaluate(()=>{__game.v12ChapterCompleted=()=>true;__game.enter('city');__game.events=[];Advancement.state(__game).hunter=1;});await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='reality');await p.click('#growthStatus');await p.getByRole('button',{name:'헌터 승급',exact:true}).click();assert.equal(await p.locator('.growth-rank').innerText(),'D급');assert.deepEqual(await p.locator('.growth-stat-table').first().locator('.growth-stat-row').evaluateAll(rows=>rows.map(r=>{const b=r.querySelectorAll('strong');return b[0].textContent===b[1].textContent;})),[true,true,true]);await p.screenshot({path:'.ssanggye-v12-review/refresh-hunter.png'});
 console.log('connected trees, responsive layout, real stats and allocation confirmation passed');
});
