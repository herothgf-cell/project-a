/* In-game training menu. All mutations use the game's transactional save boundary. */
(function(root){'use strict';root.MartialTrainingUI={create({game,show,node,commit,refresh,close,legacy}){
 const T=root.MartialTraining,axes=['form','qi','flow','intent'],axisNames=['형','기','운','의'],axisHelp=['몸의 움직임','힘의 성질','펼치는 방식','힘이 닿는 곳'];
 let tab='learn',family='sword',draft={},notice='',step=0;
 const el=(tag,cls,text)=>node(tag,cls,text);
 function button(label,run,disabled=false,cls='secondary'){const b=el('button',cls,label);b.type='button';b.disabled=disabled;b.onclick=run;return b;}
 function change(fn,{leave=false}={}){notice='';let failure='';const ok=commit(g=>{try{return fn(g);}catch(e){failure=e.message;throw e;}});if(!ok){notice=failure||'저장하지 못했습니다. 기존 진행은 유지됩니다.';render();return;}if(leave){close();refresh();}else render();}
 function open(subject='sword',section='learn'){const m=T.describe(game());family=m.basics.some(b=>b.id===subject)?subject:'sword';tab=section;draft={};step=0;notice='';render();}
 function select(id){family=id;draft={};step=0;notice='';render();}
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
    const name=next.kind==='learn'?T.catalog[next.family].name:T.links[next.family].name;
    const target=name+(next.kind==='learn'?' 습득':next.kind==='create'?' 창안 증명':' 현실 연계');
    panel.append(el('p','',(next.index+1)+' / '+next.total+' · '+target),el('small','','중간 스토리 생략 · 실제 구성·적중·대응으로 완료 · 일반 저장과 분리'));
    panel.append(button(target+' 시험으로 이동',()=>{
     let result;const ok=commit(g=>{result=route.move(g,T,route.completed());return true;});
     if(!ok){notice='시작점 이동을 저장하지 못했습니다.';render();return;}
     if(result.leave){close();refresh();}else open(result.family,result.section);
    },false,'primary'));
   }else panel.append(el('p','','11 / 11 완료 · 다섯 무공 습득과 세 창안의 무림·현실 증명을 마쳤습니다.'));
   body.append(panel);
  }
  const learning=tab==='learn'&&m.basics.find(b=>b.id===family);
  if(learning?.discovered&&!learning.learned&&!learning.drafted){
   const decoded=learning.known.every(Boolean),guide=el('div','training-teacher training-guidance');
   guide.append(el('strong','',decoded?'다음 · 네 요소를 선택해 구성하세요':'형·기 해독 완료 · 운·의는 청운촌에서 해독'));
   guide.append(el('p','',decoded?'공개된 조합법을 보고 형·기·운·의를 선택한 뒤 구성 확인을 누르세요. 구성 후 실습에 성공하면 무공을 습득합니다.':m.safe?'아래 지도 받기 버튼으로 남은 두 조합법을 공개하세요. 추가 재료나 비용은 없습니다.':'비경의 흔적에서는 형과 기만 알 수 있습니다. 청운촌으로 돌아가 구성하기를 누른 뒤, 단서 해독 · 지도 받기로 운과 의를 공개하세요.'));
   if(!decoded&&m.safe)guide.append(button('단서 해독 · 지도 받기',()=>change(g=>T.learn(g,family)),false,'primary'));
   body.append(guide);
  }
  const layout=el('div','training-layout'),list=el('nav','training-list'),detail=el('article','training-detail');list.setAttribute('aria-label',tab==='learn'?'무공 목록':'창안 무공 목록');
  if(tab==='learn'){
   list.append(el('p','training-caption','기초 · 상승 · 절학 순으로 조합법의 비밀이 깊어집니다. 절학은 추후 발견할 수 있습니다.'));
   for(const b of m.basics){const entry=button('',()=>select(b.id),false,'secondary training-entry');entry.dataset.trainingFamily=b.id;entry.setAttribute('aria-pressed',String(family===b.id));entry.append(el('strong','',b.name),el('small','',b.learned?'습득 · '+b.rank+'성':b.drafted?'구성 완료 · 실습 대기':b.discovered?b.grade+' · '+b.known.filter(Boolean).length+'/4 해독':'미발견 · 획득 경로'));list.append(entry);}
   const b=m.basics.find(x=>x.id===family)||m.basics[0];family=b.id;
   const meta=el('div','training-meta');meta.append(el('span','training-grade',b.grade),el('span','',b.learned?'습득 완료 · '+b.rank+'성 / 5성':'조합법 '+b.known.filter(Boolean).length+'/4 해독'));detail.append(meta,el('h3','',b.name),el('p','training-description',b.description));
   if(['sword','thunder'].includes(family)&&!b.learned){const teacher=el('div','training-teacher');teacher.append(el('strong','','백련'),el('p','',family==='thunder'?'뇌기를 내려치기에 담아 주변으로 펼쳐라. 구성한 천뢰격을 목인에 직접 적중시키거라.':'형으로 검을 세우고, 기로 힘을 채운다. 운으로 펼치고, 의로 닿을 곳을 정하거라.'));detail.append(teacher,el('p','training-flow','① 네 요소 구성 → ② '+(family==='thunder'?'L 천뢰격':'K 월영참')+' 적중 → ③ '+b.name+' 습득'));}
   if(!b.discovered){detail.append(el('div','training-clue',b.source||b.reason||'무명 비경의 흔적을 조사해 조합법과 요소를 찾으세요.'));}
   else{
    const slots=el('div','training-axes');for(const [i,a]of axes.entries()){
     const label=el('label','training-axis');label.append(el('b','',axisNames[i]),el('small','',axisHelp[i]));
     const options=b.options[a]||[],known=b.known[i],recipe=b.recipe[i];
     if(known&&recipe){label.append(el('span','training-answer',options.find(o=>o.id===recipe)?.label||T.labels?.[recipe]||recipe));}
     else label.append(el('span','training-answer','미해독'));
     const select=el('select');select.dataset.trainingAxis=a;select.setAttribute('aria-label',axisNames[i]+' 요소 선택');select.append(new Option('요소 선택',''));for(const o of options)select.append(new Option(o.label,o.id));select.value=draft[a]||'';select.disabled=!m.safe||!b.known.every(Boolean)||(!b.learned&&['sword','thunder'].includes(family)&&i>step);
     select.onchange=()=>{draft[a]=select.value;if(select.value)step=Math.max(step,i+1);for(const [j,k]of axes.entries()){const next=body.querySelector('[data-training-axis="'+k+'"]');if(next)next.disabled=!m.safe||!b.known.every(Boolean)||(!b.learned&&['sword','thunder'].includes(family)&&j>step);}const compose=body.querySelector('[data-training-compose]');compose.disabled=!m.safe||!b.known.every(Boolean)||!axes.every(k=>draft[k]);};
     label.append(select,el('small','',known?'조합법 해독됨':'청운촌에서 지도 후 공개'));slots.append(label);
    }detail.append(slots);
    const clue=el('div','training-clue');clue.append(el('strong','','배움의 단서'),el('p','',b.clue||'백련에게 배운 네 요소의 원리를 떠올리세요.'),el('small','',b.source||''));detail.append(clue);
    const row=el('div','training-actions'),compose=button('구성 확인',()=>change(g=>T.compose(g,family,axes.map(a=>draft[a]))),!m.safe||!b.known.every(Boolean)||!axes.every(a=>draft[a]),'primary');compose.dataset.trainingCompose='';row.append(compose);
    if(b.drafted||b.learned)row.append(button(['sword','thunder'].includes(family)?'목인 수련 시작':'기본 무공 실습',()=>change(g=>T.startPractice(g,family),{leave:true}),!m.safe,'primary'));
    if(b.learned&&!['sword','thunder'].includes(family))row.append(button('기본 무공 장착',()=>change(g=>T.equip(g,family)),!m.safe));detail.append(row);
    detail.append(el('p','training-caption',b.learned?'습득한 무공과 원본 조합법은 유지됩니다.':b.drafted?'구성 완료 · 실제 기능을 펼치면 무공을 습득합니다.':'각 축 하나 · 보유 요소만 사용 · 실패 시 재료 소멸 없음'));
   }
   if(b.reason)detail.append(el('p','training-reason',b.reason));
  }else{
   list.append(el('p','training-caption','체득한 무공의 새로운 연결'));
   for(const b of m.links){const entry=button('',()=>select(b.id),false,'secondary training-entry');entry.dataset.trainingLink=b.id;entry.setAttribute('aria-pressed',String(family===b.id));entry.append(el('strong','',b.name),el('small','',b.proven?'창안 증명 완료':b.created?'초안 · 실전 증명 대기':b.ready?'구성 가능':'재료 무공 습득 필요'));list.append(entry);}
   const l=m.links.find(x=>x.id===family)||m.links[0];family=l.id;const basic=m.basics.find(x=>x.id===family),sword=m.basics.find(x=>x.id==='sword');
   const meta=el('div','training-meta');meta.append(el('span','training-grade','자창'),el('span','',l.proven?'실전 증명 완료':'초안 · 아직 미증명'));detail.append(meta,el('h3','',l.name),el('p','training-description',l.description));
   const flow=el('div','training-sources');for(const b of [basic,sword]){const box=el('div','training-source');box.append(el('small','',b===basic?'선행 무공':'후속 무공'),el('strong','',b.name),el('span','',b.learned?'습득 · '+b.rank+'성':'미습득'),el('small','',b===basic?({ripple:'받아내기 → 충격 축적',echo:'이탈 보법 → 출발점 잔향',seal:'억제 진식 → 남은 억제'}[family]):'검격 → 준비한 원리 방출'));flow.append(box);}detail.append(flow);
   const principle=el('div','training-principle');principle.append(el('small','','연결 원리'),el('strong','',l.principle));detail.append(principle);
   const cost=el('div','training-clue');cost.append(el('strong','','대가와 제한'),el('p','',({ripple:'즉시 반격을 포기하고 충격을 한 번만 관통에 사용합니다.',echo:'현재 위치를 베지 않고 떠난 자리에 지연 검격을 남깁니다.',seal:'첫 대상의 억제를 끝내고 다음 대상에 남은 시간을 옮깁니다.'}[family])),el('small','','두 습득 무공 · 연결 원리 하나 · 창안끼리 중첩 불가'));detail.append(cost);
   const rangeLabel=el('label','training-range','현재 숙련의 조정 범위 '+l.min+' ~ '+l.max),range=el('input');range.type='range';range.min=l.min;range.max=l.max;range.step=family==='echo'?.01:1;range.value=l.value;range.disabled=!m.safe||!l.ready||l.min===l.max;range.dataset.trainingValue='';const value=el('output','',String(l.value)+(family==='echo'?'초':''));range.oninput=()=>value.textContent=range.value+(family==='echo'?'초':'');rangeLabel.append(range,value);detail.append(rangeLabel,el('p','training-caption','후속 검격에 추가 내력 '+l.cost+' · Q 대응 후 K 검격'));
   const actions=el('div','training-actions');actions.append(button('창안 초안 저장',()=>change(g=>T.create(g,family,Number(range.value))),!m.safe||!l.ready,'primary'));
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
