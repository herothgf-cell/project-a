const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
run(async p=>{
 await p.evaluate(()=>{const g=__game;g.progress=12;g.training=3;g.fate.stage=2;g.fate.discovered=['echo'];g.fate.proven=['echo'];g.enter('village');g.acceptFate('echo');g.events=[];g.refreshNews();});
 await p.locator('#characterMenu').click();await p.keyboard.press('Escape');await p.click('#growthStatus');const skills=p.locator('#growthStatus');
 assert.equal(await skills.evaluate(e=>e.classList.contains('has-news')),true);assert.match(await skills.getAttribute('aria-label'),/NEW/);
 assert.equal(await p.getByRole('button',{name:'공통 기본기',exact:true}).getAttribute('aria-pressed'),'true');
 assert.ok(await p.locator('.skills-categories').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('#dialogBody').getBoundingClientRect().top));
 await p.getByRole('button',{name:'잔영',exact:true}).click();await p.locator('[data-skill=signature1]').click();assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='inherit:echo').read),true);
 for(const [width,height]of [[1280,900],[360,640],[844,390]]){await p.setViewportSize({width,height});await p.keyboard.press('Escape');await p.locator('#characterMenu').click();await p.keyboard.press('Escape');await p.click('#growthStatus');assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2));assert.ok(await p.locator('.skills-categories button').first().evaluate(e=>e.getBoundingClientRect().height>=44));assert.ok(await p.locator('.skills-categories').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('#dialogBody').getBoundingClientRect().top));fs.mkdirSync('.codex_doc_review/ui-polish',{recursive:true});await p.screenshot({path:'.codex_doc_review/ui-polish/growth-'+width+'.png'});}
 await p.keyboard.press('Escape');await p.click('#personalNews');const unread=p.locator('.news-item.has-news');if(await unread.count()){await unread.first().click();{await p.keyboard.press('Escape');await p.click('#personalNews');}}
 await p.keyboard.press('Escape');await p.evaluate(()=>{const g=__game,o=g.points().find(o=>o.id==='master');Object.assign(g.player,{x:o.x,y:o.y});});await p.keyboard.press('KeyG');assert.equal(await p.getByRole('button',{name:'잔영보 수락',exact:true}).count(),0);assert.match(await p.locator('#dialog').innerText(),/백련/);
 console.log('red badges, immediate reads, selected tabs, readable touch targets and mentor dialogue passed');
});
