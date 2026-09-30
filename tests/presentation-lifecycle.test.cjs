'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../chapter-five.js'),P=require('../presentation.js');
const {g0,experiment}=require('./helpers/journey.cjs');
test('enemy attack presentation starts at actual impact, not at windup counter increment',()=>{
 const A=require('../art-runtime.js'),g=new Game();g.progress=2;g.training=1;g.enter('forest');g.events=[];
 const e=g.enemies[0];g.enemies=[e];Object.assign(g.player,{x:850,y:700,invuln:5});Object.assign(e,{x:890,y:700,wind:.02,windMax:.85,tx:850,ty:700,range:62,pattern:'strike',cd:0,attacks:1});
 const before=g.player.hp;g.step(.05);
 assert.equal(e.motion.enemyAttackAt,g.playTime);assert.equal(A.enemyQuery('murim',e,g.playTime).action,'attack');assert.equal(g.player.hp,before);
 const at=e.motion.enemyAttackAt;g.step(.05);assert.equal(e.motion.enemyAttackAt,at);assert.equal(A.enemyQuery('murim',e,at+.41).action,'idle');
 assert.ok(!g.save().includes('enemyAttackAt'));
});
function replay(){const g=g0('echo');experiment(g,'echo','replay');g.chooseInterpretation('echo-replay');g.enter('forest');g.player.mp=500;g.player.face=Math.PI/4;return g;}

test('enemy facing follows real displacement then locks windup, contact and lethal pose',()=>{
 const g=new Game();g.progress=2;g.training=1;g.enter('forest');g.events=[];const e=g.enemies[0];g.enemies=[e];
 Object.assign(e,{x:850,y:700,cd:99,wind:0});Object.assign(g.player,{x:750,y:600,invuln:10});g.step(.05);
 assert.ok(Math.abs(e.motion.enemyFacing+3*Math.PI/4)<.001);
 Object.assign(e,{wind:.02,windMax:.85,tx:e.x+30,ty:e.y+30,range:62,pattern:'strike'});g.step(.05);
 assert.ok(Math.abs(e.motion.enemyAttackAngle-Math.PI/4)<.001);
 g.strike(e,999999);assert.equal(e.motion.enemyDeathAngle,e.motion.enemyAttackAngle);
 assert.ok(!g.save().includes('enemyFacing'));
});
test('echo freezes its complete emission pose independently of the live body',()=>{
 const g=replay();assert.equal(g.act('signature1'),true);const echo=g.combat.echo,s=P.echoPose(echo);
 assert.ok(s);assert.ok(Object.isFrozen(echo.presentation));assert.equal(s.face,Math.PI/4);
 g.player.face=-Math.PI/2;g.player.x+=40;g.player.motion.instance=null;
 assert.deepEqual(P.echoPose(echo),s);assert.equal(s.x,echo.x);assert.equal(s.y,echo.y);
 const first=P.pose(s,g.playTime),late=P.pose(s,g.playTime+4);
 for(const p of [first,late])for(const n of [p.foot,p.bob,p.lean,p.hand.x,p.hand.y,p.tip.x,p.tip.y])assert.ok(Number.isFinite(n));
 assert.deepEqual(late,first,'procedural/BLOCKED_ART fallback must also freeze pose');
 assert.ok(!g.save().includes('presentation'));
});
test('echo replay separates preparation from delayed contact and keeps original action identity',()=>{
 const g=replay();Object.assign(g.player,{x:850,y:700});assert.equal(g.act('signature1'),true);g.player.dash=0;
 assert.equal(g.act('signature2'),true);const a=g.player.motion.instance,prep=g.fx.find(f=>f.kind==='interpret-echo-replay');
 assert.equal(prep.presentationPhase,'prepare');g.player.face=-1;
 for(let i=0;i<12;i++){g.hitStop=0;g.step(.05);}
 const hit=g.fx.find(f=>f.kind==='interpret-echo-replay'&&f.presentationPhase==='contact');
 assert.ok(hit);assert.equal(hit.actionInstance,a);assert.equal(hit.presentationAngle,Math.PI/4);
});
test('death clock starts once at actual lethal damage and expires without touching rewards',()=>{
 const g=new Game();g.progress=2;g.training=1;g.enter('forest');const e=g.enemies[0];g.strike(e,999999);
 const at=e.motion?.deathAt;assert.equal(at,g.playTime);assert.equal(P.deathVisible(e,at+.5),true);assert.equal(P.deathVisible(e,at+1.3),false);
 const gold=g.gold;g.strike(e,1);assert.equal(e.motion.deathAt,at);assert.equal(g.gold,gold);
});
test('seal hold only emits binding at a real telegraphed target',()=>{
 const g=g0('seal');experiment(g,'seal','hold');g.chooseInterpretation('seal-hold');g.enter('forest');g.player.mp=500;
 const e=g.enemies[0];g.enemies=[e];Object.assign(g.player,{x:850,y:700});Object.assign(e,{x:895,y:700,hp:4000,maxHp:4000,wind:0,cd:99});
 g.act('signature1');assert.equal(g.fx.find(f=>f.kind==='interpret-seal-hold').presentationPhase,'field');
 g.fx=[];g.player.cool.signature1=0;e.wind=.7;g.act('signature1');const f=g.fx.find(f=>f.kind==='interpret-seal-hold');
 assert.equal(f.presentationPhase,'bind');assert.equal(f.x,e.x);assert.equal(f.y,e.y);assert.ok(e.root>0);
});
test('travel discards delayed presentation together with the authoritative pending hit',()=>{
 const g=replay();g.act('signature1');g.act('signature2');assert.ok(g.experimentRuntime.pending[0].actionInstance);
 g.enter('city');for(let i=0;i<12;i++){g.hitStop=0;g.step(.05);}
 assert.equal(g.fx.some(f=>f.kind==='interpret-echo-replay'&&f.presentationPhase==='contact'),false);
});
