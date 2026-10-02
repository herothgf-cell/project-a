const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async p=>{
 await p.evaluate(()=>{const g=__game;g.progress=5;g.training=2;g.enter('city');const point=g.points().find(x=>x.kind==='dungeon-entry');Object.assign(g.player,{x:point.x,y:point.y});g.events=[];});
 await p.click('#interact');await p.waitForSelector('.dungeon-screen');
 assert.equal(await p.locator('#dialog .app-navigation').count(),0);assert.equal(await p.locator('#portrait').isVisible(),false);
 assert.equal(await p.evaluate(()=>__game.points().filter(x=>x.kind==='dungeon-entry').length),1);
 assert.equal(await p.evaluate(()=>__game.points().filter(x=>x.kind==='portal').length),1);
 await p.locator('.dungeon-row').filter({hasText:'잊힌 지하역'}).dblclick();assert.equal(await p.evaluate(()=>__game.area),'city');
 await p.evaluate(()=>{window.realPrepare=ArtPreview.prepare;ArtPreview.prepare=()=>Promise.reject(Error('fixture asset failure'));});
 await p.locator('#dialogActions').getByRole('button',{name:'입장하기',exact:true}).click();await p.waitForSelector('.dungeon-error');assert.equal(await p.evaluate(()=>__game.area),'city');
 await p.evaluate(()=>{ArtPreview.prepare=window.realPrepare;});
 await p.locator('#dialogActions').getByRole('button',{name:'다시 입장하기',exact:true}).click();await p.waitForFunction(()=>__game.area==='rift');await p.waitForFunction(()=>!document.querySelector('#dialog').open);
 await p.locator('.main-navigation').getByRole('button',{name:'설정',exact:true}).click();assert.equal(await p.locator('#sound').count(),0);assert.equal(await p.getByRole('button',{name:'소리 설정',exact:true}).count(),0);assert.equal(await p.locator('.audio-settings').count(),0);assert.equal(await p.evaluate(()=>typeof CombatAudio),'undefined');
 await p.keyboard.press('Escape');await p.evaluate(()=>{const g=__game;g.enter('city');const point=g.points().find(x=>x.kind==='dungeon-entry');Object.assign(g.player,{x:point.x,y:point.y});g.events=[];});await p.setViewportSize({width:360,height:640});await p.click('#interact');
 await p.locator('.dungeon-row').filter({hasText:'잊힌 지하역'}).click();assert.ok(await p.getByRole('button',{name:'목록으로',exact:true}).isVisible());await p.screenshot({path:'.ssanggye-v11-review/dungeon-mobile.png'});
 assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2));
 await p.keyboard.press('Escape');await p.evaluate(()=>{const g=__game;g.enter('village');const point=g.points().find(x=>x.kind==='dungeon-entry');Object.assign(g.player,{x:point.x,y:point.y});g.events=[];});await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');await p.click('#interact');await p.waitForSelector('.dungeon-screen');assert.equal(await p.locator('#dialog .app-navigation').count(),0);assert.equal(await p.locator('#portrait').isVisible(),false);await p.keyboard.press('Escape');await p.locator('.main-navigation').getByRole('button',{name:'설정',exact:true}).click();assert.equal(await p.locator('#dialog .app-navigation').count(),0);
 console.log('real entry select/failure/retry, world boundary, disabled audio and mobile detail passed');
});
