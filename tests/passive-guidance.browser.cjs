const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
run(async p=>{
 fs.mkdirSync('.ui-design-review/passive-guidance',{recursive:true});
 await p.evaluate(()=>{__game.training=2;__game.progress=7;__game.enter('city');__game.events=[];__game.refreshNews();__game.readNews('mode:unlocked');});
 await p.click('#personalNews');await p.locator('.news-item').filter({hasText:'심법과 현실 운용 개방'}).click();await p.locator('.skills-screen').waitFor();
 assert.equal(await p.locator('#dialogTitle').innerText(),'무공/스킬');
 assert.equal(await p.evaluate(()=>__game.newsList().some(x=>x.id==='mode:unlocked')),false);
 await p.getByRole('button',{name:'무림 보기',exact:true}).click();await p.locator('[data-passive=F1]').click();
 assert.match(await p.locator('.skills-notice').innerText(),/청운촌/);assert.ok(await p.locator('[data-upgrade=F1]').isDisabled());
 await p.keyboard.press('Escape');await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');await p.click('#personalNews');
 assert.equal(await p.locator('.news-item').filter({hasText:'심법과 현실 운용 개방'}).count(),0);
 await p.keyboard.press('Escape');await p.evaluate(()=>{__game.enter('village');__game.events=[];});await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');
 await p.click('#growthStatus');await p.locator('[data-passive=F1]').click();assert.equal(await p.locator('[data-passive=F1]').getAttribute('aria-pressed'),'true');
 assert.match(await p.locator('.skills-detail').innerText(),/정기 축적/);assert.match(await p.locator('.skills-detail').innerText(),/최대 자원 \+4/);
 await p.locator('[data-upgrade=F1]').click();assert.equal(await p.evaluate(()=>PassiveGrowth.describe(__game).spent),1);
 await p.getByRole('button',{name:'스킬 초기화',exact:true}).click();assert.equal(await p.evaluate(()=>PassiveGrowth.describe(__game).spent),1);
 await p.getByRole('button',{name:'취소',exact:true}).click();assert.equal(await p.evaluate(()=>PassiveGrowth.describe(__game).spent),1);
 await p.getByRole('button',{name:'스킬 초기화',exact:true}).click();await p.getByRole('button',{name:'초기화 확정',exact:true}).click();
 assert.equal(await p.evaluate(()=>PassiveGrowth.describe(__game).spent),0);assert.equal(await p.evaluate(()=>PassiveGrowth.state(__game).levels.F0),1);
 for(const [width,height]of [[1280,900],[390,844],[844,390]]){await p.setViewportSize({width,height});assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2));await p.screenshot({path:'.ui-design-review/passive-guidance/'+width+'.png'});}
 console.log('Passive news routes persistently; skill workspace preserves point guidance, allocation and refund confirmation');
});
