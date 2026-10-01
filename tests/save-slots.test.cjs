const test=require('node:test'),assert=require('node:assert/strict');
let Slots;try{Slots=require('../save-slots.js');}catch{}
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))};};
test('new and archived writes never overwrite original including corrupt bytes',()=>{
 assert.ok(Slots,'save slots service exists');
 for(const raw of ['broken { 원문','{"version":9,"gold":40}']){const s=memory();s.setItem('dualworld.save.v1',raw);Slots.preserveLegacy(s);assert.equal(s.getItem('dualworld.legacy.v011'),raw);Slots.write(s,Slots.keys.legacyCopy,'changed');Slots.preserveLegacy(s);Slots.write(s,Slots.keys.current,'new');assert.equal(s.getItem('dualworld.save.v1'),raw);assert.equal(s.getItem('dualworld.legacy.v011'),'changed');assert.throws(()=>Slots.write(s,Slots.keys.legacyOriginal,'bad'));}
});
test('failed archival copy preserves source and reports failure',()=>{assert.ok(Slots);const s={getItem:k=>k==='dualworld.save.v1'?'raw':null,setItem:()=>{throw Error('quota');}};assert.throws(()=>Slots.preserveLegacy(s),/quota/);assert.equal(s.getItem('dualworld.save.v1'),'raw');});
