/* Browser adapter: input lifecycle, modal flow, save migration, and readable HUD. */
(function(){
  'use strict';
  const {Game,AREAS,QUESTS,SKILLS,VERSION,dist}=DualWorld;
  const $=id=>document.getElementById(id),SAVE='dualworld.save.v1',BACKUP='dualworld.backup.v1';
  const dialog=$('dialog'),renderer=new WorldRenderer($('canvas'),$('mini'));
  let g=new Game(),active=false,resume=null,hasSave=false,saveWarning=false,lastSave=0,lastFrame=performance.now(),lastHud=0;
  let sound=false,audio=null,bannerTimer=null,queued=[],errorReported=false;
  const keys=new Set(),held=new Set();let joy={x:0,y:0},joyId=null;
  const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const running=()=>active&&!dialog.open&&!document.hidden;
  function clearInput(){keys.clear();held.clear();joy={x:0,y:0};joyId=null;$('stick').querySelector('i').style.transform='';}
  function toast(text){const e=node('div','toast',text);$('toasts').append(e);while($('toasts').children.length>3)$('toasts').firstChild.remove();setTimeout(()=>e.remove(),3000);}
  function inspectSave(){
    resume=null;hasSave=false;$('titleError').textContent='';
    try{const raw=localStorage.getItem(SAVE);hasSave=raw!==null;if(raw!==null)resume=Game.load(raw);}
    catch(error){$('titleError').textContent='저장 데이터를 읽을 수 없습니다. 기존 데이터는 유지됩니다. 새 여정은 확인 후 시작합니다.';}
    $('continue').hidden=!resume;$('start').className=resume?'secondary':'primary';
  }
  function backup(force=false){try{const raw=localStorage.getItem(SAVE);if(raw!==null&&(force||!localStorage.getItem(BACKUP)))localStorage.setItem(BACKUP,raw);}catch(error){/* Storage may be unavailable; never block play. */}}
  function persist(){
    if(!active)return;
    try{localStorage.setItem(SAVE,g.save());$('save').textContent='저장됨';hasSave=true;lastSave=performance.now();}
    catch(error){$('save').textContent='저장 불가';if(!saveWarning){toast('자동 저장 불가 · 메뉴에서 저장 파일을 내려받으세요.');saveWarning=true;}}
  }
  function closeDialog(){if(dialog.open)dialog.close();clearInput();lastFrame=performance.now();if(queued.length){const next=queued.shift();show(next.title,next.text,next.actions,next.portrait,next.kicker);}}
  function show(title,body,actions=[{label:'계속하기'}],portrait='system',kicker='쌍계 · 이야기'){
    clearInput();$('dialogTitle').textContent=title;$('dialogKicker').textContent=kicker;
    $('dialogBody').replaceChildren();if(typeof body==='string')$('dialogBody').textContent=body;else $('dialogBody').append(body);
    WorldArt.portrait($('portrait'),portrait);$('dialogActions').replaceChildren();
    actions.forEach(a=>{const b=node('button',a.secondary?'secondary':a.danger?'danger':'primary',a.label);b.disabled=!!a.disabled;b.addEventListener('click',()=>{queued=[];if(dialog.open)dialog.close();clearInput();lastFrame=performance.now();if(a.run)a.run();});$('dialogActions').append(b);});
    if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
  }
  function story(event){
    const actions=event.type==='victory'?[{label:'거점으로 귀환',run:()=>{g.retreat();processEvents();persist();update();}},{label:'조금 더 둘러보기',secondary:true}]:[{label:event.type==='transfer'?'현실에서 이어가기':event.type==='defeat'?'다시 일어서기':'계속하기'}];
    const kicker=event.type==='victory'?'전투 승리':event.type==='transfer'?'능력 전승':'쌍계 · 이야기';
    if(dialog.open)queued.push({title:event.title,text:event.text,actions,portrait:event.portrait||'system',kicker});
    else show(event.title,event.text,actions,event.portrait||'system',kicker);
  }
  function start(load=false){
    backup();g=load&&resume?resume:new Game();active=true;queued=[];clearInput();$('title').hidden=true;$('game').hidden=false;renderer.area=null;renderer.resize();lastFrame=performance.now();persist();update();
    if(!load)show('제1장 · 낯선 신호','당신은 해온시의 신입 헌터, 윤서.\n균열에서 회수한 경계석이 당신의 손에서 깨어났다.\n\n무림에서 익힌 무공은 현실에서도 사라지지 않는다.\n먼저 관리관 서린을 찾아가자.\n\n이동: WASD / 왼쪽 조이스틱\n대화: E / 화면 아래 대화 버튼\n금빛 방향 표식이 다음 목표를 안내합니다.',[{label:'여정 시작'}],'hero');
    else toast('안전한 거점에서 이어갑니다. 기존 성장과 무공을 유지했습니다.');
  }
  function newGame(){if(hasSave)show('새로운 여정을 시작할까요?','현재 진행을 새 저장으로 교체합니다. 이전 저장은 브라우저의 백업 항목에도 보관합니다.\n\n기존 여정은 이어하기로 계속할 수 있습니다.',[{label:'취소',secondary:true},{label:'새로 시작',danger:true,run:()=>{backup(true);start(false);}}],'system','저장 데이터 확인');else start(false);}
  function grid(items){const e=node('div','stat-grid');for(const [label,value]of items){const b=node('div','',label);b.append(node('b','',String(value)));e.append(b);}return e;}
  function inventory(){
    if(!active)return;const s=g.stats(),body=node('div');body.append(grid([['두 세계 공격력',s.attack],['무기 강화','+'+g.upgrade],['최대 체력',s.hp],['최대 내력',s.mp]]));
    body.append(node('p','dialog-note',`${g.training>=2?'청명검':'수련검'} · 모든 장비와 무공은 현실 / 무림에서 공유됩니다.`));
    const list=[['劍','연환검','기본 3연격. 세 번째 공격은 더 넓고 강합니다. J / 공격 버튼 길게 누르기.',true],['月','월영참','전방 광역 베기 · 내력 18 · 재사용 2.8초. 백련에게 배웁니다.',g.training>=1],['雷','천뢰격','주변 광역 낙뢰 · 내력 32 · 재사용 6초. 죽림 공략 후 습득.',g.training>=2],['界','경계 공명','지속 효과: 공격력 +6, 받는 피해 15% 감소. 제2장 폐사 공략 후 습득.',g.training>=3]];
    for(const [symbol,name,desc,learned]of list){const row=node('div','skill-row'),copy=node('div');row.append(node('span','',symbol));copy.append(node('b','',name+(learned?'':' · 미습득')),node('p','',desc));row.append(copy);body.append(row);}
    show('몸에 새겨진 힘',body,[{label:'돌아가기',secondary:true},...(AREAS[g.area].safe?[{label:'보급 / 강화',run:shop}]:[])],'hero','무공 · 장비');
  }
  function shop(){
    if(!AREAS[g.area].safe)return;const body=node('div');body.append(grid([['소지 금화',g.gold],['회복약',g.potions],['강화 단계','+'+g.upgrade],['공격력',g.stats().attack]]));body.append(node('p','','회복약: 최대 체력의 55% 회복\n무기 강화: 단계마다 두 세계 공격력 +4\n거점의 휴식 장소에서는 무료로 체력과 내력을 회복합니다.'));
    show('여정을 위한 준비',body,[{label:'회복약 · 25 금화',disabled:g.gold<25||g.potions>=99,run:()=>{g.buy('potion');processEvents();persist();shop();}},{label:g.upgrade>=10?'최대 강화':`강화 · ${80+g.upgrade*60} 금화`,disabled:g.upgrade>=10||g.gold<80+g.upgrade*60,run:()=>{g.buy('upgrade');processEvents();persist();shop();}},{label:'돌아가기',secondary:true}],'shop','보급 · 강화');
  }
  function map(){const body=node('div'),canvas=node('canvas','map-full');canvas.width=460;canvas.height=340;renderer.drawMini(g,canvas,true);body.append(canvas,node('p','dialog-note','◆ 현재 위치 · 붉은 점: 적 · 금빛 점: 인물과 출입구\n화면의 방향 표식과 현재 목표를 함께 확인하세요.'));show(AREAS[g.area].name,body,[{label:'돌아가기'}],'system','지역 지도');}
  function journal(){
    const body=node('div');body.append(node('p','','현실의 균열에서 발견한 경계석.\n무림에서 몸에 새긴 호흡은 현실에서도 사라지지 않는다.\n\n제1장: 두 세계의 검\n무공을 익히고 현실의 균열을 공략한다.\n\n제2장: 잔월의 서약\n폐사의 세 인장을 깨우고, 현실 항만의 검은 파도를 잠재운다.'));
    body.append(grid([['현재 이야기',g.progress>=7?'제2장':'제1장'],['전승 무공',Math.min(g.training,2)+'개'],['경계 공명',g.training>=3?'완성':'미완성'],['현실 / 무림 공격력',`${g.stats().attack} / ${g.stats().attack}`]]));show('두 세계의 공명',body,[{label:'돌아가기'}]);
  }
  function exportSave(raw=g.save(),filename='ssanggye-save.json'){const blob=new Blob([raw],{type:'application/json'}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('저장 파일을 다운로드했습니다.');}
  function importSave(){
    show('저장 파일 불러오기','파일 선택 중에는 게임이 멈춥니다. 선택을 취소했다면 돌아가기를 누르세요.',[{label:'돌아가기'}],'system','저장 데이터');
    const input=node('input');input.type='file';input.accept='.json,application/json';input.addEventListener('change',async()=>{
      const file=input.files?.[0];if(!file)return;if(file.size>32768){show('불러오지 못했습니다','저장 파일 크기가 너무 큽니다. 현재 진행은 유지됩니다.');return;}
      try{const loaded=Game.load(await file.text());show('이 여정을 불러올까요?',`Lv.${loaded.level} · ${QUESTS[loaded.progress][0]}\n현재 진행이 선택한 저장으로 교체됩니다.`,[{label:'취소',secondary:true},{label:'불러오기',run:()=>{backup(true);g=loaded;renderer.area=null;persist();update();toast('저장한 거점에서 이어갑니다.');}}]);}
      catch(error){show('불러오지 못했습니다','손상되었거나 지원하지 않는 저장 파일입니다. 현재 진행은 변경되지 않았습니다.');}
    });input.click();
  }
  function help(){show('첫 여정을 위한 안내','WASD / 방향키: 이동\nJ / 공격 버튼 길게 누르기: 연환검\nK: 월영참 · L: 천뢰격\nSpace / Shift: 회피 · 짧은 무적\nE: 대화 / 출입구 이동 · 1: 회복약\nI: 무공과 장비 · M: 지도 · Esc: 메뉴\n\n모바일에서는 왼쪽 조이스틱으로 이동하면서 오른쪽 공격과 무공을 함께 누를 수 있습니다.\n\n붉은 원은 적의 공격 예고입니다. 원 밖으로 피하거나 회피의 무적으로 넘기세요. 호위와 봉인을 해제해야 보스의 보호막이 사라집니다.');}
  function menu(){
    if(!active)return;const actions=[{label:'계속하기'},{label:'조작 안내',secondary:true,run:help},{label:'지역 지도',secondary:true,run:map},{label:'저장 파일 다운로드',secondary:true,run:()=>exportSave()},{label:'저장 파일 불러오기',secondary:true,run:importSave},{label:renderer.reduced?'화면 효과 켜기':'화면 효과 줄이기',secondary:true,run:()=>{renderer.reduced=!renderer.reduced;menu();}}];
    if(!AREAS[g.area].safe)actions.push({label:'거점으로 후퇴',secondary:true,run:()=>show('거점으로 돌아갈까요?','무공과 이야기 진행은 유지됩니다.\n다시 입장하면 호위와 아직 완료하지 않은 봉인 공략을 처음부터 시작합니다.',[{label:'취소',secondary:true},{label:'후퇴하기',run:()=>{g.retreat();processEvents();persist();update();}}])});
    else actions.push({label:'보급 / 강화',secondary:true,run:shop});
    actions.push({label:'타이틀로',secondary:true,run:()=>{persist();active=false;clearInput();$('game').hidden=true;$('title').hidden=false;inspectSave();WorldArt.cover($('cover'));}});
    show('잠시, 호흡을 고르다',`Lv.${g.level} · ${AREAS[g.area].name}\n${QUESTS[g.progress][0]}\n\n메뉴와 대화가 열려 있는 동안 전투가 멈춥니다.`,actions,'hero','일시정지 · v'+VERSION);
  }
  function playSound(name){
    if(!sound)return;try{if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audio=new Audio();}if(audio.state==='suspended')audio.resume();const osc=audio.createOscillator(),gain=audio.createGain(),f={slash:220,skill:520,dash:160,hurt:105,reward:780,heal:620}[name]||330;osc.type=name==='slash'?'triangle':'sine';osc.frequency.setValueAtTime(f,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(f*.5,audio.currentTime+.12);gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.17);}catch(error){sound=false;}
  }
  function processEvents(){
    for(const e of g.events.splice(0)){
      if(e.type==='toast')toast(e.text);if(e.type==='sound')playSound(e.name);
      if(e.type==='area'){clearInput();$('areaBanner').querySelector('strong').textContent=e.text;$('areaBanner').classList.add('show');clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>$('areaBanner').classList.remove('show'),1800);persist();}
      if(['transfer','victory','defeat'].includes(e.type)){story(e);persist();}
    }
  }
  function interact(){if(!running())return;const result=g.interact();if(result?.type==='dialog')story(result);if(result?.type==='shop')shop();if(result?.type==='toast')toast(result.text);processEvents();persist();update();}
  function act(action){
    if(!running())return;const k=SKILLS[action];if(!k)return;
    if(!g.act(action)){
      if(g.training<k.need)toast('백련 사부에게 아직 배우지 않은 무공입니다.');
      else if(g.player.mp<k.cost)toast('내력이 부족합니다. 잠시 호흡을 고르세요.');
      else if(action==='potion')toast(g.potions<=0?'회복약이 없습니다. 거점에서 구입하세요.':'체력이 충분하거나 재사용 대기 중입니다.');
    }else if(action==='potion')persist();processEvents();update();
  }
  function update(){
    const a=AREAS[g.area],s=g.stats(),p=g.player,o=g.objective();
    $('world').textContent=a.world;$('rank').textContent=g.training>=3?'경계 공명':g.training===2?'이류 무인':g.training?'삼류 무인':'미각성';$('place').textContent=a.name;$('sub').textContent=a.sub;$('lv').textContent=g.level;$('gold').textContent=g.gold;
    for(const [id,val,max]of [['hp',p.hp,s.hp],['mp',p.mp,s.mp]]){$(id).style.width=Math.max(0,val/max*100)+'%';$(id+'Text').textContent=`${Math.ceil(val)} / ${max}`;$(id+'Track').setAttribute('aria-valuemin','0');$(id+'Track').setAttribute('aria-valuemax',String(max));$(id+'Track').setAttribute('aria-valuenow',String(Math.ceil(val)));}
    $('quest').textContent=o.title;$('questDesc').textContent=o.text;$('chapterKicker').textContent=o.chapter===2?'CHAPTER 02':'CHAPTER 01';$('chapterTitle').textContent=o.chapter===2?'잔월의 서약':'경계를 넘는 자';$('sync').textContent=g.training?`${Math.min(2,g.training)}개 무공 · ${g.training>=3?'경계 공명 완성':'두 세계에 전승'}`:'경계석의 신호를 따라가세요';
    const phase=o.chapter===1?g.progress:g.progress-6;if($('questSteps').dataset.step!==String(g.progress)){$('questSteps').replaceChildren(...Array.from({length:6},(_,i)=>node('i',i<phase?'done':'')));$('questSteps').dataset.step=String(g.progress);}
    $('xp').style.width=g.xp/s.next*100+'%';$('xpText').textContent=`${g.xp} / ${s.next}`;$('atk').textContent='공격력 '+s.attack;$('potion').querySelector('b').textContent=g.potions;
    const near=g.nearestPoint();$('interact').classList.toggle('near',!!near);$('interact').querySelector('span').textContent=near?near.kind==='npc'?'대화 · '+near.label:near.kind==='shop'?'보급 / 강화':near.kind==='rest'?'휴식하기':near.label:'대화 / 이동';
    if(o.target){$('objectiveTarget').textContent=`${o.target.label} · ${Math.round(dist(p,o.target)/10)}걸음`;$('objectiveHint').textContent=o.text;$('objectiveArrow').style.transform=`rotate(${Math.atan2(o.target.y-p.y,o.target.x-p.x)*180/Math.PI+90}deg)`;}
    const boss=g.enemies.find(e=>e.boss&&e.hp>0);$('boss').hidden=!(boss&&dist(p,boss)<560);
    if(boss){$('boss').querySelector('span').textContent=boss.name;$('boss').querySelector('u').style.width=boss.hp/boss.maxHp*100+'%';$('boss').querySelector('small').textContent=g.bossLocked()?'호위 / 봉인 해제 후 공격 가능':boss.hp<boss.maxHp/2?'격노 · 더 빠른 공격 예고':'공격 예고를 피하고 빈틈을 노리세요';}
    for(const action of ['moon','storm','dash']){const btn=document.querySelector(`[data-action="${action}"]`),k=SKILLS[action];btn.classList.toggle('locked',g.training<k.need);btn.classList.toggle('no-mana',p.mp<k.cost);btn.setAttribute('aria-label',`${k.name}${g.training<k.need?' 미습득':''}`);const cd=btn.querySelector('em');cd.classList.toggle('active',p.cool[action]>.04);cd.textContent=p.cool[action]>=1?Math.ceil(p.cool[action]):p.cool[action].toFixed(1);}
    document.querySelector('.scene-bottom>span').textContent=matchMedia('(pointer:coarse)').matches?'왼쪽 이동 · 오른쪽 공격 / 회피':'WASD 이동 · J 공격 · Space 회피 · E 대화';
  }
  $('start').addEventListener('click',newGame);$('continue').addEventListener('click',()=>start(true));$('menu').addEventListener('click',menu);$('inventory').addEventListener('click',inventory);$('journal').addEventListener('click',journal);$('mapBtn').addEventListener('click',map);$('interact').addEventListener('click',interact);$('potion').addEventListener('click',()=>act('potion'));$('closeDialog').addEventListener('click',closeDialog);
  dialog.addEventListener('cancel',()=>{queued=[];clearInput();});dialog.addEventListener('close',clearInput);
  $('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'♫':'♪';$('sound').setAttribute('aria-label',sound?'소리 끄기':'소리 켜기');playSound('reward');});
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('game').requestFullscreen();}catch(error){toast('이 브라우저에서는 전체 화면을 지원하지 않습니다.');}});
  const keyActions={KeyJ:'attack',KeyK:'moon',KeyL:'storm',Space:'dash',ShiftLeft:'dash',ShiftRight:'dash',Digit1:'potion'};
  window.addEventListener('keydown',e=>{
    if(!active)return;if(dialog.open)return;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
    if(e.code==='Escape'){e.preventDefault();menu();return;}if(!running())return;keys.add(e.code);if(e.repeat)return;
    if(keyActions[e.code])act(keyActions[e.code]);if(e.code==='KeyE')interact();if(e.code==='KeyI')inventory();if(e.code==='KeyM')map();
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
  window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{clearInput();persist();lastFrame=performance.now();});window.addEventListener('pagehide',persist);
  new ResizeObserver(()=>{renderer.resize();if(!$('title').hidden)WorldArt.cover($('cover'));}).observe($('playArea'));window.addEventListener('resize',()=>{clearInput();renderer.resize();if(!$('title').hidden)WorldArt.cover($('cover'));});
  function frame(now){
    const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
    try{
      if(running()){const x=joy.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),y=joy.y+(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);g.step(dt,{x,y,attack:keys.has('KeyJ')||held.size>0});processEvents();if(now-lastSave>4000)persist();}
      if(active){renderer.draw(g,dt);if(now-lastHud>70){update();lastHud=now;}}
    }catch(error){if(!errorReported){errorReported=true;console.error(error);show('게임 실행 중 오류가 발생했습니다','저장된 진행은 그대로 보관됩니다. 새로고침 후에도 반복되면 이 내용을 알려 주세요.\n\n'+error.message);}}
    requestAnimationFrame(frame);
  }
  inspectSave();WorldArt.cover($('cover'));update();requestAnimationFrame(frame);
})();
