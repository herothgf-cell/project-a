'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const loaderPath=path.join(root,'art-loader.js');
const load=()=>{assert.ok(fs.existsSync(loaderPath),'art loader must exist');return require(loaderPath);};
const sample=()=>({schemaVersion:1,assets:[{id:'reality.hero.yunseo',world:'reality',entityId:'hero',status:'candidate',kind:'actor',sources:['R01'],atlas:{path:'assets/art/reality/hero/yunseo/idle.png',width:1024,height:512},clips:{idle:{s:[{rect:[0,0,256,256],pivot:[.5,.9],duration:.15}]}}}],required:['reality.hero.yunseo']});
test('missing hero/NPC sets stay explicitly blocked instead of resolving another world or actor',()=>{
 const A=load(),c=A.createCatalog(sample());
 assert.equal(c.resolve({world:'murim',entityId:'hero',action:'idle',facing:'s'},{preview:true}).status,'BLOCKED_ART');
 assert.equal(c.resolve({world:'reality',entityId:'warden',action:'idle',facing:'s'},{preview:true}).status,'BLOCKED_ART');
 assert.equal(c.resolve({world:'reality',entityId:'hero',action:'attack1',facing:'s'},{preview:true}).status,'BLOCKED_ART');
});
test('candidates require explicit preview and a real clip; idle is not attack animation',()=>{
 const c=load().createCatalog(sample()),q={world:'reality',entityId:'hero',action:'idle',facing:'s'};
 assert.equal(c.resolve(q).status,'BLOCKED_ART');
 const found=c.resolve(q,{preview:true});assert.equal(found.status,'candidate');assert.deepEqual(found.frame.rect,[0,0,256,256]);
 assert.equal(c.resolve({...q,facing:'n'},{preview:true}).status,'BLOCKED_ART');
});
test('catalog rejects traversal, frame overflow, conflicting world and duplicate actor mappings',()=>{
 const A=load();for(const mutate of [m=>m.assets[0].atlas.path='assets/art/../../docs/secret.png',m=>m.assets[0].clips.idle.s[0].rect=[1000,0,256,256],m=>m.assets[0].world='murim',m=>m.assets.push(structuredClone(m.assets[0]))]){
  const m=sample();mutate(m);assert.throws(()=>A.createCatalog(m),/Invalid art catalog/);
 }
});
test('release readiness cannot be claimed with missing P0 production sets',()=>{
 const A=load(),manifestPath=path.join(root,'assets/art/manifest.json');assert.ok(fs.existsSync(manifestPath),'P0 inventory must exist');
 const m=JSON.parse(fs.readFileSync(manifestPath));const ids=['reality.hero.yunseo','murim.hero.yunseo','reality.npc.seorin','reality.npc.dogyeom','reality.npc.supply','murim.npc.baekryun','murim.npc.yeonhwa','murim.npc.apothecary','reality.environment.city','murim.environment.village','reality.portal.city','murim.portal.village'];
 for(const id of ids)assert.ok(m.required.includes(id),id);
 const c=A.createCatalog(m);assert.equal(c.releaseIssues().length>0,true);
});
test('catalog approval and frames cannot be mutated after validation',()=>{
 const c=load().createCatalog(sample()),q={world:'reality',entityId:'hero',action:'idle',facing:'s'};
 assert.throws(()=>{c.manifest.assets[0].status='approved';},TypeError);
 const v=c.resolve(q,{preview:true});
 assert.throws(()=>{v.frame.rect[0]=9999;},TypeError);
 assert.throws(()=>{v.atlas.path='assets/art/murim/hero/stolen.png';},TypeError);
 assert.equal(c.resolve(q).status,'BLOCKED_ART');
});
test('animation frames resolve their own sheet and every sheet is included in packaging',()=>{
 const m=sample(),a=m.assets[0];a.atlases={walk:{path:'assets/art/reality/hero/yunseo/walk.png',width:600,height:400}};
 a.clips.walk={se:[{atlas:'walk',rect:[0,0,200,200],pivot:[.5,.9],duration:.1},{atlas:'walk',rect:[200,0,200,200],pivot:[.5,.9],duration:.2}]};
 const c=load().createCatalog(m),v=c.resolve({world:'reality',entityId:'hero',action:'walk',facing:'se',frame:1},{preview:true});
 assert.equal(v.atlas.path,'assets/art/reality/hero/yunseo/walk.png');assert.equal(v.atlas.width,600);
 assert.deepEqual(c.files({preview:true}).sort(),['assets/art/reality/hero/yunseo/idle.png','assets/art/reality/hero/yunseo/walk.png']);
 assert.deepEqual(c.files(),[],'candidate sheets never ship');
});
test('animation sampling follows recorded frame durations and loop versus recovery semantics',()=>{
 const m=sample(),a=m.assets[0];a.clips.walk={s:[{rect:[0,0,256,256],pivot:[.5,.9],duration:.1},{rect:[256,0,256,256],pivot:[.5,.9],duration:.2}]};
 const c=load().createCatalog(m),q={world:'reality',entityId:'hero',action:'walk',facing:'s'};
 assert.equal(typeof c.sample,'function');
 for(const [elapsed,loop,want]of [[0,false,0],[.1,false,1],[.29,false,1],[.35,false,1],[.35,true,0]])assert.equal(c.sample({...q,elapsed,loop},{preview:true}).frameIndex,want);
 assert.equal(c.sample({...q,elapsed:0}).status,'BLOCKED_ART');
 assert.equal(c.sample({...q,action:'attack1',elapsed:0},{preview:true}).status,'BLOCKED_ART');
});
test('frame sockets and alternate sheets cannot reference another world or invalid bounds',()=>{
 for(const mutate of [a=>{a.atlases={walk:{path:'assets/art/murim/hero/yunseo/walk.png',width:100,height:100}};},a=>{a.clips.idle.s[0].atlas='absent';},a=>{a.clips.idle.s[0].sockets={hand:[-1,5]};}]){
  const m=sample();mutate(m.assets[0]);assert.throws(()=>load().createCatalog(m),/Invalid art catalog/);
 }
});
test('approving an idle study cannot accidentally clear the hero production gate',()=>{
 const m=sample();m.assets[0].status='approved';m.assets[0].review={visual:true,evidence:['qa/user-review.png']};
 const issues=load().createCatalog(m).releaseIssues();assert.equal(issues.length,1);assert.match(issues[0].reason,/walk/);assert.match(issues[0].reason,/socket/);
});
test('independent hero dialogue expressions are candidates, never production approvals or field bodies',()=>{
 for(const world of ['reality','murim']){
  const c=load().createCatalog(JSON.parse(fs.readFileSync(path.join(root,'assets/art',world,'hero/yunseo/candidate.json'))));
  for(const expression of ['neutral','focus','hurt','slight-smile']){
   const q={world,entityId:'hero',action:'portrait-'+expression,facing:'none'},v=c.resolve(q,{preview:true});
   assert.equal(v.status,'candidate');assert.match(v.atlas.path,new RegExp('assets/art/'+world+'/hero/yunseo/portraits-'));
   assert.equal(c.resolve(q).status,'BLOCKED_ART');
   assert.equal(c.resolve({...q,facing:'se'},{preview:true}).status,'BLOCKED_ART');
  }
 }
});
test('eight walk facings use independent candidate sheets in each world',()=>{
 const paths=new Set();
 for(const world of ['reality','murim']){
  const c=load().createCatalog(JSON.parse(fs.readFileSync(path.join(root,'assets/art',world,'hero/yunseo/candidate.json'))));
  for(const facing of ['s','se','e','ne','n','nw','w','sw']){
   const q={world,entityId:'hero',action:'walk',facing},v=c.resolve(q,{preview:true});
   assert.equal(v.status,'candidate');assert.equal(c.manifest.assets[0].clips.walk[facing].length,6);
   assert.equal(paths.has(v.atlas.path),false);paths.add(v.atlas.path);
   assert.equal(c.resolve(q).status,'BLOCKED_ART');assert.ok(fs.existsSync(path.join(root,v.atlas.path)));
  }
 }
});
test('idle breathes in two whole-body frames without sharing opposite facing cells',()=>{
 for(const world of ['reality','murim']){
  const c=load().createCatalog(JSON.parse(fs.readFileSync(path.join(root,'assets/art',world,'hero/yunseo/candidate.json'))));
  const rectangles=new Set();
  for(const facing of ['s','se','e','ne','n','nw','w','sw']){
   const q={world,entityId:'hero',action:'idle',facing},first=c.sample({...q,elapsed:0,loop:true},{preview:true}),second=c.sample({...q,elapsed:.8,loop:true},{preview:true});
   assert.equal(second.frameIndex,1);assert.notDeepEqual(first.frame.rect,second.frame.rect);
   for(const f of [first,second]){const key=f.atlas.path+f.frame.rect.join(':');assert.equal(rectangles.has(key),false);rectangles.add(key);}
  }
 }
});
test('second combo has independent contact frames and sockets for both worlds',()=>{
 for(const world of ['reality','murim']){
  const c=load().createCatalog(JSON.parse(fs.readFileSync(path.join(root,'assets/art',world,'hero/yunseo/candidate.json'))));
  const q={world,entityId:'hero',action:'attack2',facing:'se'},first=c.sample({...q,elapsed:0},{preview:true});
  assert.equal(first.status,'candidate');assert.equal(first.frame.contact,true);
  assert.notEqual(first.atlas.path,c.resolve({...q,action:'attack1'},{preview:true}).atlas.path);
  for(const elapsed of [0,.061,.136,.211]){const v=c.sample({...q,elapsed},{preview:true});assert.ok(v.frame.sockets.hand);assert.ok(v.frame.sockets.blade);}
  assert.equal(c.sample({...q,elapsed:0}).status,'BLOCKED_ART');
 }
});
test('finisher dodge cast and hit candidates retain simulation recovery durations',()=>{
 for(const world of ['reality','murim']){
  const c=load().createCatalog(JSON.parse(fs.readFileSync(path.join(root,'assets/art',world,'hero/yunseo/candidate.json'))));
  for(const [action,duration]of [['attack3',.3],['dodge',.22],['cast',.3],['hit',.18]]){
   const q={world,entityId:'hero',action,facing:'se'},v=c.sample({...q,elapsed:0},{preview:true});assert.equal(v.status,'candidate');
   const frames=c.manifest.assets[0].clips[action].se;assert.equal(frames.length,4);assert.ok(Math.abs(frames.reduce((n,f)=>n+f.duration,0)-duration)<1e-8);
   assert.equal(v.frame.contact,action==='attack3');assert.equal(c.sample({...q,elapsed:duration},{preview:true}).frameIndex,3);
  }
 }
});
