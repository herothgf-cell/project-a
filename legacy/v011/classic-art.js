/* Original classic-RPG art layer. Real terrain/sprites, not a screenshot backdrop.
   Reference vocabulary: warm painted ground, tall sprites, illustrated dialogue.
   All geometry is our own; the supplied generated portrait is in portrait-data.js. */
(function(root){
  'use strict';
  const A=WorldArt,{TAU,polygon:poly,ellipse:oval,line,box,text,random}=A;
  const originalProp=A.prop,propCache=new Map(),treeCache=new Map();
  const themes={village:['#6b9b52','#9abb67','#daca97'],forest:['#487744','#86aa57','#cbb785'],ruins:['#697e57','#a4a76c','#c7c093'],sanctum:['#65866a','#a0b498','#c8c4a1'],city:['#647f77','#a0b3a1','#b9c1af'],rift:['#53656d','#88959b','#b3b7aa'],harbor:['#56756c','#91aaa1','#c4bf9f'],heart:['#526071','#8e92aa','#b3aaaf']};
  function gradient(c,x,y,h,a,b){const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
  function strokePath(c,d,fill,stroke='#493f35',width=1){const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}}
  function nearRoad(x,y,roads){let best=Infinity;for(const road of roads)for(let i=1;i<road.length;i++){const [ax,ay]=road[i-1],[bx,by]=road[i],dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(x-ax-t*dx,y-ay-t*dy));}return best;}
  function tile(colors,seed,stone=false){
    const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d'),rnd=random(seed);c.fillStyle=colors[0];c.fillRect(0,0,128,128);
    for(let i=0;i<1300;i++){const x=rnd()*128,y=rnd()*128,r=1+rnd()*5;c.globalAlpha=.10+rnd()*.24;oval(c,x,y,r*1.6,r,colors[i%colors.length]);}c.globalAlpha=1;
    for(let i=0;i<180;i++){const x=rnd()*128,y=rnd()*128;c.globalAlpha=.25;line(c,[[x-1,y+2],[x+2,y-3],[x+5,y-1]],stone?'#fff0bd':'#d6d99d',.7);}c.globalAlpha=1;return cv;
  }
  function terrain(a){
    const id=a.theme,colors=themes[id]||themes.village,outdoor=a.world==='무림',rnd=random(id.charCodeAt(0)*914+77),cv=document.createElement('canvas');cv.width=a.w;cv.height=a.h;const c=cv.getContext('2d');
    c.fillStyle=c.createPattern(tile([colors[0],colors[1],outdoor?'#577b40':'#637b77'],813),'repeat');c.fillRect(0,0,a.w,a.h);
    // Broad translucent brush patches break up repeated texture without random frame noise.
    for(let i=0;i<100;i++){const x=rnd()*a.w,y=rnd()*a.h,r=40+rnd()*100;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%2?'#e6de9a22':'#253c3020');g.addColorStop(1,'#28352300');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
    const pathTex=c.createPattern(tile([colors[2],outdoor?'#c9af78':'#9ca896',outdoor?'#eee0af':'#d1d0b4'],119,true),'repeat');
    c.lineCap='round';c.lineJoin='round';for(const road of a.roads){line(c,road,outdoor?'#607f4390':'#47595988',145);line(c,road,pathTex,124);
      for(let n=1;n<road.length;n++){const [ax,ay]=road[n-1],[bx,by]=road[n],len=Math.hypot(bx-ax,by-ay);for(let j=0;j<len;j+=12){const t=j/len,x=ax+(bx-ax)*t,y=ay+(by-ay)*t,ang=Math.atan2(by-ay,bx-ax);for(const side of [-1,1]){const offset=side*(55+rnd()*11);oval(c,x-Math.sin(ang)*offset,y+Math.cos(ang)*offset,5+rnd()*8,4+rnd()*5,pathTex);}}}}
    for(let i=0;i<1500;i++){const x=30+rnd()*(a.w-60),y=35+rnd()*(a.h-70),d=nearRoad(x,y,a.roads);if(d<52){if(i%7===0){oval(c,x+1,y+1,2.8,1.5,'#73694d40');oval(c,x,y,2,1.2,'#f0dfb990');}continue;}
      if(outdoor){const col=i%3?'#b1c47b':'#e1d49c';for(let k=0;k<3;k++)line(c,[[x+k*3,y+3],[x+k*3-2,y-3-rnd()*4]],col,.8);if(i%9===0){for(let k=0;k<4;k++){const an=k*TAU/4;oval(c,x+Math.cos(an)*2.6,y+Math.sin(an)*1.7,2.2,1.5,i%2?'#f7edbe':'#d9c2d7');}oval(c,x,y,1.2,1,'#eac66a');}}
      else if(i%8===0)line(c,[[x,y],[x+7,y+4],[x+13,y+3]],'#c5d0ba25',1);
    }
    // Hand-laid stones through the settlement; unchanged walkable geometry.
    if(id==='village'||id==='city')for(let y=375;y<665;y+=25)for(let x=572;x<644;x+=27){const xx=x+(Math.floor(y/25)%2)*8;poly(c,[[xx+2,y],[xx+23,y-2],[xx+28,y+14],[xx+19,y+22],[xx-2,y+16]],id==='village'?'#c7b69a':'#aab9ae','#887d6570');line(c,[[xx+2,y+1],[xx+20,y]],'#ebdab291',1);}
    if(id==='city'){for(let i=0;i<9;i++)box(c,540+i*23,584,10,50,'#e9e0b890',0);line(c,[[50,665],[1280,665]],'#caba775a',2);}
    if(id==='harbor'){c.fillStyle='#447e90';c.fillRect(1385,0,115,a.h);for(let y=0;y<a.h;y+=16)line(c,[[1387,y],[1410,y+5],[1445,y-1],[1500,y+8]],y%32?'#aad3bf4a':'#d0e2cd60',2);line(c,[[1383,0],[1383,a.h]],'#e0d4ac',8);}
    if(root.FateArt)FateArt.terrain(c,a);
    const decorations=[];if(outdoor)for(let y=145;y<a.h-90;y+=185){decorations.push({x:55,y,scale:1.0+(y%3)*.07},{x:a.w-55,y:y+80,scale:.94});}
    return {terrain:cv,decorations};
  }
  function drawTree(c,x,y,size=1,seed=8){
    const rnd=random(seed);c.save();c.translate(x,y);c.scale(size,size);oval(c,24,13,69,25,'#1b342c42');
    strokePath(c,'M-10 0 Q-4 -40 -13 -80 L-30 -125 L-15 -129 L2 -98 L21 -124 L32 -121 L13 -79 Q5 -32 16 1 L4 7Z',gradient(c,0,-120,130,'#b28b53','#785032'),'#5b4a32',2);
    line(c,[[0,-8],[0,-65],[-12,-97]],'#d2ad67',3);line(c,[[8,-37],[12,-72],[25,-108]],'#745230',2);
    for(let i=0;i<36;i++){const an=i*2.4,r=Math.sqrt(rnd())*61,lx=Math.cos(an)*r,ly=-108+Math.sin(an)*r*.58;oval(c,lx+5,ly+6,18,13,'#304f3094');}
    for(let i=0;i<420;i++){const an=i*2.399,r=Math.sqrt(rnd())*68,lx=Math.cos(an)*r,ly=-115+Math.sin(an)*r*.63;const fills=['#718d42','#aabb65','#c5ca81','#547a3d','#8aa250'];c.save();c.translate(lx,ly);c.rotate(rnd()*2-1);strokePath(c,'M-8 0 Q-4 -9 7 -3 Q12 4 0 6Z',gradient(c,0,-8,16,fills[i%5],'#658442'),'#42602f40',.6);line(c,[[-5,2],[6,-2]],'#dee4a26d',.55);c.restore();}
    c.restore();
  }
  function tree(c,x,y,s=1){const key=Math.round(s*10)%3;if(!treeCache.has(key)){const cv=document.createElement('canvas');cv.width=190;cv.height=200;drawTree(cv.getContext('2d'),84,180,1,97+key);treeCache.set(key,cv);}c.drawImage(treeCache.get(key),x-84*s,y-180*s,190*s,200*s);}
  function paintBuilding(c,b,modern){
    const {x,y,w,h}=b;c.save();poly(c,[[x+15,y+h],[x+w,y+h],[x+w+65,y+h+42],[x+52,y+h+42]],'#1e353748');
    box(c,x+4,y+h*.25,w-8,h*.75,gradient(c,x,y,h,modern?'#c1cabe':'#eddfb8',modern?'#657e7e':'#b8a277'),2);
    const stoneY=y+h*.75;for(let sy=stoneY;sy<y+h;sy+=13)for(let sx=x+7;sx<x+w-10;sx+=30){box(c,sx,sy,27,11,sy%2?'#a3a38b':'#909a86',2);line(c,[[sx+2,sy+1],[sx+24,sy+1]],'#d3cfb77d');}
    if(!modern){for(let i=0;i<5;i++)box(c,x+10+i*(w-26)/4,y+h*.30,7,h*.57,'#6d5138',0);line(c,[[x+15,y+h*.37],[x+w-15,y+h*.65]],'#806347',4);}
    for(let i=0;i<3;i++){const wx=x+24+i*(w-78)/2,wy=y+h*.43;box(c,wx-3,wy-3,36,36,'#5b5648',2);box(c,wx,wy,30,29,gradient(c,wx,wy,29,modern?'#84bac3':'#789fad','#354f6c'),1);line(c,[[wx+15,wy],[wx+15,wy+29]],'#cfba85',2);line(c,[[wx,wy+14],[wx+30,wy+14]],'#cfba85',2);line(c,[[wx+3,wy+3],[wx+10,wy+3],[wx+22,wy+12]],'#d2dfce90',2);}
    box(c,x+w*.43,y+h*.66,w*.15,h*.34,'#514333',2);box(c,x+w*.445,y+h*.69,w*.12,h*.31,gradient(c,x,y,h*.3,'#977347','#665034'),1);oval(c,x+w*.53,y+h*.83,2,2,'#dac784');
    // Roof silhouette and individual overlapping shingles, not a flat triangle.
    const roof=[[x-22,y+h*.35],[x+5,y+8],[x+w*.53,y-55],[x+w+10,y+8],[x+w+22,y+h*.35],[x+w*.48,y+h*.27]];
    poly(c,roof,modern?'#526876':'#405a70','#344d59',2);
    c.save();const clip=new Path2D();roof.forEach(([xx,yy],i)=>i?clip.lineTo(xx,yy):clip.moveTo(xx,yy));clip.closePath();c.clip();
    for(let row=0;row<12;row++){const yy=y-55+row*18;for(let xx=x-25-(row%2)*12;xx<x+w+35;xx+=24){poly(c,[[xx,yy],[xx+25,yy-2],[xx+29,yy+13],[xx+4,yy+18]],['#6b7e90','#60758a','#536e82','#81909a'][((xx|0)+row+1000)%4],'#2c47566b');line(c,[[xx+3,yy+1],[xx+23,yy]],'#b0b8b369',1);}}
    c.restore();line(c,[[x-22,y+h*.35],[x+w*.48,y+h*.27],[x+w+22,y+h*.35]],'#d3c59e',3);
    if(b.kind==='temple'){poly(c,[[x+45,y-8],[x+w*.52,y-78],[x+w-40,y-8],[x+w*.5,y-24]],'#506b74','#bac49e',2);box(c,x+w*.38,y+h*.34,w*.24,25,'#294953',1);text(c,'白 蓮 門',x+w*.5,y+h*.34+17,'#f3dfac',13);}
    if(modern){box(c,x+w*.36,y+h*.3,w*.3,22,'#284957',1);text(c,'HAEON',x+w*.51,y+h*.3+15,'#d0e7d4',11);}
    for(const lx of [x+15,x+w-14]){line(c,[[lx,y+h*.42],[lx,y+h*.66]],'#60553a',2);oval(c,lx,y+h*.7,7,11,'#ddb976');line(c,[[lx,y+h*.65],[lx,y+h*.75]],'#9b7243',1);}
    c.restore();
  }
  function paintRock(c,b,theme){const {x,y,w,h}=b,rnd=random(Math.round(w*h));oval(c,x+w*.55,y+h*.88,w*.6,h*.3,'#263a3748');
    for(let row=0;row<4;row++){const yy=y+row*h/4;for(let col=0;col<4;col++){const xx=x+col*w/4+(row%2?5:-3),ww=w/4+4,hh=h/4+3;poly(c,[[xx+3,yy+4],[xx+ww*.6,yy-6],[xx+ww,yy+hh*.25],[xx+ww*.85,yy+hh],[xx+6,yy+hh-1],[xx-2,yy+hh*.4]],['#b0ac89','#a6a78e','#bcb697','#949c84'][Math.floor(rnd()*4)],'#68765a',1.3);line(c,[[xx+4,yy+5],[xx+ww*.6,yy-3],[xx+ww-3,yy+hh*.24]],'#e0d7b385',2);}}
    for(let i=0;i<26;i++){const xx=x+rnd()*w,yy=y+rnd()*h;oval(c,xx,yy,3+rnd()*9,2+rnd()*3,theme==='rift'||theme==='heart'?'#85b0a356':'#597f4688');}
  }
  function prop(c,b,theme){
    if(b.kind==='sea')return;
    const key=[theme,b.kind,b.w,b.h].join(':');if(!propCache.has(key)){
      const cv=document.createElement('canvas');cv.width=b.w+180;cv.height=b.h+220;const pc=cv.getContext('2d'),p={...b,x:55,y:125};
      if(['building','house','temple'].includes(b.kind))paintBuilding(pc,p,b.kind==='building');
      else if(b.kind==='tree')drawTree(pc,p.x+b.w/2,p.y+b.h,1.03,53);
      else if(['rock','ruin','templeruin'].includes(b.kind)){paintRock(pc,p,theme);if(b.kind==='templeruin'){box(pc,p.x+b.w*.32,p.y-45,27,75,'#b8b699',2);line(pc,[[p.x+b.w*.32,p.y-43],[p.x+b.w*.32+25,p.y-43]],'#e3d7b8',3);}}
      else if(b.kind==='pond'){oval(pc,p.x+b.w*.5,p.y+b.h*.5,b.w*.53,b.h*.54,'#bcbb91');oval(pc,p.x+b.w*.5,p.y+b.h*.5,b.w*.47,b.h*.44,'#528887');for(let i=0;i<18;i++){const yy=p.y+16+i*4;line(pc,[[p.x+18,yy],[p.x+34+Math.sin(i)*12,yy+2],[p.x+b.w-24,yy]],'#bbdacc55');}for(let i=0;i<4;i++)oval(pc,p.x+28+i*24,p.y+27+(i%2)*25,9,4,'#b6c995');}
      else originalProp(pc,p,theme);
      propCache.set(key,cv);
    }
    c.drawImage(propCache.get(key),b.x-55,b.y-125);
  }
  const heroSprite=new Image();heroSprite.src=root.HeroSpriteData||'';
  function human(c,e,t,kind='hero',scale=1){
    if(kind==='hero'&&heroSprite.complete&&heroSprite.naturalWidth){
      c.save();c.translate(e.x,e.y);c.scale(scale,scale);oval(c,4,3,20,7,'#192d2d45');
      const stride=e.walking?Math.sin(t*11):0;c.translate(0,-Math.abs(stride)*1.8);
      if(Math.cos(e.face??0)<-.15)c.scale(-1,1);
      c.rotate(e.swing>0?Math.sin(e.swing/.3*Math.PI)*.055:stride*.015);
      if(e.flash>0)c.globalAlpha=.6;c.drawImage(heroSprite,-47,-86,84,101);c.restore();return;
    }
    const hero=kind==='hero',master=kind==='master',monster=['shade','sentinel','drone','tide'].includes(kind),boss=['chief','sentinel','guardian','tide'].includes(kind),back=Math.sin(e.face??1.57)<-.4;
    const palette={hero:['#ae3d32','#f1debb','#e0b765'],master:['#60765e','#d8dccc','#e5ddbd'],warden:['#405978','#c0cad3','#5b4034'],shop:['#94704d','#d8c99b','#7b5437'],bandit:['#716d48','#c8ac7c','#623e28'],chief:['#9d493d','#c8b18b','#724a30'],masked:['#575b7c','#ccc9b3','#434458'],guardian:['#757e72','#d5ceb1','#ada791'],shade:['#5f657e','#9bacae','#4b5670'],sentinel:['#596e83','#b7c8c7','#505c6f'],drone:['#46656e','#a5c1b5','#445b65'],tide:['#64607c','#b6c8bc','#55516c']}[kind]||['#6d775b','#cfcaab','#74613b'];
    const step=e.walking?Math.sin(t*11):0,swing=e.swing>0?Math.sin(e.swing/.3*Math.PI):0;
    c.save();c.translate(e.x,e.y);c.scale(scale,scale);oval(c,9,3,21,8,'#192d2d50');c.translate(0,Math.abs(step)*1.2);
    // Layered cape, boots, padded tunic, armor and separate hair silhouette.
    poly(c,[[-9,-53],[-21,-43],[-19-step*2,-17],[-31-step*4,-6],[-4,-13],[14,-9],[12,-42]],palette[0],'#443e357e',1.2);
    line(c,[[-8,-20],[-9+step*4,-4-step*2]],'#44453e',8);line(c,[[8,-20],[9-step*4,-4+step*2]],'#44453e',8);
    poly(c,[[-14+step*4,-9-step*2],[-5+step*4,-8-step*2],[-2+step*4,2-step*2],[-15+step*4,3-step*2]],'#665039','#3c3c31');poly(c,[[4-step*4,-9+step*2],[12-step*4,-9+step*2],[18-step*4,1+step*2],[4-step*4,2+step*2]],'#806044','#3c3c31');
    poly(c,[[-10,-50],[9,-50],[13,-28],[8,-16],[-11,-16],[-15,-29]],palette[1],'#685947',1.2);poly(c,[[-9,-49],[-6,-31],[3,-18],[-12,-18],[-14,-29]],palette[0]+'b3');
    poly(c,[[-12,-45],[-22,-39],[-20,-33],[-10,-37]],'#c8c2a9','#685947');poly(c,[[10,-45],[22,-37],[20,-30],[10,-36]],'#e2d6b5','#685947');
    line(c,[[-19,-35],[-20,-24+step]],palette[0],7);line(c,[[19,-33],[22+swing*9,-24-swing*6]],palette[0],7);oval(c,-20,-23+step,3.6,4.2,'#ebc29a');oval(c,22+swing*9,-23-swing*6,3.6,4.2,'#edc9a0');
    line(c,[[-12,-27],[13,-27]],'#715238',4);poly(c,[[-3,-29],[3,-29],[5,-25],[0,-22],[-5,-25]],'#dec276');
    // Hair behind head gives a taller classic sprite ratio rather than a floating circle.
    if(hero){strokePath(c,'M-10 -69 Q-21 -52 -21 -30 Q-31 -20 -28 -16 Q-13 -27 -10 -43 L4 -54 Q12 -35 27 -27 L19 -46 L13 -67Z','#c69958','#846044',.7);line(c,[[-13,-55],[-20-step*2,-27]],'#f3d896',2);poly(c,[[-9,-58],[-20,-62],[-25,-55],[-13,-51],[-24,-34],[-10,-44]],'#a53530','#713a2c',.7);}
    strokePath(c,'M-10 -66 Q-10 -77 0 -78 Q13 -76 11 -64 L8 -57 Q0 -50 -7 -57Z',monster?'#a1b4b5':gradient(c,0,-77,26,'#f5d7ac','#dba478'),'#806248',.8);
    if(back){poly(c,[[-11,-69],[-10,-77],[-3,-83],[7,-79],[12,-70],[9,-56],[-6,-55]],palette[2],'#725d4670');}
    else {
      strokePath(c,'M-12 -65 Q-16 -79 -3 -83 Q12 -84 15 -69 L10 -57 L8 -70 L3 -65 L1 -74 L-4 -65 L-6 -73 L-10 -62Z',palette[2],'#765d45',1);
      line(c,[[-6,-79],[-10,-69]],hero?'#fff0bd':'#b4a180',1.2);line(c,[[0,-79],[-2,-70]],hero?'#f7db97':'#bcb090',1.1);line(c,[[4,-78],[11,-68]],hero?'#ffe6a5':'#b8ac8d',1);
      line(c,[[-7,-66],[-3,-66]],'#403b3a',1.2);line(c,[[3,-66],[7,-67]],'#403b3a',1.2);oval(c,-4,-65,1.1,1.5,hero?'#806032':'#50626a');oval(c,5,-65.5,1.1,1.5,hero?'#806032':'#50626a');line(c,[[0,-59],[4,-59]],'#ad6c55',.7);
    }
    if(master){strokePath(c,'M-7 -59 L0 -42 L6 -60 Q1 -55 -7 -59Z','#e9e6d0',null);line(c,[[24,-38],[29,6]],'#87633a',3);}
    if(monster||boss){poly(c,[[-12,-52],[-28,-48],[-22,-36],[-10,-42]],palette[0],'#d0c49c');poly(c,[[12,-52],[29,-47],[23,-36],[11,-42]],palette[0],'#d0c49c');poly(c,[[-9,-75],[-21,-87],[-14,-65]],palette[1],'#546166');poly(c,[[9,-75],[21,-88],[15,-64]],palette[1],'#546166');oval(c,0,-43,3,5,'#d8c98d');}
    if(!master&&kind!=='shop'&&kind!=='warden'){
      c.save();c.translate(21+swing*7,-25);c.rotate((e.face??0)+swing*1.5-.25);poly(c,[[-5,-2],[33,-3],[52,0],[32,4],[-5,3]],'#ccdfe0','#486477',1);poly(c,[[0,-1],[34,-2],[48,0],[6,1]],'#f1f2ce');line(c,[[-3,-8],[-3,8]],'#d0ac65',3);line(c,[[-13,0],[-5,0]],'#644432',4);c.restore();
    }
    if(kind==='warden'){box(c,17,-35,13,20,'#334d65',1);line(c,[[20,-29],[28,-29]],'#e1d5a5',2);}
    if(e.flash>0){c.globalAlpha=e.flash/.18*.35;oval(c,0,-42,21,35,'#fff8db');}c.restore();
  }
  const heroImage=new Image();heroImage.src=root.HeroPortraitData||'';
  function portrait(canvas,kind){
    canvas.dataset.portrait=kind;const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
    if(kind==='hero'&&heroImage.complete&&heroImage.naturalWidth){c.drawImage(heroImage,0,0,w,h);return;}
    if(kind==='hero')heroImage.addEventListener('load',()=>{if(canvas.dataset.portrait==='hero')portrait(canvas,'hero');},{once:true});
    c.save();c.scale(w/192,h/216);c.fillStyle=gradient(c,0,0,216,'#516674','#172d48');c.fillRect(0,0,192,216);oval(c,102,97,77,87,'#dbe7ba10');
    if(kind==='system'){text(c,'界',96,145,'#e0cd93',92);c.restore();return;}
    const master=kind==='master',hair=master?'#d5d1bb':kind==='hero'?'#d8b06b':'#5b4237',coat=master?'#74816a':'#5e708d';
    strokePath(c,'M6 216 Q16 161 67 157 L125 156 Q181 166 191 216Z',coat,'#263742',2);
    strokePath(c,'M75 130 L71 165 L94 182 L119 161 L116 131Z','#d4a77e','#806655',1.5);
    strokePath(c,'M49 61 Q53 14 101 19 Q146 20 150 76 L144 131 L113 163 L79 157 L53 130Z',gradient(c,0,30,140,'#ffe1b5','#d3a17c'),'#806355',1.4);
    strokePath(c,'M42 135 Q27 81 49 37 Q70 1 112 14 Q161 10 166 63 Q168 115 145 144 L139 90 L129 58 L116 70 L109 40 L83 72 L72 43 L53 98 L50 139Z',hair,'#594c46',1.5);
    for(let i=0;i<7;i++)strokePath(c,`M${58+i*11} 26 Q${44+i*15} 56 ${50+i*13} ${83-i*3}`,null,master?'#f1e9cd7a':'#a47c596d',1.6);
    for(const x of [74,122]){strokePath(c,`M${x-13} 103 Q${x} 96 ${x+13} 104 Q${x} 116 ${x-13} 103Z`,'#eee8d2','#665251',1.6);oval(c,x+1,105,5,7,master?'#727b72':'#707d85');oval(c,x+1,106,2.5,5,'#313841');oval(c,x-1,102,1.5,2,'#fff7df');line(c,[[x-13,95],[x+9,94]],master?'#bbbca6':'#765742',2);}
    line(c,[[100,107],[96,126],[102,129]],'#b78363',1.2);strokePath(c,'M87 139 Q99 143 113 138',null,'#a56c5f',1.5);
    if(master){strokePath(c,'M71 134 Q95 146 124 130 L111 163 L94 187 L81 162Z','#ded9c4','#a8a795',1);line(c,[[77,142],[93,169]],'#f0ead4',1.3);}
    poly(c,[[64,162],[91,183],[74,215],[33,177]],'#c7c3a6','#48555d');poly(c,[[124,157],[103,183],[120,215],[160,176]],'#b8bfae','#48555d');oval(c,100,188,7,8,'#bdad73');oval(c,100,188,3.5,5,'#608c89');c.restore();
  }
  function cover(canvas){
    const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);const c=canvas.getContext('2d');c.scale(d,d);const a=DualWorld.AREAS.village,scene=terrain(a),s=Math.max(r.width/a.w,r.height/a.h);c.save();c.scale(s,s);c.drawImage(scene.terrain,0,0);for(const b of a.blocks)prop(c,b,'village');for(const b of scene.decorations)tree(c,b.x,b.y,b.scale);human(c,{x:760,y:660,face:-.8},0,'hero',2.0);human(c,{x:850,y:610,face:2},0,'master',1.7);c.restore();
  }
  function scar(c,o,t,g){const active=g.enemies.some(e=>e.hp>0&&e.wind>0&&Math.hypot(e.x-o.x,e.y-o.y)<190);c.save();c.translate(o.x,o.y);c.strokeStyle=active?'#d8ffe1':'#acdcc69c';c.lineWidth=active?3:1.5;for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,0,14+i*11,5+i*5,Math.sin(t)*.12,0,TAU);c.stroke();}line(c,[[-15,4],[-3,-7],[3,-2],[20,-12]],active?'#efffdc':'#8bbca7',2);if(active)text(c,'E · 흐름에 손을 댄다',0,-35,'#e7f5bd',11);c.restore();}
  function effect(c,f,quality){
    if(!f.kind.startsWith('legend-'))return;const k=Math.max(0,f.life/f.max),r=20+(1-k)*(f.range||170);c.save();c.globalAlpha=k;c.strokeStyle=f.color||'#fff1c4';c.lineWidth=2+3*k;
    for(let i=0;i<(quality?3:1);i++){c.beginPath();c.ellipse(f.x,f.y-18,Math.max(1,r-i*14),Math.max(1,r*.52-i*5),0,0,TAU);c.stroke();}
    if(f.kind==='legend-echo'){c.globalAlpha=k*.6;for(let i=0;i<3;i++)human(c,{x:f.x+i*30,y:f.y-i*12,face:0},0,'hero',1.15);}
    if(f.kind==='legend-seal'){for(let i=0;i<6;i++){const a=i*TAU/6;line(c,[[f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.52],[f.x+Math.cos(a+2.094)*r,f.y+Math.sin(a+2.094)*r*.52]],'#dbffe5',1);}}
    c.restore();
  }
  A.human=human;A.prop=prop;A.bamboo=tree;A.portrait=portrait;A.cover=cover;
  root.ClassicArt={terrain,human,prop,portrait,scar,effect,themes,spriteReady:()=>heroSprite.complete&&heroSprite.naturalWidth>0};
})(globalThis);
