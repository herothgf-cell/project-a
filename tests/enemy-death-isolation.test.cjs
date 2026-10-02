const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../world-game.js'),P=require('../presentation.js');
for(const area of ['forest','rift'])test(area+': killing an elite never restarts an earlier enemy death',()=>{
 const g=new Game();g.progress=7;g.training=2;assert.equal(g.enter(area),true);
 const first=g.enemies.find(e=>e.role==='pressure'),elite=g.enemies.find(e=>e.role==='heavy');
 g.playTime=1;g.strike(first,99999);assert.equal(first.hp,0);assert.equal(P.deathVisible(first,1),true);
 g.playTime=3;assert.equal(P.deathVisible(first,3),false);g.strike(elite,99999);assert.equal(elite.hp,0);
 assert.equal(first.motion.deathAt,1,'earlier death time is immutable');assert.equal(elite.motion.deathAt,3);
 assert.notEqual(first.motion,elite.motion);assert.equal(P.deathVisible(first,3),false);assert.equal(P.deathVisible(elite,3),true);
 const gold=g.gold;g.strike(first,99999);assert.equal(g.gold,gold);assert.equal(first.motion.deathAt,1);
 g.playTime=5;for(const e of g.enemies)if(!e.boss&&e.hp>0)g.strike(e,99999);
 g.playTime=7;g.strike(g.enemies.find(e=>e.boss),99999);assert.equal(P.deathVisible(first,7),false);assert.equal(P.deathVisible(elite,7),false);
});
