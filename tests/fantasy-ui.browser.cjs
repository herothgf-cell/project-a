const {run}=require('./browser-harness.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');

run(async p=>{
  fs.mkdirSync('.ui-design-review',{recursive:true});
  await p.evaluate(()=>{__game.training=2;__game.progress=7;__game.enter('village');__game.events=[];});
  await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');
  assert.equal(await p.locator('body').getAttribute('data-world'),'murim');
  const assetStatus=await p.evaluate(async()=>Promise.all(['assets/ui/skill-atlas.webp','assets/ui/world-panorama.webp'].map(async url=>(await fetch(url)).status)));
  assert.deepEqual(assetStatus,[200,200],'production UI artwork is served');
  assert.match(await p.locator('.actions [data-action=moon]>span').evaluate(e=>getComputedStyle(e).backgroundImage),/skill-atlas/);
  const fieldAccent=await p.locator('#game').evaluate(e=>getComputedStyle(e).getPropertyValue('--ui-accent').trim());
  const slots=await p.locator('.actions>button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));
  assert.ok(Math.max(...slots)-Math.min(...slots)<2,'desktop combat slots share a row');
  await p.screenshot({path:'.ui-design-review/field-murim.png'});
  await p.click('#growthStatus');
  await p.waitForSelector('.skills-screen');
  const before=await p.evaluate(()=>__game.save());
  assert.equal(await p.locator('#dialog').getAttribute('data-world'),'murim');
  await p.screenshot({path:'.ui-design-review/growth-murim.png'});
  await p.getByRole('button',{name:'현실 보기',exact:true}).click();
  assert.equal(await p.locator('#dialog').getAttribute('data-world'),'reality');
  assert.notEqual(await p.locator('#dialog').evaluate(e=>getComputedStyle(e).getPropertyValue('--ui-accent').trim()),fieldAccent);
  assert.equal(await p.evaluate(()=>__game.save()),before,'viewing the other world does not change game state');
  await p.screenshot({path:'.ui-design-review/growth-reality.png'});
  await p.keyboard.press('Escape');
  await p.click('#character');
  assert.equal(await p.locator('.character-allocation-row .character-stepper').count(),3);
  await p.screenshot({path:'.ui-design-review/character.png'});
  await p.keyboard.press('Escape');
  for(const [width,height]of [[360,640],[390,844],[844,390],[1024,390],[1280,900]]){
    await p.setViewportSize({width,height});
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    for(const selector of ['.main-navigation button','.actions>button','#potion']){
      for(const box of await p.locator(selector).evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}))){
        assert.ok(box.w>=44&&box.h>=44,selector+' touch target');
        assert.ok(box.x>=0&&box.x+box.w<=width+1&&box.y>=0&&box.y+box.h<=height+1,selector+' stays on screen');
      }
    }
    const controls=await p.locator('.actions>button,#potion,#interact').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {name:e.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));
    for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){const a=controls[i],b=controls[j];assert.ok(a.right<=b.x||b.right<=a.x||a.bottom<=b.y||b.bottom<=a.y,'controls must not overlap: '+a.name+' / '+b.name);}
    await p.screenshot({path:'.ui-design-review/field-'+width+'.png'});
    await p.click('#growthStatus');
    assert.ok(await p.locator('#dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2));
    await p.screenshot({path:'.ui-design-review/growth-'+width+'.png'});
    await p.keyboard.press('Escape');
  }
  await p.evaluate(()=>{__game.enter('city');__game.events=[];});
  await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='reality'&&document.body.dataset.world==='reality');
  await p.screenshot({path:'.ui-design-review/field-reality.png'});
  console.log('World themes, read-only comparison, desktop action row and responsive touch targets passed');
});
