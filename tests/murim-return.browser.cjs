const assert=require('node:assert/strict'),{run}=require('./browser-harness.cjs');
run(async p=>{
 await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');
 async function dismiss(){if(await p.locator('#dialog').evaluate(e=>e.open))await p.keyboard.press('Escape');}
 async function interact(id){await dismiss();await p.evaluate(id=>{const g=__game,o=g.points().find(x=>x.id===id);if(!o)throw Error(id);g.player.dash=0;Object.assign(g.player,{x:o.x,y:o.y});},id);await p.click('#interact');}
 async function fight(){await p.evaluate(()=>{const g=__game;g.player.x+=40;g.step(.05);g.act('dash');for(const e of g.enemies){Object.assign(g.player,{x:e.x-30,y:e.y});for(let n=0;e.hp>0&&n<500;n++){g.player.cool.attack=0;if(!g.act('attack'))throw Error('attack unavailable');}if(e.hp>0)throw Error('combat incomplete');}g.player.dash=0;});}
 async function enter(id){await interact('journey-route');await p.locator('[data-journey-destination="'+id+'"]').click();await p.getByRole('button',{name:'입장하기',exact:true}).click();await p.waitForFunction(id=>__game.area===id,id);}
 await fight();await interact('journey-exit');await p.waitForFunction(()=>__game.area==='village');
 for(let i=1;i<=10;i++){await enter('murimRoad'+i);await fight();await interact('journey-exit');await dismiss();if([2,4,6].includes(i)){await interact('mentor-'+({2:'sword',4:'inner',6:'movement'})[i]);await dismiss();}}
 await interact('journey-master');await dismiss();await interact('journey-master');await p.getByRole('button',{name:'제안 거절 · 나의 길',exact:true}).click();await dismiss();assert.equal(await p.evaluate(()=>__game.worldState.murimJourney.disciple),'decline');
 for(let i=1;i<=3;i++){await enter('murimReturn'+i);await fight();await interact('journey-exit');await dismiss();if(i===1){await enter('murimChance');await fight();await interact('journey-exit');await dismiss();}}
 await interact('journey-return');await dismiss();await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='reality');assert.equal(await p.evaluate(()=>__game.area),'city');assert.equal(await p.evaluate(()=>__game.worldState.murimJourney.rare),true);assert.equal(await p.evaluate(()=>__game.worldState.murimJourney.cleared.length),15);await p.reload();await p.waitForFunction(()=>ArtPreview.ready);await p.click('#continue');assert.equal(await p.evaluate(()=>__game.worldState.murimJourney.stage),'complete');await p.screenshot({path:'browser-results/murim-journey/first-return.png'});
 console.log('Murim browser complete: 10 road stages, three mentors, declined disciple, optional rare, boss and first return/reload');
},{classic:false});
