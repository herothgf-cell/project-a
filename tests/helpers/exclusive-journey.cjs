const assert=require('node:assert/strict'),E=require('../../exclusive-game.js');
function at(g,id){const p=g.points().find(p=>p.id===id);assert(p,'missing '+g.area+':'+id);assert(!g.blocked(p.x,p.y,16),'blocked '+g.area+':'+id);Object.assign(g.player,{x:p.x,y:p.y});return p;}
function cross(g){goto(g,g.growthWorld()==='murim'?'shrine':'home');at(g,'exclusive-travel');assert.equal(g.startCrossing().ok,true);E.Travel.update(g,1.2,{});}
function goto(g,destination){for(let i=0;g.area!==destination&&i<30;i++){const next=E.Field.route(g.area,destination)[0];assert(next,'no route '+g.area+' -> '+destination);if(['home','shrine'].includes(g.area)&&['home','shrine'].includes(next)){at(g,'exclusive-travel');assert(g.startCrossing().ok);E.Travel.update(g,1.2,{});}else{at(g,'exit-'+next);g.interact();}assert.equal(g.area,next);}assert.equal(g.area,destination);}
function meet(g){const [area,id]=g.storyDestination();goto(g,area);if(id)at(g,id);}
function cast(g,id){E.Prototypes.startPractice(g,id,{world:g.growthWorld()});g.player.cool.moon=0;g.player.mp=g.stats().mp;assert(g.act('moon'));if(['gathering','chargedCrescent'].includes(id)){g.playTime+=.9;assert(g.act('moon'));}E.Prototypes.finishPractice(g);}
function journey(){let g=new E.Game();const visited=[];for(let i=0;i<100&&g.storyObjective();i++){
 const e=g.storyObjective();visited.push(e.id);
 if(e.kind==='cross'){goto(g,e.area);assert.notEqual(g.storyObjective()?.id,e.id);g=E.Game.load(g.save());continue;}
 meet(g);assert.equal(g.interact().type,'exclusive-dialogue');
 if(['scene','companion'].includes(e.kind))assert(g.storyAction(e.id),e.id);
 else {assert(g.acceptStoryQuest(e.id));goto(g,e.area);
 if(e.kind==='combat'){for(const enemy of g.enemies)g.strike(enemy,9999);g.step(.05,{});}
 else if(e.kind==='learn'){E.Training.compose(g,'sword',E.Training.catalog.sword.recipe);g.checkStoryEvidence();}
 else if(e.kind==='create'){E.Training.compose(g,'thunder',E.Training.catalog.thunder.recipe);for(const id of ['crescent','gathering']){E.Prototypes.acquire(g,id);E.Prototypes.compose(g,id,E.Prototypes.catalog[id].recipe);cast(g,id);}E.Prototypes.create(g,'chargedCrescent');g.checkStoryEvidence();}
 else if(e.kind==='proof'){cast(g,'chargedCrescent');g.checkStoryEvidence();}
 else if(e.kind==='reproduce'){E.Prototypes.apply(g,'chargedCrescent');cast(g,'chargedCrescent');g.checkStoryEvidence();}
 else if(e.kind==='support'){for(const enemy of g.enemies){enemy.wind=1;enemy.attacks++;g.strike(enemy,1);g.playTime+=.5;}for(let j=0;j<260&&!E.Field.state(g).ready.includes(e.id);j++)g.step(.05,{});}
 assert(E.Field.state(g).ready.includes(e.id),'not ready '+e.id);meet(g);assert.equal(g.interact().phase,'report');assert(g.reportStoryQuest(e.id));}
 assert.notEqual(g.storyObjective()?.id,e.id,'stuck: '+e.id);g=E.Game.load(g.save());
 }return {g,visited};}
module.exports={journey,cross,cast,at,goto,meet};
