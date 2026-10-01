(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./economy.js'):root.Economy);if(n)module.exports=api;else root.DualBreath=api;})(globalThis,function(api){
 'use strict';const {Game,Fate,dist}=api,P=Game.prototype,old=Object.fromEntries(['act','strike','takeHit','enter','setBreath','skillInfo'].map(k=>[k,P[k]]));
 const reset=g=>(g.dualRuntime={serial:0,cast:null,last:null,discount:0,opening:0,seen:new Set(),guard:null});const runtime=g=>g.dualRuntime||reset(g);
 function status(g){const r=runtime(g);return {discount:r.discount,opening:Math.max(0,r.opening-g.playTime)};}
 function valid(g,e,c){return g.laterStory?.dualBreath&&c?.manual&&!g.trial&&e&&!e.trial&&!e.residual&&g.enemies.includes(e)&&!(e.boss&&g.bossLocked());}
 function contact(g,e,c){if(!valid(g,e,c))return;const r=runtime(g),key=c.id+':'+c.family;if(r.seen.has(key))return;r.seen.add(key);if(r.seen.size>128)r.seen.delete(r.seen.values().next().value);
  if(g.journey.breath==='flow'){if(r.last&&r.last.family!==c.family&&g.playTime-r.last.at<=(g.dualAssist?8:4)){r.discount=6;e.dualSuppressedUntil=g.playTime+6;g.onDualLink?.(e);g.toast('쌍계 호흡 · 다음 유료 무공 내력 -6');}r.last={family:c.family,at:g.playTime};}
  else if(c.family==='sword'&&c.action==='attack'&&c.focus){r.opening=g.playTime+(g.dualAssist?8:4);g.toast('쌍계 호흡 · 재생의 틈이 드러났습니다.');}
  else if(c.family!=='sword'&&r.opening>g.playTime){r.opening=0;e.dualSuppressedUntil=g.playTime+6;g.onDualLink?.(e);g.toast('쌍계 호흡 · 재생 6초 정지');}
 }
 P.skillInfo=function(action){const info=old.skillInfo.call(this,action);return info&&this.laterStory?.dualBreath&&runtime(this).discount&&info.cost>0?{...info,cost:Math.max(1,info.cost-6)}:info;};
 P.act=function(action,held=false,...args){const r=runtime(this),p=this.player,info=old.skillInfo.call(this,action),paid=['moon','storm','signature1','signature2'].includes(action)&&info?.cost>0,discount=this.laterStory?.dualBreath&&paid?Math.min(r.discount,info.cost-1):0,beforeMp=p.mp;
  const c={id:++r.serial,action,family:['attack','moon','storm'].includes(action)?'sword':Fate.active(this),manual:!held,focus:action==='attack'&&this.playTime-this.experimentRuntime.lastAction>1.4&&p.mp>=6&&!this.experimentRuntime.focusSpent};r.cast=c;
  const winds=this.enemies.filter(e=>e.hp>0&&e.wind>0).map(e=>({e,wind:e.wind})),pending=new Set([...(this.combat?.pending||[]),...(this.experimentRuntime?.pending||[])]);if(discount){p.mp+=discount;r.discount=0;}
  let ok;try{ok=old.act.call(this,action,held,...args);if(ok){if(action==='signature1')r.guard=c;for(const h of [...(this.combat?.pending||[]),...(this.experimentRuntime?.pending||[])])if(!pending.has(h))h.dualCast=c;if(Fate.active(this)==='seal')for(const {e}of winds)if(e.wind===0&&dist(p,e)<=260)contact(this,e,c);}else if(discount){p.mp=beforeMp;r.discount=6;}}finally{r.cast=null;}return ok;
 };
 P.strike=function(e,amount,source='attack',cast=null){const live=e?.hp>0,result=old.strike.call(this,e,amount,source);if(live&&result>0)contact(this,e,cast||runtime(this).cast);return result;};
 P.takeHit=function(e){const r=runtime(this),charges=this.combat.charges,previous=r.cast;r.cast=r.guard;try{const result=old.takeHit.call(this,e);if(this.combat.charges>charges)contact(this,e,r.guard);return result;}finally{r.cast=previous;}};
 P.enter=function(...args){const ok=old.enter.apply(this,args);if(ok)reset(this);return ok;};
 P.setBreath=function(mode){const ok=old.setBreath.call(this,mode);if(ok)reset(this);return ok;};
 return {...api,status};
});
