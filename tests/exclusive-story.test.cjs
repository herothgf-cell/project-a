const {test}=require('node:test');
const assert=require('node:assert/strict');
const S=require('../exclusive-story.js');
test('story requires ordered evidence and awards only once',()=>{
 const s=S.initial();assert.equal(S.next(s).id,'recovery-work');
 assert.equal(S.complete(s,'stone-accident',{kind:'scene'}).changed,false);
 assert.equal(S.complete(s,'recovery-work',{kind:'scene'}).changed,false);
 assert.equal(S.complete(s,'recovery-work',{kind:'combat'}).changed,true);
 assert.equal(S.complete(s,'recovery-work',{kind:'combat'}).changed,false);
 assert.equal(S.complete(s,'stone-accident',{kind:'scene'}).changed,true);
 assert.equal(S.next(s).id,'clinic-return');
});
test('all eleven chapters have ordered events and isolated records',()=>{
 const s=S.initial(),chapters=new Set();let event;
 while((event=S.next(s))){chapters.add(event.chapter);assert.equal(S.complete(s,event.id,{kind:event.kind}).changed,true);}
 assert.equal(chapters.size,11);assert.equal(s.chapter,11);assert.equal(S.next(s),null);
 assert.ok(s.records.reality.length);assert.ok(s.records.murim.length);
 assert.doesNotThrow(()=>S.validate(JSON.parse(JSON.stringify(s))));
});
test('corrupt or out of order saves are rejected',()=>{
 assert.throws(()=>S.validate({...S.initial(),completed:['two-notebooks']}));
 assert.throws(()=>S.validate({...S.initial(),completed:['unknown']}));
 assert.throws(()=>S.validate({...S.initial(),chapter:99}));
});
