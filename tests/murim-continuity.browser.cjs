const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{run}=require('./browser-harness.cjs'),H=require('./helpers/murim-browser.cjs');
const output=process.env.REVIEW_OUTPUT||'browser-results/murim-continuity';fs.mkdirSync(output,{recursive:true});
run(async p=>{
 for(const viewport of [{width:1280,height:720},{width:360,height:740},{width:844,height:390}]){
  await p.setViewportSize(viewport);
  for(let i=0;i<3;i++){
   await p.waitForFunction(()=>{const img=document.querySelector('.murim-story-scene img');return img?.complete&&img.naturalWidth>0;});
   const bounds=await p.evaluate(()=>{const text=document.querySelector('.murim-story-scene .dialog-lines').getBoundingClientRect(),body=document.querySelector('#dialogBody').getBoundingClientRect(),actions=document.querySelector('#dialogActions').getBoundingClientRect();return {text:{top:text.top,bottom:text.bottom},body:{top:body.top,bottom:body.bottom},actions:actions.bottom,height:innerHeight};});
   assert.ok(bounds.text.top>=bounds.body.top&&bounds.text.bottom<=bounds.body.bottom+1,'dialogue must be visible without scrolling past the image: '+JSON.stringify(bounds));
   assert.ok(bounds.actions<=bounds.height,'actions stay on screen');
   if(i===0)await p.screenshot({path:path.join(output,'story-'+viewport.width+'x'+viewport.height+'.png')});
   await p.getByRole('button',{name:/^(계속하기|장면 마치기)$/}).click();
  }
 }
 await p.setViewportSize({width:1280,height:900});await H.scenes(p);await H.enter(p,'murimTutorial');await H.fight(p);await H.exit(p);
 assert.equal(await p.evaluate(()=>__game.area),'murimTutorial');
 await H.dismiss(p);await p.click('#characterMenu');const area=await p.evaluate(()=>__game.area);await p.getByRole('button',{name:'공격 증가',exact:true}).click();await p.getByRole('button',{name:'단련석 1개로 확정',exact:true}).click();assert.equal(await p.evaluate(()=>__game.area),area);
 for(let i=1;i<=10;i++){await H.enter(p,'murimRoad'+i);await H.fight(p);await H.exit(p);}
 await p.getByRole('button',{name:'정식 제자 제안 수락',exact:true}).click();await H.scenes(p);await H.dismiss(p);await p.click('#growthStatus');
 assert.equal(await p.locator('[data-plum-tree]').getAttribute('data-unlocked'),'true');assert.match(await p.locator('[data-form="plum-second"]').innerText(),/매화접무/);
 assert.equal(await p.locator('[data-sect-locked]').count(),4);assert.equal(await p.locator('[data-sect-locked] button:not(:disabled)').count(),0);
 await p.getByRole('button',{name:'기술 단축키 설정',exact:true}).click();await p.locator('[data-slot=storm] [data-assign=plum-first]').click();await H.enter(p,'murimReturn1');
 await p.evaluate(()=>{const g=__game,e=g.enemies[0];Object.assign(g.player,{x:e.x-30,y:e.y,face:0});g.act('storm');});await H.fight(p);await H.exit(p);await H.dismiss(p);await p.click('#growthStatus');await p.locator('[data-form=plum-second]').click();await p.evaluate(()=>{window.__set=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('full')};});await p.getByRole('button',{name:'수련첩 2개로 초식 습득',exact:true}).click();assert.equal(await p.evaluate(()=>MurimLoadout.learned(__game,'plum-second')),false);assert.equal(await p.evaluate(()=>__game.area),'murimReturn1');await p.evaluate(()=>Storage.prototype.setItem=window.__set);await p.getByRole('button',{name:'수련첩 2개로 초식 습득',exact:true}).click();
 await p.getByRole('button',{name:'기술 단축키 설정',exact:true}).click();await p.locator('[data-slot=moon] [data-assign=plum-second]').click();await H.dismiss(p);assert.match(await p.locator('[data-action=moon]').innerText(),/매화접무/);
 await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');assert.equal(await p.evaluate(()=>__game.area),'murimReturn1');assert.equal(await p.evaluate(()=>__game.worldState.murimLoadout.slots.moon),'plum-second');
 await H.enter(p,'murimReturn2');await p.evaluate(()=>{const g=__game,e=g.enemies[0];Object.assign(g.player,{x:e.x-30,y:e.y,face:0});g.act('moon');});await H.fight(p);await H.exit(p);await H.dismiss(p);await p.click('#growthStatus');await p.locator('[data-form=plum-third]').click();await p.getByRole('button',{name:'수련첩 2개로 초식 습득',exact:true}).click();await p.setViewportSize({width:360,height:740});await p.locator('[data-plum-tree]').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(output,'plum-tree-mobile.png')});await p.setViewportSize({width:1280,height:900});await p.getByRole('button',{name:'기술 단축키 설정',exact:true}).click();await p.locator('[data-slot=storm] [data-assign=plum-third]').click();await H.enter(p,'murimReturn3');await p.evaluate(()=>{const g=__game,e=g.enemies[0];Object.assign(g.player,{x:e.x-30,y:e.y,face:0});});await p.keyboard.press('KeyW');assert.ok(await p.evaluate(()=>__game.player.cool['plum-third']>0));await H.fight(p);await H.exit(p);assert.equal(await p.evaluate(()=>__game.area),'city');
 console.log('Readable story, forward journey, in-place growth and disciple plum progression passed');
},{classic:false,skipIntro:false}).catch(e=>{console.error(e);process.exitCode=1;});
