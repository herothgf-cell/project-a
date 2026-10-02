/* Browser adapter: input lifecycle, modal flow, save migration, and readable HUD. */
(function(){
  'use strict';
  CombatEvents.install(globalThis.WorldGame.Game,{worldOf:g=>WorldGrowth.worldOf(g)});
  const {Game,AREAS,QUESTS,SKILLS,VERSION,dist,Fate,Legend}=globalThis.WorldGame||DualWorld;
  const $=id=>document.getElementById(id),devMode=globalThis.SSANGGYE_DEV===true&&['localhost','127.0.0.1','[::1]'].includes(location.hostname),SAVE=devMode?SaveSlots.keys.test:SaveSlots.keys.current,BACKUP=devMode?null:SaveSlots.keys.backup;
  const dialog=$('dialog'),renderer=new WorldRenderer($('canvas'),$('mini'));
  const perfEnabled=new URLSearchParams(location.search).get('perf')==='1';
  const perf=perfEnabled?new PerfMeter():null;
  const perfHud=perfEnabled?document.createElement('pre'):null;
  if(perfHud){perfHud.id='perfHud';perfHud.setAttribute('aria-label','성능 진단');perfHud.style.cssText='position:fixed;top:8px;right:8px;z-index:1000;max-width:calc(100vw - 16px);margin:0;padding:8px 10px;background:#101e24e8;color:#f3e5be;border:1px solid #d0bb7b;font:11px/1.4 monospace;white-space:pre-wrap;pointer-events:none;';$('game').append(perfHud);}
  let g=new Game(),active=false,resume=null,hasSave=false,saveWarning=false,lastSave=0,lastFrame=performance.now(),lastHud=0,lastPerfHud=0;
  let bannerTimer=null,queued=[],errorReported=false,ultimateTimer=null;
  let dialogueUI=null,journeyUI=null,realmUI=null,growthUI=null,introUI=null,contractUI=null,progressionUI=null,characterUI=null,newsUI=null;
  const audio=CombatAudio.create({storage:{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)}});
  let audioUI=null,dungeonUI=null,objectiveUI=null;
  const viewMemory=new Map();let currentView=null,uiSoundId=0;
  document.addEventListener('click',event=>{const button=event.target.closest?.('button');if(button&&!button.disabled&&!button.dataset.action&&!button.closest('.audio-previews'))audio.play({kind:'ui',castId:'ui-'+(++uiSoundId),world:WorldGrowth.worldOf(g)});});
  document.addEventListener('pointerdown',()=>audio.unlock(),{capture:true});document.addEventListener('keydown',()=>audio.unlock(),{capture:true});
  const keys=new Set(),held=new Set();let joy={x:0,y:0},joyId=null;
  const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=Controls.format(text);return e;};
  const artReady=()=>{if(!globalThis.ArtPreview)return !document.documentElement.hasAttribute('data-art-loading');return globalThis.ArtPreview.ensureWorld?.(AREAS[g.area].world==='현실'?'reality':'murim')===true;};
  const running=()=>active&&!dialog.open&&!document.hidden&&artReady();
  window.addEventListener('art-controls-ready',()=>{clearInput();lastFrame=performance.now();});
  function clearInput(){keys.clear();held.clear();joy={x:0,y:0};joyId=null;$('stick').querySelector('i').style.transform='';}
  function toast(text){const e=node('div','toast',text);$('toasts').append(e);while($('toasts').children.length>3)$('toasts').firstChild.remove();setTimeout(()=>e.remove(),3000);}
  function inspectSave(){
    resume=null;hasSave=false;$('titleError').textContent='';
    try{const raw=localStorage.getItem(SAVE);hasSave=raw!==null;if(raw!==null){resume=Game.load(raw);if(!devMode&&JSON.parse(raw).improvementVersion===undefined){try{const key=SAVE+'.before-v11';if(localStorage.getItem(key)===null)localStorage.setItem(key,raw);}catch{saveWarning=true;$('titleError').textContent='이전 기록 백업을 저장하지 못했습니다. 저장 공간을 확인하거나 기록을 내려받으세요.';}}}}
    catch(error){$('titleError').textContent='저장 데이터를 읽을 수 없습니다. 기존 데이터는 유지됩니다. 새 여정은 확인 후 시작합니다.';}
    $('continue').hidden=!resume;$('start').className=resume?'secondary':'primary';
    if(!$('legacyOptions')){const box=node('div');box.id='legacyOptions';const link=node('a','','v0.11.0 보관판 열기');link.href='legacy/v011/';box.append(link);try{const raw=SaveSlots.read(localStorage,SaveSlots.keys.legacyOriginal);if(raw!==null){box.append(node('p','','이전 기록은 보관됩니다. 개편판은 별도 여정으로 시작합니다.'));const b=node('button','secondary','이전 기록 원문 다운로드');b.onclick=()=>exportSave(raw,'ssanggye-v011-original.json');box.append(b);}}catch{}$('titleError').after(box);}
  }
  function backup(force=false){if(!BACKUP)return;try{const raw=localStorage.getItem(SAVE);if(raw!==null&&(force||!localStorage.getItem(BACKUP)))localStorage.setItem(BACKUP,raw);}catch(error){/* Storage may be unavailable; never block play. */}}
  function persist(){
    if(!active||introUI?.replay)return;
    try{localStorage.setItem(SAVE,g.save());$('save').textContent='저장됨';hasSave=true;lastSave=performance.now();}
    catch(error){$('save').textContent='저장 불가';if(!saveWarning){toast('자동 저장 불가 · 메뉴에서 저장 파일을 내려받으세요.');saveWarning=true;}}
  }
  function closeDialog(){audio.clear();if(introUI?.active)return introUI.resume();if(dialog.open)dialog.close();clearInput();lastFrame=performance.now();if(queued.length){const next=queued.shift();show(next.title,next.text,next.actions,next.portrait,next.kicker,next.result);}}
  function show(title,body,actions=[{label:'계속하기'}],portrait='system',kicker='쌍계 · 이야기',result=null){
    audio.clear();
    if(currentView)viewMemory.set(currentView,{scroll:$('dialogBody').scrollTop});
    currentView=typeof body==='string'?null:title;
    if(body?.classList&&!body.classList.contains('intro-scene')&&!body.classList.contains('speaker-scene')){const nav=node('nav','app-navigation');nav.setAttribute('aria-label','주 메뉴');for(const [label,run]of [['캐릭터',()=>characterUI.open()],['임무',()=>objectiveUI.open()],['기록',()=>openRecords()],['설정',()=>menu()]]){const b=node('button','secondary',label);b.onclick=run;nav.append(b);}body.prepend(nav);}
    if(typeof body==='string'&&dialogueUI){const scenes=DialogueData.lookup(title,body,portrait);if(scenes)return dialogueUI.open({id:title,title,scenes,result,actions});}
    dialog.classList.toggle('intro-dialog',!!body?.classList?.contains('intro-scene'));dialog.classList.toggle('growth-dialog',!!body?.classList?.contains('growth-screen'));
    RealmArt.begin(g);clearInput();dialog.classList.toggle('story-dialog',typeof body==='string'&&portrait!=='system'&&!kicker.includes('일시정지'));dialog.classList.toggle('news-dialog',!!body?.classList?.contains('realm-news'));dialog.classList.toggle('help-dialog',!!body?.classList?.contains('realm-help-sheet'));dialog.classList.toggle('legend-offer',kicker.includes('발현')||kicker.includes('각성'));$('dialogTitle').textContent=title;$('dialogKicker').textContent=kicker;
    $('dialogBody').replaceChildren();if(typeof body==='string')$('dialogBody').textContent=Controls.format(body);else $('dialogBody').append(body);
    WorldArt.portrait($('portrait'),portrait);$('dialogActions').replaceChildren();
    actions.forEach(a=>{const b=node('button',a.secondary?'secondary':a.danger?'danger':'primary',a.label);b.disabled=!!a.disabled;b.addEventListener('click',()=>{queued=[];if(dialog.open)dialog.close();clearInput();lastFrame=performance.now();if(a.run)a.run();});$('dialogActions').append(b);});
    $('closeDialog').hidden=!!introUI?.active;
    if(!dialog.open)dialog.showModal();dialog.scrollTop=0;$('dialogBody').scrollTop=viewMemory.get(currentView)?.scroll||0;
    ($('dialogActions').querySelector('button:not(:disabled):not(.danger)')||$('closeDialog')).focus({preventScroll:true});
  }
  function legendOffer(event){
    const path=Fate.PATHS[event.path],body=node('div');body.style.setProperty('--legend-color',path.color);
    body.append(node('span','legend-symbol',path.glyph),node('p','legend-origin',event.text),node('p','legend-note','이름을 알기 전에 몸이 먼저 기억했다. 이 호흡을 이어가거나, 다른 가능성을 살펴봐도 좋다.'));
    const blocked=!!g.fate.path&&g.fate.path!==event.path&&!AREAS[g.area].safe;
    const actions=[{label:blocked?'거점에서 다른 호흡으로 잇기':'이 호흡을 붙잡는다',disabled:blocked,run:()=>{g.awaken(event.path);processEvents();persist();update();}},{label:'지금은 이 감각만 기억한다',secondary:true}];
    if(dialog.open)queued.push({title:event.title,text:body,actions,portrait:'hero',kicker:'현장 발현 · 아직 이름 붙이지 않은 힘'});
    else show(event.title,body,actions,'hero','현장 발현 · 아직 이름 붙이지 않은 힘');
  }
  function fateJournal(){
    if(growthUI)return growthUI.open('skills');
    if(!active)return;const f=g.fate,l=g.legend,body=node('div');
    body.append(node('p','dialog-note','무공의 시작은 누군가의 보상 목록이 아니다. 여기에는 당신이 실제로 지나온 장소와 마주한 사건만 남는다.'));
    if(f.path)body.append(grid([['나의 무공',Fate.PATHS[f.path].name],['별호',f.stage>=6?Fate.PATHS[f.path].title:'아직 쓰는 중'],['기세',Math.floor(f.focus)+' / 100'],['시작',l.awakened.includes(f.path)?'전투 중 발현':'이전 여정 / 비경의 기억']]));
    if(g.chapter4?.rescued){body.append(node('h3','','내가 바꾼 세계'),node('p','world-consequence','연화가 청운촌으로 돌아와 가게를 다시 열었습니다. 청운 귀환로의 장벽이 사라졌습니다. '+ChronicleRules.label[g.chapter4.route]+'의 흔적은 현실의 귀환 부두에도 남아 있습니다.'));}
    body.append(node('h3','','내가 남긴 기억'));const memories=node('section','memory-list');
    if(!l.memories.length)memories.append(node('p','','아직 새로 기록된 발현은 없다. 기존에 배운 무공은 그대로 남아 있다. 적의 예고를 끝까지 보거나, 회피한 뒤 돌아가거나, 전장의 이상한 틈에 손을 대 보자.'));
    for(const m of l.memories){const e=node('article');e.append(node('b','',AREAS[m.area].name+' · '+m.foe),node('p','',m.action+'.'));memories.append(e);}body.append(memories);
    for(const [id,path]of Object.entries(Fate.PATHS)){
      if(!f.discovered.includes(id)&&!f.proven.includes(id))continue;
      const card=node('section','fate-card');card.style.setProperty('--fate-color',path.color);const head=node('div','fate-card-head');
      head.append(node('span','fate-glyph',path.glyph),node('b','',path.name),node('small','',f.path===id?'지금의 호흡':l.ready.includes(id)?'이어갈 수 있는 기억':f.proven.includes(id)?'비경에서 익힌 기억':'정체를 알아가는 중'));card.append(head);
      for(let i=0;i<3;i++)card.append(node('p','fate-skill-copy',`${['Q','R','F'][i]} · ${path.skills[i][0]} — ${path.skills[i][4]}`));body.append(card);
    }
    const actions=l.ready.filter(id=>id!==f.path||!l.awakened.includes(id)).map(id=>({label:Fate.PATHS[id].name+' · 내 호흡으로',disabled:!!f.path&&f.path!==id&&!AREAS[g.area].safe,run:()=>{g.awaken(id);processEvents();persist();update();}}));
    if(f.path&&!AREAS[g.area].safe)body.append(node('p','dialog-note','다른 호흡으로 갈아타는 일은 안전한 거점에서 할 수 있습니다. 지금의 기억은 사라지지 않습니다.'));
    actions.push({label:'돌아가기',secondary:true});
    if(g.area==='village'&&f.proven.length&&f.stage>=2)actions.push({label:'비경에서 익힌 계열 재수련',secondary:true,run:fateChoice});
    show('나의 기연 · 기억의 장',body,actions,'hero','내 발걸음에 남은 이야기');
  }
  function fateChoice(){
    const f=g.fate,body=node('div');body.append(node('p','','직접 증명한 무공을 계승합니다. 기술의 효과를 살펴보고 선택하세요.'));
    for(const id of f.proven){const path=Fate.PATHS[id];body.append(node('h3','',path.name),node('p','',path.skills.map((sk,i)=>`${['Q','R','F'][i]} · ${sk[0]}: ${sk[4]}`).join('\n')));}
    if(!f.proven.length)body.append(node('p','','먼저 무명 비경의 흔적을 조사하고, 임시 무공으로 시험을 통과하세요.'));
    show('무공 · 첫 계승',body,[...f.proven.map(id=>({label:Fate.PATHS[id].name+' 수락',run:()=>{g.acceptFate(id);processEvents();persist();update();}})),{label:'더 생각해 보기',secondary:true}],'hero','계승할 무공 선택');
  }
  function trialPrompt(event){show(event.title,event.text,[{label:'공명 시험 시작',run:()=>{g.beginTrial(event.path);processEvents();persist();update();}},{label:'지금은 관찰만',secondary:true}],'hero','선택형 기억 연습 · 현장 발현과 별개');}
  function story(event){
    if(event.type==='legend-ready'){legendOffer(event);return;}
    if(event.type==='fate-trial'){trialPrompt(event);return;}
    if(event.type==='fate-choice'){fateChoice();return;}
    if(event.type==='awakening'){$('game').style.setProperty('--fate-color',Fate.PATHS[event.path].color);}

    const actions=['victory','trial-complete'].includes(event.type)?[{label:'거점으로 귀환',run:()=>{g.retreat();processEvents();persist();update();}},{label:'조금 더 둘러보기',secondary:true}]:[{label:event.type==='transfer'?'현실에서 이어가기':event.type==='defeat'?'다시 일어서기':'계속하기'}];
    const kicker=event.type==='awakening'?'나의 전설 · 무공 각성':event.type==='trial-complete'?'기연의 증명':event.type==='victory'?'전투 승리':event.type==='transfer'?'능력 전승':'쌍계 · 이야기';
    if(dialog.open)queued.push({title:event.title,text:event.text,actions,portrait:event.portrait||'system',kicker,result:event.result});
    else show(event.title,event.text,actions,event.portrait||'system',kicker,event.result);
  }
  function start(load=false){
    backup();g=load&&resume?resume:new Game();active=true;queued=[];clearInput();$('title').hidden=true;$('game').hidden=false;renderer.area=null;renderer.resize();renderer.draw(g,0);lastFrame=performance.now();persist();update();
    audio.clear();viewMemory.clear();currentView=null;if(!load){g.beginIntro(true);introUI.start();persist();}
    else if(g.introActive)introUI.resume();
    else toast(g.restoreNotice||'저장한 위치와 진행에서 이어갑니다.');
  }
  function newGame(){if(hasSave)show('새로운 여정을 시작할까요?','현재 진행을 새 저장으로 교체합니다. 이전 저장은 브라우저의 백업 항목에도 보관합니다.\n\n기존 여정은 이어하기로 계속할 수 있습니다.',[{label:'취소',secondary:true},{label:'새로 시작',danger:true,run:()=>{backup(true);start(false);}}],'system','저장 데이터 확인');else start(false);}
  function grid(items){const e=node('div','stat-grid');for(const [label,value]of items){const b=node('div','',label);b.append(node('b','',String(value)));e.append(b);}return e;}
  function inventory(){
    if(growthUI)return growthUI.open();
    if(!active)return;const s=g.stats(),body=node('div');body.append(grid([['두 세계 공격력',s.attack],['기존 성장 보정',g.economy?.legacyAttack||0],['최대 체력',s.hp],['최대 내력',s.mp]]));
    body.append(node('p','dialog-note',`${g.training>=2?'청명검':'수련검'} · 모든 장비와 무공은 현실 / 무림에서 공유됩니다.`));
    const list=[['劍','연환검','기본 3연격. 세 번째 공격은 더 넓고 강합니다. J / 공격 버튼 길게 누르기.',true],['月','월영참','전방 광역 베기 · 내력 18 · 재사용 2.8초. 백련에게 배웁니다.',g.training>=1],['雷','천뢰격','주변 광역 낙뢰 · 내력 32 · 재사용 6초. 죽림 공략 후 습득.',g.training>=2],['界','경계 공명','지속 효과: 공격력 +6, 받는 피해 15% 감소. 제2장 폐사 공략 후 습득.',g.training>=3]];
    for(const [symbol,name,desc,learned]of list){const row=node('div','skill-row'),copy=node('div');row.append(node('span','',symbol));copy.append(node('b','',name+(learned?'':' · 미습득')),node('p','',desc));row.append(copy);body.append(row);}
    if(Fate.active(g))for(const a of Fate.names){const k=g.skillInfo(a),row=node('div','skill-row');row.append(node('span','',k.glyph),node('p','',`${k.key} · ${k.name} — ${k.description}`));body.append(row);}
    show('몸에 새겨진 힘',body,[{label:'돌아가기',secondary:true},...(AREAS[g.area].safe?[{label:'보급',run:shop}]:[])],'hero','무공 · 장비');
  }
  function shop(){
    if(g.worldGrowth){if(!AREAS[g.area].safe)return;const body=node('div');body.append(grid([['소지 금화',g.gold],['회복약',g.potions]]),node('p','','회복약은 최대 체력의 55%를 회복합니다. 거점에서는 체력과 자원을 무료로 회복합니다.'));return show('여정을 위한 준비',body,[{label:'회복약 · 25 금화',disabled:g.gold<25||g.potions>=99,run:()=>{g.buy('potion');processEvents();persist();shop();}},{label:'돌아가기',secondary:true}],'shop','보급');}
    if(!AREAS[g.area].safe)return;const body=node('div'),balance=g.economy?.refundBalance||0;body.append(grid([['소지 금화',g.gold],['회복약',g.potions],['정산 잔액',balance]]));body.append(node('p','','회복약: 최대 체력의 55% 회복\n거점에서는 무료로 체력과 내력을 회복합니다. 공격력은 수련과 성장으로 높입니다.\n이전 버전의 남은 환급금은 금화 한도가 생기면 수령할 수 있습니다.'));
    show('여정을 위한 준비',body,[{label:'회복약 · 25 금화',disabled:g.gold<25||g.potions>=99,run:()=>{g.buy('potion');processEvents();persist();shop();}},{label:'정산 잔액 수령',disabled:!balance||g.gold>=999999,run:()=>{g.claimSettlement();processEvents();persist();shop();}},{label:'돌아가기',secondary:true}],'shop','보급');
  }
  function map(){const body=node('div'),canvas=node('canvas','map-full');canvas.width=460;canvas.height=340;renderer.drawMini(g,canvas,true);body.append(canvas,node('p','dialog-note','◆ 현재 위치 · 붉은 점: 적 · 금빛 점: 인물과 출입구\n화면의 방향 표식과 현재 목표를 함께 확인하세요.'));show(AREAS[g.area].name,body,[{label:'돌아가기'}],'system','지역 지도');}
  function journal(){
    if(characterUI)return characterUI.open();
    const body=node('div');body.append(node('p','','현실의 균열에서 발견한 경계석.\n무림에서 몸에 새긴 호흡은 현실에서도 사라지지 않는다.\n\n제1장: 두 세계의 검\n무공을 익히고 현실의 균열을 공략한다.\n\n제2장: 잔월의 서약\n폐사의 세 인장을 깨우고, 현실 항만의 검은 파도를 잠재운다.'));
    body.append(grid([['현재 이야기',g.progress>=7?'제2장':'제1장'],['전승 무공',Math.min(g.training,2)+'개'],['경계 공명',g.training>=3?'완성':'미완성'],['현실 / 무림 공격력',`${g.stats().attack} / ${g.stats().attack}`]]));show('두 세계의 공명',body,[{label:'돌아가기'}]);
  }
  function exportSave(raw=g.save(),filename='ssanggye-save.json'){const blob=new Blob([raw],{type:'application/json'}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('저장 파일을 다운로드했습니다.');}
  function importSave(){
    show('저장 파일 불러오기','파일 선택 중에는 게임이 멈춥니다. 선택을 취소했다면 돌아가기를 누르세요.',[{label:'돌아가기'}],'system','저장 데이터');
    const input=node('input');input.type='file';input.accept='.json,application/json';input.addEventListener('change',async()=>{
      const file=input.files?.[0];if(!file)return;if(file.size>500000){show('불러오지 못했습니다','저장 파일 크기가 너무 큽니다. 현재 진행은 유지됩니다.');return;}
      try{const loaded=Game.load(await file.text());show('이 여정을 불러올까요?',`Lv.${loaded.level} · ${QUESTS[loaded.progress][0]}\n현재 진행이 선택한 저장으로 교체됩니다.`,[{label:'취소',secondary:true},{label:'불러오기',run:()=>{backup(true);g=loaded;renderer.area=null;persist();update();toast('저장한 거점에서 이어갑니다.');}}]);}
      catch(error){show('불러오지 못했습니다','손상되었거나 지원하지 않는 저장 파일입니다. 현재 진행은 변경되지 않았습니다.');}
    });input.click();
  }
  function help(){show('첫 여정을 위한 안내','WASD / 방향키: 이동\nJ / 공격 버튼 길게 누르기: 연환검\nK: 월영참 · L: 천뢰격\nSpace / Shift: 회피 · 짧은 무적\nE: 대화 / 출입구 이동 · 1: 회복약\nQ / R: 기연 무공 · F: 오의 (기세 100)\nB: 기감 · N: 관찰 수첩/성장\nI: 무공과 장비 · M: 지도 · Esc: 메뉴\n\n모바일에서는 왼쪽 조이스틱으로 이동하면서 오른쪽 공격과 무공을 함께 누를 수 있습니다.\n\n붉은 원은 적의 공격 예고입니다. 원 밖으로 피하거나 회피의 무적으로 넘기세요. 호위와 봉인을 해제해야 보스의 보호막이 사라집니다.');}
  function openRecords(){const body=node('section','records-screen');body.append(node('p','','직접 발견한 사실과 귀환 성과를 확인합니다.'));for(const [label,run]of [['내 소식',()=>newsUI.open()],['관찰 수첩',()=>journeyUI.open('facts')],['행적',()=>historyUI.open('history')]]){const b=node('button','secondary',label);b.onclick=run;body.append(b);}show('기록',body,[{label:'돌아가기',secondary:true}]);}
  function menu(){
    if(introUI?.active)return introUI.resume();
    if(!active)return;const actions=[{label:'계속하기'},{label:'소리 설정',secondary:true,run:()=>audioUI.open()},{label:'조작 안내',secondary:true,run:help},{label:'지역 지도',secondary:true,run:map},{label:'저장 파일 다운로드',secondary:true,run:()=>exportSave()},{label:'저장 파일 불러오기',secondary:true,run:importSave},{label:renderer.reduced?'화면 효과 켜기':'화면 효과 줄이기',secondary:true,run:()=>{renderer.reduced=!renderer.reduced;menu();}}];
    actions.push({label:'이펙트 품질: '+['낮음','보통','높음'][renderer.quality]+(renderer.autoLow?' (자동 절약)':''),secondary:true,run:()=>{renderer.quality=(renderer.quality+1)%3;renderer.autoLow=false;renderer.slowFrames=0;menu();}});
    if(!AREAS[g.area].safe)actions.push({label:'거점으로 후퇴',secondary:true,run:()=>show('거점으로 돌아갈까요?','무공과 이야기 진행은 유지됩니다.\n다시 입장하면 호위와 아직 완료하지 않은 봉인 공략을 처음부터 시작합니다.',[{label:'취소',secondary:true},{label:'후퇴하기',run:()=>{g.retreat();processEvents();persist();update();}}])});
    else actions.push({label:'보급',secondary:true,run:shop});
    actions.push({label:'입력 설정',secondary:true,run:controlSettings},{label:'인트로 다시 보기',secondary:true,run:()=>introUI.start(true)},{label:'타이틀로',secondary:true,run:()=>{persist();active=false;progressionUI?.clear();clearInput();$('game').hidden=true;$('title').hidden=false;inspectSave();WorldArt.cover($('cover'));}});
    const body=node('section','settings-screen');body.append(node('p','',`Lv.${g.level} · ${AREAS[g.area].name}`),node('p','','화면과 소리, 입력, 저장을 설정합니다.'));const options=node('div','settings-options');for(const action of actions.slice(1)){const b=node('button','secondary',action.label);b.onclick=()=>{if(dialog.open)dialog.close();clearInput();action.run?.();};options.append(b);}body.append(options);show('설정',body,[actions[0]],'hero','일시정지 · v'+VERSION);
  }
  function processEvents(){
    for(const e of g.events.splice(0)){
      if(e.type==='world-news')updateNews();
      if(e.type==='level-up'){progressionUI?.level(e);persist();}
      if(e.type==='contract-complete'){show(e.title,e.text,[{label:'기지로 귀환',run:()=>{g.enter('city');processEvents();persist();update();}},{label:'조금 더 둘러보기',secondary:true}]);persist();}
      if(e.type==='interpretation'){journeyUI.offer(e);persist();}
      if(e.type==='toast')toast(e.text);if(e.type==='combat-sound'&&(!dialog.open||e.kind==='attain'))audio.play(e);if(e.type==='audio-clear')audio.clear();
      if(e.type==='area'){clearInput();$('toasts').replaceChildren();if(g.area==='archive'&&!g.journey.known.length)toast('처음이라면 도움말 H · 기감 B → 가까이 E 조사 → 수첩 N');$('areaBanner').querySelector('small').textContent=g.presentationTravel?.from!==g.presentationTravel?.to?g.presentationTravel.from+' → '+g.presentationTravel.to:'['+AREAS[g.area].world+'] 지역 이동';$('areaBanner').querySelector('strong').textContent=e.text;$('areaBanner').classList.add('show');clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>$('areaBanner').classList.remove('show'),1800);persist();}
      if(e.type==='manifestation'){
        clearTimeout(bannerTimer);$('areaBanner').classList.remove('show');$('ultimateBanner').querySelector('small').textContent='이름 없는 발현';$('ultimateBanner').querySelector('strong').textContent=e.title;$('ultimateBanner').style.setProperty('--fate-color',Fate.PATHS[e.path].color);$('ultimateBanner').classList.add('show');clearTimeout(ultimateTimer);ultimateTimer=setTimeout(()=>$('ultimateBanner').classList.remove('show'),2100);toast(e.text.replace('\n',' · '));persist();
      }
      if(e.type==='ultimate'){$('ultimateBanner').querySelector('small').textContent='나만의 오의';clearTimeout(bannerTimer);$('areaBanner').classList.remove('show');$('ultimateBanner').querySelector('strong').textContent=e.title;$('ultimateBanner').style.setProperty('--fate-color',Fate.PATHS[e.path].color);$('ultimateBanner').classList.add('show');clearTimeout(ultimateTimer);ultimateTimer=setTimeout(()=>$('ultimateBanner').classList.remove('show'),1100);}
      if(['transfer','victory','defeat','dialog','awakening','trial-complete','legend-ready'].includes(e.type)){story(e);if(e.inheritance)progressionUI?.inherit(e);persist();}
    }
  }
  function interact(){if(!running())return;const before={gold:g.gold,training:g.training};const result=g.interact();if(result?.type==='dialog'){result.result=[];if(g.gold>before.gold)result.result.push('금화 +'+(g.gold-before.gold));if(g.training>before.training)result.result.push(['','월영참 습득','천뢰격 습득','경계 공명 완성'][g.training]);if(result.result.length)result.result.push('다음 행동 · '+ObjectiveModel.resolve(g).currentAction);}if(result?.type==='dungeon-select')dungeonUI.open();if(result?.type==='seven-preparation')show(result.title,result.text,result.choices.map(choice=>({label:choice.label,run:()=>{g.chooseSevenPreparation(choice.id);processEvents();persist();update();}})),'warden','공동 대응 준비');if(result?.type==='intro-next')introUI.resume();if(result&&['dialog','fate-trial','fate-choice','awakening'].includes(result.type))story(result);if(result?.type==='contract-board')contractUI.open();if(result?.type==='shop')shop();if(result?.type==='toast')toast(result.text);processEvents();persist();update();}
  function act(action){
    if(!running())return;const k=g.skillInfo(action);if(!k)return;
    if(!g.act(action)){
      if(k.locked)toast(WorldGrowth.worldOf(g)==='reality'?'무공 화면에서 현실 대응을 장착하세요. 미계승 상태에서는 타격과 회피로 진행할 수 있습니다.':'전장에서 나타난 감각은 무공에 기록됩니다.');
      else if(action==='ultimate'&&g.fate.focus<100)toast('적에게 타격하거나 기연 행동에 성공해 기세 100을 모으세요.');
      else if(WorldGrowth.worldOf(g)==='murim'&&action==='signature2'&&Fate.active(g)==='echo'&&!g.combat.echo)toast('Q 잔영각으로 먼저 잔향을 남겨야 합니다.');
      else if(WorldGrowth.worldOf(g)==='murim'&&action==='signature2'&&Fate.active(g)==='echo'&&g.combat.echo&&!g.lineClear(g.player,g.combat.echo))toast('잔향까지의 길이 막혔습니다. 벽을 넘어 귀환할 수 없습니다.');
      else if(g.training<k.need)toast('백련 사부에게 아직 배우지 않은 무공입니다.');
      else if(g.player.mp<k.cost)toast('내력이 부족합니다. 잠시 호흡을 고르세요.');
      else if(action==='potion')toast(g.potions<=0?'회복약이 없습니다. 거점에서 구입하세요.':'체력이 충분하거나 재사용 대기 중입니다.');
    }else if(action==='potion')persist();processEvents();update();
  }
  function updateNews(){realmUI?.update();}
  function update(){
    updateNews();journeyUI?.update();progressionUI?.update();
    for(const [id,section]of [['inventory','growth'],['personalNews',null],['fateJournal','skills'],['character','status']]){const e=$(id);if(e&&g.unreadNews){const n=g.unreadNews(section).length;e.classList.toggle('has-news',n>0);e.setAttribute('aria-label',({inventory:'성장',personalNews:'내 소식',fateJournal:'무공',character:'캐릭터 상태'})[id]+(n?' · 새 소식 '+n+'개':''));}}
    if(active&&!dialog.open&&!g.introActive){const hint=g.potionHint();if(hint){toast(hint);$('potion').classList.add('potion-guidance');persist();}}
    $('potion').title='회복약 '+g.potions+'개 · 최대 체력의 55% ('+Math.ceil(g.stats().hp*.55)+') 회복'+(g.potions<=0?' · 보유 약 없음':g.player.hp>=g.stats().hp?' · 체력이 가득 찼습니다.':'');
    $('canvas').setAttribute('aria-label',`게임 화면. 이동 ${['up','left','down','right'].map(a=>Controls.key(a)).join('/')}, 공격 ${Controls.key('attack')}, 월영참 ${Controls.key('moon')}, 천뢰격 ${Controls.key('storm')}, 회피 ${Controls.key('dash')}, 상호작용 ${Controls.key('interact')}`);
    for(const btn of document.querySelectorAll('[data-action]')){const k=btn.querySelector('kbd');if(k)k.textContent=Controls.key(btn.dataset.action);}
    for(const [id,action]of [['inventory','growth'],['interact','interact'],['potion','potion'],['fieldNotes','notes'],['sense','sense'],['helpButton','help']]){const el=$(id);if(el){const k=el.querySelector('kbd');if(k)k.textContent=Controls.key(action);el.setAttribute('aria-label',Controls.labels[action]+' '+Controls.key(action));}}
    const a=AREAS[g.area],s=g.stats(),p=g.player,o=ObjectiveModel.resolve(g);
    const murim=WorldGrowth.worldOf(g)==='murim';$('growthStatus').textContent=(g.journey.breath==='flow'?(murim?'유수심법':'회복 운용'):(murim?'집중심법':'집중 운용'))+' · 성장';
    $('mpTrack').setAttribute('aria-label',murim?'내력':'자원');$('mpTrack').parentElement.querySelector('label').textContent=murim?'내력':'자원';
    $('world').textContent=a.world;$('rank').textContent=murim?(g.journey?.realm?'이류 · 돌파':g.training?'입문 · 수련 중':'미각성'):'E급 헌터';$('place').textContent=a.name;$('sub').textContent=a.sub;$('lv').textContent=g.level;$('gold').textContent=g.gold;
    for(const [id,val,max]of [['hp',p.hp,s.hp],['mp',p.mp,s.mp]]){$(id).style.width=Math.max(0,val/max*100)+'%';$(id+'Text').textContent=`${Math.ceil(val)} / ${max}`;$(id+'Track').setAttribute('aria-valuemin','0');$(id+'Track').setAttribute('aria-valuemax',String(max));$(id+'Track').setAttribute('aria-valuenow',String(Math.ceil(val)));}
    $('quest').textContent=o.title;$('questDesc').textContent=o.text;$('chapterKicker').textContent=o.category||'CHAPTER 0'+o.chapter;$('chapterTitle').textContent=o.category?'현실의 실전':o.chapter===7?'같은 상처의 두 끝':o.chapter===6?'두 하늘의 호흡':o.chapter===5?'기록에 없는 귀환자':o.chapter===4?'끊긴 귀환로':o.chapter===3?'나의 전설':o.chapter===2?'잔월의 서약':'경계를 넘는 자';$('sync').textContent='현실 Lv.'+g.worldGrowth.reality.level+' / 무림 Lv.'+g.worldGrowth.murim.level;
    const phase=o.chapter===7?g.laterStory.seven:o.chapter===6?g.laterStory.six:o.chapter===5?g.journey.phase:o.chapter===4?g.chapter4.phase:o.chapter===3?g.fate.stage:o.chapter===1?g.progress:g.progress-6;if($('questSteps').dataset.step!==`${g.progress}:${g.fate.stage}:${g.chapter4?.phase||0}:${g.journey?.phase||0}`){$('questSteps').replaceChildren(...Array.from({length:o.chapter===4?4:6},(_,i)=>node('i',i<phase?'done':'')));$('questSteps').dataset.step=`${g.progress}:${g.fate.stage}:${g.chapter4?.phase||0}:${g.journey?.phase||0}`;}
    $('xp').style.width=g.xp/s.next*100+'%';$('xpText').textContent=`${g.xp} / ${s.next}`;$('atk').textContent='공격력 '+s.attack;$('potion').querySelector('b').textContent=g.potions;
    const near=g.nearestPoint();$('interact').classList.toggle('near',!!near);$('interact').querySelector('span').textContent=near?near.kind==='npc'?'대화 · '+near.label:near.kind==='shop'?'보급':near.kind==='rest'?'휴식하기':near.label:'대화 / 이동';
    $('objectiveArrow').hidden=!o.target;if(!o.target){$('objectiveTarget').textContent=o.title;$('objectiveHint').textContent=Controls.format(o.text);}
    if(o.target){$('objectiveTarget').textContent=`${o.target.label} · ${Math.round(dist(p,o.target)/10)}걸음`;$('objectiveHint').textContent=o.text;$('objectiveArrow').style.transform=`rotate(${Math.atan2(o.target.y-p.y,o.target.x-p.x)*180/Math.PI+90}deg)`;}
    const path=g.trial?.path||g.activeFamily();$('game').classList.toggle('has-fate',!!path);$('fateControls').hidden=!path;
    if(path){const theme=Fate.PATHS[path];$('game').style.setProperty('--fate-color',theme.color);$('fateName').textContent=theme.name;$('fateState').textContent=!murim?(g.realityStatus(path)==='settled'?'현실 대응 정착':'대응 장착 · 실전 확인 중'):g.trial?'시험 중 · 임시 공명':path==='ripple'?`축적 파문 ${g.combat.charges}/3`:path==='echo'?(g.combat.echo?`잔향 ${g.combat.echo.life.toFixed(1)}초`:'잔향 대기'):(g.combat.field?`결계 ${g.combat.field.life.toFixed(1)}초`:'결계 대기');$('focusFill').style.width=g.fate.focus+'%';$('focusText').textContent='기세 '+Math.floor(g.fate.focus)+' / 100';$('focusFill').parentElement.setAttribute('aria-valuenow',String(Math.floor(g.fate.focus)));
      for(const action of Fate.names){const btn=document.querySelector(`[data-action="${action}"]`),sk=g.skillInfo(action);btn.querySelector('span').textContent=sk.glyph;btn.querySelector('small').textContent=sk.name;btn.classList.toggle('locked',sk.locked);btn.classList.toggle('ready',action==='ultimate'&&g.fate.focus>=100&&!sk.locked);btn.setAttribute('aria-label',sk.name+(sk.locked?' 미습득':''));btn.title=sk.description;const cd=btn.querySelector('em');cd.classList.toggle('active',g.player.cool[action]>.05);cd.textContent=Math.ceil(g.player.cool[action]);}
    }
    const boss=g.enemies.find(e=>e.boss&&e.hp>0);$('boss').hidden=!(boss&&dist(p,boss)<560);
    if(boss){$('boss').querySelector('span').textContent=boss.name;$('boss').querySelector('u').style.width=boss.hp/boss.maxHp*100+'%';$('boss').querySelector('small').textContent=g.bossLocked()?'호위 / 봉인 해제 후 공격 가능':boss.hp<boss.maxHp/2?'격노 · 더 빠른 공격 예고':'공격 예고를 피하고 빈틈을 노리세요';}
    for(const action of ['moon','storm','dash']){const btn=document.querySelector(`[data-action="${action}"]`),k=g.skillInfo(action);btn.querySelector('small').textContent=k.name;btn.classList.toggle('locked',g.training<k.need);btn.classList.toggle('no-mana',p.mp<k.cost);btn.setAttribute('aria-label',`${k.name}${g.training<k.need?' 미습득':''}`);const cd=btn.querySelector('em');cd.classList.toggle('active',p.cool[action]>.04);cd.textContent=p.cool[action]>=1?Math.ceil(p.cool[action]):p.cool[action].toFixed(1);}
    document.querySelector('.scene-bottom>span').textContent=matchMedia('(pointer:coarse)').matches?'왼쪽 이동 · 오른쪽 공격 / 회피':'WASD 이동 · J 공격 · Space 회피 · E 대화';
    const closeToTarget=o.target&&near?.id===o.target.id;
    const nextText=closeToTarget?`${Controls.key('interact')} · ${o.target.kind==='npc'?'대화하기':o.target.kind==='portal'?'이동하기':'상호작용'} — ${Controls.format(o.text)}`:Controls.format(o.text);
    $('questDesc').textContent=Controls.format(o.text);$('objectiveHint').textContent=nextText;
    document.querySelector('.scene-bottom>span').textContent=Controls.format(document.querySelector('.scene-bottom>span').textContent);
    $('rank').textContent='E급 헌터'+(g.journey?.phase===5?' · C급 현장 인증':'');
    $('inventory').querySelector('span').textContent='성장';
  }
  window.addEventListener('wuxia-assets-ready',()=>{renderer.cache={};WorldArt.portrait($('hudPortrait'),'hero');if(!$('title').hidden)WorldArt.cover($('cover'));});
  $('fateJournal').addEventListener('click',fateJournal);
  $('start').addEventListener('click',newGame);$('continue').addEventListener('click',()=>start(true));$('menu').addEventListener('click',menu);$('inventory').addEventListener('click',inventory);$('journal').addEventListener('click',journal);$('mapBtn').addEventListener('click',map);$('interact').addEventListener('click',interact);$('potion').addEventListener('click',()=>act('potion'));$('closeDialog').addEventListener('click',closeDialog);
  // Clear synchronously at every close/cancel path. Native close is queued and
  // must not erase a fresh movement key pressed after the dialog disappeared.
  dialog.addEventListener('cancel',e=>{audio.clear();queued=[];clearInput();if(introUI?.active){e.preventDefault();introUI.resume();}});
  $('sound').addEventListener('click',()=>audioUI.open());$('sound').setAttribute('aria-label','소리 설정');
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('game').requestFullscreen();}catch(error){toast('이 브라우저에서는 전체 화면을 지원하지 않습니다.');}});
  function controlSettings(){
    const body=node('section','control-settings');
    for(const [a,label]of Object.entries(Controls.labels)){
      const row=node('div','control-row'),b=node('button','secondary');b.textContent=Controls.key(a);row.append(node('span','',label),b);body.append(row);
      b.onclick=()=>{b.textContent='키를 누르세요';b.onkeydown=e=>{e.preventDefault();e.stopPropagation();if(e.repeat)return;const result=Controls.bind(a,e.code);b.onkeydown=null;if(result.conflict)show('겹치는 키',Controls.labels[result.conflict]+'에 이미 배정되어 있습니다.',[{label:'서로 교환',run:()=>{Controls.bind(a,e.code,true);controlSettings();}},{label:'취소',run:controlSettings}]);else controlSettings();};b.focus();};
    }
    show('입력 설정',body,[{label:'방향키 + QWER ASDF',run:()=>{Controls.preset('right');controlSettings();}},{label:'기존 배치',secondary:true,run:()=>{Controls.preset('legacy');controlSettings();}},{label:'돌아가기',run:()=>{clearInput();update();}}]);
  }
  window.addEventListener('keydown',e=>{
    if(dialog.open){
      if(e.defaultPrevented||e.target.closest('input,textarea,select,a,[contenteditable=true]'))return;
      const buttons=[...dialog.querySelectorAll('#dialogBody button:not(:disabled),#dialogActions button:not(:disabled)')].filter(b=>b.getClientRects().length);
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();if(e.repeat)return;const i=buttons.indexOf(document.activeElement),step=['ArrowLeft','ArrowUp'].includes(e.code)?-1:1;buttons[(i+step+buttons.length)%buttons.length]?.focus();return;}
      if(e.code==='Enter'||e.code==='NumpadEnter'||e.code==='Space'||e.code===Controls.code('interact')){e.preventDefault();if(e.repeat)return;const focused=document.activeElement;const target=focused?.matches('button:not(:disabled)')&&dialog.contains(focused)?focused:buttons[0];target?.click();}return;
    }
    if(!active)return;
    const action=Controls.action(e.code);if(action)e.preventDefault();
    if(action==='menu'){if(!e.repeat)menu();return;}if(!running())return;if(e.repeat&&!keys.has(e.code))return;keys.add(e.code);if(e.repeat)return;
    if(['attack','moon','storm','signature1','signature2','ultimate','dash','potion','sense'].includes(action))act(action);
    if(action==='interact')interact();if(g.introActive)return;if(action==='growth')inventory();if(action==='map')map();if(action==='notes')journeyUI.open();if(action==='help')realmUI.openHelp();
  });window.addEventListener('keyup',e=>keys.delete(e.code));
  for(const btn of document.querySelectorAll('[data-action]')){
    const action=btn.dataset.action;btn.addEventListener('pointerdown',e=>{e.preventDefault();if(!running())return;btn.setPointerCapture(e.pointerId);if(action==='attack')held.add(e.pointerId);act(action);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(name,e=>held.delete(e.pointerId));
    btn.addEventListener('click',e=>{if(e.detail===0)act(action);});btn.addEventListener('contextmenu',e=>e.preventDefault());
  }
  const stick=$('stick');function moveStick(e){if(e.pointerId!==joyId)return;const r=stick.getBoundingClientRect(),max=r.width*.31;let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;const n=Math.hypot(x,y);if(n>max){x*=max/n;y*=max/n;}joy={x:x/max,y:y/max};stick.querySelector('i').style.transform=`translate(${x}px,${y}px)`;}
  stick.addEventListener('pointerdown',e=>{e.preventDefault();if(!running()||joyId!==null)return;joyId=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);});stick.addEventListener('pointermove',moveStick);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,e=>{if(e.pointerId===joyId){joyId=null;joy={x:0,y:0};stick.querySelector('i').style.transform='';}});
  $('canvas').addEventListener('pointerdown',e=>{if(!running()||e.pointerType==='touch')return;e.preventDefault();if(e.button===0){$('canvas').setPointerCapture(e.pointerId);held.add(e.pointerId);const r=$('canvas').getBoundingClientRect();g.player.face=Math.atan2((e.clientY-r.top)/renderer.zoom+renderer.camera.y-g.player.y,(e.clientX-r.left)/renderer.zoom+renderer.camera.x-g.player.x);act('attack');}if(e.button===2)act('dash');});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])$('canvas').addEventListener(name,e=>held.delete(e.pointerId));$('canvas').addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('blur',()=>{clearInput();audio.clear();});document.addEventListener('visibilitychange',()=>{clearInput();audio.clear();persist();lastFrame=performance.now();});window.addEventListener('pagehide',persist);
  new ResizeObserver(()=>{renderer.resize();if(!$('title').hidden)WorldArt.cover($('cover'));}).observe($('playArea'));window.addEventListener('resize',()=>{clearInput();renderer.resize();if(!$('title').hidden)WorldArt.cover($('cover'));});
  function frame(now){
    const elapsed=now-lastFrame,dt=Math.min(elapsed/1000,.05);lastFrame=now;
    try{
      if(perf&&running()&&elapsed>0&&elapsed<1000){perf.record(elapsed);if(now-lastPerfHud>500){const quality=renderer.reduced||renderer.autoLow?0:renderer.quality;perfHud.textContent=`PERF · local only\navg ${perf.averageMs.toFixed(1)} ms · recent ${perf.recentMs.toFixed(1)} ms (120 frames)\nslow >35 ms ${perf.slowTotal} · pressure ${renderer.slowFrames}\nautoLow ${renderer.autoLow?'ON':'OFF'} · quality ${quality} (base ${renderer.quality})\nviewport ${innerWidth}×${innerHeight} · canvas ${Math.round(renderer.w)}×${Math.round(renderer.h)} · DPR ${renderer.dpr}`;lastPerfHud=now;}}
      if(running()){const pressed=a=>[...keys].some(k=>Controls.action(k)===a),x=joy.x+(pressed('right')?1:0)-(pressed('left')?1:0),y=joy.y+(pressed('down')?1:0)-(pressed('up')?1:0);g.step(dt,{x,y,attack:pressed('attack')||held.size>0});processEvents();if(now-lastSave>4000)persist();}
      if(active){renderer.draw(g,dt);if(now-lastHud>70){update();lastHud=now;}}
    }catch(error){if(!errorReported){errorReported=true;console.error(error);show('게임 실행 중 오류가 발생했습니다','저장된 진행은 그대로 보관됩니다. 새로고침 후에도 반복되면 이 내용을 알려 주세요.\n\n'+error.message);}}
    requestAnimationFrame(frame);
  }
  $('growthStatus').onclick=()=>inventory();
  dialogueUI=DialogueUI.create({show,node});
  journeyUI=JourneyUI.create({game:()=>g,show,node,grid,refresh:()=>{processEvents();persist();update();},act,running,active:()=>active,growth:()=>growthUI.open()});
  realmUI=RealmUI.create({game:()=>g,show,node,refresh:()=>{processEvents();persist();update();},active:()=>active,clearInput,notes:journeyUI});
  introUI=IntroUI.create({game:()=>g,setGame:value=>{g=value;renderer.area=null;progressionUI?.clear();clearInput();},show,node,refresh:()=>{processEvents();persist();update();}});
  const refreshGrowth=()=>{processEvents();persist();update();};
  const historyUI=GrowthUI.create({game:()=>g,show,node,grid,close:closeDialog,refresh:refreshGrowth,notes:journeyUI,shop,route:tab=>tab==='status'?characterUI.open():growthUI.open('skills')});
  characterUI=CharacterUI.create({game:()=>g,show,node,grid,refresh:refreshGrowth,openSection:section=>growthUI.open(section)});
  newsUI=NewsUI.create({game:()=>g,show,node,refresh:refreshGrowth,openDestination:item=>item.section==='status'?characterUI.open('reality'):growthUI.open(item.section,item.subject)});
  growthUI=DevelopmentUI.create({game:()=>g,show,node,refresh:refreshGrowth,notes:journeyUI,close:closeDialog,character:characterUI,news:()=>newsUI,history:historyUI});
  const character=node('button'),hudPortrait=$('hudPortrait');character.id='character';character.type='button';character.setAttribute('aria-label','캐릭터 상태');hudPortrait.replaceWith(character);character.append(hudPortrait);character.onclick=()=>characterUI.open();
  const newsButton=node('button','icon-button','소식');newsButton.id='personalNews';newsButton.onclick=()=>newsUI.open();document.querySelector('.header-actions').prepend(newsButton);
  progressionUI=ProgressionUI.create({node});
  // Repeatable contracts remain in the isolated archive only.
  objectiveUI=ObjectiveUI.create({game:()=>g,node,show,openMap:map,refresh:()=>{clearInput();update();}});
  audioUI=AudioUI.create({audio,show,node});
  dungeonUI=DungeonUI.create({game:()=>g,node,show,refresh:refreshGrowth,close:closeDialog,isOpen:()=>dialog.open,prepare:async id=>globalThis.ArtPreview?.prepare?ArtPreview.prepare(AREAS[id].world==='현실'?'reality':'murim'):true});
  const mainNav=node('nav','main-navigation');mainNav.setAttribute('aria-label','주 메뉴');for(const [label,run]of [['캐릭터',()=>characterUI.open()],['임무',()=>objectiveUI.open()],['기록',openRecords],['설정',menu]]){const b=node('button','secondary',label);b.onclick=run;mainNav.append(b);}document.querySelector('header').append(mainNav);
  inspectSave();WorldArt.cover($('cover'));WorldArt.portrait($('hudPortrait'),'hero');update();requestAnimationFrame(frame);
})();
