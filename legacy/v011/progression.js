/* Derived mastery bonuses and a self-contained repeatable reality contract. */
(function(root,f){const api=f(typeof module==='object'&&module.exports?require('./revision.js'):root.Revision);if(typeof module==='object'&&module.exports)module.exports=api;else root.Progression=api;})(globalThis,function(api){
 'use strict';const {Game,AREAS,Fate}=api,P=Game.prototype;
 const old=Object.fromEntries(['enter','points','interact','objective','target','reward','strike','save','emit'].map(k=>[k,P[k]])),load=Game.load;
 const thresholds=[5,10,20,30],initial=()=>({status:'idle',kills:0,completed:0}),contract=g=>g.contract||(g.contract=initial());
 const board={id:'contract-board',x:480,y:820,label:'현장 의뢰판',kind:'npc',role:'warden'};
 function mastery(g,path){const value=g.journey.mastery[path]||0,rank=thresholds.filter(t=>value>=t).length;return {value,rank,percent:rank*3,next:thresholds[rank]??null};}
 function levelPreview(g){const s=g.stats();return {capped:g.level>=80,current:{hp:s.hp,mp:s.mp,attack:s.attack},next:g.level>=80?null:{hp:s.hp+18,mp:s.mp+5,attack:s.attack+3}};}
 function announceLevel(g,before){if(g.level>before){const count=g.level-before;g.emit('level-up',{level:g.level,count,hp:18*count,mp:5*count,attack:3*count});}}
 function family(g,source){if(['attack','moon','storm'].includes(source))return 'sword';if(source.startsWith('interpret:'))return api.Data.variants[source.slice(10)]?.path;if(['signature','ultimate'].includes(source))return Fate.active(g);return null;}
 P.strike=function(e,damage,source='attack'){
  const path=family(this,source),before=path?mastery(this,path):null;
  const bonus=!this.trial&&before?before.percent:0,result=old.strike.call(this,e,Math.round(damage*(100+bonus)/100),source);
  if(before&&mastery(this,path).rank>before.rank)this.toast((path==='sword'?'공통 검술':Fate.PATHS[path].name)+' 숙련 단계 상승 · 해당 계열 피해 +'+mastery(this,path).percent+'%');
  return result;
 };
 P.reward=function(e){
  if(e?.contract){const c=contract(this);if(c.status!=='active'||this.area!=='rift'||!this.enemies.includes(e)||e.hp>0||e.rewarded)return;e.rewarded=true;c.kills++;if(c.kills===4){c.status='ready';this.emit('contract-complete',{title:'잔당 토벌 완료',text:'네 위협을 모두 제거했습니다. 현실 기지의 현장 의뢰판에서 보상을 받으세요.'});}return;}
  const before=this.level,result=old.reward.call(this,e);announceLevel(this,before);return result;
 };
 P.startContract=function(){const c=contract(this);if(this.area!=='city'||this.progress<6||this.introActive||this.trial||c.status!=='idle')return false;
  this.enter('rift');c.status='active';c.kills=0;const scale=1+Math.min(c.completed,10)*.05;
  this.enemies=this.enemies.slice(0,4).map((e,i)=>({...e,id:'contract-'+i,name:'잔류 균열체 '+(i+1),boss:false,contract:true,hp:Math.round(170*scale),maxHp:Math.round(170*scale),damage:Math.round(12*scale),speed:75,rewarded:false}));
  this.guideActive=false;this.toast('현장 의뢰 시작 · 잔류 균열체 0 / 4');return true;
 };
 P.cancelContract=function(){const c=contract(this);if(c.status!=='active')return false;c.status='idle';c.kills=0;this.enter('city');this.toast('의뢰 중단 · 보상 없이 재도전할 수 있습니다.');return true;};
 P.claimContract=function(){const c=contract(this);if(c.status!=='ready'||this.area!=='city'||this.introActive)return false;c.status='idle';c.kills=0;c.completed=Math.min(9999,c.completed+1);
  this.gold=Math.min(999999,this.gold+80);this.journey.materials=Math.min(9999,this.journey.materials+2);const before=this.level;this.xp+=100;
  while(this.level<80&&this.xp>=this.stats().next){this.xp-=this.stats().next;this.level++;this.player.hp=Math.min(this.stats().hp,this.player.hp+45);this.player.mp=this.stats().mp;}
  this.xp=Math.min(this.xp,this.stats().next-1);this.toast('의뢰 보상 · 금화 80 / 경험치 100 / 마정석 2');announceLevel(this,before);return true;
 };
 P.enter=function(id){if(!Object.hasOwn(AREAS,id))return false;const c=contract(this);if(c.status==='active'){c.status='idle';c.kills=0;this.toast('진행 중인 의뢰가 중단되었습니다. 기지에서 다시 수주하세요.');}return old.enter.call(this,id);};
 P.points=function(){const points=old.points.call(this);return this.area==='city'&&!this.introActive?[...points,board]:points;};
 P.interact=function(){if(this.nearestPoint()?.id===board.id)return {type:'contract-board'};return old.interact.call(this);};
 function objective(g){const c=contract(g);if(c.status==='idle'||g.introActive)return null;const remaining=g.enemies.find(e=>e.contract&&e.hp>0),points=g.points();let target;
  if(c.status==='active')target=remaining?{...remaining,label:remaining.name,kind:'enemy'}:points.find(o=>o.id==='exit');
  else target=g.area==='city'?board:points.find(o=>o.id==='exit'||o.id==='portal');
  return {category:'현장 의뢰',title:'현장 의뢰 · 균열 잔당 토벌',text:c.status==='active'?`잔류 균열체 ${c.kills} / 4 · 본편과 별개의 실전입니다.`:'토벌 완료 · 현실 기지의 현장 의뢰판에서 보상을 수령하세요.',target,chapter:0};
 }
 P.objective=function(){return objective(this)||old.objective.call(this);};
 P.target=function(){return objective(this)?.target||old.target.call(this);};
 P.emit=function(type,data={}){if(type==='toast'&&/^레벨 상승 ·/.test(data.text||''))return;return old.emit.call(this,type,data);};
 P.save=function(){const d=JSON.parse(old.save.call(this));d.version=8;d.contract={...contract(this)};return JSON.stringify(d);};
 function validate(c,d){if(!c||!['idle','active','ready'].includes(c.status)||!Number.isInteger(c.kills)||!Number.isInteger(c.completed)||c.completed<0||c.completed>9999||c.kills<0||c.kills>4||c.status==='idle'&&c.kills!==0||c.status==='active'&&(c.kills>=4||d.area!=='rift')||c.status==='ready'&&c.kills!==4||(c.status!=='idle'||c.completed>0)&&d.progress<6)throw Error('현장 의뢰 저장 상태 오류');return {status:c.status,kills:c.kills,completed:c.completed};}
 Game.load=function(text){const d=JSON.parse(text),v8=d.version===8,c=v8?validate(d.contract,d):initial();if(v8)d.version=7;const g=load.call(this,JSON.stringify(d));g.contract=c;if(c.status==='active'){c.status='idle';c.kills=0;g.enter('city');g.events=[];g.toast('저장된 전투 의뢰는 중단되었습니다. 기지에서 다시 수주하세요.');}return g;};
 return {...api,mastery,levelPreview,contract,thresholds};
});
