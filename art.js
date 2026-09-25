/* Illustrated vector art: original characters, architecture and props. */
(function(root){
  'use strict';
  const TAU=Math.PI*2;
  function polygon(c,pts,fill,stroke,width=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fillStyle=fill;c.fill();}
  function line(c,pts,color,width=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  function box(c,x,y,w,h,color,r=3){c.beginPath();c.roundRect(x,y,Math.max(0,w),Math.max(0,h),r);c.fillStyle=color;c.fill();}
  function text(c,s,x,y,color='#e3e5cd',size=12,align='center'){c.font=`${size}px "Apple SD Gothic Neo","Malgun Gothic",sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y);}
  function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  function bamboo(c,x,y,scale=1,t=0){
    c.save();c.translate(x,y);c.scale(scale,scale);ellipse(c,0,0,32,10,'#0b302c45');
    for(let j=0;j<3;j++){const lean=Math.sin(t*.65+x)*2.5,xx=(j-1)*12;line(c,[[xx,0],[xx+lean,-60],[xx+lean*2,-128+j*10]],j%2?'#668f61':'#497559',4);
      for(let k=1;k<6;k++){line(c,[[xx-3+lean*k/3,-k*20],[xx+3+lean*k/3,-k*20]],'#b8c78c88',1);if(k<2)continue;const side=k%2?1:-1,yy=-k*19;line(c,[[xx,yy],[xx+side*33,yy-11]],'#779866',1);polygon(c,[[xx+side*12,yy-5],[xx+side*39,yy-11],[xx+side*24,yy+1]],'#8eaa739c');polygon(c,[[xx+side*16,yy-6],[xx+side*20,yy-22],[xx+side*27,yy-10]],'#577f58');}
    }c.restore();
  }
  function tree(c,b){const x=b.x+b.w*.5,y=b.y+b.h;ellipse(c,x+12,y,b.w*.65,20,'#0d30295e');polygon(c,[[x-9,y],[x-6,y-84],[x+9,y-82],[x+8,y]],'#525844');line(c,[[x,y-53],[x-23,y-89]],'#525844',7);ellipse(c,x-26,y-100,b.w*.48,37,'#325d47');ellipse(c,x+28,y-119,b.w*.5,40,'#4a7953');ellipse(c,x-7,y-145,b.w*.44,36,'#709468');ellipse(c,x-13,y-160,b.w*.26,20,'#95ab76');}
  function building(c,b,modern=false){
    const {x,y,w,h}=b;ellipse(c,x+w*.58,y+h+5,w*.61,29,'#102d325e');
    if(modern){
      box(c,x,y+h*.28,w,h*.72,'#355663',2);polygon(c,[[x+w,y+h*.28],[x+w+14,y+h*.21],[x+w+14,y+h-12],[x+w,y+h]],'#24404d');
      polygon(c,[[x-10,y+h*.3],[x+w+12,y+h*.3],[x+w-9,y-28],[x+14,y-28]],'#6e8e95','#a0b4ad');polygon(c,[[x+10,y+h*.23],[x+w-8,y+h*.23],[x+w-25,y-10],[x+27,y-10]],'#526d7a');
      box(c,x+w*.18,y-2,w*.26,25,'#344e5c',2);line(c,[[x+w*.3,y-2],[x+w*.3,y-54]],'#9db4ad',2);line(c,[[x+w*.23,y-40],[x+w*.42,y-40]],'#9db4ad',1);
      const rows=Math.max(1,Math.floor(h*.53/33)),cols=Math.max(2,Math.floor(w/43));
      for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const wx=x+17+k*(w-26)/cols,wy=y+h*.38+r*31;box(c,wx,wy,23,16,(r+k)%3?'#99c2c181':'#e1cd989c',1);line(c,[[wx+12,wy],[wx+12,wy+16]],'#334d5766');}
      box(c,x+w*.43,y+h-39,w*.17,39,'#192f3c',1);line(c,[[x+w*.51,y+h-35],[x+w*.51,y+h-1]],'#7eadae',1);
      if(w>220){box(c,x+w*.23,y+h*.26-14,w*.54,23,'#203d48',2);text(c,'HAEON  /  헌터 관리국',x+w*.5,y+h*.26+2,'#d4dbbc',10);}
    }else{
      box(c,x+12,y+h*.3,w-24,h*.7,'#c7b894',1);box(c,x+20,y+h*.34,w-40,h*.5,'#b5b497',1);
      for(let i=0;i<5;i++)box(c,x+22+i*(w-51)/4,y+h*.32,8,h*.68,'#655744',1);
      box(c,x+w*.37,y+h*.44,w*.26,h*.56,'#3b584f',1);for(let i=1;i<6;i++)line(c,[[x+w*.37+i*w*.043,y+h*.45],[x+w*.37+i*w*.043,y+h]],'#99a78499',1);
      polygon(c,[[x-24,y+h*.4],[x+15,y+h*.14],[x+w*.5,y-39],[x+w-15,y+h*.14],[x+w+24,y+h*.4],[x+w*.5,y+h*.28]],'#325b55','#9ba988');
      for(let i=0;i<13;i++){const rx=x-7+i*(w+14)/12;line(c,[[x+w*.5+(rx-x-w*.5)*.62,y-9],[rx,y+h*.35]],'#819a7877',2);}
      line(c,[[x-24,y+h*.4],[x+w*.5,y+h*.28],[x+w+24,y+h*.4]],'#adb58a',3);
      if(b.kind==='temple'){polygon(c,[[x+45,y+4],[x+85,y-26],[x+w*.5,y-62],[x+w-85,y-26],[x+w-45,y+4],[x+w*.5,y-8]],'#315950','#9cac87');box(c,x+w*.38,y+h*.31,w*.24,25,'#27483e',2);text(c,'白 蓮 門',x+w*.5,y+h*.31+18,'#e1d096',14);}
      for(const lx of [x+29,x+w-29]){line(c,[[lx,y+h*.44],[lx,y+h*.67]],'#6f6245',2);ellipse(c,lx,y+h*.7,9,13,'#d7aa6f');line(c,[[lx-6,y+h*.7],[lx+6,y+h*.7]],'#ab7c51',1);}
      box(c,x-4,y+h,w+8,8,'#8b9c82',1);box(c,x+7,y+h+8,w-14,6,'#647e6c',1);
    }
  }
  function rock(c,b,ruin=false){const {x,y,w,h}=b;ellipse(c,x+w*.58,y+h*.83,w*.62,h*.3,'#16363155');polygon(c,[[x,y+h*.65],[x+w*.13,y+h*.19],[x+w*.4,y-10],[x+w*.9,y+h*.2],[x+w,y+h*.77],[x+w*.7,y+h],[x+w*.2,y+h*.93]],ruin?'#536d7a':'#788d7c');polygon(c,[[x,y+h*.65],[x+w*.44,y+h*.41],[x+w*.4,y-10],[x+w*.13,y+h*.19]],ruin?'#718b95':'#9fa98a');polygon(c,[[x+w*.44,y+h*.41],[x+w*.9,y+h*.2],[x+w*.4,y-10]],ruin?'#91a4a3':'#bac0a0');line(c,[[x+w*.44,y+h*.41],[x+w*.7,y+h],[x+w,y+h*.77]],'#34545766',2);if(ruin)line(c,[[x+w*.4,y-10],[x+w*.49,y+h*.3],[x+w*.37,y+h*.63],[x+w*.54,y+h*.93]],'#acd8ce85',3);else{ellipse(c,x+w*.25,y+h*.68,w*.18,h*.06,'#70956d');ellipse(c,x+w*.78,y+h*.23,w*.12,h*.05,'#91b080');}}
  function prop(c,b,theme){
    const {x,y,w,h}=b;
    if(b.kind==='sea')return;
    if(['building','temple','house'].includes(b.kind))return building(c,b,b.kind==='building');
    if(b.kind==='tree')return tree(c,b);
    if(b.kind==='pond'){ellipse(c,x+w*.5,y+h*.5,w*.53,h*.52,'#bcc5a3');ellipse(c,x+w*.5,y+h*.5,w*.46,h*.44,'#508379');for(let i=0;i<5;i++)line(c,[[x+24+i*6,y+24+i*12],[x+69+i*8,y+24+i*12]],'#c4dac066',1);ellipse(c,x+38,y+45,9,4,'#adc9a1');ellipse(c,x+105,y+65,12,5,'#99c397');return;}
    if(b.kind==='crate'||b.kind==='container'){const con=b.kind==='container';ellipse(c,x+w*.6,y+h,w*.64,23,'#132e3b55');box(c,x,y,w,h,con?'#466c76':'#617771',2);polygon(c,[[x,y],[x+12,y-23],[x+w+12,y-23],[x+w,y]],con?'#70929a':'#91a394');polygon(c,[[x+w,y],[x+w+12,y-23],[x+w+12,y+h-14],[x+w,y+h]],'#2e525e');for(let i=12;i<w-5;i+=15)line(c,[[x+i,y+4],[x+i,y+h-5]],'#244d5977',3);if(con){text(c,'HAEON  07',x+w*.5,y+h*.55,'#c4ccac',10);line(c,[[x+w*.48,y+8],[x+w*.48,y+h-8]],'#a3b4a577',2);}else line(c,[[x+9,y+9],[x+w-9,y+h-9]],'#b6b89988',4);return;}
    if(b.kind==='templeruin'){rock(c,b,false);box(c,x+w*.22,y-h*.25,w*.22,h*.78,'#8e9d87',2);polygon(c,[[x+w*.12,y-h*.2],[x+w*.32,y-h*.47],[x+w*.65,y-h*.39],[x+w*.53,y-h*.21]],'#adb69a');line(c,[[x+w*.25,y],[x+w*.4,y+h*.19],[x+w*.3,y+h*.39]],'#496c5866',2);return;}
    rock(c,b,b.kind==='ruin');
  }
  function human(c,e,t,kind='hero',scale=1){
    c.save();c.translate(e.x,e.y);c.scale(scale,scale);const walk=e.walking?Math.sin(t*13):0,face=e.face??Math.PI/2;
    ellipse(c,3,3,19,8,'#071f2a69');c.translate(0,walk?Math.abs(walk)*1.6:Math.sin(t*2)*.5);
    const boss=['chief','sentinel','guardian','tide'].includes(kind),monster=['shade','sentinel','drone','tide'].includes(kind);
    const color={hero:'#78b6a2',warden:'#729ba6',master:'#d3d8c0',shop:'#c0ad82',bandit:'#a88868',chief:'#b77260',shade:'#8794b6',sentinel:'#839fac',masked:'#9c9ab6',guardian:'#b4b9a8',drone:'#648e9a',tide:'#808eac'}[kind]||'#8bac91';
    line(c,[[-6,-11],[-7-walk*2,1+walk*2]],'#253c43',8);line(c,[[7,-11],[8+walk*2,1-walk*2]],'#253c43',8);
    polygon(c,[[-10,-36],[-14,-25],[-17,-11],[0,-5],[17,-13],[13,-28],[10,-36]],color,'#1f394555',1);
    polygon(c,[[-10,-34],[-4,-17],[0,-5],[-17,-11]],'#1b444a33');
    if(kind==='hero'||kind==='master'||kind==='guardian'){polygon(c,[[-6,-35],[2,-31],[-6,-16],[-22,-7],[-13,-26]],kind==='hero'?'#d9ddbc':'#bdcbbb');polygon(c,[[3,-30],[12,-32],[18,-9],[8,4],[10,-16]],kind==='hero'?'#447e72':'#8b9f8c');}
    line(c,[[-12,-31],[-18,-17-walk]],color,8);line(c,[[12,-31],[18,-20+walk]],color,8);
    ellipse(c,-18,-15-walk,3.5,4,monster?'#9bb3b8':'#dfc3a1');ellipse(c,18,-18+walk,3.5,4,monster?'#9bb3b8':'#dfc3a1');
    line(c,[[-13,-18],[13,-18]],kind==='hero'?'#d9bc79':'#435954',4);
    if(kind==='hero'){polygon(c,[[4,-17],[8,-17],[11,3],[5,-2]],'#dcc086');line(c,[[-5,-34],[3,-24]],'#f2e3b866',1);}
    ellipse(c,0,-43,10,12,monster?'#80949f':'#e1c3a3');
    polygon(c,[[-10,-41],[-11,-50],[-4,-57],[5,-55],[11,-49],[10,-39],[5,-47],[-2,-49],[-6,-43]],kind==='master'?'#d1d8c4':monster?'#324f61':'#283e48');
    if(['hero','master','guardian','bandit','chief'].includes(kind))ellipse(c,0,-58,4.5,4.5,kind==='master'?'#d1d8c4':'#2a3d44');
    if(kind==='master'){polygon(c,[[-5,-37],[0,-20],[6,-37]],'#e5e7cf');line(c,[[21,-29],[24,8]],'#8f7850',3);}
    if(kind==='masked'||kind==='guardian'){polygon(c,[[-10,-45],[10,-45],[8,-33],[0,-29],[-8,-35]],'#d2ccb6');line(c,[[-5,-41],[-1,-40]],'#4b5361',2);line(c,[[3,-40],[7,-41]],'#4b5361',2);}
    else{ellipse(c,Math.cos(face)*2.5-3,-43,1,1,monster?'#cce4da':'#4a5149');ellipse(c,Math.cos(face)*2.5+3,-43,1,1,monster?'#cce4da':'#4a5149');}
    if(monster){polygon(c,[[-8,-49],[-18,-62],[-12,-40]],'#90a5ae');polygon(c,[[8,-49],[18,-62],[12,-40]],'#b2beb7');line(c,[[-5,-43],[5,-43]],'#d2e9c7',1.5);}
    if(boss){polygon(c,[[-10,-34],[-22,-37],[-26,-26],[-14,-25]],'#657d82','#b4b69a');polygon(c,[[10,-34],[22,-37],[26,-26],[14,-25]],'#748d91','#b4b69a');ellipse(c,0,-28,3,4,kind==='tide'?'#c8b3d8':'#e2c88e');}
    if(kind==='warden'){box(c,13,-27,13,20,'#2d505a',1);line(c,[[15,-22],[24,-22]],'#b0cabc',2);line(c,[[15,-18],[24,-18]],'#719b94',1);}
    else if(kind==='shop'){box(c,-9,-27,18,15,'#e0cd9e',2);}
    else if(kind!=='master'){
      c.save();c.translate(17,-20);c.rotate(face+.1);polygon(c,[[0,-2],[31,-2],[43,0],[31,3],[0,3]],monster?'#b1ccce':'#e2ece0','#789b9e');line(c,[[0,-7],[0,7]],'#d6be85',3);line(c,[[-8,0],[0,0]],'#6f6651',4);c.restore();
    }
    if(e.flash>0){c.globalAlpha=e.flash/.18*.45;ellipse(c,0,-28,20,30,'#fff9de');}
    c.restore();
  }
  function portal(c,o,t,theme,locked=false){
    c.save();c.translate(o.x,o.y);const col=locked?'#738c88':theme==='city'||theme==='rift'?'#98d1d1':'#c7d7a4';
    ellipse(c,0,9,45,19,'#0b253c66');ellipse(c,0,6,38,14,'#a5bda448');line(c,[[-36,5],[0,19],[37,4]],'#a4b79966',2);
    const glow=c.createRadialGradient(0,-28,2,0,-28,85);glow.addColorStop(0,locked?'#8aa39614':'#b2d5ba35');glow.addColorStop(1,'#a9d4ca00');c.fillStyle=glow;c.fillRect(-85,-115,170,170);
    if(o.kind==='portal'){polygon(c,[[-17,4],[-24,-48],[-3,-82],[22,-49],[17,4]],'#446f77',col,1.5);polygon(c,[[-3,-82],[-7,-27],[17,4],[22,-49]],'#7bb0b36b');line(c,[[-10,-43],[9,-52],[3,-24],[-6,-12]],col,2);}
    else{box(c,-39,-59,9,69,'#6e8780',2);box(c,30,-59,9,69,'#6e8780',2);line(c,[[-46,-61],[0,-67],[46,-61]],'#a5b899',5);c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.ellipse(0,-30,24,38,0,0,TAU);c.stroke();ellipse(c,0,-30,20,33,locked?'#45585670':'#76b5ac2a');text(c,locked?'鎖':'界',0,-22,col,23);}
    if(!locked)for(let i=0;i<5;i++){const a=t*.55+i*TAU/5;ellipse(c,Math.cos(a)*29,-30+Math.sin(a)*36,1.5,1.5,col);}
    c.restore();
  }
  function seal(c,o,t,done,harbor){c.save();c.translate(o.x,o.y);ellipse(c,0,4,30,13,'#18313888');polygon(c,[[-20,0],[-15,-37],[0,-48],[16,-34],[20,0]],harbor?'#4d6878':'#8e9c89','#b5bea0');polygon(c,[[-15,-37],[0,-48],[16,-34],[0,-25]],'#b7c3a2');text(c,harbor?'錨':'印',0,-7,done?'#e8d69a':'#c0bcd0',22);if(done){c.strokeStyle='#e1d38ca1';c.beginPath();c.ellipse(0,7,35+Math.sin(t)*2,14,0,0,TAU);c.stroke();}c.restore();}
  function portrait(canvas,kind){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);const gr=c.createLinearGradient(0,0,144,144);gr.addColorStop(0,'#334f50');gr.addColorStop(1,'#142c36');c.fillStyle=gr;c.fillRect(0,0,144,144);ellipse(c,72,57,50,50,'#b6c09812');if(kind==='system')text(c,'界',72,101,'#d1bd86',69);else human(c,{x:72,y:148,face:1.57},0,kind,2.15);}
  function cover(canvas){
    const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);const c=canvas.getContext('2d');c.scale(d,d);const w=r.width,h=r.height;c.fillStyle='#274952';c.fillRect(0,0,w,h);
    const sx=w/1440,sy=h/900;c.save();c.scale(sx,sy);
    const sky=c.createLinearGradient(0,0,0,900);sky.addColorStop(0,'#142c3e');sky.addColorStop(.65,'#698779');sky.addColorStop(1,'#193d41');c.fillStyle=sky;c.fillRect(0,0,1440,900);
    ellipse(c,1040,172,78,78,'#e9dfb3');ellipse(c,1027,162,78,78,'#c4c9aa55');
    polygon(c,[[300,570],[540,235],[660,415],[825,205],[1020,433],[1170,270],[1450,530],[1450,900],[300,900]],'#375958');polygon(c,[[320,680],[565,384],[795,665],[980,393],[1160,675],[1435,439],[1450,900],[320,900]],'#2d4c4c');
    for(let i=0;i<9;i++){const x=40+i*104,y=380+(i*61)%180;building(c,{x,y,w:80+(i%3)*20,h:170+(i%2)*100,kind:'building'},true);}
    polygon(c,[[560,900],[760,625],[1030,600],[1330,900]],'#536a5a');building(c,{x:1000,y:455,w:350,h:190,kind:'temple'},false);
    for(let i=0;i<9;i++)bamboo(c,935+i*57,790+(i%3)*50,1.5+i%2*.2,0);
    polygon(c,[[565,900],[765,657],[840,671],[910,900]],'#7d8d7266');portal(c,{x:862,y:610,kind:'portal'},0,'village');human(c,{x:829,y:825,face:-1.1},0,'hero',3.7);
    const rng=random(426);for(let i=0;i<60;i++)ellipse(c,rng()*1440,rng()*820,1+rng(),1+rng(),'#e3d6a04d');c.restore();
  }
  root.WorldArt={TAU,polygon,ellipse,line,box,text,random,bamboo,tree,building,rock,prop,human,portal,seal,portrait,cover};
})(globalThis);
