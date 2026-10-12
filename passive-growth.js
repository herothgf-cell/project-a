(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.PassiveGrowth=api;})(globalThis,function(){
 'use strict';
 const rewards={training:2,realm:3,chapter4:2,chapter5:3,six:1,seven:1};
 const nodes=[
  ['F0','기초 운기',1,null,true],['F1','정기 축적',3,'F0'],['F2','유연한 운기',3,'F0'],['F3','내력 절약',2,'F1'],['F4','이어지는 숨',1,null,true],['F5','몸의 여유',2,'F2'],
  ['C0','집중 운기',1,null,true],['C1','정기 축적',3,'C0'],['C2','일격 집중',3,'C0'],['C3','절제된 일격',2,'C1'],['C4','안정된 자세',2,'C2'],['C5','틈을 읽는 일격',1,null,true]
 ].map(([id,name,max,prerequisite,free=false])=>({id,name,max,prerequisite,free,tree:id[0]==='F'?'flow':'focus'}));
 const descriptions={F0:'기술을 1.2초 쉬면 자원을 추가로 회복합니다.',F1:'유수심법 운용 중 최대 자원이 늘어납니다.',F2:'기술을 쉬는 동안 추가 자원 회복량을 높입니다.',F3:'일반 유료 기술의 자원 비용을 줄입니다. 최소 비용은 1입니다.',F4:'유효 연계 후 다음 유료 기술 비용을 6 줄이고 대상 재생을 6초 억제합니다.',F5:'유수심법 운용 중 최대 체력이 늘어납니다.',C0:'1.4초 준비 후 첫 수동 기본 타격이 자원 6을 쓰고 1.2배로 강해집니다.',C1:'집중심법 운용 중 최대 자원이 늘어납니다.',C2:'준비된 첫 수동 기본 타격의 피해 배율을 높입니다.',C3:'준비된 첫 일격에 드는 추가 자원 비용을 줄입니다.',C4:'집중심법 운용 중 최대 체력이 늘어납니다.',C5:'준비 일격 뒤 기연으로 유효 대응하면 대상 재생을 6초 억제합니다.'};
 for(const n of nodes)n.description=descriptions[n.id];
 const ids=nodes.map(n=>n.id),downstream=['F3','F5','C3','C4'];
 const empty=()=>Object.fromEntries(ids.map(id=>[id,0]));
 const worldOf=g=>g.growthWorld?.()||(['village','forest','ruins','sanctum','returnPass','archive','woundPass','woundCore','transportRoad','supplyRidge','overseerHall','realmAssessment'].includes(g.area)?'murim':'reality');
 const earned=g=>({training:g.training>=1,realm:g.journey?.realm>=1,chapter4:g.chapter4?.phase===4,chapter5:g.journey?.phase===5,six:g.laterStory?.six===5,seven:g.laterStory?.seven===5});
 const total=s=>Object.values(s.ledger).reduce((a,b)=>a+b,0);
 const spent=levels=>nodes.reduce((a,n)=>a+(n.free?0:levels[n.id]),0);
 function sync(g){
  if(!g||typeof g!=='object')throw Error('심법 게임 정보 오류');
  g.worldState||={};g.worldState.passive||={version:1,ledger:{},levels:empty(),adapted:null};
  const s=g.worldState.passive,e=earned(g);
  for(const [id,value]of Object.entries(rewards))if(e[id])s.ledger[id]=value;
  if(g.training>=1)s.levels.F0=1;
  if(g.training>=2||g.worldGrowth?.murim?.mode==='focus'||g.worldGrowth?.reality?.mode==='focus')s.levels.C0=1;
  if(g.laterStory?.dualBreath){s.levels.F4=1;s.levels.C5=1;}
  return s;
 }
 const state=sync;
 function validate(g){
  const raw=g?.worldState?.passive;if(raw===undefined)return sync(g);
  const fail=()=>{throw Error('심법 저장 정보 오류');};
  const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
  if(!object(raw)||raw.version!==1||!object(raw.ledger)||!object(raw.levels))fail();
  const evidence=earned(g);
  for(const [key,value]of Object.entries(raw.ledger))if(!Object.hasOwn(rewards,key)||value!==rewards[key]||!evidence[key])fail();
  function checkLevels(levels){
   if(!object(levels)||Object.keys(levels).length!==ids.length||Object.keys(levels).some(id=>!ids.includes(id)))fail();
   for(const n of nodes){const v=levels[n.id];if(!Number.isInteger(v)||v<0||v>n.max)fail();if(v&&n.prerequisite&&!levels[n.prerequisite])fail();if(v&&downstream.includes(n.id)&&!(g.journey?.realm>=1))fail();}
   if(spent(levels)>total(raw))fail();
   if(levels.F0&&!(g.training>=1))fail();
   if(levels.C0&&!(g.training>=2||g.worldGrowth?.murim?.mode==='focus'||g.worldGrowth?.reality?.mode==='focus'))fail();
   if((levels.F4||levels.C5)&&!g.laterStory?.dualBreath)fail();
  }
  checkLevels(raw.levels);
  if(raw.adapted!==null){if(!object(raw.adapted)||Object.keys(raw.adapted).some(k=>k!=='levels'))fail();checkLevels(raw.adapted.levels);}
  const clean={version:1,ledger:{...raw.ledger},levels:{...raw.levels},adapted:raw.adapted===null?null:{levels:{...raw.adapted.levels}}};
  g.worldState.passive=clean;return sync(g);
 }
 function active(g,world){const s=sync(g);if(world==='reality'&&g.worldState.resonance)return {...empty(),...g.worldState.resonance.common,F0:g.training>=1?1:0,C0:g.training>=2||g.worldGrowth?.reality?.mode==='focus'||g.worldGrowth?.murim?.mode==='focus'?1:0,F4:g.laterStory?.dualBreath?1:0,C5:g.laterStory?.dualBreath?1:0};return world==='reality'?{...(s.adapted?.levels||empty()),F4:g.laterStory?.dualBreath?1:0,C5:g.laterStory?.dualBreath?1:0}:s.levels;}
 function bonus(g,world=worldOf(g)){const l=active(g,world),focus=g.worldGrowth?.[world]?.mode==='focus';return {hp:6*(focus?l.C4:l.F5),mp:4*(focus?l.C1:l.F1)};}
 function effects(g,world=worldOf(g)){
  const l=active(g,world),focus=g.worldGrowth?.[world]?.mode==='focus',baseFlow=world==='reality'||l.F0,baseFocus=world==='reality'||l.C0;
  return {recovery:!focus&&baseFlow?3+.5*l.F2:0,focusMultiplier:focus&&baseFocus?[1.2,1.25,1.3,1.35][l.C2]:1,focusCost:focus&&baseFocus?6-l.C3:0,discount:focus?0:l.F3,deepened:!!(focus?l.C5:l.F4)};
 }
 function safe(g){return worldOf(g)==='murim'&&g.area==='village'&&!g.trial&&!g.enemies?.some(e=>e.hp>0);}
 function preserve(g,change){const before=typeof g.stats==='function'?g.stats():null;const hp=before?.hp>0?Math.max(0,Math.min(1,g.player.hp/before.hp)):null,mp=before?.mp>0?Math.max(0,Math.min(1,g.player.mp/before.mp)):null;change();if(before){const after=g.stats();if(hp!==null)g.player.hp=hp*after.hp;if(mp!==null)g.player.mp=mp*after.mp;}}
 function reason(g,n,s){if(n.free)return n.id==='F4'||n.id==='C5'?'6장 원리 체득 후 개방':n.id==='F0'?'첫 운기 체득 필요':'집중 원리 체험 필요';if(s.levels[n.id]>=n.max)return '최대 단계';if(n.prerequisite&&!s.levels[n.prerequisite])return nodes.find(x=>x.id===n.prerequisite).name+' 1단계 필요';if(downstream.includes(n.id)&&!(g.journey?.realm>=1))return '이류 도달 필요';if(total(s)-spent(s.levels)<1)return '포인트 부족';if(!safe(g))return '무림 안전 거점에서 변경 가능';return '';}
 function upgrade(g,id){const s=sync(g),n=nodes.find(n=>n.id===id);if(!n||n.free||reason(g,n,s))return false;preserve(g,()=>s.levels[id]++);return true;}
 function reset(g){const s=sync(g);if(!safe(g))return false;preserve(g,()=>{for(const n of nodes)if(!n.free)s.levels[n.id]=0;});return true;}
 function settle(g){const s=sync(g);if(g.worldState.resonance)return null;preserve(g,()=>{s.adapted={levels:{...s.levels}};});return s.adapted;}
 function value(id,l){switch(id){case 'F0':return l?'추가 회복 +3/초':'미체득';case 'F1':case 'C1':return '최대 자원 +'+4*l;case 'F2':return '추가 회복 '+(3+.5*l).toFixed(1)+'/초';case 'F3':return '일반 유료 기술 비용 −'+l;case 'F4':return l?'연계 후 비용 −6 · 재생 6초 억제':'미체득';case 'F5':case 'C4':return '최대 체력 +'+6*l;case 'C0':return l?'1.4초 준비 · 1.2배 · 자원 6':'미체득';case 'C2':return '준비 일격 '+(1.2+.05*l).toFixed(2)+'배';case 'C3':return '준비 일격 자원 '+(6-l);case 'C5':return l?'준비 일격 후 기연 · 재생 6초 억제':'미체득';}}
 function describe(g,world=worldOf(g)){const s=sync(g);return {world,mode:g.worldGrowth?.[world]?.mode||'flow',adapted:!!s.adapted,total:total(s),spent:spent(s.levels),available:total(s)-spent(s.levels),nodes:nodes.map(n=>{const level=s.levels[n.id],why=reason(g,n,s);return {...n,level,cost:n.free||level===n.max?0:1,status:level===n.max?'complete':why?'locked':'available',current:value(n.id,level),next:value(n.id,Math.min(n.max,level+1)),reason:level===n.max?'':why,prerequisites:[n.prerequisite,...(downstream.includes(n.id)?['이류']:[])].filter(Boolean),appliedLevel:active(g,world)[n.id],appliedCurrent:value(n.id,active(g,world)[n.id])};})};}
 return {state,sync,validate,bonus,effects,upgrade,reset,settle,describe,nodes,empty,value,rewards,earned,spent};
});
