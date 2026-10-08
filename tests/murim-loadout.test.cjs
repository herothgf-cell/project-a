const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../world-game.js'),Growth=require('../murim-growth.js');
const loadout=()=>require('../murim-loadout.js');
function fresh(){const g=new Game();g.startMurimJourney();return g;}
function learn(g){assert.ok(Growth.upgrade(g,'edge'));assert.ok(Growth.upgrade(g,'arc'));return g;}
function ready(g){g.advanceMurimIntro(true);assert.ok(g.enter('murimTutorial'));return g;}
test('freshly learned technique remains hidden and cannot activate until assigned',()=>{
 const g=learn(fresh());assert.equal(g.skillInfo('moon').locked,true);
 assert.equal(g.skillInfo('moon').hidden,true);assert.equal(g.skillInfo('moon').name,'');
 ready(g);const mp=g.player.mp;assert.equal(g.act('moon'),false);assert.equal(g.player.mp,mp);
 for(const a of ['storm','signature1','signature2','ultimate'])assert.equal(g.act(a),false);
 assert.ok(g.act('attack'));assert.ok(g.act('dash'));
});
test('assignment swaps only slots and leaves investment, attainment and cooldown on technique',()=>{
 const g=learn(fresh()),L=loadout();g.worldState.murimJourney.disciple='accept';g.training=2;
 const growth=JSON.stringify(g.worldState.murimGrowth),mastery=JSON.stringify(g.worldState.ordinaryGrowth);
 assert.ok(L.assign(g,'moon','samjae-arc'));assert.ok(L.assign(g,'storm','plum-first'));
 g.player.cool.moon=2.2;g.player.cool.storm=4;
 assert.ok(L.assign(g,'storm','samjae-arc'));assert.equal(L.resolve(g,'moon'),'storm');assert.equal(L.resolve(g,'storm'),'moon');
 assert.equal(g.skillInfo('storm').cooldownKey,'moon');assert.match(g.skillInfo('storm').name,/횡검/);assert.equal(g.skillInfo('storm').glyph,'斬');assert.equal(g.skillInfo('moon').glyph,'梅');
 assert.ok(L.assign(g,'storm',null));assert.equal(L.resolve(g,'storm'),null);
 assert.ok(L.assign(g,'storm','samjae-arc'));assert.equal(g.player.cool.moon,2.2);assert.equal(g.player.cool.storm,4);
 assert.equal(JSON.stringify(g.worldState.murimGrowth),growth);assert.equal(JSON.stringify(g.worldState.ordinaryGrowth),mastery);
});
test('mapped action uses technique damage, mana and manual attainment independent of input slot',()=>{
 const g=learn(fresh()),L=loadout();assert.ok(L.assign(g,'storm','samjae-arc'));ready(g);
 const e=g.enemies.find(e=>!e.boss);Object.assign(e,{x:450,y:700,hp:1000,maxHp:1000});Object.assign(g.player,{x:400,y:700,face:0,mp:60});
 const hp=e.hp,mp=g.player.mp;assert.ok(g.act('storm'));assert.equal(mp-g.player.mp,18);assert.equal(hp-e.hp,Math.round(g.stats().attack*2.4));
 assert.equal(g.worldState.ordinaryGrowth.records.murim.moon,1);assert.equal(g.worldState.ordinaryGrowth.records.murim.storm,0);assert.ok(g.player.cool.moon>0);assert.equal(g.player.cool.storm,0);
 assert.equal(g.act('storm'),false);g.player.cool.moon=0;assert.ok(g.act('storm',true));assert.equal(g.worldState.ordinaryGrowth.records.murim.moon,1);
});
test('equipment cannot change in combat and unlearned or passive IDs cannot be assigned',()=>{
 const g=fresh(),L=loadout();assert.equal(L.assign(g,'moon','samjae-arc'),false);assert.equal(L.assign(g,'moon','edge'),false);assert.equal(L.assign(g,'attack',null),false);
 learn(g);assert.ok(L.assign(g,'moon','samjae-arc'));ready(g);const before=JSON.stringify(g.worldState.murimLoadout);
 assert.equal(L.assign(g,'storm','samjae-arc'),false);assert.equal(L.assign(g,'moon',null),false);assert.equal(JSON.stringify(g.worldState.murimLoadout),before);
});
test('loadout persists empty and selected slots while pre-loadout saves migrate learned skills once',()=>{
 const g=learn(fresh()),L=loadout();assert.equal(L.resolve(Game.load(g.save()),'moon'),null);
 assert.ok(L.assign(g,'storm','samjae-arc'));assert.equal(L.resolve(Game.load(g.save()),'storm'),'moon');
 const old=JSON.parse(g.save());delete old.worldState.murimLoadout;delete old.worldState.murimJourney.sceneState;delete old.worldState.murimJourney.completedScenes;const migrated=Game.load(JSON.stringify(old));assert.equal(L.resolve(migrated,'moon'),'moon');assert.equal(L.resolve(migrated,'storm'),null);
 assert.ok(L.assign(migrated,'moon',null));assert.equal(L.resolve(Game.load(migrated.save()),'moon'),null);
});
test('malformed, duplicate and unlearned loadout saves are rejected without touching source',()=>{
 const g=learn(fresh());for(const slots of [{moon:'plum-first',storm:null},{moon:'samjae-arc',storm:'samjae-arc'},{moon:'__proto__',storm:null},{moon:null},{moon:null,storm:null,attack:'samjae-arc'}]){
  const d=JSON.parse(g.save());d.worldState.murimLoadout={version:1,slots};const raw=JSON.stringify(d);assert.throws(()=>Game.load(raw),/단축키/);assert.equal(JSON.stringify(d),raw);
 }
});
test('legacy campaign skill activation is unaffected',()=>{const g=new Game();g.training=2;assert.equal(g.skillInfo('moon').hidden,undefined);assert.ok(g.act('moon'));});
test('learning plum preserves the chosen arc slot and leaves plum unassigned',()=>{
 const g=learn(fresh()),L=loadout();assert.ok(L.assign(g,'storm','samjae-arc'));g.worldState.murimJourney.disciple='accept';
 assert.equal(L.resolve(g,'moon'),null);assert.equal(L.resolve(g,'storm'),'moon');assert.deepEqual(L.describe(g).learned.map(s=>s.id),['samjae-arc','plum-first']);
});
test('moving or unsetting a cooling technique cannot reactivate it early',()=>{
 const g=learn(fresh()),L=loadout();assert.ok(L.assign(g,'moon','samjae-arc'));g.worldState.murimJourney.stage='tutorial';
 assert.ok(g.act('moon'));const mp=g.player.mp,cool=g.player.cool.moon;assert.ok(L.assign(g,'storm','samjae-arc'));assert.equal(g.act('storm'),false);
 assert.ok(L.assign(g,'storm',null));assert.ok(L.assign(g,'moon','samjae-arc'));assert.equal(g.act('moon'),false);assert.equal(g.player.mp,mp);assert.equal(g.player.cool.moon,cool);
});
test('new format saves cannot regain default slots by deleting the loadout record',()=>{
 const g=learn(fresh()),d=JSON.parse(g.save());delete d.worldState.murimLoadout;
 assert.throws(()=>Game.load(JSON.stringify(d)),/단축키/);
});
test('old disciple acceptance migrates both learned techniques without altering growth',()=>{
 const g=learn(fresh()),d=JSON.parse(g.save()),j=d.worldState.murimJourney;
 Object.assign(j,{stage:'return',scene:3,disciple:'accept',tutorial:{move:true,attack:true,dash:true},cleared:['murimTutorial',...Array.from({length:10},(_,i)=>'murimRoad'+(i+1))]});
 delete j.sceneState;delete j.completedScenes;delete d.worldState.murimLoadout;d.training=2;d.progress=4;d.worldState.murimGrowth.grants=['start',...j.cleared.slice(1)];
 const ledger=JSON.stringify(d.worldState.murimGrowth),g2=Game.load(JSON.stringify(d)),L=loadout();assert.equal(L.resolve(g2,'moon'),'moon');assert.equal(L.resolve(g2,'storm'),'storm');assert.equal(JSON.stringify(g2.worldState.murimGrowth),ledger);assert.equal(g2.worldState.murimJourney.disciple,'accept');
});
