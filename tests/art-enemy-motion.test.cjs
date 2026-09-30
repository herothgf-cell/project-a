'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Art=require('../art-loader.js'),Runtime=require('../art-runtime.js');
const manifest=require('../assets/art/scene-candidate.json');
for(const [world,kinds]of Object.entries({reality:['drone','tide'],murim:['masked','guardian']}))for(const kind of kinds)for(const action of ['idle','move','telegraph','attack','hit','death'])test(`${world} ${kind} ${action} has its own whole-body SE frames`,()=>{
 const c=Art.createCatalog(manifest),q={world,entityId:'enemy.'+kind,action,facing:'se'},v=c.sample({...q,elapsed:0},{preview:true});
 assert.equal(v.status,'candidate');assert.equal(v.id,world+'.enemy.'+kind);
 assert.ok(v.atlas.path.includes('/'+world+'/enemy/'+kind+'-'));
 const frames=manifest.assets.find(a=>a.id===v.id).clips[action].se;assert.equal(frames.length,4);
 for(const f of frames){assert.ok(f.sockets.foot);assert.equal(f.contact,action==='attack'&&f===frames[0]);}
 assert.equal(c.resolve(q).status,'BLOCKED_ART');
 assert.equal(c.resolve({...q,world:world==='murim'?'reality':'murim'},{preview:true}).status,'BLOCKED_ART');
});
test('every existing enemy identity has an explicit world query, even when art is missing',()=>{
 for(const [world,kinds]of Object.entries({reality:['shade','sentinel','drone','tide'],murim:['bandit','chief','masked','guardian']}))for(const kind of kinds){
  const enemy={kind,hp:10,x:10,y:10,motion:{enemyFacing:Math.PI/4}},q=Runtime.enemyQuery(world,enemy,0);
  assert.equal(q?.entityId,'enemy.'+kind);assert.equal(q.world,world);
  assert.equal(Runtime.enemyQuery(world==='reality'?'murim':'reality',enemy,0),null);
 }
});
for(const action of ['idle','move','telegraph','attack','hit','death'])test(`shade NW ${action} resolves its own whole-body atlas without world substitution`,()=>{
 const c=Art.createCatalog(manifest),q={world:'reality',entityId:'enemy.shade',action,facing:'nw',elapsed:0},v=c.sample(q,{preview:true});
 assert.equal(v.status,'candidate');assert.equal(v.id,'reality.enemy.shade');
 const a=manifest.assets.find(a=>a.id===v.id),frames=a.clips[action].nw;
 assert.equal(frames.length,4);assert.ok(v.atlas.path.includes('/reality/enemy/'));
 assert.ok(frames.every(f=>f.sockets.foot));assert.equal(c.sample({...q,world:'murim'},{preview:true}).status,'BLOCKED_ART');
 assert.equal(c.sample(q).status,'BLOCKED_ART');
});
for(const action of ['idle','move','telegraph','attack','hit','death'])test(`bandit NW ${action} has independent bounded full-body frames`,()=>{
 const q={world:'murim',entityId:'enemy.bandit',action,facing:'nw'},c=Art.createCatalog(manifest),v=c.sample({...q,elapsed:0},{preview:true});
 assert.equal(v.status,'candidate');
 const a=manifest.assets.find(a=>a.id===v.id),frames=a.clips[action].nw;
 assert.equal(frames.length,4);assert.notEqual(frames[0].atlas,a.clips[action].se[0].atlas);
 for(const f of frames){assert.ok(f.sockets.foot&&f.sockets.hand&&f.sockets.blade);assert.equal(f.contact,action==='attack'&&f===frames[0]);}
 assert.equal(c.resolve({...q,world:'reality'},{preview:true}).status,'BLOCKED_ART');
 assert.equal(c.resolve(q).status,'BLOCKED_ART');
});
test('enemy presentation uses movement facing, and freezes target facing during attack/death',()=>{
 const e={kind:'bandit',hp:20,x:10,y:10,wind:0,flash:0,motion:{enemyFacing:-3*Math.PI/4}};
 assert.equal(Runtime.enemyQuery('murim',e,2).facing,'nw');
 e.wind=.4;e.windMax=.8;e.tx=30;e.ty=30;
 assert.equal(Runtime.enemyQuery('murim',e,2).facing,'se');
 e.wind=0;e.motion.enemyAttackAt=2;e.motion.enemyAttackAngle=Math.PI;
 assert.equal(Runtime.enemyQuery('murim',e,2.1).facing,'w');
 e.hp=0;e.motion.enemyDeathAngle=-Math.PI/2;e.motion.deathAt=2.2;
 assert.equal(Runtime.enemyQuery('murim',e,2.3).facing,'n');
});
