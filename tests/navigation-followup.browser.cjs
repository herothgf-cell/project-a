const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),{five}=require('./helpers/world-journey.cjs');
run(async p=>{
 const g=five('seal');g.enter('village');g.refreshNews();for(const n of g.worldState.news.items)n.read=false;
 await p.click('#menu');await p.getByRole('button',{name:'타이틀로',exact:true}).click();await p.evaluate(raw=>localStorage.setItem(SaveSlots.keys.current,raw),g.save());await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');
 await p.click('#characterMenu');assert.match(await p.locator('.profile-equipped').innerText(),/장착 무공.*경계봉인/);
 await p.locator('[data-purpose=skills]').click();await p.waitForSelector('.skills-screen');await p.getByRole('button',{name:'봉인',exact:true}).click();assert.equal(await p.locator('[data-skill]').count(),3);await p.keyboard.press('Escape');
 await p.click('#personalNews');await p.locator('.news-item').filter({hasText:'경계봉인 계승'}).click();assert.equal(await p.locator('#dialogTitle').innerText(),'무공/스킬');await p.keyboard.press('Escape');
 await p.click('#characterMenu');await p.getByRole('button',{name:'현실 캐릭터',exact:true}).click();assert.equal(await p.locator('.character-new').count(),1);await p.getByRole('button',{name:'획득 내역',exact:true}).click();assert.ok(await p.locator('.character-receipts').count());assert.equal(await p.locator('.character-new').count(),0);await p.keyboard.press('Escape');
 await p.click('#personalNews');const status=p.locator('.news-item').filter({hasText:'활동 기록'}).first();const title=await status.locator('.news-title').innerText();await status.click();assert.ok((await p.locator('#dialog').innerText()).includes(title),'record detail stays visible after read');await p.keyboard.press('Escape');
 for(const [width,height]of [[1903,896],[1280,900],[390,844],[844,390]]){await p.setViewportSize({width,height});await p.click('#growthStatus');await p.waitForSelector('.skills-screen');await p.keyboard.press('Escape');}
 console.log('Direct purposes, persistent item history and news navigation passed');
});
