/* Real character UI + growth models; only persistence and the modal shell are harnessed. */
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.CHROMIUM_PATH?undefined:'chrome',executablePath:process.env.CHROMIUM_PATH});
 try{
  const p=await browser.newPage({viewport:{width:360,height:800}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.setDefaultTimeout(3000);
  await p.setContent('<main id="screen"></main>');
  for(const file of ['passive-growth.js','advancement.js','boundary-resonance.js','world-growth.js','personal-news.js','character-ui.js'])await p.addScriptTag({path:path.join(__dirname,'..',file)});
  if(fs.existsSync(path.join(__dirname,'../character-growth.css')))await p.addStyleTag({path:path.join(__dirname,'../character-growth.css')});
  await p.evaluate(()=>{
   window.resetCharacter=()=>{
    window.g={area:'city',training:0,player:{hp:60,mp:40},enemies:[],worldGrowth:WorldGrowth.initial(),worldState:{resonance:BoundaryResonance.initial()},revision:{inherited:['ripple']},journey:{realm:0,phase:0},fate:{stage:0},newsList:()=>[],unreadNews:()=>[],readNews:()=>true};
    g.stats=()=>WorldGrowth.stats(g);BoundaryResonance.sync(g);window.failSave=false;window.left=false;
    const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
    window.ui=CharacterUI.create({game:()=>g,node,show:(title,body)=>document.querySelector('#screen').replaceChildren(body),commit:fn=>{const before=JSON.stringify({worldState:g.worldState,player:g.player});const changed=fn(g);if(window.failSave){Object.assign(g,JSON.parse(before));return false;}return changed!==false;}});ui.open('reality');
   };resetCharacter();
  });
  // Missing same-screen allocation or eager spending breaks these assertions.
  await p.getByRole('button',{name:'첫 정착 추천',exact:true}).click();
  assert.deepEqual(await p.evaluate(()=>BoundaryResonance.state(g).allocation),{attack:0,hp:0,mp:0});
  await p.getByRole('button',{name:'결정 8개로 배분 확정',exact:true}).click();
  assert.deepEqual(await p.evaluate(()=>({stats:g.stats(),hp:g.player.hp,mp:g.player.mp,balance:BoundaryResonance.balance(g).crystal})),{stats:{attack:20,hp:144,mp:80,next:115},hp:72,mp:40,balance:0});
  assert.match(await p.locator('.character-resource').innerText(),/보유 0개/);
  assert.match(await p.locator('.character-next-source').innerText(),/무림 레벨 5/);
  assert.equal(await p.getByRole('button',{name:/투자 환불/}).count(),0,'confirmed stats have no refund action');
  assert.equal(await p.getByRole('button',{name:'공격 감소',exact:true}).isDisabled(),true,'committed attack cannot decrease');
  assert.equal(await p.getByRole('button',{name:'최대 생명 감소',exact:true}).isDisabled(),true,'committed health cannot decrease');
  await p.evaluate(()=>resetCharacter());
  // Failed persistence must keep the preview and block deferred navigation.
  await p.getByRole('button',{name:'공격 증가',exact:true}).focus();await p.keyboard.press('Enter');
  assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('aria-label')),'공격 증가');
  await p.evaluate(()=>{failSave=true;ui.requestLeave(()=>left=true);});
  await p.getByRole('button',{name:'배분 확정 후 이동',exact:true}).click();
  assert.equal(await p.evaluate(()=>left),false);assert.equal(await p.evaluate(()=>BoundaryResonance.state(g).allocation.attack),0);
  await p.getByRole('button',{name:'계속 편집',exact:true}).click();
  assert.match(await p.locator('[data-stat="attack"]').innerText(),/17/);
  await p.evaluate(()=>failSave=false);await p.getByRole('button',{name:'결정 1개로 배분 확정',exact:true}).click();
  assert.equal(await p.evaluate(()=>BoundaryResonance.state(g).allocation.attack),1);
  await p.getByRole('button',{name:'공격 증가',exact:true}).click();
  assert.equal(await p.getByRole('button',{name:'공격 감소',exact:true}).isDisabled(),false);
  await p.getByRole('button',{name:'공격 감소',exact:true}).click();
  assert.equal(await p.getByRole('button',{name:'공격 감소',exact:true}).isDisabled(),true,'only pending additions can be removed');
  // Off-world previews are allowed; allocations cannot cross safety restrictions.
  await p.evaluate(()=>{resetCharacter();g.area='village';ui.open('reality');});
  await p.getByRole('button',{name:'공격 증가',exact:true}).click();
  assert.equal(await p.getByRole('button',{name:'현실 기지에서 확정',exact:true}).isDisabled(),true);
  await p.getByRole('button',{name:'무림 캐릭터',exact:true}).click();
  await p.getByRole('button',{name:'초안 버리기',exact:true}).click();
  assert.equal(await p.evaluate(()=>g.area),'village');
  // Both advancement currencies use their model and ratio preservation.
  await p.evaluate(()=>{Advancement.state(g).realm=1;g.journey.realm=1;g.player.hp=g.stats().hp/2;ui.open('murim','realm');});
  await p.getByRole('button',{name:'최대 생명 증가',exact:true}).click();await p.getByRole('button',{name:'포인트 1개로 배분 확정',exact:true}).click();
  assert.equal(await p.evaluate(()=>Advancement.state(g).realmAllocation.hp),1);assert.equal(await p.evaluate(()=>g.player.hp/g.stats().hp),.5);
  assert.equal(await p.getByRole('button',{name:'최대 생명 감소',exact:true}).isDisabled(),true);
  await p.evaluate(()=>{g.area='city';Advancement.state(g).hunter=1;ui.open('reality','hunter');});
  await p.getByRole('button',{name:'이동 속도 증가',exact:true}).click();await p.getByRole('button',{name:'포인트 1개로 배분 확정',exact:true}).click();
  assert.equal(await p.evaluate(()=>Advancement.state(g).hunterAllocation.speed),1);
  assert.equal(await p.getByRole('button',{name:'이동 속도 감소',exact:true}).isDisabled(),true);
  // A legacy attack cap blocks only attack, preserving other growth and legacy stats.
  await p.evaluate(()=>{resetCharacter();g.worldState.resonance.grants=['murim-level:5'];g.worldGrowth.murim.level=5;g.worldState.resonance.legacy=['inherit:first'];g.worldState.achievements={results:[{id:'inherit:first',rewardVersion:2}]};ui.open('reality');});
  assert.equal(await p.getByRole('button',{name:'공격 증가',exact:true}).isDisabled(),true);
  assert.equal(await p.getByRole('button',{name:'최대 생명 증가',exact:true}).isDisabled(),false);
  // Latest means grant order, not catalog order; opening character does not read receipts.
  await p.evaluate(()=>{resetCharacter();g.worldGrowth.murim.level=5;g.worldState.resonance.grants=['murim-level:5','inherit:first'];g.journey.known=[];g.journey.worlds=[];g.worldState.news={items:[]};g.worldState.reports={reported:['first-response']};g.playTime=10;PersonalNews.refresh(g);g.newsList=()=>PersonalNews.list(g);g.unreadNews=s=>PersonalNews.unread(g,s);g.readNews=id=>PersonalNews.read(g,id);ui.open('reality');});
  assert.match(await p.locator('.character-resource-extra').innerText(),/최근 획득 \+8 · 첫 기연 영구 계승/);
  assert.equal(await p.evaluate(()=>g.unreadNews('status').filter(n=>n.subject==='crystal').length),2);
  await p.evaluate(()=>failSave=true);await p.getByRole('button',{name:'획득 내역',exact:true}).click();
  assert.equal(await p.evaluate(()=>g.unreadNews('status').filter(n=>n.subject==='crystal').length),2);
  await p.getByRole('button',{name:'획득 내역 접기',exact:true}).click();await p.evaluate(()=>failSave=false);
  await p.getByRole('button',{name:'획득 내역',exact:true}).click();
  assert.equal(await p.evaluate(()=>g.unreadNews('status').filter(n=>n.subject==='crystal').length),0);
  assert.equal(await p.evaluate(()=>g.unreadNews('status').some(n=>n.subject==='role')),true,'unrelated story news must stay unread');
  assert.doesNotMatch(await p.locator('.character-receipts').innerText(),/각인/);
  // Viewing and changing a resource must preserve equipment and protect a draft.
  await p.evaluate(()=>{g.worldGrowth.reality.equipped='ripple';ui.open('reality');});
  assert.match(await p.locator('.profile-equipped').innerText(),/파문/);
  await p.getByRole('button',{name:'공격 증가',exact:true}).click();
  await p.getByRole('button',{name:'헌터 훈련 포인트',exact:true}).click();
  await p.getByRole('button',{name:'계속 편집',exact:true}).click();
  assert.equal(await p.locator('.character-resource h3').innerText(),'공명 결정');
  await p.evaluate(()=>ui.requestLeave(()=>left=true));await p.getByRole('button',{name:'배분 확정 후 이동',exact:true}).click();
  assert.equal(await p.evaluate(()=>left),true);assert.equal(await p.evaluate(()=>g.worldGrowth.reality.equipped),'ripple');
  assert.equal(await p.getByRole('button',{name:'공격 감소',exact:true}).isDisabled(),true);
  await p.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'360px, 200% content must fit');
  assert.deepEqual(errors,[]);console.log('character growth browser passed');
 }finally{await browser.close();}
 // The real modal has its own scroll/focus policies; confirmations must be visible there.
 await require('./browser-harness.cjs').run(async p=>{
  await p.evaluate(()=>{__game.revision.inherited=['ripple'];BoundaryResonance.sync(__game);__game.events=[];});
  await p.click('#characterMenu');
  assert.equal(await p.locator('.character-stats').count(),0,'current values have one home in the allocation rows');
  for(const [width,height] of [[1280,800],[360,800],[360,640]]){
   await p.setViewportSize({width,height});
   assert.equal(await p.evaluate(()=>{const view=document.querySelector('#dialogBody').getBoundingClientRect();return [...document.querySelectorAll('.character-allocation-row')].every(e=>{const r=e.getBoundingClientRect();return r.top>=view.top&&r.bottom<=view.bottom;});}),true,'all stat rows and controls are visible on initial open at '+width+'x'+height);
   assert.equal(await p.evaluate(()=>{const r=document.querySelector('#dialogActions .character-confirm').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true,'balance and confirmation stay visible at '+width+'x'+height);
  }
  const attack=p.locator('[data-stat="attack"]');const initial=await attack.locator('.character-current').innerText();
  await p.getByRole('button',{name:'공격 증가',exact:true}).click();
  assert.equal(await attack.locator('.character-current').innerText(),initial,'draft leaves the current value stable');
  assert.match(await attack.locator('.character-after').innerText(),/\+1/,'the same row previews the increase');
  assert.match(await p.locator('#dialogActions .character-confirm').innerText(),/확정 후.*환불.*불가/,'permanent allocation is disclosed before confirmation');
  const info=p.getByRole('button',{name:'스탯 출처 보기',exact:true});
  await info.click();
  const provenance=p.getByRole('dialog',{name:'스탯 출처',exact:true});
  assert.equal(await provenance.isVisible(),true);
  assert.match(await provenance.innerText(),/기본.*공명 결정.*심법/s);
  await p.keyboard.press('Tab');await p.keyboard.press('ArrowDown');
  assert.equal(await p.evaluate(()=>document.querySelector('.character-provenance-dialog').contains(document.activeElement)),true,'popup focus stays inside despite shell keyboard shortcuts');
  await p.keyboard.press('Escape');
  assert.equal(await provenance.count(),0);
  assert.equal(await info.evaluate(e=>document.activeElement===e),true,'Escape returns focus to the info button');
  assert.match(await attack.locator('.character-after').innerText(),/\+1/,'popup leaves the draft intact');
  assert.equal(await p.getByRole('group',{name:'저장하지 않은 배분 초안',exact:true}).count(),0,'popup Escape does not request navigation');
  await info.click();await p.keyboard.press('Enter');
  assert.equal(await provenance.count(),0,'popup close button works with keyboard');
  assert.equal(await info.evaluate(e=>document.activeElement===e),true);
  await p.getByRole('button',{name:'공격 감소',exact:true}).click();
  assert.equal(await p.evaluate(()=>document.querySelector('.character-resource>strong').getBoundingClientRect().bottom<=document.querySelector('#dialogBody').getBoundingClientRect().bottom),true,'initial desktop viewport shows available growth balance');
  await p.setViewportSize({width:360,height:800});
  await p.getByRole('button',{name:'공격 증가',exact:true}).click();
  await p.locator('.purpose-nav [data-purpose="skills"]').click();
  const visible=()=>{const b=document.querySelector('[data-character-focus="keep-editing"]'),r=b.getBoundingClientRect(),v=document.querySelector('#dialogBody').getBoundingClientRect();return r.top>=v.top&&r.bottom<=v.bottom;};
  assert.equal(await p.evaluate(visible),true,'navigation brings the pending draft confirmation into view');
  await p.getByRole('button',{name:'계속 편집',exact:true}).click();await p.keyboard.press('Escape');
  assert.equal(await p.evaluate(visible),true,'Escape brings the pending draft confirmation into view');
 });
})().catch(e=>{console.error(e);process.exitCode=1;});
