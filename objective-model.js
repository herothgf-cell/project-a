/* Read-only objective projection: one destination for every navigation surface. */
(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./progression.js'):root.Progression,n?require('./presentation.js'):root.Presentation,n?require('./dungeon-entry.js'):root.DungeonEntry);if(n)module.exports=api;else root.ObjectiveModel=api;})(globalThis,function(api,Presentation,Dungeon){
 'use strict';const {AREAS}=api;
 function points(g,area){const base=area===g.area?g.points():AREAS[area]?.points||[];return g.worldGrowth?Dungeon.points(g,base,area):base;}
 function edges(g,area){return points(g,area).flatMap(p=>{if(g.worldGrowth&&p.kind==='dungeon-entry')return Dungeon.entries.filter(e=>e.hub===area&&Dungeon.evaluate(g,e.id).canEnter).map(e=>({area,pointId:p.id,label:p.label+' → '+AREAS[e.id].name+' 선택',to:e.id,destinationId:e.id}));let to=p.to;if(p.id==='portal')to=area==='city'?'village':'city';if(p.kind==='exit')to=AREAS[area].world==='현실'?'city':'village';if(p.id==='archiveGate')to='archive';if(p.id==='stationGate')to='station';if(!to||!AREAS[to]||p.need>g.progress)return [];return [{area,pointId:p.id,label:p.label,to}];});}
 function routeTo(g,area,id){const queue=[{area:g.area,route:[]}],seen=new Set();while(queue.length){const q=queue.shift();if(seen.has(q.area))continue;seen.add(q.area);if(q.area===area){const p=points(g,area).find(p=>p.id===id);return p?[...q.route,{area,pointId:id,label:p.label}]:q.route;}for(const e of edges(g,q.area))queue.push({area:e.to,route:[...q.route,e]});}return [];}
 function resolve(g,track=g.guideActive?'explore':'story'){
  const base=g.objective(),s=g.journey,phase=s.phase||((g.worldState?.cycleOne?.invited)?1:0);let o={kind:base.category==='현장 의뢰'?'contract':'story',chapter:base.chapter,purpose:base.title,condition:base.text,currentAction:base.text,status:'progress',target:base.target||null,rewards:[],route:[]};
  const navigate=(area,id)=>{o.route=routeTo(g,area,id);o.target=points(g,g.area).find(p=>p.id===o.route[0]?.pointId)||null;};
  if(g.introActive||base.priority||o.kind==='contract')return finish(o,g);
  if(g.laterObjective){const later=g.laterObjective();if(later){o={...o,...later};if(later.destination)navigate(later.destination.area,later.destination.id);return finish(o,g);}}
  if(g.worldGrowth&&(phase>=1&&phase<=4||g.area==='archive')){
   o.kind='story';o.chapter=5;o.purpose='공명 관측소 현장 확보';
   if(phase===1||phase===2){o.status='briefing';o.condition='서린에게 현장 임무 받기';o.currentAction='현실 기지의 서린과 대화해 공명 관측소 임무를 받으세요.';navigate('city','warden');}
   else if(phase===3){o.status='combat';o.condition='적에게 실제 Q 대응 또는 R 명중 + 우두머리 제압';o.currentAction=s.measured?'대응 성공 · 남은 위협과 우두머리를 제압하세요.':'적의 공격 예고에 Q로 대응하거나 R을 적에게 명중시키고, 우두머리를 제압하세요.';if(g.area!=='station')navigate('station',null);}
   else if(phase===4){o.status='report';o.condition='서린에게 확보 결과 보고';o.currentAction='현실 기지의 서린에게 현장 확보를 보고하세요.';navigate('city','warden');}
   else{o.status='return-story';o.currentAction='청운촌으로 돌아가 현재 임무를 이어가세요.';o.target=points(g,g.area).find(p=>p.id==='exit');}
   return finish(o,g);
  }
  if(!g.worldGrowth&&track==='explore'&&phase!==1&&phase!==2){const hint=Presentation.guide(g);o={...o,kind:'explore',purpose:'스킬 진화 · 환서정의 원리 연구',condition:'현재 계열의 단서를 조사하고 새 운용을 발견하세요.',currentAction:hint.text,target:hint.target,status:hint.stage};if(g.worldGrowth&&g.area!=='archive'){navigate('archive',null);o.currentAction='경계석과 무림 거점의 통합 입구를 통해 환서정을 선택하세요.';}return finish(o,g);}
  if(phase===1||phase===2){
   const family=g.fate.path,equipped=family&&s.known.includes(s.selected[family]),matching=s.known.filter(k=>k.startsWith(family+'-'));
   o.chapter=5;o.purpose='첫 스킬 진화 · 무공의 원리 체득';
   if(equipped){o.purpose='현실 기지의 서린에게 조사 결과 보고';o.status='report';o.condition='서린과 대화해 관측소 출입 확인';o.currentAction='해석 장착 완료 · 서린에게 보고하세요.';navigate('city','warden');}
   else if(!family||s.known.length&&!matching.length){o.status='family-required';o.condition='발견한 기록은 보존됩니다. 해당 기연을 계승해야 장착할 수 있습니다.';o.currentAction=family?'현재 계열의 물건을 조사하거나, 안전 거점에서 계승 계열을 선택하세요.':'성장 → 무공에서 계승 가능 여부를 확인하세요. 미발견 계열은 본편의 비경에서 시험할 수 있습니다.';navigate('village','master');}
   else if(matching.length){o.status='equip';o.condition='성장 → 무공에서 현재 계열의 발견한 해석 장착';o.currentAction=o.condition;o.target=null;}
   else {o.status='discover';o.condition='관찰과 실험으로 현재 계열의 해석 발견';o.currentAction=g.area==='archive'?Presentation.guide(g,family).text:'환서정으로 이동해 현재 계열의 물건을 살펴보세요.';if(g.area==='archive')o.target=Presentation.guide(g,family).target;else navigate('archive',null);}
   return finish(o,g);
  }
  if(phase===3){o.purpose='공명 관측소에서 해석의 실제 효과 확인';if(!s.facts.some(f=>f.id==='station-sense')){o.status='observe';o.currentAction='관측 기록 가까이에서 기감으로 조사';navigate('station','station-lens');}else if(!s.measured){o.status='reproduce';o.currentAction='장착한 해석의 실제 효과를 적에게 재현';if(g.area!=='station')navigate('station','station-lens');else if(!g.enemies.some(e=>e.hp>0))o.target=g.points().find(p=>p.id==='station-reset');}else{o.status='combat';o.currentAction='재현 완료 · 남은 위협을 처치하세요.';}return finish(o,g);}
  if(phase===4){o.purpose='현실 기지의 서린에게 관측 결과 보고';o.status='report';navigate('city','warden');return finish(o,g);}
  if(g.area==='archive'&&!phase){const proxy=Object.create(g);proxy.area='village';const story=proxy.objective();o={...o,purpose:story.text,condition:'스토리의 환서정 초대를 받은 뒤 첫 스킬 진화 진행',currentAction:'청운촌으로 돌아가 연화의 기록을 백련에게 전하고 환서정 초대를 받으세요.',target:g.points().find(p=>p.id==='exit'),status:'return-story',chapter:story.chapter};o.route=[{area:'archive',pointId:'exit',label:'청운촌으로 귀환'},...(story.target?[{area:'village',pointId:story.target.id,label:story.target.label}]:[])];}
  if(g.worldGrowth){const c=g.chapter4?.phase||0,f=g.fate?.stage||0,report=c?c===3?'city':null:f?f===5?'city':null:({3:'village',4:'city',6:'city',9:'village',10:'city',12:'city'})[g.progress];if(report){o.status='report';navigate(report,report==='city'?'warden':'master');}else if(AREAS[g.area]?.safe){const destination=Dungeon.currentDestination(g);if(destination){navigate(destination,null);if(o.route.length)o.currentAction=o.route.map(r=>r.label).join(' → ');}}}
  return finish(o,g);
 }
 function finish(o,g){if(!o.route.length&&o.target)o.route=[{area:g.area,pointId:o.target.id,label:o.target.label||o.target.name}];return {...o,title:o.purpose,text:o.currentAction};}
 return {resolve,routeTo};
});
