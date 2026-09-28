/* v0.6: recovered painted wuxia atlas + eight facing sectors + cached scenery.
   Assets are original generated concept crops, not Narsillion / webtoon extracts.
   Walking is articulated atlas motion, NOT an eight-direction hand-animated sheet. */
(function(root){
  'use strict';
  const A=root.WorldArt,C=root.ClassicArt,D=root.WuxiaDirection;
  const {ellipse:oval,polygon:poly,line,box,text,random,TAU}=A;
  const legacyHuman=A.human,legacyProp=A.prop;
  const images={},portraits={},materials={},propCache=new Map(),groundCache=new Map();
  const treeCache=new Map();
  const paint=(uri)=>{const im=new Image();im.src=uri;return im;};
  images.sprites=paint(WuxiaAssets.sprites);
  for(const [k,v]of Object.entries(WuxiaAssets.portraits))portraits[k]=paint(v);
  for(const [k,v]of Object.entries(WuxiaAssets.materials))materials[k]=paint(v);
  const ready=()=>Object.values(images).concat(Object.values(portraits),Object.values(materials)).every(i=>i.complete&&i.naturalWidth>0);
  const pending=[];for(const im of Object.values(images).concat(Object.values(portraits),Object.values(materials)))pending.push(im.decode().catch(()=>{}));
  const loaded=Promise.all(pending).then(()=>{groundCache.clear();propCache.clear();for(const cv of document.querySelectorAll('canvas[data-portrait]'))portrait(cv,cv.dataset.portrait);root.dispatchEvent(new Event('wuxia-assets-ready'));});
  function texture(c,key){const im=materials[key];return im.complete&&im.naturalWidth?c.createPattern(im,'repeat'):null;}
  function path(c,pts){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
  function human(c,e,t,kind='hero',scale=1){
    if(!images.sprites.complete||!images.sprites.naturalWidth){legacyHuman(c,e,t,kind==='hero'?'masked':kind,scale);return;}
    const humanoids=['hero','master','warden','shop','hunter','yeonhwa','bandit','chief','masked','guardian'];
    if(!humanoids.includes(kind)){legacyHuman(c,e,t,kind,scale);return;}
    const frame=D.facing(e.face??Math.PI/2),hero=kind==='hero';
    let cell=hero?frame.cell:kind==='master'?7:['yeonhwa','shop'].includes(kind)?8:9;
    if(hero&&e.swing>0&&frame.name==='S')cell=6;
    const flip=hero?frame.flip:(Math.cos(e.face??0)>.25),walk=e.walking?Math.sin(t*12):0;
    const swing=e.swing>0?Math.sin(Math.min(1,e.swing/.3)*Math.PI):0;
    c.save();c.translate(e.x,e.y);c.scale(scale,scale);oval(c,3,3,20,7,'#18271f62');
    if(kind==='chief')oval(c,0,2,27,9,'#a0573740');
    c.translate(0,-Math.abs(walk)*1.6);if(flip)c.scale(-1,1);
    c.rotate(walk*.018+(hero?swing*.035:0));if(e.flash>0)c.globalAlpha=.62;
    if(['chief','bandit','masked'].includes(kind))c.filter=kind==='chief'?'sepia(.35) saturate(1.7)':'saturate(.45) brightness(.85)';
    if(kind==='warden')c.filter='saturate(.35) brightness(.86)';
    // The soles stay anchored; opposing lower-body motion is separate from torso.
    const sx=cell*80,feet=hero?112:124,dw=80,dh=118,dx=-40,dy=-feet+9;
    if(e.walking&&hero){c.drawImage(images.sprites,sx,0,80,96,dx,dy,dw,88.5);c.save();c.translate(walk*1.1,0);c.drawImage(images.sprites,sx,96,80,32,dx,dy+88.5,dw,29.5);c.restore();}
    else c.drawImage(images.sprites,sx,0,80,128,dx,dy,dw,dh);
    c.filter='none';c.restore();
    if(hero&&swing>0){const a=e.face??0;c.save();c.translate(e.x,e.y-34*scale);c.rotate(a+swing*.8-.35);line(c,[[8,0],[48*scale,0]],'#ebe9d9',3);line(c,[[13,-5],[13,5]],'#b68b52',3);c.restore();}
  }
  function portrait(canvas,kind){
    canvas.dataset.portrait=kind;const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    c.clearRect(0,0,w,h);const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#d1c3a4');gradient.addColorStop(1,'#273b3b');c.fillStyle=gradient;c.fillRect(0,0,w,h);
    const key=kind==='shop'?'yeonhwa':kind==='bandit'?'hunter':kind,im=portraits[key];
    if(im?.complete&&im.naturalWidth){c.drawImage(im,0,0,w,h);const g=c.createLinearGradient(0,h*.75,0,h);g.addColorStop(0,'#12252e00');g.addColorStop(1,'#12252e8a');c.fillStyle=g;c.fillRect(0,h*.75,w,h*.25);}
    else {text(c,kind==='system'?'界':'…',w*.5,h*.6,'#e9ddb6',w*.32);}
  }
  function foliage(c,x,y,scale=1){
    const variant=Math.abs(Math.floor((x+y)/17))%3;
    if(!treeCache.has(variant)){
      const cv=document.createElement('canvas');cv.width=208;cv.height=227;const pc=cv.getContext('2d'),rnd=random(914+variant*37),cx=103,cy=205;
      oval(pc,cx+22,cy+3,71,20,'#20352642');
      poly(pc,[[cx-13,cy],[cx-7,cy-61],[cx-25,cy-108],[cx-15,cy-124],[cx+1,cy-87],[cx+26,cy-121],[cx+36,cy-110],[cx+13,cy-73],[cx+14,cy+2],[cx+4,cy+6]],'#80613e','#4c5135',2);
      line(pc,[[cx+3,cy-8],[cx+1,cy-58],[cx-14,cy-94]],'#bc9355',3);line(pc,[[cx+9,cy-36],[cx+17,cy-81],[cx+28,cy-100]],'#5d4e35',3);
      for(let i=0;i<24;i++){const an=i*2.4,r=Math.sqrt(rnd())*63,lx=cx+Math.cos(an)*r,ly=cy-126+Math.sin(an)*r*.7;oval(pc,lx+4,ly+10,22,17,'#34533799');}
      const colors=['#628344','#89a456','#b2bd75','#789b50','#a3b763'];
      for(let i=0;i<190;i++){const an=i*2.399,r=Math.sqrt(rnd())*75,lx=cx+Math.cos(an)*r,ly=cy-133+Math.sin(an)*r*.68,rr=8+rnd()*11;pc.save();pc.translate(lx,ly);pc.rotate(rnd()*1.8);const g=pc.createLinearGradient(0,-rr,0,rr);g.addColorStop(0,colors[i%5]);g.addColorStop(1,'#5b7b40');poly(pc,[[-rr,1],[-rr*.35,-rr*.65],[rr*.7,-rr*.45],[rr,1],[rr*.15,rr*.55]],g,'#395a3240',.6);line(pc,[[-rr*.75,1],[rr*.6,-1]],'#d4d39355',.7);pc.restore();}
      if(variant===1)for(let i=0;i<56;i++){const an=i*2.4,r=Math.sqrt(rnd())*64,xx=cx+Math.cos(an)*r,yy=cy-135+Math.sin(an)*r*.6;oval(pc,xx,yy,3.7,2.5,'#e4bcb9');oval(pc,xx+1,yy,1.1,1,'#f6d5b0');}
      treeCache.set(variant,cv);
    }
    c.drawImage(treeCache.get(variant),x-103*scale,y-205*scale,208*scale,227*scale);
  }
  function terrain(a){
    if(groundCache.has(a))return groundCache.get(a);
    const cv=document.createElement('canvas');cv.width=a.w;cv.height=a.h;const c=cv.getContext('2d'),outdoor=a.world==='무림',rnd=random(a.w*73+a.h+(a.theme||'').length);
    c.fillStyle=outdoor?'#809b60':'#748a7f';c.fillRect(0,0,a.w,a.h);
    const grass=texture(c,'grass');if(grass){c.globalAlpha=outdoor?.72:.13;c.fillStyle=grass;c.fillRect(0,0,a.w,a.h);c.globalAlpha=1;}
    // Soft brush masses break tile repetition and leave the travel corridor clear.
    for(let i=0;i<140;i++){const x=rnd()*a.w,y=rnd()*a.h,r=40+rnd()*110,g=c.createRadialGradient(x,y,5,x,y,r);g.addColorStop(0,i%3===0?'#dfdf9a30':'#2c573522');g.addColorStop(1,'#2c573500');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
    c.lineCap='round';c.lineJoin='round';
    for(const road of a.roads){line(c,road,outdoor?'#9a9c64':'#65786a',138);line(c,road,outdoor?'#b7a474':'#a6aea2',132);line(c,road,outdoor?'#d0b880':'#adb7ad',122);
      const stone=texture(c,'stone');if(stone){c.globalAlpha=.72;line(c,road,stone,110);c.globalAlpha=1;}
      for(let i=1;i<road.length;i++){const [ax,ay]=road[i-1],[bx,by]=road[i],d=Math.hypot(bx-ax,by-ay),an=Math.atan2(by-ay,bx-ax);for(let j=0;j<d;j+=14){const q=j/d,x=ax+(bx-ax)*q,y=ay+(by-ay)*q;for(const side of [-1,1]){const off=side*(59+rnd()*8),xx=x-Math.sin(an)*off,yy=y+Math.cos(an)*off;oval(c,xx,yy,2+rnd()*4,2+rnd()*3,outdoor?'#c8b584':'#a5b1a3');if(outdoor&&rnd()>.3)line(c,[[xx,yy+5],[xx-2,yy-3],[xx+2,yy+2],[xx+5,yy-1]],'#9db276',1);}}}
    }
    if(a.theme==='village')for(let yy=382;yy<549;yy+=24)for(let xx=575;xx<649;xx+=27){const x=xx+(Math.floor(yy/24)%2)*7,y=yy,shade=['#b6b39a','#c6bd9e','#a3aa91'][Math.floor(rnd()*3)];poly(c,[[x+3,y],[x+22,y-2],[x+28,y+10],[x+19,y+21],[x-2,y+17]],shade,'#8b8f7280',.8);line(c,[[x+3,y+1],[x+21,y]],'#e1d6b270',1);}
    if(a.theme==='city'){for(let i=0;i<8;i++)box(c,546+i*23,590,11,52,'#e3dec4bb',0);line(c,[[120,667],[1280,667]],'#c3b46b88',3);}
    if(a.theme==='harbor'){c.fillStyle='#416b78';c.fillRect(1385,0,115,a.h);for(let y=6;y<a.h;y+=22)line(c,[[1390,y],[1435,y+7],[1500,y-5]],'#b4d2be66',2);line(c,[[1383,0],[1383,a.h]],'#d6c6a1',7);}
    if(root.FateArt)FateArt.terrain(c,a);
    if(outdoor)for(let i=0;i<230;i++){const x=rnd()*a.w,y=rnd()*a.h;if(a.roads.some(r=>r.some(([rx,ry])=>Math.hypot(x-rx,y-ry)<160)))continue;oval(c,x,y,2.2,1.8,i%5?'#dfe2a983':'#ecd1c8');}
    const decorations=[];if(outdoor)for(let y=165;y<a.h-60;y+=195){decorations.push({x:55,y,scale:.82},{x:a.w-60,y:y+35,scale:.86});}
    const result={terrain:cv,decorations};if(ready())groundCache.set(a,result);return result;
  }
  function building(c,b,theme){
    const {x,y,w,h}=b;const modern=b.kind==='building';
    poly(c,[[x+15,y+h],[x+w,y+h-5],[x+w+65,y+h+35],[x+43,y+h+42]],'#152c2844');
    box(c,x+8,y+h*.24,w-16,h*.76,modern?'#a1aea4':'#dccba4',2);
    const wood=texture(c,'wood');c.save();c.globalAlpha=.5;c.fillStyle=wood||'#735739';for(let i=0;i<5;i++)c.fillRect(x+12+i*(w-34)/4,y+h*.25,8,h*.74);c.restore();
    for(let i=0;i<3;i++){const xx=x+25+i*(w-88)/2,yy=y+h*.48;box(c,xx-3,yy-3,38,38,'#594f41',1);box(c,xx,yy,32,31,modern?'#79989d':'#bebfa1',0);for(let q=7;q<31;q+=8){line(c,[[xx+q,yy],[xx+q,yy+31]],'#605d48',1);line(c,[[xx,yy+q],[xx+32,yy+q]],'#605d48',1);}}
    box(c,x+w*.42,y+h*.66,w*.18,h*.34,'#3b4238',1);box(c,x+w*.43,y+h*.7,w*.15,h*.30,'#736349',1);line(c,[[x+w*.51,y+h*.71],[x+w*.51,y+h]],'#352f24',2);
    const roof=[[x-20,y+h*.34],[x-2,y+15],[x+w*.5,y-46],[x+w+3,y+15],[x+w+23,y+h*.34],[x+w*.5,y+h*.23]];
    c.save();path(c,roof);c.clip();c.fillStyle='#374957';c.fillRect(x-24,y-65,w+60,h);
    const roofTex=texture(c,'roof');if(roofTex){c.globalAlpha=.76;c.fillStyle=roofTex;c.fillRect(x-24,y-65,w+60,h);c.globalAlpha=1;}
    for(let xx=x-25;xx<x+w+30;xx+=22)line(c,[[xx,y-40],[xx+7,y+h*.34]],'#a0adb04d',2);c.restore();
    line(c,[[x-21,y+h*.34],[x+w*.5,y+h*.23],[x+w+24,y+h*.34]],'#bbc6b4',3);line(c,[[x-2,y+15],[x+w*.5,y-46],[x+w+3,y+15]],'#92a193',4);
    if(b.kind==='temple'){poly(c,[[x+45,y-12],[x+w*.5,y-78],[x+w-45,y-12],[x+w*.5,y-28]],'#425460','#a2b39e',2);box(c,x+w*.37,y+h*.37,w*.26,24,'#283e39',1);text(c,'白 蓮 門',x+w*.5,y+h*.37+17,'#ecd9aa',13);}
    if(modern){box(c,x+w*.33,y+h*.34,w*.34,22,'#29414c',1);text(c,'해온 · HUNTER',x+w*.5,y+h*.34+15,'#d8e2d1',10);}
    for(const lx of [x+15,x+w-15]){line(c,[[lx,y+h*.4],[lx,y+h*.67]],'#534d39',2);oval(c,lx,y+h*.69,7,10,modern?'#b6d9d5':'#bd7851');line(c,[[lx-4,y+h*.66],[lx+4,y+h*.66]],'#f2d99c',1.5);}
    for(let i=0;i<3;i++)box(c,x+6-i*4,y+h+i*5,w-12+i*8,5,['#a8aa91','#c2bf9c','#929f8d'][i],1);
  }
  function prop(c,b,theme){
    if(b.kind==='ravine')return;
    if(b.kind==='tree'){foliage(c,b.x+b.w/2,b.y+b.h,1);return;}
    if(!['house','temple','building'].includes(b.kind)){legacyProp(c,b,theme);return;}
    const key=[b.kind,b.w,b.h,theme].join(':');if(!propCache.has(key)){const cv=document.createElement('canvas');cv.width=b.w+180;cv.height=b.h+200;building(cv.getContext('2d'),{...b,x:45,y:100},theme);if(ready())propCache.set(key,cv);c.drawImage(cv,b.x-45,b.y-100);}else c.drawImage(propCache.get(key),b.x-45,b.y-100);
  }
  function mechanism(c,o,t){
    if(o.kind==='mechanism'){box(c,o.x-22,o.y-28,44,32,'#6e573d',2);line(c,[[o.x-28,o.y+3],[o.x+30,o.y+3]],'#c8b17b',4);c.strokeStyle='#c5bc91';c.lineWidth=4;c.beginPath();c.arc(o.x,o.y-24,19,0,TAU);c.stroke();line(c,[[o.x-17,o.y-24],[o.x+17,o.y-24]],'#dfce9c',3);}
    else {oval(c,o.x,o.y,25,10,'#d7d9a73d');line(c,[[o.x-15,o.y+2],[o.x-4,o.y-19],[o.x+6,o.y-9],[o.x+17,o.y-30]],'#c4e0cf',3);}
  }
  function drawWorld(c,g,quality,t){
    if(g.area==='returnPass'){
      const restored=!!g.chapter4?.route,b=root.ChronicleRules.routeBarrier;
      box(c,755,410,40,670,'#293f44',0);line(c,[[757,412],[757,1080]],'#929f86',4);line(c,[[793,412],[793,1080]],'#b0b89c',4);
      for(let yy=425;yy<1080;yy+=28)line(c,[[763,yy],[774,yy+4],[787,yy-1]],'#77a89988',1.5);
      // A genuine solid obstruction before rescue; actual walkable bridge afterward.
      c.save();if(!restored){box(c,b.x-8,b.y-3,b.w+16,b.h+6,'#233e4399',4);for(let i=0;i<7;i++)line(c,[[b.x-3,b.y+15+i*30],[b.x+16,b.y+27+i*30],[b.x+b.w+3,b.y+14+i*30]],'#73c3b3',3);}
      else{box(c,730,b.y-2,84,b.h+4,'#584732',2);for(let y=b.y+2;y<b.y+b.h-4;y+=12){box(c,733,y,79,10,'#a08c64',1);line(c,[[735,y+2],[809,y+2]],'#dcc799',1);}line(c,[[736,b.y],[736,b.y+b.h]],'#d2cda3',3);line(c,[[810,b.y],[810,b.y+b.h]],'#d2cda3',3);text(c,'이어진 귀환로',772,b.y+b.h+28,'#f1e5b6',12);}
      const p=g.storyRuntime?.pulse;if(p?.wind>0&&!restored){const k=1-p.wind/p.max;c.fillStyle='#e97a6940';c.strokeStyle='#ffd19b';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,p.range,0,TAU);c.fill();c.stroke();c.fillStyle='#f9bc623f';c.beginPath();c.moveTo(p.x,p.y);c.arc(p.x,p.y,p.range,-Math.PI/2,-Math.PI/2+Math.max(0,k)*TAU);c.closePath();c.fill();text(c,'교각의 울림',p.x,p.y-28,'#fff4cc',12);}
      c.restore();
    }
    if(g.area==='returnDock'&&g.chapter4?.route&&g.chapter4.route!=='detour'){
      const u=root.ChronicleRules.aura,path=g.chapter4.route,col=DualWorld.Fate.PATHS[path].color;c.save();c.globalAlpha=.15;c.fillStyle=col;c.beginPath();c.ellipse(u.x,u.y,u.radius,u.radius*.7,0,0,TAU);c.fill();c.globalAlpha=.75;c.strokeStyle=col;c.lineWidth=2;c.stroke();text(c,root.ChronicleRules.label[path],u.x,u.y+u.radius*.7+18,'#e6edd3',12);c.restore();
    }
  }
  function cover(canvas){
    const rect=canvas.getBoundingClientRect(),d=Math.min(root.devicePixelRatio||1,2);canvas.width=Math.max(1,rect.width*d);canvas.height=Math.max(1,rect.height*d);const c=canvas.getContext('2d');c.scale(d,d);const a=DualWorld.AREAS.village,scene=terrain(a),s=Math.max(rect.width/a.w,rect.height/a.h);c.scale(s,s);c.drawImage(scene.terrain,0,0);for(const b of a.blocks)prop(c,b,'village');for(const b of scene.decorations)foliage(c,b.x,b.y,b.scale);human(c,{x:865,y:730,face:Math.PI/2},0,'hero',2.1);human(c,{x:1010,y:705,face:Math.PI},0,'master',1.6);
  }
  A.human=human;A.portrait=portrait;A.prop=prop;A.cover=cover;A.bamboo=foliage;C.terrain=terrain;C.spriteReady=()=>ready();
  // Old legend-echo used its captured blonde hero renderer; use the new atlas here.
  const legacyEffect=C.effect;C.effect=function(c,f,q){if(f.kind!=='legend-echo'){legacyEffect(c,f,q);return;}const k=Math.max(0,f.life/f.max);c.save();c.globalAlpha=k*.55;for(let i=0;i<(q?3:1);i++)human(c,{x:f.x+i*29,y:f.y-i*12,face:0},0,'hero',1.15);c.restore();};
  root.WuxiaArt={ready,loaded,human,portrait,terrain,prop,drawWorld,mechanism,cover};
})(window);
