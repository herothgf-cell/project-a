/* Intentional simulated news, one-step guidance and a unified HUD. No remote chat or analytics. */
(function(root){
 'use strict';
 const P=Presentation,$=id=>document.getElementById(id);
 function create(env){
  const {game,show,node,refresh,active,clearInput,notes}=env;
  let signature='',newsViews=[],lastWorld='',lastGame=null;
  const button=(label,fn,cls='secondary')=>{const b=node('button',cls,label);b.type='button';b.addEventListener('click',fn);return b;};
  const help=button('도움말',()=>openHelp(),'realm-help');help.id='helpButton';help.setAttribute('aria-label','기감과 무공 해석 도움말 H');help.append(node('kbd','','H'));$('journeyTools').append(help);
  const worldBadge=node('span','world-badge');worldBadge.id='realmBadge';$('playArea').append(worldBadge);
  const guideToggle=button('길잡이 끄기',()=>{game().guideActive=false;refresh();},'guide-dismiss');
  const guideHint=node('div','guide-card');guideHint.id='guideCard';guideHint.hidden=true;guideHint.append(node('strong','','선택 탐험 길잡이'),node('p','',''),button('현재 단계 자세히',()=>openHelp()),guideToggle);$('playArea').append(guideHint);
  const channelLabel=k=>P.channels.find(x=>x[0]===k)?.[1]||'월드';
  function newsView(modal=false){
   newsViews=newsViews.filter(v=>v.root.isConnected);
   const wrap=node('section',modal?'realm-news rumor-modal':'realm-news');
   wrap.append(node('p','simulation-notice news-disclosure',P.DISCLOSURE),node('small','news-subtitle','NPC 시뮬레이션 · 실제 유저 채팅 아님'));
   const nav=node('div','news-tabs');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','소식 분류');wrap.append(nav);
   const list=node('div','news-list');list.id=modal?'modalNewsMessages':'rumorMessages';list.setAttribute('role','tabpanel');list.setAttribute('aria-live','off');list.tabIndex=0;
   let tab='all';const buttons=[];
   for(const [key,label]of P.channels){const b=button(label,()=>{tab=key;render();},'news-tab');b.setAttribute('role','tab');b.id=(modal?'modalNewsTab-':'newsTab-')+key;b.setAttribute('aria-controls',list.id);b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();const n=buttons.indexOf(b),i=e.key==='Home'?0:e.key==='End'?buttons.length-1:(n+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[i].focus();buttons[i].click();});buttons.push(b);nav.append(b);}
   wrap.append(list);const recent=node('details','recent-news');recent.append(node('summary','','최근 소식 · 현재 여정'));const recentBody=node('div');recent.append(recentBody);wrap.append(recent);
   function render(){const rows=P.news(game()),visible=rows.filter(m=>tab==='all'||m.channel===tab),atBottom=list.scrollHeight-list.scrollTop-list.clientHeight<22,scroll=list.scrollTop;
    for(let i=0;i<buttons.length;i++){const selected=P.channels[i][0]===tab;buttons[i].setAttribute('aria-selected',String(selected));buttons[i].tabIndex=selected?0:-1;}list.setAttribute('aria-labelledby',(modal?'modalNewsTab-':'newsTab-')+tab);list.replaceChildren();
    if(!visible.length)list.append(node('p','rumor-empty',tab==='server'?'이 여정에서 아직 기록된 사건 알림이 없습니다. 실제 서버 알림이 아닌 연출입니다.':'아직 이 분류의 소식이 없습니다.'));
    for(const m of visible){const row=node('article','rumor-entry '+m.channel),head=node('div','news-entry-head');head.append(node('b','',`[${channelLabel(m.channel)}] ${m.speaker}`),node('small','',m.origin));row.append(head,node('p','',m.text));list.append(row);}
    recentBody.replaceChildren();const events=rows.filter(m=>m.id.startsWith('event-')).slice(-3).reverse();if(!events.length)recentBody.append(node('p','','각성·구조 등 직접 겪은 사건이 생기면 여기에 남습니다.'));for(const m of events)recentBody.append(node('p','',m.text));
    if(atBottom)list.scrollTop=list.scrollHeight;else list.scrollTop=scroll;
   }
   render();newsViews.push({root:wrap,render});return wrap;
  }
  $('rumorContent').replaceChildren(newsView());$('rumorToggle').querySelector('span').textContent='세계의 소식';$('rumorToggle').setAttribute('aria-label','세계의 소식 · 연출 시뮬레이션');
  function openNews(){clearInput();if(matchMedia('(max-width:1099px), (pointer:coarse)').matches){show('세계의 소식 · 연출',newsView(true),[{label:'돌아가기',secondary:true}],'system','시뮬레이션 · 네트워크 채팅 없음');return;}
   const open=$('rumorContent').hidden;$('rumorContent').hidden=!open;$('rumorPanel').classList.toggle('collapsed',!open);$('rumorToggle').setAttribute('aria-expanded',String(open));
  }
  $('rumorToggle').addEventListener('click',openNews);
  function openHelp(){if(!active())return;const g=game(),u=P.guide(g),body=node('section','realm-help-sheet');
   body.append(node('p','help-purpose','환서정은 기존 무공의 사용법을 바꾸는 단서를 찾는 선택 탐험입니다. 진행하지 않아도 기존 이야기와 무공은 유지됩니다.'));
   for(const [title,copy]of [['기감 · B / 화면 기감','내 주변의 숨겨진 반응을 찾습니다. 전체 지도 정답을 표시하지는 않습니다.'],['조사 · E / 화면 대화·이동','드러난 물건 가까이에 서서 내용을 살펴봅니다.'],['관찰 수첩 · N / 수첩','확인한 사실, 발견한 무공 해석, 성장 방법을 읽습니다.'],['무공 해석 · 기존 기술의 변형','세 계열에 두 가지씩 있습니다. 발견만으로 직업이 바뀌지 않으며 수락·보류·원래 운용 복귀가 가능합니다.']]){const row=node('article','help-step');row.append(node('b','',title),node('p','',copy));body.append(row);}
   const next=node('section','guide-next');next.append(node('small','','지금 할 일'),node('h3','',u.title),node('p','',u.text));body.append(next);
   if(g.area==='archive'){const choose=node('div','guide-paths');for(const [path,label]of [['ripple','호위검'],['echo','필사본'],['seal','봉인 탁본']])choose.append(button(label,()=>{g.guidePath=path;openHelp();},g.guidePath===path?'primary':'secondary'));body.append(choose);}
   show('기감과 무공 해석 · 처음 해보기',body,[{label:'길잡이 켜고 직접 해보기',disabled:g.progress<2,run:()=>{g.guideActive=true;refresh();}},{label:'수첩 열기',secondary:true,run:()=>notes.open('facts')},{label:'혼자 살펴보기',secondary:true,run:()=>{g.guideActive=false;refresh();}}],'hero','조작은 알려드리고, 발견은 직접 합니다');
  }
  function notebookHint(body){const g=game(),u=P.guide(g),card=node('div','guide-next');card.append(node('small','','다음에 할 수 있는 행동'),node('b','',u.title),node('p','',u.text));card.append(button('실제 화면에서 안내 받기',()=>{g.guideActive=true;openHelp();}));body.prepend(card);}
  function update(){const g=game(),a=DualWorld.AREAS[g.area];if(g!==lastGame){lastGame=g;signature='';}
   const world=P.worldStyle(a);$('game').dataset.realm=world.architecture;worldBadge.textContent=world.world==='현실'?'현실 / HUNTER DISTRICT':'무림 / MARTIAL REALM';
   const mapLabel=$('mapWorld');if(mapLabel)mapLabel.textContent='['+a.world+'] '+a.name.split(' · ')[0];
   const stamp=JSON.stringify([g.chapter4?.feed,g.journey?.seed,g.journey?.phase,g.revision?.inherited]);if(stamp!==signature){signature=stamp;newsViews=newsViews.filter(v=>v.root.isConnected);newsViews.forEach(v=>v.render());$('rumorCount').textContent=String((g.chapter4?.feed?.length||0)+(g.revision?.inherited?.length||0));}
   help.classList.toggle('help-recommended',g.progress>=2&&!g.journey?.facts?.length);
   guideHint.hidden=!g.guideActive;const u=P.guide(g);if(g.guideActive){guideHint.querySelector('p').textContent=u.title;guideHint.querySelector('strong').textContent='선택 탐험 · '+(u.path?DualWorld.Fate.PATHS[u.path].name:'기감 안내');}
   if(a.world!==lastWorld){lastWorld=a.world;$('hudPortrait').setAttribute('aria-label',a.world+'의 윤서');}
  }
  return {update,openHelp,openNews,notebookHint,guide:()=>game().guideActive?P.guide(game()):null};
 }
 root.RealmUI={create};
})(globalThis);
