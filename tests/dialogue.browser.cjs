const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async p=>{
 await p.evaluate(()=>{const g=__game;g.progress=1;g.enter('village');g.events=[];Object.assign(g.player,g.points().find(x=>x.id==='master'));});await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');await p.keyboard.press('KeyG');
 assert.equal(await p.locator('.dialog-speaker').innerText(),'백련');assert.doesNotMatch(await p.locator('.dialog-lines').innerText(),/윤서:|백련:/);
 const before=await p.evaluate(()=>({gold:__game.gold,training:__game.training}));await p.keyboard.down('KeyG');await p.keyboard.down('KeyG');assert.equal(await p.locator('.dialog-speaker').innerText(),'윤서');await p.keyboard.up('KeyG');
 await p.getByRole('button',{name:'대화 건너뛰기',exact:true}).click();assert.match(await p.locator('.quest-result').innerText(),/월영참/);assert.deepEqual(await p.evaluate(()=>({gold:__game.gold,training:__game.training})),before);
 await p.keyboard.press('Enter');assert.equal(await p.locator('#dialog').evaluate(x=>x.open),false);
 await p.click('#objective');for(const text of ['수행 목표','보고 대상','예정 보상'])assert.match(await p.locator('#dialog').innerText(),new RegExp(text));
 await p.keyboard.press('Escape');await p.click('#contractButton');assert.equal(await p.locator('.contract-section').count(),4);
});
