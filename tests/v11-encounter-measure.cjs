// Reproducible measurement tool; never changes authored enemy stats or locks.
const {Game,AREAS}=require('../world-game.js'),{inherited}=require('./world-fixtures.cjs');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function route(g,target){const p=g.player;if(g.lineClear(p,target))return target;const cell=40,a=AREAS[g.area],maxX=Math.floor(a.w/cell),maxY=Math.floor(a.h/cell),key=(x,y)=>x+','+y,start=[Math.round(p.x/cell),Math.round(p.y/cell)],finish=[Math.round(target.x/cell),Math.round(target.y/cell)];const queue=[start],previous=new Map([[key(...start),null]]);let reached=null,best=start;
 for(let i=0;i<queue.length&&i<5000;i++){const [x,y]=queue[i],point={x:x*cell,y:y*cell};if(distance(point,target)<distance({x:best[0]*cell,y:best[1]*cell},target))best=[x,y];if(distance(point,target)<55){reached=[x,y];break;}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny),next={x:nx*cell,y:ny*cell};if(nx<1||ny<1||nx>=maxX||ny>=maxY||previous.has(k)||g.blocked(next.x,next.y,p.r)||!g.lineClear(point,next))continue;previous.set(k,[x,y]);queue.push([nx,ny]);}}
 let current=reached||best,parent=previous.get(key(...current));while(parent&&previous.get(key(...parent))){current=parent;parent=previous.get(key(...current));}return {x:current[0]*cell,y:current[1]*cell};
}
function runEncounter({area='forest',policy='hold',grown=false,maxSeconds=240,candidate=null}={}){
 const g=grown?inherited('ripple'):new Game();g.progress=area==='forest'?2:5;g.training=area==='forest'?1:2;g.enter(area==='forest'?'village':'city');g.introActive=false;
 const initial={level:g.level,stats:{...g.stats()},potions:g.potions,training:g.training};if(!g.enter(area))throw Error('Entry rejected: '+area);const enemies=g.enemies.slice();if(candidate)for(const e of enemies){const value=candidate[e.role];if(value!==undefined)e.hp=e.maxHp=value;}const authored=enemies.map(e=>({id:e.id,role:e.role,hp:e.hp,damage:e.damage,cooldown:e.cd})),boss=enemies.find(e=>e.boss),at=g.playTime;let damage=0,hits=0,potions=0,dodges=0,defeated=false,bossAt=null,bossDamage=0,minionsAt=null,firstContact=null,firstGroupAt=null;
 const hit=g.takeHit;g.takeHit=function(...args){const hp=this.player.hp,result=hit.apply(this,args);if(this.player.hp<hp){damage+=hp-this.player.hp;if(bossAt!==null)bossDamage+=hp-this.player.hp;hits++;}return result;};const emit=g.emit;g.emit=function(type,...args){if(type==='defeat')defeated=true;return emit.call(this,type,...args);};
 const contacts=new Map(),kills=[],strike=g.strike;g.strike=function(e,...args){const hp=e.hp,result=strike.call(this,e,...args);if(e.hp<hp){if(!contacts.has(e))contacts.set(e,this.playTime);if(e.hp<=0)kills.push({id:e.id,role:e.role,seconds:Number((this.playTime-contacts.get(e)).toFixed(2))});}return result;};
 let routeAt=-1,waypoint=null,goalId=null,steps=0,holdEngaged=false;
 while(g.area===area&&boss.hp>0&&g.playTime-at<maxSeconds&&steps++<maxSeconds*50){
  const alive=enemies.filter(e=>e.hp>0&&!e.boss),unsealed=g.seals().filter(o=>!g.activated.includes(o.id));if(!alive.length&&minionsAt===null)minionsAt=g.playTime-at;if(!alive.some(e=>e.group===0)&&firstGroupAt===null)firstGroupAt=g.playTime-at;
  let target=alive.sort((a,b)=>distance(a,g.player)-distance(b,g.player))[0]||unsealed[0]||boss;
  if(!alive.length&&unsealed.length&&distance(g.player,target)<70){g.interact();continue;}
  if(target===boss&&!g.bossLocked()&&distance(g.player,boss)<160&&bossAt===null)bossAt=g.playTime;
  const d=distance(g.player,target);if(target.hp>0&&d<125&&firstContact===null)firstContact=g.playTime-at;
  if(policy==='hold'){if(target.hp>0&&d<110)holdEngaged=true;if(!enemies.some(e=>e.hp>0&&!(e.boss&&g.bossLocked())&&distance(e,g.player)<350))holdEngaged=false;}
  const threat=enemies.find(e=>e.hp>0&&e.wind>0&&e.wind<.3&&g.enemyThreatContains(e));
  if(policy==='response'&&grown){if(threat&&g.player.cool.signature1<=0)g.act('signature1');const boost=area==='rift'?g.realityRuntime?.boost:g.combat.charges>0;if(boost&&d<160){g.player.face=Math.atan2(target.y-g.player.y,target.x-g.player.x);g.act('signature2');}}
  const guard=policy==='response'&&grown&&(area==='rift'?g.realityRuntime?.guard?.until>g.playTime:g.combat.parry>0);
  if(policy!=='hold'&&threat&&!guard&&g.player.cool.dash<=0){let angle=Math.atan2(g.player.y-threat.ty,g.player.x-threat.tx);if(distance(g.player,{x:threat.tx,y:threat.ty})<10)angle=Math.atan2(threat.y-g.player.y,threat.x-g.player.x)+Math.PI/2;for(const turn of [0,Math.PI/2,-Math.PI/2,Math.PI]){const candidate=angle+turn;if(!g.blocked(g.player.x+Math.cos(candidate)*100,g.player.y+Math.sin(candidate)*100,g.player.r)){g.player.face=candidate;if(g.act('dash'))dodges++;break;}}}
  if(policy!=='hold'&&g.player.hp<g.stats().hp*.4&&g.potions>0&&g.player.cool.potion<=0){if(g.act('potion'))potions++;}
  if(target.hp>0){g.player.face=Math.atan2(target.y-g.player.y,target.x-g.player.x);g.act('attack',true);}
  let input={};if((policy!=='hold'||!holdEngaged||!target.hp)&&(d>65||!g.lineClear(g.player,target))){if(g.playTime>=routeAt||goalId!==target.id){waypoint=route(g,target);routeAt=g.playTime+.25;goalId=target.id;}if(waypoint){const angle=Math.atan2(waypoint.y-g.player.y,waypoint.x-g.player.x);input={x:Math.cos(angle),y:Math.sin(angle)};}}
  g.step(.05,input);g.events=[];
 }
 return {area,policy,grown,candidate,initial,authored,kills,seconds:Number((g.playTime-at).toFixed(2)),firstContact,firstGroupSeconds:firstGroupAt===null?null:Number((firstGroupAt-(firstContact||0)).toFixed(2)),minionsSeconds:minionsAt===null?null:Number(minionsAt.toFixed(2)),bossSeconds:bossAt===null?null:Number((g.playTime-bossAt).toFixed(2)),damage,bossDamage,hits,potions,dodges,dead:defeated,complete:boss.hp===0,remaining:enemies.filter(e=>e.hp>0).map(e=>({role:e.role,hp:e.hp})),finalLevel:g.level,finalHp:g.player.hp,limited:g.area===area&&boss.hp>0&&!defeated};
}
const proposed={forest:{pressure:300,heavy:1400,ranged:240,boss:5800},rift:{pressure:250,heavy:1400,ranged:210,boss:4800}};
if(require.main===module){console.log(JSON.stringify(['forest','rift'].flatMap(area=>[false,true].flatMap(grown=>(grown?['hold','dodge','response']:['hold','dodge']).map(policy=>runEncounter({area,grown,policy,candidate:process.argv.includes('--candidate')?proposed[area]:null})))),null,2));}
module.exports={runEncounter,proposed};
