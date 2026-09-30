'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Art=require('../art-loader.js'),Runtime=require('../art-runtime.js');
for(const world of ['reality','murim'])for(const facing of ['e','w','n','s','ne','nw','sw'])test(world+' '+facing+' dodge resolves four independent whole-body frames on the dash clock',()=>{
 const data=require('../assets/art/'+world+'/hero/yunseo/candidate.json'),catalog=Art.createCatalog(data);
 const v=catalog.sample({world,entityId:'hero',action:'dodge',facing,elapsed:.07,loop:false},{preview:true});
 assert.equal(v.status,'candidate');const clip=data.assets[0].clips.dodge[facing];
 assert.equal(clip.length,4);assert.ok(Math.abs(clip.reduce((s,f)=>s+f.duration,0)-.22)<1e-12);
 assert.equal(clip.some(f=>f.contact),false);assert.equal(v.frameIndex,1);
 const p=Runtime.placement(v,{x:500,y:600},v.frame.displayHeight);assert.ok(Math.abs(p.sockets.foot.x-500)<1e-8);assert.ok(Math.abs(p.sockets.foot.y-600)<1e-8);
 assert.equal(catalog.resolve({world:world==='murim'?'reality':'murim',entityId:'hero',action:'dodge',facing},{preview:true}).status,'BLOCKED_ART');
});
