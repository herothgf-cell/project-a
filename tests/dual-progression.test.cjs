const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../dual-progression.js');
test('checkpoint retry discards failed uses but credits earlier equipped skills once',()=>{
 const s=P.initial();P.begin(s,'raid','basic');P.use(s,'g1');P.checkpoint(s);P.use(s,'r1');P.retry(s);P.use(s,'g2');
 const receipt=P.finish(s);assert.deepEqual(receipt.skills,['g1','g2']);assert.equal(s.counts.g1,1);assert.equal(s.counts.r1,0);assert.equal(s.raids,1);assert.equal(receipt.crystal,4);assert.equal(P.finish(s),false);
 P.begin(s,'raid','swarm');P.use(s,'g1');assert.equal(P.finish(s).crystal,2);
});
test('formal training credits only the chosen skill and has no farming currency',()=>{
 const s=P.initial();P.begin(s,'training','plum-first');P.use(s,'samjae');assert.equal(P.finish(s),false);P.use(s,'plum-first');const r=P.finish(s);assert.deepEqual(r.skills,['plum-first']);assert.equal(r.xp,0);assert.equal(r.crystal,0);assert.equal(s.counts.samjae,0);
});
test('retreat cancels pending credit and locked conditions cannot start',()=>{
 const s=P.initial();assert.equal(P.begin(s,'raid','core'),false);P.begin(s,'bounty','scattered');P.use(s,'samjae');P.abandon(s);assert.equal(P.finish(s),false);assert.equal(s.counts.samjae,0);
});
test('invalid counters and duplicate pending skill entries are rejected',()=>{
 const s=P.initial();s.raids=-1;assert.throws(()=>P.validate(s));s.raids=0;P.begin(s,'raid','basic');s.run.used=['g1','g1'];assert.throws(()=>P.validate(s));
});
