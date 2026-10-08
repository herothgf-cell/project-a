/* Validation proposal: per-action attainment. Never converts existing mastery or investment. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrdinaryGrowth=api;})(globalThis,function(){
 'use strict';
 const actions=['attack','moon','storm'],worlds=['murim','reality'],seen=new WeakMap();
 const definitions={murim:{attack:['화산 기본 검로','stars',0],moon:['매화노방 · 제1초식','form',1],storm:['매화접무 · 제2초식','form',2]},reality:{attack:['현장 검격','stars',0],moon:['집중 타격','stars',1],storm:['연속 타격','stars',2]}};
 function initial(legacy=false){return {version:1,legacy,transmission:legacy,records:{murim:{attack:0,moon:0,storm:0},reality:{attack:0,moon:0,storm:0}}};}
 function state(g){return g.worldState.ordinaryGrowth||(g.worldState.ordinaryGrowth=initial(true));}
 function validate(g){const s=state(g);if(s.version!==1||typeof s.legacy!=='boolean'||typeof s.transmission!=='boolean')throw Error('일반 성장 기록 오류');for(const w of worlds)for(const a of actions){const n=s.records?.[w]?.[a];if(!Number.isInteger(n)||n<0||n>32)throw Error('개별 성취 기록 오류');}}
 function describe(g,w,a){const d=definitions[w]?.[a];if(!d)return null;const value=state(g).records[w][a],unlocked=g.training>=d[2],stage=d[1]==='form'?Math.min(2,Math.floor(value/8)):Math.min(8,Math.floor(value/4));return {name:d[0],kind:d[1],value,max:32,stage,unlocked,label:!unlocked?'미체득':d[1]==='form'?['입문','활용','숙련'][stage]:(stage+1)+'성 / 9성',bonus:unlocked?stage*.02:0,next:d[1]==='form'?(stage<2?(stage+1)*8:null):(stage<8?(stage+1)*4:null),proposal:true};}
 function eligible(g,e){return e&&g.enemies.includes(e)&&!g.trial&&!g.advancementTrial&&!g.worldState.resonanceChallenges?.active&&!['comparison','sanctum'].includes(g.area)&&!['trial','assessment','comparison','residual','resonanceTrial','demonstration'].some(k=>e[k])&&!(e.boss&&g.bossLocked());}
 function contact(g,e,c,w){if(!eligible(g,e)||!c?.manual||!actions.includes(c.action)||!worlds.includes(w))return false;let casts=seen.get(g);if(!casts){casts=new WeakSet();seen.set(g,casts);}const token=c.token||c;if(casts.has(token))return false;casts.add(token);const credits=e.ordinaryCredits||(e.ordinaryCredits={}),key=w+':'+c.action;if((credits[key]||0)>=3)return false;credits[key]=(credits[key]||0)+1;const s=state(g);s.records[w][c.action]=Math.min(32,s.records[w][c.action]+1);return true;}
 function info(g,w,a,k){const d=describe(g,w,a);if(!d||!k)return k;return {...k,name:w==='murim'&&!state(g).transmission?k.name:d.name,description:(k.description||(a==='moon'?'전방 검로를 따라 넓게 벱니다.':a==='storm'?'주변 위협을 한 번에 휩씁니다.':'전방의 위협을 검격으로 제압합니다.'))+' · '+d.label+' · 성취 피해 +'+Math.round(d.bonus*100)+'% (검증안)'};}
 return {actions,definitions,initial,state,validate,describe,eligible,contact,info};
});
