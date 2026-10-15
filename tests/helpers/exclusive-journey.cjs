const assert=require('node:assert/strict'),E=require('../../exclusive-game.js');
function cross(g){g.enter(g.growthWorld()==='murim'?'shrine':'home');g.restUntilCrossing();assert.equal(g.startCrossing().ok,true);E.Travel.update(g,10,{});}
function cast(g,id){E.Prototypes.startPractice(g,id,{world:g.growthWorld()});g.player.cool.moon=0;g.player.mp=g.stats().mp;assert(g.act('moon'));if(['gathering','chargedCrescent'].includes(id)){g.playTime+=.9;assert(g.act('moon'));}E.Prototypes.finishPractice(g);}
function journey(){let g=new E.Game();const visited=[];for(let i=0;i<100&&g.storyObjective();i++){
 const e=g.storyObjective();visited.push(e.id);if(E.AREAS[e.area].world!==E.AREAS[g.area].world){cross(g);if(e.kind==='cross'){g=E.Game.load(g.save());continue;}}
 g.enter(e.area);
 if(['scene','companion'].includes(e.kind))assert(g.storyAction(e.id),e.id);
 else if(e.kind==='combat'){for(const enemy of g.enemies)g.strike(enemy,9999);g.step(.05,{});}
 else if(e.kind==='learn'){E.Training.compose(g,'sword',E.Training.catalog.sword.recipe);g.checkStoryEvidence();}
 else if(e.kind==='create'){E.Training.compose(g,'thunder',E.Training.catalog.thunder.recipe);for(const id of ['crescent','gathering']){E.Prototypes.acquire(g,id);E.Prototypes.compose(g,id,E.Prototypes.catalog[id].recipe);cast(g,id);}E.Prototypes.create(g,'chargedCrescent');g.checkStoryEvidence();}
 else if(e.kind==='proof'){cast(g,'chargedCrescent');g.checkStoryEvidence();}
 else if(e.kind==='reproduce'){E.Prototypes.apply(g,'chargedCrescent');cast(g,'chargedCrescent');g.checkStoryEvidence();}
 else if(e.kind==='support'){for(const enemy of g.enemies){enemy.wind=1;enemy.attacks++;g.strike(enemy,1);g.playTime+=.5;}for(let j=0;j<260&&g.storyObjective()?.id===e.id;j++)g.step(.05,{});}
 assert.notEqual(g.storyObjective()?.id,e.id,'stuck: '+e.id);g=E.Game.load(g.save());
 }return {g,visited};}
module.exports={journey,cross,cast};
