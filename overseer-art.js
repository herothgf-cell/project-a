/* Original canvas artwork: one recognizable human in both worlds. No simulation writes. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.OverseerArt=api;})(globalThis,function(){
 'use strict';
 const TAU=Math.PI*2;
 const matches=(e,kind)=>kind==='overseer'||kind==='human-overseer'||e?.cycleBoss===true||e?.kind==='human-overseer';
 function poly(c,points,fill,stroke){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 function line(c,points,color,width=1){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
 function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();}
 function face(c){
  poly(c,[[-10,-83],[-6,-94],[8,-94],[13,-82],[10,-70],[2,-66],[-6,-70]],'#c7a987','#3b3334');
  poly(c,[[-11,-84],[-12,-92],[-6,-100],[6,-102],[14,-95],[14,-82],[9,-89],[4,-91],[-2,-84]],'#161a22','#55545c');
  line(c,[[-7,-82],[-2,-83]],'#352c30',1.5);line(c,[[5,-83],[10,-82]],'#352c30',1.5);
  line(c,[[2,-82],[1,-76],[4,-75]],'#8a6c5e');line(c,[[-1,-71],[6,-72]],'#583f3b');
  line(c,[[8,-87],[5,-77]],'#dcc5ac',.8); // recognizable pale eyebrow scar
 }
 function body(c,{phase=1,modern=false,wind=0,t=0,faceAngle=0,portrait=false}={}){
  const glow=phase===3?'#f39267':phase===2?'#83ded7':'#d6b579',lean=wind>0?3:Math.sin(t*1.5)*.6;
  c.save();c.translate(lean,0);if(!portrait){
   oval(c,0,0,33,12,'#020a1366');
   poly(c,[[-14,-30],[-2,-28],[-6,-2],[-18,-2]],'#1b2029','#616271');poly(c,[[3,-28],[16,-29],[22,-1],[10,-1]],'#161c25','#535b69');
   poly(c,[[-18,-6],[-6,-5],[-3,1],[-23,2]],'#11151d');poly(c,[[10,-5],[22,-4],[28,2],[10,2]],'#11151d');
  }
  // Split coat, belted human torso and articulated arms keep the silhouette anatomical.
  poly(c,[[-13,-68],[-24,-59],[-20,-34],[-26,-12],[-6,-17],[0,-37],[7,-17],[27,-10],[21,-37],[24,-60],[11,-68]],'#151c27','#75808b');
  poly(c,[[-12,-66],[-4,-53],[1,-62],[8,-52],[14,-66],[6,-73],[-5,-73]],'#34323b','#b59d7b');
  poly(c,[[-16,-53],[-4,-43],[-12,-22],[-23,-16]],'#293342');poly(c,[[13,-56],[20,-45],[25,-17],[10,-23]],'#202a38');
  line(c,[[-16,-65],[-9,-52],[-6,-19]],'#b49563',1.2);line(c,[[15,-65],[8,-51],[11,-21]],'#b49563',1.2);
  poly(c,[[-20,-40],[20,-40],[19,-34],[-20,-34]],'#695444','#b29363');poly(c,[[-3,-40],[5,-40],[5,-34],[-3,-34]],'#bdab81');
  poly(c,[[-20,-61],[-28,-57],[-33,-37],[-24,-30],[-17,-43]],'#28313c','#76808a');
  const reach=wind>0?12:0;
  poly(c,[[20,-61],[29,-54],[31+reach,-35],[23+reach,-29],[17,-45]],'#202a37','#74808b');
  oval(c,26+reach,-29,5,6,'#c5a17c');oval(c,-29,-30,5,6,'#c5a17c');
  // Opening device and three charge pips repeat in portrait, sightings and boss sprite.
  poly(c,[[-35,-40],[-24,-40],[-22,-31],[-34,-30]],'#485263',glow);
  c.shadowColor=glow;c.shadowBlur=phase===2?13:5;oval(c,-28,-35,3,3,glow);c.shadowBlur=0;
  for(let i=0;i<3;i++)oval(c,-33+i*4,-41,1.1,1.1,phase===3?'#4b535c':glow);
  if(modern){ // same person, compact firearm instead of a murim blade
   poly(c,[[25+reach,-35],[47+reach,-37],[49+reach,-30],[34+reach,-27],[33+reach,-20],[28+reach,-20]],'#4d5969','#a5b0ba');
   line(c,[[35+reach,-35],[45+reach,-35]],glow,2);
  }else{
   c.save();c.translate(28+reach,-31);c.rotate(wind>0?-.65:-.15);
   poly(c,[[-2,4],[-3,-8],[-2,-61],[1,-70],[5,-60],[3,-8],[2,4]],'#a5b7bc','#ecede0');
   line(c,[[1,-11],[1,-61]],'#e1d9b8');line(c,[[-8,-6],[9,-6]],'#c2a467',3);line(c,[[0,-3],[0,9]],'#5a4540',4);c.restore();
  }
  face(c);
  if(phase===2){c.strokeStyle=glow;c.lineWidth=1.5;c.beginPath();c.arc(-28,-35,12,t,t+Math.PI*1.6);c.stroke();}
  if(phase===3){line(c,[[-22,-58],[-31,-48],[-24,-39]],'#df916e',1.5);poly(c,[[18,-25],[30,-18],[21,-8],[15,-19]],'#101720','#d9a178');}
  c.restore();
 }
 function human(c,e,t,kind='human-overseer',scale=1,world='무림'){
  if(!matches(e,kind))return false;
  c.save();c.translate(e.x,e.y);c.scale(scale*.78,scale*.78);if(Math.cos(e.face||0)<-.25)c.scale(-1,1);
  body(c,{phase:e.cyclePhase||1,modern:world==='현실'||world==='reality',wind:e.wind||0,t});c.restore();return true;
 }
 function portrait(canvas,kind,world='무림'){
  if(!matches(null,kind))return false;const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,size=Math.min(w,h);
  c.clearRect(0,0,w,h);const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#303849');gradient.addColorStop(1,'#0a131e');c.fillStyle=gradient;c.fillRect(0,0,w,h);
  c.save();c.translate(w*.48,h*1.18);c.scale(size/100,size/100);body(c,{modern:world==='현실'||world==='reality',portrait:true});c.restore();
  c.strokeStyle='#b79c6c';c.lineWidth=Math.max(1,size/100);c.strokeRect(2,2,w-4,h-4);
  canvas.dataset.portrait='overseer';canvas.dataset.world=world;canvas.dataset.productionPortrait='code.overseer.portrait';canvas.dataset.artStatus='original-human';return true;
 }
 return {matches,human,portrait};
});
