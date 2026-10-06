/* Witnessed field awakening. A mentor interprets an ability; never invents its origin. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LegendRules=api;})(globalThis,function(){
  'use strict';
  const paths=['ripple','echo','seal'];
  const labels={ripple:'파문검',echo:'잔영보',seal:'경계봉인'};
  const colors={ripple:'#ffe0a0',echo:'#d5c0ff',seal:'#92efd5'};
  const actions={ripple:'다가오는 검을 끝까지 보고 맞받아쳤다',echo:'자신을 노린 공격에서 빠져나와 같은 적에게 되돌아갔다',seal:'불안정한 틈에 손을 대어 다가오는 공격을 가라앉혔다'};
  let areas;
  const valid=p=>paths.includes(p),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function install(world){
    areas=world;
    for(const id of ['forest','rift','ruins','harbor','heart']){
      const a=world[id];if(!a||a.points.some(p=>p.kind==='scar'))continue;
      a.points.push({id:'scar-a',x:420,y:885,label:'바람이 멎은 틈',kind:'scar'}, {id:'scar-b',x:830,y:755,label:'파문이 겹치는 틈',kind:'scar'});
    }
  }
  function initial(){return {counts:{ripple:0,echo:0,seal:0},memories:[],ready:[],awakened:[]};}
  function enter(g){g.legendRuntime={seen:new Set(),evade:null,scarAt:-10};}
  function init(g){g.legend=initial();enter(g);}
  function eligible(g){return g.progress>=2&&!areas[g.area].safe&&!g.trial&&!g.advancementTrial&&!g.worldState?.resonanceChallenges?.active&&g.area!=='comparison';}
  function remember(g,path,e){
    const r=g.legendRuntime,l=g.legend;if(!eligible(g)||!valid(path)||!e?.id||l.counts[path]>=2)return false;
    const key=[g.area,e.id,e.attacks||0,path].join(':');if(r.seen.has(key))return false;r.seen.add(key);
    l.counts[path]++;const memory={path,area:g.area,foe:String(e.name||'이름 없는 적').slice(0,80),action:actions[path],at:g.playTime};
    l.memories.push(memory);if(l.memories.length>12)l.memories.shift();
    if(!g.fate.discovered.includes(path))g.fate.discovered.push(path);
    g.effect('legend-'+path,g.player.x,g.player.y,{life:1.1,max:1.1,color:colors[path],range:170});
    g.effect('text',g.player.x,g.player.y-94,{text:l.counts[path]===1?'이름 없는 발현':'그때의 호흡이 돌아왔다',color:colors[path],life:1.6,max:1.6});
    g.emit('sound',{name:path});g.hitStop=.05;
    const text=`${areas[g.area].name} · ${memory.foe}\n${memory.action}.`;
    if(l.counts[path]===1){g.emit('manifestation',{path,title:'방금, 내 검이 달라졌다',text});}
    else {l.ready.push(path);g.emit('legend-ready',{path,title:'누가 가르쳐준 적 없는 호흡',text:text+'\n\n앞서 남은 감각과 지금의 선택이 이어졌다.\n이 힘은 이미 내 안에서 움직이고 있다.',portrait:'hero'});}
    return true;
  }
  function dash(g){
    if(!eligible(g))return;
    const e=g.enemies.find(e=>e.hp>0&&e.wind>0&&!(e.boss&&g.bossLocked())&&distance(g.player,{x:e.tx,y:e.ty})<e.range+g.player.r*.4);
    g.legendRuntime.evade=e?{id:e.id,serial:e.attacks||0,area:g.area,x:g.player.x,y:g.player.y,until:g.playTime+1.8,escaped:false}:null;
  }
  function impact(g,e){
    const v=g.legendRuntime.evade;if(!v||v.area!==g.area||e.id!==v.id||(e.attacks||0)!==v.serial)return;
    v.escaped=g.player.invuln>0||distance(g.player,{x:e.tx,y:e.ty})>=e.range+g.player.r*.4;
  }
  function hit(g,e,source){
    if(!eligible(g)||source!=='attack')return;
    const v=g.legendRuntime.evade;
    if(v&&v.id===e.id&&v.area===g.area&&v.escaped&&g.playTime<=v.until&&distance(g.player,v)>=40){
      g.legendRuntime.evade=null;
      if(remember(g,'echo',e)){g.effect('fate-link',g.player.x,g.player.y,{path:'echo',tx:v.x,ty:v.y,life:.65,max:.65});if(e.hp>0)g.strike(e,Math.round(g.stats().attack*.8),'manifestation');}
      return;
    }
    if(g.legendRuntime.manual&&e.wind>0&&e.wind<=.32&&distance(g.player,e)<=125+e.r&&g.lineClear(g.player,e)&&!(e.boss&&g.bossLocked())){
      if(remember(g,'ripple',e)){e.wind=0;e.stun=.65;e.cd=1.2;if(e.hp>0)g.strike(e,Math.round(g.stats().attack*.8),'manifestation');}
    }
  }
  function interact(g,o){
    if(o.kind!=='scar')return null;
    if(!eligible(g))return {type:'dialog',title:'흐름이 멎은 자리',text:'금 사이로 찬 바람이 새어 나온다.\n칼끝과 숨결이 어우러질 때, 이 틈도 다르게 보일 것 같다.',portrait:'hero'};
    if(g.playTime-g.legendRuntime.scarAt<1.5)return {type:'toast',text:'잠잠해진 틈에서 잔향이 흩어진다.'};
    const enemies=g.enemies.filter(e=>e.hp>0&&e.wind>0&&distance(e,o)<190&&g.lineClear(o,e)&&!(e.boss&&g.bossLocked()));
    if(!enemies.length)return {type:'dialog',title:'틈은 공격의 기운에 반응한다',text:'부수지 않고 손을 댄다. 지금은 조용하다.\n\n적의 공격 기운이 다가올 때, 여기서 흐름을 붙잡아 볼 수 있을 것 같다.\n전투 중 가까이에서 E / 대화·이동으로 반응한다.',portrait:'hero'};
    g.legendRuntime.scarAt=g.playTime;
    const first=enemies[0];for(const e of enemies){e.wind=0;e.cd=1.5;e.stun=.35;}
    g.effect('legend-seal',o.x,o.y,{life:1.1,max:1.1,range:190,color:colors.seal});remember(g,'seal',first);
    g.player.mp=Math.min(g.stats().mp,g.player.mp+6);
    return {type:'toast',text:'틈이 숨을 골랐다 · 주변의 공격 기운이 가라앉는다.'};
  }
  function awaken(g,path){
    if(!valid(path)||!g.legend.ready.includes(path)||g.trial||g.fate.path===path&&g.legend.awakened.includes(path))return false;
    if(g.fate.path!==path&&g.fate.path&&!areas[g.area].safe)return false;
    const f=g.fate;f.path=path;if(!f.proven.includes(path))f.proven.push(path);if(!f.discovered.includes(path))f.discovered.push(path);
    if(!g.legend.awakened.includes(path))g.legend.awakened.push(path);
    if(g.progress>=12)f.stage=Math.max(3,f.stage);
    g.combat={parry:0,charges:0,echo:null,field:null,pending:[]};g.player.invuln=1;
    for(const k of ['signature1','signature2','ultimate'])g.player.cool[k]=0;
    const memory=g.legend.memories.find(m=>m.path===path);
    g.emit('awakening',{path,portrait:'hero',title:labels[path]+' · 내가 남긴 호흡',text:`${areas[memory.area].name}에서 ${memory.foe}와 마주했을 때,\n${memory.action}.\n\n누군가의 허락을 기다릴 필요는 없다.\nQ / R의 새 무공을 지금 이 자리에서 사용할 수 있다.\n기세가 100에 이르면 F로 오의를 펼친다.`});
    return true;
  }
  function witness(g){
    const m=g.legend.memories.find(m=>m.path===g.fate.path);if(!m||!g.legend.awakened.includes(m.path))return '';
    return `「${areas[m.area].name}」에서 ${m.foe}를 상대했던 그 호흡…\n${m.action}고 했지.\n그것은 내가 준 기술이 아니다. 네가 이미 움직인 결과다.\n\n`;
  }
  function validate(raw){
    if(!raw||Array.isArray(raw)||typeof raw!=='object')throw Error('발현 기록이 손상되었습니다.');
    const l=initial();for(const p of paths){const n=raw.counts?.[p];if(!Number.isInteger(n)||n<0||n>2)throw Error('잘못된 발현 횟수입니다.');l.counts[p]=n;}
    for(const k of ['ready','awakened']){if(!Array.isArray(raw[k])||raw[k].length>3||raw[k].some(p=>!valid(p))||new Set(raw[k]).size!==raw[k].length)throw Error('발현 계열이 잘못되었습니다.');l[k]=raw[k].slice();}
    if(l.ready.some(p=>l.counts[p]!==2)||l.awakened.some(p=>!l.ready.includes(p)))throw Error('발현 상태가 일치하지 않습니다.');
    if(!Array.isArray(raw.memories)||raw.memories.length>12)throw Error('발현 기록 크기가 잘못되었습니다.');
    for(const m of raw.memories){if(!m||!valid(m.path)||!Object.hasOwn(areas,m.area)||typeof m.foe!=='string'||m.foe.length>80||m.action!==actions[m.path]||!Number.isFinite(m.at)||m.at<0||m.at>1e10)throw Error('발현 기록 값이 잘못되었습니다.');l.memories.push({path:m.path,area:m.area,foe:m.foe,action:m.action,at:m.at});}
    for(const p of paths)if(l.memories.filter(m=>m.path===p).length!==l.counts[p])throw Error('행적과 발현 횟수가 일치하지 않습니다.');
    return l;
  }
  return {install,init,enter,dash,impact,hit,interact,awaken,witness,validate,labels,colors};
});
