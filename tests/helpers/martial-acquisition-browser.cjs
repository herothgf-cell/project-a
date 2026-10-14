'use strict';
const assert=require('node:assert/strict');
async function flow(page,f){
 for(let n=0;n<3;n++){
  if(await page.evaluate(f=>MartialAcquisition.describe(__game).families.find(x=>x.id===f).flow.owned,f))break;
  await page.evaluate(()=>{const g=__game,e=g.enemies.find(e=>e.acquisition&&e.hp>0);Object.assign(g.player,{x:e.x-85,y:e.y,face:-Math.PI/2});});
  await page.waitForFunction(f=>{const g=__game,e=g.enemies.find(e=>e.acquisition&&e.hp>0);return e&&e.wind>.18&&(f==='seal'||e.wind<.4)&&g.player.cool[f==='seal'?'storm':'dash']<=0},f,{timeout:15000}).catch(async error=>{console.error('flow wait state',f,n,await page.evaluate(()=>({p:__game.player,e:__game.enemies,acq:MartialAcquisition.describe(__game),dialog:document.querySelector('#dialog').open})));throw error;});
  const before=await page.evaluate(f=>MartialTraining.state(__game).flowProgress[f],f);
  await page.keyboard.press(f==='seal'?'w':'s');
  if(f==='ripple'){
   await page.waitForFunction(()=>__game.acquisitionRuntime.counter.length>0);
   await page.evaluate(()=>{const g=__game,e=g.enemies.find(e=>e.acquisition&&e.hp>0);g.player.face=Math.atan2(e.y-g.player.y,e.x-g.player.x);});
   await page.keyboard.press('q');
  }
  await page.waitForFunction(({f,before})=>MartialTraining.state(__game).flowProgress[f]>before,{f,before});
 }
 assert.equal(await page.locator('#dialog').evaluate(e=>e.open),false);
 await page.getByRole('button',{name:'수련 종료',exact:true}).click();await page.locator('.training-screen').waitFor();
}
async function quest(page,f){
 for(let n=0;n<20;n++){
  if(!await page.evaluate(()=>__game.enemies.some(e=>e.acquisition&&e.hp>0)))break;
  await page.evaluate(()=>{const g=__game,e=g.enemies.find(e=>e.acquisition&&e.hp>0);Object.assign(g.player,{x:e.x-40,y:e.y,face:0});});
  await page.waitForFunction(()=>__game.player.cool.moon<=0);await page.keyboard.press('q');
 }
 assert.equal(await page.evaluate(()=>__game.enemies.some(e=>e.acquisition&&e.hp>0)),false);
 const ids=await page.evaluate(()=>MartialAcquisition.points(__game).map(p=>p.id));
 for(const id of ids){await page.evaluate(id=>{const p=MartialAcquisition.points(__game).find(p=>p.id===id);Object.assign(__game.player,{x:p.x,y:p.y});},id);await page.keyboard.press('g');}
 await page.waitForFunction(f=>MartialTraining.state(__game).quests[f]==='ready',f);
 assert.equal(await page.evaluate(f=>MartialTraining.owns(__game,'intent',MartialTraining.catalog[f].recipe[3]),f),false);
 await page.getByRole('button',{name:'수련 종료',exact:true}).click();await page.locator('.training-screen').waitFor();
 await page.getByRole('button',{name:'퀘스트 보고 · 의 획득',exact:true}).click();
}
module.exports={flow,quest};
