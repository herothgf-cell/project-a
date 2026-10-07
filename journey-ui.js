/* Paused notebook: observed facts, voluntary interpretations, growth and labeled fiction. */
(function(root){
 'use strict';
 function create(env){const {game,show,node,grid,refresh,act,running,active}=env,D=JourneyData;
  const tools=node('div','journey-tools');tools.id='journeyTools';
  const sense=node('button','','感 · 기감');sense.id='sense';sense.type='button';sense.title='B · 가까운 기운을 관찰합니다';sense.setAttribute('aria-label','기감 B');sense.append(node('kbd','','B'));
  const notes=node('button','','관찰 수첩');notes.id='fieldNotes';notes.type='button';notes.setAttribute('aria-label','관찰 수첩 N');notes.append(node('kbd','','N'));notes.hidden=true;tools.append(sense,notes);document.getElementById('playArea').append(tools);
  sense.addEventListener('click',()=>{if(running())act('sense');});notes.addEventListener('click',()=>open());
  const para=(p,t,c='')=>p.append(node('p',c,t));
  function action(p,label,fn,disabled=false){const b=node('button','notebook-action',label);b.type='button';b.disabled=disabled;b.addEventListener('click',()=>{fn();refresh();});p.append(b);return b;}
  function open(tab='facts'){
   if(tab==='growth'&&game().worldGrowth&&env.growth)return env.growth();
   if(!active()||game().introActive)return;const g=game(),s=g.journey,body=node('section','notebook'),tabs=node('nav','notebook-tabs');tabs.setAttribute('aria-label','수첩 분류');
   for(const [id,label]of [['facts','관찰'],['styles','무공 해석'],['growth','성장 · 준비']]){const b=action(tabs,label,()=>open(id));b.classList.toggle('selected',id===tab);b.setAttribute('aria-current',id===tab?'page':'false');}body.append(tabs);
   if(tab==='facts'){
    const u=Presentation.guide(g),next=node('section','guide-next');next.append(node('small','','현재 할 수 있는 행동'),node('b','',u.title),node('p','',u.text));action(next,'기감 사용법과 안내 보기',()=>document.getElementById('helpButton').click());body.append(next);
    para(body,'이 수첩에는 직접 확인한 사실만 적힙니다. 아직 모르는 조건의 진행률은 표시하지 않습니다.','notebook-muted');
    if(!s.facts.length)para(body,g.progress<2?'이야기를 진행하며 발견한 단서가 여기에 기록됩니다. 환서정의 첫 스킬 진화가 열리면 기감으로 단서를 조사할 수 있습니다.':'4장 귀환 보고 후 연화의 기록을 백련에게 전하면 환서정에서 스킬 진화가 열립니다. 기감(B)을 펼치면 가까운 물건의 다른 면이 보입니다.');
    for(const f of s.facts){const row=node('article','observed-fact');row.append(node('small','',DualWorld.AREAS[f.area].name),node('p','',D.facts[f.id]));body.append(row);}
    if(s.items.length)para(body,'보관 중인 물건 · '+s.items.map(k=>D.relics[k]).join(' / '));
    para(body,'기감 B → 보이는 물건 가까이 E. 울림이 모일 때 공격·회피·주변 장치가 서로 다른 반응을 만듭니다. 현재 목표가 안내하는 계승 무공의 단서부터 조사하세요.','notebook-muted');
   }else if(tab==='styles'){
    para(body,'무공 해석은 새 직업이 아니라 기존 Q/R의 사용법 변경입니다. 현재 계열에서 직접 발견한 운용을 선택합니다. 기본 무공은 유지되고 자동 장착되지 않습니다.');
    if(!s.known.length)para(body,'아직 이름 붙인 해석이 없습니다. 환서정에서 글이 아니라 물건과 바람의 반응을 먼저 살펴보세요.');
    for(const key of s.known){const v=D.variants[key],card=node('article','interpret-card');card.style.setProperty('--interpret-color',v.color);card.append(node('h3','',v.glyph+' '+v.name),node('p','',v.description),node('small','',D.syncNames[s.sync[key]]));
     const can=g.fate.path===v.path&&!g.trial&&(DualWorld.AREAS[g.area].safe||g.area==='archive');
     if(env.skills)action(card,v.name+' · 무공/스킬에서 장착',()=>env.skills(key));else action(card,s.selected[v.path]===key?v.name+' · 장착 중':v.name+' · 이 해석 장착',()=>{g.chooseInterpretation(key);open('styles');},!can||s.selected[v.path]===key);
     if(g.fate.path!==v.path)para(card,'먼저 해당 계열이 몸에 새겨져야 운용할 수 있습니다. 발견 기록은 사라지지 않습니다.','notebook-muted');body.append(card);
    }
    if(env.skills)action(body,'무공/스킬에서 운용 관리',()=>env.skills(g.fate.path));else action(body,'기본 운용으로 돌아가기',()=>{g.clearInterpretation();open('styles');},!DualWorld.AREAS[g.area].safe);
    para(body,'환서정과 안전한 거점에서는 무공/스킬에서 무료로 해석을 바꿀 수 있습니다.','notebook-muted');
   }else if(tab==='growth'){
    body.append(grid([['독립 경지',s.realm?'이류 · 첫 돌파':'입문 · 체득 중'],['헌터 평가',s.rank],['심법',s.breath==='flow'?'유수심법':'집중심법'],['금화',g.gold]]));
    const inherited=Revision.state(g).inherited,labels={sword:'공통 무공',ripple:inherited.includes('ripple')?'파문검':'미계승 기연 ①',echo:inherited.includes('echo')?'잔영보':'미계승 기연 ②',seal:inherited.includes('seal')?'경계봉인':'미계승 기연 ③'};
    for(const [p,value]of Object.entries(s.mastery)){const row=node('div','mastery-row');row.append(node('span','',labels[p]),node('b','',value+' / 30'));const track=node('progress');track.max=30;track.value=value;track.setAttribute('aria-label',labels[p]+' 숙련');row.append(track);body.append(row);}
    para(body,'숙련 5 / 10 / 20 / 30마다 해당 계열 피해 +3%, 최대 +12%. 성장 화면의 무공 트리에서 현재 효과를 확인할 수 있습니다.');
    const safe=DualWorld.AREAS[g.area].safe;
    para(body,'유수: 무공 사이 1.2초 호흡을 고르면 내력이 추가 회복됩니다.\n집중: 1.4초 호흡 뒤 첫 검격은 내력 6을 써서 더 강해집니다.');
    action(body,'유수심법',()=>{g.setBreath('flow');open('growth');},!safe||s.breath==='flow');action(body,'집중심법',()=>{g.setBreath('focus');open('growth');},!safe||s.breath==='focus');
    const ready=!s.realm&&Object.values(s.mastery).reduce((a,b)=>a+b,0)>=8&&s.worlds.length===2&&s.known.length>0;
    para(body,s.realm?'첫 돌파의 변화 · 체력 +12 / 내력 +8 / 공격력 +2':'첫 경지는 유효 숙련 합계 8, 두 세계의 실전, 직접 확인한 해석이 모였을 때 거점에서 돌파할 수 있습니다.');
    action(body,s.realm?'첫 경지 돌파 완료':'운기조식 · 경지 돌파',()=>{g.breakthrough();refresh();},!safe||!ready);
    if(!safe)para(body,'심법 변경·돌파는 안전한 거점에서 할 수 있습니다.','notebook-muted');
   }
   show('관찰 수첩 · 기록에 없는 호흡',body,[{label:'돌아가기',secondary:true}],'hero','직접 확인한 사실 / 기술 변형 / 성장');
   if(tab==='styles'&&g.worldGrowth){const visible=new Set(s.known.map(key=>'interpret:'+key)),unread=g.unreadNews('skills').filter(item=>visible.has(item.id));for(const item of unread)g.readNews(item.id);if(unread.length)refresh();}
  }
  function offer(e){const g=game(),v=D.variants[e.key],body=node('div','interpret-offer');body.style.setProperty('--interpret-color',v.color);body.append(node('div','interpret-seal',v.glyph),node('p','',e.text));
   const allowed=g.fate.path===v.path;
   para(body,allowed?'몸이 먼저 반응했고, 이름은 그 다음에 남았다. 이 운용을 받아들이거나 기록만 남겨도 좋다.':'그 현상은 기록했습니다. 해당 계열이 몸에 새겨지면 이 해석을 운용할 수 있습니다. 다른 계열로 강제 전환하지 않습니다.');
   show(e.title,body,[{label:env.skills?v.name+' · 무공/스킬에서 장착':v.name+' · 이 해석 장착',disabled:!allowed,run:()=>{if(env.skills)env.skills(e.key);else{g.chooseInterpretation(e.key);refresh();}}},{label:'지금은 발견만 기록한다',secondary:true}],'hero','현상 → 스스로 붙인 해석');
  }
  function update(){const g=game();const unlocked=g.senseUnlocked?g.senseUnlocked():g.progress>=2;sense.hidden=!unlocked;sense.disabled=!unlocked;sense.classList.toggle('sensing',g.experimentRuntime?.sense>0);sense.title=!unlocked?'환서정의 첫 스킬 진화와 함께 기감이 열립니다.':(globalThis.Controls?.key('sense')||'B')+' · 기감 / 재사용 '+Math.ceil(g.player.cool.sense||0)+'초';}
  return {open,offer,update};
 }
 root.JourneyUI={create};
})(globalThis);
