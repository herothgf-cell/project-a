'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Game,AREAS}=require(process.env.BASELINE_CORE||'../game.js');
function at(g,id){const o=AREAS[g.area].points.find(p=>p.id===id);assert.ok(o,id);g.player.x=o.x;g.player.y=o.y;return g.interact();}
function tick(g){for(let i=0;i<8;i++)g.step(.05);}
function kill(g,e){for(let i=0;i<250&&e.hp>0;i++){g.player.x=e.x-42;g.player.y=e.y;g.act('attack');g.player.x=100;g.player.y=950;tick(g);}assert.equal(e.hp,0,e.name);}
function guards(g){for(const e of g.enemies.filter(e=>!e.boss))kill(g,e);}
test('two new areas exist with distinct encounter objectives',()=>{assert.ok(AREAS.ruins);assert.ok(AREAS.harbor);assert.equal(AREAS.ruins.points.filter(p=>p.kind==='seal').length,3);assert.equal(AREAS.harbor.points.filter(p=>p.kind==='seal').length,2);});
test('full two-chapter journey uses interactions and combat through the ending',()=>{
  const g=new Game();at(g,'warden');assert.equal(g.progress,1);at(g,'portal');at(g,'master');assert.equal(g.progress,2);at(g,'forest');guards(g);kill(g,g.enemies.find(e=>e.boss));assert.equal(g.progress,3);
  g.retreat();at(g,'master');assert.equal(g.training,2);at(g,'portal');at(g,'warden');assert.equal(g.progress,5);at(g,'gate');guards(g);kill(g,g.enemies.find(e=>e.boss));assert.equal(g.progress,6);
  g.retreat();at(g,'warden');assert.equal(g.progress,7);at(g,'portal');at(g,'master');assert.equal(g.progress,8);at(g,'ruins');assert.equal(g.area,'ruins');
  at(g,'seal1');assert.deepEqual(g.activated,[]);guards(g);const boss=g.enemies.find(e=>e.boss);g.player.x=boss.x-40;g.player.y=boss.y;g.act('moon');assert.equal(boss.hp,boss.maxHp);
  for(const id of ['seal1','seal2','seal3'])at(g,id);assert.equal(g.activated.length,3);kill(g,boss);assert.equal(g.progress,9);
  g.retreat();const before=g.stats().attack;at(g,'master');assert.equal(g.training,3);assert.equal(g.stats().attack,before+6);assert.equal(g.progress,10);at(g,'portal');at(g,'warden');assert.equal(g.progress,11);at(g,'harbor');guards(g);at(g,'anchor1');at(g,'anchor2');kill(g,g.enemies.find(e=>e.boss));assert.equal(g.progress,12);
  assert.equal(g.harborClears,1);g.retreat();assert.equal(g.area,'city');assert.match(at(g,'warden').text,/제2장 완료/);const h=Game.load(g.save());assert.equal(h.progress,12);assert.equal(h.training,3);
});
test('all six spawns, points and enemies have reachable walkable positions',()=>{
  assert.equal(Object.keys(AREAS).length,6);
  for(const [name,a] of Object.entries(AREAS)){
    const g=new Game();g.enter(name);const step=20,cols=Math.ceil(a.w/step),rows=Math.ceil(a.h/step);
    const key=(x,y)=>Math.round(x/step)+','+Math.round(y/step),seen=new Set(),queue=[[Math.round(g.player.x/step),Math.round(g.player.y/step)]];let head=0;
    while(head<queue.length){const [x,y]=queue[head++],id=x+','+y;if(seen.has(id)||x<0||y<0||x>=cols||y>=rows||g.blocked(x*step,y*step))continue;seen.add(id);queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
    for(const p of [...a.points,...g.enemies])assert.ok(seen.has(key(p.x,p.y)),name+': '+(p.label||p.name));
  }
});
test('retreat resets unfinished seals but keeps chapter milestone',()=>{assert.ok(AREAS.ruins);const g=new Game();g.progress=8;g.training=2;g.enter('ruins');guards(g);at(g,'seal1');assert.equal(g.activated.length,1);g.retreat();g.enter('ruins');assert.equal(g.progress,8);assert.equal(g.activated.length,0);assert.equal(g.enemies.filter(e=>e.hp>0).length,6);});
test('repeated report and already activated seal never duplicate rewards',()=>{const g=new Game();g.progress=9;g.training=2;g.enter('village');at(g,'master');const gold=g.gold;at(g,'master');assert.equal(g.gold,gold);});
