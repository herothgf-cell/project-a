const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict');
run(async p=>{
 await p.evaluate(()=>{const g=__game;g.progress=12;g.training=3;g.fate.stage=2;g.fate.discovered=['ripple'];g.enter('village');g.enter('sanctum');g.beginTrial('ripple');g.enemies[0].speed=0;g.enemies[0].cd=99;for(let i=0;i<2;i++){g.player.cool.signature1=0;g.act('signature1');for(let j=0;j<15;j++){g.hitStop=0;g.step(.05);}}g.events=[];});
 await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');const help=p.getByRole('button',{name:'도움말 보기',exact:true});await help.focus();await p.evaluate(()=>window.practiceHelp=document.activeElement);await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>practiceHelp.isConnected&&document.activeElement===practiceHelp),true);await p.keyboard.press('Enter');await p.waitForFunction(()=>document.querySelector('#dialog').open);assert.match(await p.locator('#dialog').innerText(),/선택 연습 도움말/);await p.keyboard.press('Escape');
 console.log('practice help retains stable keyboard focus through HUD updates and opens with Enter');
});
