/* Full-body sprite adapter. Simulation state is read-only; missing art is explicit. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ArtRuntime=api;})(globalThis,function(){
 'use strict';
 const directions=['e','se','s','sw','w','nw','n','ne'];
 function query(world,entityId,e,time,{linger=false}={}){
  const m=e.motion||{},a=m.instance,active=a&&time>=a.startedAt&&(linger||time<a.startedAt+a.duration);
  const angle=active?a.angle:Number.isFinite(e.face)?e.face:Math.PI/2;
  const facing=directions[((Math.round(angle/(Math.PI/4))%8)+8)%8];
  let action=active?a.action:e.walking?'walk':'idle';
  if(action==='attack')action='attack'+a.combo;
  if(action==='dash')action='dodge';
  return {world,entityId,action,facing,elapsed:active?time-a.startedAt:e.walking?(m.stride||0)/215:time,loop:!active};
 }
 function placement(visual,e,height){
  const f=visual.frame,r=f.rect,p=f.pivot,scale=height/r[3],w=r[2]*scale,x=e.x-w*p[0],y=e.y-height*p[1],sockets={};
  for(const [name,point]of Object.entries(f.sockets||{}))sockets[name]={x:x+point[0]*scale,y:y+point[1]*scale};
  return {destination:[x,y,w,height],sockets};
 }
 return {query,placement};
});
