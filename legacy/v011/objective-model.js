/* Read-only objective projection: one destination for every navigation surface. */
(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./progression.js'):root.Progression,n?require('./presentation.js'):root.Presentation);if(n)module.exports=api;else root.ObjectiveModel=api;})(globalThis,function(api,Presentation){
 'use strict';const {AREAS}=api;
 function points(g,area){return area===g.area?g.points():AREAS[area]?.points||[];}
 function edges(g,area){return points(g,area).flatMap(p=>{let to=p.to;if(p.id==='portal')to=area==='city'?'village':'city';if(p.kind==='exit')to=AREAS[area].world==='현실'?'city':'village';if(p.id==='archiveGate')to='archive';if(p.id==='stationGate')to='station';if(!to||!AREAS[to]||p.need>g.progress)return [];return [{area,pointId:p.id,label:p.label,to}];});}
 function routeTo(g,area,id){const queue=[{area:g.area,route:[]}],seen=new Set();while(queue.length){const q=queue.shift();if(seen.has(q.area))continue;seen.add(q.area);if(q.area===area){const p=points(g,area).find(p=>p.id===id);return p?[...q.route,{area,pointId:id,label:p.label}]:q.route;}for(const e of edges(g,q.area))queue.push({area:e.to,route:[...q.route,e]});}return [];}
 function resolve(g,track=g.guideActive?'explore':'story'){
  const base=g.objective(),s=g.journey,phase=s.phase;let o={kind:base.category==='현장 의뢰'?'contract':'story',chapter:base.chapter,purpose:base.title,condition:base.text,currentAction:base.text,status:'progress',target:base.target||null,rewards:[],route:[]};
  const navigate=(area,id)=>{o.route=routeTo(g,area,id);o.target=points(g,g.area).find(p=>p.id===o.route[0]?.pointId)||null;};
  if(g.introActive||base.priority||o.kind==='contract')return finish(o,g);
  if(g.laterObjective){const later=g.laterObjective();if(later){o={...o,...later};if(later.destination)navigate(later.destination.area,later.destination.id);return finish(o,g);}}
  if(track==='explore'&&phase!==1&&phase!==2){const hint=Presentation.guide(g);return finish({...o,kind:'explore',purpose:'선택 탐험 · 환서정의 흔적 살펴보기',condition:'원할 때 본편 추적으로 돌아갈 수 있습니다.',currentAction:hint.text,target:hint.target,status:hint.stage},g);}
  if(phase===1||phase===2){
   const family=g.fate.path,equipped=family&&s.known.includes(s.selected[family]),matching=s.known.filter(k=>k.startsWith(family+'-'));
   o.chapter=5;o.purpose='현실 기지의 서린에게 조사 결과 보고';
   if(equipped){o.status='report';o.condition='서린과 대화해 관측소 출입 확인';o.currentAction='해석 장착 완료 · 서린에게 보고하세요.';navigate('city','warden');}
   else if(!family||s.known.length&&!matching.length){o.status='family-required';o.condition='발견한 기록은 보존됩니다. 해당 기연을 계승해야 장착할 수 있습니다.';o.currentAction=family?'현재 계열의 물건을 조사하거나, 안전 거점에서 계승 계열을 선택하세요.':'성장 → 무공에서 계승 가능 여부를 확인하세요. 미발견 계열은 본편의 비경에서 시험할 수 있습니다.';navigate('village','master');}
   else if(matching.length){o.status='equip';o.condition='성장 → 무공에서 현재 계열의 발견한 해석 장착';o.currentAction=o.condition;o.target=null;}
   else {o.status='discover';o.condition='관찰과 실험으로 현재 계열의 해석 발견';o.currentAction=g.area==='archive'?Presentation.guide(g,family).text:'환서정으로 이동해 현재 계열의 물건을 살펴보세요.';if(g.area==='archive')o.target=Presentation.guide(g,family).target;else navigate('archive',null);}
   return finish(o,g);
  }
  if(phase===3){o.purpose='공명 관측소에서 해석의 실제 효과 확인';if(!s.facts.some(f=>f.id==='station-sense')){o.status='observe';o.currentAction='관측 기록 가까이에서 기감으로 조사';navigate('station','station-lens');}else if(!s.measured){o.status='reproduce';o.currentAction='장착한 해석의 실제 효과를 적에게 재현';if(g.area!=='station')navigate('station','station-lens');else if(!g.enemies.some(e=>e.hp>0))o.target=g.points().find(p=>p.id==='station-reset');}else{o.status='combat';o.currentAction='재현 완료 · 남은 위협을 처치하세요.';}return finish(o,g);}
  if(phase===4){o.purpose='현실 기지의 서린에게 관측 결과 보고';o.status='report';navigate('city','warden');return finish(o,g);}
  if(g.area==='archive'&&!phase){const proxy=Object.create(g);proxy.area='village';const story=proxy.objective();o={...o,purpose:story.text,condition:'선택 탐험을 끝내고 본편 목표 진행',currentAction:'환서정은 선택 탐험입니다. 출구를 통해 본편으로 돌아갈 수 있습니다.',target:g.points().find(p=>p.id==='exit'),status:'return-story',chapter:story.chapter};o.route=[{area:'archive',pointId:'exit',label:'청운촌으로 귀환'},...(story.target?[{area:'village',pointId:story.target.id,label:story.target.label}]:[])];}
  return finish(o,g);
 }
 function finish(o,g){if(!o.route.length&&o.target)o.route=[{area:g.area,pointId:o.target.id,label:o.target.label||o.target.name}];return {...o,title:o.purpose,text:o.currentAction};}
 return {resolve,routeTo};
});
