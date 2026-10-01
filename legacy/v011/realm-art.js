/* v0.8 world-specific art and articulated source sprites. No external assets or simulation writes. */
(function(root){
 'use strict';
 const A=WorldArt,P=Presentation,{ellipse:oval,polygon:poly,line,box,text,TAU,random}=A;
 const previous={human:A.human,prop:A.prop,portal:A.portal,terrain:ClassicArt.terrain};
 const sheet=new Image();sheet.src=WuxiaAssets.sprites;
 const groundCache=new Map(),buildingCache=new Map();let current={world:'무림',theme:'village'},clock=0;
 const modern=()=>current.world==='현실';
 const ink='#18292f',paper='#dfd3b0';
 function gradient(c,x,y,w,h,top,bottom){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);return g;}
 function begin(g){current=DualWorld.AREAS[g.area];clock=g.playTime;}
 function strokeEllipse(c,x,y,rx,ry,col,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.strokeStyle=col;c.lineWidth=width;c.stroke();}
 function paintModern(c,b){
  const {x,y,w,h}=b,harbor=current.theme==='harbor';
  poly(c,[[x+10,y+h],[x+w,y+h],[x+w+52,y+h+33],[x+53,y+h+39]],'#07192666');
  const roofY=y+h*.28;
  box(c,x,y+h*.2,w,h*.8,gradient(c,x,y,w,h,'#8799a1','#344b5a'),1);
  poly(c,[[x+w-22,roofY],[x+w,roofY-13],[x+w,y+h],[x+w-22,y+h+6]],'#233a4b');
  // Flat parapet, rooftop cooling plant and rail: deliberately no ridge or curved eaves.
  poly(c,[[x-6,roofY],[x+7,y-24],[x+w-12,y-24],[x+w+7,roofY]],'#8ea0a8','#c4d5d8',2);
  poly(c,[[x+8,roofY-9],[x+18,y-13],[x+w-22,y-13],[x+w-7,roofY-9]],'#4f6471');
  for(let i=0;i<Math.max(1,Math.floor(w/120));i++){const xx=x+32+i*99;box(c,xx,y,66,24,'#8ca1ac',2);box(c,xx+3,y-8,60,13,'#becacf',1);for(let n=0;n<5;n++)line(c,[[xx+8+n*10,y-5],[xx+8+n*10,y+1]],'#5c7179',2);}
  line(c,[[x+w-38,y],[x+w-38,y-61]],'#b2c4cc',2);line(c,[[x+w-55,y-48],[x+w-22,y-48]],'#95b2c4',2);
  for(let row=0;row<2;row++){const yy=roofY+24+row*35;if(yy+27>y+h-26)continue;for(let xx=x+16;xx<x+w-42;xx+=45){box(c,xx,yy,34,25,'#213c50',1);box(c,xx+2,yy+2,30,20,gradient(c,xx,yy,26,20,'#8ac0d0','#3f677b'));line(c,[[xx+16,yy],[xx+16,yy+24]],'#9eb7c1');line(c,[[xx+3,yy+4],[xx+12,yy+20]],'#d8ece933');}}
  const dx=x+w*.45;box(c,dx,y+h-43,41,43,'#172f3e',1);box(c,dx+4,y+h-37,33,35,'#496f7e',1);line(c,[[dx+20,y+h-36],[dx+20,y+h]],'#bdd6d1',1.3);
  const sign=current.safe?'HUNTER OPERATIONS':harbor?'PORT SECURITY':'OBSERVATION';box(c,x+16,roofY+3,Math.min(w-32,170),18,'#173d4f',2);text(c,sign,x+22,roofY+16,'#a6e8e9',Math.min(10,w/19),'left');
  for(let xx=x+10;xx<x+w-8;xx+=15)line(c,[[xx,y+h+5],[xx+8,y+h+11]],'#d5b367',3);
  for(const side of [x+5,x+w-9]){box(c,side,y+h-52,4,39,'#142a37',0);box(c,side,y+h-53,4,9,'#81d4df',0);}
 }
 function prop(c,b,theme){
  if(!modern()){previous.prop(c,b,theme);return;}
  if(['house','building','temple','templeruin'].includes(b.kind)){
   const key=[b.kind,b.w,b.h,current.theme,current.safe].join(':');if(!buildingCache.has(key)){const cv=document.createElement('canvas');cv.width=b.w+120;cv.height=b.h+160;paintModern(cv.getContext('2d'),{...b,x:24,y:88});buildingCache.set(key,cv);}c.drawImage(buildingCache.get(key),b.x-24,b.y-88);return;
  }
  if(['container','crate'].includes(b.kind)){
   const {x,y,w,h}=b;box(c,x+14,y+h-6,w+18,20,'#14233077',2);box(c,x,y,w,h,gradient(c,x,y,w,h,b.kind==='crate'?'#5d737c':'#487287','#243f50'),2);poly(c,[[x,y],[x+14,y-16],[x+w+14,y-16],[x+w,y]],'#79949e','#b1c0bf',1);poly(c,[[x+w,y],[x+w+14,y-16],[x+w+14,y+h-10],[x+w,y+h]],'#203844');for(let xx=x+9;xx<x+w-4;xx+=14)line(c,[[xx,y+5],[xx,y+h-8]],'#9fb8bd55',2);line(c,[[x+w*.5,y+2],[x+w*.5,y+h-5]],'#192f3c',3);text(c,'GATE / 07',x+w*.5,y+h*.45,'#d6dfd1',Math.min(14,w/9));return;
  }
  if(['ruin','rock','tree'].includes(b.kind)){
   const {x,y,w,h}=b;poly(c,[[x,y+h],[x+14,y+23],[x+w*.4,y],[x+w*.52,y+28],[x+w*.82,y+7],[x+w,y+h]],'#4f6672','#283e4b',2);poly(c,[[x+10,y+h-4],[x+22,y+35],[x+w*.4,y+20],[x+w*.32,y+h]],'#879590');for(let i=0;i<4;i++)line(c,[[x+w*.5+i*15,y+9],[x+w*.5+i*15,y-17]],'#6c868f',3);line(c,[[x+w*.7,y+20],[x+w*.55,y+h*.4],[x+w*.75,y+h*.7]],'#1a3344',3);box(c,x+w*.66,y+h*.52,16,12,'#7dd5db',1);return;
  }
  previous.prop(c,b,theme);
 }
 function terrain(a){
  if(a.world!=='현실')return previous.terrain(a);
  const key=a.name;if(groundCache.has(key))return groundCache.get(key);
  const cv=document.createElement('canvas');cv.width=a.w;cv.height=a.h;const c=cv.getContext('2d'),rnd=random(a.w*31+a.name.length*71);
  c.fillStyle=gradient(c,0,0,a.w,a.h,'#536b78','#263e50');c.fillRect(0,0,a.w,a.h);
  for(let y=0;y<a.h;y+=72)for(let x=0;x<a.w;x+=96){box(c,x+1,y+1,94,70,['#607582','#677d8644','#76899030'][(x/96+y/72)%3],0);line(c,[[x+2,y+70],[x+94,y+70]],'#1a354750');}
  for(let i=0;i<1700;i++){const x=rnd()*a.w,y=rnd()*a.h;box(c,x,y,1+rnd()*7,1,rnd()>.4?'#afc7c31b':'#101e291b',0);}
  for(const road of a.roads){line(c,road,'#9ba99f',150);line(c,road,'#233949',140);line(c,road,'#3d5363',132);c.save();c.setLineDash([20,17]);line(c,road,'#cbb97b88',2);c.restore();}
  if(a.safe){for(let i=0;i<8;i++)box(c,535+i*24,584,12,53,'#dddfc9a8',0);for(const [x,y]of [[1080,560],[1170,850],[1100,320]]){strokeEllipse(c,x,y,91,54,'#81d4dd66',2);for(let i=0;i<6;i++)line(c,[[x-70+i*27,y+63],[x-57+i*27,y+70]],'#d5bf74',4);}}
  if(a.theme==='harbor'){box(c,1386,0,114,a.h,'#183d58',0);for(let yy=10;yy<a.h;yy+=35)line(c,[[1396,yy],[1430,yy+5],[1500,yy-9]],'#92bdcd55',2);line(c,[[1384,0],[1384,a.h]],'#c8c4a2',7);}
  if(!a.safe){for(let i=0;i<18;i++){const x=rnd()*a.w,y=rnd()*a.h;line(c,[[x,y],[x+16,y+29],[x-6,y+60],[x+20,y+79]],'#112736',4);line(c,[[x,y],[x+16,y+29],[x-6,y+60]],'#719abe77',1);}text(c,a.theme==='rift'?'RESTRICTED / GATE INCIDENT':'SECURITY PERIMETER',a.w*.5,a.h-66,'#a4c5cd77',19);}
  const result={terrain:cv,decorations:[]};groundCache.set(key,result);return result;
 }
 function robe(c,e,t,kind,scale){
  if(kind!=='hero'||!sheet.complete){previous.human(c,e,t,kind,scale);return;}
  const p=P.pose(e,clock),f=WuxiaDirection.facing(p.angle),sx=f.cell*80;
  c.save();c.translate(e.x,e.y);c.scale(scale,scale);oval(c,2,4,20,7,'#12252b70');c.translate(0,-p.bob);if(f.flip)c.scale(-1,1);c.rotate(p.lean);if(e.flash>0)c.globalAlpha=.75;
  // Split at the hips; opposite planted legs follow travelled distance, not a looping clock.
  for(const [side,left]of [[-1,0],[1,40]]){c.save();c.translate(side*9,-27);c.rotate(p.foot*.23*side);c.drawImage(sheet,sx+left,92,40,36,left-40-side*9,-1,40,36);c.restore();}
  c.drawImage(sheet,sx+13,0,54,95,-27,-119,54,92);
  if(e.walking){line(c,[[-10,-49],[-19-p.foot*3,-29],[-27-p.foot*6,-20]],'#c4c3bb',3);line(c,[[-8,-48],[-21-p.foot*3,-29]],'#2c3640',2);}
  c.restore();
  weapon(c,e,t,scale);
 }
 function uniform(c,e,t,kind,scale){
  const p=P.pose(e,clock),hero=kind==='hero',f=WuxiaDirection.facing(p.angle),cell=hero?f.cell:kind==='warden'||kind==='shop'?8:9;
  c.save();c.translate(e.x,e.y);c.scale(scale,scale);oval(c,3,4,19,7,'#081a2966');c.translate(0,-p.bob);c.rotate(p.lean);
  const back=Math.sin(p.angle)<-.45;const coat=kind==='warden'?'#354d61':kind==='shop'?'#5a6872':hero?'#405463':'#2a3f50';
  for(const side of [-1,1]){const xx=side*8,k=p.foot*side;c.save();c.translate(xx,-28);c.rotate(k*.21);line(c,[[0,0],[side*2,15],[side*2,30]],'#182c3e',10);line(c,[[0,0],[side*2,15]],'#657583',2);box(c,side*2-6,27,14,8,'#122535',2);line(c,[[side*2-5,33],[side*2+8,33]],'#8c9a9d',1);c.restore();}
  poly(c,[[-15,-82],[12,-83],[22,-33],[-20,-33]],gradient(c,-20,-83,42,50,'#697f8d',coat),'#1a2d3b',1.5);
  if(back){poly(c,[[-12,-78],[12,-78],[14,-48],[-13,-48]],'#344956');line(c,[[-12,-77],[12,-48]],'#a4a68b',2);line(c,[[-12,-47],[12,-76]],'#122835',4);}else{poly(c,[[-13,-79],[-3,-68],[7,-80],[12,-50],[-9,-50]],'#1b303f');line(c,[[0,-68],[1,-32]],'#80939c',1.5);}
  for(const side of [-1,1]){line(c,[[side*13,-77],[side*22,-60+side*p.foot*3],[side*17,-43+side*p.foot*5]],coat,10);line(c,[[side*15,-72],[side*21,-60]],'#92a1a677',2);oval(c,side*17,-41+side*p.foot*5,4,5,'#c8b49a');}
  line(c,[[-11,-72],[-8,-49]],'#c1ced04a',2);line(c,[[12,-70],[14,-45]],'#0c223966',2);box(c,-12,-60,9,9,'#3b5360',1);line(c,[[-12,-58],[-3,-58]],'#9fbbc1',1);box(c,-19,-40,39,8,'#172b38',1);box(c,-4,-40,8,6,'#a9b9bc',1);if(!back){box(c,7,-64,8,13,'#abc9ca',1);box(c,9,-61,4,4,'#6e9ead',0);}
  line(c,[[-12,-77],[-13,-58]],'#0d263a',4);oval(c,-12,-78,3,3,'#75deed');
  if(kind==='shop'){box(c,14,-55,20,24,'#203747',2);box(c,17,-52,14,17,'#87c7d5',1);}
  if(sheet.complete&&sheet.naturalWidth){c.save();if(hero&&f.flip)c.scale(-1,1);c.drawImage(sheet,cell*80+20,12,40,34,-20,-110,40,34);c.restore();}
  else oval(c,0,-94,12,16,'#bfae9a');
  c.restore();if(hero)weapon(c,e,t,scale);
 }
 function weapon(c,e,t,scale){
  const p=P.pose(e,clock);if(!p.active){if(!modern())return;line(c,[[e.x-20*scale,e.y-62*scale],[e.x-29*scale,e.y-10*scale]],'#142a36',5);line(c,[[e.x-21*scale,e.y-62*scale],[e.x-27*scale,e.y-18*scale]],'#abbebc',1);return;}
  c.save();c.translate(e.x,e.y);c.scale(scale,scale);
  const hand={x:p.hand.x-e.x,y:p.hand.y-e.y},s={x:p.shoulder.x-e.x,y:p.shoulder.y-e.y};
  line(c,[[s.x,s.y],[hand.x*.65,(hand.y+s.y)*.5],[hand.x,hand.y]],modern()?'#718593':'#ded6be',9);line(c,[[s.x,s.y],[hand.x,hand.y]],'#263b3d',1);oval(c,hand.x,hand.y,4,4,'#d7bd9c');
  c.translate(hand.x,hand.y);c.scale(1,.72);c.rotate(p.bladeAngle);
  if(p.magic){box(c,-3,-17,12,30,'#dfd5ae',1);text(c,'界',3,4,'#265d60',12);strokeEllipse(c,4,-2,25,25,'#82e5d8',1.5);}
  else {line(c,[[-8,0],[1,0]],'#8c6842',5);line(c,[[1,-7],[1,7]],'#ddc18b',3);poly(c,[[2,-2],[46,-2],[57,0],[46,2],[2,2]],'#e7eef0','#b9d3d8',1);line(c,[[3,0],[48,0]],'#60798c',1);}
  c.restore();
 }
 function threat(c,e,t,kind,scale){
  c.save();c.translate(e.x,e.y);c.scale(scale,scale);oval(c,5,4,23,8,'#051b3177');const gait=e.walking?Math.sin((e.motion?.stride||0)/8):0;
  if(kind==='drone'||e.boss){
   for(const side of [-1,1])for(const back of [-1,1]){const xx=side*(25+back*2),yy=-20+back*13;line(c,[[side*14,-49],[xx,yy-10],[side*35,yy+13+gait*back*2]],'#1d3449',6);line(c,[[side*14,-51],[xx,yy-12],[side*35,yy+10+gait*back*2]],'#8aaab5',3);oval(c,xx,yy-10,4,4,'#466c87');}
   poly(c,[[-27,-56],[-11,-79],[18,-76],[32,-54],[17,-27],[-16,-29]],gradient(c,-28,-79,60,55,'#96afbd','#294b6a'),'#142f46',2);poly(c,[[-15,-64],[15,-64],[22,-51],[12,-41],[-14,-42],[-21,-51]],'#172b47','#bacad0',1);oval(c,0,-52,9,8,e.flash>0?'#f9eee1':'#de9cac');oval(c,0,-52,4,4,'#fff2da');
   if(e.boss){poly(c,[[-12,-75],[-20,-110],[-3,-87],[11,-112],[19,-74]],'#56728a','#a6c2cb',1.5);strokeEllipse(c,0,-51,35,24,'#c9a6d17c',2);}
  }else{
   const bob=Math.sin(t*2+e.x)*3;for(let i=0;i<7;i++){const a=i*TAU/7,r=27+Math.sin(t+i)*3;poly(c,[[Math.cos(a)*12,-47+bob+Math.sin(a)*15],[Math.cos(a)*r,-47+bob+Math.sin(a)*40],[Math.cos(a+.7)*17,-47+bob+Math.sin(a+.7)*22]],i%2?'#365b75':'#668798','#132d44',1);}
   oval(c,0,-45+bob,12,21,'#213c58');oval(c,0,-49+bob,6,13,e.flash>0?'#fff3d0':'#9ed1e0');line(c,[[-14,-9],[-9,-24],[5,-30],[13,-18]],'#91b8d18c',2);
  }c.restore();
 }
 function human(c,e,t,kind='hero',scale=1){
  if(modern()){if(['hero','warden','hunter','shop','master','yeonhwa'].includes(kind))uniform(c,e,t,kind,scale);else threat(c,e,t,kind,scale);return;}
  if(kind==='hero')robe(c,e,t,kind,scale);else previous.human(c,e,t,kind,scale);
 }
 function portal(c,o,t,theme,locked){
  const cross=o.kind==='portal',col=locked?'#78838a':modern()?'#80d9f5':'#d8c191',r=cross?43:27,h=cross?91:57;
  c.save();c.translate(o.x,o.y);oval(c,0,3,r+20,18,'#122b3866');strokeEllipse(c,0,1,r+20,18,col+'88',2);strokeEllipse(c,0,1,r+9,13,col+'66');
  if(cross){
   if(modern()){
    for(const side of [-1,1]){poly(c,[[side*48,7],[side*55,-82],[side*40,-110],[side*33,-101],[side*40,-79],[side*34,4]],'#4f738a','#b2d8df',2);line(c,[[side*45,-73],[side*44,-37]],col,3);box(c,side*46-4,3,10,12,'#1a3446',1);}line(c,[[-41,-100],[40,-100]],'#aac8d5',4);
   }else {for(const side of [-1,1]){poly(c,[[side*44,6],[side*48,-100],[side*33,-106],[side*32,4]],'#687168','#c8c4a6',2);box(c,side*40-5,-78,10,24,'#d3bc81',1);text(c,'界',side*40,-60,'#34483f',12);}line(c,[[-48,-105],[0,-119],[48,-105]],'#adb397',7);}
  }
  const glow=c.createRadialGradient(0,-h*.5,5,0,-h*.5,h);glow.addColorStop(0,col+'66');glow.addColorStop(1,col+'00');c.fillStyle=glow;c.fillRect(-h,-h*1.5,h*2,h*2);
  c.save();c.beginPath();c.ellipse(0,-h*.5,r,h*.57,0,0,TAU);c.clip();c.fillStyle=gradient(c,-r,-h,r*2,h,'#071b34',cross?modern()?'#738779':'#315c85':'#465e73');c.fillRect(-r,-h*1.2,r*2,h*1.5);
  if(cross){if(modern()){poly(c,[[-r,0],[-r,-28],[-19,-60],[3,-31],[22,-73],[r,-32],[r,0]],'#9cb3a277');line(c,[[-20,-14],[0,-30],[22,-15]],'#d1cbad',3);}else for(let i=0;i<5;i++){box(c,-r+i*18,-34-i%3*13,14,59,'#294b68',0);for(let y=-29-i%3*13;y<-3;y+=11)box(c,-r+4+i*18,y,5,3,'#bdded99c',0);}}
  for(let i=0;i<5;i++)line(c,[[-r,-h+i*19+(t*15)%19],[r,-h+i*19+6+(t*15)%19]],col+'44',1);c.restore();strokeEllipse(c,0,-h*.5,r,h*.57,col,2.5);
  const destination=cross?(modern()?'무림 · 청운촌':'현실 · 헌터 기지'):(o.to?DualWorld.AREAS[o.to]?.name:o.label)||'거점 귀환';
  if(cross||locked){box(c,-74,22,148,24,'#112736e8',3);text(c,locked?'아직 열리지 않은 경계':destination,0,38,locked?'#b6b7aa':'#ede3bb',11);}
  if(!locked)for(let i=0;i<9;i++){const a=i*2.399+t*.5,yy=-((t*23+i*19)%(h+30));oval(c,Math.cos(a)*(r+6),yy,1.4,2,col);}
  c.restore();
 }
 function effect(c,f,q,g){
  if(f.kind==='legend-echo'){c.save();c.globalAlpha=Math.max(0,f.life/f.max)*.5;for(let i=0;i<(q?3:1);i++)human(c,{x:f.x+i*27,y:f.y-i*10,face:f.angle||0},clock,'hero',1.15);c.restore();return true;}
  if(!['slash','fate-wave'].includes(f.kind)||!f.actorBound)return false;
  const k=Math.max(0,f.life/f.max),col=f.kind==='fate-wave'?'#f5d99b':f.skill==='moon'?'#bfe7ed':'#f5edcd';
  const p=P.effectPose(f,g.playTime);if(!p)return false;
  const x=f.x+(p.hand.x-f.x)*1.15,y=f.y+(p.hand.y-f.y)*1.15;
  c.save();c.translate(x,y);c.scale(1,.72);c.rotate(f.motionAngle);c.globalAlpha=k;
  const grow=f.skill==='moon'||f.kind==='fate-wave';const r=grow?50+(f.range-50)*(1-k):52,sign=f.motionCombo===2?-1:1,a=p.bladeAngle-p.angle;
  c.beginPath();c.arc(0,0,r,a-sign*.85,a,sign<0);c.strokeStyle=col;c.lineWidth=grow?6:3;c.stroke();if(q>0){c.globalAlpha=k*.22;c.lineWidth=14;c.stroke();}
  c.globalAlpha=k*.75;line(c,[[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(a)*r*.57,Math.sin(a)*r*.57]],'#fff8e8',2);c.restore();return true;
 }
 function portrait(canvas,kind){const visual=modern()&&['shop','yeonhwa','master'].includes(kind)?(kind==='shop'?'hunter':'warden'):kind;WuxiaArt.portrait(canvas,visual);canvas.dataset.portrait=kind;canvas.dataset.world=current.world;}
 A.human=human;A.prop=prop;A.portal=portal;A.portrait=portrait;ClassicArt.terrain=terrain;
 root.RealmArt={begin,human,prop,portal,portrait,terrain,effect,pose:e=>P.pose(e,clock),worldStyle:P.worldStyle,ready:()=>sheet.complete&&sheet.naturalWidth>0};
 root.addEventListener('wuxia-assets-ready',()=>{groundCache.clear();buildingCache.clear();});
})(globalThis);
