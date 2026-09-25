/* V0.4 visual language. Pure Canvas drawing; never changes simulation state. */
(function(root){
  'use strict';
  const {TAU,ellipse,line,polygon,box,text,human,random}=WorldArt;
  const colors={ripple:'#f3cd81',echo:'#b8a7ff',seal:'#78e8d3'};
  function ring(c,x,y,r,col,width=1){c.beginPath();c.ellipse(x,y,r,r*.48,0,0,TAU);c.strokeStyle=col;c.lineWidth=width;c.stroke();}
  function rune(c,x,y,r,col,time=0,count=8){
    ring(c,x,y,r,col,1.6);ring(c,x,y,r*.88,col+'70');
    for(let i=0;i<count;i++){const a=i*TAU/count+time,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.48;c.save();c.translate(xx,yy);c.rotate(a);polygon(c,[[-4,0],[0,-7],[4,0],[0,7]],col);c.restore();}
  }
  function terrain(c,a){
    const rng=random(490);c.save();const outdoor=a.world==='무림';
    for(let i=0;i<100;i++){
      const x=40+rng()*(a.w-80),y=60+rng()*(a.h-120);
      if(outdoor){line(c,[[x,y],[x+15,y+8],[x+8,y+17]],'#0b2d2538');for(let j=0;j<3;j++)ellipse(c,x+j*5,y,2.5,1,'#b5b79538');}
      else{box(c,x,y,26,2,'#bcdfea12',0);box(c,x,y,2,18,'#152f3950',0);}
    }
    for(const b of a.blocks){
      if(['building','house','temple'].includes(b.kind)){
        const modern=b.kind==='building',col=modern?'#77cfd933':'#ffd19728';
        const glow=c.createRadialGradient(b.x+b.w/2,b.y+b.h+12,0,b.x+b.w/2,b.y+b.h+12,145);glow.addColorStop(0,col);glow.addColorStop(1,modern?'#77cfd900':'#ffd19700');c.fillStyle=glow;c.fillRect(b.x-100,b.y+b.h-150,b.w+200,300);
        for(let i=0;i<6;i++)line(c,[[b.x+18+i*13,b.y+b.h+16+i*7],[b.x+b.w-18-i*11,b.y+b.h+16+i*7]],modern?'#78bdc72b':'#c5c09820',2);
      }
    }
    if(a.theme==='sanctum'){
      ellipse(c,755,670,460,268,'#092a3566');rune(c,755,670,380,'#c7bb8c65',0,12);rune(c,755,670,300,'#8baec353',.13,12);rune(c,755,670,205,'#8baec348');
      for(const [path,x,y]of [['ripple',470,580],['echo',760,420],['seal',1050,580]]){line(c,[[755,730],[x,y]],colors[path]+'65',2);rune(c,x,y,62,colors[path]+'8a',0,6);}
      text(c,'無 名',755,670,'#dcd3b229',90);text(c,'정해진 이름이 없는 곳',755,972,'#b9c9c25c',16);
      for(let i=0;i<12;i++){const x=330+i*73;box(c,x,1010,44,8,'#9fae9a33',2);}
    }
    if(a.theme==='heart'){
      const x=1280,y=230;ellipse(c,x,y,190,138,'#070f2780');rune(c,x,y,220,'#ce9eba78',0,10);rune(c,x,y,150,'#ddaab967',.1,10);
      for(let i=0;i<18;i++){const an=i*TAU/18;line(c,[[x+Math.cos(an)*80,y+Math.sin(an)*60],[x+Math.cos(an+.1)*170,y+Math.sin(an)*120],[x+Math.cos(an)*290,y+Math.sin(an)*215]],'#ba7eae58',2);}
      text(c,'경계 오염 구역',780,966,'#d0adb865',18);
    }
    c.restore();
  }
  function relic(c,o,t,proven){
    const col=colors[o.path];c.save();const glow=c.createRadialGradient(o.x,o.y-40,0,o.x,o.y-40,95);glow.addColorStop(0,col+'30');glow.addColorStop(1,col+'00');c.fillStyle=glow;c.fillRect(o.x-95,o.y-130,190,190);
    ellipse(c,o.x,o.y+7,34,14,'#061b2b99');polygon(c,[[o.x-25,o.y],[o.x-18,o.y-22],[o.x+18,o.y-22],[o.x+25,o.y],[o.x,o.y+11]],'#506475','#bdc7b0');
    rune(c,o.x,o.y+6,43,col+'a0',t*.2,6);const bob=Math.sin(t*2)*3;
    if(o.path==='ripple'){line(c,[[o.x-10,o.y-30+bob],[o.x+9,o.y-71+bob]],'#f4e2b1',5);line(c,[[o.x-16,o.y-45+bob],[o.x+8,o.y-37+bob]],col,3);polygon(c,[[o.x+10,o.y-75],[o.x+20,o.y-100],[o.x+17,o.y-73]],'#fff1c2');}
    else if(o.path==='echo'){for(let i=0;i<3;i++){c.globalAlpha=.4+i*.2;ellipse(c,o.x-14+i*14,o.y-41-i*18+bob,6,12,col);}}
    else {polygon(c,[[o.x-15,o.y-74+bob],[o.x+15,o.y-74+bob],[o.x+11,o.y-29+bob],[o.x-11,o.y-29+bob]],'#b4d1b4',col);text(c,'結',o.x,o.y-43+bob,'#225e62',21);}
    c.globalAlpha=1;if(proven)text(c,'증명',o.x,o.y+32,col,12);c.restore();
  }
  function ground(c,g,q,t){
    const combat=g.combat;
    if(combat.field){const f=combat.field,col=colors.seal;c.save();ellipse(c,f.x,f.y,f.radius,f.radius,'#42c7bd14');c.strokeStyle=col+'a0';c.lineWidth=2;c.beginPath();c.arc(f.x,f.y,f.radius,0,TAU);c.stroke();rune(c,f.x,f.y,f.radius,col+'a0',t*.1,8);if(q>0)rune(c,f.x,f.y,f.radius*.6,col+'60',-t*.14);c.restore();}
    if(combat.echo){const e=combat.echo;c.save();c.globalAlpha=.25+Math.sin(t*4)*.06;human(c,{x:e.x,y:e.y,face:e.face,walking:false},0,'hero',1.15);c.globalAlpha=.7;ring(c,e.x,e.y+3,30,colors.echo);text(c,'R · 귀환',e.x,e.y-88,colors.echo,10);c.restore();}
    const col=colors[g.trial?.path||g.fate.path];if(col){ring(c,g.player.x,g.player.y+3,25,col+'70');if(combat.parry>0){c.save();c.strokeStyle=colors.ripple;c.lineWidth=3;c.beginPath();c.arc(g.player.x,g.player.y-25,43,-2.9,.8);c.stroke();c.restore();}}
    if(q>0&&g.area==='sanctum')for(let i=0;i<(q>1?16:7);i++){const an=i*2.399+t*.08;ellipse(c,755+Math.cos(an)*310,650+Math.sin(an)*150-Math.sin(t+i)*10,1.4,2,'#dfdab68a');}
  }
  function costume(c,g,t){
    const p=g.player,path=g.trial?.path||g.fate.path,col=colors[path]||'#d2c29d';
    c.save();c.translate(p.x,p.y);const flutter=Math.sin(t*7)*(p.walking?8:2);
    polygon(c,[[-7,-38],[-17,-22],[-29-flutter,-8],[-17,-13],[-8,-26]],'#152b42',col+'8a');line(c,[[-12,-27],[-21-flutter,-12]],col+'a0',1.5);
    const theta=p.face;c.save();c.translate(18,-22);c.rotate(theta);line(c,[[3,0],[48,0]],col,2);line(c,[[6,-2],[38,-2]],'#fff8dd',1);c.restore();
    if(path==='ripple'){polygon(c,[[-16,-39],[-26,-31],[-18,-26],[-10,-34]],'#806b45',col);line(c,[[-11,-22],[9,-22]],col,2);}
    if(path==='echo'){for(let i=0;i<2;i++)line(c,[[-8-i*6,-38],[-24-i*8-flutter,-26],[-32-i*10-flutter,-11]],col+(i?'55':'bb'),2);}
    if(path==='seal'){for(let i=0;i<3;i++){const x=-14+i*15,y=-15+Math.sin(t*2+i)*3;polygon(c,[[x,y],[x+7,y],[x+5,y+17],[x-2,y+17]],'#afdacc',col);line(c,[[x+1,y+4],[x+4,y+9],[x,y+13]],'#28665b',1);}}
    c.restore();
  }
  function effect(c,f,q){
    if(!f.kind.startsWith('fate-'))return;const k=Math.max(0,f.life/f.max),t=1-k,col=colors[f.path]||colors.echo;c.save();c.globalAlpha=Math.min(1,k*2);
    if(f.kind==='fate-guard'||f.kind==='fate-parry'){
      const parry=f.kind==='fate-parry',r=parry?35+t*140:45;ring(c,f.x,f.y,r,col,parry?4*k:2);if(q>0)ring(c,f.x,f.y,r*.7,'#fff3cf',2);
      if(parry)for(let i=0;i<(q>0?12:5);i++){const an=i*TAU/12;line(c,[[f.x+Math.cos(an)*r*.5,f.y-20+Math.sin(an)*r*.4],[f.x+Math.cos(an)*r,f.y-20+Math.sin(an)*r*.7]],col,2*k);}
    }
    if(f.kind==='fate-wave'){
      c.translate(f.x,f.y-23);c.rotate(f.angle||0);const r=(f.range||230)*(.65+t*.35);c.beginPath();c.arc(0,0,r,-1.2,1.2);c.strokeStyle=col;c.lineWidth=8*k+1;c.stroke();c.strokeStyle='#fff9e6';c.lineWidth=2;c.stroke();if(q>0){c.globalAlpha=k*.22;c.lineWidth=23;c.stroke();}
    }
    if(f.kind==='fate-trail'||f.kind==='fate-link'){
      const tx=f.tx??f.x+Math.cos(f.angle)*110,ty=f.ty??f.y+Math.sin(f.angle)*110;line(c,[[f.x,f.y-20],[tx,ty-20]],col+'99',3);if(q>0)for(let i=0;i<3;i++){c.globalAlpha=k*(.13+i*.07);human(c,{x:f.x+(tx-f.x)*i/3,y:f.y+(ty-f.y)*i/3,face:f.angle??0},0,'hero',1.15);}
    }
    if(f.kind==='fate-seal')rune(c,f.x,f.y,(f.range||165)*(.5+t*.5),col,t,8);
    if(f.kind==='fate-chain'){
      line(c,[[f.x,f.y-25],[f.tx,f.ty-25]],col,2);for(let i=0;i<(q>0?9:3);i++){const u=i/9,x=f.x+(f.tx-f.x)*u,y=f.y+(f.ty-f.y)*u-25;polygon(c,[[x-4,y],[x,y-7],[x+4,y],[x,y+7]],null,col,1.5);}ring(c,f.tx,f.ty,28+Math.sin(t*8)*5,col,2);
    }
    if(f.kind==='fate-ultimate'){
      const r=70+t*(f.range||310);c.globalAlpha=k*.45;
      if(f.path==='ripple'){for(let i=0;i<(q>0?4:2);i++)ring(c,f.x,f.y,r-i*22,col,3);c.globalAlpha=k;line(c,[[f.x-r,f.y+r*.4],[f.x+r,f.y-r*.4]],'#fff2c9',6*k);}
      if(f.path==='echo'){for(let i=0;i<3;i++){const a=i*TAU/3,x=f.x+Math.cos(a)*r*.65,y=f.y+Math.sin(a)*r*.4;line(c,[[x-r*.5,y-60],[x+r*.5,y+45]],col,4*k);if(q>0)human(c,{x,y,face:a+Math.PI},t,'hero',1.25);}ring(c,f.x,f.y,r,col,2);}
      if(f.path==='seal'){rune(c,f.x,f.y,r,col,t*.2,12);rune(c,f.x,f.y,r*.62,col,-t*.2,6);for(let i=0;i<6;i++){const a=i*TAU/6,x=f.x+Math.cos(a)*r*.7,y=f.y+Math.sin(a)*r*.35;line(c,[[x,y],[x,y-85*k]],col,3);text(c,'封',x,y-90*k,col,21);}}
    }
    c.restore();
  }
  function atmosphere(c,g,camera,w,h,q,t){
    if(q<=0)return;c.save();const modern=g.area==='city'||g.area==='harbor'||g.area==='heart';
    if(modern){for(let i=0;i<(q>1?25:10);i++){const x=camera.x+(i*113+t*19)%w,y=camera.y+(i*79+t*175)%h;line(c,[[x,y],[x-3,y+15]],'#c2dde31b',1);}}
    else {for(let i=0;i<3;i++){const x=camera.x+w*(.15+i*.35)+Math.sin(t*.13+i)*25,y=camera.y+h*(.4+i*.16);ellipse(c,x,y,w*.3,22,'#cbd1b207');}}
    c.restore();
  }
  function overlay(c,g,w,h,q){
    const f=g.fx.find(f=>f.kind==='fate-ultimate');if(!f||q<=0)return;const col=colors[f.path];c.save();const k=Math.min(.25,f.life/f.max*.2),gr=c.createLinearGradient(0,0,w,0);gr.addColorStop(0,col);gr.addColorStop(.22,col+'00');gr.addColorStop(.78,col+'00');gr.addColorStop(1,col);c.globalAlpha=k;c.fillStyle=gr;c.fillRect(0,0,w,h);c.restore();
  }
  root.FateArt={terrain,relic,ground,costume,effect,atmosphere,overlay,colors};
})(globalThis);
