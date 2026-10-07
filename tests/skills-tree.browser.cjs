const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./browser-harness.cjs');
run(async p=>{
 await p.evaluate(()=>{const g=__game;g.training=2;g.progress=8;g.journey.realm=1;g.enter('village');g.events=[];g.save();});
 await p.click('#growthStatus');
 await p.getByRole('button',{name:'심법 (패시브)',exact:true}).click();
 const edges=await p.locator('.skills-tree [data-prerequisite]').evaluateAll(es=>es.map(e=>`${e.dataset.prerequisite}->${e.dataset.dependent}`).sort());
 assert.deepEqual(edges,['F0->F1','F0->F2','F1->F3','F2->F5'],'only actual prerequisite edges connect the passive tree');
 await p.locator('[data-passive=F1]').click();
 assert.ok(await p.locator('[data-upgrade=F1]').evaluate(e=>e.getBoundingClientRect().bottom<=document.querySelector('#dialogBody').getBoundingClientRect().bottom),'initial primary upgrade is visible without extra scrolling');
 await p.locator('[data-passive=F3]').click();assert.equal(await p.locator('[data-upgrade=F3]').isDisabled(),true);
 await p.locator('[data-passive=F1]').click();
 assert.ok(await p.locator('[data-upgrade=F1]').evaluate(e=>e.getBoundingClientRect().bottom<=document.querySelector('#dialogBody').getBoundingClientRect().bottom),'first selected upgrade is visible without extra scrolling');
 const before=await p.evaluate(()=>PassiveGrowth.describe(__game).available);
 await p.locator('[data-upgrade=F1]').click();
 assert.equal(await p.evaluate(()=>PassiveGrowth.state(__game).levels.F1),1);
 assert.equal(await p.evaluate(()=>PassiveGrowth.describe(__game).available),before-1);
 await p.locator('[data-passive=F3]').click();assert.equal(await p.locator('[data-upgrade=F3]').isEnabled(),true,'buying the actual prerequisite unlocks its descendant');
 await p.locator('[data-upgrade=F3]').click();assert.equal(await p.evaluate(()=>PassiveGrowth.state(__game).levels.F3),1);
 await p.locator('[data-passive=F4]').click();assert.equal(await p.locator('[data-upgrade=F4]').count(),0,'story-only node is never sold for points');
 await p.getByRole('button',{name:'집중심법',exact:true}).click();
 assert.deepEqual(await p.locator('.skills-tree [data-prerequisite]').evaluateAll(es=>es.map(e=>`${e.dataset.prerequisite}->${e.dataset.dependent}`).sort()),['C0->C1','C0->C2','C1->C3','C2->C4']);
 await p.locator('[data-passive=C2]').click();
 assert.ok(await p.locator('[data-upgrade=C2]').evaluate(e=>e.getBoundingClientRect().bottom<=document.querySelector('#dialogBody').getBoundingClientRect().bottom),'desktop selection keeps the primary upgrade visible without extra scrolling');
 fs.mkdirSync('.purpose-growth-review',{recursive:true});
 await p.screenshot({path:'.purpose-growth-review/skills-tree-desktop.png'});
 for(const zoom of ['100%','200%']){
  await p.setViewportSize({width:360,height:800});await p.evaluate(value=>document.documentElement.style.fontSize=value,zoom);
  await p.getByRole('button',{name:'기술 목록',exact:true}).click();
  assert.equal(await p.locator('.skills-tree').isVisible(),true);
  assert.equal(await p.locator('.skills-detail').isVisible(),true,'tree and level-up remain on the same page');
  await p.locator('[data-passive=C2]').click();await p.locator('[data-upgrade=C2]').scrollIntoViewIfNeeded();
  assert.equal(await p.locator('.skills-tree').isVisible(),true);
  assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'dialog has no horizontal overflow at 360px');
  assert.ok(await p.locator('.skills-screen').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'tree itself has no horizontal overflow');
  assert.equal(await p.locator('.skills-list').evaluate(e=>getComputedStyle(e).overflowY),'visible','tree does not introduce a nested scroll trap');
  await p.screenshot({path:'.purpose-growth-review/skills-tree-mobile-'+zoom.replace('%','')+'.png'});
 }
}).then(()=>console.log('skill tree browser passed')).catch(e=>{console.error(e);process.exitCode=1;});
