/* Single current serialization boundary. Load legacy payloads before settlement. */
(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./economy.js'):root.Economy,root);if(n)module.exports=api;else root.SaveV9=api;})(globalThis,function(api,root){
 'use strict';const {Game}=api,save=Game.prototype.save,load=Game.load;
 function validate(e){if(!e||!Number.isInteger(e.legacyAttack)||e.legacyAttack<0||e.legacyAttack>40||e.legacyAttack%4||!Number.isInteger(e.refundBalance)||e.refundBalance<0||e.refundBalance>303590)throw Error('기존 성장 정산 정보 오류');return {...e};}
 Game.prototype.save=function(){const d=JSON.parse(save.call(this));d.version=9;d.upgrade=0;d.journey.materials=0;d.journey.lens=false;d.economy={...api.state(this)};if(this.laterStory)d.laterStory={...this.laterStory};return JSON.stringify(d);};
 Game.load=function(text){const d=JSON.parse(text),latest=d.version===9;let economy;if(latest){economy=validate(d.economy);if(d.upgrade!==0||d.journey?.materials!==0||d.journey?.lens!==false)throw Error('제거된 성장 항목이 남아 있습니다.');d.version=8;}
  const later=root.LaterStory||Game.laterRules,area=d.area;if(later?.areas.includes(area)){if(!latest)throw Error('신규 지역의 저장 버전 오류');d.area=later.world(area)==='현실'?'city':'village';}
  const g=load.call(this,JSON.stringify(d));if(latest)g.economy=economy;else{const s=api.legacySettlement({upgrade:g.upgrade,materials:g.journey.materials,lens:g.journey.lens});g.economy={legacyAttack:s.legacyAttack,refundBalance:s.gold};const amount=Math.min(s.gold,999999-g.gold);g.gold+=amount;g.economy.refundBalance-=amount;}
  g.upgrade=0;g.journey.materials=0;g.journey.lens=false;if(d.laterStory){if(!later)throw Error('후속 이야기 규칙을 읽을 수 없습니다.');g.laterStory=later.validate(d.laterStory,g);if(later.areas.includes(area)){if(!later.canEnter(g,area))throw Error('후속 지역과 진행 단계가 다릅니다.');g.enter(area);}}else if(later)g.laterStory=later.initial();g.events=[];return g;};
 return {...api,validateEconomy:validate};
});
