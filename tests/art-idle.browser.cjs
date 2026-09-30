'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createServer}=require('../server.cjs');
(async()=>{
 const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const out=path.resolve('.superpowers/art-production/evidence/idle-eight');fs.mkdirSync(out,{recursive:true});const errors=[],results=[];
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(String(e)));
  await p.goto('http://127.0.0.1:'+server.address().port+'/art-review.html');await p.waitForFunction(()=>document.body.dataset.ready==='true');await p.selectOption('#reviewAction','idle');
  for(const facing of ['s','se','e','ne','n','nw','w','sw'])for(let frame=0;frame<2;frame++){
   await p.selectOption('#reviewFacing',facing);await p.locator('#reviewFrame').fill(String(frame));await p.locator('#reviewFrame').dispatchEvent('input');
   await p.waitForFunction(()=>[...document.querySelectorAll('canvas[data-action]')].every(c=>c.dataset.loading==='false'));
   for(const world of ['murim','reality']){
    const c=p.locator('canvas[data-asset-id="'+world+'.hero.yunseo"][data-action="idle"]');assert.equal(await c.getAttribute('data-blocked'),'false');
    await c.screenshot({path:path.join(out,world+'-'+facing+'-'+frame+'.png')});results.push({world,facing,frame});
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,pageErrors:errors,approved:false},null,2));console.log(JSON.stringify({frames:results.length,pageErrors:errors,approved:false}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
