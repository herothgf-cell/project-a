const assert=require('node:assert/strict'),{run}=require('./browser-harness.cjs'),H=require('./helpers/murim-browser.cjs');
(async()=>{for(const reject of [false,true])await run(async p=>{
 await H.fight(p);await H.exit(p);await p.evaluate(()=>{ArtPreview.prepare=()=>new Promise((resolve,reject)=>{window.__resolveEntry=resolve;window.__rejectEntry=reject;});});await p.getByRole('button',{name:'다음 지역으로',exact:true}).click();await p.click('#closeDialog');
 if(reject){await p.click('#characterMenu');await p.getByRole('button',{name:'공격 증가',exact:true}).click();await p.evaluate(()=>__rejectEntry(Error('offline')));}else await p.evaluate(()=>__resolveEntry(true));
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.equal(await p.evaluate(()=>__game.area),'village');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem(SaveSlots.keys.current)).area),'village');
 if(reject){assert.equal(await p.locator('#dialogTitle').innerText(),'무림 스탯');assert.equal(await p.getByRole('button',{name:'단련석 1개로 확정',exact:true}).isEnabled(),true);}else assert.equal(await p.locator('#dialog').evaluate(e=>e.open),false);
 console.log('Murim entry cancellation protects current state',reject);
},{classic:false});})().catch(e=>{console.error(e);process.exitCode=1;});
