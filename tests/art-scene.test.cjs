'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const A=require('../art-runtime.js');
test('enemy identities are world-specific and read actual telegraph/hit state',()=>{
 const e={kind:'bandit',hp:50,wind:.5,windMax:1,flash:0},before=JSON.stringify(e);
 assert.equal(A.enemyQuery('murim',e,2).action,'telegraph');
 assert.equal(A.enemyQuery('reality',e,2),null);
 assert.equal(A.enemyQuery('murim',{...e,wind:0,flash:.1},2).action,'hit');
 assert.equal(JSON.stringify(e),before);
});
test('scene candidates have six independent NPC identities and cannot enter release',()=>{
 const Art=require('../art-loader.js'),m=require('../assets/art/scene-candidate.json'),c=Art.createCatalog(m);
 const actors=m.assets.filter(a=>a.kind==='npc');assert.equal(actors.length,6);
 assert.equal(new Set(actors.map(a=>a.atlas.path)).size,6);
 for(const a of actors){for(const facing of ['s','e','n','w'])assert.equal(c.resolve({world:a.world,entityId:a.entityId,action:'idle',facing},{preview:true}).status,'candidate');
 assert.equal(c.resolve({world:a.world,entityId:a.entityId,action:'portrait-neutral',facing:'none'}).status,'BLOCKED_ART');}
 assert.equal(c.files().length,0);
});
test('named NPC field and dialogue identities cannot cross worlds',()=>{
 assert.equal(typeof A.npcIdentity,'function');
 for(const [world,id,want]of [['reality','warden','seorin'],['reality','shop','supply'],['reality','partner','dogyeom'],['murim','master','baekryun'],['murim','returned-yeonhwa','yeonhwa'],['murim','shop','apothecary']])assert.equal(A.npcIdentity(world,id),'npc.'+want);
 assert.equal(A.npcIdentity('reality','master'),null);assert.equal(A.npcIdentity('murim','warden'),null);
 assert.equal(A.npcIdentity('reality','unknown'),null);
});
test('P0 buildings resolve deterministic independent world families, without expanding other areas',()=>{
 assert.equal(typeof A.environmentIdentity,'function');
 assert.deepEqual(A.environmentIdentity('city',0),{world:'reality',entityId:'environment.city',action:'building-0',facing:'none'});
 assert.deepEqual(A.environmentIdentity('village',2),{world:'murim',entityId:'environment.village',action:'building-2',facing:'none'});
 assert.equal(A.environmentIdentity('forest',0),null);
});
test('portal status uses actual lock, distance and travel state, without unlocking gameplay',()=>{
 assert.equal(typeof A.portalState,'function');
 const g={progress:0,playTime:4,player:{x:0,y:0}},o={x:0,y:0,need:2};
 assert.equal(A.portalState(g,o),'locked');g.progress=2;assert.equal(A.portalState(g,o),'active');
 g.player.x=300;assert.equal(A.portalState(g,o),'available');
 assert.equal(g.progress,2);
});
