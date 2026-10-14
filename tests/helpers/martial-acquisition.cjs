const assert=require('node:assert/strict'),A=require('../../martial-acquisition.js'),T=require('../../martial-training.js');
function acquire(g,f){
 if(!T.owns(g,'flow',T.catalog[f].recipe[2])){
  A.startFlow(g,f);const e=g.enemies[0];
  for(let i=0;i<3;i++){
   Object.assign(g.player,{x:720,y:800,face:-Math.PI/2,invuln:0,dash:0,mp:g.stats().mp});for(const k in g.player.cool)g.player.cool[k]=0;
   Object.assign(e,{x:805,y:800,hp:e.maxHp,wind:.15,cd:99,tx:720,ty:800,range:65,pattern:'strike',telegraph:{x:805,y:800,tx:720,ty:800,width:24}});e.attacks++;
   if(f==='seal')assert(g.act('storm'));else{assert(g.act('dash'));for(let n=0;n<5;n++){g.hitStop=0;g.step(.05);}if(f==='ripple'){g.player.face=Math.atan2(e.y-g.player.y,e.x-g.player.x);assert(g.act('moon'));}}
  }
  assert(T.owns(g,'flow',T.catalog[f].recipe[2]));A.stop(g);
 }
 if(!T.owns(g,'intent',T.catalog[f].recipe[3])){
  if(T.state(g).quests[f]!=='ready'){A.startQuest(g,f);for(const e of g.enemies){g.player.x=e.x-40;g.player.y=e.y;g.player.face=0;let n=0;while(e.hp>0&&n++<50){g.player.cool.moon=0;g.player.mp=g.stats().mp;assert(g.act('moon'));}}for(const p of A.points(g)){Object.assign(g.player,{x:p.x,y:p.y});g.interact();}assert.equal(T.state(g).quests[f],'ready');A.stop(g);}
  A.reportQuest(g,f);
 }
 g.enter('village');
}
module.exports={acquire};
