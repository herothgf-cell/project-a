const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),{five}=require('./helpers/world-journey.cjs');
run(async p=>{
 const g=five('ripple');g.enter('village');g.enter('city');g.enter('village');g.refreshNews();for(const item of g.worldState.news.items)item.read=false;
 await p.locator('#menu').click();await p.getByRole('button',{name:'타이틀로',exact:true}).click();await p.evaluate(raw=>localStorage.setItem(SaveSlots.keys.current,raw),g.save());await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');
 const before=await p.evaluate(()=>JSON.stringify([__game.worldGrowth,__game.journey.selected,__game.gold])),skills=await p.evaluate(()=>__game.unreadNews('skills').length);
 assert.ok(await p.evaluate(()=>__game.unreadNews('status').filter(n=>n.subject==='crystal').length>0));await p.click('#character');
 assert.ok(await p.evaluate(()=>__game.unreadNews('status').filter(n=>n.subject==='crystal').length>0),'murim comparison must not read reality return results');
 await p.getByRole('button',{name:/현실 캐릭터/}).click();
 assert.ok(await p.evaluate(()=>__game.unreadNews('status').filter(n=>n.subject==='crystal').length>0),'viewing balance does not acknowledge receipts');await p.getByRole('button',{name:'획득 내역',exact:true}).click();assert.equal(await p.evaluate(()=>__game.unreadNews('status').filter(n=>n.subject==='crystal').length),0,'reading receipt history acknowledges only crystals');
 assert.equal(await p.locator('.character-new').count(),0);
 assert.equal(await p.evaluate(()=>__game.unreadNews('skills').length),skills,'unrelated skill news stays unread');
 await p.keyboard.press('Escape');await p.locator('#characterMenu').click();await p.keyboard.press('Escape');await p.click('#growthStatus');await p.getByRole('button',{name:'발견한 해석과 관찰 기록',exact:true}).click();
 assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='interpret:ripple-return').read),true,'notebook details share the read state');
 assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='inherit:ripple').read),false);
 assert.equal(await p.evaluate(()=>JSON.stringify([__game.worldGrowth,__game.journey.selected,__game.gold])),before);
 await p.keyboard.press('Escape');await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');
 for(let i=0;i<2;i++){await p.evaluate(()=>__game.refreshNews());await p.click('#character');await p.getByRole('button',{name:/현실 캐릭터/}).click();await p.getByRole('button',{name:'획득 내역',exact:true}).click();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>__game.unreadNews('status').filter(n=>n.subject==='crystal').length),0);}
 assert.equal(await p.evaluate(()=>__game.newsList().find(x=>x.id==='interpret:ripple-return').read),true);
 await p.evaluate(()=>{const g=__game;g.grantExperience({world:'murim',amount:10000});g.enter('city');g.events=[];g.refreshNews();});
 assert.ok(await p.evaluate(()=>__game.unreadNews('growth').some(x=>x.id==='return:murim-level:10')),'genuinely new return result still notifies');
 console.log('status and notebook reads clear matching dots, survive reload, preserve other news and allow new notifications');
});
