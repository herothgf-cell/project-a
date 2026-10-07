const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async p=>{
 assert.equal(await p.evaluate(()=>__game.sense()),false);
 await p.evaluate(()=>{__game.progress=2;__game.training=1;});assert.equal(await p.evaluate(()=>__game.sense()),false);
 await p.locator('#characterMenu').click();
 const before=await p.evaluate(()=>JSON.stringify({area:__game.area,growth:__game.worldGrowth}));
 for(const [width,height,scale]of [[1280,900,100],[360,640,100],[390,844,200]]){
  await p.setViewportSize({width,height});await p.evaluate(s=>document.documentElement.style.fontSize=s+'%',scale);
  for(const name of ['무림 캐릭터','현실 캐릭터']){await p.getByRole('button',{name,exact:true}).click();assert.equal(await p.locator('.character-stats article').count(),3);assert.equal(await p.locator('.app-navigation,.character-tabs').count(),0);assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2));assert.match(await p.locator('.character-location').innerText(),/조회:.*현재 위치:/);}
  assert.doesNotMatch(await p.locator('#dialogBody').innerText(),/성장 출처|기본 체력|현장 자격|현실 비교|현재 전투 세계|맡은 역할/);
  await p.screenshot({path:'.ssanggye-v12-review/profile-'+width+'-'+scale+'.png'});
 }
 assert.equal(await p.evaluate(()=>JSON.stringify({area:__game.area,growth:__game.worldGrowth})),before);
 await p.keyboard.press('Escape');await p.evaluate(()=>document.documentElement.style.fontSize='100%');await p.setViewportSize({width:1280,height:900});
 await p.locator('#menu').click();assert.doesNotMatch(await p.locator('#dialog').innerText(),/지역 지도|화면 효과|글자 크기|이펙트 품질|보급/);assert.equal(await p.locator('.app-navigation').count(),0);await p.keyboard.press('Escape');
 await p.evaluate(()=>{const s=CycleOne.state(__game);s.returnReceipt=s.recordDelivered=s.invited=true;});await p.waitForSelector('#sense',{state:'visible'});assert.equal(await p.evaluate(()=>__game.sense()),true);
 console.log('Portrait profiles, compact stats, no duplicate navigation/settings, story-gated sense, viewport and 200% checks passed');
});
