const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../world-game.js'),{inherited}=require('./world-fixtures.cjs');
const families=['ripple','echo','seal'],modes=['flow','focus'],policies=['hold','dodge','response'];
function measure({family='ripple',mode='flow',policy='hold',grown=true,world='reality',ready=true,manualFocus=false}={}){
 const g=grown?inherited(family):new Game();g.progress=12;g.training=3;g.enter(world==='murim'?'village':'city');g.setBreath(mode);
 assert.equal(g.worldGrowth[world].mode,mode);const level=g.level,stats={...g.stats()};assert.equal(g.enter(world==='murim'?'forest':'rift'),true);const e=g.enemies.find(e=>e.role==='heavy');g.enemies=[e];if(ready)e.cd=0;
 const enemy={hp:e.hp,damage:e.damage,role:e.role,speed:e.speed};Object.assign(g.player,{x:e.x-65,y:e.y,face:0,invuln:0});
 let damage=0,hits=0,casts=0,steps=0,potions=0,focusHits=0,focusCycle=-1,focusWaiting=false;const effects={},at=g.playTime,original=g.takeHit;g.takeHit=function(...args){const hp=this.player.hp,result=original.apply(this,args);if(this.player.hp<hp){damage+=hp-this.player.hp;hits++;}return result;};const effect=g.onRealityEffect;g.onRealityEffect=function(ev){effects[ev.kind]=(effects[ev.kind]||0)+1;return effect.call(this,ev);};
 while(e.hp>0&&g.player.hp>0&&g.area===(world==='murim'?'forest':'rift')&&steps++<2400){
  g.player.face=Math.atan2(e.y-g.player.y,e.x-g.player.x);
  if(policy==='dodge'&&e.wind>0&&e.wind<.25&&g.player.cool.dash<=0){g.player.face+=Math.PI/2;casts+=Number(!!g.act('dash'));}
  if(policy==='response'&&grown){
   if(e.wind>0&&e.wind<.35&&g.player.cool.signature1<=0){if(family==='echo')g.player.face+=Math.PI/2;casts+=Number(!!g.act('signature1'));}
   const charged=world==='reality'?g.realityRuntime?.boost||e.realitySuppressedUntil>g.playTime:family==='ripple'?g.combat.charges>0:family==='echo'?g.combat.echo:e.wind<=0&&e.root>0;
   if(charged&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<160)casts+=Number(!!g.act('signature2'));
  }
  const guarded=world==='reality'?g.realityRuntime?.guard?.until>g.playTime:g.combat.parry>0;
  if(policy==='response'&&e.wind>0&&e.wind<.2&&!guarded&&g.enemyThreatContains(e)&&g.player.cool.dash<=0){g.player.face+=Math.PI/2;casts+=Number(!!g.act('dash'));}
  if(policy!=='hold'&&g.player.hp<g.stats().hp*.4&&g.potions>0)potions+=Number(!!g.act('potion'));
  if(manualFocus&&Math.floor(g.playTime/8)>focusCycle){focusCycle=Math.floor(g.playTime/8);focusWaiting=true;}if(!manualFocus||!focusWaiting||g.playTime-g.experimentRuntime.lastAction>1.45&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<100){const fired=g.act('attack',!manualFocus);if(fired){if(g.experimentRuntime.focusSpent)focusHits++;focusWaiting=false;}}const d=Math.hypot(e.x-g.player.x,e.y-g.player.y),angle=Math.atan2(e.y-g.player.y,e.x-g.player.x);g.step(.05,d>75?{x:Math.cos(angle),y:Math.sin(angle)}:{});
 }
 return {family,mode,policy,grown,world,ready,manualFocus,focusHits,level,attack:stats.attack,hp:stats.hp,enemy,seconds:Number((g.playTime-at).toFixed(2)),damage,hits,casts,potions,effects,dead:e.hp===0,defeated:g.area!==(world==='murim'?'forest':'rift'),remainingHp:e.hp,limited:steps>=2400};
}
function matrix(){return families.flatMap(family=>modes.flatMap(mode=>[false,true].flatMap(grown=>policies.filter(p=>grown||p!=='response').map(policy=>measure({family,mode,grown,policy})))));}
test('six family/mode controls preserve level and enemy; first inheritance improves held-attack outcome',()=>{for(const family of families)for(const mode of modes){const before=measure({family,mode,grown:false}),after=measure({family,mode});assert.equal(before.level,after.level);assert.deepEqual(before.enemy,after.enemy);assert.equal(after.attack-before.attack,4);assert.equal(after.hp-before.hp,24);assert.ok(!before.limited&&!after.limited);assert.ok(after.remainingHp<before.remainingHp||before.dead&&after.dead&&after.seconds<before.seconds);}});
test('six family/mode response and dodge survive the same authored heavy encounter with proven effects',()=>{for(const family of families)for(const mode of modes){const held=measure({family,mode}),response=measure({family,mode,policy:'response'}),dodge=measure({family,mode,policy:'dodge'});assert.ok(response.dead&&dodge.dead&&!response.defeated&&!dodge.defeated,JSON.stringify({held,response,dodge}));assert.ok(!held.limited);assert.ok(response.casts>0&&dodge.casts>0);assert.ok(response.damage<=held.damage);assert.ok(dodge.damage<=held.damage);assert.deepEqual(response.enemy,held.enemy);for(const kind of {ripple:['absorb','counter'],echo:['evade','pursuit'],seal:['suppress','weakness']}[family])assert.ok(response.effects[kind]>0,JSON.stringify(response));}});
test('manual focus policy records actual focus spending after breathing',()=>{for(const family of families){const row=measure({family,mode:'focus',policy:'dodge',manualFocus:true});assert.ok(row.focusHits>0,JSON.stringify(row));assert.ok(row.dead&&!row.defeated&&!row.limited,JSON.stringify(row));}});
if(process.env.BALANCE_REPORT==='1')console.log('V11_BALANCE '+JSON.stringify({reality:matrix(),manualFocus:families.map(family=>measure({family,mode:'focus',policy:'dodge',manualFocus:true})),murim:families.flatMap(family=>modes.flatMap(mode=>policies.map(policy=>measure({family,mode,policy,world:'murim'}))))}));
module.exports={measure,matrix};
