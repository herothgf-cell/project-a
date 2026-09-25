/* Read-only renderer with deterministic cached terrain and Y-sorted sprites. */
(function(root){
  'use strict';
  const {AREAS,clamp,dist}=DualWorld,{TAU,polygon,ellipse,line,box,text,random,bamboo,prop,human,portal,seal}=WorldArt;
  const palettes={city:['#395765','#284653'],village:['#67836b','#486b58'],forest:['#53755d','#305746'],rift:['#43596d','#293e52'],ruins:['#637865','#3e6050'],harbor:['#466776','#293f54']};
  class WorldRenderer{
    constructor(canvas,mini){this.canvas=canvas;this.c=canvas.getContext('2d');this.mini=mini;this.cache={};this.camera={x:0,y:0};this.area=null;this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.resize();}
    resize(){const r=this.canvas.getBoundingClientRect();this.w=Math.max(1,r.width);this.h=Math.max(1,r.height);this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.zoom=this.w<600?.9:1;}
    scenery(id){
      if(this.cache[id])return this.cache[id];const a=AREAS[id],p=palettes[id],can=document.createElement('canvas');can.width=a.w;can.height=a.h;const c=can.getContext('2d'),rng=random(id.charCodeAt(0)*289+17),outdoor=['village','forest','ruins'].includes(id);
      const grad=c.createLinearGradient(0,0,a.w,a.h);grad.addColorStop(0,p[1]);grad.addColorStop(.65,p[0]);grad.addColorStop(1,p[1]);c.fillStyle=grad;c.fillRect(0,0,a.w,a.h);
      for(let i=0;i<2000;i++){c.fillStyle=i%2?'#d9e4bb06':'#122f320a';c.fillRect(rng()*a.w,rng()*a.h,5+rng()*25,1+rng()*8);}
      c.lineCap='round';c.lineJoin='round';for(const road of a.roads){line(c,road,outdoor?'#c5c09929':'#c4d2bd16',154);line(c,road,outdoor?'#919677':'#566c76',132);line(c,road,outdoor?'#a4a384':'#536873',112);}
      if(outdoor){
        for(let i=0;i<430;i++){const x=rng()*a.w,y=rng()*a.h;line(c,[[x-3,y+3],[x,y-5],[x+2,y+4],[x+6,y]],i%3?'#adc29245':'#466e5544',1);}
        if(id==='village')for(let i=0;i<9;i++)box(c,575,385+i*30,51,20,'#c6c3a6a6',3);
        if(id==='ruins')for(let i=0;i<65;i++){const x=rng()*a.w,y=rng()*a.h;box(c,x,y,30+rng()*18,15,'#acb69b4d',1);line(c,[[x+5,y+2],[x+16,y+13]],'#324e4633');}
      }else{
        for(let x=0;x<a.w;x+=64)line(c,[[x,0],[x,a.h]],'#b1c3c116',1);for(let y=0;y<a.h;y+=64)line(c,[[0,y],[a.w,y]],'#b1c3c116',1);
        if(id==='city'){for(let i=0;i<9;i++)box(c,537+i*24,594,11,56,'#d7d4b58c',0);line(c,[[45,560],[380,560]],'#e4c4857a',3);line(c,[[815,658],[1280,658]],'#e4c4857a',3);}
        if(id==='rift')for(let i=0;i<45;i++){const x=rng()*a.w,y=rng()*a.h;line(c,[[x,y],[x+13,y+20],[x-6,y+44],[x+16,y+70]],'#a1c3c132',2);}
        if(id==='harbor'){
          c.fillStyle='#173b50';c.fillRect(1385,0,115,a.h);line(c,[[1380,0],[1380,a.h]],'#afb9a1',7);for(let y=0;y<a.h;y+=47){line(c,[[1404,y],[1470,y]],'#63949b55',2);line(c,[[1430,y+17],[1500,y+17]],'#9ab6ad44');box(c,1342,y,19,8,'#d5bd809c',1);}for(let i=0;i<6;i++)line(c,[[235+i*13,940],[265+i*13,970]],'#d0b87270',4);
        }
        for(let i=0;i<24;i++){const x=rng()*a.w,y=rng()*a.h;ellipse(c,x,y,25+rng()*28,7+rng()*6,'#18364660');line(c,[[x-11,y],[x+16,y]],'#a8c4c238');}
      }
      const decorations=[];
      if(outdoor){for(let i=0;i<55;i++){const x=rng()*a.w,y=rng()*a.h;if(x>290&&x<a.w-120&&y>110&&y<a.h-95)continue;decorations.push({x,y,scale:.8+rng()*.4});}}
      const result={terrain:can,decorations};this.cache[id]=result;return result;
    }
    draw(g,dt=.016){
      const c=this.c,a=AREAS[g.area],p=g.player,zoom=this.zoom,vw=this.w/zoom,vh=this.h/zoom,t=this.reduced?0:g.playTime;
      const tx=clamp(p.x-vw*.5,-vw*.25,a.w-vw*.75),ty=clamp(p.y-vh*.52,-vh*.3,a.h-vh*.65);
      if(this.area!==g.area){this.area=g.area;this.camera={x:tx,y:ty};}else{const lerp=1-Math.exp(-Math.max(dt,.016)*12);this.camera.x+=(tx-this.camera.x)*lerp;this.camera.y+=(ty-this.camera.y)*lerp;}
      c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);c.fillStyle=palettes[g.area][1];c.fillRect(0,0,this.w,this.h);c.save();
      const shake=this.reduced?0:g.shake*15;c.translate(Math.sin(g.playTime*137)*shake,Math.cos(g.playTime*149)*shake);c.scale(zoom,zoom);c.translate(-this.camera.x,-this.camera.y);
      const scene=this.scenery(g.area);c.drawImage(scene.terrain,0,0);
      for(const e of g.enemies){if(e.hp<=0||e.wind<=0)continue;const k=1-e.wind/e.windMax;c.fillStyle='#ec9d7930';c.strokeStyle=e.pattern==='dive'?'#d7a8df':'#edaa8e';c.lineWidth=2;c.beginPath();c.arc(e.tx,e.ty,e.range,0,TAU);c.fill();c.stroke();c.fillStyle='#ffca9437';c.beginPath();c.moveTo(e.tx,e.ty);c.arc(e.tx,e.ty,e.range,-Math.PI/2,-Math.PI/2+k*TAU);c.closePath();c.fill();text(c,e.pattern==='sweep'?'광역 베기':e.pattern==='dive'?'도약 공격':'공격 예고',e.tx,e.ty+5,'#f8d5b8',10);}
      const target=g.target(),objects=[];
      for(const b of a.blocks)objects.push({y:b.y+b.h,draw:()=>prop(c,b,a.theme)});
      for(const b of scene.decorations)objects.push({y:b.y,draw:()=>bamboo(c,b.x,b.y,b.scale,t)});
      for(const o of a.points)objects.push({y:o.y,draw:()=>{
        const selected=target?.id===o.id,near=dist(o,p)<230;
        if(['portal','gate','exit'].includes(o.kind))portal(c,o,t,a.theme,o.need>g.progress);
        else if(o.kind==='seal')seal(c,o,t,g.activated.includes(o.id),g.area==='harbor');
        else if(o.kind==='rest'){ellipse(c,o.x,o.y+2,36,13,'#102e324a');box(c,o.x-28,o.y-13,56,12,'#acac87',2);line(c,[[o.x-20,o.y],[o.x-20,o.y+9]],'#556e59',4);line(c,[[o.x+20,o.y],[o.x+20,o.y+9]],'#556e59',4);}
        else human(c,{...o,face:Math.atan2(p.y-o.y,p.x-o.x)},t,o.id==='warden'?'warden':o.id==='master'?'master':'shop');
        if(selected)this.marker(c,o,t);
        if(near||selected){const w=Math.max(80,o.label.length*10+16);box(c,o.x-w/2,o.y-88,w,22,'#132a32d9',4);text(c,o.label,o.x,o.y-73,selected?'#e7d397':'#c4d1bf',10);}
      }});
      for(const e of g.enemies){if(e.hp<=0)continue;objects.push({y:e.y,draw:()=>{
        const scale=e.boss?1.55:1;human(c,{...e,face:Math.atan2(p.y-e.y,p.x-e.x),walking:e.wind<=0&&dist(e,p)<570&&(!e.boss||!g.bossLocked())},t,e.kind,scale);
        if(e.boss&&g.bossLocked()){c.strokeStyle='#b9d3c37a';c.lineWidth=2;c.setLineDash([8,7]);c.beginPath();c.ellipse(e.x,e.y-41,48,70,0,0,TAU);c.stroke();c.setLineDash([]);text(c,'보호막',e.x,e.y-118,'#c7d8c5',11);}
        if(!e.boss&&(e.hp<e.maxHp||dist(e,p)<180)){box(c,e.x-22,e.y-75,44,4,'#15313ae5',1);box(c,e.x-22,e.y-75,44*e.hp/e.maxHp,4,'#d8aa87',1);}
        if(target?.id===e.id)this.marker(c,e,t);
      }});}
      objects.push({y:p.y,draw:()=>{if(p.invuln>0&&p.dash>0)ellipse(c,p.x,p.y,28,12,'#c5deba66');human(c,p,t,'hero');text(c,'윤서',p.x,p.y-76,'#e4dfb1',10);}});
      objects.sort((a,b)=>a.y-b.y);for(const o of objects)if(o.y>this.camera.y-150&&o.y<this.camera.y+vh+240)o.draw();
      for(const f of g.fx)this.effect(c,f);
      if(!this.reduced){const rng=random(842);for(let i=0;i<24;i++){const x=(rng()*a.w+t*(i%2?3:-2)+a.w)%a.w,y=(rng()*a.h+t*.7)%a.h;ellipse(c,x,y,1.2,1.2,'#eee4b54d');}}
      c.restore();this.edgeMarker(g);this.drawMini(g,this.mini);
    }
    marker(c,o,t){c.strokeStyle='#e4d091bd';c.lineWidth=1;c.setLineDash([4,7]);c.beginPath();c.ellipse(o.x,o.y+5,31,14,0,0,TAU);c.stroke();c.setLineDash([]);const y=o.y-105+Math.sin(t*3)*3;polygon(c,[[o.x,y-5],[o.x+4,y],[o.x,y+5],[o.x-4,y]],'#e9d090');}
    effect(c,f){
      const k=clamp(f.life/f.max,0,1);c.save();c.globalAlpha=k;
      if(f.kind==='text')text(c,f.text,f.x,f.y-(1-k)*32,f.color||'#fff5d5',String(f.text).length<5?21:11);
      if(f.kind==='slash'){c.translate(f.x,f.y-16);c.rotate(f.angle);c.strokeStyle=f.skill==='moon'?'#e7eab4':f.combo===3?'#f2d495':'#dae9db';c.lineWidth=f.skill==='moon'?8:f.combo===3?6:4;c.beginPath();c.arc(0,0,f.range*(1-k*.25),-1.2,1.1);c.stroke();c.globalAlpha=k*.22;c.lineWidth=18;c.stroke();}
      if(f.kind==='storm'){const r=f.range*(1-k*.65);c.strokeStyle='#d8e5d5';c.lineWidth=3;c.beginPath();c.ellipse(f.x,f.y,r,r*.7,0,0,TAU);c.stroke();for(let i=0;i<7;i++){const a=i*TAU/7,x=f.x+Math.cos(a)*r*.72,y=f.y+Math.sin(a)*r*.53;line(c,[[x,y-99],[x-9,y-33],[x+9,y-42],[x,y+4]],'#e4ebd2',3);}}
      if(f.kind==='spark')for(let i=0;i<7;i++){const a=i*TAU/7;line(c,[[f.x+Math.cos(a)*8,f.y+Math.sin(a)*8],[f.x+Math.cos(a)*(38-20*k),f.y+Math.sin(a)*(38-20*k)]],'#ead599',2);}
      if(f.kind==='heal'||f.kind==='seal'){c.strokeStyle='#d7e0a5';c.lineWidth=2;c.beginPath();c.ellipse(f.x,f.y-5-(1-k)*35,35*(1-k*.3),14,0,0,TAU);c.stroke();text(c,'✦',f.x,f.y-45-(1-k)*45,'#e0e4b5',27);}
      if(f.kind==='dash')ellipse(c,f.x,f.y,25*k,11*k,'#c8dfc066');
      if(f.kind==='impact'){c.strokeStyle=f.pattern==='dive'?'#d3b0dc':'#eeb992';c.lineWidth=5*k;c.beginPath();c.arc(f.x,f.y,f.range*(1-k*.25),0,TAU);c.stroke();}
      c.restore();
    }
    edgeMarker(g){
      const o=g.target();if(!o)return;const sx=(o.x-this.camera.x)*this.zoom,sy=(o.y-this.camera.y)*this.zoom;
      if(sx>40&&sx<this.w-40&&sy>25&&sy<this.h-30)return;
      const c=this.c,landscape=this.h<390,top=landscape?100:220,bottom=landscape?this.h-70:this.h-200;
      const x=clamp(sx,34,this.w-34),y=clamp(sy,Math.min(top,this.h*.45),Math.max(top+20,bottom));
      c.save();c.translate(x,y);const angle=Math.atan2(sy-this.h*.5,sx-this.w*.5);c.rotate(angle);polygon(c,[[12,0],[-6,-7],[-3,0],[-6,7]],'#f0d99a','#233f45',2);c.restore();
      const label=o.label||o.name;text(c,label,clamp(x,70,this.w-70),y+22,'#e6d9ab',10);
    }
    drawMini(g,canvas,labels=false){
      if(!canvas)return;const c=canvas.getContext('2d'),a=AREAS[g.area],w=canvas.width,h=canvas.height,s=Math.min((w-22)/a.w,(h-22)/a.h),ox=(w-a.w*s)/2,oy=(h-a.h*s)/2;
      c.clearRect(0,0,w,h);box(c,0,0,w,h,'#12282f',3);c.save();c.translate(ox,oy);c.scale(s,s);c.drawImage(this.scenery(g.area).terrain,0,0);for(const b of a.blocks)box(c,b.x,b.y,b.w,b.h,'#c4c7ad4f',4);c.restore();
      for(const o of a.points){ellipse(c,ox+o.x*s,oy+o.y*s,o.kind==='portal'?4:3,o.kind==='portal'?4:3,o.need>g.progress?'#708678':o.kind==='seal'?'#beb1d3':'#e1c38a');if(labels)text(c,o.label,ox+o.x*s,oy+o.y*s-9,'#e3dbb2',10);}
      for(const e of g.enemies)if(e.hp>0)ellipse(c,ox+e.x*s,oy+e.y*s,e.boss?4:2,e.boss?4:2,'#d39987');const p=g.player,x=ox+p.x*s,y=oy+p.y*s;polygon(c,[[x,y-6],[x+4,y+4],[x,y+2],[x-4,y+4]],'#fff0af');
      if(!labels){c.strokeStyle='#e0e0b75e';c.lineWidth=1;const x1=clamp(this.camera.x,0,a.w),y1=clamp(this.camera.y,0,a.h),x2=clamp(this.camera.x+this.w/this.zoom,0,a.w),y2=clamp(this.camera.y+this.h/this.zoom,0,a.h);c.strokeRect(ox+x1*s,oy+y1*s,(x2-x1)*s,(y2-y1)*s);}
    }
  }
  root.WorldRenderer=WorldRenderer;
})(globalThis);
