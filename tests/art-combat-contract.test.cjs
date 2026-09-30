'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
require('../chapter-five.js');const P=require('../presentation.js'),A=require('../art-runtime.js');
const {g0,experiment}=require('./helpers/journey.cjs');
function fixture(path,mode){const g=g0(path);if(mode){experiment(g,path,mode);g.chooseInterpretation(path+'-'+mode);}g.enter('forest');g.events=[];g.hitStop=0;Object.assign(g.player,{x:850,y:700,face:0,mp:500,invuln:0});const e=g.enemies[0];g.enemies=[e];Object.assign(e,{x:895,y:700,hp:5000,maxHp:5000,wind:0,cd:999,damage:30});return {g,e};}
test('failed and expired parry never emit successful parry artwork',()=>{
 const {g,e}=fixture('ripple');g.act('signature1');g.combat.parry=0;g.fx=[];g.takeHit(e);
 assert.equal(g.fx.some(f=>f.kind==='fate-parry'),false);
 g.player.invuln=0;g.player.cool.signature1=0;g.act('signature1');g.fx=[];const hp=g.player.hp;g.takeHit(e);
 assert.equal(g.player.hp,hp);assert.equal(g.fx.filter(f=>f.kind==='fate-parry').length,1);
});
for(const mode of ['return','replay'])test(`echo ${mode} without an anchor emits no action/teleport/contact`,()=>{
 const {g}=fixture('echo',mode),before={x:g.player.x,y:g.player.y,mp:g.player.mp,motion:g.player.motion.instance};g.fx=[];g.combat.echo=null;
 assert.equal(g.act('signature2'),false);assert.equal(g.player.x,before.x);assert.equal(g.player.y,before.y);assert.equal(g.player.mp,before.mp);assert.equal(g.player.motion.instance,before.motion);assert.deepEqual(g.fx,[]);
});
test('seal guide without a telegraphed victim does not claim conditional impact',()=>{
 const {g}=fixture('seal','guide');g.act('signature2');const f=g.fx.find(f=>f.kind==='interpret-seal-guide');
 assert.ok(f);assert.equal(f.presentationPhase,'field');assert.equal(A.effectQuery(f).action,'cell-0');
});
test('hit-stop freezes body and attached effect together; dropped frames never repeat damage',()=>{
 const {g,e}=fixture('ripple');g.act('attack');const effect=g.fx.find(f=>f.kind==='slash'),hp=e.hp;
 const body=A.query('murim','hero',g.player,g.playTime),pose=P.effectPose(effect,g.playTime);g.hitStop=.2;g.step(.04);
 assert.deepEqual(A.query('murim','hero',g.player,g.playTime),body);assert.deepEqual(P.effectPose(effect,g.playTime),pose);assert.equal(e.hp,hp);
 g.hitStop=0;g.step(.5);assert.equal(e.hp,hp);assert.equal(A.query('murim','hero',g.player,g.playTime).elapsed,g.playTime-effect.actionInstance.startedAt);
});
test('delayed replay remains anchored and fires exactly once after hit-stop and large dt',()=>{
 const {g,e}=fixture('echo','replay');g.combat.echo={x:895,y:700,life:4};const origin={x:g.player.x,y:g.player.y};g.act('signature2');const pending=g.experimentRuntime.pending[0],instance=pending.actionInstance,hp=e.hp;g.hitStop=.2;g.step(.04);
 assert.equal(pending.delay,.45);assert.equal(e.hp,hp);g.player.face=2;
 for(let i=0;i<30;i++){g.hitStop=0;g.step(.2);}
 assert.equal(g.player.x,origin.x);assert.equal(g.player.y,origin.y);assert.equal(g.experimentRuntime.pending.length,0);assert.equal(hp-e.hp,Math.round(g.stats().attack*3.3));assert.equal(instance.angle,0);
 const after=e.hp;for(let i=0;i<10;i++){g.hitStop=0;g.step(.2);}assert.equal(e.hp,after);
});
