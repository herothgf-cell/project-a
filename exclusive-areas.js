(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.ExclusiveAreas=api;})(globalThis,function(){
 'use strict';
 function install(api){const a=api.AREAS;
  const safe=(id,name,world,base)=>{a[id]={...a[base],name,sub:'쌍계 · 홀로 건너는 사람',world,safe:true,blocks:[],points:[],positions:[],spawn:[300,700]};};
  safe('home','윤서의 자취방','현실','city');safe('shrine','폐사당 · 왕래의 표식','무림','village');safe('yeoul','여울장 · 새벽객점','무림','village');
  safe('clinic','골목 진료소','현실','city');safe('inn','새벽객점 · 담희의 장부','무림','village');safe('songrim','송림 고개 · 갈라진 바위','무림','forest');
  const block=(x,y,w,h,kind='building')=>({x,y,w,h,kind});
  a.home.blocks=[block(230,240,210,150),block(1030,390,150,230),block(620,150,190,95,'crate')];
  a.home.roads=[[[300,720],[600,720],[820,520]]];
  a.clinic.blocks=[block(230,180,210,190),block(1010,360,220,230),block(500,160,300,80,'crate')];
  a.inn.blocks=[block(200,160,280,240),block(940,370,250,220),block(640,180,220,90,'crate')];
  a.yeoul.blocks=[block(210,170,270,220),block(980,400,220,190),block(630,160,260,110),block(960,690,160,130,'crate')];
  a.yeoul.roads=[[[140,800],[600,800],[600,430]],[[600,700],[1290,780]],[[600,600],[1190,300]]];
  a.shrine.blocks=[block(300,180,200,200,'ruin'),block(990,300,200,160,'ruin'),block(630,150,170,100,'ruin')];
  a.songrim.blocks=[block(330,200,130,260,'rock'),block(750,300,170,240,'rock'),block(1050,550,130,120,'rock')];
  a.songrim.roads=[[[140,800],[560,800],[640,620],[1030,740],[1290,780]]];
  const names={recovery:'균열 회수 현장',southernRoad:'여울장 남쪽 길',guardSite:'현실 경계 근무지',northRoad:'북쪽 조사로',experimentSite:'균열 계측 현장',outerArray:'정맥진 외곽',bypass:'정도관 우회로',supply:'정맥진 공급소',prison:'서하의 감금 장소',circulation:'정맥진 순환 장치',arrayHeart:'정맥진 중심',riftFinal:'맥갑수 출현 현장'};
  for(const [i,[id,name]]of Object.entries(names).entries()){const modern=['recovery','guardSite','experimentSite','riftFinal'].includes(id);a[id]={...a[modern?'rift':'forest'],name,sub:'현장 임무 · 돌아갈 길을 기억하세요',world:modern?'현실':'무림',safe:false,blocks:[block(250+i%3*80,200,200,150,modern?'container':'ruin'),block(700,200,170,160,modern?'crate':'rock'),block(650,560,130,130,modern?'container':'ruin')],points:[],spawn:[240,800],positions:[[960,600],[1080,710],[1150,480]],hp:35,bossHp:60,damage:5,mob:modern?'균열 잔류 짐승':'길목의 습격자',boss:id==='riftFinal'?'맥갑수':id==='arrayHeart'?'차도겸의 압박':'전방 위협',mobKind:modern?'crawler':'bandit',bossKind:'guardian'};}
 }
 return {install};
});
