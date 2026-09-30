'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),A=require('../art-runtime.js');
test('persistent seal artwork follows the authoritative field until expiration, not the short cast burst',()=>{
 const f={x:80,y:120,radius:165,life:3.1},before=JSON.stringify(f);
 const v=A.fieldVisual(f);
 assert.equal(v.query.entityId,'vfx.seal');assert.equal(v.query.action,'cell-0');
 assert.deepEqual(v.destination,[-85,-45,330,330]);assert.equal(v.alpha,.7);
 assert.ok(Math.abs(A.fieldVisual({...f,radius:240,life:.1}).alpha-.14)<1e-12);
 assert.equal(A.fieldVisual({...f,life:0}),null);assert.equal(A.fieldVisual(null),null);
 assert.equal(JSON.stringify(f),before);
 const guard=A.fieldVisual(f,'ripple');assert.equal(guard.query.entityId,'vfx.ripple');assert.equal(guard.query.action,'cell-2');
});
test('ground-plane VFX remains level while directional cuts preserve the release angle',()=>{
 for(const kind of ['fate-seal','fate-chain','interpret-seal-hold','interpret-seal-guide','interpret-ripple-guard','fate-parry','storm']){
  const f={kind,angle:Math.PI/4,presentationAngle:Math.PI/3,x:12,y:34};const before=JSON.stringify(f);
  assert.equal(A.effectRotation(f),0);assert.equal(JSON.stringify(f),before);
 }
 assert.equal(A.effectRotation({kind:'fate-ultimate',path:'seal',angle:1}),0);
 assert.equal(A.effectRotation({kind:'fate-wave',angle:.4,presentationAngle:.7}),.7);
 assert.equal(A.effectRotation({kind:'interpret-echo-replay',presentationPhase:'contact',angle:-.5}),-.5);
});
test('VFX reads actual event and never fabricates a parry or repeated storm impact',()=>{
 const source={kind:'storm',x:12,y:34,life:.6,max:.6,range:180};const before=JSON.stringify(source);
 assert.equal(A.effectQuery(source).action,'cell-0');
 assert.equal(A.effectQuery({...source,life:.1}).action,'cell-3');
 assert.equal(A.effectQuery({kind:'fate-guard',life:.5,max:1}).action,'cell-0');
 assert.equal(A.effectQuery({kind:'fate-parry',life:.5,max:1}).action,'cell-1');
 assert.equal(A.effectQuery({kind:'interpret-seal-guide',life:.5,max:1}).action,'cell-0');
 assert.equal(JSON.stringify(source),before);
});
test('six interpretations distinguish preparation, conditional bind and delayed contact',()=>{
 const q=(kind,phase)=>A.effectQuery({kind:'interpret-'+kind,presentationPhase:phase,life:.5,max:1});
 assert.equal(q('ripple-return','charge').entityId,'vfx.ripple');
 assert.equal(q('ripple-return','contact').entityId,'vfx.blade');
 assert.equal(q('ripple-guard').action,'cell-2');
 assert.equal(q('echo-return').action,'cell-1');
 assert.equal(q('echo-replay','prepare').entityId,'vfx.echo');
 assert.equal(q('echo-replay','contact').entityId,'vfx.blade');
 assert.equal(q('seal-hold','field').action,'cell-0');
 assert.equal(q('seal-hold','bind').action,'cell-2');
 assert.equal(q('seal-guide','contact').action,'cell-2');
 for(const path of ['ripple','echo','seal'])assert.ok(A.effectQuery({kind:'fate-ultimate',path,life:1,max:1.2}));
});
test('blade selection preserves combo and moon rather than multiplying hit frames',()=>{
 for(let combo=1;combo<=3;combo++)assert.equal(A.effectQuery({kind:'slash',combo,life:.2,max:.25}).action,'cell-'+(combo-1));
 assert.equal(A.effectQuery({kind:'slash',skill:'moon',combo:3,life:.2,max:.25}).action,'cell-3');
 assert.equal(A.effectQuery({kind:'text'}),null);
});
