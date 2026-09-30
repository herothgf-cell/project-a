'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Art=require('../art-loader.js'),Runtime=require('../art-runtime.js');
const data=require('../assets/art/murim/hero/yunseo/candidate.json'),catalog=Art.createCatalog(data);
for(const facing of ['e','n','w','s','ne','nw','sw'])test('murim attack1 '+facing+' has independent bounded frames with one contact clock',()=>{
 const v=catalog.sample({world:'murim',entityId:'hero',action:'attack1',facing,elapsed:0,loop:false},{preview:true});
 assert.equal(v.status,'candidate');assert.equal(v.atlas.height,1254,'use separated square cells, not the contaminated narrow strip');
 const frames=data.assets[0].clips.attack1[facing];assert.equal(frames.length,4);
 assert.equal(frames.filter(f=>f.contact).length,1);assert.equal(frames[0].contact,true);
 assert.equal(frames.reduce((t,f)=>t+f.duration,0),.3);
 for(const f of frames){const placed=Runtime.placement({frame:f},{x:500,y:600},f.displayHeight);assert.ok(Math.abs(placed.sockets.foot.x-500)<1e-8);assert.ok(Math.abs(placed.sockets.foot.y-600)<1e-8);}
 assert.equal(catalog.resolve({world:'reality',entityId:'hero',action:'attack1',facing},{preview:true}).status,'BLOCKED_ART');
});
