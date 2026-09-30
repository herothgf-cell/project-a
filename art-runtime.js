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
  // One gait per 100px of actual travel. Slower leg cadence does not change
  // movement speed, collision, attack clocks, or animate walking at a wall.
  return {world,entityId,action,semanticAction,facing,elapsed:active?time-a.startedAt:e.walking?(m.stride||0)*.72/100:time,loop:!active};
 }
 function placement(visual,e,height){
  const f=visual.frame,r=f.rect,p=f.pivot,scale=height/r[3],w=r[2]*scale,x=e.x-w*(f.flipX?1-p[0]:p[0]),y=e.y-height*p[1],sockets={};
  for(const [name,point]of Object.entries(f.sockets||{}))sockets[name]={x:x+(f.flipX?r[2]-point[0]:point[0])*scale,y:y+point[1]*scale};
  return {destination:[x,y,w,height],sockets};
 }
 function drawFrame(c,image,visual,placed){
  if(!visual.frame.flipX){c.drawImage(image,...visual.frame.rect,...placed.destination);return;}
  const [x,y,w,h]=placed.destination;c.save();c.translate(x+w,y);c.scale(-1,1);c.drawImage(image,...visual.frame.rect,0,0,w,h);c.restore();
 }
 function npcIdentity(world,id){
  const ids={reality:{warden:'seorin',shop:'supply',partner:'dogyeom','witness-hunter':'dogyeom',hunter:'dogyeom'},murim:{master:'baekryun',shop:'apothecary','returned-yeonhwa':'yeonhwa','stranded-yeonhwa':'yeonhwa',yeonhwa:'yeonhwa'}};
  const name=ids[world]?.[id]||world==='murim'&&id.startsWith('intro-')&&'baekryun';return name?'npc.'+name:null;
 }
 function environmentIdentity(area,index){
  const world=area==='city'?'reality':area==='village'?'murim':null;
  return world&&Number.isInteger(index)&&index>=0?{world,entityId:'environment.'+area,action:'building-'+index,facing:'none'}:null;
 }
 function blockVisual(world,kind){
  if(!['reality','murim'].includes(world))return null;
  if(kind==='rock')return {entityId:'environment.dressing',cell:world==='murim'?1:3,flat:true};
  const cells=world==='reality'?{building:0,container:3,crate:3,ruin:1}:{temple:0,templeruin:0,house:1,ruin:0};
  return Object.hasOwn(cells,kind)?{entityId:'environment.buildings',cell:cells[kind]}:null;
 }
 function portalState(g,o){
  if(o.id==='portal'&&g.progress===0||o.need>g.progress)return 'locked';
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
  else if(f.kind==='fate-ultimate'){id=f.path==='seal'?'seal':f.path==='echo'?'echo':'ripple';cell=f.path==='seal'?3:f.path==='echo'?2:3;}
  else if(f.kind==='interpret-ripple-return'){id=f.presentationPhase==='contact'?'blade':'ripple';cell=f.presentationPhase==='contact'?4:3;}
  else if(f.kind==='interpret-ripple-guard'){id='ripple';cell=2;}
  else if(f.kind==='interpret-echo-return'){id='echo';cell=1;}
  else if(f.kind==='interpret-echo-replay'){id=f.presentationPhase==='contact'?'blade':'echo';cell=f.presentationPhase==='contact'?3:2;}
  else if(f.kind==='interpret-seal-hold'){id='seal';cell=f.presentationPhase==='bind'?2:0;}
  else if(f.kind==='interpret-seal-guide'){id='seal';cell=f.presentationPhase==='contact'?2:0;}
  else return null;
  return {world:'shared',entityId:'vfx.'+id,action:'cell-'+cell,facing:'none'};
 }
 function effectRotation(f){
  const ground=['storm','fate-seal','fate-chain','fate-guard','fate-parry','interpret-seal-hold','interpret-seal-guide','interpret-ripple-guard','interpret-echo-return'];
  if(ground.includes(f.kind)||f.kind==='fate-ultimate'&&f.path==='seal')return 0;
  return f.presentationAngle??f.angle??0;
 }
 function fieldVisual(f,family='seal'){
  if(!f||!Number.isFinite(f.life)||f.life<=0||!Number.isFinite(f.radius)||f.radius<=0)return null;
  return {query:{world:'shared',entityId:'vfx.'+family,action:family==='ripple'?'cell-2':'cell-0',facing:'none'},destination:[f.x-f.radius,f.y-f.radius,f.radius*2,f.radius*2],alpha:Math.min(.7,f.life*1.4)};
 }
 function enemyQuery(world,e,time,observed={}){
  if(!(world==='reality'?['shade','sentinel','drone','tide']:world==='murim'?['bandit','chief','masked','guardian']:[]).includes(e.kind))return null;
  let action='idle',elapsed=time,loop=true;
  if(e.hp<=0){action='death';elapsed=Math.max(0,time-(e.motion?.deathAt??observed.deathAt??time));loop=false;}
  else if(e.wind>0){action='telegraph';elapsed=(1-e.wind/e.windMax)*.4;loop=false;}
  else if(Number.isFinite(e.motion?.enemyAttackAt)&&time>=e.motion.enemyAttackAt&&time-e.motion.enemyAttackAt<.4){action='attack';elapsed=time-e.motion.enemyAttackAt;loop=false;}
  else if(e.flash>0){action='hit';elapsed=Math.max(0,.12-e.flash);loop=false;}
  else if(e.walking??observed.moving){action='move';elapsed=(e.motion?.stride||0)/94;}
  let angle=e.motion?.enemyFacing??e.face??Math.PI/4;
  if(action==='death')angle=e.motion?.enemyDeathAngle??angle;
  else if(action==='telegraph'&&Math.hypot(e.tx-e.x,e.ty-e.y)>.01)angle=Math.atan2(e.ty-e.y,e.tx-e.x);
  else if(action==='attack')angle=e.motion?.enemyAttackAngle??angle;
  const facing=observed.fourDirections?['se','sw','nw','ne'][((Math.round((angle-Math.PI/4)/(Math.PI/2))%4)+4)%4]:directions[((Math.round(angle/(Math.PI/4))%8)+8)%8];
  return {world,entityId:'enemy.'+e.kind,action,facing,elapsed,loop};
 }
 function groundDetails(area,world){
  if(!['reality','murim'].includes(world))return [];
  const out=[],step=world==='murim'?105:170,offset=world==='murim'?64:82;let index=0;
  for(const road of area.roads||[])for(let segment=1;segment<road.length;segment++){
   const [ax,ay]=road[segment-1],[bx,by]=road[segment],length=Math.hypot(bx-ax,by-ay);if(!length)continue;
    const dx=(bx-ax)/length,dy=(by-ay)/length;
    if(world==='reality')for(let distance=100;distance<length-70;distance+=210){
     const x=ax+dx*distance,y=ay+dy*distance;
     if(x<45||y<45||x>area.w-45||y>area.h-45||(area.blocks||[]).some(b=>x>=b.x-45&&x<=b.x+b.w+45&&y>=b.y-45&&y<=b.y+b.h+45))continue;
     out.push({x,y,cell:1,size:90,rotation:Math.atan2(dy,dx)-Math.PI/4});
    }
   for(let distance=step/2;distance<length;distance+=step)for(const side of [-1,1]){
    const n=index++,jitter=((n*37+segment*11)%29)-14,edge=offset+(n*19%21)-10;
    const x=ax+dx*(distance+jitter)-dy*edge*side,y=ay+dy*(distance+jitter)+dx*edge*side;
    if(x<24||y<24||x>area.w-24||y>area.h-24||(area.blocks||[]).some(b=>x>=b.x-24&&x<=b.x+b.w+24&&y>=b.y-24&&y<=b.y+b.h+24))continue;
    out.push({x,y,cell:world==='murim'?(n%11===0?1:n%3===0?3:0):[0,3,2,3][n%4],size:world==='murim'?62+(n*17%39):55+(n*13%27)});
   }
  }
  return out;
 }
 function foregroundDetails(area,world){
  if(!['reality','murim'].includes(world))return [];
  const out=[],candidates=[];
  for(let x=80;x<area.w-50;x+=180){candidates.push([x,80],[x,area.h-65]);}
  for(let y=240;y<area.h-120;y+=190){candidates.push([65,y],[area.w-65,y]);}
  const distanceToSegment=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/length)):0;return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};
  candidates.forEach(([x,y],index)=>{
   if((area.points||[]).some(p=>Math.hypot(x-p.x,y-p.y)<=170)||(area.blocks||[]).some(b=>x>=b.x-60&&x<=b.x+b.w+60&&y>=b.y-40&&y<=b.y+b.h+160))return;
   if((area.roads||[]).some(r=>r.some((p,i)=>i>0&&distanceToSegment(x,y,r[i-1],p)<=130)))return;
   const cell=index%4;out.push({x,y,world,cell,scale:.9+(index*7%4)*.06});
  });return out;
 }
 // Mirror the material at tile edges: this is runtime texture sampling only,
 // not a replacement image or a change to navigation geometry.
 function drawTerrainRepeat(c,image,rect,size){
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){
   c.save();c.translate(col?size*2:0,row?size*2:0);c.scale(col?-1:1,row?-1:1);
   c.drawImage(image,...rect,0,0,size,size);c.restore();
  }
 }
 return {query,placement,drawFrame,npcIdentity,environmentIdentity,blockVisual,portalState,effectQuery,effectRotation,fieldVisual,enemyQuery,groundDetails,foregroundDetails,drawTerrainRepeat};
});
