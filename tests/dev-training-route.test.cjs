const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../world-game.js'),T=require('../martial-training.js'),R=require('./dev-training-route.js');
test('sequential start grants no learned arts and saves at the actual sword tutorial',()=>{
 const g=R.create(Game,T);assert.equal(g.area,'village');assert.equal(g.training,0);assert.equal(g.introActive,false);
 assert.deepEqual(T.state(g).learned,[]);assert.equal(R.next(g,T).family,'sword');assert.equal(g.constructor.load(g.save()).training,0);
});
test('developer progression moves to the next unproved step without awarding the result',()=>{
 const g=R.create(Game,T);T.compose(g,'sword',T.catalog.sword.recipe);T.startPractice(g,'sword');g.act('moon');
 assert.equal(R.next(g,T).family,'thunder');R.move(g,T);assert.equal(g.area,'village');assert(!T.state(g).learned.includes('thunder'));
 T.compose(g,'thunder',T.catalog.thunder.recipe);T.startPractice(g,'thunder');g.act('storm');
 assert.equal(R.next(g,T).family,'ripple');R.move(g,T);assert.equal(g.area,'sanctum');assert.equal(g.nearestPoint().id,'relic-ripple');
 assert(!T.state(g).discovered.includes('ripple'));assert.equal(g.constructor.load(g.save()).fate.stage,2);
});
test('development route never treats applying a creation as its reality proof',()=>{
 const g=R.create(Game,T),s=T.state(g);s.learned=['sword','thunder','ripple','echo','seal'];s.discovered=[...s.learned];for(const f of s.learned)for(const [i,a]of ['form','qi','flow','intent'].entries())if(!s.elements[a].includes(T.catalog[f].recipe[i]))s.elements[a].push(T.catalog[f].recipe[i]);s.linkProof=['ripple','echo','seal'];s.reality='ripple';
 assert.equal(R.next(g,T).kind,'reality');assert.equal(R.next(g,T).family,'ripple');assert.equal(R.next(g,T,['ripple']).family,'echo');assert.equal(R.next(g,T,['ripple','echo','seal']).family,'flash');assert.equal(R.next(g,T,['ripple','echo','seal']).kind,'acquire');
});
