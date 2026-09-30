'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),R=require('../art-runtime.js'),Art=require('../art-loader.js');
test('walk takes 100px per cycle, freezes without travel, and leaves attack clock intact',()=>{
 const a=Art.prototypeProfile(require('../assets/art/reality/hero/yunseo/candidate.json')),c=Art.createCatalog(a),e={walking:true,face:0,motion:{stride:50}},before=JSON.stringify(e);
 const q=R.query('reality','hero',e,10),v=c.sample(q,{preview:true});
 assert.equal(v.frameIndex,2,'50px must be halfway through a gait, not a new rapid cycle');
 assert.equal(R.query('reality','hero',e,99).elapsed,q.elapsed);assert.equal(JSON.stringify(e),before);
 e.motion.stride=100;assert.equal(c.sample(R.query('reality','hero',e,10),{preview:true}).frameIndex,0);
 e.motion.instance={action:'attack',combo:1,angle:0,startedAt:10,duration:.3};assert.ok(Math.abs(R.query('reality','hero',e,10.1).elapsed-.1)<1e-9);
});
