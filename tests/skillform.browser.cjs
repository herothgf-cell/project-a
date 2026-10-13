'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),{createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const url='http://127.0.0.1:'+server.address().port+'/__dev/skillform?dev=1';
 const out=path.resolve('.skillform-review');fs.mkdirSync(out,{recursive:true});
 try{
  await page.goto(url);await page.waitForFunction(()=>globalThis.skillformLab);
  await page.evaluate(()=>localStorage.setItem('dualworld.save.proto49859ea','production-sentinel'));
  const recipes={sword:['slash','breath','instant','front'],ripple:['guard','rebound','store','self'],echo:['step','echo','burst','origin'],seal:['field','bind','hold','point']};
  async function compose(f){await page.locator('[data-family="'+f+'"]').click();if(f!=='sword')await page.locator('#learn').click();for(const [i,a]of ['form','qi','flow','intent'].entries())await page.locator('#axis-'+a).selectOption(recipes[f][i]);await page.locator('#compose').click();}
  async function complete(f,button,linked){
   await page.locator('#'+button).click();await page.mouse.move(0,0);
   // All combat inputs are user-facing controls; inspection only observes the simulation.
   if(f==='sword')await page.keyboard.press('k');
   else {await page.waitForFunction(()=>{const t=skillformLab.trial;return t.g.enemies[0].wind>.2&&t.g.enemies[0].wind<.55;},{},{timeout:10000});await page.keyboard.press('q');
    if(linked||button==='realityBase'){await page.waitForFunction(()=>!!skillformLab.trial.prepared,{},{timeout:5000});if(button==='realityBase'&&f==='echo'){const point=await page.evaluate(()=>{const t=skillformLab.trial,r=document.querySelector('#arena').getBoundingClientRect(),e=t.g.enemies[0];return {x:r.left+e.x*r.width/960,y:r.top+e.y*r.height/540};});await page.mouse.move(point.x,point.y);await page.waitForTimeout(80);}await page.keyboard.press('k');}}
   await page.waitForFunction(()=>skillformLab.trial.finished,{},{timeout:7000});
   assert.equal(await page.evaluate(()=>skillformLab.trial.result.success),true,f+' '+button);
   await page.waitForFunction(()=>document.querySelector('#result').textContent.length>0);
   assert.ok(await page.evaluate(()=>skillformLab.trial.result.spent)>0);
  }
  await compose('sword');await complete('sword','baseTrial',false);
  for(const f of ['ripple','echo','seal']){
   await compose(f);await complete(f,'baseTrial',false);await page.locator('#rank').selectOption('3');await page.locator('#link').click();
   await complete(f,'linkTrial',true);await page.locator('#apply').click();await complete(f,'realityTrial',true);
   await complete(f,'realityBase',false);
  }
  assert.deepEqual(await page.evaluate(()=>skillformLab.state.linkProof),['ripple','echo','seal']);
  assert.equal(await page.evaluate(()=>localStorage.getItem('dualworld.save.proto49859ea')),'production-sentinel');
  await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
  await page.reload();await page.waitForFunction(()=>globalThis.skillformLab);assert.equal(await page.evaluate(()=>skillformLab.state.linkProof.length),3);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
  // Use touch-style buttons; changing viewport and reloading preserves the independent save.
  await page.locator('[data-family="sword"]').click();await page.locator('#baseTrial').click();await page.locator('[data-action="moon"]').click();await page.waitForFunction(()=>skillformLab.trial.finished);
  // Save failure must preserve the previous bytes and leave current progression usable.
  const prior=await page.evaluate(()=>localStorage.getItem(Skillform.KEY));
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('quota','QuotaExceededError');};});
  await page.locator('#saveRetry').click();assert.match(await page.locator('#error').innerText(),/저장 실패/);
  assert.equal(await page.evaluate(()=>localStorage.getItem(Skillform.KEY)),prior);
  await page.reload();await page.waitForFunction(()=>globalThis.skillformLab);
  await page.evaluate(()=>localStorage.setItem(Skillform.KEY,'{broken'));await page.reload();await page.waitForFunction(()=>globalThis.skillformLab);
  assert.match(await page.locator('#error').innerText(),/원문은 보존/);await page.locator('#saveRetry').click();assert.equal(await page.evaluate(()=>localStorage.getItem(Skillform.KEY)),'{broken');
  await page.locator('#reset').click();await page.locator('#confirmReset').click();assert.equal(await page.evaluate(()=>skillformLab.state.proven.length),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('dualworld.save.proto49859ea')),'production-sentinel');assert.deepEqual(errors,[]);
  console.log('PASS: tutorial + all 3 murim/reality links, basic comparison, persistence, mobile, quota/corruption isolation');
 }catch(e){console.error(await page.evaluate(()=>({error:document.querySelector('#error')?.textContent,notice:skillformLab?.trial?.notice,trial:skillformLab?.trial&&{family:skillformLab.trial.family,world:skillformLab.trial.world,linked:skillformLab.trial.linked,time:skillformLab.trial.g.playTime,player:skillformLab.trial.g.player,enemies:skillformLab.trial.g.enemies}})));await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw e;}
 finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
