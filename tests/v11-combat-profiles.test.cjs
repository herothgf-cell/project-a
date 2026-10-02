const test=require('node:test'),assert=require('node:assert/strict');
const Director=require('../encounter-director.js'),{inherited}=require('./world-fixtures.cjs');
test('later chapters have explicit final profiles instead of one shared tier',()=>{
 assert.ok(Director.profiles,'region profiles must be exported');
 assert.ok(Director.profiles.woundCore.bossHp>Director.profiles.station.bossHp);
 assert.ok(Director.profiles.station.bossHp>Director.profiles.rift.bossHp);
});
test('generated profiles are independent of player level and define readable warnings',()=>{
 const g=inherited();g.enter('rift');const first=g.enemies.map(e=>({hp:e.maxHp,damage:e.damage,speed:e.speed}));
 g.worldGrowth.reality.level=30;g.enter('rift');assert.deepEqual(g.enemies.map(e=>({hp:e.maxHp,damage:e.damage,speed:e.speed})),first);
 assert.equal(g.enemies.find(e=>e.boss).maxHp,Director.profiles?.rift.bossHp);
 for(const e of g.enemies){e.wind=1;g.prepareEnemyAttack(e);assert.ok(e.windMax>=.75);assert.ok(e.damage<120);}
});
