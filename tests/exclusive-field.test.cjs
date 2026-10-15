const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../exclusive-game.js');
function at(g,id){const p=g.points().find(p=>p.id===id);assert(p,id);Object.assign(g.player,{x:p.x,y:p.y+40});return p;}
test('NPC offer must be accepted nearby; killing before acceptance cannot advance story',()=>{
 const g=new E.Game();assert.equal(g.acceptStoryQuest('recovery-work'),false);
 at(g,'npc-minjae');const talk=g.interact();assert.equal(talk.type,'exclusive-dialogue');assert.equal(talk.phase,'offer');
 assert(g.acceptStoryQuest('recovery-work'));for(const e of g.enemies)g.strike(e,9999);g.step(.05,{});
 assert.equal(g.storyObjective().id,'recovery-work');assert(g.worldState.exclusiveField.ready.includes('recovery-work'));
 g.player.x=1200;assert.equal(g.reportStoryQuest('recovery-work'),false);at(g,'npc-minjae');assert(g.reportStoryQuest('recovery-work'));assert.equal(g.storyObjective().id,'stone-accident');
});
test('scene progress requires interacting with the correct local character or object',()=>{
 const g=new E.Game();g.storyComplete('recovery-work','combat');assert.equal(g.storyAction('stone-accident'),false);
 at(g,'stone-table');assert.equal(g.interact().type,'exclusive-dialogue');assert(g.storyAction('stone-accident'));assert.equal(g.storyAction('stone-accident'),false);
});
test('physical exits connect places and spawn at the matching entrance without healing',()=>{
 const g=new E.Game();g.player.hp=45;at(g,'exit-city');g.interact();assert.equal(g.area,'city');assert.equal(g.player.hp,45);
 assert(g.points().some(p=>p.id==='npc-jiwoo'));assert(g.points().some(p=>p.id==='npc-jeongsun'));
 assert(E.AREAS.home.blocks.length>0);assert(E.AREAS.yeoul.blocks.length>0);
});
test('cleared mission stays empty across return and reload, ready report persists',()=>{
 let g=new E.Game();at(g,'npc-minjae');g.acceptStoryQuest('recovery-work');for(const e of g.enemies)g.strike(e,9999);g.step(.05,{});
 g.enter('city');g.enter('recovery');assert.equal(g.enemies.length,0);g=E.Game.load(g.save());assert.equal(g.enemies.length,0);assert(g.worldState.exclusiveField.ready.includes('recovery-work'));
});
test('travel has no six-hour cooldown and needs proximity to the actual mark',()=>{
 const g=new E.Game();for(const e of E.Story.events){if(e.id==='first-crossing')break;g.storyComplete(e.id,e.kind);}g.enter('home');
 assert.equal(g.startCrossing().ok,false);at(g,'exclusive-travel');assert(g.startCrossing().ok);E.Travel.update(g,2,{});assert.equal(g.area,'shrine');
 at(g,'exclusive-travel');assert(g.startCrossing().ok);E.Travel.update(g,2,{});assert.equal(g.area,'home');assert.equal(E.Travel.remaining(g.worldState.exclusiveTravel),0);
});
