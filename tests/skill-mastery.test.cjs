const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../world-game.js'),Growth=require('../world-growth.js'),{inherited,opponent}=require('./world-fixtures.cjs');
const read=(g,f='ripple',a='signature1',w='reality')=>Growth.skillMastery(g,w,f,a);
function fight(f='ripple',world='reality'){const g=inherited(f),e=opponent(g);if(world==='murim')g.area='forest';return {g,e};}

test('legacy saves preserve family mastery without inventing individual history',()=>{
 const g=inherited(),raw=JSON.parse(g.save());raw.worldGrowth.murim.mastery.ripple=19;
 for(const w of Object.values(raw.worldGrowth))delete w.skillMastery;
 const loaded=Game.load(JSON.stringify(raw));assert.equal(loaded.worldGrowth.murim.mastery.ripple,19);
 assert.equal(typeof Growth.skillMastery,'function');assert.deepEqual(read(loaded),{value:0,max:30,tracked:false});
 assert.deepEqual(read(loaded,'ripple','signature1','murim'),{value:0,max:30,tracked:false});
});
test('malformed individual entries normalize independently without changing legacy data',()=>{
 const raw=Growth.initial();raw.reality.mastery.echo=12;raw.reality.skillMastery={echo:{signature1:4,signature2:-1,ultimate:'7'},seal:{signature1:999},ripple:[]};
 const g={worldGrowth:Growth.validate(raw)};assert.equal(typeof Growth.skillMastery,'function');
 assert.equal(read(g,'echo').value,4);assert.equal(read(g,'echo','signature2').tracked,false);assert.equal(read(g,'echo','ultimate').tracked,false);
 assert.equal(read(g,'seal').value,30);assert.equal(g.worldGrowth.reality.mastery.echo,12);
});
test('cast identity deduplicates by action and world and persists counts',()=>{
 const g=inherited(),token={};assert.equal(typeof Growth.recordSkillMastery,'function');
 g.area='rift';assert.equal(Growth.recordSkillMastery(g,'reality','ripple','signature1',token),true);
 assert.equal(Growth.recordSkillMastery(g,'reality','ripple','signature1',token),false);
 assert.equal(Growth.recordSkillMastery(g,'reality','ripple','signature2',{}),true);
 g.area='forest';assert.equal(Growth.recordSkillMastery(g,'murim','ripple','signature1',{}),true);
 g.enter('city');const loaded=Game.load(g.save());assert.equal(read(loaded).value,1);assert.equal(read(loaded,'ripple','signature2').value,1);assert.equal(read(loaded,'ripple','signature1','murim').value,1);
});
test('reality defensive skills count actual absorption, evasion and suppression only',()=>{
 for(const f of ['ripple','echo','seal']){const {g,e}=fight(f);assert.equal(g.act('signature1'),true);assert.equal(typeof Growth.skillMastery,'function');assert.equal(read(g,f).value,0);
  if(f==='ripple')g.takeHit(e);
  else {g.player.cool.signature1=0;Object.assign(g.player,{x:400,y:700,face:f==='echo'?Math.PI/2:0});e.wind=.15;assert.equal(g.act('signature1'),true);if(f==='echo')for(let i=0;i<5;i++)g.step(.05);}
  assert.equal(read(g,f).value,1,f);assert.equal(read(g,f,'signature2').value,0);assert.equal(read(g,f,'signature1','murim').value,0);
 }
});
test('reality multi-target and delayed interpretation hits credit a cast once',()=>{
 const {g,e}=fight('echo');g.journey.known=['echo-replay'];g.journey.sync['echo-replay']=2;g.worldGrowth.reality.interpretations.echo='echo-replay';g.enemies.push({...e,id:'second',x:480});
 assert.equal(g.act('signature2'),true);assert.equal(typeof Growth.skillMastery,'function');assert.equal(read(g,'echo','signature2').value,1);
 for(let i=0;i<14;i++)g.step(.05);assert.equal(read(g,'echo','signature2').value,1);
 g.enter('city');opponent(g);g.act('signature2');assert.equal(read(g,'echo','signature2').value,2,'new runtime cast IDs do not collide');
});
test('murim direct hits, parries, suppression and delayed ultimate credit the originating action',()=>{
 for(const f of ['ripple','seal']){const {g,e}=fight(f,'murim');e.wind=1;g.act('signature1');if(f==='ripple')g.takeHit(e);assert.equal(typeof Growth.skillMastery,'function');assert.equal(read(g,f,'signature1','murim').value,1);g.hitStop=0;g.act('signature2');assert.equal(read(g,f,'signature2','murim').value,1);}
 const {g,e}=fight('echo','murim');e.hp=e.maxHp=1000;g.fate.focus=100;assert.equal(g.act('ultimate'),true);for(let i=0;i<15;i++)g.step(.05);assert.equal(read(g,'echo','ultimate','murim').value,1);
});
test('held casts and trial, comparison, assessment, residual and challenge targets award no individual mastery',()=>{
 for(const flag of ['trial','comparison','assessment','residual','resonanceTrial','demonstration']){const {g,e}=fight();e[flag]=true;g.act('signature2');assert.equal(typeof Growth.skillMastery,'function');assert.equal(read(g,'ripple','signature2').value,0,flag);}
 for(const world of ['reality','murim']){const {g}=fight('ripple',world);g.act('signature2',true);assert.equal(read(g,'ripple','signature2',world).value,0);}
 const {g}=fight();g.area='comparison';g.act('signature2');assert.equal(read(g,'ripple','signature2').value,0);
});
test('individual attainment adds its proposal damage while preserving family mastery',()=>{
 const {g,e}=fight();g.worldGrowth.reality.mastery.ripple=30;assert.equal(typeof Growth.recordSkillMastery,'function');
 for(let i=0;i<35;i++)Growth.recordSkillMastery(g,'reality','ripple','signature2',{});
 assert.equal(read(g,'ripple','signature2').value,30);const hp=e.hp;g.act('signature2');assert.equal(hp-e.hp,48);assert.equal(g.worldGrowth.reality.mastery.ripple,30);
});
test('one target gives bounded action credit while other actions retain their own history',()=>{
 for(const world of ['reality','murim']){const {g,e}=fight('ripple',world);e.hp=e.maxHp=10000;
  for(let i=0;i<6;i++){g.player.mp=80;g.player.cool.signature2=0;g.act('signature2');}
  assert.equal(read(g,'ripple','signature2',world).value,3);
  g.player.mp=80;g.act('signature1');g.player.invuln=0;g.takeHit(e);assert.equal(read(g,'ripple','signature1',world).value,1);
 }
});
test('murim evasion needs a live threat and tracks Q independently of R',()=>{
 const {g,e}=fight('echo','murim');g.act('signature1');for(let i=0;i<10;i++)g.step(.05);assert.equal(read(g,'echo','signature1','murim').value,0);
 Object.assign(g.player,{x:400,y:700,face:Math.PI/2});g.player.cool.signature1=0;e.wind=.2;g.act('signature1');for(let i=0;i<10;i++)g.step(.05);
 assert.equal(read(g,'echo','signature1','murim').value,1);assert.equal(read(g,'echo','signature2','murim').value,0);
});
test('regeneration suppression credits Q once only when healing is actually prevented',()=>{
 const {g,e}=fight('seal');g.act('signature1');g.regenerateEnemy(e,10);assert.equal(read(g,'seal').value,0);
 e.hp-=20;g.regenerateEnemy(e,10);g.regenerateEnemy(e,10);assert.equal(read(g,'seal').value,1);
});
test('murim ripple guard credits the original attacker when its damage is internally cloned',()=>{
 for(const charges of [0,3]){const {g,e}=fight('ripple','murim');g.journey.known=['ripple-guard'];g.journey.selected.ripple='ripple-guard';g.combat.charges=charges;
  assert.equal(g.act('signature1'),true);const hp=g.player.hp;g.takeHit(e);
  assert.equal(g.player.hp,hp);assert.equal(g.combat.parry,0);assert.equal(read(g,'ripple','signature1','murim').value,1,'successful parry counts even at full stored charges');
 }
});
test('ripple guard does not turn an arbitrary cloned target or held Q into individual credit',()=>{
 for(const held of [false,true]){const {g,e}=fight('ripple','murim');g.journey.known=['ripple-guard'];g.journey.selected.ripple='ripple-guard';g.act('signature1',held);g.takeHit(held?e:{...e});assert.equal(read(g,'ripple','signature1','murim').value,0);}
});
