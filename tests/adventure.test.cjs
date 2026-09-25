'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Game,AREAS}=require('../game.js');
function at(g,id){const o=AREAS[g.area].points.find(p=>p.id===id);assert.ok(o,id);g.player.x=o.x;g.player.y=o.y;return g.interact();}
function ticks(g,n=8){for(let i=0;i<n;i++)g.step(.05);}
function fixture(progress=2,area='forest'){const g=new Game();g.progress=progress;g.training=progress>=10?3:progress>=4?2:progress>=2?1:0;g.enter(area);g.events=[];return g;}
function defeatEnemy(g,e){for(let i=0;i<250&&e.hp>0;i++){g.player.x=e.x-42;g.player.y=e.y;g.act('attack');g.player.x=100;g.player.y=800;ticks(g,8);}assert.equal(e.hp,0,e.name);}
function guards(g){for(const e of g.enemies.filter(e=>!e.boss))defeatEnemy(g,e);}
test('enemy targets have a display label',()=>{const g=fixture();assert.equal(g.target().label,g.enemies[0].name);});
test('village arrival tells player to meet mentor',()=>{const g=fixture(1,'village');assert.equal(typeof g.objective,'function');assert.match(g.objective().text,/백련|사부/);});
test('unknown actions cannot damage enemies or consume mana',()=>{const g=fixture();const snapshot=JSON.stringify(g.enemies);assert.equal(g.act('unknown'),false);assert.equal(JSON.stringify(g.enemies),snapshot);});
test('invalid simulation delta never poisons state',()=>{const g=new Game();g.step(NaN,{x:Infinity});assert.ok(Number.isFinite(g.playTime));assert.ok(Number.isFinite(g.player.x));});
test('attacks emit lifetime-bounded visible sword effects',()=>{const g=fixture();g.act('attack');assert.ok(Array.isArray(g.fx));assert.ok(g.fx.some(f=>f.kind==='slash'));ticks(g,40);assert.ok(!g.fx.some(f=>f.kind==='slash'));});
test('third combo strike is stronger',()=>{const g=fixture();g.act('attack');const a=g.fx?.findLast(f=>f.kind==='slash');ticks(g,7);g.act('attack');ticks(g,7);g.act('attack');assert.ok(a);const b=g.fx.findLast(f=>f.kind==='slash');assert.equal(b.combo,3);assert.ok(b.range>a.range);});
test('skill damage produces numbers and obeys cooldown',()=>{const g=fixture(),e=g.enemies[0];g.player.x=e.x-40;g.player.y=e.y;const hp=e.hp;assert.equal(g.act('moon'),true);assert.ok(e.hp<hp);assert.ok(g.fx.some(f=>f.kind==='text'));assert.equal(g.act('moon'),false);});
test('guarded boss does not attack or take damage',()=>{const g=fixture(),e=g.enemies.find(e=>e.boss);g.player.x=e.x-40;g.player.y=e.y;g.act('moon');assert.equal(e.hp,e.maxHp);ticks(g,100);assert.equal(e.wind,0);assert.equal(e.attacks,0);});
test('enemy telegraph can be escaped before impact',()=>{const g=fixture(),e=g.enemies[0];g.player.x=e.x-40;g.player.y=e.y;ticks(g,15);assert.ok(e.wind>0);const hp=g.player.hp;g.player.x=100;g.player.y=800;ticks(g,30);assert.equal(g.player.hp,hp);});
test('boss victory returns guidance to exit',()=>{const g=fixture();guards(g);defeatEnemy(g,g.enemies.find(e=>e.boss));assert.equal(g.progress,3);assert.equal(g.target().id,'exit');assert.ok(g.events.some(e=>e.type==='victory'));});
test('replaying chapter one does not regress chapter two',()=>{const g=fixture(10,'rift');guards(g);defeatEnemy(g,g.enemies.find(e=>e.boss));assert.equal(g.progress,10);});
test('supplies and upgrades spend gold and respect caps',()=>{const g=new Game();assert.equal(typeof g.buy,'function');g.gold=300;assert.equal(g.buy('potion'),true);assert.equal(g.potions,4);const before=g.stats().attack;assert.equal(g.buy('upgrade'),true);assert.equal(g.stats().attack,before+4);g.gold=0;assert.equal(g.buy('upgrade'),false);g.gold=100;g.potions=99;assert.equal(g.buy('potion'),false);});
test('supplies are unavailable inside a dungeon',()=>{const g=fixture();assert.equal(typeof g.buy,'function');assert.equal(g.buy('potion'),false);});
test('solid walls stop walking and dash',()=>{const g=new Game();assert.ok(AREAS.city.blocks?.length);const b=AREAS.city.blocks[0];g.player.x=b.x-18;g.player.y=b.y+b.h/2;g.player.face=0;g.act('dash');ticks(g,8);assert.ok(g.player.x<b.x);});
test('defeat returns to hub without erasing milestones',()=>{const g=fixture(5,'rift');g.player.hp=0;g.step(.05);assert.equal(g.area,'city');assert.equal(g.progress,5);assert.equal(g.training,2);assert.ok(g.events.some(e=>e.type==='defeat'));});
test('malformed progression cannot crash quest UI',()=>{const d=JSON.parse(new Game().save());d.progress=999;assert.throws(()=>Game.load(JSON.stringify(d)));});
test('negative resources and NaN-like saves are rejected',()=>{for(const value of [-1,'20',null]){const d=JSON.parse(new Game().save());d.gold=value;assert.throws(()=>Game.load(JSON.stringify(d)));}});
test('v1 checkpoints migrate without losing growth',()=>{const d={version:1,area:'rift',progress:6,training:2,level:5,xp:10,gold:135,potions:2,upgrade:3,clears:1};const g=Game.load(JSON.stringify(d));assert.equal(g.area,'city');assert.equal(g.gold,135);assert.equal(g.upgrade,3);assert.equal(g.progress,6);assert.equal(JSON.parse(g.save()).version,3);});
test('late quest in wrong world still leads to the portal',()=>{const g=fixture(3,'city');assert.equal(g.target().id,'portal');});
test('locked entrances stay locked before story authorization',()=>{const g=new Game();at(g,'gate');assert.equal(g.area,'city');g.progress=1;g.enter('village');at(g,'forest');assert.equal(g.area,'village');});
module.exports={at,ticks,fixture,guards,defeatEnemy};
test('prototype property names are not combat actions',()=>{for(const action of ['__proto__','constructor','toString']){const g=new Game();assert.equal(g.act(action),false);assert.ok(Number.isFinite(g.player.mp));}});
