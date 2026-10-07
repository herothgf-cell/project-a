/* Observe -> experiment -> choose an interpretation. No network, no auto-class award. */
(function(root,factory){const n=typeof module==='object'&&module.exports;const x=factory(n?require('./sequel.js'):root.ChronicleRules,n?require('./journey-data.js'):root.JourneyData);if(n)module.exports=x;else root.JourneyRules=x;})(globalThis,function(api,D){
 'use strict';
 const {Game,AREAS,Fate,dist}=api,P=Game.prototype;
 const old=Object.fromEntries(['enter','interact','act','step','strike','takeHit','reward','save','stats','skillInfo','objective','target'].map(k=>[k,P[k]])),loadOld=Game.load;
 D.install(AREAS);
 const S=g=>g.journey||(g.journey=D.initial());
 const reset=g=>(g.experimentRuntime={pulse:null,timer:1,serial:0,echo:null,seen:new Set(),pending:[],guard:null,charge:0,lastAction:-100,focus:false,seq:0,companion:null,sense:0,held:false});
 const R=g=>g.experimentRuntime||reset(g);
 const dialog=(title,text,portrait='hero')=>({type:'dialog',title,text,portrait});
 const active=g=>!g.trial&&S(g).selected[Fate.active(g)];
 const record=(g,id)=>{if(g.worldGrowth)return false;const s=S(g);if(!Object.hasOwn(D.facts,id)||s.facts.some(f=>f.id===id))return false;s.facts.push({id,area:g.area,at:g.playTime});g.toast(D.facts[id]);return true;};
 function learn(g,key){if(g.worldGrowth)return false;const s=S(g),v=D.variants[key];if(!v||s.known.includes(key)||!s.items.includes(v.path)||!s.facts.some(f=>f.id==='sense-'+v.path))return false;
  record(g,'proof-'+key);s.known.push(key);s.sync[key]=0;const p=g.player;g.effect('interpret-'+key,p.x,p.y,{path:v.path,color:v.color,range:180,life:1.3,max:1.3});g.emit('sound',{name:v.path});g.hitStop=.045;
  g.emit('interpretation',{key,title:'이름보다 먼저 움직인 힘',text:D.facts['proof-'+key]+'\n\n'+v.name+'\n'+v.description,portrait:'hero'});return true;
 }
 P.points=function(){const seed=S(this).seed%3,sites=[420,800,1140];return AREAS[this.area].points.map(o=>{if(this.area!=='archive'||!['discovery','experiment'].includes(o.kind))return o;const i=D.paths.indexOf(o.path);return {...o,x:sites[(i+seed)%3]+(o.kind==='experiment'?65:0),y:(o.kind==='experiment'?570:480)+[0,25,-25][seed]};});};
 function visiblePoint(g,o){if(!api.visiblePoint(g,o))return false;const s=S(g);if(o.id==='archiveGate')return g.progress>=2;if(o.id==='stationGate')return s.phase>=3;if(o.path==='station')return true;
  if(o.kind==='discovery')return s.facts.some(f=>f.id===(o.path==='station'?'station-sense':'sense-'+o.path))||R(g).sense>0&&dist(g.player,o)<=g.senseRange();return true;}
 P.nearestPoint=function(){return this.points().filter(o=>visiblePoint(this,o)&&dist(o,this.player)<90).sort((a,b)=>dist(a,this.player)-dist(b,this.player))[0]||null;};
 P.senseRange=function(){return 260+(S(this).lens?80:0);};
 P.sense=function(){const p=this.player;if(this.progress<2||p.hp<=0||p.cool.sense>0)return false;p.cool.sense=2.5;R(this).sense=4;
  this.effect('qi-sense',p.x,p.y,{range:this.senseRange(),life:1.1,max:1.1});this.emit('sound',{name:'seal'});
  for(const o of this.points().filter(x=>x.kind==='discovery'))if(dist(p,o)<=this.senseRange())record(this,o.path==='station'?'station-sense':'sense-'+o.path);
  if(R(this).pulse?.wind>0)R(this).pulse.read=true;return true;
 };
 P.enter=function(id){S(this);const from=this.area,ok=old.enter.call(this,id);if(!ok)return false;reset(this);this.player.cool.sense=0;
  if(!this.worldGrowth&&AREAS[from]?.world==='무림'&&AREAS[id].world==='현실'){const s=S(this),key=active(this);if(key&&s.sync[key]===0){s.sync[key]=1;this.emit('dialog',{title:'계단 아래에서 한 번 더 울린 발소리',text:'몸에 남긴 새 호흡이 현실에서도 잠깐 움직였다.\n기존 무공은 그대로 쓸 수 있다. 새 해석을 실제 적과 마주한 순간 다시 재현해 보자.',portrait:'hero'});}}
  return true;
 };
 P.chooseInterpretation=function(key){const s=S(this),v=D.variants[key];if(!v||!s.known.includes(key)||Fate.active(this)!==v.path||this.trial||(!AREAS[this.area].safe&&this.area!=='archive'))return false;s.selected[v.path]=key;R(this).pending=[];R(this).charge=0;R(this).guard=null;this.toast(v.name+' · 내 호흡으로 이어갑니다.');if(s.phase===1)s.phase=2;return true;};
 P.clearInterpretation=function(){if((!AREAS[this.area].safe&&this.area!=='archive')||this.trial)return false;const p=Fate.active(this);if(p)S(this).selected[p]=null;reset(this);return true;};
 P.interact=function(){const o=this.nearestPoint(),s=S(this),r=R(this);if(!o)return old.interact.call(this);
  if(o.id==='archiveGate'){this.enter('archive');return {type:'travel'};}
  if(o.id==='stationGate'){if(s.phase<3)return dialog('응답하지 않는 관측소','서린과 현장 재현에 대해 이야기하자.');this.enter('station');return {type:'travel'};}
  if(o.kind==='discovery'&&D.paths.includes(o.path)){
   if(!s.items.includes(o.path)){s.items.push(o.path);record(this,'item-'+o.path);return dialog(o.label,D.facts['item-'+o.path]+'\n\n읽히지 않는 부분이 있다. 주변의 기운을 살피고, 움직이는 울림에 직접 반응해 보자.\n관찰 수첩(N)에는 확인한 사실만 남는다.');}
   if(o.path==='seal'&&r.pulse?.path==='seal'&&r.pulse.wind>0){learn(this,'seal-hold');r.pulse=null;return {type:'toast',text:'파동이 한 자리에 머물렀다.'};}
   return dialog(o.label,D.facts['sense-'+o.path]+'\n\n'+(o.path==='echo'?'울림 속에서 회피하면 발자국이 잠깐 남는다. 돌아가거나, 벗어난 자리에서 검을 움직여 보자.':o.path==='ripple'?'몰려오는 울림의 끝을 보거나, 곁에 남은 수호 석판을 살펴보자.':'몰려오는 기운에 손을 대거나, 기감을 펼쳐 옆 수로를 살펴보자.'));}
  if(o.id==='anchor-ripple'&&r.pulse?.path==='ripple'&&r.pulse.wind>0){learn(this,'ripple-guard');r.pulse=null;return {type:'toast',text:'석판 뒤에 작은 고요가 남았다.'};}
  if(o.id==='anchor-seal'&&r.pulse?.path==='seal'&&r.pulse.wind>0&&r.pulse.read){learn(this,'seal-guide');r.pulse=null;return {type:'toast',text:'울림이 수로를 따라 흘렀다.'};}
  if(o.kind==='experiment')return dialog(o.label,'지금은 고요하다. 가까운 물건을 기감으로 읽어 보고 울림이 모일 때 다시 살펴보자.');
  return old.interact.call(this);
 };
 P.act=function(action,...args){if(action==='sense')return this.sense();const r=R(this),s=S(this),p=this.player,at={x:p.x,y:p.y,face:p.face};
  const result=old.act.call(this,action,...args);if(!result)return result;r.lastAction=this.playTime;
  if(this.area==='archive'){
   const q=r.pulse;
   if(action==='attack'&&!args[0]&&q?.path==='ripple'&&q.wind>0&&q.wind<=.34&&dist(p,q)<110){learn(this,'ripple-return');r.pulse=null;}
   if(action==='dash'&&q?.path==='echo'&&q.wind>0&&dist(p,q)<110&&s.items.includes('echo')){r.echo={...at,until:this.playTime+3,moved:false};this.effect('discovery-mark',p.x,p.y,{life:3,max:3});}
   if(action==='attack'&&r.echo?.moved&&this.playTime<r.echo.until&&dist(p,r.echo)>60){learn(this,'echo-replay');r.echo=null;}
  }
  return result;
 };
 P.step=function(dt,input={}){const before=this.playTime;old.step.call(this,dt,input);const d=this.playTime-before;if(d<=0)return;const r=R(this),s=S(this);r.sense=Math.max(0,r.sense-d);
  if(this.area==='archive'){
   if(r.echo){if(dist(this.player,r.echo)>60)r.echo.moved=true;if(r.echo.moved&&dist(this.player,r.echo)<25){learn(this,'echo-return');r.echo=null;}else if(this.playTime>r.echo.until)r.echo=null;}
   if(r.pulse){r.pulse.wind-=d;if(r.pulse.wind<=0){this.effect('discovery-wave',r.pulse.x,r.pulse.y,{range:125,life:.7,max:.7,path:r.pulse.path});r.pulse=null;r.timer=2.5;}}
   else {r.timer-=d;if(r.timer<=0){const o=this.points().find(o=>o.kind==='discovery'&&s.items.includes(o.path)&&dist(this.player,o)<180);if(o){r.pulse={path:o.path,x:o.x,y:o.y,wind:1.6,max:1.6,serial:++r.serial,read:false};r.timer=3;}else r.timer=.4;}}
  }
 };
 function validate(raw){const s=D.initial();if(!raw||Array.isArray(raw)||!Number.isInteger(raw.seed)||raw.seed<1||raw.seed>2147483647)throw Error('여정의 씨앗이 손상되었습니다.');
  if(raw.directProgression!==undefined&&typeof raw.directProgression!=='boolean')throw Error('직접 진행 상태 오류');
  for(const [k,max]of Object.entries({phase:5,realm:1,materials:9999}))if(!Number.isInteger(raw[k])||raw[k]<0||raw[k]>max)throw Error('잘못된 여정 수치: '+k);
  for(const k of ['lens','companion','measured','boss','promise'])if(typeof raw[k]!=='boolean')throw Error('잘못된 여정 상태');
  if(!['flow','focus'].includes(raw.breath)||!['미평가','현장 재평가 중','C급 현장 인증'].includes(raw.rank))throw Error('성장 상태가 올바르지 않습니다.');
  const unique=(xs,max,ok)=>Array.isArray(xs)&&xs.length<=max&&new Set(xs).size===xs.length&&xs.every(ok);
  if(!unique(raw.items,3,p=>D.paths.includes(p))||!unique(raw.known,6,k=>Object.hasOwn(D.variants,k))||!unique(raw.worlds,2,k=>['현실','무림'].includes(k)))throw Error('여정 목록이 올바르지 않습니다.');
  if(!Array.isArray(raw.facts)||raw.facts.length>24||!unique(raw.facts.map(f=>f?.id),24,id=>Object.hasOwn(D.facts,id)))throw Error('관찰 기록이 올바르지 않습니다.');
  for(const f of raw.facts)if((f.id==='yeonhwa-letter'?f.area!=='village':f.id==='station-sense'?f.area!=='station':f.area!=='archive')||!Object.hasOwn(AREAS,f.area)||!Number.isFinite(f.at)||f.at<0||f.at>1e10)throw Error('관찰의 장소/시간 오류');
  const has=id=>raw.facts.some(f=>f.id===id);
  if(raw.facts.some(f=>f.id.startsWith('proof-')&&!raw.known.includes(f.id.slice(6))))throw Error('해석과 증거가 일치하지 않습니다.');
  for(const p of raw.items)if(!has('item-'+p)||!has('sense-'+p))throw Error('물건의 관찰 근거가 없습니다.');
  for(const k of raw.known)if(!raw.items.includes(D.variants[k].path)||!has('proof-'+k)||![0,1,2].includes(raw.sync?.[k]))throw Error('해석의 근거가 없습니다.');
  if(!raw.selected||!raw.mastery||!raw.sync||Object.keys(raw.sync).some(k=>!raw.known.includes(k)))throw Error('해석 상태가 올바르지 않습니다.');
  for(const p of D.paths)if(raw.selected[p]!==null&&(!raw.known.includes(raw.selected[p])||D.variants[raw.selected[p]]?.path!==p))throw Error('미해석 무공은 장착할 수 없습니다.');
  for(const p of ['sword',...D.paths])if(!Number.isInteger(raw.mastery[p])||raw.mastery[p]<0||raw.mastery[p]>30)throw Error('무공 숙련이 손상되었습니다.');
  if(!raw.directProgression&&raw.phase>=2&&!raw.known.length||raw.phase>=4&&!raw.boss||raw.phase===5&&raw.rank!=='C급 현장 인증'||raw.phase<5&&raw.rank==='C급 현장 인증')throw Error('현실 재평가 기록이 일치하지 않습니다.');
  if(raw.realm&&(Object.values(raw.mastery).reduce((a,b)=>a+b,0)<8||raw.worlds.length<2||!raw.known.length))throw Error('경지의 근거가 없습니다.');
  if(raw.phase>=4&&(!raw.measured||!raw.directProgression&&!has('station-sense'))||!raw.directProgression&&raw.measured&&!Object.values(raw.sync).includes(2)||raw.promise&&!has('yeonhwa-letter'))throw Error('실전 재현 기록이 없습니다.');
  for(const k of Object.keys(s))s[k]=k==='directProgression'?raw[k]===true:JSON.parse(JSON.stringify(raw[k]));return s;
 }
 P.save=function(){const d=JSON.parse(old.save.call(this));d.version=6;d.journey=S(this);return JSON.stringify(d);};
 Game.load=function(text){const d=JSON.parse(text);if(!d||typeof d!=='object')throw Error('손상된 저장입니다.');const s=d.version===6?validate(d.journey):D.initial();if(d.version===6){if(s.phase>0&&d.chapter4?.phase!==4)throw Error('이전 이야기를 완료하지 않았습니다.');d.version=5;}
  const g=loadOld.call(this,JSON.stringify(d));g.journey=s;reset(g);g.player.cool.sense=0;g.events=[];return g;
 };
 return {...api,Data:D,state:S,runtime:R,record,learn,active,visiblePoint,validate};
});
