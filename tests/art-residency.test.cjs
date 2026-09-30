'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Art=require('../art-loader.js');
const visual=(name,size=4)=>({status:'candidate',atlas:{path:`assets/art/reality/test/${name}.png`,width:size,height:size}});
test('explicit retry recovers a failed image without reloading the game or save',async()=>{
 let attempt=0;const v=visual('retry'),c=Art.createResidentImages({load:async()=>++attempt===1?{status:'BLOCKED_ART',reason:'network'}:{status:'loaded',image:{ok:true}}});
 c.request(v);await new Promise(setImmediate);assert.equal(c.failure(v.atlas.path),'network');
 c.retryFailures();c.request(v);await new Promise(setImmediate);assert.equal(c.get(v.atlas.path).ok,true);assert.equal(attempt,2);
});
test('failed asynchronous images notify a static review page so loading does not hang',async()=>{
 const errors=[];const c=Art.createResidentImages({load:async()=>({status:'BLOCKED_ART',reason:'network'}),onError:(path,reason)=>errors.push({path,reason})});
 c.request(visual('missing'));await new Promise(setImmediate);
 assert.deepEqual(errors,[{path:visual('missing').atlas.path,reason:'network'}]);assert.equal(c.pending,0);
});
test('resident image budget evicts least recently used pixels and reloads on demand',async()=>{
 const pending=[];const c=Art.createResidentImages({maxBytes:128,maxConcurrent:1,load:v=>new Promise(r=>pending.push({v,r}))});
 const a=visual('a'),b=visual('b'),d=visual('c');
 assert.equal(c.request(a),null);assert.equal(c.request(a),null);assert.equal(pending.length,1);
 pending.shift().r({status:'loaded',image:{name:'a'}});await new Promise(setImmediate);
 c.request(b);pending.shift().r({status:'loaded',image:{name:'b'}});await new Promise(setImmediate);
 assert.equal(c.request(a).name,'a');c.request(d);pending.shift().r({status:'loaded',image:{name:'c'}});await new Promise(setImmediate);
 assert.equal(c.bytes,128);assert.equal(c.get(b.atlas.path),undefined);assert.equal(c.get(a.atlas.path).name,'a');
 assert.equal(c.request(b),null);assert.equal(pending.length,1);
});
test('queued requests respect concurrency; oversized and failed images remain safely unavailable',async()=>{
 const pending=[];const c=Art.createResidentImages({maxBytes:64,maxConcurrent:1,load:v=>new Promise(r=>pending.push({v,r}))});
 c.request(visual('a'));c.request(visual('b'));assert.equal(pending.length,1);
 pending.shift().r({status:'BLOCKED_ART',reason:'network'});await new Promise(setImmediate);assert.equal(pending.length,1);
 assert.equal(c.request(visual('a')),null);assert.equal(c.failure(visual('a').atlas.path),'network');
 pending.shift().r({status:'loaded',image:{name:'b'}});await new Promise(setImmediate);
 assert.equal(c.request(visual('large',8)),null);assert.equal(pending.length,0);assert.equal(c.bytes,64);
});
