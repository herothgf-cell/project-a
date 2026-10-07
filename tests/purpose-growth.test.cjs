const test=require('node:test'),assert=require('node:assert/strict');
const {inherited}=require('./world-fixtures.cjs');
const {Game}=require('../world-game.js');
const A=require('../advancement.js'),R=require('../boundary-resonance.js');
test('advancement menu unlock is separate from remaining trial qualifications',()=>{
 const g=inherited();g.v12ChapterCompleted=()=>false;
 assert.equal(A.describe(g,'realm').menuUnlocked,false);
 g.v12ChapterCompleted=n=>n===3;g.worldGrowth.murim.mastery={sword:0,ripple:0,echo:0,seal:0};
 assert.equal(A.describe(g,'realm').menuUnlocked,true);
 assert.equal(A.describe(g,'realm').canStart,false);
 assert.equal(A.describe(g,'hunter').menuUnlocked,true);
});
test('growth receipts are individual persistent news and do not disappear on ordinary screen reads',()=>{
 const g=inherited();R.sync(g);g.refreshNews();
 const id='resonance:crystal:inherit:first';
 const receipt=g.newsList().find(x=>x.id===id);
 assert.ok(receipt);assert.equal(receipt.section,'status');assert.equal(receipt.subject,'crystal');
 assert.ok(g.newsList().some(x=>x.id==='resonance:seal:art:ripple'&&x.subject==='seal'));
 const original=R.balance(g);g.readNews('inherit:ripple');assert.ok(g.unreadNews('status').some(x=>x.id===id));
 g.readNews(id);g.refreshNews();assert.equal(g.newsList().filter(x=>x.id===id).length,1);
 const loaded=Game.load(g.save());assert.equal(loaded.newsList().find(x=>x.id===id).read,true);assert.deepEqual(R.balance(loaded),original);
});
test('story unlock notices use actual chapter completion without spending currency',()=>{
 const g=inherited();g.v12ChapterCompleted=()=>false;g.refreshNews();assert.ok(!g.newsList().some(x=>x.id==='menu:realm'));
 g.v12ChapterCompleted=n=>n===3;g.refreshNews();
 assert.ok(g.newsList().some(x=>x.id==='menu:realm'&&x.subject==='realm'));
 assert.ok(g.newsList().some(x=>x.id==='menu:hunter'&&x.subject==='hunter'));
});
