/* Original Ssanggye discovery content. Immutable keys are also the save whitelist. */
(function(root,factory){const x=factory();if(typeof module==='object'&&module.exports)module.exports=x;else root.JourneyData=x;})(globalThis,function(){
 'use strict';
 const paths=['ripple','echo','seal'];
 const variants={
  'ripple-return':{path:'ripple',name:'역파 · 반전검',glyph:'返',color:'#f3d399',description:'R 역류참 뒤 다음 기본 검격이 전방의 적을 관통합니다. 빈 검격에도 축적은 소모됩니다.'},
  'ripple-guard':{path:'ripple',name:'잔파 · 수호진',glyph:'護',color:'#ffe5b8',description:'Q 파문세에 4초 수호진을 남깁니다. 진 안에서 자신이 받는 피해를 줄입니다.'},
  'echo-return':{path:'echo',name:'회향 · 귀환보',glyph:'歸',color:'#aecafa',description:'R 귀환보의 도착점에서 원형 검격이 퍼집니다. 돌아온 뒤 0.7초 무적입니다.'},
  'echo-replay':{path:'echo',name:'먹향 · 재현검',glyph:'寫',color:'#d0b3ff',description:'R은 이동하지 않고 잔향에 검격을 맡깁니다. 0.45초 뒤 잔향 위치에서 실제로 베어 냅니다.'},
  'seal-hold':{path:'seal',name:'정박 · 불동인',glyph:'定',color:'#9ee4d4',description:'Q 결계가 6초 머물며 안쪽의 첫 공격 예고를 속박으로 끊습니다.'},
  'seal-guide':{path:'seal',name:'유전 · 도류인',glyph:'流',color:'#7ed8e8',description:'R로 묶인 적을 검이 향한 방향으로 밀어 기운을 흘립니다. 공격 예고를 끊었다면 유도 검기가 이어집니다.'}
 };
 const facts={
  'sense-ripple':'부러진 검 아래에서 충격이 되돌아온다. 오른쪽 석판에는 충격을 받아 줄 홈이 있다.',
  'sense-echo':'잉크가 발자국에서 늦게 마른다. 발걸음은 돌아갈 수도, 검격을 남겨 둘 수도 있다.',
  'sense-seal':'비석의 기운은 멎지 않았다. 곁의 수로로 돌리면 같은 파동이 다른 방향으로 흐른다.',
  'item-ripple':'주인 없는 호위검을 살폈다. 칼날보다 손잡이에 힘이 오래 머문다.',
  'item-echo':'이름 없는 보법 필사본을 펼쳤다. 마지막 장은 문장 대신 발자국만 남아 있다.',
  'item-seal':'갈라진 봉인 탁본을 얻었다. 금이 간 자리를 지워서는 읽을 수 없다.',
  'proof-ripple-return':'몰려오는 파동을 끝까지 보았다가 검으로 맞받아쳤다. 기운이 반대쪽으로 뻗었다.',
  'proof-ripple-guard':'파동이 모일 때 수호 석판을 붙들었다. 내 뒤에만 고요한 원이 남았다.',
  'proof-echo-return':'울림 속에서 발을 뗐다가 남겨 둔 발자국으로 돌아갔다. 두 호흡이 같은 자리에 겹쳤다.',
  'proof-echo-replay':'울림을 벗어난 자리에서 검을 휘둘렀다. 돌아가지 않았는데도 남긴 발자국이 뒤늦게 베었다.',
  'proof-seal-hold':'기운이 모인 틈을 부수지 않고 붙잡았다. 파동이 잠깐 그 자리에 머물렀다.',
  'proof-seal-guide':'다가오는 기운을 기감으로 읽고 수로를 열었다. 파동이 물길을 따라 흘렀다.',
  'station-sense':'현실의 장치가 무림의 흔적과 같은 간격으로 진동한다. 보이는 숫자보다 실제 몸의 반응을 비교하자.',
  'yeonhwa-letter':'연화가 돌아온 뒤 직접 기록해 둔 글을 받았다. 나는 그 사람이 기다릴 이유를 만들었다.'
 };
 const relics={ripple:'주인 없는 호위검',echo:'이름 없는 보법 필사본',seal:'갈라진 봉인 탁본'};
 const syncNames=['무림에 남은 감각','현실의 조짐','현실에서 재현됨'];
 const point=(id,x,y,label,kind,rest={})=>({id,x,y,label,kind,...rest});
 function install(A){if(A.archive)return;
  A.village.points.push(point('archiveGate',1050,925,'환서정 · 바람의 서고','journey-gate',{to:'archive'}));
  A.city.points.push(point('stationGate',1280,450,'공명 관측소','journey-gate',{to:'station'}));
  A.archive={name:'환서정 · 이름 없는 필사본',sub:'책보다 먼저, 남겨진 바람이 움직인다',world:'무림',theme:'ruins',safe:false,chapter:5,w:1500,h:1080,spawn:[730,910],hp:120,bossHp:600,damage:10,mob:'먹빛 잔상',mobKind:'masked',boss:'서고의 잔상',bossKind:'guardian',positions:[],
   points:[point('exit',730,990,'청운촌으로 귀환','exit'),point('relic-ripple',420,480,relics.ripple,'discovery',{path:'ripple'}),point('anchor-ripple',485,570,'홈이 파인 수호 석판','experiment',{path:'ripple'}),point('relic-echo',800,480,relics.echo,'discovery',{path:'echo'}),point('relic-seal',1140,480,relics.seal,'discovery',{path:'seal'}),point('anchor-seal',1205,570,'기운이 흐르는 수로','experiment',{path:'seal'}),point('archive-rest',730,780,'잠깐의 운기조식','rest')],
   blocks:[{x:570,y:70,w:390,h:170,kind:'temple'},{x:100,y:160,w:120,h:200,kind:'tree'},{x:1260,y:120,w:155,h:220,kind:'rock'},{x:105,y:740,w:230,h:140,kind:'pond'}],
   roads:[[[730,990],[730,740],[800,480]],[[420,480],[520,630],[800,670],[1140,480]],[[730,740],[1205,570]]]};
  A.station={name:'공명 관측소 · 기록 밖의 귀환자',sub:'당신의 호흡은 기계의 기록보다 먼저 움직였다',world:'현실',theme:'rift',safe:false,chapter:5,w:1500,h:1080,spawn:[230,900],hp:175,bossHp:1350,damage:18,mob:'기록의 파편',mobKind:'shade',boss:'기록 사냥꾼',bossKind:'sentinel',positions:[[430,780],[590,660],[820,720],[1030,520],[1140,350],[1280,215]],
   points:[point('exit',110,975,'헌터 기지로 귀환','exit'),point('partner',310,900,'도겸 · 동행 제안','npc',{role:'hunter'}),point('station-lens',755,510,'엇갈린 관측 기록','discovery',{path:'station'}),point('station-reset',390,955,'잔류 파형 재현','experiment')],
   blocks:[{x:100,y:180,w:190,h:235,kind:'building'},{x:450,y:320,w:140,h:125,kind:'ruin'},{x:720,y:140,w:160,h:210,kind:'container'},{x:1130,y:810,w:215,h:110,kind:'container'}],
   roads:[[[110,975],[390,840],[600,720],[815,670],[1030,520],[1280,215]],[[755,510],[600,720]]]};
 }
 function initial(){return {seed:1+Math.floor(Math.random()*2147483646),phase:0,directProgression:false,items:[],facts:[],known:[],selected:{ripple:null,echo:null,seal:null},sync:{},mastery:{sword:0,ripple:0,echo:0,seal:0},worlds:[],breath:'flow',realm:0,materials:0,lens:false,companion:false,measured:false,boss:false,promise:false,rank:'미평가'};}
 function rumors(s){const labels=['북문 석판','처마 아래의 필사본','행상이 남긴 탁본'];return [
  {speaker:'청람',text:`내 여정에서는 ${labels[s.seed%3]}에 기운이 남았어. 다른 흔적도 같은 서고 안에서 찾았지.`},
  {speaker:'돌샘',text:'석판은 평소엔 잠잠했어. 검으로 울림을 돌려보냈더니, 그때서야 글이 나타났지.'},
  {speaker:'유하',text:'나는 돌아가지 않았어. 발자국을 남겨 두고 검을 휘둘렀더니 그쪽에서도 먹물이 갈라졌어.'},
  {speaker:'무정',text:'봉인을 무작정 부수지 말아 봐. 기감을 펼치면 옆 수로에도 같은 울림이 흐르거든.'}
 ];}
 return {paths,variants,facts,relics,syncNames,install,initial,rumors};
});
