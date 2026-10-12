const test=require('node:test'),assert=require('node:assert/strict'),{returned}=require('./helpers/dual-loop.cjs');
function play(g){let frames=0,retries=0,seen=g.loopRuntime;while(g.worldState.dualProgression.run&&frames++<24000){
 if(g.loopRuntime!==seen){seen=g.loopRuntime;retries++;if(retries>8)break;}
 if(!g.enemies.some(e=>e.hp>0)){g.advanceDualActivity();seen=g.loopRuntime;continue;}
 const p=g.player,live=g.enemies.filter(e=>e.hp>0),target=live.filter(e=>!e.boss&&!e.support).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||live.filter(e=>e.support).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||live.find(e=>!e.boss)||live[0];
 let dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),threat=live.find(e=>e.wind>0&&Math.hypot(p.x-e.tx,p.y-e.ty)<e.range+40);
 if(threat){dx=p.x-threat.tx;dy=p.y-threat.ty;if(Math.hypot(dx,dy)<5){dx=640-p.x;dy=525-p.y;if(Math.hypot(dx,dy)<10){dx=1;dy=0;}}if(p.x<150)dx=Math.abs(dx);if(p.x>1100)dx=-Math.abs(dx);if(p.y<150)dy=Math.abs(dy);if(p.y>900)dy=-Math.abs(dy);d=Math.hypot(dx,dy);p.face=Math.atan2(dy,dx);if(threat.wind<.35)g.act('dash');g.step(.05,{x:dx/d,y:dy/d});}
 else{p.face=Math.atan2(dy,dx);if(d<135){g.act('moon');g.act('storm');g.act('attack',true);}g.step(.05,{x:d>90?dx/d:0,y:d>90?dy/d:0});}
 if(p.hp<g.stats().hp*.45)g.act('potion');
 }return {frames,retries,seconds:Math.round(frames*.05)};}
test('base general loadout can finish basic and both raid conditions without stat, resource or position cheats',()=>{
 const g=returned('decline');g.stabilizeWorlds();const results=[];
 for(const v of ['basic','swarm','core']){assert.ok(g.beginDualActivity('raid',v));const result=play(g);results.push({variant:v,...result});assert.equal(g.worldState.dualProgression.run,null,JSON.stringify(results));}
 assert.equal(g.worldState.dualProgression.raids,3);console.log('General-only raid bot measurements',JSON.stringify(results));
});
