'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Art=require('../art-loader.js');
const asset=(world,id)=>({id:world+'.'+id,entityId:id,world,kind:'enemy',status:'candidate',sources:['R01'],atlas:{path:`assets/art/${world}/enemy/${id}.png`,width:20,height:20},clips:{idle:{se:[{rect:[0,0,10,10],pivot:[.5,1],duration:.2}]},attack:{se:[{rect:[10,0,10,10],pivot:[.5,1],duration:.2}]}}});
test('simplified enemy query uses four diagonal art facings without mutating movement or attacks',()=>{
 const R=require('../art-runtime.js');
 for(let angle=-Math.PI;angle<Math.PI;angle+=.13){const e={kind:'bandit',hp:10,x:20,y:30,face:angle,motion:{enemyFacing:angle}},before=JSON.stringify(e),q=R.enemyQuery('murim',e,0,{fourDirections:true});assert.ok(['se','sw','nw','ne'].includes(q.facing));assert.equal(JSON.stringify(e),before);}
});
for(const [world,id]of [['murim','bandit'],['murim','masked'],['reality','shade'],['reality','drone']])test(id+' has four prototype render facings using its own front/rear sources',()=>{
 const a=Art.prototypeProfile(require('../assets/art/scene-candidate.json')).assets.find(a=>a.id===world+'.enemy.'+id);
 for(const action of ['idle','move','telegraph','attack','hit','death'])for(const facing of ['se','sw','nw','ne'])assert.ok(a.clips[action][facing]?.length,action+'.'+facing);
 for(const action of ['idle','move','telegraph','attack','hit','death'])for(const [from,to]of [['se','sw'],['nw','ne']]){
  assert.equal(a.clips[action][to][0].flipX,true);
  assert.deepEqual(a.clips[action][to][0].rect,a.clips[action][from][0].rect);
 }
});
test('mirrored whole-body frame keeps the foot anchor and mirrors every socket',()=>{
 const R=require('../art-runtime.js'),frame={rect:[0,0,100,200],pivot:[.3,.9],sockets:{foot:[30,180],hand:[80,70]},flipX:true};
 const p=R.placement({frame},{x:300,y:400},200);
 assert.deepEqual(p.destination,[230,220,100,200]);assert.deepEqual(p.sockets.foot,{x:300,y:400});assert.deepEqual(p.sockets.hand,{x:250,y:290});
});
test('simplified environmental blocks keep their semantic identity within each world',()=>{
 const R=require('../art-runtime.js');
 assert.deepEqual(R.blockVisual('reality','container'),{entityId:'environment.buildings',cell:3});
 assert.deepEqual(R.blockVisual('murim','templeruin'),{entityId:'environment.buildings',cell:0});
 assert.deepEqual(R.blockVisual('murim','rock'),{entityId:'environment.dressing',cell:1,flat:true});
 assert.equal(R.blockVisual('shared','container'),null);
});
test('prototype hero profile keeps eight directions, four walk poses and original total time',()=>{
 const original=require('../assets/art/reality/hero/yunseo/candidate.json'),profile=Art.prototypeProfile(original),a=profile.assets[0];
 assert.equal(Object.keys(a.clips.walk).length,8);
 for(const facing of Object.keys(a.clips.walk)){
  assert.equal(a.clips.walk[facing].length,4);assert.equal(a.clips.hit[facing].length,2);
  for(const action of ['walk','hit'])assert.ok(Math.abs(a.clips[action][facing].reduce((s,f)=>s+f.duration,0)-original.assets[0].clips[action][facing].reduce((s,f)=>s+f.duration,0))<1e-9);
 }
 assert.equal(original.assets[0].clips.walk.se.length,6);assert.equal(a.status,'candidate');
 assert.deepEqual(a.clips.attack1,original.assets[0].clips.attack1);
});
test('continuity chooses only the same identity and action when a direction is absent',()=>{
 const source=Art.createCatalog({schemaVersion:1,required:[],assets:[asset('reality','a'),asset('murim','a')]});
 const images={request:()=>({}),get:()=>({}),failure:()=>null},c=Art.createContinuityCatalog(source,images);
 const v=c.sample({world:'reality',entityId:'a',action:'attack',facing:'nw',elapsed:0},{preview:true});
 assert.equal(v.id,'reality.a');assert.equal(v.frame.rect[0],10);assert.equal(v.substituted,true);assert.equal(v.actualFacing,'se');
 assert.equal(c.sample({world:'reality',entityId:'missing',action:'idle',facing:'se',elapsed:0},{preview:true}).status,'BLOCKED_ART');
});
test('loading retains a resident same-actor pose without leaking across worlds',()=>{
 const a=asset('reality','a');a.atlases={attack:{path:'assets/art/reality/enemy/attack.png',width:20,height:20}};a.clips.attack.se[0].atlas='attack';
 const source=Art.createCatalog({schemaVersion:1,required:[],assets:[a,asset('murim','a')]}),loaded=new Set([a.atlas.path]);
 const images={request:v=>loaded.has(v.atlas.path)?{}:null,get:p=>loaded.has(p)?{}:null,failure:()=>null},c=Art.createContinuityCatalog(source,images),q={world:'reality',entityId:'a',facing:'se',elapsed:0};
 c.sample({...q,action:'idle'},{preview:true});const pending=c.sample({...q,action:'attack'},{preview:true});
 assert.equal(pending.status,'candidate');assert.equal(pending.substituted,true);assert.equal(pending.frame.rect[0],0);
 assert.equal(c.sample({...q,world:'murim',action:'idle'},{preview:true}).status,'BLOCKED_ART');
 loaded.add(a.atlases.attack.path);const ready=c.sample({...q,action:'attack'},{preview:true});assert.equal(ready.frame.rect[0],10);assert.equal(ready.substituted,false);
});
test('continuity never returns evicted pixels or circumvents production approval',()=>{
 const a=asset('reality','a'),source=Art.createCatalog({schemaVersion:1,required:[],assets:[a]});let available=true;
 const images={request:()=>available?{}:null,get:()=>available?{}:null,failure:()=>null},c=Art.createContinuityCatalog(source,images),q={world:'reality',entityId:'a',action:'idle',facing:'se',elapsed:0};
 c.sample(q,{preview:true});available=false;assert.equal(c.sample(q,{preview:true}).status,'BLOCKED_ART');available=true;assert.equal(c.sample(q).status,'BLOCKED_ART');
});
