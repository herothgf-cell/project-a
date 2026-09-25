/* Personal legend rules. DOM-free, bounded effects, no randomly assigned classes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FateRules=api;})(globalThis,function(){
  'use strict';
  const PATHS={
    ripple:{name:'파문검',title:'무너지지 않는 검',glyph:'波',color:'#f3cd81',relic:'부러진 호위검',reason:'누군가의 마지막 방어선에 남은 칼. 금속이 아니라 버텨낸 호흡이 울린다.',proof:'Q 파문세로 붉은 공격 예고가 끝날 때 공격을 한 번 받아낸 뒤 시험 잔상을 제압하세요.',ending:'피하라는 경보 속에서도, 너는 뒤에 선 사람의 길을 지켰다. 이제 파문은 네가 지키기로 한 곳에서 시작된다.',skills:[['파문세','波',12,4,'0.7초 받아내기. 성공하면 피해를 막고 반격하며 파문을 축적합니다.'],['역류참','逆',18,5,'전방 검격. 축적한 파문을 모두 소비해 더 강하게 되돌립니다.'],['파천반월','天',0,16,'기세 100. 넓은 반월 검격과 자세 붕괴.']]},
    echo:{name:'잔영보',title:'두 하늘을 걷는 자',glyph:'影',color:'#b8a7ff',relic:'겹쳐진 발자국',reason:'같은 자리에 두 방향의 발자국이 남아 있다. 돌아온 흔적이 아니라, 아직 돌아오지 않은 너의 흔적이다.',proof:'적 가까이에서 Q 잔영각으로 잔향을 남기고, 5초 안에 R 귀환보로 돌아와 협공한 뒤 제압하세요.',ending:'누구도 돌아올 수 없다고 했던 길. 너는 남겨둔 자신의 발자국을 따라 돌아왔다. 다른 하늘도 이제 너의 발걸음을 기억한다.',skills:[['잔영각','影',12,3.6,'짧게 돌진하고 원래 위치에 5초 잔향을 남깁니다.'],['귀환보','歸',16,4.8,'길이 연결된 잔향으로 복귀하며 두 위치에서 협공합니다.'],['월흔난무','月',0,16,'기세 100. 세 잔향의 시간차 베기가 같은 전장을 가릅니다.']]},
    seal:{name:'경계봉인',title:'틈을 잇는 봉합사',glyph:'界',color:'#78e8d3',relic:'봉합된 비석',reason:'파괴된 비석의 금 사이로 풀 한 포기가 자랐다. 상처를 없애는 대신, 그 사이에 길을 만든 손길이 남아 있다.',proof:'적이 공격을 예고할 때 가까이에서 Q 쇄경진 또는 R 봉맥인으로 예고를 억제한 뒤 제압하세요.',ending:'사람들은 균열을 부수려 했다. 너는 세계가 다시 이어질 자리를 보았다. 봉인은 더 이상 문을 닫는 기술이 아니라 길을 잇는 약속이다.',skills:[['쇄경진','陣',18,6,'4초 결계. 안의 공격 예고를 억제하고 적을 느리게 하며 받는 피해를 줄입니다.'],['봉맥인','縛',16,5.5,'가까운 적 최대 2명을 속박하고 공격을 끊습니다. 보스의 속박은 짧습니다.'],['만경고정','定',0,16,'기세 100. 넓은 봉인진과 자세 붕괴, 진행 중인 공격 예고 억제.']]}
  };
  const names=['signature1','signature2','ultimate'];
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),valid=p=>typeof p==='string'&&Object.hasOwn(PATHS,p);
  const point=(id,x,y,label,kind,extra={})=>({id,x,y,label,kind,...extra});
  function install(areas){
    if(areas.sanctum)return;
    areas.village.points.push(point('sanctum',1040,760,'무명 비경','fate-gate',{need:12,to:'sanctum'}));
    areas.city.points.push(point('heart',920,690,'경계의 심장','fate-gate',{need:12,to:'heart'}));
    const exit=world=>point('exit',150,970,world==='무림'?'청운촌으로 귀환':'헌터 기지로 귀환','exit');
    areas.sanctum={name:'무명 비경 · 세 갈래의 숨결',sub:'정해진 후계자는 없다. 네 행동이 비로소 전설을 쓴다.',theme:'sanctum',world:'무림',chapter:3,safe:false,w:1500,h:1080,spawn:[650,900],positions:[],hp:100,bossHp:200,damage:12,
      points:[exit('무림'),point('relic-ripple',470,580,PATHS.ripple.relic,'relic',{path:'ripple'}),point('relic-echo',760,420,PATHS.echo.relic,'relic',{path:'echo'}),point('relic-seal',1050,580,PATHS.seal.relic,'relic',{path:'seal'})],
      blocks:[{x:90,y:130,w:160,h:250,kind:'rock'},{x:570,y:120,w:390,h:150,kind:'temple'},{x:1220,y:220,w:160,h:210,kind:'templeruin'},{x:1100,y:870,w:210,h:100,kind:'pond'}],
      roads:[[[150,970],[650,900],[750,730],[760,420]],[[470,580],[750,730],[1050,580]]]};
    areas.heart={name:'경계의 심장 · 무명의 증명',sub:'이번에는 사부의 검이 아니라, 네가 완성한 무공으로.',theme:'heart',world:'현실',chapter:3,safe:false,w:1500,h:1080,spawn:[175,920],hp:135,bossHp:950,damage:17,boss:'경계 포식자',bossKind:'sentinel',mob:'틈새의 추격자',mobKind:'shade',positions:[[390,850],[600,720],[800,770],[920,550],[1170,410],[1280,230]],
      points:[exit('현실'),point('heart-seal1',520,860,'균열 매듭 · 귀환','seal'),point('heart-seal2',1090,555,'균열 매듭 · 약속','seal')],
      blocks:[{x:110,y:150,w:175,h:240,kind:'ruin'},{x:350,y:480,w:135,h:140,kind:'container'},{x:640,y:220,w:160,h:195,kind:'ruin'},{x:985,y:830,w:190,h:100,kind:'ruin'},{x:1310,y:550,w:140,h:180,kind:'ruin'}],
      roads:[[[150,970],[390,850],[780,780],[920,550],[1280,230]]]};
  }
  function initial(){return {stage:0,path:null,discovered:[],proven:[],feats:{ripple:0,echo:0,seal:0},focus:0};}
  function reset(g){g.combat={parry:0,charges:0,echo:null,field:null,pending:[]};g.trial=null;g.hitStop=0;g.fate.focus=0;for(const a of names)g.player.cool[a]=0;}
  function init(g){g.fate=initial();reset(g);}
  function active(g){return g.trial?.path||g.fate.path;}
  function info(g,a){if(!names.includes(a))return null;const p=active(g),i=names.indexOf(a),s=p?PATHS[p].skills[i]:['미완성 기연','?',0,0,'비경에서 자신의 기연을 발견하세요.'];return {name:s[0],glyph:s[1],cost:s[2],cool:s[3],description:s[4],need:0,key:['Q','R','F'][i],locked:!p||(a==='ultimate'&&(!g.fate.path||!!g.trial)),path:p};}
  function entry(g){reset(g);}
  function note(g,path){g.fate.feats[path]=Math.min(999999,g.fate.feats[path]+1);g.fate.focus=Math.min(100,g.fate.focus+20);if(g.trial?.path===path&&!g.trial.feat){g.trial.feat=true;g.toast('기연의 호흡을 증명했습니다! 이제 시험 잔상을 제압하세요.');}}
  function strike(g,e,amount,source='signature'){return g.strike(e,Math.round(g.stats().attack*amount),source);}
  function targets(g,origin,radius){return g.enemies.filter(e=>e.hp>0&&dist(e,origin)<=radius+e.r&&g.lineClear(origin,e));}
  function areaHit(g,origin,radius,mult,source='signature'){let n=0;for(const e of targets(g,origin,radius))if(strike(g,e,mult,source)>0)n++;return n;}
  function emit(g,kind,x,y,extra={}){g.effect(kind,x,y,{path:active(g),life:.65,max:.65,...extra});}
  function begin(g,path){
    if(g.area!=='sanctum'||g.fate.stage<2||!valid(path)||!g.fate.discovered.includes(path))return false;
    reset(g);g.fx=[];g.enemies=[];g.trial={path,feat:false};const p=g.player;Object.assign(p,{x:720,y:800,face:-Math.PI/2,hp:g.stats().hp,mp:g.stats().mp,invuln:1,dash:0});
    const hp=Math.max(175,g.stats().attack*5);g.enemies.push({id:'trial-'+path,name:'시험 잔상 · '+PATHS[path].name,kind:path==='ripple'?'chief':path==='echo'?'masked':'guardian',x:760,y:710,r:23,hp,maxHp:hp,boss:false,damage:12,speed:70,cd:.9,wind:0,windMax:1.3,tx:760,ty:710,range:95,flash:0,attacks:0,pattern:'strike',rewarded:false,trial:true});
    g.emit('dialog',{title:PATHS[path].name+' · 빌린 호흡',text:PATHS[path].proof+'\n\n시험 중 무공은 임시로 빌린 힘입니다. 실패해도 다시 도전할 수 있습니다. Q / R 버튼을 확인하세요.',portrait:'hero'});return true;
  }
  function accept(g,path){
    if(g.area!=='village'||g.fate.stage<2||!valid(path)||!g.fate.proven.includes(path)||g.trial)return false;
    const first=!g.fate.path;g.fate.path=path;g.fate.stage=Math.max(3,g.fate.stage);reset(g);g.player.hp=g.stats().hp;g.player.mp=g.stats().mp;
    if(first)g.gold=Math.min(999999,g.gold+100);
    g.emit('awakening',{title:(first?'나의 무공 · ':'다시 해석한 무공 · ')+PATHS[path].name,text:'이것은 정해진 직업이 아니다.\n네가 직접 겪고 증명한 호흡에 붙인 이름이다.\n\n'+PATHS[path].skills.map((s,i)=>['Q','R','F'][i]+' · '+s[0]).join('\n')+'\n\n현실의 서린에게 돌아가 이 힘을 증명하세요.',path,portrait:'hero'});return true;
  }
  function interact(g,o){
    const f=g.fate;
    if(o.kind==='fate-gate'){
      const need=o.to==='sanctum'?2:4;if(g.progress<12||f.stage<need)return {type:'dialog',title:'아직 응답하지 않는 경계',text:'제2장을 마친 뒤 서린과 백련에게 이야기를 듣고 자신의 호흡을 찾으세요.'};
      g.enter(o.to);return {type:'travel'};
    }
    if(g.progress<12)return null;
    if(o.id==='warden'){
      if(f.stage===0){f.stage=1;return {type:'dialog',title:'제3장 · 이름 없는 전설',text:'제2장 완료. 그런데 네가 없는 자리에서 검의 흔적이 나타났어.\n다른 헌터는 아무것도 보지 못했는데 너는 그 흔적을 읽었지.\n\n이번에는 누군가의 기술을 따라 배우는 일이 아닐지도 몰라.\n백련 사부에게 이 흔적을 보여줘.',portrait:'warden'};}
      if(f.stage===3){f.stage=4;return {type:'dialog',title:'서린 · '+PATHS[f.path].title,text:'그 호흡은 기록된 어떤 무공과도 조금 달라.\n네가 겪은 사건이 검에 남은 것 같아.\n\n기지 동쪽 「경계의 심장」이 열렸어.\n호위와 두 매듭을 끊고 포식자를 막아 줘. 네 방식대로.',portrait:'warden'};}
      if(f.stage===5){f.stage=6;g.gold=Math.min(999999,g.gold+160);return {type:'awakening',title:'제3장 완료 · '+PATHS[f.path].title,text:PATHS[f.path].ending+'\n\n별호 획득 · '+PATHS[f.path].title+'\n금화 +160\n\n백련에게 돌아가 다른 증명된 계열로 재수련하거나, 비경에서 남은 흔적을 탐구할 수 있습니다.',path:f.path,portrait:'warden'};}
      if(f.stage>=6)return {type:'dialog',title:'서린 · 돌아온 전설',text:PATHS[f.path].ending+'\n\n기연 도감에서 네가 증명한 이야기를 돌아볼 수 있어.',portrait:'warden'};
    }
    if(o.id==='master'){
      if(f.stage===1){f.stage=2;return {type:'dialog',title:'백련 · 정해지지 않은 후계자',text:'무명 비경에는 주인을 기다리는 세 흔적이 있다.\n부러진 검, 겹쳐진 발자국, 봉합된 비석.\n\n각 흔적을 조사하고 그 힘을 잠시 빌려 써보거라.\n행동으로 증명한 길만 네 것으로 받아들일 수 있다.\n모두 시험해도 좋다. 최종 선택은 네 몫이다.\n\n동남쪽 무명 비경으로 향하자.',portrait:'master'};}
      if(f.stage>=2)return {type:'fate-choice',text:f.proven.length?'네가 증명한 호흡을 네 이름으로 받아들이겠느냐?':'비경에서 흔적을 조사하고 시험을 통과하거라. 잘못 골라도 잃는 것은 없다.'};
    }
    if(o.kind==='relic'){
      if(f.stage<2)return {type:'toast',text:'먼저 백련 사부에게 무명 비경에 대해 물어보세요.'};
      if(g.trial)return {type:'toast',text:'현재 시험을 마치거나, 출구에서 거점으로 돌아간 뒤 다시 조사하세요.'};
      if(!f.discovered.includes(o.path))f.discovered.push(o.path);
      return {type:'fate-trial',path:o.path,title:PATHS[o.path].relic,text:PATHS[o.path].reason+'\n\n'+PATHS[o.path].proof};
    }
    return null;
  }
  function objective(g,areas){
    const f=g.fate,a=areas[g.area];if(g.progress<12)return null;
    let target,title='이름 없는 전설',text='';
    if(g.area==='sanctum'){
      if(g.trial){const e=g.enemies.find(e=>e.hp>0);target=e?{...e,label:e.name,kind:'enemy'}:a.points[0];title=PATHS[g.trial.path].name+' · 증명의 시간';text=g.trial.feat?'호흡을 증명했습니다. 시험 잔상을 제압하세요.':PATHS[g.trial.path].proof;}
      else if(f.proven.length){target=a.points[0];title='네가 완성한 호흡';text='백련에게 돌아가 증명한 계열을 수락하세요. 다른 흔적도 자유롭게 조사할 수 있습니다.';}
      else {target=a.points.find(o=>o.kind==='relic'&&!f.discovered.includes(o.path))||a.points.find(o=>o.kind==='relic');text='세 흔적 중 마음이 가는 것을 조사하세요. 힘을 시험해도 아직 계열은 확정되지 않습니다.';}
    }else if(g.area==='heart'){
      if(f.stage>=5){target=a.points[0];text='포식자를 막았습니다. 헌터 기지의 서린에게 돌아가 보고하세요.';}
      else {const e=g.enemies.find(e=>e.hp>0&&!e.boss);const seal=a.points.find(o=>o.kind==='seal'&&!g.activated.includes(o.id));const b=g.enemies.find(e=>e.hp>0&&e.boss);target=e?{...e,label:e.name,kind:'enemy'}:seal|| (b?{...b,label:b.name,kind:'enemy'}:a.points[0]);text=e?'네가 완성한 무공으로 호위들을 제압하세요.':seal?'균열 매듭에 접근해 E / 대화·이동으로 해제하세요.':'보호막이 사라졌습니다. 기세를 모아 F / 오의를 사용해 보세요.';}
    }else if(a.safe){
      const ids=g.area==='city'?{0:'warden',1:'portal',2:'portal',3:'warden',4:'heart',5:'warden',6:'portal'}:{0:'portal',1:'master',2:f.proven.length?'master':'sanctum',3:'portal',4:'portal',5:'portal',6:'master'};
      target=a.points.find(o=>o.id===ids[f.stage]);text=f.stage===0?'서린과 대화해 제3장을 시작하세요.':f.stage===2?(f.proven.length?'증명한 기연을 백련에게서 수락하세요.':'무명 비경에서 흔적을 조사하고 임시 무공을 시험하세요.'):f.stage===6?'제3장 완료. 백련에게 재수련하거나 비경에서 다른 가능성을 탐구하세요.':`금빛 방향 표식을 따라 ${target?.label||'다음 목표'}에게 향하세요.`;
    }
    return target?{title,text,target,chapter:3}:null;
  }
  function incoming(g,e,damage){
    const c=g.combat,p=g.player,path=active(g);
    if(path==='ripple'&&c.parry>0){const perfect=c.parry>.42;c.parry=0;c.charges=Math.min(3,c.charges+(perfect?2:1));note(g,'ripple');emit(g,'fate-parry',p.x,p.y,{perfect});g.effect('text',p.x,p.y-80,{text:perfect?'정파 · 받아내기':'파문 · 반격',color:PATHS.ripple.color,life:1,max:1});strike(g,e,perfect?1.8:1.25);e.stun=.5;g.hitStop=.045;g.emit('sound',{name:'parry'});return 0;}
    if(c.field&&dist(p,c.field)<c.field.radius){if(path==='seal')note(g,'seal');return Math.round(damage*.45);}
    return damage;
  }
  function act(g,action){
    const k=info(g,action),p=g.player,path=active(g),c=g.combat;if(!k||k.locked||p.hp<=0||p.cool[action]>0||p.mp<k.cost)return false;
    if(action==='ultimate'&&g.fate.focus<100)return false;
    if(path==='echo'&&action==='signature2'&&(!c.echo||!g.lineClear(p,c.echo)||g.blocked(c.echo.x,c.echo.y,p.r)))return false;
    p.mp-=k.cost;p.cool[action]=k.cool;p.swing=.3;
    if(action==='ultimate'){
      g.fate.focus=0;g.hitStop=.04;g.shake=.2;g.emit('ultimate',{title:k.name,path});g.emit('sound',{name:'ultimate'});emit(g,'fate-ultimate',p.x,p.y,{life:1.2,max:1.2,range:310});
      if(path==='echo'){for(let i=0;i<3;i++)c.pending.push({delay:i*.18,x:p.x,y:p.y,radius:260,mult:2,source:'ultimate'});}
      else {areaHit(g,p,310,path==='ripple'?5.5:4.8,'ultimate');for(const e of targets(g,p,310)){e.wind=0;e.stun=e.boss?1.1:2.4;}if(path==='seal')c.field={x:p.x,y:p.y,radius:240,life:6};c.charges=0;}
      return true;
    }
    g.emit('sound',{name:path});
    if(path==='ripple'){
      if(action==='signature1'){c.parry=.7;emit(g,'fate-guard',p.x,p.y,{life:.7,max:.7});}
      else {const mult=2.2+c.charges*.9;c.charges=0;const nearest=targets(g,p,230).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(nearest)p.face=Math.atan2(nearest.y-p.y,nearest.x-p.x);for(const e of targets(g,p,230))if(Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-p.face)>-.05)strike(g,e,mult);emit(g,'fate-wave',p.x,p.y,{angle:p.face,range:230});}
    }else if(path==='echo'){
      if(action==='signature1'){c.echo={x:p.x,y:p.y,life:5,face:p.face};p.dash=.17;p.invuln=.35;p.dx=Math.cos(p.face);p.dy=Math.sin(p.face);emit(g,'fate-trail',p.x,p.y,{angle:p.face});}
      else {const old={x:p.x,y:p.y},echo=c.echo;c.echo=null;p.dash=0;p.x=echo.x;p.y=echo.y;p.invuln=.25;const hits=areaHit(g,old,145,1.4)+areaHit(g,p,165,1.6);if(hits)note(g,'echo');emit(g,'fate-link',p.x,p.y,{tx:old.x,ty:old.y});}
    }else {
      if(action==='signature1'){c.field={x:p.x,y:p.y,radius:165,life:4};for(const e of targets(g,p,165))if(e.wind>0){e.wind=0;e.cd=1;note(g,'seal');}emit(g,'fate-seal',p.x,p.y,{range:165,life:.9,max:.9});}
      else {const victims=targets(g,p,260).sort((a,b)=>dist(a,p)-dist(b,p)).slice(0,2);for(const e of victims){if(e.wind>0)note(g,'seal');e.wind=0;e.cd=.9;e.root=e.boss?.65:1.8;strike(g,e,2.2);emit(g,'fate-chain',p.x,p.y,{tx:e.x,ty:e.y});}}
    }
    return true;
  }
  function tick(g,dt){
    const c=g.combat;c.parry=Math.max(0,c.parry-dt);
    if(c.echo){c.echo.life-=dt;if(c.echo.life<=0)c.echo=null;}
    if(c.field){c.field.life-=dt;if(c.field.life<=0)c.field=null;}
    const ready=[];for(const hit of c.pending){hit.delay-=dt;if(hit.delay<=0)ready.push(hit);}c.pending=c.pending.filter(h=>h.delay>0);
    for(const hit of ready){areaHit(g,hit,hit.radius,hit.mult,hit.source);emit(g,'fate-wave',hit.x,hit.y,{angle:hit.delay*5+g.player.face,range:hit.radius});}
  }
  function speed(g,e){return g.combat.field&&dist(e,g.combat.field)<g.combat.field.radius?.4:1;}
  function reward(g,e){
    if(e.trial){if(!g.trial?.feat)return true;const path=g.trial.path;const first=!g.fate.proven.includes(path);if(first){g.fate.proven.push(path);g.gold=Math.min(999999,g.gold+40);}g.trial=null;g.combat.echo=null;g.combat.field=null;g.emit('trial-complete',{title:'증명 완료 · '+PATHS[path].name,text:'빌린 기술이 네 행동을 통해 다른 호흡이 되었다.\n\n백련에게 돌아가 이 길을 받아들일 수 있습니다.\n다른 흔적을 시험한 뒤 결정해도 좋습니다.',path});return true;}
    if(e.boss&&g.area==='heart'){if(g.fate.stage===4)g.fate.stage=5;g.emit('victory',{title:'경계의 심장을 넘어',text:PATHS[g.fate.path]?.ending+'\n\n기지의 서린에게 돌아가 보고하세요.'});return true;}return false;
  }
  function validate(raw,progress){
    if(!raw||Array.isArray(raw)||!Number.isInteger(raw.stage)||raw.stage<0||raw.stage>6||raw.path!==null&&!valid(raw.path))throw Error('기연 저장이 손상되었습니다.');
    const clean=initial();clean.stage=raw.stage;clean.path=raw.path;
    for(const key of ['discovered','proven']){if(!Array.isArray(raw[key])||raw[key].length>3||raw[key].some(p=>!valid(p))||new Set(raw[key]).size!==raw[key].length)throw Error('기연 증거가 손상되었습니다.');clean[key]=raw[key].slice();}
    if(clean.proven.some(p=>!clean.discovered.includes(p))||clean.stage>=3&&(!clean.path||!clean.proven.includes(clean.path))||clean.stage<3&&clean.path||progress<12&&clean.stage>0)throw Error('기연 진행이 일치하지 않습니다.');
    if(!raw.feats||typeof raw.feats!=='object')throw Error('기연 행적이 없습니다.');for(const key of Object.keys(PATHS)){const v=raw.feats[key];if(!Number.isInteger(v)||v<0||v>999999)throw Error('기연 행적 값이 잘못되었습니다.');clean.feats[key]=v;}
    if(!Number.isFinite(raw.focus)||raw.focus<0||raw.focus>100)throw Error('잘못된 기세입니다.');clean.focus=0;return clean;
  }
  return {PATHS,names,install,init,entry,active,info,interact,objective,begin,accept,incoming,act,tick,speed,reward,validate};
});
