/* Shared, read-only entry predicates. Only confirmed, prepared entry mutates gameplay. */
(function(root,f){const api=f(typeof module==='object'&&module.exports?require('./progression.js'):root.Progression,typeof module==='object'&&module.exports?require('./cycle-one.js'):root.CycleOne,typeof module==='object'&&module.exports?require('./resonance-challenges.js'):root.ResonanceChallenges);if(typeof module==='object'&&module.exports)module.exports=api;else root.DungeonEntry=api;})(globalThis,function(api,Cycle,Challenges){
 'use strict';const {AREAS}=api,ENTRANCE='dungeon-entry',pending=new WeakSet();
 const hubs={city:{id:ENTRANCE,x:1170,y:850,label:'현실 던전 입구',kind:ENTRANCE},village:{id:ENTRANCE,x:1180,y:860,label:'무림 탐험지 입구',kind:ENTRANCE}};
 const rows=[
  ['forest','village','forest',g=>g.progress>=2,g=>g.progress===3,g=>g.progress>=4,'백련에게 기본기를 배우세요.'],
  ['rift','city','gate',g=>g.progress>=5,g=>g.progress===6,g=>g.progress>=7,'현실 기지의 서린에게 전승한 무공을 보여 주세요.'],
  ['ruins','village','ruins',g=>g.progress>=8,g=>g.progress===9,g=>g.progress>=10,'백련에게 본편의 조사 결과를 전하세요.'],
  ['harbor','city','harbor',g=>g.progress>=11,g=>g.progress===12&&!(g.fate?.stage),g=>g.fate?.stage>0,'서린에게 본편의 진입 허가를 받으세요.'],
  ['sanctum','village','sanctum',g=>g.progress>=12&&g.fate?.stage>=2,()=>false,g=>!!g.fate?.path,'서린과 백련에게 다음 이야기의 단서를 확인하세요.'],
  ['heart','city','heart',g=>g.progress>=12&&g.fate?.stage>=4,g=>g.fate?.stage===5,g=>g.fate?.stage>=6,'화산 일반 재수련 또는 기연 체득 뒤 서린에게 준비를 보고하세요.'],
  ['returnPass','village','passGate',g=>g.chapter4?.phase>=1,()=>false,g=>g.chapter4?.phase>=2,'서린에게 후속 구조 신호를 확인하세요.'],
  ['returnDock','city','dockGate',g=>g.chapter4?.phase>=2,g=>g.chapter4?.phase===3,g=>g.chapter4?.phase>=4,'무림의 구조 현장에서 돌아올 길을 여세요.'],
  ['archive','village','archiveGate',g=>g.progress>=2&&Cycle.archiveAccess(g),()=>false,()=>false,'4장 보고 후 연화의 귀환을 확인하고 기록을 백련에게 전해 초대를 수락하세요.'],
  ['station','city','stationGate',g=>g.journey?.phase>=3,g=>g.journey?.phase===4,g=>g.journey?.phase>=5,'서린에게 공명 관측소 현장 임무를 받으세요.'],
  ['stabilization','city','sixGate',g=>g.laterStory?.six>=1,g=>g.laterStory?.six===4,g=>g.laterStory?.six>=5,'서린과 후속 조사를 시작하세요.'],
  ['woundPass','village','woundGate',g=>g.laterStory?.seven>=1,()=>false,g=>g.laterStory?.seven>=2,'서린에게 다음 공동 조사를 확인하세요.'],
  ['woundDock','city','woundDockGate',g=>g.laterStory?.seven>=2,()=>false,g=>g.laterStory?.seven>=3,'무림 외곽의 압력을 먼저 흘려 보내세요.'],
  ['woundCore','village','coreGate',g=>!!g.laterStory?.coreOpened,g=>g.laterStory?.seven===4,g=>g.laterStory?.seven>=5,'양쪽 현장의 공동 대응을 순서대로 진행하세요.']
 ];
 const completed={transportRoad:'roadClear',transportDock:'eightComplete',supplyRidge:'supplyCut',evacuationDock:'nineComplete',overseerApproach:'approachClear',overseerHall:'epilogue'};
 for(const [id,,name,,world] of Cycle.specs)rows.push([id,world==='현실'?'city':'village',id+'Gate',g=>Cycle.canEnter(g,id),()=>false,g=>!!Cycle.state(g)[completed[id]],'현재 본편의 현장 행동과 직접 보고를 마치세요.']);
 const entries=rows.map(([id,hub,oldPoint,unlock,report,complete,hint],order)=>({id,hub,world:hub==='city'?'현실':'무림',oldPoint,unlock,report,complete,hint,order,revisit:true,safeReturn:hub}));
 const byId=Object.fromEntries(entries.map(e=>[e.id,e]));
 const initial=()=>({version:1,unlocked:[],seen:[],selected:{city:null,village:null},scroll:{city:0,village:0}});
 function migrate(g,raw){const s=initial();s.unlocked=entries.filter(e=>e.unlock(g)).map(e=>e.id);s.seen=Array.isArray(raw?.seen)?[...new Set(raw.seen.filter(id=>s.unlocked.includes(id)))]:[];for(const hub of Object.keys(hubs)){const id=raw?.selected?.[hub];if(byId[id]?.hub===hub)s.selected[hub]=id;const n=raw?.scroll?.[hub];if(Number.isFinite(n)&&n>=0)s.scroll[hub]=Math.min(n,100000);}return s;}
 function state(g){g.worldState||={};return g.worldState.dungeons||(g.worldState.dungeons=migrate(g));}
 function validate(g){const s=migrate(g,g.worldState?.dungeons);g.worldState||={};g.worldState.dungeons=s;return s;}
 function points(g,base,area=g.area){if(!g.worldGrowth||!hubs[area])return base;return [...base.filter(p=>!entries.some(e=>e.hub===area&&e.oldPoint===p.id)&&p.id!==ENTRANCE),{...hubs[area]}];}
 function canEnter(g,id){if(g.worldGrowth&&id==='archive')return false;return !g.worldGrowth||!byId[id]||evaluate(g,id).canEnter;}
 function near(g,hub){return g.area===hub&&Math.hypot(g.player.x-hubs[hub].x,g.player.y-hubs[hub].y)<90;}
 const statusText={locked:'잠김',new:'새 해금',progress:'진행 중',report:'목표 완료 · 보고 필요',revisit:'공략 완료 · 재방문 가능',unavailable:'현재 진입 불가'};
 function evaluate(g,id,{atEntrance=false}={}){const e=byId[id];if(!e)return null;const unlocked=!(g.worldGrowth&&id==='archive')&&!!e.unlock(g),completed=!!e.complete(g),report=!!e.report(g),seen=g.worldState?.dungeons?.seen?.includes(id),a=AREAS[id];let reason=unlocked?'':e.hint;
  if(unlocked&&g.introActive)reason='도입부를 먼저 마치세요.';
  else if(unlocked&&api.Game.laterRules?.areas.includes(id)&&!api.Game.laterRules.canEnter(g,id))reason=id==='woundCore'?'청운촌의 백련에게 현실 방어선의 안정 결과를 보고하세요.':'현실 기지의 서린에게 공동 대응 준비를 선택하세요.';
  else if(unlocked&&g.trial)reason='진행 중인 시험을 먼저 마치세요.';
  else if(unlocked&&completed&&!e.revisit)reason='이 지역은 재방문할 수 없습니다.';
  else if(unlocked&&atEntrance&&!near(g,e.hub))reason=e.world+' 거점의 던전 입구로 이동하세요.';
  let status=!unlocked?'locked':reason?'unavailable':report?'report':completed?'revisit':!seen?'new':'progress';
  return {id,hub:e.hub,world:e.world,entrance:ENTRANCE,safeReturn:e.safeReturn,unlocked,completed,report,revisit:e.revisit,canEnter:unlocked&&!reason,status,statusText:statusText[status],reason,name:unlocked?(id==='rift'&&g.worldState?.growthArc?.phase==='defense'?'균열 재조사 · 귀환 통로 방어':a?.name||id):'아직 알려지지 않은 탐험지',purpose:unlocked?a?.sub||'현장의 목표를 확인하세요.':'',threat:unlocked?(id==='archive'?'스킬 진화 · 기감으로 발견 → 조사 → 기술 실험 → 무공에서 장착':id==='sanctum'?'선택한 흔적의 시험에 직접 도전':'적의 공격 예고와 현장 장치를 살피세요.'):'',rewardPolicy:unlocked?'기존 지역의 보상 규칙을 따릅니다. 이미 받은 이야기·보고 보상은 다시 지급하지 않습니다.':'',order:e.order};
 }
 function currentDestination(g){if(g.worldState?.growthArc&&!g.worldState.growthArc.legacy&&g.worldState.growthArc.phase==='defense')return 'rift';const destination=Cycle.objective(g)?.destination?.area;if(Cycle.areaIds.includes(destination))return destination;const s=g.laterStory||{},j=g.journey||{},c=g.chapter4||{},f=g.fate||{};if(s.seven>=1&&s.seven<=3)return ['woundPass','woundDock','woundCore'][s.seven-1];if(s.six===1||s.six===3)return 'stabilization';if(j.phase===3)return 'station';if(j.phase===1||j.phase===2||!j.phase&&g.worldState?.cycleOne?.invited)return g.worldGrowth?null:Cycle.archiveAccess(g)?'archive':null;if(c.phase===1)return 'returnPass';if(c.phase===2)return 'returnDock';if(f.stage===4)return 'heart';if(f.stage===2&&!f.proven?.length)return 'sanctum';return ({2:'forest',5:'rift',8:'ruins',11:'harbor'})[g.progress]||null;}
 function list(g){const hub=AREAS[g.area]?.world==='현실'?'city':'village',current=currentDestination(g);return entries.filter(e=>e.hub===hub&&(!g.worldGrowth||e.id!=='archive')).map(e=>({...evaluate(g,e.id,{atEntrance:true}),current:e.id===current})).concat(hub==='village'?Challenges.list(g):[]).sort((a,b)=>Number(b.current)-Number(a.current)||Number(b.status==='new')-Number(a.status==='new')||a.order-b.order);}
 function markSeen(g,id){if(!byId[id]?.unlock(g))return;const s=state(g);if(!s.seen.includes(id))s.seen.push(id);if(!s.unlocked.includes(id))s.unlocked.push(id);}
 async function request(g,id,prepare){if(id?.startsWith('resonance:'))return Challenges.request(g,id,prepare);if(pending.has(g))return {ok:false,reason:'입장 준비 중입니다.'};const first=evaluate(g,id,{atEntrance:true});if(!g.worldGrowth||!first?.canEnter)return {ok:false,reason:first?.reason||'입장할 수 없습니다.'};pending.add(g);try{if(typeof prepare!=='function')throw Error('missing preparation');const ready=await prepare(id);if(ready===false)throw Error('preparation failed');const next=evaluate(g,id,{atEntrance:true});if(!next?.canEnter)return {ok:false,reason:next?.reason||'입장 조건이 변경되었습니다.'};if(!g.enter(id))return {ok:false,reason:'입장 조건이 변경되었습니다.'};markSeen(g,id);return {ok:true,id};}catch(error){return {ok:false,reason:'지역 준비에 실패했습니다. 현재 위치에서 다시 시도하세요.'};}finally{pending.delete(g);}}
 function migratePin(pin){if(!pin||typeof pin!=='object')return pin;const e=entries.find(e=>e.hub===pin.area&&e.oldPoint===(pin.pointId||pin.id));return e?{...pin,...(pin.id?{id:ENTRANCE}:{}),pointId:ENTRANCE,destinationId:e.id}:pin;}
 return {ENTRANCE,hubs,entries,initial,state,validate,migrate,migratePin,points,canEnter,evaluate,list,near,markSeen,request,currentDestination};
});
