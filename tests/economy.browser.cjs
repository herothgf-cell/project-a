const {run}=require('./legacy-browser-harness.cjs');
const assert=require('node:assert/strict');
run(async p=>{
 await p.locator('#inventory').click();
 assert.doesNotMatch(await p.locator('#dialog').innerText(),/마정석|관측 렌즈|다음 강화|무기 강화/);
 await p.getByRole('button',{name:'보급',exact:true}).click();
 assert.doesNotMatch(await p.locator('#dialog').innerText(),/강화/);
 const v=await p.evaluate(()=>JSON.parse(window.__game.save()).version);assert.equal(v,9);
});
