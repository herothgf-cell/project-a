'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const api=fs.existsSync(require('node:path').join(__dirname,'../journey.js'))?require('../journey.js'):require('../sequel.js');
const {Game,AREAS}=api;
function g0(path='echo'){const g=new Game();g.progress=2;g.training=1;g.fate.path=path;g.fate.proven=[path];g.fate.discovered=[path];g.level=8;g.events=[];return g;}
function at(g,id){const o=g.points().find(x=>x.id===id);assert.ok(o,id);Object.assign(g.player,{x:o.x,y:o.y});return o;}
function prepare(g,path){g.enter('archive');g.events=[];const o=at(g,'relic-'+path);g.sense();g.interact();return o;}
function experiment(g,path,mode){prepare(g,path);g.experimentRuntime.pulse={path,wind:.25,max:1,x:g.player.x,y:g.player.y,serial:1};g.hitStop=0;
 if(path==='ripple'&&mode==='return')g.act('attack');
 else if(path==='ripple'){at(g,'anchor-ripple');g.interact();}
 else if(path==='echo'){g.player.face=0;g.act('dash');for(let i=0;i<6;i++)g.step(.05);if(mode==='return'){const mark=g.experimentRuntime.echo;assert.ok(mark);Object.assign(g.player,{x:mark.x,y:mark.y});g.step(.05);}else{g.player.cool.attack=0;g.act('attack');}}
 else if(mode==='hold')g.interact();
 else {g.player.cool.sense=0;g.sense();at(g,'anchor-seal');g.interact();}
}
test('journey API is installed after all existing rules',()=>{assert.equal(typeof Game.prototype.sense,'function');assert.equal(typeof Game.prototype.points,'function');});
test('all discoveries share no forced character class',()=>{const g=new Game();assert.ok(g.journey);assert.equal(g.fate.path,null);assert.deepEqual(g.journey.known,[]);});
test('seed and facts survive reload without inventing a personal biography',()=>{const g=new Game(),h=Game.load(g.save());assert.equal(h.journey.seed,g.journey.seed);assert.deepEqual(h.journey.facts,[]);});
test('ordinary inspection grants an object, not a technique or secret checklist',()=>{const g=g0();prepare(g,'echo');assert.ok(g.journey.items.includes('echo'));assert.deepEqual(g.journey.known,[]);assert.equal(g.fate.path,'echo');});
test('sense exposes nearby evidence only and repeated sensing does not duplicate facts',()=>{const g=g0();g.enter('archive');at(g,'relic-ripple');g.sense();const n=g.journey.facts.length;g.player.cool.sense=0;g.sense();assert.equal(g.journey.facts.length,n);assert.ok(g.journey.facts.some(f=>f.id==='sense-ripple'));assert.ok(!g.journey.facts.some(f=>f.id==='sense-seal'));});
for(const [p,m]of [['ripple','return'],['ripple','guard'],['echo','return'],['echo','replay'],['seal','hold'],['seal','guide']])test(`physical ${p}/${m} evidence unlocks an interpretation but does not equip it`,()=>{const g=g0(p);experiment(g,p,m);assert.ok(g.journey.known.includes(p+'-'+m));assert.equal(g.journey.selected[p],null);assert.ok(g.events.some(e=>e.type==='interpretation'));});
test('empty attacks and a quiet anchor never manufacture a discovery',()=>{const g=g0('ripple');prepare(g,'ripple');for(let i=0;i<5;i++){g.player.cool.attack=0;g.act('attack');}at(g,'anchor-ripple');g.interact();assert.equal(g.journey.known.length,0);});
test('only witnessed interpretations may be accepted, re-attunement is free and hub-bound',()=>{const g=g0('echo');experiment(g,'echo','replay');assert.equal(g.chooseInterpretation('echo-replay'),true);assert.equal(g.chooseInterpretation('seal-guide'),false);g.enter('forest');assert.equal(g.chooseInterpretation('echo-replay'),false);});
test('six existing-version saves still migrate and preserve chapters',()=>{const g=g0();g.fate.path=null;g.fate.proven=[];g.fate.discovered=[];const raw=JSON.parse(g.save());raw.version=5;delete raw.journey;const h=Game.load(JSON.stringify(raw));assert.equal(h.progress,2);assert.equal(h.training,1);assert.equal(h.journey.phase,0);assert.deepEqual(h.journey.known,[]);});
test('invalid future state is rejected before it can alter live state',()=>{const g=new Game();for(const mutate of [d=>d.journey.seed=-1,d=>d.journey.known=['__proto__'],d=>d.journey.materials=-4,d=>d.journey.phase=5]){const d=JSON.parse(g.save());mutate(d);assert.throws(()=>Game.load(JSON.stringify(d)));}});
module.exports={g0,at,prepare,experiment};
