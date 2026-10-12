const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),{five}=require('./helpers/world-journey.cjs');
run(async p=>{
 const g=five('seal');g.enter('village');g.refreshNews();for(const n of g.worldState.news.items)n.read=false;
 await p.click('#menu');await p.getByRole('button',{name:'타이틀로',exact:true}).click();await p.evaluate(raw=>localStorage.setItem(SaveSlots.keys.current,raw),g.save());await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');
 await p.click('#character');assert.equal(await p.locator('.profile-world[data-world=reality].has-news').count(),1);
 assert.match(await p.locator('.profile-equipped').innerText(),/장착 무공.*경계봉인/);
 await p.getByRole('button',{name:'무공',exact:true}).click();await p.waitForSelector('.martial-tree');await p.keyboard.press('Escape');
 await p.click('#personalNews');await p.locator('.news-item').filter({hasText:'경계봉인 계승'}).click();assert.notEqual(await p.locator('#dialogTitle').innerText(),'소식 · 상세');
 await p.keyboard.press('Escape');await p.click('#character');await p.getByRole('button',{name:/현실 캐릭터/}).click();assert.ok(await p.locator('.profile-news').count());assert.equal(await p.locator('#character.has-news').count(),0);await p.keyboard.press('Escape');
 await p.click('#personalNews');const status=p.locator('.news-item').filter({hasText:'활동 기록'}).first();const title=await status.locator('.news-title').innerText();await status.click();assert.ok((await p.locator('.profile-news').innerText()).includes(title),'clicked status explanation stays visible after read');await p.keyboard.press('Escape');
 for(const [width,height]of [[1903,896],[1280,900],[390,844],[844,390]]){await p.setViewportSize({width,height});await p.click('#growthStatus');await p.waitForSelector('.resonance-screen');await p.keyboard.press('Escape');}
 console.log('Growth clicks, character notification trail, martial tree entry and direct news navigation passed');
});
