/* The new, deliberately bounded first-return journey; old saves never opt in implicitly. */
(function(root,f){const api=f(typeof module==='object'&&module.exports?require('./murim-growth.js'):root.MurimGrowth,typeof module==='object'&&module.exports?require('./murim-scenes.js'):root.MurimScenes,typeof module==='object'&&module.exports?require('./murim-notices.js'):root.MurimNotices);if(typeof module==='object'&&module.exports)module.exports=api;else root.MurimJourney=api;})(globalThis,function(Growth,Scenes,Notices){
 'use strict';
 const roadNames=['추적자의 죽림','갈림길 초소','무너진 잔도','물안개 계곡','버려진 역참','산사의 돌계단','매복의 협곡','운무 숲길','화산 외곽 관문','화산 산문'];
 const events=[
  '백련을 쫓던 자들이 길을 막았다. 정체를 단정할 증거는 아직 없다.','부러진 수레 옆에서 남궁의 여행자를 만났다. 칼끝의 거리를 읽는 법을 나눌 수 있다.','백련을 부축할 넓은 길을 확보했다. 천흔 쪽으로 되돌아가기에는 아직 위험하다.','무당의 여행자가 기운을 아끼는 호흡을 제안했다. 야영지에서 이야기를 들을 수 있다.','역참에서 추적자들의 보급 흔적을 발견했다. 백련은 마교 활동과 천흔의 관계를 조사 중이었다고 밝힌다.','아미의 여행자가 부상자를 지키는 발걸음을 보여 준다. 야영지에서 배울 수 있다.','협곡의 매복을 돌파했다. 백련은 힘을 보태려다 부상이 깊어져 다시 검을 거둔다.','구름 너머 화산의 능선이 보인다. 돌아가기 위해 먼저 살아남을 힘을 기른다.','관문을 점거한 무리를 물리치고 화산에 구조 신호를 보냈다.','산문까지 길을 열었다. 이제 화산에서 백련의 치료를 받을 수 있다.'
 ];
 const roads=roadNames.map((name,i)=>({id:'murimRoad'+(i+1),name:(i+1)+'. '+name,index:i,chapter:1,story:events[i]}));
 const returns=[{id:'murimReturn1',name:'귀환길 1 · 천흔 옛길',index:10,chapter:2,story:'백련과 함께 천흔의 위치를 다시 확인했다. 갈라진 기운의 흔적에서 선택 수련 기회가 열린다.'},{id:'murimReturn2',name:'귀환길 2 · 검은 진영',index:11,chapter:2,story:'적대 무리의 진영을 무너뜨렸다. 천흔을 지키는 우두머리만 남았다.'},{id:'murimReturn3',name:'귀환길 3 · 천흔 수문장',index:12,chapter:2,story:'천흔을 막던 우두머리를 제압했다. 돌아갈 길이 열렸다.'}];
 const special=[{id:'murimTutorial',name:'응급 전수 · 추적자의 습격',index:-1,chapter:1},{id:'murimChance',name:'선택 기연 · 천흔의 메아리',index:9,chapter:2}];
 const locations=[...roads,...returns,...special],byId=Object.fromEntries(locations.map(x=>[x.id,x]));
 const stages=['intro','tutorial','road','treatment','choice','return','complete'];
 const state=g=>g.worldState?.murimJourney,active=g=>!!state(g),area=id=>!!byId[id];
 const point=(id,x,y,label,kind='npc',extra={})=>({id,x,y,label,kind,role:'master',...extra});
 function areas(base){return Object.fromEntries(locations.map((d)=>{const i=Math.max(0,d.index),tutorial=d.id==='murimTutorial',n=tutorial?2:3+i%3,positions=Array.from({length:n},(_,k)=>[430+k*145,760-k*110+(i%2)*20]);return [d.id,{...base.forest,name:d.name,sub:tutorial?'이동 · 기본 공격 · 회피를 익히고 백련과 탈출':d.story||'천흔의 기운을 견디는 선택 실전',chapter:d.chapter,spawn:[175,900],positions,points:[point('journey-exit',110,945,'안전한 곳으로 돌아가기','exit')],hp:tutorial?24:55+i*9,bossHp:tutorial?38:130+i*26,damage:tutorial?3:7+Math.floor(i*.65),boss:tutorial?'추적자':'murimReturn3'===d.id?'천흔 수문장':d.id==='murimChance'?'천흔의 잔향':i%2?'길목 감시자':'추적대 우두머리',mob:'정체불명의 추적자',mobKind:'bandit',bossKind:d.id==='murimReturn3'?'guardian':'chief',blocks:[{x:180+i%3*45,y:180,w:170,h:170,kind:'rock'},{x:1060,y:650-i%3*70,w:140,h:160,kind:'rock'},{x:580+i%2*100,y:160,w:190,h:130,kind:'rock'}],roads:[[[110,945],[430,760],[800,550],[1100,330]]]}];}));}
 const introIds=['intro-0','intro-1','murim-arrival','murim-transmission'];
 const mentorAt={sword:'murimRoad2',inner:'murimRoad4',movement:'murimRoad6'};
 const sceneFor=id=>id==='murimTutorial'?'murim-departure':id==='murimRoad10'?'murim-treatment':/^murimRoad[1-9]$/.test(id)?'murim-road-'+id.slice(9):id==='murimReturn3'?'murim-first-return':/^murimReturn[12]$/.test(id)?'murim-return-'+id.slice(11):id==='murimChance'?'murim-chance':null;
 function start(g){
  if(active(g)||g.progress>1||g.training>0)return false;
  g.worldState.murimJourney={version:1,stage:'intro',scene:0,sceneState:{id:'intro-0',page:0},completedScenes:[],chanceChoice:null,tutorial:{move:false,attack:false,dash:false,wave:0,waves:true},viewed:{stats:false,skills:false},notices:{stats:[],skills:[]},cleared:[],mentors:[],disciple:null,rare:false};
  g.worldState.murimGrowth=Growth.initial();g.worldState.murimLoadout={version:1,slots:{moon:null,storm:null}};
  g.revision.intro=7;g.revision.aid=2;g.introActive=false;g.progress=2;g.training=1;g.worldState.planB.legacy=true;g.worldState.ordinaryGrowth.transmission=false;g.enter('village');g.events=[];return true;
 }
 function scene(g){const s=state(g),p=s?.sceneState,d=p&&Scenes.get(p.id);return d?{...d,page:p.page,current:d.pages[p.page]}:null;}
 function queue(g,id){const s=state(g);if(!id||s.sceneState||s.completedScenes.includes(id))return false;s.sceneState={id,page:0};return true;}
 function advanceScene(g,skip=false){
  const s=state(g),d=scene(g);if(!d||d.choice||g.area!=='village')return false;
  if(!skip&&s.sceneState.page<d.pages.length-1){s.sceneState.page++;return true;}
  s.completedScenes.push(d.id);s.sceneState=null;
  const i=introIds.indexOf(d.id);if(i>=0){s.scene=Math.min(3,i+1);if(i<3)queue(g,introIds[i+1]);else s.stage='tutorial';}
  if(d.id==='murim-treatment'){s.stage='choice';queue(g,'murim-disciple');}
  for(const [type,id]of Object.entries(mentorAt))if(d.id===sceneFor(id)&&!s.mentors.includes(type))s.mentors.push(type);
  if(d.id==='murim-first-return'){s.stage='complete';g.enter('city');}
  return true;
 }
 // Kept for older integrations; the scene UI uses advanceScene and preparation separately.
 function intro(g,skip=false){const s=state(g);if(!s||s.stage!=='intro')return false;if(skip){while(s.stage==='intro'&&scene(g))advanceScene(g,true);}else advanceScene(g,false);return true;}
 function next(g){const s=state(g);if(!s||s.sceneState)return null;return s.stage==='tutorial'?byId.murimTutorial:s.stage==='road'?roads.find(d=>!s.cleared.includes(d.id))||null:s.stage==='return'?returns.find(d=>!s.cleared.includes(d.id))||null:null;}
 function chanceAvailable(g){const s=state(g);return !!s&&s.stage==='return'&&!s.sceneState&&s.cleared.includes('murimReturn1')&&!s.cleared.includes('murimReturn2')&&!s.rare&&s.chanceChoice!=='skip';}
 function canEnter(g,id){
  if(!active(g))return true;const s=state(g);if(id==='village')return s.stage!=='complete';if(id==='city')return s.stage==='complete';if(!area(id))return false;if(g.murimRestoringArea===id&&s.cleared.includes(id))return true;
  // A cleared encounter may be restored until its exit scene has been consumed.
  if(s.cleared.includes(id)&&!s.completedScenes?.includes(sceneFor(id)))return !s.sceneState||s.sceneState.id===sceneFor(id);
  if(s.sceneState)return false;if(id==='murimChance')return chanceAvailable(g);return next(g)?.id===id;
 }
 function prepare(g,id){const s=state(g);if(!s||g.area!=='village'||g.player.hp<=0||s.sceneState)return false;if(id!=='murimChance'&&next(g)?.id!==id||id==='murimChance'&&!chanceAvailable(g))return false;const before=s.chanceChoice;if(id==='murimChance')s.chanceChoice='enter';const ok=g.enter(id);if(!ok)s.chanceChoice=before;return !!ok;}
 function skipChance(g){if(g.area!=='village'||!chanceAvailable(g))return false;state(g).chanceChoice='skip';return true;}
 function spawnTutorial(g){
  const t=state(g).tutorial;if(!t.waves)return;const prefix='tutorial-'+t.wave+'-';if(g.enemies.length===[2,2,3][t.wave]&&g.enemies.every(e=>e.id.startsWith(prefix)))return;
  const base=g.enemies[0]||{r:19,kind:'bandit',range:64,windMax:1,pattern:'strike'};
  g.enemies=Array.from({length:[2,2,3][t.wave]},(_,i)=>{const x=430+i*160,y=740-i*100,boss=t.wave===2&&i===2,hp=boss?52:32+t.wave*5;return {...base,id:prefix+i,x,y,tx:x,ty:y,r:boss?31:19,boss,hp,maxHp:hp,name:boss?'추적대의 선봉':'추적자',kind:boss?'chief':'bandit',damage:boss?6:4,speed:48+t.wave*5,role:boss?'boss':t.wave===1?'heavy':'pressure',cd:.8+i*.2,wind:0,flash:0,attacks:0,rewarded:false,journeyEnemy:true};});
 }
 function populate(g){if(!active(g)||!area(g.area))return;const s=state(g);if(g.area==='murimTutorial')spawnTutorial(g);for(const [i,e]of g.enemies.entries()){e.journeyEnemy=true;e.speed=g.area==='murimTutorial'?48:65+i*5;if(g.area!=='murimTutorial'||!s.tutorial.waves)e.role=e.boss?'boss':i%3===1?'ranged':i%3===2?'heavy':'pressure';if(s.cleared.includes(g.area)){e.hp=0;e.rewarded=true;}}g.murimEntry={x:g.player.x,y:g.player.y};}
 function onEnter(g,previous){const s=state(g);if(!s||g.area!=='village'||!area(previous))return;if(s.cleared.includes(previous))queue(g,sceneFor(previous));}
 function reward(g,e){
  if(!active(g)||!e.journeyEnemy)return false;e.rewarded=true;if(g.enemies.some(e=>e.hp>0))return true;
  const s=state(g),id=g.area;if(id==='murimTutorial'){if(s.tutorial.waves&&s.tutorial.wave<2){s.tutorial.wave++;spawnTutorial(g);g.emit('toast',{text:['','두 번째 습격 · 붉은 예고를 보고 회피하세요.','마지막 습격 · 이동, 검격, 회피를 함께 사용하세요.'][s.tutorial.wave]});}return true;}
  if(s.cleared.includes(id))return true;s.cleared.push(id);Growth.grant(g,id);g.grantExperience({world:'murim',amount:id==='murimChance'?100:80+byId[id].index*12,eventId:'journey:'+id.toLowerCase()});g.gold=Math.min(999999,g.gold+20);if(id==='murimRoad10')s.stage='treatment';if(id==='murimChance')s.rare=true;g.emit('toast',{text:'길 확보 · 단련석 +'+Growth.value(id).stone+' / 수련첩 +'+Growth.value(id).scroll});return true;
 }
 function tutorialReady(g){const s=state(g);return !!s&&['move','attack','dash'].every(k=>s.tutorial[k])&&(!s.tutorial.waves||s.tutorial.wave===2)&&!g.enemies.some(e=>e.hp>0);}
 function finishTutorial(g){const s=state(g);if(!s.cleared.includes('murimTutorial'))s.cleared.push('murimTutorial');s.stage='road';}
 function practice(g){const s=state(g);if(!s||s.stage!=='tutorial'||g.area!=='murimTutorial'||g.enemies.some(e=>e.hp>0))return false;s.tutorial.wave=0;s.tutorial.waves=true;g.enemies=[];spawnTutorial(g);return true;}
 function step(g){if(!active(g)||g.area!=='murimTutorial')return;const s=state(g),p=g.murimEntry;if(p&&Math.hypot(g.player.x-p.x,g.player.y-p.y)>24)s.tutorial.move=true;}
 function contact(g,e,c){if(active(g)&&g.area==='murimTutorial'&&e.journeyEnemy&&c?.manual&&c.action==='attack')state(g).tutorial.attack=true;}
 function action(g,a,ok,held){if(!active(g)||!ok)return;const s=state(g),l=Growth.state(g).levels;if(a==='dash'){g.player.cool.dash=Math.max(.6,1.2-l.step*.1);g.player.invuln+=l.distance*.03;if(!held&&g.area==='murimTutorial')s.tutorial.dash=true;}}
 function points(g){const s=state(g);if(!s)return null;if(area(g.area))return [point('journey-exit',110,945,s.cleared.includes(g.area)||g.area==='murimTutorial'&&tutorialReady(g)?'확보 완료 · 다음 장면':'안전한 곳으로 철수','exit')];return [];}
 function choose(g,choice){const s=state(g);if(!s||s.stage!=='choice'||g.area!=='village'||!['accept','decline'].includes(choice)||s.sceneState?.id!=='murim-disciple')return false;s.disciple=choice;s.stage='return';s.completedScenes.push('murim-disciple');s.sceneState=null;queue(g,'murim-disciple-'+choice);g.training=2;g.progress=4;return true;}
 function interact(g,id){
  const s=state(g);if(!s)return null;
  if(id==='journey-exit'&&area(g.area)){const from=g.area;if(from==='murimTutorial'&&tutorialReady(g))finishTutorial(g);g.enter('village');if(s.cleared.includes(from))queue(g,sceneFor(from));return {type:scene(g)?'journey-scene':'journey-route'};}
  if(id==='journey-next')return {type:scene(g)?'journey-scene':s.stage==='choice'?'journey-choice':s.stage==='complete'?'journey-complete':'journey-route'};
  return {type:'toast',text:'메뉴에서 다음 장면과 목적지를 확인하세요.'};
 }
 function objective(g){
  const s=state(g);if(!s)return null;const d=byId[g.area],current=scene(g);
  if(d){const t=s.tutorial,text=g.area==='murimTutorial'?`실습 ${t.waves?t.wave+1:1}/${t.waves?3:1} · 이동 ${t.move?'✓':'필요'} · 공격 ${t.attack?'✓':'필요'} · 회피 ${t.dash?'✓':'필요'}`:s.cleared.includes(g.area)?'길 확보 완료 · 출구에서 다음 장면으로 진행하세요.':'남은 위협을 제압하세요. 기본 검격과 회피로도 완료할 수 있습니다.',e=g.enemies.find(e=>e.hp>0&&!e.boss)||g.enemies.find(e=>e.hp>0);return {priority:true,chapter:d.chapter,title:d.name,text,target:e?{...e,label:e.name,kind:'enemy'}:points(g)[0]};}
  return {priority:true,chapter:['return','choice','complete'].includes(s.stage)?2:1,title:current?.title|| (s.stage==='complete'?'돌아온 몸':'다음 여정 준비'),text:current?'이야기를 읽고 다음 행동을 결정하세요.':s.stage==='complete'?'첫 현실 귀환 완료 · 무림의 성취가 남았습니다.':(next(g)?.name||'백련의 제안을 결정하세요.')+' · 성장 확인과 투자는 선택입니다.',target:null};
 }
 function migrate(s){
  if(Object.hasOwn(s,'sceneState'))return;
  s.sceneState=null;s.completedScenes=[];s.chanceChoice=s.rare?'enter':null;s.tutorial.wave=0;s.tutorial.waves=false;
  if(s.stage==='intro'){s.sceneState={id:'murim-arrival',page:0};s.completedScenes=['intro-0','intro-1'];return;}
  s.completedScenes.push(...introIds);
  for(const id of s.cleared){const sc=sceneFor(id);if(sc)s.completedScenes.push(sc);}
  if(s.stage==='treatment'){s.completedScenes=s.completedScenes.filter(id=>id!=='murim-treatment');s.sceneState={id:'murim-treatment',page:0};}
  if(s.stage==='choice')s.sceneState={id:'murim-disciple',page:0};
  if(s.disciple!==null)s.completedScenes.push('murim-disciple','murim-disciple-'+s.disciple);
  if(s.stage==='return'&&s.cleared.includes('murimReturn3')){s.completedScenes=s.completedScenes.filter(id=>id!=='murim-first-return');s.sceneState={id:'murim-first-return',page:0};}
  // Earlier releases exposed these opportunities through optional field conversations.
  // Their unlocks are preserved or moved into the already-completed event, never paid again.
  for(const [type,id]of Object.entries(mentorAt))if(s.cleared.includes(id)&&!s.mentors.includes(type))s.mentors.push(type);
 }
 function validate(g){
  const s=state(g);if(!s)return;
  if(s.version!==1||!stages.includes(s.stage)||!Number.isInteger(s.scene)||s.scene<0||s.scene>3||!['move','attack','dash'].every(k=>typeof s.tutorial?.[k]==='boolean')||!['stats','skills'].every(k=>typeof s.viewed?.[k]==='boolean')||!Array.isArray(s.cleared)||new Set(s.cleared).size!==s.cleared.length||s.cleared.some(id=>!area(id))||!Array.isArray(s.mentors)||new Set(s.mentors).size!==s.mentors.length||s.mentors.some(id=>!Object.hasOwn(mentorAt,id))||![null,'accept','decline'].includes(s.disciple)||typeof s.rare!=='boolean')throw Error('무림 여정 기록 오류');
  for(const list of [roads,returns])for(let i=1;i<list.length;i++)if(s.cleared.includes(list[i].id)&&!s.cleared.includes(list[i-1].id))throw Error('무림 여정 선행 누락');
  if(stages.indexOf(s.stage)>=2&&!s.cleared.includes('murimTutorial')||stages.indexOf(s.stage)>=3&&!s.cleared.includes('murimRoad10')||stages.indexOf(s.stage)>=5&&s.disciple===null||s.stage==='complete'&&!s.cleared.includes('murimReturn3')||s.rare!==s.cleared.includes('murimChance')||s.mentors.some(type=>!s.cleared.includes(mentorAt[type]))||s.disciple!==null&&!['return','complete'].includes(s.stage)||s.cleared.some(id=>byId[id].chapter===2)&&!['return','complete'].includes(s.stage))throw Error('무림 여정 단계 오류');
  migrate(s);
  if(!Array.isArray(s.completedScenes)||new Set(s.completedScenes).size!==s.completedScenes.length||s.completedScenes.some(id=>!Scenes.get(id))||![null,'enter','skip'].includes(s.chanceChoice)||typeof s.tutorial.waves!=='boolean'||!Number.isInteger(s.tutorial.wave)||s.tutorial.wave<0||s.tutorial.wave>2)throw Error('무림 장면 기록 오류');
  const p=s.sceneState;if(p!==null&&(!p||!Scenes.get(p.id)||!Number.isInteger(p.page)||p.page<0||p.page>=Scenes.get(p.id).pages.length||s.completedScenes.includes(p.id)))throw Error('무림 장면 페이지 오류');
  for(const id of [...s.completedScenes,...(p?[p.id]:[])]){const source=locations.find(d=>sceneFor(d.id)===id);if(source&&!s.cleared.includes(source.id))throw Error('무림 장면 선행 누락');if(id.startsWith('murim-disciple')&&!s.cleared.includes('murimRoad10')||id.startsWith('murim-disciple-')&&id!=='murim-disciple-'+s.disciple)throw Error('무림 장면 선택 순서 오류');}
  if(p&&introIds.includes(p.id)&&s.stage!=='intro'||p?.id==='murim-disciple'&&s.stage!=='choice'||s.stage==='choice'&&p?.id!=='murim-disciple'||p?.id==='murim-treatment'&&s.stage!=='treatment'||s.stage==='intro'&&!introIds.includes(p?.id))throw Error('무림 장면 단계 오류');
  if(p){const expected=introIds.includes(p.id)?'intro':p.id==='murim-treatment'?'treatment':p.id==='murim-disciple'?'choice':p.id==='murim-departure'||p.id.startsWith('murim-road-')?'road':'return';if(s.stage!==expected)throw Error('무림 장면 단계 오류');}
  Growth.validate(g);Notices.validate(g);
 }
 return {state,active,area,areas,start,intro,scene,advanceScene,canEnter,prepare,skipChance,chanceAvailable,populate,onEnter,reward,step,contact,action,points,choose,interact,objective,next,validate,roads,returns,locations,tutorialReady,practice};
});
