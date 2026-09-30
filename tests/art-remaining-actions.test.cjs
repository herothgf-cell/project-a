'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Art=require('../art-loader.js');
for(const world of ['reality','murim'])for(const action of ['attack2','attack3'])for(const facing of ['e','w','n','s','ne','nw','sw'])test(`${world} ${action} ${facing} has its own four-frame contact sequence`,()=>{
 const a=require('../assets/art/'+world+'/hero/yunseo/candidate.json'),c=Art.createCatalog(a),q={world,entityId:'hero',action,facing};
 const v=c.sample({...q,elapsed:0,loop:false},{preview:true});assert.equal(v.status,'candidate');
 const clip=a.assets[0].clips[action][facing];assert.equal(clip.length,4);assert.equal(clip[0].contact,true);assert.equal(clip.filter(f=>f.contact).length,1);
 assert.deepEqual(clip.map(f=>f.duration),[.06,.075,.075,.09]);assert.equal(c.sample({...q,elapsed:.061,loop:false},{preview:true}).frameIndex,1);
 assert.notEqual(clip[0].atlas,a.assets[0].clips.attack1[facing][0].atlas);
 assert.equal(c.resolve({...q,world:world==='reality'?'murim':'reality'},{preview:true}).status,'BLOCKED_ART');
});
