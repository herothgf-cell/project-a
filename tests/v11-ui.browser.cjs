const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
run(async p=>{
 await p.click('#character');
 assert.equal(await p.locator('.app-navigation').count(),0);
 assert.equal(await p.locator('.character-tabs').count(),0);
 await p.keyboard.press('Escape');await p.click('#growthStatus');
 assert.equal(await p.locator('#realmMenu').count(),1);assert.equal(await p.locator('#hunterMenu').count(),1);
 assert.equal(await p.locator('.skills-screen').count(),1);
 const before=await p.evaluate(()=>({area:__game.area,x:__game.player.x,y:__game.player.y,hp:__game.player.hp}));
 await p.keyboard.down('ArrowRight');await p.waitForTimeout(150);await p.keyboard.up('ArrowRight');
 assert.deepEqual(await p.evaluate(()=>({area:__game.area,x:__game.player.x,y:__game.player.y,hp:__game.player.hp})),before);
 for(const [width,height]of [[360,640],[390,844],[844,390],[1280,720],[1920,1080]]){
  await p.setViewportSize({width,height});
  assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2),`${width} dialog overflow`);
  assert.ok(await p.locator('#closeDialog').isVisible());
 }
 await p.setViewportSize({width:390,height:844});
 await p.evaluate(()=>document.documentElement.style.fontSize='200%');
 assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'200% text overflow');
 fs.mkdirSync('.ssanggye-v11-review',{recursive:true});await p.screenshot({path:'.ssanggye-v11-review/growth-mobile-200.png'});
 await p.evaluate(()=>document.documentElement.style.fontSize='');await p.setViewportSize({width:1280,height:720});
 await p.screenshot({path:'.ssanggye-v11-review/growth-desktop.png'});
 await p.keyboard.press('Escape');await p.locator('#missionsMenu').click();assert.match(await p.locator('#dialogBody').innerText(),/현재 행동/);
 await p.keyboard.press('Escape');await p.locator('#menu').click();assert.equal(await p.locator('#dialog').getByRole('button',{name:'소리 설정',exact:true}).count(),0);
 console.log('v1.1 navigation, input isolation, responsive and enlarged text verified');
});
