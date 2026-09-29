'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),A=require('../art-runtime.js');
test('VFX reads actual event and never fabricates a parry or repeated storm impact',()=>{
 const source={kind:'storm',x:12,y:34,life:.6,max:.6,range:180};const before=JSON.stringify(source);
 assert.equal(A.effectQuery(source).action,'cell-0');
 assert.equal(A.effectQuery({...source,life:.1}).action,'cell-3');
 assert.equal(A.effectQuery({kind:'fate-guard',life:.5,max:1}).action,'cell-0');
 assert.equal(A.effectQuery({kind:'fate-parry',life:.5,max:1}).action,'cell-1');
 assert.equal(A.effectQuery({kind:'interpret-seal-guide',life:.5,max:1}),null);
 assert.equal(JSON.stringify(source),before);
});
test('blade selection preserves combo and moon rather than multiplying hit frames',()=>{
 for(let combo=1;combo<=3;combo++)assert.equal(A.effectQuery({kind:'slash',combo,life:.2,max:.25}).action,'cell-'+(combo-1));
 assert.equal(A.effectQuery({kind:'slash',skill:'moon',combo:3,life:.2,max:.25}).action,'cell-3');
 assert.equal(A.effectQuery({kind:'text'}),null);
});
