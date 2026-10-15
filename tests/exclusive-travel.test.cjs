const {test}=require('node:test');
const assert=require('node:assert/strict');
const T=require('../exclusive-travel.js');
test('crossing is available immediately without rest',()=>{
 const s=T.initial();s.arrivedAt=0;s.minutes=360-1/60;
 assert.equal(T.canCross(s,{area:'home'}).ok,true);
 T.tick(s,.1);assert.equal(T.remaining(s),0);
 assert.equal(T.canCross(s,{area:'home'}).ok,true);
 s.arrivedAt=s.minutes;T.tick(s,12);assert.equal(T.rest(s),0);assert.equal(T.remaining(s),0);
});
test('only fixed locations and alone; invalid time is rejected',()=>{
 const s=T.initial();assert.equal(T.canCross(s,{area:'city'}).ok,false);
 assert.equal(T.canCross(s,{area:'shrine',companions:1}).ok,false);
 assert.equal(T.canCross(s,{area:'shrine'}).ok,true);
 for(const n of [NaN,Infinity,-1])assert.throws(()=>T.tick(s,n));
 assert.throws(()=>T.validate({...s,minutes:-1}));
});
function game(){return {area:'home',player:{x:10,y:10,hp:100},worldState:{exclusiveTravel:T.initial()},enter(id){this.area=id;this.entries=(this.entries||0)+1;return true;}};}
test('short transition restarts after movement, damage or pause and cross exactly once',()=>{
 const g=game();assert.equal(T.start(g).ok,true);T.update(g,1.1,{});assert.equal(g.area,'home');
 g.player.x++;T.update(g,.1,{});assert.equal(g.travelRuntime,null);
 T.start(g);g.player.hp--;T.update(g,1,{});assert.equal(g.travelRuntime,null);
 T.start(g);T.update(g,3,{paused:true});assert.equal(g.travelRuntime,null);
 T.start(g);T.update(g,10,{});T.update(g,10,{});assert.equal(g.area,'shrine');assert.equal(g.entries,1);
 assert.equal(T.remaining(g.worldState.exclusiveTravel),0);
});
test('failed arrival does not consume cooldown',()=>{
 const g=game();g.enter=()=>false;T.start(g);T.update(g,10,{});
 assert.equal(g.worldState.exclusiveTravel.arrivedAt,null);
});
