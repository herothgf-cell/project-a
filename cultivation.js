/* Combat interpretations and progression. Only actual effects earn recognition. */
(function(root,f){const n=typeof module==='object'&&module.exports,x=f(n?require('./journey.js'):root.JourneyRules);if(n)module.exports=x;else root.CultivationRules=x;})(globalThis,function(api){
 'use strict';const {Game,AREAS,Fate,dist,Data:D,state:S,runtime:R,active}=api,P=Game.prototype;
 const old=Object.fromEntries(['act','step','strike','takeHit','reward','stats','skillInfo'].map(k=>[k,P[k]]));
 const targets=(g,o,r)=>g.enemies.filter(e=>e.hp>0&&dist(e,o)<=r+e.r&&g.lineClear(o,e)&&!(e.boss&&g.bossLocked()));
 function credit(g,p,e){if(g.trial||!e||e.residual||e.hp>0&&e.boss&&g.bossLocked()||!Object.hasOwn(S(g).mastery,p))return;const r=R(g),s=S(g),key=p+':'+e.id,count=r.credits||(r.credits={});if((count[key]||0)>=3)return;count[key]=(count[key]||0)+1;s.mastery[p]=Math.min(30,s.mastery[p]+1);const world=AREAS[g.area].world;if(!s.worlds.includes(world))s.worlds.push(world);}
 function recognize(g,key,e){const s=S(g);if(!key||!s.known.includes(key)||AREAS[g.area].world!=='현실'||g.trial||!e?.id||e.boss&&g.bossLocked())return;if(typeof g.onInterpretation==='function')g.onInterpretation(key,e);if(s.sync[key]!==2){s.sync[key]=2;g.toast(D.variants[key].name+' · 현실에서도 같은 반응이 나타났다.');g.effect('reality-settled',g.player.x,g.player.y,{life:1.2,max:1.2,path:D.variants[key].path});}}
 function fx(g,key,o=g.player,phase){g.effect('interpret-'+key,o.x,o.y,{path:D.variants[key].path,range:190,life:.8,max:.8,presentationPhase:phase,...(o.actionInstance?{actionInstance:o.actionInstance,presentationAngle:o.presentationAngle,presentationPhase:'contact'}:{})});}
 P.stats=function(){const n=old.stats.call(this),s=S(this);if(s.realm){n.hp+=12;n.mp+=8;n.attack+=2;}return n;};
 P.setBreath=function(mode){if(!AREAS[this.area].safe||!['flow','focus'].includes(mode))return false;S(this).breath=mode;this.toast(mode==='flow'?'유수심법 · 무공 사이의 호흡으로 내력을 회복합니다.':'집중심법 · 호흡을 고른 첫 검격에 내력을 싣습니다.');return true;};
 P.breakthrough=function(){const s=S(this);if(!AREAS[this.area].safe||s.realm||Object.values(s.mastery).reduce((a,b)=>a+b,0)<8||s.worlds.length<2||!s.known.length)return false;s.realm=1;this.player.hp=this.stats().hp;this.player.mp=this.stats().mp;this.emit('dialog',{title:'경지 돌파 · 이류의 호흡',text:'검을 많이 휘둘렀기 때문만은 아니다.\n두 하늘에서 몸으로 확인한 힘과, 스스로 읽어 낸 해석이 한 호흡으로 이어졌다.\n\n최대 체력 +12 · 내력 +8 · 공격력 +2\n레벨과는 별도로 남는 첫 경지다.',portrait:'hero'});return true;};
 P.tradeMaterial=function(item){const s=S(this);if(!AREAS[this.area].safe)return false;if(item==='sell'&&s.materials>0&&this.gold<=999969){s.materials--;this.gold+=30;this.toast('마정석 1개 감정·판매 · 금화 +30');return true;}if(item==='lens'&&!s.lens&&s.materials>=2&&this.gold>=60){s.materials-=2;this.gold-=60;s.lens=true;this.toast('관측 렌즈 제작 · 기감 범위 +80');return true;}return false;};
 P.skillInfo=function(action){const base=old.skillInfo.call(this,action);if(action==='sense')return {name:'기감',glyph:'感',cost:0,cool:2.5,need:1,description:'기운의 흐름을 살핍니다.',key:'B'};const key=active(this);if(!base||!key||!Fate.names.includes(action))return base;return {...base,description:base.description+'\n'+D.variants[key].description,name:action===(['ripple-guard','seal-hold'].includes(key)?'signature1':'signature2')?D.variants[key].name:base.name};};
 P.act=function(action,...args){const r=R(this),s=S(this),key=active(this),p=this.player;const victims=targets(this,p,260).map(e=>({e,wind:e.wind,x:e.x,y:e.y}));r.held=!!args[0];
  if(key==='echo-replay'&&action==='signature2'){
   const k=old.skillInfo.call(this,action),echo=this.combat.echo;if(!echo||!k||k.locked||p.hp<=0||p.cool.signature2>0||p.mp<k.cost||!this.lineClear(p,echo)||this.blocked(echo.x,echo.y,p.r))return false;
   p.mp-=k.cost;p.cool.signature2=k.cool;p.swing=.3;this.combat.echo=null;r.pending.push({x:echo.x,y:echo.y,delay:.45,key,area:this.area,mult:3.3});r.lastAction=this.playTime;fx(this,key,echo);this.emit('sound',{name:'echo'});return true;
  }
  const charge=r.charge||0,ok=old.act.call(this,action,...args);if(!ok)return ok;
  if(action==='attack'&&charge>0){r.charge=0;const o=p;for(const e of targets(this,o,320))if(Math.cos(Math.atan2(e.y-o.y,e.x-o.x)-o.face)>.86)this.strike(e,Math.round(this.stats().attack*1.6),'interpret:ripple-return');fx(this,'ripple-return',p,'contact');}
  if(key==='ripple-return'&&action==='signature2'){r.charge=1;fx(this,key);}
  if(key==='ripple-guard'&&action==='signature1'){r.guard={x:p.x,y:p.y,radius:145,life:4};fx(this,key);}
  if(key==='echo-return'&&action==='signature2'){p.invuln=Math.max(p.invuln,.7);for(const e of targets(this,p,175))this.strike(e,Math.round(this.stats().attack*.8),'interpret:'+key);fx(this,key);}
  if(key==='seal-hold'&&action==='signature1'){this.combat.field.life=6;const hostile=victims.find(v=>v.wind>0&&dist(v.e,p)<165+v.e.r);if(hostile){hostile.e.root=hostile.e.boss?.55:1.5;recognize(this,key,hostile.e);credit(this,'seal',hostile.e);}fx(this,key,hostile?.e||p,hostile?'bind':'field');}
  if(key==='seal-guide'&&action==='signature2'){let contact=false;for(const v of victims.filter(v=>v.e.root>0).slice(0,2)){const e=v.e;this.move(e,Math.cos(p.face)*85,Math.sin(p.face)*85);if(v.wind>0){recognize(this,key,e);for(const other of targets(this,e,115))if(this.strike(other,Math.round(this.stats().attack*.9),'interpret:'+key)>0)contact=true;}}fx(this,key,p,contact?'contact':'field');}
  return ok;
 };
 P.strike=function(e,amount,source='attack'){const s=S(this),r=R(this),key=active(this);let damage=amount;
  if(source==='attack'&&s.breath==='focus'&&!r.held&&this.playTime-r.lastAction>1.4&&this.player.mp>=6&&!r.focusSpent){damage=Math.round(amount*1.2);this.player.mp-=6;r.focusSpent=true;}
  const dealt=old.strike.call(this,e,damage,source);if(dealt>0){if(['attack','moon','storm'].includes(source))credit(this,'sword',e);else if(['signature','ultimate'].includes(source)&&Fate.active(this))credit(this,Fate.active(this),e);if(source.startsWith('interpret:')){recognize(this,source.slice(10),e);credit(this,D.variants[source.slice(10)]?.path,e);}}
  return dealt;
 };
 P.takeHit=function(e){const s=S(this),r=R(this),key=active(this),guard=r.guard,before=this.player.hp,charges=this.combat?.charges;
  const protectedHere=guard&&dist(this.player,guard)<guard.radius;
  old.takeHit.call(this,protectedHere?{...e,damage:Math.round(e.damage*.55)}:e);
  if(this.player.hp<before&&protectedHere){recognize(this,'ripple-guard',e);credit(this,'ripple',e);}
  if(this.combat?.charges>charges&&Fate.active(this)==='ripple'){credit(this,'ripple',e);if(key==='ripple-return'){r.charge=1;recognize(this,key,e);}}
 };
 P.reward=function(e){if(!e||e.hp>0||e.rewarded)return;old.reward.call(this,e);if(!e.trial&&e.rewarded&&AREAS[this.area].world==='현실'){S(this).materials=Math.min(9999,S(this).materials+(e.boss?3:1));this.toast('마정석 +'+(e.boss?3:1)+' · 거점에서 감정할 수 있습니다.');}};
 P.step=function(dt,input={}){const before=this.playTime,area=this.area;old.step.call(this,dt,input);const d=this.playTime-before;if(d<=0||area!==this.area)return;const r=R(this),s=S(this);r.focusSpent=false;
  if(s.breath==='flow'&&this.playTime-r.lastAction>1.2)this.player.mp=Math.min(this.stats().mp,this.player.mp+d*3);
  if(r.guard){r.guard.life-=d;if(r.guard.life<=0)r.guard=null;}
  const queue=r.pending;r.pending=[];for(const h of queue){if(h.area!==this.area)continue;h.delay-=d;if(h.delay>0){r.pending.push(h);continue;}for(const e of targets(this,h,180))this.strike(e,Math.round(this.stats().attack*h.mult),'interpret:'+h.key);fx(this,h.key,h);}
 };
 return {...api,recognize,credit};
});
