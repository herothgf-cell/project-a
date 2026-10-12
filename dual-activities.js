/* Post-return activities share one completion contract and existing combat rendering. */
(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./dual-progression.js'):root.DualProgression,n?require('./murim-growth.js'):root.MurimGrowth,n?require('./murim-loadout.js'):root.MurimLoadout,n?require('./boundary-resonance.js'):root.BoundaryResonance,n?require('./world-growth.js'):root.WorldGrowth,n?require('./game.js'):root.DualWorld);if(n)module.exports=api;else root.DualActivities=api;})(globalThis,function(P,M,L,R,G,Engine){
 'use strict';
 const names={samjae:'삼재검격',arc:'횡검','plum-first':'매화노방','plum-second':'매화접무','plum-third':'매화토염',g1:'집중 타격',g2:'연속 타격',r1:'마력 개화'};
 const state=g=>g.worldState?.dualProgression,active=g=>!!state(g),ready=g=>g.worldState?.murimJourney?.stage==='complete';
 const real=g=>G.worldOf(g)==='reality';
 const safe=g=>active(g)&&g.player.hp>0&&!g.enemies.some(e=>e.hp>0)&&(!state(g).run||state(g).run.segment===1&&!g.loopRuntime?.started);
 const areaFor=(kind,v)=>kind==='raid'||v==='r1'?'realityLoop':'murimLoop';
 const skillFor=a=>({attack:'samjae',moon:'arc',storm:'plum-first'})[a]||a;
 function info(g,id){const s=state(g);if(!s||!['g1','g2','r1'].includes(id))return null;const rank=s.upgrades[id],row={g1:[14,3,'즉시 전방 타격 · 공격력 1.8배'],g2:[20,5,'첫 타격 1.0배 → 같은 적 연속 적중 1.8배'],r1:[18-(rank===2?2:0),8,'전방 가까운 적 위치에 0.8초 후 범위 공격 · 2.4배']}[id];return {name:names[id],cost:row[0],cool:row[1],description:row[2],need:0,locked:id==='r1'&&!s.r1,hidden:false,cooldownKey:'dual-'+id,techniqueId:id,glyph:id==='r1'?'梅':'斬'};}
 function reason(g,id){const s=state(g);if(!s)return '안정화 사건 완료 필요';if(!safe(g)||!real(g))return '현실 거점 또는 안전 지점 필요';const b=R.balance(g);if(id==='r1-learn')return s.r1?'이미 학습함':s.counts['plum-first']<3?'노방을 사용한 전투·수련 완료 3회 필요':b.seal<1||b.crystal<2?'각인 1 · 공명 결정 2 필요':'';const rank=s.upgrades[id];return rank===undefined?'알 수 없는 기술':id==='r1'&&!s.r1?'먼저 학습 필요':rank>=2?'최대 강화':s.counts[id]<(rank?8:3)?`완료 숙련 ${rank?8:3}회 필요`:b.crystal<(rank?3:2)?`공명 결정 ${rank?3:2} 필요`:'';}
 function populate(g){const s=state(g),r=s?.run;if(!r)return;P.retry(s);g.enemies=[];g.fx=[];g.activated=[];g.loopRuntime={started:r.segment===0,hits:0,casts:new Set(),pending:[],clock:0,exposed:0,respawn:0,pattern:0,failed:false};Object.assign(g.player,{x:300,y:620,hp:g.stats().hp,mp:g.stats().mp,invuln:1,dash:0});for(const k in g.player.cool)g.player.cool[k]=0;g.loopRuntime.heals=2;
  if(r.segment===0)spawnSegment(g);else g.toast('체크포인트 · 편성을 확인하고 다음 구간을 시작하세요.');
 }
 function enemy(g,id,x,y,hp,extra={}){const e={id:'dual-'+id,x,y,r:20,hp,maxHp:hp,boss:false,name:'균열 잔영',kind:real(g)?'drone':'bandit',damage:12,speed:72,cd:1,wind:0,windMax:1,tx:x,ty:y,range:70,flash:0,attacks:0,pattern:'strike',rewarded:false,dual:true,...extra};g.enemies.push(e);return e;}
 function spawnSegment(g){const r=state(g).run,rt=g.loopRuntime;rt.started=true;rt.hits=0;rt.casts=new Set();rt.pending=[];g.enemies=[];
  if(r.kind==='training'){const hp=r.segment?180:1000;enemy(g,'practice',570,620,hp,{name:r.segment?'적용 과제':'기본 과제 · 지정 기술 2회',damage:8,speed:r.segment?55:0,practice:!r.segment,kind:'bandit'});return;}
  if(r.kind==='bounty'){const elite=r.variant==='elite';if(elite)enemy(g,'elite-'+r.segment,650,620,1100,{name:'산길 무사 · 빈틈 공략',damage:20,speed:65,r:27});else for(let i=0;i<3;i++)enemy(g,'bandit-'+r.segment+'-'+i,540+i*130,500+i%2*200,340,{name:'산길 약탈자',kind:'bandit',damage:10});return;}
  if(!r.segment){for(let i=0;i<3;i++)enemy(g,'scout-'+i,550+i*140,510+i%2*200,160,{name:'역사 정찰 잔영',damage:10});return;}
  enemy(g,'boss',720,550,3000,{boss:true,name:'균열 갑각수',kind:'tide',r:36,damage:22,speed:0,phase:1,range:125,cd:1.5});
 }
 function supports(g){const rt=g.loopRuntime;rt.respawn=0;g.enemies=g.enemies.filter(e=>e.hp>0||e.boss);enemy(g,'support-left',460,420,160,{support:true,name:'균열 지지체',kind:'drone',speed:0});enemy(g,'support-right',940,720,160,{support:true,name:'균열 지지체',kind:'drone',speed:0});const r=state(g).run,max=r.variant==='core'?1:r.variant==='swarm'?3:2;for(let i=g.enemies.filter(e=>e.add&&e.hp>0).length;i<max;i++)enemy(g,'add-'+rt.pattern+'-'+i,480+i*35,470+i*30,100,{add:true,name:'소환 잔영',damage:8});g.toast('지지체 2개를 파괴하면 갑각이 6초간 노출됩니다.');}
 function progress(g){const s=state(g),r=s?.run,rt=g.loopRuntime;if(!r)return false;if(g.enemies.some(e=>e.hp>0))return false;if(!rt.started){spawnSegment(g);return true;}if(r.segment===0){P.checkpoint(s);populate(g);return true;}const receipt=P.finish(s);if(!receipt)return false;const world=real(g)?'reality':'murim';if(receipt.xp)G.grantExperience(g,{world,amount:receipt.xp});g.lastDualReceipt=receipt;g.enter(world==='murim'?'village':'city');g.toast(`완료 · ${receipt.skills.map(id=>names[id]+' 숙련 +1').join(', ')||'사용 기술 없음'} · 결정 ${receipt.crystal} · 수련첩 ${receipt.scroll} · 경험치 ${receipt.xp}`);return true;}
 function hits(g,id,x,y,range,mult,token,filter=()=>true){const found=[];for(const e of [...g.enemies])if(e.hp>0&&Math.hypot(e.x-x,e.y-y)<=range+e.r&&g.lineClear({x,y},e)&&filter(e)){found.push(e.id);g.strike(e,Math.round(g.stats().attack*mult*(1+Math.min(state(g).upgrades[id]||0,id==='r1'?1:2)*.05)),'dual:'+id,{manual:true,action:id,token});}g.effect('storm',x,y,{range,life:.35,max:.35});return found;}
 function cast(g,id){const k=info(g,id),p=g.player,rt=g.loopRuntime;if(!rt||!rt.started||k.locked||p.hp<=0||p.mp<k.cost||(p.cool[k.cooldownKey]||0)>0)return false;p.mp-=k.cost;p.cool[k.cooldownKey]=k.cool;const token={},face=p.face;
  if(id==='r1'){const targets=g.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<=320&&Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-face)>.2).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));const x=targets[0]?.x??p.x+Math.cos(face)*220,y=targets[0]?.y??p.y+Math.sin(face)*220;rt.pending.push({id,at:rt.clock+.8,x,y,token});g.effect('fate-field',x,y,{path:'ripple',range:145,life:.8,max:.8});}
  else {const first=hits(g,id,p.x,p.y,150,id==='g1'?1.8:1,token,e=>Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-face)>.15);if(id==='g2')rt.pending.push({id,at:rt.clock+.3,token,first});}
  g.emit('sound',{name:'skill'});return true;
 }
 function tick(g,dt){const s=state(g),r=s?.run,rt=g.loopRuntime;if(!r||!rt||!rt.started||dt<=0)return;rt.clock+=dt;
  const due=rt.pending.filter(q=>q.at<=rt.clock);rt.pending=rt.pending.filter(q=>q.at>rt.clock);for(const q of due){if(q.id==='r1')hits(g,q.id,q.x,q.y,145,2.4,q.token);else {const p=g.player;hits(g,q.id,p.x,p.y,155,1.8,q.token,e=>q.first.includes(e.id)&&Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-p.face)>.15);}}
  const boss=g.enemies.find(e=>e.boss&&e.hp>0);if(!boss||r.kind!=='raid')return;rt.exposed=Math.max(0,rt.exposed-dt);
  if(boss.phase===1&&boss.hp<=boss.maxHp*.65){boss.phase=2;supports(g);}if(boss.hp<=boss.maxHp*.3)boss.phase=3;
  if(boss.wind>0){if(boss.pattern!=='sweep'&&boss.wind>(boss.pattern==='rush'?.6:.5)){boss.tx=g.player.x;boss.ty=g.player.y;}boss.wind-=dt;if(boss.wind<=0){g.effect('impact',boss.tx,boss.ty,{range:boss.range,pattern:boss.pattern,life:.5,max:.5});if(Math.hypot(g.player.x-boss.tx,g.player.y-boss.ty)<boss.range&&g.player.invuln<=0)g.takeHit(boss);if(g.loopRuntime!==rt)return;if(boss.pattern==='rush')g.move(boss,boss.tx-boss.x,boss.ty-boss.y);boss.cd=boss.pattern==='rush'?2:1.5;if(!rt.exposed&&rt.respawn>0&&--rt.respawn===0)supports(g);}return;}
  if(boss.cd>0)return;
  if(boss.phase>1&&!g.enemies.some(e=>e.support&&e.hp>0)&&!rt.exposed&&!rt.respawn)rt.respawn=2;
  const list=r.variant==='core'?['rush','strike','rush','sweep']:r.variant==='swarm'?['strike','sweep','strike','rush']:['strike','sweep','rush'];const pattern=boss.phase===3?(rt.pattern%2?'strike':'rush'):list[rt.pattern%list.length];rt.pattern++;boss.pattern=pattern;boss.wind=boss.windMax=pattern==='rush'?1.4:pattern==='sweep'?1:1.2;boss.range=pattern==='sweep'?180:pattern==='rush'?105:125;boss.tx=pattern==='sweep'?boss.x:g.player.x;boss.ty=pattern==='sweep'?boss.y:g.player.y;boss.telegraph={x:boss.x,y:boss.y,tx:boss.tx,ty:boss.ty,width:40};
 }
 function objective(g){if(!ready(g))return null;const s=state(g),r=s?.run,rt=g.loopRuntime;let text='서린과 신호를 안정화하면 양세계 거점 왕복과 반복 활동이 열립니다.';if(s&&!r)text='활동 메뉴에서 수련·토벌·레이드를 선택하세요. 무림 성취로 현실 기술을 학습할 수 있습니다.';if(r)text=!rt?.started?'안전 지점 · 편성 변경 후 다음 구간 시작':g.enemies.some(e=>e.hp>0)?r.kind==='training'?`${names[r.variant]} 기본 과제: ${r.segment?'지정 기술로 적중 후 적용 적 제압':`유효 사용 ${Math.min(2,rt.hits)} / 2회`}`:r.kind==='raid'&&r.segment?`갑각수 · ${rt.exposed>0?'노출 '+rt.exposed.toFixed(1)+'초':g.enemies.some(e=>e.support&&e.hp>0)?'지지체 파괴 시 6초 노출':'붉은 전조를 피하고 빈틈 공격'}`:'남은 적을 제압하세요. 최종 완료 때 사용 기술마다 숙련 +1':'구간 완료 · 활동 메뉴 또는 출구에서 다음 단계';const e=g.enemies.find(e=>e.hp>0);return {priority:true,chapter:2,title:r?({training:'정식 수련',bounty:'무림 반복 토벌',raid:'지하 역사 균열'})[r.kind]:'두 세계의 왕복',text,target:e?{...e,label:e.name,kind:'enemy'}:null};}
 function install(api){const proto=api.Game.prototype,old={};for(const k of ['enter','restoreWorldEncounter','validateWorldState','act','skillInfo','strike','reward','step','takeHit','bossLocked','allowEnemyStep','points','interact','objective','target','retreat'])old[k]=proto[k];
  for(const [id,world]of [['murimLoop','무림'],['realityLoop','현실']])api.AREAS[id]={...api.AREAS[world==='무림'?'forest':'rift'],name:world==='무림'?'확보한 산길 · 반복 활동':'지하 역사 균열',sub:'완료 기반 성장 · 활동 메뉴에서 진행 확인',world,w:1280,h:1050,spawn:[300,620],safe:false,blocks:[],positions:[],points:[],seals:[]};
  proto.stabilizeWorlds=function(){if(!ready(this)||active(this)||this.area!=='city')return false;this.syncResonance();this.worldState.dualProgression=P.initial(R.state(this).grants.includes('practice:training'));return true;};
  proto.travelWorld=function(world){if(!safe(this)||state(this).run||!['murim','reality'].includes(world))return false;return this.enter(world==='murim'?'village':'city');};
  proto.acceptLateDisciple=function(){if(!safe(this)||this.area!=='village'||M.form(this,'plum-first').learned)return false;state(this).lateAccepted=true;return true;};
  proto.beginDualActivity=function(kind,v){if(!safe(this)||state(this).run||!P.variants[kind]?.includes(v))return false;const world=kind==='raid'||v==='r1'?'reality':'murim';if(G.worldOf(this)!==world||kind==='training'&&v==='r1'&&!state(this).r1||kind==='training'&&v==='plum-first'&&!M.form(this,v).learned)return false;if(kind==='training'&&v==='plum-first'&&!Object.values(L.state(this).slots).includes(v)){const empty=L.slots.find(k=>!L.state(this).slots[k]);if(!empty)return false;L.assign(this,empty,v);}if(kind==='training'&&v==='r1'&&!state(this).slots.includes(v))return false;if(!P.begin(state(this),kind,v))return false;return this.enter(areaFor(kind,v));};
  proto.advanceDualActivity=function(){return active(this)&&progress(this);};
  proto.learnRealityR1=function(){if(reason(this,'r1-learn'))return false;state(this).r1=true;return true;};
  proto.upgradeDualSkill=function(id){if(reason(this,id))return false;state(this).upgrades[id]++;return true;};
  proto.equipDualSkill=function(slot,id){if(!safe(this)||!real(this)||![0,1].includes(slot)||!info(this,id)||info(this,id).locked)return false;const slots=state(this).slots;if(slots[slot]===id)return false;const other=slots.indexOf(id);if(other!==-1)slots[other]=slots[slot];slots[slot]=id;return true;};
  proto.enter=function(id){if(!active(this))return old.enter.call(this,id);const r=state(this).run;if(!['city','village','murimLoop','realityLoop'].includes(id)||r&&id!==areaFor(r.kind,r.variant)||!r&&id.endsWith('Loop'))return false;const ok=Engine.Game.prototype.enter.call(this,id);if(ok){this.events=this.events.filter(e=>e.type!=='transfer');this.realityRuntime=null;this.combat.charges=0;this.combat.echo=null;this.combat.field=null;this.loopRuntime=null;if(r)populate(this);}return ok;};
  proto.restoreWorldEncounter=function(){if(active(this)&&state(this).run){populate(this);return;}return old.restoreWorldEncounter.call(this);};
  proto.validateWorldState=function(){const s=state(this);if(s){P.validate(s);for(const id of ['plum-first','plum-second','plum-third'])if(s.counts[id]>0&&!M.form(this,id).learned)throw Error('미학습 초식 완료 기록');if(s.counts.arc>0&&!M.state(this).levels.arc)throw Error('미학습 횡검 완료 기록');if(!ready(this)||s.lateAccepted&&this.worldState.murimJourney.disciple!=='decline'||s.legacyTraining!==R.state(this).grants.includes('practice:training'))throw Error('양세계 이행 선행 오류');}old.validateWorldState.call(this);if(s){this.worldState.dualProgression=s;const b=R.balance(this);if(b.crystal<0||b.seal<0)throw Error('양세계 재료 초과');}};
  proto.skillInfo=function(a){if(!active(this)||!real(this))return old.skillInfo.call(this,a);if(['moon','storm'].includes(a))return info(this,state(this).slots[a==='moon'?0:1]);if(['attack','dash','potion'].includes(a)){const k=Engine.Game.prototype.skillInfo.call(this,a);return {...k,name:a==='attack'?'현장 검격':k.name,locked:false,need:0};}return {name:'후속 범위',cost:0,cool:0,need:0,locked:true,hidden:true};};
  proto.act=function(a,held=false){if(!active(this))return old.act.call(this,a,held);const r=state(this).run;if(!r||!this.loopRuntime?.started)return false;this.loopRuntime.castToken={};if(a==='potion'){if(this.loopRuntime.heals<=0||this.player.hp>=this.stats().hp||(this.player.cool.potion||0)>0)return false;this.loopRuntime.heals--;this.player.hp=Math.min(this.stats().hp,this.player.hp+this.stats().hp*.55);this.player.cool.potion=1;this.effect('heal',this.player.x,this.player.y);return true;}if(real(this)){if(['moon','storm'].includes(a))return cast(this,state(this).slots[a==='moon'?0:1]);if(!['attack','dash'].includes(a))return false;return Engine.Game.prototype.act.call(this,a,held);}return old.act.call(this,a,held);};
  proto.strike=function(e,damage,source='attack',cast=null){if(!active(this)||!e.dual)return old.strike.call(this,e,damage,source,cast);const rt=this.loopRuntime,skill=source.startsWith('dual:')?source.slice(5):real(this)?null:skillFor(source),hp=e.hp;
   if(e.boss)damage=Math.round(damage*(rt.exposed>0?1.25:this.enemies.some(q=>q.support&&q.hp>0)?.6:1));
   const run=state(this).run;
   if(run?.kind==='training'&&run.segment===0&&skill!==run.variant)return 0;
   const protectedTarget=run?.kind==='training'&&(run.segment===0&&rt.hits<1||run.segment===1&&skill!==run.variant&&!run.used.includes(run.variant));
   const result=old.strike.call(this,e,damage,source,cast),contacted=e.hp<hp;
   if(protectedTarget&&e.hp===0){e.hp=1;e.rewarded=false;}
   if(contacted&&skill&&P.skills.includes(skill)){
    P.use(state(this),skill);
    if(run?.kind==='training'&&skill===run.variant){
     const token=cast?.token||cast||rt.castToken||{};
     if(!rt.casts.has(token)){rt.casts.add(token);rt.hits++;}
     if(!run.segment&&rt.hits>=2){e.hp=0;e.rewarded=true;}
    }
   }
   return result;
  };
  proto.reward=function(e){if(e.dual&&active(this)){if(e.rewarded)return;e.rewarded=true;if(e.boss){for(const q of this.enemies)q.hp=0;}else if(e.support&&!this.enemies.some(q=>q.support&&q.hp>0)){this.loopRuntime.exposed=6;this.loopRuntime.respawn=0;for(const q of this.enemies)if(q.add)q.stun=2;}return;}return old.reward.call(this,e);};
  proto.bossLocked=function(){return active(this)&&state(this).run?false:old.bossLocked.call(this);};
  proto.allowEnemyStep=function(e){if(e.dual&&(e.boss||e.support||e.practice))return false;return old.allowEnemyStep.call(this,e);};
  proto.takeHit=function(e){old.takeHit.call(this,e);if(active(this)&&state(this).run&&this.player.hp<=0){populate(this);this.toast('현재 구간 재도전 · 완료 구간 기록 유지 · 체력/자원/회복 2회 복원');}};
  proto.step=function(dt,input={}){const before=this.playTime;old.step.call(this,dt,input);if(active(this))tick(this,this.playTime-before);};
  proto.points=function(){if(!active(this))return old.points.call(this);return [{id:'dual-menu',x:300,y:800,label:state(this).run?'활동 진행 확인':'양세계 활동',kind:'exit'}];};
  proto.interact=function(){if(ready(this))return {type:'dual-menu'};return old.interact.call(this);};
  proto.objective=function(){return objective(this)||old.objective.call(this);};
  proto.target=function(){return ready(this)?objective(this).target:old.target.call(this);};
  proto.retreat=function(){if(!active(this))return old.retreat.call(this);const world=G.worldOf(this);P.abandon(state(this));return this.enter(world==='murim'?'village':'city');};
  return api;
 }
 return {names,state,active,ready,safe,info,reason,objective,install};
});
