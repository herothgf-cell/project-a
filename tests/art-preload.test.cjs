'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Art=require('../art-loader.js');
const v=n=>({status:'candidate',atlas:{path:`assets/art/reality/test/${n}.png`,width:4,height:4}});
test('prepared pinned images survive scenery churn within budget',async()=>{
 const c=Art.createResidentImages({maxBytes:192,load:async x=>({status:'loaded',image:{path:x.atlas.path}})});
 assert.equal((await c.prepare([v('a'),v('b')])).ok,true);
 c.request(v('c'));await new Promise(setImmediate);c.request(v('d'));await new Promise(setImmediate);
 assert.ok(c.get(v('a').atlas.path));assert.ok(c.get(v('b').atlas.path));assert.ok(c.bytes<=192);
 assert.equal((await c.prepare([v('e'),v('f')])).ok,true);assert.ok(c.get(v('e').atlas.path));
});
test('failed preparation stays blocked and retry recovers',async()=>{
 let fail=true;const c=Art.createResidentImages({load:async()=>fail?{status:'BLOCKED_ART',reason:'network'}:{status:'loaded',image:{}}});
 assert.equal((await c.prepare([v('a')])).ok,false);fail=false;c.retryFailures();assert.equal((await c.prepare([v('a')])).ok,true);
});
test('an oversized pinned set fails instead of eviction/reload loop',async()=>{
 const c=Art.createResidentImages({maxBytes:64,load:async()=>({status:'loaded',image:{}})});
 assert.equal((await c.prepare([v('a'),v('b')])).ok,false);
});
test('image readiness waits for decode, not just network load',async()=>{
 let image,decoded;class FakeImage{constructor(){image=this;this.naturalWidth=4;this.naturalHeight=4;}decode(){return new Promise(r=>decoded=r);}}
 const c=Art.createImageCache({ImageClass:FakeImage});let ready=false;const p=c.load(v('decoded')).then(x=>{ready=true;return x;});image.onload();await new Promise(setImmediate);assert.equal(ready,false);decoded();assert.equal((await p).status,'loaded');
});
