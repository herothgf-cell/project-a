const test=require('node:test'),assert=require('node:assert/strict'),{inherited,opponent}=require('./world-fixtures.cjs');
for(const family of ['ripple','echo','seal'])for(const mode of ['flow','focus'])test(`${family}/${mode} reality effect links actual chapter six combat`,()=>{const g=inherited(family);g.journey.phase=5;g.laterStory.six=3;g.laterStory.dualBreath=true;g.worldGrowth.reality.mode=mode;g.enter('stabilization');const e=g.enemies[0];Object.assign(g.player,{x:730,y:700,face:0,mp:80,invuln:0});Object.assign(e,{x:780,y:700,hp:1000,maxHp:1000,cd:99,wind:0});g.act(mode==='flow'?'moon':'attack');Object.assign(e,{wind:.1,tx:730,ty:700,range:62});g.act('signature1');if(family==='ripple')g.takeHit(e);if(family==='echo')for(let i=0;i<5;i++){g.hitStop=0;g.step(.05);}assert.equal(g.laterRuntime.linked,true);});
for(const family of ['ripple','echo','seal'])test(`${family} historical interpretation still works and station proof needs no sensing`,()=>{
 const g=inherited(family),key={ripple:'ripple-return',echo:'echo-return',seal:'seal-hold'}[family];
 g.enter('village');g.journey.known=[key];g.journey.sync[key]=0;
 assert.equal(g.chooseInterpretation(key),true);
 g.enter('city');assert.equal(g.journey.sync[key],1);
 assert.equal(g.chooseInterpretation(key),true);
 g.journey.phase=3;assert.equal(g.enter('station'),true);
 const e=g.enemies.find(e=>!e.boss);
 function effectiveResponse(){
  Object.assign(g.player,{x:730,y:700,face:0,mp:g.stats().mp,invuln:0});
  Object.assign(e,{x:780,y:700,hp:2000,maxHp:2000,wind:.1,cd:99,tx:730,ty:700,range:62});
  for(const action of Object.keys(g.player.cool))g.player.cool[action]=0;
  g.hitStop=0;assert.equal(g.act('signature1'),true);
  if(family==='ripple')g.takeHit(e);
  if(family==='echo'){for(let i=0;i<5;i++){g.hitStop=0;g.step(.05);}e.x=g.player.x+45;e.y=g.player.y;}
  assert.equal(g.act('signature2'),true);
 }
 effectiveResponse();assert.equal(g.journey.measured,true);
 assert.equal(g.points().some(p=>p.id==='station-lens'),false);
 assert.equal(g.journey.facts.some(f=>f.id==='station-sense'),false);
});
test('heart is reality and safe circle still blocks chapter seven environment pressure',()=>{const g=inherited();g.enter('heart');assert.equal(g.level,g.worldGrowth.reality.level);assert.equal(g.stats().attack,20);g.area='woundDock';g.laterStory.passOpened=true;Object.assign(g.player,{x:730,y:700,invuln:0});const hp=g.player.hp;g.takeHit({laterPulse:true,damage:14});assert.equal(g.player.hp,hp);});
test('suppression stops actual regeneration and only then proves a non-telegraph target',()=>{const g=inherited('seal');g.journey.phase=5;g.laterStory.six=3;g.laterStory.dualBreath=true;g.enter('stabilization');const e=g.enemies[0];Object.assign(g.player,{x:730,y:700,face:0});Object.assign(e,{x:780,y:700,hp:90,maxHp:100,wind:0,cd:99});g.act('signature1');assert.equal(g.realityStatus('seal'),'available');g.step(.05);assert.equal(e.hp,90);assert.equal(g.realityStatus('seal'),'settled');});
test('a dual-link discount is consumed by a real paid skill',()=>{const g=inherited();opponent(g);g.laterStory.dualBreath=true;g.dualRuntime.discount=6;const before=g.player.mp;assert.equal(g.skillInfo('moon').cost,8);g.act('moon');assert.equal(g.player.mp,before-8);assert.equal(g.dualRuntime.discount,0);});
for(const family of ['ripple','echo','seal'])test(`${family} murim rescue remains physical after reality adaptation`,()=>{const g=inherited(family);g.fate.stage=6;g.chapter4.phase=1;g.enter('returnPass');g.enemies=[];Object.assign(g.player,{x:700,y:630,face:0,invuln:0});g.storyRuntime.pulse.wind=.1;if(family==='ripple'){g.act('signature1');g.takeHit({storyPulse:true,id:'pulse',hp:99999,x:700,y:630,damage:18});}else if(family==='echo'){g.combat.echo={x:630,y:630,life:5};g.act('signature2');}else{g.act('signature1');g.step(.05);}assert.equal(g.chapter4.rescued,true);assert.equal(g.chapter4.route,family);});
