'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=fs.existsSync(path.join(__dirname,'../wuxia-direction.js'))?require('../wuxia-direction.js'):{};
test('eight facing sectors use distinct front side back sprite combinations',()=>{assert.equal(typeof D.facing,'function');const frames=Array.from({length:8},(_,i)=>D.facing(i*Math.PI/4));assert.equal(new Set(frames.map(f=>f.name)).size,8);assert.equal(new Set(frames.map(f=>f.cell+':'+f.flip)).size,8);assert.equal(D.facing(-Math.PI/2).name,'N');assert.equal(D.facing(Math.PI/2).name,'S');});
test('wrapped angles and invalid inputs have a safe deterministic facing',()=>{assert.equal(typeof D.facing,'function');assert.deepEqual(D.facing(Math.PI*2),D.facing(0));assert.deepEqual(D.facing(NaN),D.facing(Math.PI/2));assert.deepEqual(D.facing(-Math.PI/2),D.facing(Math.PI*1.5));});
