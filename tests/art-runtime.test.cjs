'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'../art-runtime.js');
const load=()=>{assert.ok(fs.existsSync(file),'sprite runtime must exist');return require(file);};
test('sprite queries keep world, entity, facing and the original action clock',()=>{
 const R=load(),e={x:10,y:20,face:Math.PI,walking:true,motion:{stride:43,instance:{actionId:'player-4',action:'attack',combo:2,angle:Math.PI/4,startedAt:2,duration:.3}}};
 const q=R.query('reality','hero',e,2.1);assert.equal(q.world,'reality');assert.equal(q.entityId,'hero');assert.equal(q.action,'attack2');assert.equal(q.facing,'se');assert.ok(Math.abs(q.elapsed-.1)<1e-8);assert.equal(q.loop,false);
 const walking=R.query('murim','hero',e,3);assert.equal(walking.action,'walk');assert.equal(walking.facing,'w');assert.equal(walking.elapsed,.2);assert.equal(walking.loop,true);
 e.walking=false;assert.equal(R.query('murim','master',e,3).action,'idle');
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
