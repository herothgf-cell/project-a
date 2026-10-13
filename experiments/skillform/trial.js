/* Uses Ssanggye combat primitives in a disposable, reward-free simulation. */
(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./model.js'):root.Skillform,n?require('../../world-game.js'):root.WorldGame,n?require('../../fate.js'):root.FateRules,n?require('../../reality-skills.js'):root.RealitySkills);if(n)module.exports=api;else root.SkillformTrial=api;})(globalThis,function(M,World,Fate,Reality){
 'use strict';
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 class Trial {
  constructor(state,{family='sword',world='murim',linked=false}={}){
   M.serialize(state);
   if(!M.families.includes(family)||!['murim','reality'].includes(world)||typeof linked!=='boolean'||!state.basics[family])throw Error('먼저 초식을 구성하세요.');
   if(linked&&!state.links[family])throw Error('연계 초안을 먼저 만드세요.');
   if(world==='reality'&&(family==='sword'||state.reality!==family||!state.linkProof.includes(family)))throw Error('현실 기지에서 원리를 적용하세요.');
   this.state=state;this.family=family;this.world=world;this.linked=linked;this.finished=false;this.prepared=null;this.pending=[];this.events=[];this.result=null;this.metrics={hits:0,damage:0,spent:0};this.notice='Q는 적의 붉은 예고에 맞춰 사용하세요.';
   const g=this.g=new World.Game();g.introActive=false;g.area=world==='murim'?'sanctum':'comparison';g.training=1;g.progress=12;g.fate.path=family==='sword'?null:family;g.fate.stage=3;g.worldState.growthArc.phase='learned';g.worldGrowth[world].equipped=family==='sword'?null:family;g.revision.inherited=family==='sword'?[]:[family];g.worldState.achievements={earned:['inherit:'+family],settled:['inherit:'+family],results:[]};g.worldState.reality={settled:[]};
   g.stats=()=>({hp:180,mp:100,attack:16,next:115});g.blocked=(x,y,r=16)=>x<40+r||x>920-r||y<45+r||y>495-r;g.bossLocked=()=>false;g.reward=e=>{e.rewarded=true;};
   Object.assign(g.player,{x:360,y:285,face:0,hp:180,mp:100,invuln:0,dash:0});for(const k in g.player.cool)g.player.cool[k]=0;
   const locations=family==='seal'?[[435,285],[520,285]]:family==='ripple'?[[435,285],[610,285]]:[[420,285],[470,350]];
   g.enemies=locations.map(([x,y],i)=>({id:'skillform-'+i,name:i?'후속 표적':'예고 표적',x,y,r:18,hp:120,maxHp:120,damage:6,boss:false,comparison:true,assessment:true,kind:'bandit',speed:35,cd:1+i*2,wind:0,windMax:1.6,tx:360,ty:285,range:85,attacks:0,flash:0,root:0,stun:0,pattern:'strike',rewarded:false}));
   g.enemyThreatContains=e=>dist(g.player,{x:e.tx,y:e.ty})<=e.range+g.player.r*.4;
   const originalInfo=g.skillInfo.bind(g);g.skillInfo=a=>world==='reality'?(Reality.info(g,a)||originalInfo(a)):(Fate.info(g,a)||originalInfo(a));
   const originalStrike=g.strike.bind(g);
   g.strike=(e,damage,source='attack',cast)=>{
    if(this.absorbing&&this.linked)return 0;
    const n=originalStrike(e,damage,source,cast);if(n>0){this.metrics.hits++;if(this.followup&&!linked&&world==='reality'&&this.prepared?.until>g.playTime)this.finish(true,'현실 기본형 확인 · Q 대응 뒤 실제 후속 타격이 적중했습니다.');if(this.basicMoon&&!linked&&family==='sword')this.finish(true,'월영참 체득 · 형·기·운·의가 실제 검격으로 이어졌습니다.');}return n;
   };
   g.onRealityEffect=e=>{if(['absorb','evade','suppress'].includes(e.kind))this.respond(e.kind,e.target);};
  }
  respond(kind,target){
   if(this.finished)return;
   const g=this.g,point=this.departed||{x:g.player.x,y:g.player.y};
   if(kind==='suppress'){target.realitySuppressedUntil=g.playTime+4;target.realitySuppressionProven=true;}
   this.prepared={kind,target,point:{...point},until:g.playTime+(kind==='evade'?3:kind==='suppress'?4:2)};
   this.notice='준비 성공 · K 검격으로 '+(this.linked?M.links[this.family].principle:'후속 공격')+'을 펼치세요.';
   if(!this.linked&&this.world==='murim')this.finish(true,M.names[this.family]+' 체득 · 실제 '+({absorb:'받아내기',evade:'예고 회피',suppress:'예고 억제'}[kind])+' 성공');
  }
  targets(origin,range){return this.g.enemies.filter(e=>e.hp>0&&dist(e,origin)<=range+e.r&&this.g.lineClear(origin,e)).sort((a,b)=>dist(a,origin)-dist(b,origin)||a.id.localeCompare(b.id));}
  pay(cost,action,cool){const p=this.g.player;if(p.cool[action]>0){this.notice='재사용 대기 중입니다.';return false;}if(p.mp<cost){this.notice='내력이 부족합니다. 잠시 호흡을 고르세요.';return false;}p.mp-=cost;p.cool[action]=cool;this.metrics.spent+=cost;return true;}
  consume(){const g=this.g;this.prepared=null;g.combat.charges=0;g.combat.echo=null;Reality.runtime(g).boost=null;}
  act(action){
   if(this.finished)return false;
   this.inAction=true;this.followup=['attack','moon'].includes(action);
   const boost=this.g.realityRuntime?.boost;
   try{return this.perform(action);}finally{if(boost&&!this.g.realityRuntime.boost&&this.prepared&&['absorb','evade'].includes(this.prepared.kind)){this.consume();this.notice='준비 효과를 타격에 사용했습니다. 다음 연계는 Q로 다시 준비하세요.';}this.inAction=false;if(this.completion){const c=this.completion;this.completion=null;this.finish(c.success,c.message);}}
  }
  perform(action){
   if(this.finished)return false;
   const g=this.g,p=g.player;
   if(!['attack','moon','signature1','dash'].includes(action)){this.notice='이 실험에서는 Q와 검격을 조합합니다. R/F는 잠겨 있습니다.';return false;}
   if(action==='dash'){if(!this.pay(0,'dash',1))return false;g.move(p,Math.cos(p.face)*125,Math.sin(p.face)*125);p.invuln=.3;return true;}
   if(action==='signature1'){
    if(this.family==='sword'){this.notice='월영참은 K 검격으로 시험하세요.';return false;}
    const winds=g.enemies.filter(e=>e.hp>0&&e.wind>0),threats=winds.filter(e=>g.enemyThreatContains(e)).map(e=>({e,x:e.tx,y:e.ty,range:e.range,at:g.playTime+e.wind}));this.departed={x:p.x,y:p.y};
    const before=p.mp,ok=this.world==='reality'?Reality.act(g,action):Fate.act(g,action);if(!ok){this.notice='Q 재사용 시간과 내력을 확인하세요.';return false;}this.metrics.spent+=before-p.mp;
    if(this.family==='echo')this.evade={threats,point:{...this.departed}};
    if(this.world==='murim'&&this.family==='seal'){const e=winds.find(e=>e.wind===0);if(e)this.respond('suppress',e);else this.notice='진 안에서 진행 중인 공격 예고를 끊어야 합니다.';}
    return true;
   }
   if(action==='moon'&&this.linked&&this.prepared?.until>g.playTime){
    const spec=this.state.links[this.family],ready=this.prepared,origin={x:p.x,y:p.y},f=this.family;
    const front=this.targets(p,this.world==='murim'?215:140).filter(e=>Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-p.face)>.25);
    const second=f==='seal'?this.targets(ready.target,spec.value).find(e=>e!==ready.target):null;
    if(f!=='seal'||ready.target.hp>0&&front.includes(ready.target)&&second){
     if(!this.pay((this.world==='murim'?18:14)+spec.costExtra,'moon',3))return false;
     if(f==='ripple'){
      const targets=this.targets(p,spec.value).filter(e=>{const dx=e.x-p.x,dy=e.y-p.y;return dx*Math.cos(p.face)+dy*Math.sin(p.face)>=0&&Math.abs(dx*Math.sin(p.face)-dy*Math.cos(p.face))<=45+e.r;}).slice(0,2);
      this.consume();p.cool.attack=Math.max(p.cool.attack,.2);g.effect('skillform-line',p.x,p.y,{angle:p.face,range:spec.value,life:.7,max:.7});
      for(const e of targets)g.strike(e,Math.round(16*1.8),'skillform');if(targets.length>=2)this.finish(true,'관통 성공 · 한 번의 충격으로 두 표적을 베었습니다.');else this.notice='관통 '+targets.length+'명 · 두 표적이 같은 선에 오도록 조준하세요.';
     }else if(f==='echo'){
      this.consume();this.pending.push({at:g.playTime+spec.value,point:ready.point});g.effect('skillform-delay',ready.point.x,ready.point.y,{range:90,life:spec.value,max:spec.value});this.notice='떠난 자리에 검격이 남았습니다. 적이 지점에 들어오는지 보세요.';
     }else {
      const remaining=Math.min(2,Math.max(0,ready.target.realitySuppressedUntil-g.playTime));
      ready.target.realitySuppressedUntil=0;ready.target.realitySuppressionProven=false;g.combat.field=null;this.consume();g.strike(ready.target,Math.round(16*1.2),'skillform');
      if(remaining>0){second.realitySuppressedUntil=g.playTime+remaining;second.wind=0;second.cd=Math.max(second.cd,remaining);g.effect('skillform-transfer',ready.target.x,ready.target.y,{tx:second.x,ty:second.y,life:.8,max:.8});this.finish(true,'전이 성공 · 첫 억제를 끝내고 다음 표적에 남은 시간을 옮겼습니다.');}
     }
     return true;
    }
    this.notice='전이할 다른 표적이 없거나 억제한 적이 사거리 밖입니다. 기본 검격만 사용합니다.';
   }else if(action==='moon'&&this.linked)this.notice='유효한 준비가 없습니다. Q로 예고에 대응한 뒤 K를 누르세요.';
   // Common sword keeps the original Ssanggye action and costs, with one optional line variant.
   const before=p.mp;this.basicMoon=action==='moon';let ok;
   if(action==='moon'&&this.world==='murim'&&this.state.basics.sword?.intent==='line'){
    ok=this.pay(20,'moon',2.8);if(ok){for(const e of this.targets(p,260).filter(e=>{const dx=e.x-p.x,dy=e.y-p.y;return dx*Math.cos(p.face)+dy*Math.sin(p.face)>=0&&Math.abs(dx*Math.sin(p.face)-dy*Math.cos(p.face))<35+e.r;}))g.strike(e,Math.round(16*2),'moon');g.effect('skillform-line',p.x,p.y,{angle:p.face,range:260,life:.4,max:.4});}
   }else {ok=g.act(action);if(ok)this.metrics.spent+=before-p.mp;}
   this.basicMoon=false;return !!ok;
  }
  impact(e){
   if(this.finished||e.hp<=0)return;const g=this.g,p=g.player;
   if(!g.enemyThreatContains(e))return;
   if(this.world==='reality'&&Reality.absorb(g,e))return;
   let damage=e.damage;
   if(this.world==='murim'){
    const charges=g.combat.charges;this.absorbing=true;try{damage=Fate.incoming(g,e,damage);}finally{this.absorbing=false;}
    if(g.combat.charges>charges){this.respond('absorb',e);return;}
   }
   if(p.invuln>0)return;p.hp=Math.max(0,p.hp-damage);p.invuln=.45;this.metrics.damage+=damage;g.effect('impact',p.x,p.y,{range:45,life:.3,max:.3});if(p.hp<=0)this.finish(false,'다시 시도할 수 있습니다. 설계·체득 기록은 유지됩니다.');
  }
  step(dt,input={}){
   if(this.finished||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.05,dt);const g=this.g,p=g.player;g.playTime+=dt;
   for(const k of Object.keys(p.cool))p.cool[k]=Math.max(0,p.cool[k]-dt);p.invuln=Math.max(0,p.invuln-dt);p.mp=Math.min(100,p.mp+dt*12);
   if(p.dash>0){g.move(p,p.dx*850*dt,p.dy*850*dt);p.dash=Math.max(0,p.dash-dt);}else{const x=Number(input.x)||0,y=Number(input.y)||0,n=Math.hypot(x,y);if(n){g.move(p,x/n*210*dt,y/n*210*dt);if(!input.aim)p.face=Math.atan2(y,x);}}
   if(Number.isFinite(input.aim))p.face=input.aim;
   Fate.tick(g,dt);if(this.world==='reality')Reality.step(g);
   if(this.evade){for(const t of this.evade.threats){if(!t.done&&g.playTime>=t.at){t.done=true;if(t.e.hp>0&&dist(p,t)>t.range+p.r*.4){this.departed=this.evade.point;this.respond('evade',t.e);}}}if(this.evade.threats.every(t=>t.done))this.evade=null;}
   if(this.prepared&&this.prepared.until<=g.playTime){this.consume();this.notice='연결 기한이 끝났습니다. 다시 Q로 준비하세요.';}
   const due=this.pending.filter(h=>h.at<=g.playTime);this.pending=this.pending.filter(h=>h.at>g.playTime);
   for(const h of due){const hits=this.targets(h.point,90).slice(0,2);for(const e of hits)g.strike(e,Math.round(16*1.2),'skillform');g.effect('skillform-burst',h.point.x,h.point.y,{range:90,life:.6,max:.6});if(hits.length)this.finish(true,'잔향 지연 성공 · 이동한 뒤에도 이전 위치에서 검격이 적중했습니다.');else this.notice='잔향 검격이 빗나갔습니다. 적의 진입 위치를 예상하세요.';}
   if(this.finished)return;
   for(const e of g.enemies){if(e.hp<=0)continue;e.cd-=dt;e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,(e.stun||0)-dt);if(e.realitySuppressedUntil>g.playTime||e.stun>0)continue;
    if(e.wind>0){e.wind=Math.max(0,e.wind-dt);if(e.wind===0){this.impact(e);e.cd=2.8;}}
    else if(e.cd<=0){e.wind=e.windMax=1.6;e.tx=p.x;e.ty=p.y;e.range=85;e.attacks++;}
    else if(this.family==='echo'&&dist(e,p)>70)g.move(e,(p.x-e.x)/dist(e,p)*30*dt,(p.y-e.y)/dist(e,p)*30*dt);
   }
   for(const fx of g.fx)fx.life-=dt;g.fx=g.fx.filter(f=>f.life>0);g.events=[];
   if(g.enemies.every(e=>e.hp<=0))this.finish(false,'표적이 사라졌습니다. 재시도로 같은 배치에서 조합을 확인하세요.');
  }
  finish(success,message){
   if(this.inAction){this.completion??={success,message};return;}
   if(this.finished)return;this.finished=true;this.notice=message;
   if(success){if(this.linked&&this.world==='murim')M.proveLink(this.state,this.family);else if(!this.linked&&this.world==='murim')M.prove(this.state,this.family);}
   this.result={family:this.family,world:this.world,linked:this.linked,success,hits:this.metrics.hits,damage:this.metrics.damage,spent:this.metrics.spent,seconds:Number(this.g.playTime.toFixed(2))};M.record(this.state,this.result);this.events.push({type:'complete',message});
  }
 }
 return {Trial};
});
