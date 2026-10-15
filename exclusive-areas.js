(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.ExclusiveAreas=api;})(globalThis,function(){
 'use strict';
 function install(api){const a=api.AREAS;
  const safe=(id,name,world,base)=>{a[id]={...a[base],name,sub:'쌍계 · 홀로 건너는 사람',world,safe:true,blocks:[],points:[],positions:[],spawn:[600,535]};};
  safe('home','윤서의 자취방','현실','city');safe('shrine','폐사당 · 왕래의 표식','무림','village');safe('yeoul','여울장 · 새벽객점','무림','village');
  const names={recovery:'균열 회수 현장',southernRoad:'여울장 남쪽 길',guardSite:'현실 경계 근무지',northRoad:'북쪽 조사로',experimentSite:'균열 계측 현장',outerArray:'정맥진 외곽',bypass:'정도관 우회로',supply:'정맥진 공급소',prison:'서하의 감금 장소',circulation:'정맥진 순환 장치',arrayHeart:'정맥진 중심',riftFinal:'맥갑수 출현 현장'};
  for(const [id,name]of Object.entries(names)){const modern=['recovery','guardSite','experimentSite','riftFinal'].includes(id);a[id]={...a[modern?'rift':'forest'],name,sub:'이야기 임무 · 낮은 전투 난이도',world:modern?'현실':'무림',safe:false,blocks:[],points:[],spawn:[600,700],positions:[[680,700],[820,700],[760,580]],hp:35,bossHp:60,damage:5,mob:'현장 위협',boss:id==='riftFinal'?'맥갑수':id==='arrayHeart'?'차도겸의 압박':'전방 위협',mobKind:'bandit',bossKind:'guardian'};}
 }
 return {install};
});
