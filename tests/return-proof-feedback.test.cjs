'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Reality=require('../reality-skills.js');
const {inherited,opponent}=require('./world-fixtures.cjs');
function absorb(g,e){g.player.invuln=0;assert.equal(g.act('signature1'),true);g.takeHit(e);}

test('response readiness distinguishes charge, cooldown and resources without mutating state',()=>{
 const g=inherited(),e=opponent(g);absorb(g,e);g.player.cool.signature2=2;g.player.mp=0;
 const before=structuredClone({state:g.worldState,runtime:g.realityRuntime,player:g.player});
 assert.equal(typeof Reality.readiness,'function');
 const view=Reality.readiness(g,'signature2');
 assert.equal(view.charged,true);assert.equal(view.boostRemaining,4);assert.equal(view.canUse,false);assert.equal(view.reason,'cooldown');
 assert.deepEqual({state:g.worldState,runtime:g.realityRuntime,player:g.player},before);
 g.player.cool.signature2=0;assert.equal(Reality.readiness(g,'signature2').reason,'resource');
});
test('reading a locked response does not create a reality runtime or permanent state',()=>{
 const g=inherited();delete g.worldState.reality;g.realityRuntime=null;g.worldGrowth.reality.equipped=null;
 assert.equal(typeof Reality.readiness,'function');const before=structuredClone(g.worldState);
 assert.equal(Reality.readiness(g,'signature2').reason,'locked');assert.deepEqual(g.worldState,before);assert.equal(g.realityRuntime,null);
});
test('manual attack consumes a stored impact once and clears the follow-up opportunity immediately',()=>{
 const g=inherited(),e=opponent(g);absorb(g,e);g.legendRuntime.manual=true;g.strike(e,10,'attack');
 assert.equal(typeof Reality.readiness,'function');assert.equal(Reality.readiness(g,'signature2').charged,false);
 assert.equal(g.realityRuntime.lastResponse.kind,'consumed');assert.equal(g.realityRuntime.lastResponse.consumer,'attack');
 const remaining=e.hp;g.strike(e,10,'attack');assert.equal(remaining-e.hp,10);
});
test('an attempted hit on an already defeated target does not consume a valid boost',()=>{
 const g=inherited(),e=opponent(g);absorb(g,e);e.hp=0;g.legendRuntime.manual=true;g.strike(e,10,'attack');
 assert.ok(g.realityRuntime.boost,'no contact occurred');
});
test('boost expires on the simulation boundary and cannot be consumed twice',()=>{
 const g=inherited(),e=opponent(g);absorb(g,e);assert.equal(typeof Reality.readiness,'function');
 g.playTime+=3.99;assert.equal(Reality.readiness(g,'signature2').charged,true);
 g.playTime+=.01;assert.equal(Reality.readiness(g,'signature2').charged,false);Reality.step(g);
 assert.equal(g.realityRuntime.lastResponse.kind,'expired');assert.equal(Reality.consumeBoost(g,'signature2'),null);
});
test('empty absorption reports waiting ended, while invulnerability never proves absorption',()=>{
 const g=inherited(),e=opponent(g);g.act('signature1');g.player.invuln=1;g.takeHit(e);g.playTime+=.7;Reality.step(g);
 assert.equal(g.realityRuntime.lastResponse?.kind,'waiting-ended');assert.equal(g.realityStatus('ripple'),'available');assert.equal(g.realityRuntime.boost,null);
});
test('real manual effects produce one response stop and duplicate effects cannot retrigger it',()=>{
 const g=inherited(),e=opponent(g);absorb(g,e);assert.equal(g.hitStop,.06);
 g.hitStop=0;assert.equal(Reality.onEffect(g,{id:1,family:'ripple',manual:true,action:'signature1'},e,'absorb'),false);assert.equal(g.hitStop,0);
});
test('reduced effects and held input do not trigger the new response stop',()=>{
 for(const held of [false,true]){const g=inherited(),e=opponent(g);g.responseReduced=!held;g.act('signature1',held);g.takeHit(e);assert.equal(g.hitStop,0);}
});
test('hit stop keeps response lifetime and cooldown on the same simulation clock',()=>{
 const g=inherited(),e=opponent(g);absorb(g,e);const at=g.playTime,until=g.realityRuntime.boost.until,cool=g.player.cool.signature1;
 assert.equal(g.hitStop,.06);g.step(.05);assert.equal(g.playTime,at);assert.equal(g.realityRuntime.boost.until,until);assert.equal(g.player.cool.signature1,cool);
});
test('combat hint uses the current key mapping and separates stored power from availability',()=>{
 let UI;try{UI=require('../return-proof-ui.js');}catch{}
 assert.equal(typeof UI?.combatView,'function');
 const g=inherited(),e=opponent(g);absorb(g,e);g.player.cool.signature2=2;
 const view=UI.combatView(g,a=>a==='signature2'?'O':'U');
 assert.match(view.text,/보관 충격/);assert.match(view.text,/O.*2\.0/);assert.equal(view.ready,false);
 g.player.cool.signature2=0;assert.equal(UI.combatView(g,()=> 'O').ready,true);
});
