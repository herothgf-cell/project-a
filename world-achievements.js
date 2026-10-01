(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.WorldAchievements=api;})(globalThis,function(){
 'use strict';const families=['ripple','echo','seal'];
 const state=g=>g.worldState.achievements||(g.worldState.achievements={earned:[],settled:[],results:[]});
 function eligible(g){const w=g.worldGrowth.murim,out=[];for(const n of [5,10]){if(w.level>=n)out.push('murim-level:'+n);for(const f of families)if(w.mastery[f]>=n)out.push('murim-mastery:'+f+':'+n);}if(g.journey.realm)out.push('murim-realm:1');for(const f of g.revision.inherited)out.push('inherit:'+f);for(const k of g.journey.known)out.push('interpret:'+k);return out;}
 function collect(g){const s=state(g);for(const id of eligible(g))if(!s.earned.includes(id))s.earned.push(id);return s;}
 function reward(id){return id.startsWith('murim-level:')?{hp:5,mp:0,attack:0}:id.startsWith('murim-mastery:')?{hp:0,mp:0,attack:1}:id==='murim-realm:1'?{hp:10,mp:5,attack:0}:{hp:0,mp:0,attack:0};}
 function bonuses(g){return state(g).settled.reduce((b,id)=>{const r=reward(id);for(const k of ['hp','mp','attack'])b[k]+=r[k];return b;},{hp:0,mp:0,attack:0});}
 function settle(g){const s=collect(g),rows=[];for(const id of s.earned){if(s.settled.includes(id))continue;const before=g.stats();s.settled.push(id);const after=g.stats(),row={id,source:id,before:{hp:before.hp,mp:before.mp,attack:before.attack},after:{hp:after.hp,mp:after.mp,attack:after.attack},unlocked:id.startsWith('inherit:')?id.slice(8):null};s.results.push(row);rows.push(row);g.publishNews?.({id:'return:'+id,kind:'return',subject:id,payload:row});}if(rows.length)g.toast('현실 정착 · 새로운 성과 '+rows.length+'개 · 소식에서 변화 확인');return rows;}
 function validate(g){const s=state(g),valid=eligible(g);for(const key of ['earned','settled'])if(!Array.isArray(s[key])||s[key].length>40||new Set(s[key]).size!==s[key].length||s[key].some(id=>!valid.includes(id)||key==='settled'&&!s.earned.includes(id)))throw Error('전승 성취 기록 오류');if(!Array.isArray(s.results)||s.results.length>40||s.results.some(r=>!s.settled.includes(r.id)))throw Error('전승 결과 기록 오류');}
 return {state,eligible,collect,reward,bonuses,settle,validate};
});
