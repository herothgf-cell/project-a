/* Interactive evidence and readable technique VFX on the live game canvas. */
(function(root){
 'use strict';const A=WorldArt,{ellipse,line,polygon,box,text,TAU}=A,D=JourneyData;
 const color=p=>DualWorld.Fate.PATHS[p]?.color||'#9ed8e1';
 function ground(c,g,quality,t){const r=g.experimentRuntime;if(!r)return;
  if(g.area==='archive'){
   // Tangible silhouettes exist before labels appear. Sensing reveals meaning, not the whole object.
   for(const o of g.points().filter(o=>o.kind==='discovery')){ellipse(c,o.x,o.y,65,23,'#333d3245');ellipse(c,o.x,o.y-2,49,16,'#7c8b7750');if(!g.journey.facts.some(f=>f.id==='sense-'+o.path))prop(c,o,t,false);}
   const q=r.pulse;if(q&&q.wind>0){const k=Math.max(0,Math.min(1,1-q.wind/q.max));c.save();c.strokeStyle=color(q.path);c.fillStyle=color(q.path)+'25';c.lineWidth=2;c.beginPath();c.ellipse(q.x,q.y,120,72,0,0,TAU);c.fill();c.stroke();c.setLineDash([8,7]);c.beginPath();c.ellipse(q.x,q.y,Math.max(1,120*(1-k)),Math.max(1,72*(1-k)),0,0,TAU);c.stroke();c.setLineDash([]);text(c,q.path==='echo'?'발자국을 당기는 울림':q.path==='seal'?'금 사이로 모이는 파동':'되돌아오는 검풍',q.x,q.y+105,color(q.path),13);c.restore();}
   if(r.echo){c.save();c.globalAlpha=.6;WorldArt.human(c,{...r.echo,face:r.echo.face??Math.PI/2,walking:false,presentationTime:r.echo.at??0},0,'hero',.9);c.restore();line(c,[[r.echo.x-14,r.echo.y+4],[r.echo.x+15,r.echo.y+4]],'#e0c6ff',2);}
  }
  if(r.guard)root.JourneyArt.guard(c,r.guard,quality,t);
  if(r.sense>0){c.save();c.strokeStyle='#b3e7d6';c.lineWidth=1.5;c.setLineDash([12,9]);c.beginPath();c.ellipse(g.player.x,g.player.y,g.senseRange(),g.senseRange()*.65,0,0,TAU);c.stroke();c.setLineDash([]);for(const o of g.points().filter(o=>o.kind==='discovery'))if(DualWorld.dist(g.player,o)<=g.senseRange())ring(c,o.x,o.y,60,color(o.path),t);c.restore();}
 }
 function guard(c,z,quality,t){ellipse(c,z.x,z.y,z.radius,z.radius*.55,'#ebdba522');ring(c,z.x,z.y,z.radius,'#f7dc99',t);}
 function ring(c,x,y,r,col,t){c.save();c.strokeStyle=col;c.lineWidth=1.7;c.beginPath();c.ellipse(x,y,r,r*.55,0,0,TAU);c.stroke();for(let i=0;i<6;i++){const a=i*TAU/6+t*.2;polygon(c,[[x+Math.cos(a)*r,y+Math.sin(a)*r*.55-4],[x+Math.cos(a)*r+3,y+Math.sin(a)*r*.55],[x+Math.cos(a)*r,y+Math.sin(a)*r*.55+4],[x+Math.cos(a)*r-3,y+Math.sin(a)*r*.55]],col);}c.restore();}
 function prop(c,o,t,known=true){c.save();c.translate(o.x,o.y);ellipse(c,2,5,29,10,'#162c3966');
  if(o.path==='echo'){polygon(c,[[-25,-20],[-16,-50],[27,-43],[20,-15]],'#dbcda9');line(c,[[-18,-23],[-11,-44],[20,-39]],'#8f8868',2);for(let i=0;i<4;i++)line(c,[[-9+i*6,-36],[12+i*2,-31]],'#4b5551',1);}
  else if(o.path==='ripple'&&o.kind==='discovery'){polygon(c,[[-8,-63],[2,-77],[8,-62],[1,-18],[-5,-19]],'#cad5cc');line(c,[[-17,-22],[13,-19]],'#d7b67c',5);line(c,[[-2,-19],[-5,0]],'#503c32',7);}
  else {polygon(c,[[-26,0],[-22,-42],[7,-57],[27,-36],[28,0]],o.path==='station'?'#4b737f':'#919b86');line(c,[[-16,-39],[1,-47],[3,-29],[-3,-19],[12,-8]],known?color(o.path):'#aab39e',2);line(c,[[-26,1],[26,1]],'#495e55',3);}
  if(o.kind==='experiment')line(c,[[-42,12],[0,4],[41,19]],'#9cacb4',4);
  if(known)text(c,o.path==='station'?'觀':o.path==='echo'?'墨':o.path==='ripple'?'波':'界',0,-25,color(o.path),14);c.restore();}
 function actor(c,g,t){const p=g.experimentRuntime?.companion;if(!p)return;A.human(c,p,t,'hunter',1);text(c,p.down>0?'도겸 · 호흡을 고르는 중':'도겸 · 동행',p.x,p.y-109,'#d8edf0',11);box(c,p.x-26,p.y-98,52,4,'#183548',1);box(c,p.x-26,p.y-98,52*p.hp/100,4,'#9ad8bd',1);}
 function effect(c,f,quality){if(!f.kind.startsWith('interpret-')&&!['qi-sense','discovery-mark','discovery-wave','partner-shot','reality-settled'].includes(f.kind))return;
  const k=Math.max(0,Math.min(1,f.life/(f.max||1))),age=1-k,r=Math.max(1,(f.range||175)*(0.35+age*.65));c.save();c.globalAlpha=k;c.lineWidth=2;c.strokeStyle=color(f.path);
  if(f.kind==='partner-shot'){line(c,[[f.x,f.y],[f.tx,f.ty]],'#b5e6fc',2);ellipse(c,f.tx,f.ty,6,6,'#e3f6ef');}
  else if(f.kind==='qi-sense'){ring(c,f.x,f.y,r,'#b6f0dd',age*2);if(quality>0)ring(c,f.x,f.y,r*.8,'#daf2e466',-age);}
  else if(f.kind.includes('replay')){for(let i=0;i<(quality?3:1);i++){const a=i*.8-1;c.beginPath();c.ellipse(f.x+Math.cos(a)*50,f.y-45,r*.6,r*.2,a,0,Math.PI*1.6);c.stroke();}}
  else if(f.kind.includes('guide')){for(let i=0;i<3;i++)line(c,[[f.x-60,f.y+i*9],[f.x,f.y-35+i*8],[f.x+110+age*70,f.y-15+i*7]],'#94e8dc',3-i*.6);}
  else if(f.kind.includes('ripple-return')){c.lineWidth=5;c.beginPath();c.ellipse(f.x,f.y-30,r,r*.5,-.35,-1.1,1.7);c.stroke();}
  else {ring(c,f.x,f.y,r,color(f.path),age);if(quality>0)ring(c,f.x,f.y,r*.74,color(f.path)+'88',-age);}
  c.restore();
 }
 root.JourneyArt={ground,guard,prop,actor,effect};
})(globalThis);
