'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

function meter(){
  const context={DualWorld:{AREAS:{},clamp() {},dist() {}},WorldArt:{},FateArt:{},matchMedia:()=>({matches:false}),devicePixelRatio:2};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','render.js'),'utf8'),context);
  return new context.PerfMeter();
}

test('tracks average and recent frame time with a bounded recent window',()=>{
  const m=meter();m.record(20);m.record(40);assert.equal(m.averageMs,30);assert.equal(m.recentMs,30);
  for(let i=0;i<120;i++)m.record(10);
  assert.equal(m.averageMs,(20+40+1200)/122);
  assert.equal(m.recentMs,10);
});

test('slow frame count is cumulative even when renderer pressure decays',()=>{
  const m=meter();m.record(36);m.record(16);m.record(50);
  assert.equal(m.slowTotal,2);assert.equal(m.frames,3);
  m.record(0);assert.equal(m.frames,3);
});
