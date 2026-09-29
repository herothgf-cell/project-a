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
