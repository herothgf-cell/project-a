const assert=require('node:assert/strict'),{Game}=require('../../world-game.js'),J=require('../../murim-journey.js');
function read(g){let guard=0;while(J.scene(g)&&J.state(g).stage!=='choice'&&guard++<80)J.advanceScene(g,true);}
function kill(g){let guard=0;while(g.enemies.some(e=>e.hp>0)&&guard++<100){const e=g.enemies.find(e=>e.hp>0&&!e.boss)||g.enemies.find(e=>e.hp>0);e.hp=0;g.reward(e);}assert.ok(guard<100);}
function leave(g){J.interact(g,'journey-exit');read(g);}
function returned(choice='accept'){const g=new Game();g.startMurimJourney();read(g);J.prepare(g,'murimTutorial');Object.assign(J.state(g).tutorial,{move:true,attack:true,dash:true});kill(g);leave(g);for(let i=1;i<=10;i++){J.prepare(g,'murimRoad'+i);kill(g);leave(g);}g.chooseDisciple(choice);read(g);for(let i=1;i<=3;i++){J.prepare(g,'murimReturn'+i);kill(g);leave(g);if(i===1)J.skipChance(g);}assert.equal(g.area,'city');return g;}
module.exports={returned,kill};
