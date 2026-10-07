/* One-way Murim achievement ledger. Balances are derived, never independently mutable. */
(function(root,f){const api=f(typeof module==='object'&&module.exports?require('./passive-growth.js'):root.PassiveGrowth);if(typeof module==='object'&&module.exports)module.exports=api;else root.BoundaryResonance=api;})(globalThis,function(Passive){
 'use strict';
 const families=['ripple','echo','seal'],goals={survival:'버티는 힘',sustain:'반복하는 기술',precision:'정확한 대응'};
 const familyNames={ripple:'파문',echo:'잔영',seal:'봉인'};
 const common=Passive.nodes.filter(n=>!n.free);
 const skillNodes=families.flatMap(f=>[
  {id:f+'-window',family:f,name:{ripple:'안정 흡수',echo:'빠른 재정비',seal:'지속 억제'}[f],branch:true,description:{ripple:'Q 흡수 판정 0.7 → 0.9초',echo:'Q 재사용 4 → 3.5초',seal:'Q 억제 4 → 5초 · 정박 해석은 6초 유지'}[f]},
  {id:f+'-economy',family:f,name:'절약 운용',branch:true,description:'Q 기본 기력 비용 −2 · 최종 비용 하한 1'},
  {id:f+'-follow',family:f,name:'후속 정돈',branch:false,description:'R 기본 기력 비용 −2 · 최종 비용 하한 1'}
 ]);
 const clone=v=>JSON.parse(JSON.stringify(v));
 const zero=()=>({attack:0,hp:0,mp:0});
 const initial=()=>({version:1,grants:[],legacy:[],allocation:zero(),common:Object.fromEntries(common.map(n=>[n.id,0])),learned:[],selected:Object.fromEntries(families.map(f=>[f,null])),goal:null,notified:0});
 const state=g=>g.worldState?.resonance;
 const inherited=(g,f)=>!!g.revision?.inherited?.includes(f);
 function catalog(g){
  const w=g.worldGrowth?.murim,rows=[];
  const add=(id,name,crystal,seal,eligible)=>rows.push({id,name,crystal,seal,eligible:!!eligible});
  add('inherit:first','첫 기연 영구 계승',8,0,g.revision?.inherited?.length);
  for(const n of [5,10]){
   add('murim-level:'+n,'무림 레벨 '+n,1,0,w?.level>=n);
   for(const f of families)add('murim-mastery:'+f+':'+n,'무림 '+familyNames[f]+' 숙련 '+n,1,0,w?.mastery?.[f]>=n);
  }
  add('murim-realm:1','첫 무림 경지',4,0,g.journey?.realm);
  const evidence=Passive.earned(g),names={training:'백련의 기본기',realm:'첫 이류 돌파',chapter4:'연화 귀환',chapter5:'두 세계 진화 증명',six:'원리 체득',seven:'지역망 폐쇄'};
  for(const [key,n]of Object.entries(Passive.rewards))add('practice:'+key,names[key],0,n,evidence[key]);
  for(const f of families)add('art:'+f,familyNames[f]+' 영구 체득',0,1,inherited(g,f));
  for(const area of ['forest','ruins','returnPass'])for(const kind of Object.keys(goals))add('challenge:'+area+':'+kind,({forest:'흑풍 죽림',ruins:'월영 폐사',returnPass:'귀환 통로'}[area])+' · '+goals[kind],1,1,g.worldState?.resonanceChallenges?.completed?.includes(area+':'+kind));
  return rows;
 }
 function grant(g,id){const s=state(g),row=catalog(g).find(x=>x.id===id);if(!s||!row?.eligible||s.grants.includes(id)||s.legacy.includes(id))return false;s.grants.push(id);return true;}
 function sync(g){if(!g.worldGrowth)return null;g.worldState||={};g.worldState.resonance||=initial();for(const row of catalog(g))if(row.eligible)grant(g,row.id);return state(g);}
 function balance(g){const s=state(g);if(!s)return {crystal:0,seal:0};const paid=new Set(s.grants),earned=catalog(g).filter(x=>paid.has(x.id));return {crystal:earned.reduce((n,x)=>n+x.crystal,0)-Object.values(s.allocation).reduce((a,b)=>a+b,0),seal:earned.reduce((n,x)=>n+x.seal,0)-Object.values(s.common).reduce((a,b)=>a+b,0)-s.learned.length};}
 function bonus(g){const a=state(g)?.allocation||zero();return {attack:a.attack,hp:6*a.hp,mp:3*a.mp};}
 function legacyBonus(g){const ids=state(g)?.legacy||[],rows=g.worldState?.achievements?.results||[];return ids.reduce((out,id)=>{const v=rows.find(x=>x.id===id)?.rewardVersion||1,b=id==='inherit:first'?{hp:v===2?24:0,mp:0,attack:v===2?4:0}:id.startsWith('murim-level:')?{hp:5,mp:0,attack:0}:id.startsWith('murim-mastery:')?{hp:0,mp:0,attack:1}:id==='murim-realm:1'?{hp:10,mp:5,attack:0}:zero();for(const k of Object.keys(out))out[k]+=b[k];return out;},zero());}
 function limits(g){const stage=g.journey?.phase>=4?2:g.worldState?.reports?.reported?.includes('first-response')||g.fate?.stage>=6?1:0,b=legacyBonus(g);return {total:[10,20,30][stage],attack:[4,8,12][stage],occupied:Math.ceil(b.attack+b.hp/6+b.mp/3),legacyAttack:b.attack,next:stage===0?'현실 초동 대응 성과를 서린에게 보고하세요.':stage===1?'5장 관측소 실전을 완료하세요.':'현재 공명 투자 최종 단계'};}
 const safe=g=>g.area==='city'&&!g.introActive&&!g.trial&&g.player?.hp>0&&!g.enemies?.some(e=>e.hp>0);
 function preserve(g,change){const b=g.stats(),hp=g.player.hp/b.hp,mp=g.player.mp/b.mp;change();const a=g.stats();g.player.hp=Math.min(a.hp,Math.max(0,hp*a.hp));g.player.mp=Math.min(a.mp,Math.max(0,mp*a.mp));}
 const allocationValid=a=>a&&Object.keys(a).length===3&&['attack','hp','mp'].every(k=>Number.isInteger(a[k])&&a[k]>=0&&a[k]<=30);
 function allocate(g,a){const s=state(g);if(!s||!safe(g)||!allocationValid(a)||Object.keys(s.allocation).some(k=>a[k]<s.allocation[k]))return false;const used=Object.values(a).reduce((x,y)=>x+y,0),old=Object.values(s.allocation).reduce((x,y)=>x+y,0),cap=limits(g);if(used>balance(g).crystal+old||used+cap.occupied>Math.max(cap.total,cap.occupied)||a.attack+cap.legacyAttack>Math.max(cap.attack,cap.legacyAttack))return false;if(JSON.stringify(a)===JSON.stringify(s.allocation))return false;preserve(g,()=>{s.allocation={attack:a.attack,hp:a.hp,mp:a.mp};});return true;}
 function levels(g){const s=state(g);if(!s)return null;return {...Passive.empty(),...s.common,F0:g.training>=1?1:0,C0:g.training>=2||g.worldGrowth?.reality?.mode==='focus'||g.worldGrowth?.murim?.mode==='focus'?1:0,F4:g.laterStory?.dualBreath?1:0,C5:g.laterStory?.dualBreath?1:0};}
 function learnedR(g){return !!(g.worldState?.growthArc?.learnedR||g.worldState?.growthArc?.legacy);}
 function condition(g,id){const s=state(g),n=common.find(x=>x.id===id),k=skillNodes.find(x=>x.id===id);if(!s)return '공명 기록이 없습니다.';if(!n&&!k)return '알 수 없는 강화';
  if(n){const l=levels(g);if(s.common[id]>=n.max)return '최대 단계';if(n.prerequisite&&!l[n.prerequisite])return '선행 원리/노드 체득 필요';if(['F3','F5','C3','C4'].includes(id)&&!g.journey?.realm)return '이류 도달 필요';}
  if(k){if(s.learned.includes(id))return '해금 완료';if(!inherited(g,k.family)||!g.worldState?.achievements?.settled?.includes('inherit:'+k.family))return '해당 계열 체득 후 현실 귀환 필요';if(!k.branch&&(!learnedR(g)||!s.learned.some(x=>x===k.family+'-window'||x===k.family+'-economy')))return 'Q 운용 하나 해금 + R 체득 필요';}
  return '';
 }
 function reason(g,id){return condition(g,id)||(!safe(g)?'현실 안전 거점에서 변경 가능':balance(g).seal<1?'무공 각인 부족':'');}
 function upgrade(g,id){if(reason(g,id))return false;const s=state(g),n=common.find(x=>x.id===id);preserve(g,()=>{if(n)s.common[id]++;else{s.learned.push(id);const k=skillNodes.find(x=>x.id===id);if(k.branch)s.selected[k.family]=id;}});return true;}
 function select(g,family,id){const s=state(g);if(!s||!safe(g)||!families.includes(family)||!skillNodes.some(n=>n.id===id&&n.family===family&&n.branch)||!s.learned.includes(id)||s.selected[family]===id)return false;s.selected[family]=id;return true;}
 function reset(g,kind){const s=state(g);if(!s||!safe(g)||kind!=='skills')return false;if(!s.learned.length&&!Object.values(s.common).some(Boolean))return false;preserve(g,()=>{s.common=initial().common;s.learned=[];s.selected=initial().selected;});return true;}
 function setGoal(g,goal){const s=state(g);if(!s||goal!==null&&!Object.hasOwn(goals,goal))return false;s.goal=goal;return true;}
 function effects(g,family){const s=state(g),branch=s?.selected?.[family],window=branch===family+'-window';return {discountQ:branch===family+'-economy'?2:0,discountR:s?.learned.includes(family+'-follow')?2:0,guardWindow:family==='ripple'&&window?.9:.7,echoCool:family==='echo'&&window?3.5:4,suppress:family==='seal'&&window?5:4};}
 function migrate(g){if(state(g))return validate(g);const s=initial();g.worldState.resonance=s;const valid=new Set(catalog(g).filter(x=>x.crystal&&x.eligible).map(x=>x.id));s.legacy=(g.worldState.achievements?.settled||[]).filter(id=>valid.has(id));for(const n of common)s.common[n.id]=g.worldState.passive?.adapted?.levels?.[n.id]||0;sync(g);s.notified=s.grants.length;return validate(g);}
 function validate(g){const s=state(g),fail=()=>{throw Error('경계공명 저장 정보 오류');},object=x=>x&&typeof x==='object'&&!Array.isArray(x),sameKeys=(x,keys)=>object(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
  if(!sameKeys(s,Object.keys(initial()))||s.version!==1||!allocationValid(s.allocation)||!sameKeys(s.common,common.map(n=>n.id))||!sameKeys(s.selected,families)||s.goal!==null&&!Object.hasOwn(goals,s.goal))fail();
  const rows=catalog(g),eligible=new Map(rows.filter(x=>x.eligible).map(x=>[x.id,x]));
  for(const key of ['grants','legacy','learned'])if(!Array.isArray(s[key])||s[key].length>40||new Set(s[key]).size!==s[key].length||s[key].some(x=>typeof x!=='string'))fail();
  if(s.grants.some(id=>!eligible.has(id)||s.legacy.includes(id))||s.legacy.some(id=>!eligible.get(id)?.crystal||!g.worldState?.achievements?.settled?.includes(id)))fail();
  if(!Number.isInteger(s.notified)||s.notified<0||s.notified>s.grants.length)fail();
  const l=levels(g);for(const n of common){const v=s.common[n.id];if(!Number.isInteger(v)||v<0||v>n.max||v&&n.prerequisite&&!l[n.prerequisite]||v&&['F3','F5','C3','C4'].includes(n.id)&&!g.journey?.realm)fail();}
  for(const id of s.learned){const n=skillNodes.find(x=>x.id===id);if(!n||!inherited(g,n.family)||!g.worldState?.achievements?.settled?.includes('inherit:'+n.family)||!n.branch&&(!learnedR(g)||!s.learned.some(x=>x===n.family+'-window'||x===n.family+'-economy')))fail();}
  for(const f of families){const id=s.selected[f];if(id!==null&&(!s.learned.includes(id)||!skillNodes.some(n=>n.id===id&&n.family===f&&n.branch)))fail();}
  const b=balance(g),cap=limits(g),used=Object.values(s.allocation).reduce((a,b)=>a+b,0);if(b.crystal<0||b.seal<0||used+cap.occupied>Math.max(cap.total,cap.occupied)||s.allocation.attack+cap.legacyAttack>Math.max(cap.attack,cap.legacyAttack))fail();
  g.worldState.resonance=clone(s);return state(g);
 }
 function describe(g){const s=state(g);return {goal:s?.goal??null,balance:balance(g),limits:limits(g),bonus:bonus(g),safe:safe(g),sources:catalog(g).filter(x=>s?.grants.includes(x.id)),legacy:legacyBonus(g),allocation:{...(s?.allocation||zero())},common:common.map(n=>({...n,rank:s?.common[n.id]||0,current:Passive.value(n.id,s?.common[n.id]||0),next:Passive.value(n.id,Math.min(n.max,(s?.common[n.id]||0)+1)),reason:reason(g,n.id)})),skills:skillNodes.map(n=>({...n,learned:!!s?.learned.includes(n.id),selected:s?.selected[n.family]===n.id,reason:reason(g,n.id)}))};}
 return {families,familyNames,goals,common,skillNodes,initial,state,catalog,sync,grant,balance,bonus,legacyBonus,limits,safe,allocate,levels,learnedR,reason,upgrade,select,reset,setGoal,effects,migrate,validate,describe};
});
