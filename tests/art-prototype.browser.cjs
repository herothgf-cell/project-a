'use strict';
// Exercise the actual packaged bytes at the GitHub Pages project subpath.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const {buildSite}=require('../scripts/build-site.cjs');
(async()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'ssanggye-prototype-http-'));
 buildSite({out,commit:'d'.repeat(40),includePrototype:true});
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'asset-manifest.json'))),errors=[],evidence=path.resolve('.superpowers/art-production/evidence/prototype');fs.mkdirSync(evidence,{recursive:true});
 const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.replace(/^\/project-a\//,'');if(!Object.hasOwn(manifest.assets,name)){res.writeHead(404);return res.end();}const ext=path.extname(name);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png'})[ext]||'application/octet-stream');res.end(fs.readFileSync(path.join(out,name)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
  const p=await browser.newPage({viewport:{width:1440,height:900}}),base='http://127.0.0.1:'+server.address().port+'/project-a/';p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(v){api=v;const step=v.Game.prototype.step;v.Game.prototype.step=function(...args){window.__game=this;return step.apply(this,args);};}});});
  await p.goto(base+'art-review.html');await p.waitForFunction(()=>document.querySelector('a[href*="art-play"]'));
  const links=await p.locator('a[href*="art-play"]').evaluateAll(xs=>xs.map(x=>x.href));assert.ok(links.every(x=>x===base+'art-play.html'),JSON.stringify(links));
  await p.goto(base+'art-play.html');await p.waitForFunction(()=>ArtPreview.ready||ArtPreview.error);assert.equal(await p.evaluate(()=>ArtPreview.error),null);
  assert.match(await p.locator('#artPreviewBadge').innerText(),/프로토타입/);
  await p.click('#start');await p.locator('#dialogActions button').first().click();await p.waitForFunction(()=>window.__game);
  const areas=await p.evaluate(()=>Object.keys(DualWorld.AREAS));assert.equal(areas.length,12);
  for(const area of areas){
   await p.evaluate(area=>{__game.enter(area);__game.events=[];__game.player.invuln=999;},area);
   await p.waitForFunction(()=>{const world=DualWorld.AREAS[__game.area].world==='현실'?'reality':'murim';return ArtPreview.diagnostics.get(world+'.hero')?.status==='candidate'&&ArtPreview.diagnostics.get(world+'.ground-dressing')?.count>0;});
   await p.waitForFunction(()=>ArtPreview.residency.pending===0);
   await p.waitForTimeout(250);
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   assert.equal(await p.evaluate(()=>ArtPreview.error),null);assert.equal(await p.evaluate(()=>__game.area),area);
   await p.screenshot({path:path.join(evidence,area+'.png')});
  }
  for(const [width,height]of [[390,844],[360,640],[844,390]]){await p.setViewportSize({width,height});await p.screenshot({path:path.join(evidence,width+'x'+height+'.png')});}
  assert.deepEqual(errors,[]);console.log(JSON.stringify({areas,viewports:3,packagedSubpath:true,pageErrors:errors,finalArtApproved:false}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.rmSync(out,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
