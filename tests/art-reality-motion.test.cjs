'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Art=require('../art-loader.js'),Runtime=require('../art-runtime.js');
const data=require('../assets/art/reality/hero/yunseo/candidate.json');
for(const facing of ['e','n','w','s','ne','sw','nw'])test('reality '+facing+' attack uses its own four contact-clock frames and planted sockets',()=>{
 const catalog=Art.createCatalog(data);
 const sample=catalog.sample({world:'reality',entityId:'hero',action:'attack1',facing,elapsed:0,loop:false},{preview:true});
 assert.equal(sample.status,'candidate');
 const frames=data.assets[0].clips.attack1[facing];
 assert.equal(frames.length,4);assert.equal(frames.filter(f=>f.contact).length,1);assert.equal(frames[0].contact,true);
 assert.equal(frames.reduce((t,f)=>t+f.duration,0),.3);
 for(const frame of frames){const placed=Runtime.placement({frame},{x:500,y:600},frame.displayHeight);assert.ok(Math.abs(placed.sockets.foot.x-500)<1e-8);assert.ok(Math.abs(placed.sockets.foot.y-600)<1e-8);}
 assert.equal(catalog.resolve({world:'murim',entityId:'hero',action:'attack1',facing},{preview:true}).status,'BLOCKED_ART');
});
