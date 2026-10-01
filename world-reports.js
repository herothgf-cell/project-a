(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.WorldReports=api;})(globalThis,function(){
 'use strict';const ids=['yeonhwa-stranded','yeonhwa-rescued','yeonhwa-returned','seven-pass-open','seven-dock-stable'];
 const state=g=>g.worldState.reports||(g.worldState.reports={observed:[],reported:[]});
 function condition(g,id){return id==='yeonhwa-stranded'?g.area==='returnPass'&&g.chapter4.phase>0:id==='yeonhwa-rescued'?g.chapter4.rescued:id==='yeonhwa-returned'?g.area==='village'&&g.chapter4.rescued&&g.nearestPoint()?.id==='returned-yeonhwa':id==='seven-pass-open'?g.laterStory?.passOpened:id==='seven-dock-stable'?g.laterStory?.dockStabilized:false;}
 function observe(g,id){const s=state(g);if(!ids.includes(id)||!condition(g,id)||s.observed.includes(id))return false;s.observed.push(id);return true;}
 function report(g,id){const s=state(g),npc=id==='seven-dock-stable'?'master':'warden';if(g.nearestPoint()?.id!==npc||!s.observed.includes(id)||s.reported.includes(id))return false;s.reported.push(id);return true;}
 function collect(g){for(const id of ids)if(id!=='yeonhwa-returned')observe(g,id);}
 function dialogue(g,id,result){if(!result||result.type!=='dialog')return result;collect(g);const s=state(g);let text,title,portrait=result.portrait;
  if(id==='returned-yeonhwa')observe(g,'yeonhwa-returned');
  if(id==='warden'&&g.chapter4.phase>0&&g.journey.phase===0){
   title='서린 · 현장 신호와 당신의 보고';
   if(!s.observed.includes('yeonhwa-stranded')&&!s.observed.includes('yeonhwa-rescued'))text='현실 부두에서 낯선 신호가 반복돼. 저편의 상황은 아직 몰라. 청운 귀환로를 직접 살펴보고 알려 줘.';
   else if(s.observed.includes('yeonhwa-rescued')&&!s.reported.includes('yeonhwa-rescued')){report(g,'yeonhwa-rescued');text='윤서: 귀환로에 고립된 연화를 도왔어. 돌아갈 길을 열었고, 이제 이쪽 부두를 확인하려고.\n서린: 직접 전해 줘서 고마워. 네 보고와 여기서 관측한 흔적을 비교할게.';}
   else text='네가 보고한 귀환로의 변화와 부두의 기록을 비교하고 있어. 연화의 이후 상황은 직접 확인한 뒤 알려 줘.';
   if(s.observed.includes('yeonhwa-returned')&&!s.reported.includes('yeonhwa-returned')){report(g,'yeonhwa-returned');text='윤서: 청운촌에서 연화를 만났어. 직접 돌아와 가게를 열었더라.\n서린: 네가 확인하고 전해 준 거구나. 기록에 남겨 둘게.';}
  }
  if(id==='master'&&g.laterStory?.seven>0&&g.laterStory.dockStabilized){report(g,'seven-dock-stable');title='백련 · 직접 전한 방어선의 변화';text='윤서: 현실 부두의 흐름을 안정시켰습니다. 넓어진 안전 구역으로 사람들이 대피했어요.\n백련: 네가 직접 비교해 전해 주니 이쪽 방호선도 바꿀 수 있겠구나. 이제 천흔 중심으로 가거라.';}
  return text?{...result,title,text,portrait}:result;
 }
 function validate(g){const s=state(g);for(const key of ['observed','reported'])if(!Array.isArray(s[key])||s[key].length>ids.length||new Set(s[key]).size!==s[key].length||s[key].some(id=>!ids.includes(id)||key==='reported'&&!s.observed.includes(id)))throw Error('세계 보고 기록 오류');if(s.observed.includes('yeonhwa-rescued')&&!g.chapter4.rescued||s.observed.includes('yeonhwa-returned')&&!g.chapter4.rescued||s.observed.includes('seven-pass-open')&&!g.laterStory?.passOpened||s.observed.includes('seven-dock-stable')&&!g.laterStory?.dockStabilized)throw Error('확인하지 않은 사건 보고');g.worldState.reports={observed:[...s.observed],reported:[...s.reported]};}
 return {state,observe,report,collect,dialogue,validate};
});
