/* Early murim growth. Numeric costs/effects are playtest proposals, not final canon. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.MurimGrowth=api;})(globalThis,function(){
 'use strict';
 const nodes=[
  {id:'edge',tree:'sword',name:'검로 다듬기',glyph:'劍',max:3,parent:null,mentor:null,description:'단계마다 삼재 검격 피해 +5%.'},
  {id:'arc',tree:'sword',name:'삼재 · 횡검',glyph:'斬',max:1,parent:'edge',mentor:null,description:'전방을 넓게 베는 횡검을 체득합니다. 기력 18, 재사용 2.8초.'},
  {id:'precision',tree:'sword',name:'남궁의 거리 읽기',glyph:'勢',max:3,parent:'arc',mentor:'sword',description:'횡검 피해가 단계마다 8% 증가합니다.'},
  {id:'step',tree:'movement',name:'가벼운 발',glyph:'步',max:3,parent:null,mentor:null,description:'회피 재사용 시간이 단계마다 0.1초 감소합니다.'},
  {id:'guard',tree:'movement',name:'안정된 중심',glyph:'守',max:3,parent:'step',mentor:null,description:'최대 생명이 단계마다 8 증가합니다.'},
  {id:'distance',tree:'movement',name:'아미의 거리 조절',glyph:'風',max:3,parent:'guard',mentor:'movement',description:'회피 무적 시간이 단계마다 0.03초 증가합니다.'},
  {id:'breath',tree:'inner',name:'고른 호흡',glyph:'息',max:3,parent:null,mentor:null,description:'최대 기력이 단계마다 6 증가합니다.'},
  {id:'reserve',tree:'inner',name:'기력 아끼기',glyph:'氣',max:3,parent:'breath',mentor:null,description:'횡검·매화노방 기력 소모가 단계마다 1 감소합니다.'},
  {id:'recovery',tree:'inner',name:'무당의 운기',glyph:'靜',max:3,parent:'reserve',mentor:'inner',description:'초당 기력 회복이 단계마다 0.3 증가합니다.'}
 ];
 const active=g=>!!g.worldState?.murimJourney;
 const initial=()=>({version:1,grants:['start'],allocation:{attack:0,hp:0,mp:0},levels:Object.fromEntries(nodes.map(n=>[n.id,0]))});
 const state=g=>g.worldState.murimGrowth;
 const value=id=>id==='start'?{stone:3,scroll:2}:id==='murimChance'?{stone:4,scroll:2}:/^murimRoad(?:[1-9]|10)$/.test(id)?{stone:2,scroll:1}:/^murimReturn[1-3]$/.test(id)?{stone:3,scroll:1}:null;
 function balance(g){const s=state(g),total=s.grants.reduce((a,id)=>{const v=value(id);a.stone+=v.stone;a.scroll+=v.scroll;return a;},{stone:0,scroll:0});return {...total,stone:total.stone-Object.values(s.allocation).reduce((a,n)=>a+n,0),scroll:total.scroll-Object.values(s.levels).reduce((a,n)=>a+n,0),total};}
 function grant(g,id){if(!value(id)||state(g).grants.includes(id))return false;state(g).grants.push(id);return true;}
 function safe(g){return active(g)&&g.area==='village'&&g.player.hp>0&&!g.enemies.some(e=>e.hp>0);}
 function reason(g,id){const n=nodes.find(n=>n.id===id),s=state(g);if(!n||!s)return '없는 기술';if(s.levels[id]>=n.max)return '최대 투자';if(n.parent&&!s.levels[n.parent])return nodes.find(x=>x.id===n.parent).name+' 1단계 필요';if(n.mentor&&!g.worldState.murimJourney.mentors.includes(n.mentor))return ({sword:'남궁',movement:'아미',inner:'무당'})[n.mentor]+'의 여행자와 대화 필요';if(balance(g).scroll<1)return '수련첩 부족';if(!safe(g))return '안전한 야영지에서 투자';return '';}
 function preserve(g,fn){const before=g.stats(),hp=g.player.hp/before.hp,mp=g.player.mp/before.mp;fn();const after=g.stats();g.player.hp=hp*after.hp;g.player.mp=mp*after.mp;return true;}
 function upgrade(g,id){if(reason(g,id))return false;return preserve(g,()=>state(g).levels[id]++);}
 function allocate(g,next){if(!safe(g)||!next||Object.keys(next).length!==3)return false;const s=state(g),keys=['attack','hp','mp'];if(keys.some(k=>!Number.isInteger(next[k])||next[k]<s.allocation[k]||next[k]>100))return false;const cost=keys.reduce((a,k)=>a+next[k]-s.allocation[k],0);if(cost<=0||cost>balance(g).stone)return false;return preserve(g,()=>{s.allocation={...next};});}
 function bonus(g){if(!active(g))return {attack:0,hp:0,mp:0};const s=state(g),rare=g.worldState.murimJourney.rare;return {attack:s.allocation.attack*2+(rare?4:0),hp:s.allocation.hp*10+s.levels.guard*8,mp:s.allocation.mp*5+s.levels.breath*6+(rare?10:0)};}
 function damage(g,a){if(!active(g)||g.area==='city')return 1;const l=state(g).levels;return 1+(a==='attack'?l.edge*.05:a==='moon'?l.precision*.08:0);}
 function cost(g,a,n){return active(g)&&g.area!=='city'&&['moon','storm'].includes(a)?Math.max(1,n-state(g).levels.reserve):n;}
 function info(g,a,k){if(!active(g)||!k)return k;const s=state(g),j=g.worldState.murimJourney;const names={attack:'삼재검법 · 삼재검격',moon:'삼재검법 · 횡검',storm:'매화노방 · 제1초식'};if(['signature1','signature2','ultimate'].includes(a))return {...k,locked:true,description:'이번 1~2장에서는 삼재검법과 선택 무공을 사용합니다.'};const locked=a==='moon'&&!s.levels.arc||a==='storm'&&j.disciple!=='accept';return {...k,name:names[a]||k.name,locked:!!locked,cool:a==='dash'?Math.max(.6,1.2-s.levels.step*.1):k.cool,description:a==='storm'?'제자 제안 수락 시 체득 · 주변 검세로 위협 제압 (효과 검증안)':a==='moon'?'검술 트리에서 체득 · 전방을 넓게 베는 삼재검법':a==='attack'?'백련이 급히 전한 삼재검법의 기초 검격':k.description};}
 function validate(g){if(!active(g))return;const s=state(g),j=g.worldState.murimJourney;if(!s||s.version!==1||!Array.isArray(s.grants)||s.grants.length>16||new Set(s.grants).size!==s.grants.length||!s.grants.includes('start')||s.grants.some(id=>!value(id)||id!=='start'&&!j.cleared.includes(id)))throw Error('무림 성장 보상 기록 오류');for(const id of j.cleared)if(value(id)&&!s.grants.includes(id))throw Error('무림 성장 보상 누락');if(Object.keys(s.allocation||{}).length!==3||['hp','mp','attack'].some(k=>!Number.isInteger(s.allocation[k])||s.allocation[k]<0||s.allocation[k]>100))throw Error('무림 스탯 투자 오류');if(Object.keys(s.levels||{}).length!==nodes.length||nodes.some(n=>!Number.isInteger(s.levels[n.id])||s.levels[n.id]<0||s.levels[n.id]>n.max||s.levels[n.id]>0&&(n.parent&&!s.levels[n.parent]||n.mentor&&!j.mentors.includes(n.mentor))))throw Error('무림 스킬 선행 오류');const b=balance(g);if(b.stone<0||b.scroll<0)throw Error('무림 성장 재료 초과');}
 return {active,initial,state,nodes,value,balance,grant,safe,reason,upgrade,allocate,bonus,damage,cost,info,validate};
});
