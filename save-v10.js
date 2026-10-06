/* Current save boundary. Raw storage is never mutated while validating/migrating. */
(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./world-growth.js'):root.WorldGrowth,n?require('./dungeon-entry.js'):root.DungeonEntry,n?require('./return-proof.js'):root.ReturnProof);if(n)module.exports=api;else root.SaveV10=api;})(globalThis,function(Growth,Dungeon,Proof){
 'use strict';const clone=x=>JSON.parse(JSON.stringify(x));
 function snapshot(g){
  // Trial rosters replace sanctum's normal roster, even just after trial completion.
  // Their permanent proof is already serialized by Fate; temporary attempts restart.
  if(g.trial||g.enemies.some(e=>e.trial))return null;
  return {version:1,area:g.area,player:{x:g.player.x,y:g.player.y,hp:g.player.hp,mp:g.player.mp},enemies:g.enemies.filter(e=>!e.residual&&!(g.area==='overseerHall'&&g.worldState.cycleOne?.bossClear)).map(e=>({id:e.id,hp:e.hp,maxHp:e.maxHp,x:e.x,y:e.y,rewarded:!!e.rewarded})),activated:[...g.activated],linked:!!g.laterRuntime?.linked,suppressRemaining:Math.max(0,Math.min(6,(g.laterRuntime?.suppress||0)-g.playTime)),cycle:g.area==='overseerHall'?{charges:g.cycleRuntime?.charges??3,chargeExposed:g.cycleRuntime?.chargeExposed||0,pulse:g.cycleRuntime?.pulse||0,suppressed:g.cycleRuntime?.suppressed||0,phase:g.cycleRuntime?.phase||1}:null,exercise:g.enemies.some(e=>e.deepeningExercise&&e.hp>0)};
 }
 function save(g,baseSave){const d=JSON.parse(baseSave.call(g));d.version=10;d.improvementVersion=2;d.worldGrowth=clone(g.worldGrowth);d.questRewards=[...g.questRewards];d.journey.mastery=clone(g.worldGrowth.murim.mastery);d.journey.breath=g.worldGrowth.murim.mode;d.fate.path=g.worldGrowth.murim.equipped||g.fate.path;d.worldState=clone(g.worldState);d.encounter=snapshot(g);const proof=Proof.session(g);if(proof)d.returnProofSession=proof;return JSON.stringify(d);}
 function restore(g,d){
  const snap=d.encounter;if(snap!=null){if(snap.version!==1||snap.area!==d.area||!Array.isArray(snap.enemies)||snap.enemies.length>100||typeof snap.linked!=='boolean')throw Error('전장 기록 오류');const p=snap.player;if(!p||!['x','y','hp','mp'].every(k=>Number.isFinite(p[k]))||p.hp<0||p.mp<0||p.hp>10000||p.mp>10000)throw Error('전장 위치·체력 기록 오류');const seen=new Set();for(const e of snap.enemies){if(!e||typeof e.id!=='string'||seen.has(e.id)||!['hp','maxHp','x','y'].every(k=>Number.isFinite(e[k]))||e.hp<0||e.hp>e.maxHp||e.maxHp<=0||e.maxHp>100000||typeof e.rewarded!=='boolean')throw Error('적 기록 오류');seen.add(e.id);}
   if(snap.cycle!=null){const c=snap.cycle;if(d.area!=='overseerHall'||!Number.isInteger(c.charges)||c.charges<0||c.charges>3||!Number.isInteger(c.phase)||c.phase<1||c.phase>3||!['chargeExposed','pulse','suppressed'].every(k=>Number.isFinite(c[k])&&c[k]>=0&&c[k]<=6))throw Error('감독관 전투 기록 오류');}
   const remaining=snap.suppressRemaining??0;
   if(!Number.isFinite(remaining)||remaining<0||remaining>6||remaining>0&&!snap.linked||snap.linked&&(!g.laterStory?.dualBreath||!['stabilization','woundPass','woundDock','woundCore'].includes(d.area)))throw Error('연계 효과 기록 오류');
   if(snap.exercise!==undefined&&typeof snap.exercise!=='boolean'||snap.exercise&&(d.area!=='stabilization'||g.laterStory?.six!==3||snap.linked||snap.enemies.some(e=>e.hp>0)||!g.laterStory.dualBreath&&g.laterStory.deepening?.stage!=='trial'))throw Error('잔류 수련 기록 오류');
   if(snap.activated!==undefined&&(!Array.isArray(snap.activated)||snap.activated.length>20||new Set(snap.activated).size!==snap.activated.length||snap.activated.some(id=>typeof id!=='string')))throw Error('봉인 기록 오류');
  }
  if(g.area!==d.area&&!g.enter(d.area)){g.restoreNotice='이전 위치의 진입 조건을 확인할 수 없어 같은 세계의 안전 지점에서 이어갑니다.';return;}
  g.restoreWorldEncounter();
  if(!snap)return;
  // Completed halls contain no active roster. Older saves retained the defeated overseer.
  const rows=g.area==='overseerHall'&&g.worldState.cycleOne?.bossClear&&snap.enemies.every(e=>e.id==='overseer'&&e.hp===0&&e.rewarded)?[]:snap.enemies;
  if(g.enemies.length!==rows.length||rows.some(row=>!g.enemies.some(e=>e.id===row.id&&e.maxHp===row.maxHp)))throw Error('전장 구성과 저장 기록이 다릅니다.');
  for(const row of rows){const e=g.enemies.find(e=>e.id===row.id);e.hp=row.hp;e.rewarded=row.rewarded||row.hp===0;if(!g.blocked(row.x,row.y,e.r)){e.x=row.x;e.y=row.y;}e.wind=0;e.cd=Math.max(e.cd||0,.8);}
  const seals=g.seals().map(p=>p.id),bossDamaged=g.enemies.some(e=>e.boss&&e.hp<e.maxHp);
  // Older snapshots omitted devices. Boss damage is only possible after every seal
  // and guard is cleared; use that evidence, never just the player's story chapter.
  const activated=snap.activated??(bossDamaged&&!g.guardsAlive()?seals:[]);
  if(activated.some(id=>!seals.includes(id))||activated.length&&g.guardsAlive())throw Error('봉인 해제 조건 오류');g.activated=[...activated];
  if(bossDamaged&&g.bossLocked())throw Error('보호된 우두머리의 피해 기록 오류');
  if(g.blocked(snap.player.x,snap.player.y,g.player.r)){g.enter(Growth.worldOf(g)==='murim'?'village':'city');g.restoreNotice='저장 위치가 유효하지 않아 같은 세계의 안전 지점으로 돌아왔습니다.';return;}
  if(snap.player.hp===0){g.enter(Growth.worldOf(g)==='murim'?'village':'city');g.restoreNotice='쓰러진 순간의 기록에서 같은 세계의 안전 지점으로 복귀했습니다.';return;}
  Object.assign(g.player,{x:snap.player.x,y:snap.player.y,hp:Math.min(snap.player.hp,g.stats().hp),mp:Math.min(snap.player.mp,g.stats().mp),invuln:.8});if(g.laterRuntime){g.laterRuntime.linked=snap.linked;g.laterRuntime.suppress=g.playTime+(snap.suppressRemaining||0);}
  if(snap.cycle)g.cycleRuntime={...g.cycleRuntime,...snap.cycle};
  if(snap.exercise&&!g.startDeepeningExercise())throw Error('잔류 수련을 복원할 수 없습니다.');
 }
 function load(raw,Game,baseLoad){
  if(typeof raw!=='string'||raw.length>500000)throw Error('저장 파일 크기 오류');const d=JSON.parse(raw);if(!d||d.version!==10||d.improvementVersion!==undefined&&![1,2].includes(d.improvementVersion))throw Error('지원하지 않는 저장 버전입니다. 이전 기록은 보관판에서 열어 주세요.');
  const worlds=Growth.validate(d.worldGrowth);if(!Array.isArray(d.questRewards)||d.questRewards.length>100||new Set(d.questRewards).size!==d.questRewards.length||d.questRewards.some(x=>typeof x!=='string'||!/^[-a-z0-9:]{1,64}$/.test(x)))throw Error('지급 기록 오류');if(!d.worldState||typeof d.worldState!=='object'||Array.isArray(d.worldState))throw Error('세계 사건 기록 오류');
  const projection=clone(d);projection.version=9;if(d.improvementVersion===2&&d.worldState.advancement?.realm>0){if(![0,1].includes(d.journey?.realm))throw Error('경지 값 오류');projection.journey.realm=0;}if(['transportRoad','supplyRidge','overseerApproach','overseerHall','transportDock','evacuationDock'].includes(projection.area))projection.area=Growth.worldOf(d)==='murim'?'village':'city';projection.level=worlds[Growth.worldOf(d)].level;projection.xp=worlds[Growth.worldOf(d)].xp;const g=baseLoad(JSON.stringify(projection));Object.setPrototypeOf(g,Game.prototype);delete g.level;delete g.xp;g.worldGrowth=worlds;g.questRewards=[...d.questRewards];g.worldState=clone(d.worldState);g.installWorldState();if(d.improvementVersion===2&&d.worldState.advancement?.realm>0)g.journey.realm=d.journey.realm;
  for(const w of Object.values(worlds))if(w.equipped&&!g.revision.inherited.includes(w.equipped))throw Error('미계승 계열 장착 오류');g.validateWorldState?.();if(!d.worldState.cycleOne&&(d.improvementVersion||0)<2&&d.progress>=2)g.worldState.cycleOne.legacyAccess=true;
  if(g.laterStory?.dualBreath&&!g.laterStory.deepening)g.laterStory.deepening={stage:'legacy',observed:false,clue:false,interpreted:false,legacy:true};
  g.player.hp=g.stats().hp;g.player.mp=g.stats().mp;restore(g,d);Proof.restoreSession(g,d.returnProofSession);g.events=[];return g;
 }
 return {save,load,snapshot};
});
