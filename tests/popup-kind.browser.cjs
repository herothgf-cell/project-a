const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async p=>{
 await p.click('#menu');assert.equal(await p.locator('#portrait').isVisible(),false,'settings has no portrait slot');
 await p.getByRole('button',{name:'타이틀로',exact:true}).click();await p.click('#start');
 assert.match(await p.locator('#dialogTitle').innerText(),/새로운 여정/);assert.equal(await p.locator('#portrait').isVisible(),false,'save confirmation has no portrait slot');
 assert.equal(await p.locator('#dialog').getAttribute('data-popup-kind'),'general');await p.getByRole('button',{name:'취소',exact:true}).click();await p.click('#continue');
 await p.evaluate(()=>{const g=__game;g.enter('village');const npc=g.points().find(x=>x.id==='master');Object.assign(g.player,{x:npc.x,y:npc.y});g.events=[];});await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');await p.click('#interact');
 assert.equal(await p.locator('#dialog').getAttribute('data-popup-kind'),'dialogue');assert.equal(await p.locator('#portrait').isVisible(),true,'NPC speech retains portrait');
 await p.keyboard.press('Escape');await p.click('#menu');assert.equal(await p.locator('#portrait').isVisible(),false,'general popup after speech clears portrait slot');
 await p.keyboard.press('Escape');
 await p.evaluate(()=>{__game.events.push({type:'legend-ready',path:'ripple',title:'누가 가르쳐준 적 없는 호흡',text:'흑풍 죽림 · 압박 · 흑풍 산적'});});
 await p.waitForSelector('.inheritance-choice');
 assert.equal(await p.locator('#dialog .app-navigation').count(),0,'inheritance choice excludes global menus');
 for(const [width,height] of [[1280,900],[360,640]]){await p.setViewportSize({width,height});const alignment=await p.locator('#closeDialog').evaluate(e=>{const s=getComputedStyle(e);return [s.display,s.alignItems,s.justifyItems,s.paddingTop,s.paddingBottom,s.lineHeight]});assert.deepEqual(alignment,['grid','center','center','0px','0px','24px']);}
 await p.screenshot({path:'.ssanggye-v12-review/inheritance-popup-fixed.png'});
 await p.click('#closeDialog');assert.equal(await p.locator('#dialog').isVisible(),false);
 console.log('General/settings/save confirmation omit portrait; NPC dialogue retains it; switching resets classification');
});
