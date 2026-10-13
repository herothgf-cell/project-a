'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../experiments/skillform/model.js');
const make=(s,f)=>M.compose(s,M.recipes[f]);
function learned(){const s=M.initial();make(s,'sword');M.prove(s,'sword');return s;}
test('tutorial learns four axes, compatible recipes only, no mystery failures',()=>{
 const s=M.initial();assert.throws(()=>make(s,'ripple'),/배우/);assert.throws(()=>M.compose(s,{...M.recipes.sword,qi:'rebound'}),/배우|호환/);
 const a=make(s,'sword');assert.equal(a.family,'sword');assert.equal(s.proven.length,0);M.prove(s,'sword');M.learn(s,'ripple');
 assert.throws(()=>M.compose(s,{...M.recipes.ripple,form:'slash'}),/호환/);assert.equal(make(s,'ripple').family,'ripple');
});
test('links require two proven basics, same proof never pays twice, reality needs link proof',()=>{
 const s=learned();M.learn(s,'ripple');make(s,'ripple');assert.throws(()=>M.link(s,'ripple',260),/체득/);M.prove(s,'ripple');
 const a=M.link(s,'ripple',260);assert.equal(a.costExtra,2);assert.throws(()=>M.applyReality(s,'ripple'),/시험/);
 M.proveLink(s,'ripple');M.proveLink(s,'ripple');M.applyReality(s,'ripple');assert.deepEqual(s.linkProof,['ripple']);assert.equal(s.reality,'ripple');
 assert.throws(()=>M.link(s,'ripple',380),/범위/);s.rank=5;assert.equal(M.bounds(s,'ripple').max,320);
});
test('recomposition is deterministic, replaces draft without farming or unbounded recipes',()=>{
 const s=learned();const first=make(s,'sword');assert.deepEqual(make(s,'sword'),first);assert.equal(Object.keys(s.basics).length,1);assert.deepEqual(s.proven,['sword']);
 assert.throws(()=>M.compose(s,{...M.recipes.sword,form:['slash','step']}),/요소/);
});
test('save roundtrip is isolated and rejects unknown, impossible, future and oversized state',()=>{
 const s=learned();assert.deepEqual(M.load(M.serialize(s)),s);assert.equal(M.KEY,'dualworld.experiment.skillform.v1');
 for(const change of [{version:999},{reality:'seal'},{proven:['sword','seal']},{learned:['sword','bad']},{rank:9},{linkProof:['echo']}])assert.throws(()=>M.load(JSON.stringify({...s,...change})));
 assert.throws(()=>M.load(' '.repeat(50001)));assert.throws(()=>M.load(JSON.stringify({...s,basics:{sword:{...s.basics.sword,qi:'cold'}}})));
});
test('later links respect minimum mastery and lowering fixture rank clears incompatible active links',()=>{
 const s=learned();M.learn(s,'seal');make(s,'seal');M.prove(s,'seal');assert.throws(()=>M.link(s,'seal',100),/3성/);
 M.setRank(s,3);M.link(s,'seal',100);M.proveLink(s,'seal');M.applyReality(s,'seal');M.setRank(s,1);assert.equal(s.reality,null);assert.equal(s.links.seal,undefined);assert.doesNotThrow(()=>M.serialize(s));
});
test('save rejects nonexistent sword links in result history',()=>{const s=learned();s.results.push({family:'sword',world:'murim',linked:true,success:true,hits:1,damage:0,spent:1,seconds:1});assert.throws(()=>M.load(JSON.stringify(s)),/결과/);});
