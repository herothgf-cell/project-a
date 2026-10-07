/* The player-facing, transactional surface for one-way growth. */
(function(root){'use strict';root.ResonanceUI={create({game,show,node,commit,close,refresh,prepare,back,skills}){
 const R=BoundaryResonance,C=ResonanceChallenges;let section='goals',draft=null,ticket=0;
 const button=(label,run,disabled=false)=>{const b=node('button','secondary',label);b.type='button';b.disabled=disabled;b.dataset.resonanceFocus=label;b.onclick=()=>{const restore=document.activeElement===b;run();if(restore){const target=[...document.querySelectorAll('.resonance-screen button[data-resonance-focus]')].find(x=>x.dataset.resonanceFocus===label&&!x.disabled);target?.focus({preventScroll:true});}};return b;};
 function icon(kind){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 64 64');s.setAttribute('class','resonance-icon '+kind);s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',kind==='crystal'?'M32 3 52 23 44 48 32 61 20 48 12 23Z M32 3V61 M12 23H52 M12 23 32 44 52 23':'M15 7H49V57H15Z M23 17H41 M23 27H41 M24 44 32 34 40 44 M32 34V51');s.append(p);return s;}
 function open(id='goals'){section='goals';draft=null;ticket++;render();}
 function change(fn){commit(fn);draft=null;render();}
 function render(){const g=game(),m=R.describe(g),s=R.state(g),body=node('section','resonance-screen'),head=node('header','resonance-heading'),nav=node('nav','resonance-tabs'),content=node('div','resonance-content');body.dataset.world=section==='goals'?'murim':'reality';
 head.append(node('span','resonance-kicker','무림의 성취 → 현실의 성장'),node('h2','','공명 도전'),node('p','','남겨 온 무공의 흔적을, 다음 싸움의 힘으로.'));body.append(head);
 nav.setAttribute('aria-label','경계공명 분야');for(const [id,label]of [['goals','선택 도전']]){const b=button(label,()=>open(id));b.setAttribute('aria-pressed',String(section===id));nav.append(b);}nav.append(button('임무로',()=>{ticket++;back();}));body.append(nav);

 if(section==='goals'){
  content.append(node('h3','','다음 귀환에서 무엇이 달라질까?'),node('p','','목표를 고르면 해당 무림 도전을 먼저 보여줍니다. 목표는 보상 종류나 다른 도전을 제한하지 않습니다.'));
  const cards=node('div','resonance-goals');for(const [id,label]of Object.entries(R.goals)){const c=node('article','resonance-card');c.dataset.selected=String(s.goal===id);c.append(node('h3','',label),node('p','',{survival:'결정으로 체력을 높여 더 오래 버팁니다.',sustain:'기력과 절약 운용으로 기술을 이어갑니다.',precision:'계열 Q 운용을 바꿔 대응을 안정시킵니다.'}[id]),button(s.goal===id?'선택 중 · 목표 해제':label+' 목표 선택',()=>change(g=>R.setGoal(g,s.goal===id?null:id))));cards.append(c);}content.append(cards,node('h3','','무림 공명 도전'),node('p','','각 도전의 첫 완료: 결정 1 · 각인 1. 처치 보상은 없으며 소모품은 귀환 시 복원됩니다.'));
  const rows=C.list(g).sort((a,b)=>Number(b.current)-Number(a.current));for(const row of rows){const c=node('article','resonance-challenge');c.append(node('h4','',row.name+(row.current?' · 현재 목표':'')),node('p','',row.threat),node('small','',row.completed?'최초 보상 수령 완료':row.reason||'첫 완료 보상 가능'));const b=button('입장 · '+row.name,async()=>{const my=++ticket;b.disabled=true;const result=await C.request(game(),row.id,async id=>{const ok=await prepare(id);return ok!==false&&my===ticket&&body.isConnected&&document.querySelector('#dialog')?.open;});if(result.ok){close();refresh();}else if(body.isConnected){b.disabled=!row.canEnter;c.append(node('p','',result.reason));}},!row.canEnter);c.append(b);content.append(c);}
 }
 if(g.area==='city')content.append(node('h3','','현실 비교 연습'),node('p','','같은 적을 상대로 장착한 무공과 성장 효과를 직접 시험합니다. 연습에는 처치 보상이 없습니다.'),button('현실 비교 전투',()=>{ticket++;close();g.beginComparison();refresh();},!g.worldGrowth.reality.equipped));

 body.append(content);show('임무 · 공명 도전',body,[{label:'닫기',secondary:true}],'system','v0.2 · 무림 → 현실');
 }
 return {open};
}};})(globalThis);
