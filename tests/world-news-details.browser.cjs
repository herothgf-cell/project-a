const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),{five}=require('./helpers/world-journey.cjs');
run(async p=>{
 const g=five('ripple');g.enter('village');g.refreshNews();for(const item of g.worldState.news.items)item.read=false;
 await p.click('#menu');await p.getByRole('button',{name:'타이틀로',exact:true}).click();await p.evaluate(raw=>localStorage.setItem(SaveSlots.keys.current,raw),g.save());await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');
 const before=await p.evaluate(()=>JSON.stringify({selected:__game.journey.selected,realm:__game.journey.realm,equipped:__game.worldGrowth.murim.equipped}));
 await p.click('#personalNews');await p.locator('.news-item').filter({hasText:'새 무공 해석'}).first().click();
 assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='interpret:ripple-return').read),true);
 assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='inherit:ripple').read),false);
 await p.keyboard.press('Escape');await p.click('#personalNews');await p.locator('.news-item').filter({hasText:'새 무공 해석'}).first().click();
 assert.ok((await p.locator('.skills-detail').innerText()).includes(await p.evaluate(()=>JourneyData.variants['ripple-return'].name)));
 assert.equal(await p.evaluate(()=>JSON.stringify({selected:__game.journey.selected,realm:__game.journey.realm,equipped:__game.worldGrowth.murim.equipped})),before);
 await p.keyboard.press('Escape');await p.evaluate(()=>{__game.enter('city');__game.events=[];});await p.click('#personalNews');await p.locator('.news-item').filter({hasText:'새 무공 해석'}).first().click();
 assert.ok((await p.locator('.skills-detail').innerText()).includes(await p.evaluate(()=>JourneyData.variants['ripple-return'].name)));
 await p.keyboard.press('Escape');await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='interpret:ripple-return').read),true);
 console.log('news targets actual details, shares read state, persists and never auto-equips');
});
