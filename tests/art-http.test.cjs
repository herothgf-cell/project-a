'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createServer}=require('../server.cjs');
test('production server serves catalog but excludes review images, references, and traversal',async()=>{
 const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+s.address().port;
 try{
  const r=await fetch(base+'/assets/art/manifest.json');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/application\/json/);
  assert.equal((await fetch(base+'/assets/art/reality/hero/yunseo/idle-candidate-v1.png')).status,404);
  for(const p of ['/references/manifest.json','/docs/codex-art-handoff/00_READ_FIRST.md','/assets/art/%2e%2e/%2e%2e/package.json','/art-review.html'])assert.equal((await fetch(base+p)).status,404,p);
 }finally{await new Promise(r=>s.close(r));}
});
test('explicit local art review server exposes actual image bytes and HEAD MIME, not source boards',async()=>{
 const s=createServer({artReview:true});await new Promise(r=>s.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+s.address().port;
 try{
  const p='/assets/art/reality/hero/yunseo/idle-candidate-v1.png';
  const r=await fetch(base+p);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/png');
  const bytes=Buffer.from(await r.arrayBuffer());assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  const h=await fetch(base+p,{method:'HEAD'});assert.equal(h.status,200);assert.equal((await h.text()).length,0);
  assert.equal((await fetch(base+'/art-review.html')).status,200);assert.equal((await fetch(base+'/references/codex-art/reality-world-reference.webp')).status,404);
 }finally{await new Promise(r=>s.close(r));}
});
