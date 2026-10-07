const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async p=>{
 assert.equal(await p.locator('#sense').isVisible(),false);assert.equal(await p.locator('#fieldNotes').isVisible(),false);
 await p.click('#menu');assert.equal(await p.getByRole('button',{name:'지역 지도',exact:true}).count(),0);await p.keyboard.press('Escape');
 await p.locator('#growthStatus').click();assert.match(await p.locator('.skills-wallet').innerText(),/보유 0/);await p.getByRole('button',{name:'심법 (패시브)',exact:true}).click();assert.match(await p.locator('.skills-detail').innerText(),/백련의 첫 운기/);await p.keyboard.press('Escape');
 await p.evaluate(()=>{__game.progress=2;__game.training=1;const state=CycleOne.state(__game);state.returnReceipt=state.recordDelivered=state.invited=true;__game.enter('village');__game.events=[];});await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');assert.equal(await p.locator('#sense').isVisible(),false);
 assert.equal(await p.locator('.actions .combat-icon').count(),4);
 assert.equal(await p.locator('#recordsMenu').count(),0);await p.keyboard.press('Tab');assert.equal(await p.locator('.notebook').count(),0);
 console.log('Observation entries stay hidden after story unlock; combat SVG icons remain');
});
