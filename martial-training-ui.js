/* In-game training menu. All mutations use the game's transactional save boundary. */
(function(root){'use strict';root.MartialTrainingUI={create({game,show,node,commit,refresh,close,legacy}){
 const T=root.MartialTraining,A=root.MartialAcquisition,axes=['form','qi','flow','intent'],axisNames=['형','기','운','의'],axisHelp=['몸의 움직임','힘의 성질','펼치는 방식','힘이 닿는 곳'];
 let tab='learn',family='sword',draft={},notice='',filter='all';
 const el=(tag,cls,text)=>node(tag,cls,text);
 function button(label,run,disabled=false,cls='secondary'){const b=el('button',cls,label);b.type='button';b.disabled=disabled;b.onclick=run;return b;}
 function change(fn,{leave=false,success=null}={}){notice='';let failure='';const ok=commit(g=>{try{return fn(g);}catch(e){failure=e.message;throw e;}});if(!ok){notice=failure||'저장하지 못했습니다. 기존 진행은 유지됩니다.';render();return;}if(leave){close();refresh();}else if(success)success();else render();}
 function open(subject='sword',section='learn'){const m=T.describe(game());family=m.basics.some(b=>b.id===subject)?subject:'sword';tab=section;draft={};filter='all';notice='';render();}
 function select(id){family=id;draft={};filter='all';notice='';render();}
 function completed(kind){
  const created=kind==='create',item=created?T.links[family]:T.catalog[family],body=el('section','growth-screen training-completion');body.dataset.world=T.describe(game()).world;body.dataset.completionKind=kind;
  const seal=el('div','training-completion-seal');seal.setAttribute('aria-hidden','true');
  for(const [i,glyph]of (created?['연','결']:axisNames).entries()){const part=el('span','training-completion-part',glyph);part.style.setProperty('--part',i);seal.append(part);}seal.append(el('b','training-completion-glyph',created?'創':'得'));
  body.append(seal,el('p','training-completion-kicker',created?'무공 창안 완료':'무공 습득 완료'),el('h2','',item.name),el('span','training-grade',created?'자창':item.grade),el('p','',item.description),el('p','training-caption',created?'창안한 무공을 운용할 수 있습니다. 현실 적용에는 무림 연계 증명이 필요합니다.':'구성한 무공을 바로 사용할 수 있습니다. 실습은 원할 때 선택하세요.'),el('p','training-completion-saved','저장 완료'));
  show(created?'무공 창안':'무공 습득',body,[{label:'무공 목록으로',run:()=>open(family,created?'create':'learn')},{label:'실습하기 (선택)',secondary:true,run:()=>change(g=>{if(T.basics.includes(family))g.enter('village');return T.startPractice(g,family,{linked:created,world:'murim'});},{leave:true})},{label:'닫기',secondary:true}],'system','무공 수련');
 }
 function elementPicker(m,b){
  const section=el('section','training-element-picker'),filters=el('nav','training-element-filters');filters.setAttribute('aria-label','요소 획득 필터');
  for(const [id,name]of [['all','전체'],['owned','획득'],['missing','미획득']]){const control=button(name,()=>{filter=id;render();document.querySelector('[data-element-filter="'+id+'"]')?.focus({preventScroll:true});});control.dataset.elementFilter=id;control.setAttribute('aria-pressed',String(filter===id));filters.append(control);}
  section.append(el('h4','','형 · 기 · 운 · 의'),el('p','training-caption','전체 요소를 살펴보고, 획득한 요소를 각 축에서 하나씩 선택하세요. 조합법의 미해독 부분은 그대로 숨겨집니다.'),filters);
  const slots=el('div','training-axes');for(const [i,a]of axes.entries()){
   const axis=el('section','training-axis');axis.dataset.trainingAxis=a;axis.setAttribute('aria-label',axisNames[i]+' 요소 선택');axis.append(el('b','',axisNames[i]),el('small','',axisHelp[i]),el('span','training-answer',b.known[i]?'조합법 힌트 · '+T.labels[b.recipe[i]]:'조합법 미해독'));
   axis.append(el('span','training-selection',draft[a]?'선택됨 · '+T.labels[draft[a]]:'선택 안 함'));
   const options=m.elements[a].filter(o=>filter==='all'||(filter==='owned'?o.owned:!o.owned));
   for(const o of options){const card=button('',()=>{draft[a]=o.id;render();document.querySelector('[data-element-card="'+o.id+'"]')?.focus({preventScroll:true});},!o.owned||!m.safe||!b.discovered,'secondary training-element-card');card.dataset.elementCard=o.id;card.dataset.owned=String(o.owned);card.setAttribute('aria-pressed',String(draft[a]===o.id));card.append(el('strong','',o.label),el('span','training-element-state',o.owned?'획득':'미획득'),el('small','',o.source));axis.append(card);}
   if(!options.length)axis.append(el('p','training-caption',filter==='owned'?'획득한 요소가 없습니다.':'모든 요소를 획득했습니다.'));slots.append(axis);
  }section.append(slots);return section;
 }
 function render(){
  const g=game(),m=T.describe(g),body=el('section','growth-screen training-screen'),tabs=el('nav','training-tabs'),context=el('div','training-context');
  body.dataset.world=m.world;tabs.setAttribute('aria-label','수련 분야');
  for(const [id,label]of [['learn','무공 습득'],['create','무공 창안']]){const b=button(label,()=>{tab=id;if(tab==='create'&&['sword','thunder'].includes(family))family='ripple';notice='';render();});b.setAttribute('aria-pressed',String(tab===id));tabs.append(b);}
  context.append(el('span','',m.world==='reality'?'현실 · 무림의 원리 적용':'무림 · 무공 수련'),el('span','',m.safe?'안전 거점 · 구성 가능':'현장 · 구성은 안전 거점에서'));
  body.append(tabs,context);if(!m.safe&&m.world==='murim')body.append(button('청운촌으로 돌아가 구성하기',()=>change(g=>g.enter('village')),false));
  const route=root.SSANGGYE_DEV&&root.DevTrainingRoute;
  if(route?.enabled()){
   const next=route.next(g,T,route.completed()),panel=el('div','training-teacher training-dev-route');
   panel.append(el('strong','','개발용 무공 순차 테스트'));
   if(next){
    const name=['create','reality'].includes(next.kind)?T.links[next.family].name:T.catalog[next.family].name;
    const target=name+({discover:' 형·기 발견',flow:' 운 체득',quest:' 의 획득',learn:' 습득',create:' 창안 증명',reality:' 현실 연계'}[next.kind]);
    panel.append(el('p','',(next.index+1)+' / '+next.total+' · '+target),el('small','','중간 스토리 생략 · 구성 즉시 습득 · 실습 선택 · 일반 저장과 분리'));
    panel.append(button(target+' 시험으로 이동',()=>{
     let result;const ok=commit(g=>{result=route.move(g,T,route.completed());return true;});
     if(!ok){notice='시작점 이동을 저장하지 못했습니다.';render();return;}
     if(result.leave){close();refresh();}else open(result.family,result.section);
    },false,'primary'));
   }else panel.append(el('p','',route.steps.length+' / '+route.steps.length+' 완료 · 다섯 무공 습득과 세 창안의 무림·현실 증명을 마쳤습니다.'));
   body.append(panel);
  }
  const layout=el('div','training-layout'),list=el('nav','training-list'),detail=el('article','training-detail');list.setAttribute('aria-label',tab==='learn'?'무공 목록':'창안 무공 목록');
  if(tab==='learn'){
   list.append(el('p','training-caption','기초 · 상승 · 절학 순으로 조합법의 비밀이 깊어집니다. 절학은 추후 발견할 수 있습니다.'));
   for(const b of m.basics){const entry=button('',()=>select(b.id),false,'secondary training-entry');entry.dataset.trainingFamily=b.id;entry.setAttribute('aria-pressed',String(family===b.id));entry.append(el('strong','',b.name),el('small','',b.learned?'습득 · '+b.rank+'성':b.drafted?'기존 구성 · 확인하여 습득':b.discovered?b.grade+' · '+b.known.filter(Boolean).length+'/4 해독':'미발견 · 획득 경로'));list.append(entry);}
   const b=m.basics.find(x=>x.id===family)||m.basics[0];family=b.id;
   const meta=el('div','training-meta');meta.append(el('span','training-grade',b.grade),el('span','',b.learned?'습득 완료 · '+b.rank+'성 / 5성':'조합법 '+b.known.filter(Boolean).length+'/4 해독'));detail.append(meta,el('h3','',b.name),el('p','training-description',b.description));
   if(b.discovered){
    detail.append(el('p','training-ownership','보유 요소 '+b.owned.filter(Boolean).length+'/4 · '+(b.craftable?'필요한 요소를 모두 배웠습니다':'부족한 요소의 획득 경로를 확인하세요')));
    const acquisition=A.describe(g).families.find(x=>x.id===family);
    if(acquisition){
     const cards=el('div','training-acquisition');
     const relic=el('section','training-source');relic.append(el('strong','','형·기 · 비경 조사'),el('p','','무명 비경의 해당 흔적을 조사해 획득합니다.'),el('small','',b.owned[0]&&b.owned[1]?'획득 완료':'미획득'));cards.append(relic);
     const flow=el('section','training-source');flow.append(el('strong','','운 · 전투 숙련'),el('p','',acquisition.flow.requirement),el('small','',acquisition.flow.owned?'획득 완료':acquisition.flow.count+' / '+acquisition.flow.total));if(!acquisition.flow.owned)flow.append(button('운 체득 실습',()=>change(g=>A.startFlow(g,family),{leave:true}),!m.safe));cards.append(flow);
     const quest=el('section','training-source'),q=acquisition.quest;quest.append(el('strong','','의 · '+q.title),el('p','',q.description),el('small','','목표 달성 후 청운촌에서 보고하면 의를 얻습니다.'));
     if(q.stage==='ready')quest.append(button('퀘스트 보고 · 의 획득',()=>change(g=>A.reportQuest(g,family)),g.area!=='village','primary'));
     else if(q.stage==='complete')quest.append(el('small','','보고 완료 · 의 획득'));
     else quest.append(button(q.stage==='active'?'의 획득 퀘스트 다시 시작':'의 획득 퀘스트 시작',()=>change(g=>A.startQuest(g,family),{leave:true}),!m.safe||q.stage==='locked'));
     cards.append(quest);detail.append(cards);
    }
    if(!b.known.every(Boolean)){const hints=el('div','training-clue');hints.append(el('p','','조합법은 정답의 힌트입니다. 지도 받아도 요소는 지급되지 않습니다. 배운 요소로 직접 추론할 수도 있습니다.'),button('단서 해독 · 지도 받기',()=>change(g=>T.learn(g,family)),!m.safe));detail.append(hints);}

   }
   if(['sword','thunder'].includes(family)&&!b.learned){const teacher=el('div','training-teacher');teacher.append(el('strong','','백련'),el('p','',family==='thunder'?'뇌기를 내려치기에 담아 주변으로 펼쳐라. 네 요소를 하나로 구성하면 천뢰격을 펼칠 수 있느니라.':'형으로 검을 세우고, 기로 힘을 채운다. 운으로 펼치고, 의로 닿을 곳을 정하거라.'));detail.append(teacher,el('p','training-flow','① 네 요소 선택 → ② 구성 완료 · '+b.name+' 습득 → ③ 실습은 선택'));}
   detail.append(elementPicker(m,b));
   if(!b.discovered){detail.append(el('div','training-clue',b.source||b.reason||'무명 비경의 흔적을 조사해 조합법과 요소를 찾으세요.'));}
   else{
    const clue=el('div','training-clue');clue.append(el('strong','','배움의 단서'),el('p','',b.clue||'백련에게 배운 네 요소의 원리를 떠올리세요.'),el('small','',b.source||''));detail.append(clue);
    const row=el('div','training-actions'),compose=button('구성 확인',()=>{const fresh=!b.learned;change(g=>T.compose(g,family,axes.map(a=>draft[a])),{success:fresh?()=>completed('learn'):null});},!m.safe||!axes.every(a=>draft[a]),'primary');compose.dataset.trainingCompose='';row.append(compose);
    if(b.drafted||b.learned)row.append(button(['sword','thunder'].includes(family)?'목인 수련 시작':'기본 무공 실습',()=>change(g=>T.startPractice(g,family),{leave:true}),!m.safe,'primary'));
    if(b.learned&&!['sword','thunder'].includes(family))row.append(button('기본 무공 장착',()=>change(g=>T.equip(g,family)),!m.safe));detail.append(row);
    detail.append(el('p','training-caption',b.learned?'습득한 무공과 원본 조합법은 유지됩니다.':b.drafted?'기존 구성의 네 요소를 확인하면 즉시 습득합니다.':'구성 완료 즉시 습득 · 실습 선택 · 실패 시 요소 소멸 없음'));
   }
   if(b.reason)detail.append(el('p','training-reason',b.reason));
  }else{
   list.append(el('p','training-caption','체득한 무공의 새로운 연결'));
   for(const b of m.links){const entry=button('',()=>select(b.id),false,'secondary training-entry');entry.dataset.trainingLink=b.id;entry.setAttribute('aria-pressed',String(family===b.id));entry.append(el('strong','',b.name),el('small','',b.proven?'창안 증명 완료':b.created?'창안 완료 · 현실 적용 전 증명':b.ready?'구성 가능':'재료 무공 습득 필요'));list.append(entry);}
   const l=m.links.find(x=>x.id===family)||m.links[0];family=l.id;const basic=m.basics.find(x=>x.id===family),sword=m.basics.find(x=>x.id==='sword');
   const meta=el('div','training-meta');meta.append(el('span','training-grade','자창'),el('span','',l.proven?'실전 증명 완료':'창안 · 현실 적용 전 증명'));detail.append(meta,el('h3','',l.name),el('p','training-description',l.description));
   const flow=el('div','training-sources');for(const b of [basic,sword]){const box=el('div','training-source');box.append(el('small','',b===basic?'선행 무공':'후속 무공'),el('strong','',b.name),el('span','',b.learned?'습득 · '+b.rank+'성':'미습득'),el('small','',b===basic?({ripple:'받아내기 → 충격 축적',echo:'이탈 보법 → 출발점 잔향',seal:'억제 진식 → 남은 억제'}[family]):'검격 → 준비한 원리 방출'));flow.append(box);}detail.append(flow);
   const principle=el('div','training-principle');principle.append(el('small','','연결 원리'),el('strong','',l.principle));detail.append(principle);
   const cost=el('div','training-clue');cost.append(el('strong','','대가와 제한'),el('p','',({ripple:'즉시 반격을 포기하고 충격을 한 번만 관통에 사용합니다.',echo:'현재 위치를 베지 않고 떠난 자리에 지연 검격을 남깁니다.',seal:'첫 대상의 억제를 끝내고 다음 대상에 남은 시간을 옮깁니다.'}[family])),el('small','','두 습득 무공 · 연결 원리 하나 · 창안끼리 중첩 불가'));detail.append(cost);
   const rangeLabel=el('label','training-range','현재 숙련의 조정 범위 '+l.min+' ~ '+l.max),range=el('input');range.type='range';range.min=l.min;range.max=l.max;range.step=family==='echo'?.01:1;range.value=l.value;range.disabled=!m.safe||!l.ready||l.min===l.max;range.dataset.trainingValue='';const value=el('output','',String(l.value)+(family==='echo'?'초':''));range.oninput=()=>value.textContent=range.value+(family==='echo'?'초':'');rangeLabel.append(range,value);detail.append(rangeLabel,el('p','training-caption','후속 검격에 추가 내력 '+l.cost+' · Q 대응 후 K 검격'));
   const actions=el('div','training-actions');actions.append(button(l.created?'창안 조정 저장':'무공 창안하기',()=>change(g=>T.create(g,family,Number(range.value)),{success:!l.created?()=>completed('create'):null}),!m.safe||!l.ready,'primary'));
   if(l.created){actions.append(button('무림 연계 실습',()=>change(g=>T.startPractice(g,family,{linked:true,world:'murim'}),{leave:true}),!m.safe));actions.append(button(l.equipped?'창안 운용 중':'창안 무공 장착',()=>change(g=>T.create(g,family,l.value)),!m.safe||l.equipped));}
   if(l.proven){actions.append(button(l.reality?'현실 적용 중':'현실에 적용',()=>change(g=>T.apply(g,family)),!m.safe||m.world!=='reality'||l.reality));if(l.reality)actions.append(button('현실 연계 실습',()=>change(g=>T.startPractice(g,family,{linked:true,world:'reality'}),{leave:true}),!m.safe||m.world!=='reality'));}
   detail.append(actions,el('p','training-reason',l.reason|| (l.proven?'현실 기지에서 적용한 뒤 같은 원리를 시험할 수 있습니다.':'Q로 실제 대응한 뒤 후속 검격의 효과를 증명하세요.')));
  }
  if(notice){const status=el('p','training-error',notice);status.setAttribute('role','alert');detail.append(status);}
  layout.append(list,detail);body.append(layout);
  const footer=el('div','training-footer');footer.append(el('span','','수련 지원 · '+(m.assisted?'일반 전투 피해량 ×4 · 받는 피해 감소 · 빠른 회복':'기본 난이도')),button(m.assisted?'수련 지원 끄기':'수련 지원 켜기',()=>change(g=>T.setAssisted(g,!m.assisted)),!m.safe),button('기존 무공 운용',legacy));body.append(footer);
  show('무공 수련',body,[{label:'전장으로 돌아가기',secondary:true}],'system','무공 습득 · 무공 창안');
 }
 return {open};
}};})(globalThis);
