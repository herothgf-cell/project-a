/* Chapter four: consequences, not another skill-awarding checklist.
   This extension keeps the existing simulation and legacy save format readable.
   News is explicitly fictional NPC dialogue; no network/player population exists. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./game.js'):root.DualWorld);if(typeof module==='object'&&module.exports)module.exports=api;else root.ChronicleRules=api;})(globalThis,function(api){
  'use strict';
  const {Game,AREAS,Fate,dist}=api,proto=Game.prototype;
  const old=Object.fromEntries(['enter','objective','target','nearestPoint','interact','blocked','takeHit','strike','act','step','reward','save','emit','witness'].map(k=>[k,proto[k]]));
  const oldLoad=Game.load;
  const kinds=['ripple','echo','seal','detour'];
  const label={ripple:'되돌린 파문',echo:'돌아온 잔향',seal:'이어진 결계',detour:'함께 놓은 우회로'};
  const point=(id,x,y,label,kind='npc',rest={})=>({id,x,y,label,kind,...rest});
  const routeBarrier={x:760,y:575,w:30,h:135};
  const aura={x:750,y:610,radius:155};
  function initial(){return {phase:0,route:null,rescued:false,feed:[],records:[]};}
  function state(g){return g.chapter4||(g.chapter4=initial());}
  function runtime(g){return g.storyRuntime||(g.storyRuntime={pulse:{wind:0,max:1.15,cd:1,x:700,y:630,range:135},aid:0,seen:new Set()});}
  function isStoryArea(a){return a==='returnPass'||a==='returnDock';}
  function push(g,key,speaker,text,kind='npc'){
    const s=state(g);if(s.feed.some(m=>m.key===key))return;
    s.feed.push({key,speaker,text,kind,at:g.playTime||0});if(s.feed.length>28)s.feed.shift();
    old.emit.call(g,'world-news',{text,speaker,kind});
  }
  function visiblePoint(g,o){if(!o)return false;const s=state(g);if(o.id==='returned-yeonhwa')return s.rescued;if(o.id==='passGate')return s.phase>=1;if(o.id==='dockGate')return s.phase>=2;if(o.id==='stranded-yeonhwa')return !s.rescued;return true;}
  function nearby(g){return dist(g.player,{x:700,y:630})<205;}
  function resolve(g,path){
    const s=state(g);if(g.area!=='returnPass'||s.phase!==1||s.route||!kinds.includes(path))return false;
    s.route=path;s.rescued=true;s.records.push({area:g.area,path,at:g.playTime});
    runtime(g).pulse.wind=0;runtime(g).pulse.cd=9999;
    const descriptions={ripple:'파문을 맞받아 돌려보내니 닫혀 있던 교각이 제자리로 밀려났다.',echo:'되돌아오는 잔향을 따라 연화가 끊긴 길을 건넜다. 발자국이 귀환의 닻으로 남았다.',seal:'침식을 없애는 대신 묶어 두었다. 멎은 틈 사이로 다시 통행할 길이 이어졌다.',detour:'적을 물리치고 수동 권양기를 되살렸다. 무공 대신 사람들의 힘으로 우회로를 놓았다.'};
    g.effect('seal',770,635,{life:1.2,max:1.2});g.effect('text',770,605,{text:'귀환로가 열렸다',color:'#fff0bc',life:2,max:2});g.player.invuln=Math.max(g.player.invuln,1);
    push(g,'route-open','현지 기록',descriptions[path],'world');
    push(g,'yeonhwa-rescued','연화',path==='detour'?'혼자 강해지는 일보다, 함께 돌아갈 길을 만드는 일이 더 어렵지요. 청운촌에서 다시 뵐게요.':`「${label[path]}」… 그 길을 제가 직접 걸었습니다. 누가 무공을 주었다는 말로는 설명이 안 되는 일이네요.`);
    old.emit.call(g,'toast',{text:'귀환로 개방 · 연화가 청운촌으로 돌아갑니다.'});
    advancePass(g);return true;
  }
  function advancePass(g){const s=state(g);if(g.area==='returnPass'&&s.phase===1&&s.rescued&&!g.enemies.some(e=>e.hp>0)){s.phase=2;push(g,'echo-across-worlds','서린','귀환 부두에 같은 흔적이 잡혔어요. 당신이 무림에서 연 길이 이쪽에도 영향을 준 것 같아요.');old.emit.call(g,'victory',{title:'제4장 · 길을 남긴 사람',text:'연화는 청운촌으로 돌아갔다. 다른 세계에서도 같은 울림이 이어진다.\n현실 기지의 귀환 부두로 향하자.',portrait:'hero'});}}
  function installWorld(){
    if(AREAS.returnPass)return;
    AREAS.village.points.push(point('passGate',1195,690,'청운 귀환로','story-gate',{to:'returnPass'}),point('returned-yeonhwa',820,565,'연화 · 돌아온 상인','npc',{role:'yeonhwa'}));
    AREAS.city.points.push(point('dockGate',1235,700,'귀환 부두','story-gate',{to:'returnDock'}));
    AREAS.returnPass={name:'청운 귀환로 · 끊긴 다리',sub:'누군가 돌아갈 길을 만드는 일',world:'무림',theme:'forest',chapter:4,safe:false,w:1500,h:1080,spawn:[190,890],hp:140,bossHp:920,damage:16,mob:'흑우 추격자',mobKind:'masked',boss:'흑우채 선봉장',bossKind:'chief',positions:[[430,820],[580,740],[590,440],[890,340],[1100,500],[1260,760]],
      points:[point('exit',110,970,'청운촌으로 귀환','exit'),point('stranded-yeonhwa',850,680,'연화 · 끊긴 귀환길','npc',{role:'yeonhwa'}),point('winch',1020,330,'낡은 권양기','mechanism'),point('bridge-trace',665,650,'울리는 교각','story-clue')],
      blocks:[{x:760,y:410,w:30,h:165,kind:'ravine'},{x:760,y:710,w:30,h:370,kind:'ravine'},{x:140,y:140,w:220,h:230,kind:'rock'},{x:380,y:540,w:110,h:110,kind:'rock'},{x:630,y:180,w:180,h:110,kind:'templeruin'},{x:1010,y:850,w:270,h:100,kind:'rock'},{x:1160,y:140,w:165,h:235,kind:'house'}],
      roads:[[[110,970],[440,825],[650,665],[880,665],[1260,760]],[[650,665],[575,445],[850,345],[1020,330],[1110,535],[880,665]]]};
    AREAS.returnDock={name:'귀환 부두 · 건너온 울림',sub:'당신이 열어 둔 길을, 다른 세계도 기억한다',world:'현실',theme:'harbor',chapter:4,safe:false,w:1500,h:1080,spawn:[180,930],hp:156,bossHp:1080,damage:18,mob:'균열 수색병',mobKind:'drone',boss:'귀환 포식자',bossKind:'tide',positions:[[410,850],[590,750],[780,610],[1040,560],[1170,410],[1280,230]],
      points:[point('exit',110,975,'헌터 기지로 귀환','exit'),point('witness-hunter',370,950,'도겸 · 현장 헌터','npc',{role:'hunter'}),point('world-anchor',750,610,'건너온 흔적','story-clue')],
      blocks:[{x:130,y:160,w:180,h:240,kind:'container'},{x:400,y:470,w:120,h:180,kind:'ruin'},{x:650,y:190,w:150,h:220,kind:'container'},{x:1010,y:810,w:240,h:110,kind:'container'},{x:1385,y:0,w:115,h:1080,kind:'sea'}],roads:[[[110,975],[410,850],[600,755],[750,610],[1080,520],[1280,230]]]};
  }
  installWorld();
  proto.emit=function(type,extra={}){old.emit.call(this,type,extra);if(type==='awakening'&&Fate.PATHS[extra.path]){push(this,'awakening-'+extra.path,'현지 기록',`${AREAS[this.area].name}에서 ${Fate.PATHS[extra.path].name}의 발현이 기록되었습니다. 이 기록은 현재 여정 안에만 남습니다.`,'world');push(this,'witness-'+extra.path,'길손','그 기술이 어디에 쓰일지 아직은 모르겠군. 사람 하나, 길 하나라도 달라진다면 믿을 수 있겠지.');}};
  proto.enter=function(id){
    state(this);const ok=old.enter.call(this,id);if(!ok)return false;
    this.storyRuntime={pulse:{wind:0,max:1.15,cd:.8,x:700,y:630,range:135},aid:0,seen:new Set()};
    if(id==='returnPass'&&!this.chapter4.rescued)push(this,'pass-arrival','연화','다리의 울림이 점점 커져요. 이쪽에 머물면 위험해요! 위쪽 협로에는 낡은 권양기가 있어요.');
    if(id==='returnDock')push(this,'dock-arrival','도겸',this.chapter4.route==='detour'?'당신이 되살린 권양기를 참고해 이쪽에도 우회 장치를 마련했어요.':`이곳에 「${label[this.chapter4.route]}」이 남아 있어요. 무림에서 있었던 일이 여기까지 건너온 겁니까?`);
    return true;
  };
  proto.nearestPoint=function(){return AREAS[this.area].points.filter(o=>visiblePoint(this,o)&&dist(o,this.player)<95).sort((a,b)=>dist(a,this.player)-dist(b,this.player))[0]||null;};
  proto.blocked=function(x,y,r=16){if(old.blocked.call(this,x,y,r))return true;if(this.area==='returnPass'&&!state(this).route){const b=routeBarrier,cx=Math.max(b.x,Math.min(x,b.x+b.w)),cy=Math.max(b.y,Math.min(y,b.y+b.h));return Math.hypot(x-cx,y-cy)<r;}return false;};
  function objective(g){
    const s=state(g);if(!s.phase&&!(g.progress===12&&g.fate.stage>=6))return null;
    const a=AREAS[g.area],p=a.points;let target,text;
    if(g.area==='returnPass'){
      if(s.phase>=2){target=p[0];text='열린 길은 유지됩니다. 연화는 청운촌에 돌아왔습니다. 현실의 귀환 부두로 향하세요.';}
      else if(!s.rescued){target=p.find(x=>x.id==='bridge-trace');text='교각에 공격의 울림이 모입니다. 익힌 힘으로 대응하거나, 위쪽 협로를 통해 권양기를 살펴보세요.';}
      else{const e=g.enemies.filter(e=>e.hp>0).sort((a,b)=>dist(a,g.player)-dist(b,g.player))[0];target=e?{...e,label:e.name,kind:'enemy'}:p[0];text='귀환로는 열렸습니다. 남은 추격자들을 물리쳐 통행을 지키세요.';}
    }else if(g.area==='returnDock'){
      const e=g.enemies.filter(e=>e.hp>0).sort((a,b)=>Number(a.boss)-Number(b.boss)||dist(a,g.player)-dist(b,g.player))[0];target=e?{...e,label:e.name,kind:'enemy'}:p[0];text=e?`「${label[s.route]||'귀환의 흔적'}」가 전장에 남아 있습니다. 빛나는 흔적 가까이에서 변화한 효과를 활용하세요.`:'서린에게 돌아가 두 세계에서 남긴 변화를 이야기하세요.';
    }else if(a.safe){const id=s.phase===4?(g.area==='village'?'returned-yeonhwa':'warden'):s.phase===0?(g.area==='city'?'warden':'portal'):s.phase===1?(g.area==='village'?'passGate':'portal'):s.phase===2?(g.area==='city'?'dockGate':'portal'):(g.area==='city'?'warden':'portal');target=p.find(o=>o.id===id);text=s.phase===4?'제4장 완료. 돌아온 연화와 이야기하거나 다른 세계를 둘러보세요.':s.phase===0?'제3장 이후 · 서린에게 새로 들어온 구조 신호를 확인하세요.':`다음 장소: ${target?.label||'경계석'}`;}
    return target?{title:s.phase===4?'제4장 · 당신이 남긴 귀환로':'제4장 · 끊긴 귀환로',text,target,chapter:4}:null;
  }
  proto.objective=function(){return objective(this)||old.objective.call(this);};
  proto.target=function(){return objective(this)?.target||old.target.call(this);};
  proto.interact=function(){
    const o=this.nearestPoint(),s=state(this);if(!o)return old.interact.call(this);
    const dialogue=(title,text,portrait='hero')=>({type:'dialog',title,text,portrait});
    if(o.id==='warden'&&this.progress===12&&this.fate.stage>=6){
      if(s.phase===0){s.phase=1;push(this,'chapter-start','서린','무림의 통행로와 현실의 부두가 같은 박자로 흔들리고 있어요. 구조 신호도 겹칩니다.');return dialogue('서린 · 돌아오지 못한 사람','무림의 청운 귀환로에서 상인 한 명이 고립됐어요.\n구조대를 보내려 했지만, 그 경계는 당신의 호흡에만 반응해요. 그 사람이 돌아올 길을 찾아 주세요.\n\n기연을 쓰지 않는 우회로도 있습니다. 어떻게 해결할지는 현장에서 판단하세요.','warden');}
      if(s.phase===3){s.phase=4;push(this,'chapter-finish','현지 기록',`「${label[s.route]}」으로 이어진 귀환로. 연화의 귀환과 부두의 안정이 이 여정에 남았습니다.`,'world');return dialogue('서린 · 결과는 사람에게 남는다',`연화 씨가 무사히 가게를 열었다는 소식을 들었어요.\n부두에는 「${label[s.route]}」의 흔적이 남았습니다.\n\n무공의 이름이 대단해서가 아니라, 당신이 어디에 썼는지가 두 세계를 바꾼 거예요.\n제4장 완료 · 귀환로의 이름은 당신의 행적과 함께 남습니다.`,'warden');}
      return dialogue('서린 · 건너온 울림',s.phase===4?'돌아온 사람들의 평범한 하루가 당신이 남긴 변화예요. 청운촌의 연화 씨도 기억하고 있을 거예요.':'청운 귀환로와 이곳 부두가 이어지고 있어요. 구조한 사람과 길이 어떻게 달라졌는지 살펴보세요.','warden');
    }
    if(o.kind==='story-gate'){if(s.phase<(o.to==='returnDock'?2:1))return dialogue('아직 들리지 않는 신호','먼저 제3장의 이야기를 마친 뒤 서린을 만나세요.');this.enter(o.to);return {type:'travel'};}
    if(o.id==='returned-yeonhwa')return dialogue('연화 · 다시 문을 연 가게',`다리가 끊겼을 때는 다시 가게에 돌아올 수 없을 줄 알았어요.\n${s.route==='detour'?'당신이 우회로를 함께 놓아 줬던 일':`그날 직접 보았던 「${label[s.route]}」`}, 잊지 않을게요.\n\n이제 다음 손님이 올 시간이네요. 당신이 남긴 길 덕분에요.`,'yeonhwa');
    if(o.id==='stranded-yeonhwa')return dialogue('연화 · 귀환을 기다리는 사람','교각은 부서진 게 아니라 같은 충격을 반복해서 받고 있어요.\n그 울림을 다른 곳으로 돌리거나, 돌아오는 흔적을 잇거나, 틈을 붙잡을 수 있다면…\n위쪽 협로의 권양기로 우회 다리를 놓는 길도 있어요.','yeonhwa');
    if(o.id==='winch'){if(s.rescued)return {type:'toast',text:'연화는 이미 청운촌으로 돌아갔습니다.'};if(this.guardsAlive())return dialogue('낡은 권양기','추격자들이 밧줄을 움켜쥐고 있습니다. 호위들을 먼저 물리치면 손으로도 우회로를 놓을 수 있습니다.');resolve(this,'detour');return {type:'toast',text:'권양기가 움직였다. 끊긴 귀환로에 우회 다리가 놓였다.'};}
    if(o.id==='bridge-trace')return dialogue('울리는 교각','울림이 모이는 동안 지금 배운 무공으로 대응할 수 있습니다.\n파문을 받아내기 / 잔향을 남겼다가 돌아오기 / 결계로 틈 억제하기.\n\n정해진 답은 없습니다. 위쪽 협로와 수동 권양기도 남아 있습니다.');
    if(o.id==='witness-hunter'||o.id==='world-anchor')return dialogue('도겸 · 당신이 남긴 흔적',{ripple:'빛나는 교각 흔적 가까이에서는 충격이 흩어집니다. 당신이 무림에서 되돌린 힘이 여기서도 사람을 지켜요.',echo:'검을 휘두르면 뒤늦게 같은 검격이 겹쳐요. 당신이 돌아온 그 발걸음이 이곳에서도 함께 움직입니다.',seal:'빛나는 결계 안으로 적을 유인해 보세요. 공격의 예고가 흩어집니다. 그 틈이 여기에 이어졌군요.',detour:'함께 만든 우회로에는 비밀 기술이 없지만, 돌아올 수 있는 길이 생겼어요. 이번에도 힘을 합쳐 보죠.'}[s.route]||'아직 이곳에 남은 공명이 없습니다.','hunter');
    return old.interact.call(this);
  };
  proto.takeHit=function(e){
    const s=state(this),c=this.combat,parry=c?.parry||0,before=this.player.hp;
    if(this.area==='returnDock'&&s.route==='ripple'&&dist(this.player,aura)<aura.radius){old.takeHit.call(this,{...e,damage:Math.round(e.damage*.5)});this.effect('seal',this.player.x,this.player.y,{life:.4,max:.4});}
    else old.takeHit.call(this,e);
    if(e.storyPulse&&parry>0&&Fate.active(this)==='ripple'&&this.player.hp===before&&c.parry===0)resolve(this,'ripple');
  };
  proto.strike=function(e,damage,source='attack'){
    if(e.storyPulse)return 0;
    const dealt=old.strike.call(this,e,damage,source),r=runtime(this);
    if(dealt>0&&this.area==='returnDock'&&state(this).route==='echo'&&source==='attack'&&r.aid<=0){r.aid=2.4;if(e.hp>0)old.strike.call(this,e,Math.max(1,Math.round(this.stats().attack*.65)),'world-echo');this.effect('fate-link',this.player.x-60,this.player.y,{path:'echo',tx:e.x,ty:e.y,life:.7,max:.7});}
    return dealt;
  };
  proto.act=function(action,...args){
    const echo=this.combat?.echo?{...this.combat.echo}:null,before={x:this.player.x,y:this.player.y},pulse=runtime(this).pulse;
    const result=old.act.call(this,action,...args);
    if(result&&action==='signature2'&&Fate.active(this)==='echo'&&echo&&dist(before,echo)>60&&dist(this.player,echo)<2&&dist(before,this.player)>60&&pulse.wind>0&&(dist(before,pulse)<230||dist(echo,pulse)<205))resolve(this,'echo');
    return result;
  };
  proto.step=function(dt,input={}){
    const before=this.playTime;old.step.call(this,dt,input);const elapsed=this.playTime-before;if(elapsed<=0)return;
    const s=state(this),r=runtime(this);r.aid=Math.max(0,r.aid-elapsed);
    if(this.area==='returnPass'&&s.phase===1&&!s.rescued){
      const q=r.pulse;
      if(q.wind>0){
        if(this.combat?.field&&dist(this.combat.field,q)<this.combat.field.radius&&Fate.active(this)==='seal'){this.combat.field.life=Math.max(1,this.combat.field.life);resolve(this,'seal');}
        else{q.wind=Math.max(0,q.wind-elapsed);if(!q.wind){this.effect('impact',q.x,q.y,{range:q.range,life:.4,max:.4});if(dist(this.player,q)<q.range)this.takeHit({storyPulse:true,id:'return-pulse',name:'교각의 울림',x:q.x,y:q.y,r:10,hp:999999,damage:18,attacks:1});q.cd=3.6;}}
      }else{q.cd-=elapsed;if(q.cd<=0&&nearby(this)){q.wind=q.max;}}
      advancePass(this);
    }
    if(this.area==='returnDock'&&s.route==='seal'&&r.aid<=0){const e=this.enemies.find(e=>e.hp>0&&e.wind>0&&dist(e,aura)<aura.radius&&!(e.boss&&this.bossLocked()));if(e){e.wind=0;e.cd=2;e.stun=.4;r.aid=2.5;this.effect('seal',e.x,e.y,{life:.7,max:.7});}}
  };
  proto.reward=function(e){
    if(!isStoryArea(this.area)||!e.boss)return old.reward.call(this,e);
    if(e.rewarded)return;e.rewarded=true;this.gold=Math.min(999999,this.gold+110);this.xp+=145;
    while(this.level<80&&this.xp>=this.stats().next){this.xp-=this.stats().next;this.level++;this.player.hp=Math.min(this.stats().hp,this.player.hp+45);this.player.mp=this.stats().mp;}
    this.xp=Math.min(this.xp,this.stats().next-1);this.emit('sound',{name:'reward'});
    if(this.area==='returnPass')advancePass(this);
    else if(state(this).phase===2){this.chapter4.phase=3;push(this,'dock-secured','도겸','신호가 멎었습니다. 당신이 다른 세계에서 만든 변화를 여기서 직접 봤어요.');this.emit('victory',{title:'건너온 울림 · 귀환 부두 안정',text:'이곳에 남은 흔적은 사라지지 않았다.\n서린에게 돌아가 당신이 열어 둔 길을 이야기하자.',portrait:'hunter'});}
  };
  proto.witness=function(){const s=state(this);return (s.rescued?`청운 귀환로의 「${label[s.route]}」, 연화가 직접 돌아와 이야기해 주었다.\n그 길은 지금도 사람들이 건너고 있다.\n\n`:'')+old.witness.call(this);};
  function validate(raw){
    if(!raw||Array.isArray(raw)||!Number.isInteger(raw.phase)||raw.phase<0||raw.phase>4||![null,...kinds].includes(raw.route)||typeof raw.rescued!=='boolean'||raw.rescued!==!!raw.route||raw.phase>=2&&!raw.rescued)throw Error('귀환로의 진행 기록이 올바르지 않습니다.');
    if(!Array.isArray(raw.feed)||raw.feed.length>28||!Array.isArray(raw.records)||raw.records.length>1)throw Error('귀환로 기록 크기가 올바르지 않습니다.');
    const s=initial();s.phase=raw.phase;s.route=raw.route;s.rescued=raw.rescued;const seen=new Set();
    for(const m of raw.feed){if(!m||typeof m.key!=='string'||m.key.length>60||seen.has(m.key)||!['world','npc'].includes(m.kind)||typeof m.speaker!=='string'||m.speaker.length>30||typeof m.text!=='string'||m.text.length>240||!Number.isFinite(m.at)||m.at<0||m.at>1e10)throw Error('현지 소식 기록이 손상되었습니다.');seen.add(m.key);s.feed.push({key:m.key,speaker:m.speaker,text:m.text,kind:m.kind,at:m.at});}
    for(const m of raw.records){if(!m||m.area!=='returnPass'||m.path!==s.route||!Number.isFinite(m.at)||m.at<0||m.at>1e10)throw Error('귀환로의 원인 기록이 손상되었습니다.');s.records.push({...m});}
    if(s.rescued!==!!s.records.length||s.phase===0&&s.rescued)throw Error('귀환로의 원인과 결과가 일치하지 않습니다.');return s;
  }
  proto.save=function(){const d=JSON.parse(old.save.call(this));d.version=5;d.chapter4=state(this);return JSON.stringify(d);};
  Game.load=function(text){
    const d=JSON.parse(text);if(!d||typeof d!=='object')throw Error('손상된 저장입니다.');
    const s=d.version===5?validate(d.chapter4):initial();
    if(d.version===5){if(s.phase>0&&(d.progress!==12||d.fate?.stage!==6))throw Error('이야기와 귀환로의 진행이 일치하지 않습니다.');d.version=4;}
    const g=oldLoad.call(this,JSON.stringify(d));g.chapter4=s;runtime(g);return g;
  };
  return {...api,visiblePoint,routeBarrier,aura,label,state};
});
