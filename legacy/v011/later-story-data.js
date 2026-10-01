(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./dual-breath.js'):root.DualBreath);if(n)module.exports=api;else root.LaterStory=api;})(globalThis,function(api){
 'use strict';const {AREAS,Game}=api,areas=['stabilization','woundPass','woundDock','woundCore'];
 const initial=()=>({six:0,seven:0,dualBreath:false,passOpened:false,dockStabilized:false,coreOpened:false,completed:false}),state=g=>g.laterStory||(g.laterStory=initial());
 function validate(raw,g){const s={};for(const [k,v]of Object.entries(initial())){if(typeof raw[k]!==typeof v)throw Error('후속 이야기 필드 오류');s[k]=raw[k];}if(!Number.isInteger(s.six)||s.six<0||s.six>5||!Number.isInteger(s.seven)||s.seven<0||s.seven>5||s.six>0&&g.journey.phase!==5||s.dualBreath!==(s.six>=3)||s.seven>0&&s.six!==5||s.passOpened!==(s.seven>=2)||s.dockStabilized!==(s.seven>=3)||s.coreOpened!==(s.seven>=3)||s.completed!==(s.seven===5))throw Error('후속 이야기 선행 조건 오류');return s;}
 const world=id=>AREAS[id]?.world;
 function canEnter(g,id){const s=state(g);return id==='stabilization'?s.six>=1:id==='woundPass'?s.seven>=1:id==='woundDock'?s.seven>=1:id==='woundCore'?s.coreOpened:false;}
 function point(id,x,y,label,kind='later-device',extra={}){return {id,x,y,label,kind,...extra};}
 if(!AREAS.stabilization){AREAS.stabilization={...AREAS.station,name:'안정화 현장 · 되돌아오는 파동',sub:'적을 쓰러뜨려도 다시 차오르는 흐름',chapter:6,hp:160,bossHp:900,damage:15,positions:[[430,780],[820,720],[1140,350]],points:[point('exit',110,975,'헌터 기지로 귀환','exit'),point('six-record',360,900,'안정화 기록 확인')],blocks:AREAS.station.blocks.map(x=>({...x}))};AREAS.city.points.push(point('sixGate',900,670,'안정화 현장','later-gate',{to:'stabilization'}));}
 function record(g,id,text){const rows=g.revision.history;if(!rows.some(x=>x.id===id))rows.push({id,text,area:AREAS[g.area].world==='현실'?'city':'village',at:g.playTime});}
 function reward(g,id,text,gold=100,xp=120){if(g.revision.history.some(x=>x.id===id))return;record(g,id,text);g.gold=Math.min(999999,g.gold+gold);g.xp+=xp;while(g.level<80&&g.xp>=g.stats().next){g.xp-=g.stats().next;g.level++;}g.xp=Math.min(g.xp,g.stats().next-1);g.toast(text+' · 금화 '+gold+' / 경험치 '+xp);}
 const rules={...api,initial,state,validate,areas,world,canEnter,point,record,reward};Game.laterRules=rules;return rules;
});
