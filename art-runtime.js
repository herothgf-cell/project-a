/* Full-body sprite adapter. Simulation state is read-only; missing art is explicit. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ArtRuntime=api;})(globalThis,function(){
 'use strict';
 const directions=['e','se','s','sw','w','nw','n','ne'];
 function query(world,entityId,e,time,{linger=false}={}){
  const m=e.motion||{},running=a=>a&&time>=a.startedAt&&(linger||time<a.startedAt+a.duration);
  const a=running(m.instance)?m.instance:m.reaction,active=running(a);
  const angle=active?a.angle:Number.isFinite(e.face)?e.face:Math.PI/2;
  const facing=directions[((Math.round(angle/(Math.PI/4))%8)+8)%8];
  let action=active?a.action:e.walking?'walk':'idle';
  if(action==='attack')action='attack'+a.combo;
  if(action==='dash')action='dodge';
  const semanticAction=active?a.action:action;
  if(action==='storm')action='cast';
  else if(action==='moon'||action==='ultimate-ripple'||action==='ultimate-echo')action='attack3';
  else if(action==='seal'||action==='ultimate-seal')action='cast';
  else if(action==='ripple')action=a.input==='signature2'?'attack2':'cast';
  else if(action==='echo')action=a.input==='signature2'?'attack1':'dodge';
  return {world,entityId,action,semanticAction,facing,elapsed:active?time-a.startedAt:e.walking?(m.stride||0)/215:time,loop:!active};
 }
 function placement(visual,e,height){
  const f=visual.frame,r=f.rect,p=f.pivot,scale=height/r[3],w=r[2]*scale,x=e.x-w*p[0],y=e.y-height*p[1],sockets={};
  for(const [name,point]of Object.entries(f.sockets||{}))sockets[name]={x:x+point[0]*scale,y:y+point[1]*scale};
  return {destination:[x,y,w,height],sockets};
 }
 function npcIdentity(world,id){
  const ids={reality:{warden:'seorin',shop:'supply',partner:'dogyeom','witness-hunter':'dogyeom',hunter:'dogyeom'},murim:{master:'baekryun',shop:'apothecary','returned-yeonhwa':'yeonhwa','stranded-yeonhwa':'yeonhwa',yeonhwa:'yeonhwa'}};
  const name=ids[world]?.[id];return name?'npc.'+name:null;
 }
 function environmentIdentity(area,index){
  const world=area==='city'?'reality':area==='village'?'murim':null;
  return world&&Number.isInteger(index)&&index>=0?{world,entityId:'environment.'+area,action:'building-'+index,facing:'none'}:null;
 }
 function portalState(g,o){
  if(o.need>g.progress)return 'locked';
  if(o.kind==='portal'&&g.presentationTravel&&g.playTime-g.presentationTravel.at<.5&&g.presentationTravel.from!==g.presentationTravel.to)return 'transition';
  return Math.hypot(g.player.x-o.x,g.player.y-o.y)<100?'active':'available';
 }
 function effectQuery(f){
  const phase=Math.max(0,Math.min(.999,1-f.life/f.max));let id,cell;
  if(f.kind==='slash'){id='blade';cell=f.skill==='moon'?3:Math.max(0,Math.min(2,(f.combo||1)-1));}
  else if(f.kind==='storm'){id='storm';cell=Math.floor(phase*4);}
  else if(f.kind==='fate-guard'){id='ripple';cell=0;}
  else if(f.kind==='fate-parry'){id='ripple';cell=1;}
  else if(f.kind==='fate-wave'){id='blade';cell=4;}
  else if(f.kind==='fate-seal'){id='seal';cell=1;}
  else if(f.kind==='fate-chain'){id='seal';cell=2;}
  else if(f.kind==='fate-trail'||f.kind==='dash'){id='echo';cell=0;}
  else if(f.kind==='fate-link'){id='echo';cell=1;}
  else return null;
  return {world:'shared',entityId:'vfx.'+id,action:'cell-'+cell,facing:'none'};
 }
 function enemyQuery(world,e,time,observed={}){
  if(!(world==='reality'?['shade','sentinel']:world==='murim'?['bandit','chief']:[]).includes(e.kind))return null;
  let action='idle',elapsed=time,loop=true;
  if(e.hp<=0){action='death';elapsed=Math.max(0,time-(observed.deathAt??time));loop=false;}
  else if(e.wind>0){action='telegraph';elapsed=(1-e.wind/e.windMax)*.4;loop=false;}
  else if(Number.isFinite(observed.attackAt)&&time-observed.attackAt<.4){action='attack';elapsed=Math.max(0,time-observed.attackAt);loop=false;}
  else if(e.flash>0){action='hit';elapsed=Math.max(0,.12-e.flash);loop=false;}
  else if(observed.moving){action='move';}
  return {world,entityId:'enemy.'+e.kind,action,facing:'se',elapsed,loop};
 }
 return {query,placement,npcIdentity,environmentIdentity,portalState,effectQuery,enemyQuery};
});
