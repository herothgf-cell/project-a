const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),{five}=require('./helpers/world-journey.cjs'),{historicalInterpretation}=require('./world-fixtures.cjs');
run(async p=>{
 const g=five('ripple');historicalInterpretation(g,'ripple-return');g.enter('village');g.chooseInterpretation('ripple-return');g.publishNews({id:'interpret:ripple-return'});g.refreshNews();for(const item of g.worldState.news.items)item.read=false;
 await p.click('#menu');await p.getByRole('button',{name:'타이틀로',exact:true}).click();await p.evaluate(raw=>localStorage.setItem(SaveSlots.keys.current,raw),g.save());await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');
 const snapshot=()=>p.evaluate(()=>JSON.stringify({selected:__game.journey.selected,realm:__game.journey.realm,equipped:__game.worldGrowth.murim.equipped})),before=await snapshot();
 await p.click('#personalNews');assert.equal(await p.locator('.news-item').filter({hasText:'새 무공 해석'}).count(),0);
 await p.locator('.news-item').filter({hasText:'파문검 계승'}).first().click();assert.match(await p.locator('.skills-detail').innerText(),/파문|Lv\./);
 assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='inherit:ripple').read),true);
 assert.equal(await snapshot(),before,'opening skill news never auto-equips or changes stats');
 await p.keyboard.press('Escape');await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');
 assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='inherit:ripple').read),true);
 assert.equal(await p.evaluate(()=>__game.newsList().some(x=>x.id.startsWith('interpret:'))),false);
 assert.equal(await snapshot(),before,'old equipped effects survive reload without removed menus');
 console.log('Skill news routes to details; retired interpretation notices stay hidden and old effects survive');
}).catch(e=>{console.error(e);process.exitCode=1;});
