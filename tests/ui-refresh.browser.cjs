// Real game fixtures exercise the production adapters; no UI or game APIs are mocked.
const {run}=require('./browser-harness.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const out='.ssanggye-v12-review/redesign';
fs.mkdirSync(out,{recursive:true});
run(async p=>{
 const failures=[];
 const raw=await p.evaluate(()=>{const raw=__game.save();WorldGame.Game.load(raw);return raw;});
 const sizes=[[360,640,100],[390,844,100],[844,390,100],[1280,900,100],[390,844,200]];
 async function capture(name,{dialog=true,portrait=false}={}){
  for(const [width,height,scale] of sizes){
   await p.setViewportSize({width,height});
   await p.evaluate(scale=>document.documentElement.style.fontSize=scale+'%',scale);
   await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const issues=await p.evaluate(({dialog,portrait})=>{
    const issues=[],root=document.documentElement;
    if(root.scrollWidth>innerWidth+2)issues.push('page horizontal overflow '+root.scrollWidth+'/'+innerWidth);
    if(!dialog&&!document.querySelector('#title').hidden){
     const title=document.querySelector('#title'),copy=title.querySelector('.title-copy'),heading=title.querySelector('h1'),top=title.querySelector('.cover-top');
     const cr=copy.getBoundingClientRect(),hr=heading.getBoundingClientRect(),tr=top.getBoundingClientRect();
     if(cr.top<0)issues.push('title copy clipped above viewport');
     if(hr.top<tr.bottom&&hr.bottom>tr.top)issues.push('title heading overlaps top labels');
     if(cr.bottom>innerHeight+2&&!['auto','scroll'].includes(getComputedStyle(title).overflowY)&&root.scrollHeight<=innerHeight+2)issues.push('title copy clipped below viewport');
    }
    if(dialog){
     const d=document.querySelector('#dialog'),r=d.getBoundingClientRect(),body=document.querySelector('#dialogBody');
     if(!d.open)issues.push('dialog closed');
     if(r.left< -1||r.right>innerWidth+1||r.top< -1||r.bottom>innerHeight+1)issues.push('dialog outside viewport');
     if(d.scrollWidth>d.clientWidth+2||body.scrollWidth>body.clientWidth+2)issues.push('dialog horizontal overflow');
     const art=document.querySelector('#portrait');
     if((!art.hidden&&art.getBoundingClientRect().width>0)!==portrait)issues.push('incorrect portrait visibility');
     for(const b of d.querySelectorAll('button')){
      const br=b.getBoundingClientRect();if(!br.width||!br.height)continue;
      if(br.height<47.5||br.width<47.5)issues.push('small target '+b.textContent.trim()+': '+Math.round(br.width)+'×'+Math.round(br.height));
     }
     for(const b of d.querySelectorAll('.app-navigation button')){
      const range=document.createRange();range.selectNodeContents(b);
      if(range.getClientRects().length>1)issues.push('navigation label wraps: '+b.textContent.trim());
     }
     for(const id of ['closeDialog','dialogActions']){
      const e=document.getElementById(id),er=e.getBoundingClientRect();
      if(!e.hidden&&er.height&&(er.top< -1||er.bottom>innerHeight+1))issues.push(id+' outside viewport');
     }
     const style=getComputedStyle(body);
     if(parseFloat(style.fontSize)<14)issues.push('body text below 14px');
    }
    return issues;
   },{dialog,portrait});
   failures.push(...issues.map(issue=>`${name} ${width}x${height} ${scale}%: ${issue}`));
   fs.writeFileSync(`${out}/layout-issues.json`,JSON.stringify(failures,null,2));
   await p.screenshot({path:`${out}/${name}-${width}x${height}-${scale}.png`});
  }
  await p.evaluate(()=>document.documentElement.style.fontSize='100%');
  await p.setViewportSize({width:1280,height:900});
 }
 async function close(){if(await p.locator('#dialog').evaluate(e=>e.open))await p.keyboard.press('Escape');}
 await p.evaluate(()=>{const g=__game;g.progress=5;g.training=2;g.enter('city');g.events=[];});
 await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='reality');
 await capture('hud',{dialog:false});
 await p.click('#character');await capture('character');
 await p.keyboard.press('Escape');await p.click('#growthStatus');await p.locator('.growth-footer button').filter({hasText:'무공 보기'}).click();await capture('skills');
 await close();await p.click('#menu');await capture('settings');
 await p.keyboard.press('Escape');await p.locator('.main-navigation').getByRole('button',{name:'기록',exact:true}).click();await capture('records');
 await p.keyboard.press('Escape');await p.locator('.main-navigation').getByRole('button',{name:'임무',exact:true}).click();await capture('objective');
 await close();
 await p.evaluate(()=>{const g=__game;const entry=g.points().find(x=>x.kind==='dungeon-entry');Object.assign(g.player,{x:entry.x,y:entry.y});g.events=[];});
 await p.click('#interact');await p.waitForSelector('.dungeon-screen');await capture('dungeon-list');
 await p.locator('.dungeon-row').filter({hasText:'잊힌 지하역'}).click();
 assert.equal(await p.evaluate(()=>__game.area),'city','selecting destination must not enter it');
 await capture('dungeon-detail');await close();
 await p.evaluate(()=>{const g=__game;g.progress=1;g.training=0;g.enter('village');g.events=[];Object.assign(g.player,g.points().find(x=>x.id==='master'));});
 await p.waitForFunction(()=>ArtPreview.ready&&ArtPreview.world==='murim');
 await p.click('#interact');await p.waitForSelector('.speaker-scene');
 await capture('dialogue',{portrait:true});
 await p.getByRole('button',{name:'대화 건너뛰기',exact:true}).click();await close();
 async function titleState(name,value){
  if(await p.locator('#game').isVisible()){
   await close();await p.click('#menu');
   await p.getByRole('button',{name:'타이틀로',exact:true}).click();
  }
  await p.evaluate(value=>{const key=globalThis.SSANGGYE_DEV?SaveSlots.keys.test:SaveSlots.keys.current;if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);},value);
  await p.reload();await p.waitForFunction(()=>ArtPreview.ready);
  assert.equal(await p.locator('#legacyOptions').count(),0,'legacy section removed');
  assert.doesNotMatch(await p.locator('#title').innerText(),/제[1-5]장/,'title chapter list removed');
  await capture('title-'+name,{dialog:false});
 }
 await titleState('existing',raw);assert.ok(await p.locator('#continue').isVisible());
 await p.click('#start');await capture('confirmation');await close();
 await titleState('malformed','{broken save');assert.ok(await p.locator('#continue').isHidden());
 assert.match(await p.locator('#titleError').innerText(),/읽을 수 없습니다/);
 await p.click('#start');await capture('malformed-confirmation');await close();
 assert.equal(await p.evaluate(()=>localStorage.getItem(globalThis.SSANGGYE_DEV?SaveSlots.keys.test:SaveSlots.keys.current)),'{broken save','cancel preserves malformed save');
 await titleState('new',null);assert.ok(await p.locator('#continue').isHidden());
 fs.writeFileSync(`${out}/layout-issues.json`,JSON.stringify(failures,null,2));
 assert.deepEqual(failures,[],'responsive layout and target sizing');
 console.log('UI refresh: real title/save, dialogue, character, skills, settings, records, objective and dungeon states passed at four viewport sizes and 200% text');
});

