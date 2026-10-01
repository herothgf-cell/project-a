'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=fs.existsSync(path.join(__dirname,'../chapter-five.js'))?require('../chapter-five.js'):require('../cultivation.js');
const {Game,AREAS}=api;const {g0,at,experiment}=require('./helpers/journey.cjs');
function kill(g){for(const e of g.enemies.filter(e=>!e.boss))g.strike(e,999999);for(const e of g.enemies.filter(e=>e.boss))g.strike(e,999999);}
function four(p='echo'){const g=g0(p);g.progress=12;g.training=3;g.fate.stage=6;g.enter('city');at(g,'warden');g.interact();g.enter('returnPass');for(const e of g.enemies.filter(e=>!e.boss))g.strike(e,999999);at(g,'winch');g.interact();kill(g);g.enter('returnDock');kill(g);g.enter('city');at(g,'warden');g.interact();assert.equal(g.chapter4.phase,4);g.events=[];return g;}
function fifth(p,m){const g=four(p);at(g,'warden');g.interact();experiment(g,p,m);g.chooseInterpretation(p+'-'+m);g.enter('city');at(g,'warden');g.interact();return g;}
test('chapter5 cannot begin before chapter4 has been resolved',()=>{const g=g0();g.enter('city');at(g,'warden');g.interact();assert.equal(g.journey.phase,0);assert.equal(g.points().filter(o=>o.id==='stationGate'&&api.visiblePoint(g,o)).length,0);});
test('chapter5 speaks about the actual past and does not dispense an interpretation',()=>{const g=four();at(g,'warden');g.interact();assert.equal(g.journey.phase,1);assert.deepEqual(g.journey.known,[]);g.enter('village');at(g,'returned-yeonhwa');const result=g.interact();assert.match(result.text,/우회|권양기/);assert.ok(g.journey.promise);assert.ok(g.journey.facts.some(f=>f.id==='yeonhwa-letter'));});
test('an early optional discovery remains usable after the chapter unlocks',()=>{const g=four('ripple');experiment(g,'ripple','return');g.chooseInterpretation('ripple-return');g.enter('city');at(g,'warden');g.interact();g.interact();assert.equal(g.journey.phase,3);assert.equal(g.journey.known.length,1);});
test('the recognition encounter requires a player technique and measurement, not just a kill',()=>{const g=fifth('echo','replay');assert.equal(g.journey.phase,3);g.enter('station');kill(g);assert.equal(g.journey.phase,3);assert.equal(g.journey.boss,true);at(g,'station-reset');g.interact();assert.ok(g.enemies.some(e=>e.hp>0&&!e.boss));});
for(const [p,m] of [['ripple','return'],['ripple','guard'],['echo','return'],['echo','replay'],['seal','hold'],['seal','guide']])test(`${p} full observation, live reality reproduction, certification and version6 reload`,()=>{const g=fifth(p,m);g.enter('station');at(g,'station-lens');g.sense();const e=g.enemies[0];g.enemies=[e];Object.assign(g.player,{x:730,y:700,face:0,mp:500,invuln:0});Object.assign(e,{x:795,y:700,hp:5000,wind:.8,windMax:1,cd:99});g.hitStop=0;
 if(p==='ripple'&&m==='return'){g.act('signature2');g.player.cool.attack=0;g.act('attack');}
 else if(p==='ripple'){g.act('signature1');g.combat.parry=0;g.player.invuln=0;g.takeHit(e);}
 else if(p==='echo'){g.combat.echo={x:e.x,y:e.y,life:5};g.act('signature2');for(let i=0;i<15;i++){g.hitStop=0;g.step(.05);}}
 else g.act(m==='hold'?'signature1':'signature2');
 assert.equal(g.journey.measured,true);assert.equal(g.journey.sync[p+'-'+m],2);
 g.enter('station');kill(g);assert.equal(g.journey.phase,4);g.enter('city');at(g,'warden');const result=g.interact();assert.equal(g.journey.phase,5);assert.equal(g.journey.rank,'C급 현장 인증');assert.match(result.text,/기록/);const raw=g.save();assert.equal(JSON.parse(raw).version,6);const h=Game.load(raw);assert.equal(h.journey.phase,5);assert.equal(h.journey.selected[p],p+'-'+m);assert.equal(h.chapter4.phase,4);
});
test('field adviser remains accessible but cannot fight or fake measured proof',()=>{const g=fifth('echo','replay');g.journey.companion=true;g.enter('station');at(g,'partner');const result=g.interact();assert.match(result.text,/직접/);assert.equal(g.experimentRuntime.companion,null);assert.equal(g.journey.measured,false);assert.ok(g.points().some(o=>o.id==='partner'));g.enter('village');assert.equal(g.experimentRuntime.companion,null);});
test('no reward can be repeated by speaking to the evaluator',()=>{const g=fifth('echo','replay');g.enter('city');at(g,'warden');const gold=g.gold;g.interact();g.interact();assert.equal(g.gold,gold);assert.equal(g.journey.phase,3);});
test('new area objects and encounter actors remain reachable with a player radius',()=>{const g=g0();for(const id of ['archive','station']){g.enter(id);for(const o of [...g.points(),...g.enemies])assert.equal(g.blocked(o.x,o.y,16),false,id+'/'+o.id);}});
module.exports={four,fifth,kill};

test('returning to base technique after phase two remains a valid saved game',()=>{const g=fifth('echo','replay');assert.equal(g.clearInterpretation(),true);const h=Game.load(g.save());assert.equal(h.journey.phase,3);assert.equal(h.journey.selected.echo,null);assert.deepEqual(h.journey.known,['echo-replay']);});
