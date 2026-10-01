(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.RealitySkills=api;})(globalThis,function(){
 'use strict';
 const families=['ripple','echo','seal'],actions=['moon','storm','signature1','signature2','ultimate'];
 const table={
  sword:[['집중 타격',14,3,140,1.8,'전방의 적 하나를 집중해서 벱니다.'],['연속 타격',20,5,160,1.1,'짧은 간격으로 두 번 벱니다.']],
  ripple:[['충격 흡수',12,4,0,0,'0.7초 안에 적의 공격 한 번을 흡수합니다. 다음 수동 타격 강화.'],['압축 반격',16,5,170,2,'보관한 충격을 소비하면 3배 반격.'],['반격 돌파',0,1,240,4,'기세 100 · 전방 검격과 0.8초 경직.']],
  echo:[['긴급 가속',12,4,160,0,'앞으로 이동. 실제 예고를 벗어나면 다음 수동 타격 강화.'],['추격 타격',16,5,170,2,'가속 성공 후 적중하면 2.8배. 이전 위치로 돌아가지 않습니다.'],['돌파 기동',0,1,240,3.5,'기세 100 · 앞으로 이동하며 경로 주변을 한 번 벱니다.']],
  seal:[['균열 억제',14,5,220,0,'적 하나의 공격 예고를 끊고 재생을 4초 억제합니다.'],['약점 타격',18,5,200,2,'억제 중인 적에게 3배 타격.'],['집중 봉쇄',0,1,280,4,'기세 100 · 적 하나를 타격하고 6초 재생 억제.']]
 };
 const runtime=g=>g.realityRuntime||(g.realityRuntime={serial:0,guard:null,boost:null,evade:null,pending:[],credits:{},seen:new Set()});
 const state=g=>g.worldState.reality||(g.worldState.reality={settled:[]});
 function status(g,f){return !g.worldState.achievements?.settled.includes('inherit:'+f)?'locked':state(g).settled.includes(f)?'settled':'available';}
 function info(g,a){if(!actions.includes(a))return null;const common=['moon','storm'].includes(a),family=common?'sword':g.worldGrowth.reality.equipped,row=common?table.sword[a==='moon'?0:1]:table[family]?.[actions.indexOf(a)-2];if(!row)return {name:'현실 대응 미장착',glyph:'?',cost:0,cool:0,need:0,locked:true,description:'기연을 계승하고 귀환한 뒤 무공에서 현실 대응을 장착하세요.'};return {name:row[0],glyph:common?'검':family==='ripple'?'흡':family==='echo'?'속':'억',cost:row[1],cool:row[2],range:row[3],mult:row[4],description:row[5],need:0,path:family,locked:common?g.training<(a==='moon'?1:2):status(g,family)==='locked'};}
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const valid=(g,e)=>e&&g.enemies.includes(e)&&!e.trial&&!g.trial&&!(e.boss&&g.bossLocked());
 function targets(g,range){return g.enemies.filter(e=>e.hp>0&&valid(g,e)&&distance(e,g.player)<=range+e.r&&Math.cos(Math.atan2(e.y-g.player.y,e.x-g.player.x)-g.player.face)>.25&&g.lineClear(g.player,e)).sort((a,b)=>distance(a,g.player)-distance(b,g.player));}
 function onEffect(g,c,e,kind){if(!c.manual||!valid(g,e))return false;const r=runtime(g),key=c.id+':'+e.id+':'+kind;if(r.seen.has(key))return false;r.seen.add(key);if(r.seen.size>256)r.seen.delete(r.seen.values().next().value);
  const permanent=!e.residual&&!e.trial;
  if(permanent){const count=c.family+':'+e.id;if((r.credits[count]||0)<3&&!e.comparison){r.credits[count]=(r.credits[count]||0)+1;const m=g.worldGrowth.reality.mastery;m[c.family]=Math.min(30,m[c.family]+1);if(!g.journey.worlds.includes('현실'))g.journey.worlds.push('현실');}
   if(families.includes(c.family)&&['absorb','evade','suppress'].includes(kind)&&status(g,c.family)==='available'){state(g).settled.push(c.family);g.toast('현실 대응 정착 · '+table[c.family][0][0]);g.publishNews?.({id:'response:'+c.family,kind:'skill',subject:c.family});}
  }
  g.onRealityEffect?.({castId:c.id,family:c.family,kind,target:e,manual:true,action:c.action});return true;
 }
 function hit(g,e,mult,c,kind='hit'){const n=g.strike(e,Math.round(g.stats().attack*mult),'reality:'+c.family);if(n>0)onEffect(g,c,e,kind);return n;}
 function act(g,a,held=false){const k=info(g,a);if(!k)return null;const p=g.player,r=runtime(g);if(g.introActive||k.locked||p.hp<=0||p.cool[a]>0||p.mp<k.cost||a==='ultimate'&&g.fate.focus<100)return false;
  const c={id:++r.serial,family:k.path,manual:!held,action:a},v=targets(g,k.range),from={x:p.x,y:p.y};p.mp-=k.cost;p.cool[a]=k.cool;p.swing=.3;if(a==='ultimate')g.fate.focus=0;
  if(a==='moon')hitTarget(v[0],k.mult);
  else if(a==='storm'){hitTarget(v[0],k.mult);r.pending.push({at:g.playTime+.15,c,range:k.range,mult:k.mult});}
  else if(k.path==='ripple'){
   if(a==='signature1')r.guard={until:g.playTime+.7,c};
   else {const charged=r.boost?.family==='ripple'&&r.boost.until>g.playTime;r.boost=null;for(const e of v){hit(g,e,a==='ultimate'?4:charged?3:2,c,charged?'counter':'hit');if(a==='ultimate')e.stun=.8;}}
  }else if(k.path==='echo'){
   if(a==='signature1'||a==='ultimate'){
    const threats=g.enemies.filter(e=>e.hp>0&&valid(g,e)&&e.wind>0&&distance(p,{x:e.tx,y:e.ty})<e.range+p.r*.4).map(e=>({e,at:g.playTime+e.wind,tx:e.tx,ty:e.ty,range:e.range}));
    g.move(p,Math.cos(p.face)*k.range,Math.sin(p.face)*k.range);p.invuln=Math.max(p.invuln,.35);
    if(a==='signature1')r.evade={c,threats};else for(const e of g.enemies){const dx=p.x-from.x,dy=p.y-from.y,t=Math.max(0,Math.min(1,((e.x-from.x)*dx+(e.y-from.y)*dy)/(dx*dx+dy*dy||1)));if(e.hp>0&&valid(g,e)&&distance(e,{x:from.x+dx*t,y:from.y+dy*t})<=90+e.r&&g.lineClear(p,e))hit(g,e,3.5,c);}
   }else {const charged=r.boost?.family==='echo'&&r.boost.until>g.playTime;r.boost=null;for(const e of v)hit(g,e,charged?2.8:2,c,charged?'pursuit':'hit');}
  }else if(k.path==='seal'){
   const e=v[0];if(e){if(a==='signature1'||a==='ultimate'){const effective=e.wind>0; e.wind=0;e.cd=Math.max(e.cd,1);e.realitySuppressedUntil=g.playTime+(a==='ultimate'?6:4);if(effective)onEffect(g,c,e,'suppress');if(a==='ultimate'){hit(g,e,4,c);e.stun=1;}}else hit(g,e,e.realitySuppressedUntil>g.playTime?3:2,c,e.realitySuppressedUntil>g.playTime?'weakness':'hit');}
  }
  const motion=p.motion||(p.motion={}),action=a==='ultimate'?'ultimate-'+k.path:a==='signature1'||a==='signature2'?k.path:a;
  Object.assign(motion,{action,at:g.playTime,angle:p.face,duration:.3,combo:g.combo});motion.instance=Object.freeze({actionId:'reality-'+c.id,action,input:a,startedAt:g.playTime,contactAt:g.playTime,angle:p.face,duration:.3,combo:g.combo});
  g.effect(a==='signature1'&&k.path==='ripple'?'fate-guard':'fate-wave',p.x,p.y,{path:k.path,angle:p.face,range:k.range||60,life:.6,max:.6,actionInstance:motion.instance});g.emit('sound',{name:a==='ultimate'?'ultimate':k.path==='sword'?'swing':k.path});return true;
  function hitTarget(e,m){if(e)hit(g,e,m,c);}
 }
 function absorb(g,e){const r=runtime(g);if(g.player.invuln>0||!r.guard||r.guard.until<=g.playTime||!valid(g,e))return false;const c=r.guard.c;r.guard=null;r.boost={family:'ripple',until:g.playTime+4,mult:1.8};onEffect(g,c,e,'absorb');g.effect('fate-parry',g.player.x,g.player.y,{path:'ripple',life:.6,max:.6});return true;}
 function step(g){const r=runtime(g);if(r.evade){for(const t of r.evade.threats){if(t.done||g.playTime<t.at)continue;t.done=true;if(t.e.hp>0&&g.player.hp>0&&distance(g.player,{x:t.tx,y:t.ty})>=t.range+g.player.r*.4){r.boost={family:'echo',until:g.playTime+3,mult:1.6};onEffect(g,r.evade.c,t.e,'evade');}}if(r.evade.threats.every(t=>t.done))r.evade=null;}
  const due=r.pending.filter(h=>h.at<=g.playTime);r.pending=r.pending.filter(h=>h.at>g.playTime);for(const h of due){const e=targets(g,h.range)[0];if(e)hit(g,e,h.mult,h.c);}
 }
 function validate(g){const s=state(g);if(!Array.isArray(s.settled)||s.settled.length>3||new Set(s.settled).size!==s.settled.length||s.settled.some(f=>!families.includes(f)||status(g,f)==='locked'))throw Error('현실 대응 기록 오류');g.worldState.reality={settled:[...s.settled]};}
 return {table,info,act,status,state,runtime,onEffect,absorb,step,validate};
});
