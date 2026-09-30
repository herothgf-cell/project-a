'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'../art-runtime.js');
const load=()=>{assert.ok(fs.existsSync(file),'sprite runtime must exist');return require(file);};
test('walking animation advances one gait per fifty travelled pixels, not per wall-clock second',()=>{
 const R=load(),Art=require('../art-loader.js');
 for(const world of ['reality','murim']){
  const catalog=Art.createCatalog(require('../assets/art/'+world+'/hero/yunseo/candidate.json'));
  const frame=stride=>catalog.sample(R.query(world,'hero',{face:0,walking:true,motion:{stride}},999),{preview:true}).frameIndex;
  assert.equal(frame(0),0);assert.equal(frame(25),3);assert.equal(frame(50),0);
  const e={face:0,walking:true,motion:{stride:25}};
  assert.equal(R.query(world,'hero',e,1).elapsed,R.query(world,'hero',e,900).elapsed);
 }
});
test('sprite queries keep world, entity, facing and the original action clock',()=>{
 const R=load(),e={x:10,y:20,face:Math.PI,walking:true,motion:{stride:43,instance:{actionId:'player-4',action:'attack',combo:2,angle:Math.PI/4,startedAt:2,duration:.3}}};
 const q=R.query('reality','hero',e,2.1);assert.equal(q.world,'reality');assert.equal(q.entityId,'hero');assert.equal(q.action,'attack2');assert.equal(q.facing,'se');assert.ok(Math.abs(q.elapsed-.1)<1e-8);assert.equal(q.loop,false);
 const walking=R.query('murim','hero',e,3);assert.equal(walking.action,'walk');assert.equal(walking.facing,'w');assert.equal(walking.elapsed,43*.72/50);assert.equal(walking.loop,true);
 e.walking=false;assert.equal(R.query('murim','master',e,3).action,'idle');
});
test('every martial input selects an explicit whole-body action and never an idle substitute',()=>{
 const R=load();
 for(const [action,input,want]of [['moon','moon','attack3'],['ripple','signature1','cast'],['ripple','signature2','attack2'],['echo','signature1','dodge'],['echo','signature2','attack1'],['seal','signature1','cast'],['seal','signature2','cast'],['ultimate-ripple','ultimate','attack3'],['ultimate-echo','ultimate','attack3'],['ultimate-seal','ultimate','cast']]){
  const q=R.query('reality','hero',{motion:{instance:{action,input,angle:0,startedAt:1,duration:.58}}},1.1);
  assert.equal(q.action,want);assert.equal(q.semanticAction,action);assert.ok(Math.abs(q.elapsed-.1)<1e-8);
 }
});
test('sprite feet and socket coordinates share exactly the drawn frame transform',()=>{
 const R=load(),v={frame:{rect:[200,100,100,200],pivot:[.5,.9],sockets:{hand:[70,100],blade:[90,70]}}};
 const p=R.placement(v,{x:400,y:500},100);
 assert.deepEqual(p.destination,[375,410,50,100]);assert.deepEqual(p.sockets.hand,{x:410,y:460});assert.deepEqual(p.sockets.blade,{x:420,y:445});
});
test('released sprite effects keep their action while sampling terminal frames after recovery',()=>{
 const R=load(),e={face:0,motion:{instance:{actionId:'player-1',action:'attack',combo:1,angle:Math.PI/4,startedAt:4,duration:.3}}};
 const body=R.query('murim','hero',e,4.6),effect=R.query('murim','hero',e,4.6,{linger:true});
 assert.equal(body.action,'idle');assert.equal(effect.action,'attack1');assert.equal(effect.facing,'se');assert.equal(effect.loop,false);assert.ok(Math.abs(effect.elapsed-.6)<1e-8);
});
test('storm body selects a cast clip without changing its authoritative action identity or clock',()=>{
 const e={motion:{instance:{actionId:'player-9',action:'storm',startedAt:4,duration:.3,angle:Math.PI/4}}};
 const q=load().query('reality','hero',e,4.15);
 assert.equal(q.action,'cast');assert.equal(q.semanticAction,'storm');assert.ok(Math.abs(q.elapsed-.15)<1e-8);assert.equal(e.motion.instance.action,'storm');
});
test('hit reaction fills an idle body but does not desynchronize an active attack or its released effect',()=>{
 const e={face:Math.PI/4,motion:{reaction:{action:'hit',startedAt:2,duration:.18,angle:Math.PI/4}}},R=load();
 assert.equal(R.query('murim','hero',e,2.05).action,'hit');assert.equal(R.query('murim','hero',e,2.2).action,'idle');
 e.motion.instance={action:'attack',combo:2,startedAt:1.9,duration:.3,angle:Math.PI/4};
 assert.equal(R.query('murim','hero',e,2.05).action,'attack2');
 assert.equal(R.query('murim','hero',e,2.5,{linger:true}).action,'attack2');
});
