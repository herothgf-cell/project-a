const {run}=require('./browser-harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
run(async p=>{
 fs.mkdirSync('.codex_doc_review/v012',{recursive:true});
 await p.waitForFunction(()=>!!globalThis.OverseerArt);
 await p.evaluate(()=>{
  const g=__game,s=CycleOne.initial();for(const k of Object.keys(s))if(typeof s[k]==='boolean')s[k]=true;s.bossClear=s.murimEpilogue=s.epilogue=false;s.routeChoice='device';g.worldState.cycleOne=s;
  g.enter('overseerHall');g.events=[];g.player.invuln=999;Object.assign(g.player,{x:670,y:560});const e=g.enemies.find(e=>e.cycleBoss);Object.assign(e,{x:850,y:500,cd:999,wind:0});g.cycleRuntime.charges=0;
  const wrap=document.createElement('section');wrap.id='overseer-art-review';wrap.style.cssText='position:fixed;left:20px;bottom:20px;z-index:250;display:flex;gap:12px;padding:16px;background:#101823;border:1px solid #a79064;color:#e6d9b9';
  for(let phase=1;phase<=3;phase++){const holder=document.createElement('div');holder.innerText=['검과 장치','남은 충전','끊어진 지원'][phase-1];const cv=document.createElement('canvas');cv.width=180;cv.height=230;holder.append(cv);wrap.append(holder);const ctx=cv.getContext('2d');ctx.fillStyle='#182332';ctx.fillRect(0,0,180,230);WorldArt.human(ctx,{id:'review-'+phase,x:75,y:195,cycleBoss:true,cyclePhase:phase,wind:phase===2?.8:0,face:0},1,'human-overseer',1.5);}
  for(const world of ['무림','현실']){const holder=document.createElement('div');holder.innerText=world+' · 동일 인물';const cv=document.createElement('canvas');cv.width=160;cv.height=160;holder.append(cv);wrap.append(holder);OverseerArt.portrait(cv,'overseer',world);}
  document.body.append(wrap);const portrait=document.createElement('canvas');portrait.width=96;portrait.height=96;WorldArt.portrait(portrait,'overseer');globalThis.__overseerPortrait=portrait.dataset.productionPortrait;
 });
 await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');
 await p.waitForFunction(()=>[...ArtPreview.diagnostics.values()].some(v=>v.id==='code.overseer'));
 assert.equal(await p.evaluate(()=>__overseerPortrait),'code.overseer.portrait');
 assert.equal(await p.evaluate(()=>[...ArtPreview.diagnostics.values()].filter(v=>v.id==='code.overseer'&&v.status==='original-human').length>=3),true);
 await p.screenshot({path:'.codex_doc_review/v012/overseer-human-phases.png'});
 console.log('Human overseer boss, all three phases and cross-world portraits rendered through exclusive hooks.');
});
