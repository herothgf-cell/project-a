const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async p=>{
 await p.evaluate(()=>{const g=__game;g.training=2;g.enter('village');g.player.mp=0;g.events=[];});
 await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');
 for(const [width,height] of [[1280,900],[360,640]]){
  await p.setViewportSize({width,height});
  await p.evaluate(()=>{__game.player.mp=0;});
  for(let i=0;i<6;i++)await p.locator('[data-action="moon"]').click();
  assert.equal(await p.locator('.resource-warning').innerText(),'내력 부족');
  assert.equal(await p.locator('#toasts .toast').filter({hasText:'내력이 부족'}).count(),0);
  const bounds=await p.locator('.resource-warning').evaluate(e=>{const a=e.getBoundingClientRect(),b=e.closest('.hud').getBoundingClientRect();return a.top>=b.top&&a.bottom<=b.bottom&&a.left>=b.left&&a.right<=b.right});assert.ok(bounds);
  await p.waitForTimeout(1750);assert.equal(await p.locator('.resource-warning').count(),0);
 }
 await p.evaluate(()=>{__game.player.mp=0;});await p.locator('[data-action="moon"]').click();
 await p.evaluate(()=>{__game.player.mp=80;});await p.waitForFunction(()=>!document.querySelector('.resource-warning'));
 console.log('Repeated low resource inputs stay inside HUD; warning expires and clears on recovery');
});
