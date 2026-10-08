/* Input slots refer to learned techniques; permanent growth and cooldowns keep their identities. */
(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./murim-growth.js'):root.MurimGrowth);if(n)module.exports=api;else root.MurimLoadout=api;})(globalThis,function(Growth){
 'use strict';
 const slots=['moon','storm'];
 const techniques=[{id:'samjae-arc',action:'moon',name:'삼재검법 · 횡검',glyph:'斬'},{id:'plum-first',action:'storm',name:'매화노방 · 제1초식',glyph:'梅'}];
 const active=g=>!!g.worldState?.murimJourney;
 const initial=()=>({version:1,slots:{moon:null,storm:null}});
 const state=g=>g.worldState?.murimLoadout;
 function learned(g,id){return active(g)&&(id==='samjae-arc'?g.worldState.murimGrowth?.levels.arc>0:id==='plum-first'?g.worldState.murimJourney.disciple==='accept':false);}
 function skill(g,id){const t=techniques.find(t=>t.id===id);if(!t||!learned(g,id))return null;return {...g.murimTechniqueInfo(t.action),...t,techniqueId:id,cooldownKey:t.action};}
 function resolve(g,input){if(!active(g))return input;if(['attack','dash','potion'].includes(input))return input;if(!slots.includes(input))return null;const id=state(g)?.slots[input];return learned(g,id)?techniques.find(t=>t.id===id).action:null;}
 function describe(g){return {editable:Growth.safe(g),learned:techniques.filter(t=>learned(g,t.id)).map(t=>skill(g,t.id)),slots:slots.map(id=>{const skillId=state(g)?.slots[id]??null;return {id,skillId,skill:skill(g,skillId)};})};}
 function assign(g,slot,id){if(!Growth.safe(g)||!slots.includes(slot)||id!==null&&!learned(g,id)||!state(g))return false;const assigned=state(g).slots;if(assigned[slot]===id)return false;const other=slots.find(s=>s!==slot&&id!==null&&assigned[s]===id);if(other)assigned[other]=assigned[slot];assigned[slot]=id;return true;}
 function info(g,input){const action=resolve(g,input);if(action===null)return {name:'',glyph:'',description:'',cost:0,cool:0,need:0,locked:true,hidden:true,techniqueId:null,cooldownKey:null};const t=techniques.find(t=>t.action===action);return {...g.murimTechniqueInfo(action),...(t?{name:t.name,glyph:t.glyph}:{}),techniqueId:t?.id??null,cooldownKey:action,hidden:false};}
 function validate(g,allowMigration=false){if(!active(g))return;if(state(g)===undefined&&allowMigration){const s=initial();if(learned(g,'samjae-arc'))s.slots.moon='samjae-arc';if(learned(g,'plum-first'))s.slots.storm='plum-first';g.worldState.murimLoadout=s;}
  const s=state(g);if(!s||s.version!==1||Object.keys(s).length!==2||!s.slots||Array.isArray(s.slots)||Object.keys(s.slots).length!==2||slots.some(k=>!Object.hasOwn(s.slots,k)||s.slots[k]!==null&&!learned(g,s.slots[k]))||s.slots.moon!==null&&s.slots.moon===s.slots.storm)throw Error('무림 단축키 기록 오류');
 }
 return {active,initial,state,slots,techniques,learned,skill,resolve,describe,assign,info,validate};
});
