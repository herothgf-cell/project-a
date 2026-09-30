'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Art=require('../art-loader.js');
for(const world of ['reality','murim'])for(const facing of ['e','w','n','s','ne','nw','sw'])test(`${world} ${facing} hit reaction has its own bounded recovery frames`,()=>{
 const manifest=require('../assets/art/'+world+'/hero/yunseo/candidate.json'),catalog=Art.createCatalog(manifest),query={world,entityId:'hero',action:'hit',facing};
 assert.equal(catalog.sample({...query,elapsed:0,loop:false},{preview:true}).status,'candidate');
 for(const [elapsed,frameIndex] of [[0,0],[.046,1],[.091,2],[.136,3],[.25,3]])assert.equal(catalog.sample({...query,elapsed,loop:false},{preview:true}).frameIndex,frameIndex);
 const frames=manifest.assets[0].clips.hit[facing];assert.equal(frames.length,4);assert.ok(frames.every(f=>f.contact===false));
 assert.notEqual(frames[0].atlas,manifest.assets[0].clips.cast[facing][0].atlas);
 assert.equal(catalog.resolve({...query,world:world==='reality'?'murim':'reality'},{preview:true}).status,'BLOCKED_ART');
});
