const assert=require('node:assert/strict'),fs=require('node:fs'),{run}=require('./browser-harness.cjs');
fs.mkdirSync('browser-results',{recursive:true});
run(async p=>{
 await p.evaluate(()=>{const g=__game;g.enter('village');const o=g.points().find(p=>p.id==='master');Object.assign(g.player,o);g.interact();g.events=[];document.querySelector('#dialog').close();});
 assert.equal(await p.evaluate(()=>__game.points().some(p=>p.id==='huashan')),true);
 await p.evaluate(()=>{const g=__game,o=g.points().find(p=>p.id==='huashan');Object.assign(g.player,{x:o.x,y:o.y});g.interact();g.events=[];g.save();});
 await p.click('#growthStatus');await p.waitForSelector('.skills-screen');await p.locator('[data-basic="moon"]').click();assert.match(await p.locator('.skills-detail').innerText(),/매화노방/);assert.match(await p.locator('.skills-detail').innerText(),/입문/);assert.ok((await p.locator('[data-basic="moon"]').innerText()).startsWith(await p.evaluate(()=>Controls.key('moon'))),'current binding must be formatted once');assert.match(await p.locator('.skills-screen').innerText(),/초기화할 수 없습니다/);assert.equal(await p.getByRole('button',{name:'스킬 초기화',exact:true}).count(),0);
 await p.screenshot({path:'browser-results/plan-b-huashan-desktop.png'});
 await p.getByRole('button',{name:'현실 보기',exact:true}).click();await p.locator('[data-basic="attack"]').click();assert.match(await p.locator('.skills-detail').innerText(),/현장 검격/);assert.match(await p.locator('.skills-detail').innerText(),/1성 \/ 9성/);
 await p.setViewportSize({width:360,height:740});assert.ok(await p.locator('.skills-screen').evaluate(e=>e.scrollWidth<=innerWidth));await p.screenshot({path:'browser-results/plan-b-reality-mobile.png'});
 console.log('Plan B browser: teacher, independent attainment, permanent investment, desktop/mobile passed');
});
