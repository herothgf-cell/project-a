/* Original world/content definitions. No network assets or runtime packages. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WorldData = api;
})(globalThis, function () {
  'use strict';
  const VERSION = '0.3.0';
  const point = (id,x,y,label,kind='npc',extra={}) => ({id,x,y,label,kind,...extra});
  const block = (x,y,w,h,kind) => ({x,y,w,h,kind});
  const encounter = [[390,850],[600,720],[800,770],[920,550],[1170,410],[1280,230]];
  const AREAS = {
    city: {
      name:'해온시 · 헌터 기지', sub:'비가 그친 도시, 아직 닫히지 않은 경계', world:'현실', theme:'city', safe:true,
      w:1440,h:1040,spawn:[640,650], chapter:1,
      points:[point('warden',600,330,'서린 · 관리관'),point('portal',1080,560,'경계석 · 무림 접속','portal'),point('gate',1170,850,'D급 균열','gate',{to:'rift',need:5}),point('harbor',1100,320,'침식된 항만','gate',{to:'harbor',need:11}),point('shop',300,550,'헌터 보급소','shop'),point('rest',440,745,'휴식 벤치','rest')],
      blocks:[block(95,125,285,235,'building'),block(480,60,280,170,'building'),block(935,60,325,150,'building'),block(90,760,170,165,'building'),block(770,775,125,80,'crate')],
      roads:[[[60,610],[640,610],[1260,610]],[[640,990],[640,310]],[[1020,610],[1130,860]],[[1080,610],[1100,300]]]
    },
    village: {
      name:'청운촌 · 백련문',sub:'대숲의 바람을 따라, 한 호흡 더 깊이',world:'무림',theme:'village',safe:true,
      w:1440,h:1040,spawn:[600,680],chapter:1,
      points:[point('master',600,320,'백련 · 사부'),point('portal',250,810,'경계석 · 현실 귀환','portal'),point('forest',1180,860,'흑풍 죽림','gate',{to:'forest',need:2}),point('ruins',1120,350,'월영 폐사','gate',{to:'ruins',need:8}),point('shop',950,555,'청운 약방','shop'),point('rest',440,540,'운기조식','rest')],
      blocks:[block(410,95,360,145,'temple'),block(875,135,275,125,'house'),block(90,200,230,185,'house'),block(710,710,145,105,'pond'),block(125,565,90,90,'tree')],
      roads:[[[130,800],[590,680],[1190,850]],[[590,680],[600,320]],[[650,520],[1070,540],[1120,350]]]
    },
    forest: {
      name:'흑풍 죽림',sub:'칼을 들기 전, 바람의 방향을 읽어라',world:'무림',theme:'forest',safe:false,
      w:1500,h:1080,spawn:[175,920],chapter:1,boss:'흑풍채 두목',bossKind:'chief',mob:'흑풍 산적',mobKind:'bandit',hp:66,bossHp:350,damage:10,positions:encounter,
      points:[point('exit',105,975,'청운촌으로 귀환','exit')],
      blocks:[block(140,120,150,240,'rock'),block(320,510,150,130,'rock'),block(600,230,130,205,'rock'),block(950,820,200,100,'rock'),block(1245,600,140,145,'rock')],
      roads:[[[105,975],[390,850],[700,810],[850,590],[1110,520],[1280,230]]]
    },
    rift: {
      name:'균열 · 잊힌 지하역',sub:'낯선 무공이 익숙한 어둠을 가른다',world:'현실',theme:'rift',safe:false,
      w:1500,h:1080,spawn:[175,920],chapter:1,boss:'균열 감시자',bossKind:'sentinel',mob:'균열 잔영',mobKind:'shade',hp:94,bossHp:510,damage:13,positions:encounter,
      points:[point('exit',105,975,'헌터 기지로 귀환','exit')],
      blocks:[block(150,100,155,245,'ruin'),block(330,505,155,120,'ruin'),block(610,235,150,190,'ruin'),block(945,830,195,105,'ruin'),block(1250,610,120,140,'ruin')],
      roads:[[[105,975],[390,850],[700,810],[850,590],[1110,520],[1280,230]]]
    },
    ruins: {
      name:'월영 폐사',sub:'세 개의 봉인, 두 세계에 남은 하나의 상처',world:'무림',theme:'ruins',safe:false,
      w:1500,h:1080,spawn:[175,920],chapter:2,boss:'월영 수문장',bossKind:'guardian',mob:'흑월 파수꾼',mobKind:'masked',hp:116,bossHp:620,damage:14,positions:encounter,
      points:[point('exit',105,975,'청운촌으로 귀환','exit'),point('seal1',450,745,'인장 · 바람','seal'),point('seal2',950,680,'인장 · 숨결','seal'),point('seal3',1110,270,'인장 · 잔월','seal')],
      blocks:[block(150,160,140,170,'templeruin'),block(360,450,130,145,'rock'),block(630,280,145,140,'templeruin'),block(1000,800,165,95,'rock'),block(1200,545,120,150,'templeruin')],
      roads:[[[105,975],[450,850],[800,780],[950,520],[1250,240]],[[450,850],[450,745]],[[800,780],[950,680]],[[1250,240],[1110,270]]]
    },
    harbor: {
      name:'침식된 항만',sub:'검은 파도 아래, 세계의 이음매가 찢어진다',world:'현실',theme:'harbor',safe:false,
      w:1500,h:1080,spawn:[175,920],chapter:2,boss:'흑조 집행관',bossKind:'tide',mob:'침식된 감시병',mobKind:'drone',hp:132,bossHp:760,damage:16,positions:encounter,
      points:[point('exit',105,975,'헌터 기지로 귀환','exit'),point('anchor1',565,850,'침식 닻 · 서쪽','seal'),point('anchor2',1100,530,'침식 닻 · 동쪽','seal')],
      blocks:[block(100,180,165,260,'container'),block(345,450,135,155,'container'),block(625,200,150,230,'container'),block(960,825,190,115,'container'),block(1385,0,115,1080,'sea')],
      roads:[[[105,975],[390,850],[700,810],[850,590],[1110,520],[1280,230]]]
    }
  };
  const QUESTS = [
    ['낯선 신호','관리관 서린에게 다가가 대화하세요.'],
    ['경계 너머로','경계석을 통해 무림으로 이동하세요.'],
    ['몸에 새기는 무공','흑풍 죽림의 호위와 두목을 처치하세요.'],
    ['사부의 인정','청운촌의 백련 사부에게 보고하세요.'],
    ['두 세계, 하나의 힘','현실로 돌아가 서린에게 무공을 보여 주세요.'],
    ['현실을 베는 검','D급 균열의 감시자를 처치하세요.'],
    ['새로운 균열','첫 챕터 완료. 서린에게 돌아가 새로운 신호를 조사하세요.'],
    ['잔월의 흔적','무림의 백련 사부에게 검은 인장을 보여 주세요.'],
    ['잠든 인장을 깨워라','월영 폐사의 호위, 세 인장, 수문장을 차례로 공략하세요.'],
    ['경계의 호흡','백련 사부에게 돌아가 경계 공명을 완성하세요.'],
    ['검은 파도','현실로 돌아가 서린에게 항만 진입을 요청하세요.'],
    ['이음매를 지키는 자','항만의 호위와 두 침식 닻을 제거하고 집행관을 쓰러뜨리세요.'],
    ['잔월의 서약','제2장 완료. 두 세계는 아직 연결되어 있습니다.']
  ];
  const SKILLS = {
    attack:{name:'연환검',glyph:'劍',key:'J',cost:0,cool:.32,need:0},
    moon:{name:'월영참',glyph:'月',key:'K',cost:18,cool:2.8,need:1},
    storm:{name:'천뢰격',glyph:'雷',key:'L',cost:32,cool:6,need:2},
    dash:{name:'회피',glyph:'風',key:'Space',cost:0,cool:1.2,need:0},
    potion:{name:'회복약',glyph:'✚',key:'1',cost:0,cool:1,need:0}
  };
  return {VERSION,AREAS,QUESTS,SKILLS};
});
