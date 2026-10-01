/* Latest economy policy; legacy loaders keep validating the original save formats. */
(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./progression.js'):root.Progression);if(n)module.exports=api;else root.Economy=api;})(globalThis,function(api){
 'use strict';const {Game,AREAS}=api,P=Game.prototype,old=Object.fromEntries(['stats','buy','reward','claimContract'].map(k=>[k,P[k]]));
 const state=g=>g.economy||(g.economy={legacyAttack:0,refundBalance:0});
 function legacySettlement({upgrade:n,materials:m,lens}){return {gold:80*n+30*n*(n-1)+30*m+(lens?120:0),legacyAttack:4*n};}
 P.stats=function(){const s=old.stats.call(this);s.attack+=state(this).legacyAttack-this.upgrade*4;return s;};
 P.buy=function(item){return item==='upgrade'?false:old.buy.call(this,item);};P.tradeMaterial=function(){return false;};P.senseRange=function(){return 340;};
 P.claimSettlement=function(){if(!AREAS[this.area].safe)return false;const e=state(this),amount=Math.min(e.refundBalance,999999-this.gold);if(amount<=0)return false;this.gold+=amount;e.refundBalance-=amount;this.toast('기존 재화 정산 · 금화 +'+amount);return true;};
 P.reward=function(e){const paid=e?.rewarded,materials=this.journey.materials,from=this.events.length,result=old.reward.call(this,e);let extra=0;if(!paid&&e?.rewarded&&!e.trial&&!e.residual){if(e.contract)extra=16;else extra=Math.max(0,this.journey.materials-materials)*30;}this.journey.materials=0;this.journey.lens=false;this.events=this.events.filter((v,i)=>i<from||v.type!=='toast'||!v.text?.includes('마정석'));if(extra){this.gold=Math.min(999999,this.gold+extra);this.effect('text',e.x,e.y-45,{text:'+'+extra+' 금화',color:'#f3d69a',life:1.1,max:1.1});}return result;};
 P.claimContract=function(){const before=this.gold,from=this.events.length,ok=old.claimContract.call(this);if(!ok)return false;this.gold=Math.min(999999,before+76);this.journey.materials=0;this.events=this.events.filter((v,i)=>i<from||v.type!=='toast'||!v.text?.includes('마정석'));this.toast('보고 보상 · 금화 76 / 경험치 100 · 처치 보상은 별도 지급');return true;};
 return {...api,state,legacySettlement};
});
