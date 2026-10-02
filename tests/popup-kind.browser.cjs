const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async p=>{
 await p.click('#menu');assert.equal(await p.locator('#portrait').isVisible(),false,'settings has no portrait slot');
 await p.getByRole('button',{name:'타이틀로',exact:true}).click();await p.click('#start');
 assert.match(await p.locator('#dialogTitle').innerText(),/새로운 여정/);assert.equal(await p.locator('#portrait').isVisible(),false,'save confirmation has no portrait slot');
 assert.equal(await p.locator('#dialog').getAttribute('data-popup-kind'),'general');await p.getByRole('button',{name:'취소',exact:true}).click();await p.click('#continue');
 await p.evaluate(()=>{const g=__game;g.enter('village');const npc=g.points().find(x=>x.id==='master');Object.assign(g.player,{x:npc.x,y:npc.y});g.events=[];});await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');await p.click('#interact');
 assert.equal(await p.locator('#dialog').getAttribute('data-popup-kind'),'dialogue');assert.equal(await p.locator('#portrait').isVisible(),true,'NPC speech retains portrait');
 await p.keyboard.press('Escape');await p.click('#menu');assert.equal(await p.locator('#portrait').isVisible(),false,'general popup after speech clears portrait slot');
 console.log('General/settings/save confirmation omit portrait; NPC dialogue retains it; switching resets classification');
});
