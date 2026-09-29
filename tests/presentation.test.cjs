'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const api=require('../chapter-five.js');
const P=fs.existsSync(require.resolve('../world.js').replace('world.js','presentation.js'))?require('../presentation.js'):null;
test('presentation exposes world, motion, guide and disclosed news interfaces',()=>{
 assert.ok(P,'presentation module must exist');for(const k of ['worldStyle','pose','guide','news'])assert.equal(typeof P[k],'function');
});
test('every reality area and NPC uses a modern art identity, never a martial roof',()=>{
 assert.ok(P);for(const a of Object.values(api.AREAS)){const s=P.worldStyle(a);assert.equal(s.world,a.world);assert.equal(s.architecture,a.world==='현실'?'modern':'martial');assert.equal(s.npc,a.world==='현실'?'uniform':'robe');}
});
test('attack is anchored to the current character and retains an authoritative frozen facing',()=>{
 assert.ok(P);const g=new api.Game();g.player.face=.7;g.act('attack');const p=P.pose(g.player,g.playTime);assert.equal(p.action,'attack');assert.equal(p.angle,.7);const hp=g.stats().hp;g.player.x+=37;g.player.face=-1;const q=P.pose(g.player,g.playTime);assert.equal(q.angle,.7);assert.equal(q.hand.x-p.hand.x,37);assert.equal(g.stats().hp,hp);
});
test('failed inputs do not invent a fresh swing and repeated render pose is read-only',()=>{
 assert.ok(P);const g=new api.Game();assert.equal(g.act('storm'),false);assert.equal(P.pose(g.player,0).action,'idle');g.act('attack');const s=JSON.stringify(g);for(let i=0;i<30;i++)P.pose(g.player,g.playTime);assert.equal(JSON.stringify(g),s);assert.equal(g.act('attack'),false);
});
test('walk stride is driven by actual displacement and stops at a collision',()=>{
 assert.ok(P);const g=new api.Game();g.player.x=41;g.player.y=650;g.step(.05,{x:-1});const a=g.player.motion.stride;g.step(.05,{x:-1});assert.equal(g.player.motion.stride,a);assert.equal(g.player.walking,false);g.step(.05,{x:1});assert.ok(g.player.motion.stride>a);
});
test('travel clears attack motion, preserves gameplay save format and does not invent a guide achievement',()=>{
 assert.ok(P);const g=new api.Game();g.act('attack');g.enter('village');assert.equal(P.pose(g.player,g.playTime).action,'idle');const raw=JSON.parse(g.save());assert.equal(raw.version,6);assert.ok(!Object.hasOwn(raw,'motion'));assert.ok(!Object.hasOwn(raw.journey,'tutorialCompleted'));assert.doesNotThrow(()=>api.Game.load(g.save()));
});
test('guide says why locked and routes to real existing gates without dispensing skills',()=>{
 assert.ok(P);const g=new api.Game();assert.equal(P.guide(g).stage,'locked');g.progress=2;g.training=1;let u=P.guide(g);assert.equal(u.target.id,'portal');g.enter('village');u=P.guide(g);assert.equal(u.target.id,'archiveGate');assert.match(u.text,/환서정/);assert.deepEqual(g.journey.known,[]);
});
test('guide reads the chosen artifact and real observations in order, not a hidden counter',()=>{
 assert.ok(P);const g=new api.Game();g.progress=2;g.training=1;g.enter('archive');let u=P.guide(g);assert.equal(u.stage,'approach');Object.assign(g.player,{x:u.target.x,y:u.target.y});u=P.guide(g);assert.equal(u.stage,'sense');g.sense();u=P.guide(g);assert.equal(u.stage,'inspect');g.interact();u=P.guide(g);assert.equal(u.stage,'experiment');assert.doesNotMatch(u.text,/\d\s*\/\s*\d/);assert.deepEqual(g.journey.known,[]);
});
test('news declares simulation and separates real journey events from fictional travelers',()=>{
 assert.ok(P);const g=new api.Game();const x=P.news(g);assert.match(P.DISCLOSURE,/실제 멀티 채팅이 아닌 연출 시뮬레이션/);assert.ok(x.every(m=>['world','server','recruit','system'].includes(m.channel)));assert.ok(x.every(m=>m.simulated===true));assert.ok(x.some(m=>m.channel==='recruit'));assert.ok(!JSON.stringify(x).includes('접속자 100'));const save=g.save();P.news(g);assert.equal(g.save(),save);
});
test('anchored slashes retain the exact attack facing and no extra damage is applied',()=>{
 const g=new api.Game();g.progress=2;g.training=1;g.enter('forest');const e=g.enemies[0];Object.assign(g.player,{x:e.x-30,y:e.y});const hp=e.hp;g.act('attack');const f=g.fx.find(f=>f.kind==='slash');assert.equal(f.actorBound,true);assert.equal(f.motionAngle,g.player.motion.angle);assert.equal(hp-e.hp,g.stats().attack);
});
test('alternate template names cannot make a modern area render with a martial identity',()=>{
 assert.equal(P.worldStyle({world:'현실',theme:'ruins'}).architecture,'modern');assert.equal(P.worldStyle({world:'무림',theme:'city'}).architecture,'martial');
});
test('unknown progress never makes tutorial hints invent an artifact or equipped interpretation',()=>{
 const g=new api.Game();g.progress=2;g.training=1;g.enter('archive');const raw=g.save();for(let i=0;i<100;i++){P.guide(g);P.news(g);}assert.equal(g.save(),raw);assert.deepEqual(g.journey.items,[]);assert.deepEqual(g.journey.known,[]);
});
