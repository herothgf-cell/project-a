/* Additional transmission forms share the game's training dialog and save transaction. */
(function(root){'use strict';
 root.MartialPrototypesUI={create({node,button,change,render,completed}){
  const P=root.MartialPrototypes,axes=['form','qi','flow','intent'],names=['형','기','운','의'];
  let selected=null,draft={},filter='all';
  const el=(tag,cls,text)=>node(tag,cls,text);
  function reset(id){selected=id;draft={};filter='all';}
  function detail(g,tab,id,box){
   if(selected!==id)reset(id);
   const m=P.describe(g),created=tab==='create',item=(created?m.links:m.basics).find(x=>x.id===id);
   if(!item)return;
   const meta=el('div','training-meta');meta.append(el('span','training-grade',created?'자창':item.grade),el('span','',created?(item.proven?'실전 증명 완료':item.created?'창안 완료':'원리 차용'):(item.learned?'습득 완료':'전승 원형')));
   box.append(meta,el('h3','',item.name),el('p','training-description',item.description),el('p','training-flow',item.instruction));
   if(!created){
    const source=el('div','training-teacher');source.append(el('strong','','배움의 경로'),el('p','',item.source));
    if(!item.discovered&&id!=='sidestep')source.append(button('백련에게 원형 배우기',()=>change(g=>P.acquire(g,id)),!item.acquirable,'primary'));
    if(id==='sidestep'&&!item.discovered)source.append(el('p','','잔영 흔적을 발견한 뒤 비경의 측행보 표식에 다가가 상호작용하세요.'));
    box.append(source,el('p','training-ownership','보유 요소 '+item.owned.filter(Boolean).length+'/4 · '+(item.proven?'원리 성취 완료':'원리 성취는 창안에 사용합니다. 습득 후 실습은 선택입니다.')));
    const picker=el('section','training-element-picker'),filters=el('nav','training-element-filters');filters.setAttribute('aria-label','요소 획득 필터');
    for(const [value,label]of [['all','전체'],['owned','획득'],['missing','미획득']]){const b=button(label,()=>{filter=value;render();});b.setAttribute('aria-pressed',String(filter===value));filters.append(b);}
    picker.append(el('h4','','형 · 기 · 운 · 의'),filters);const slots=el('div','training-axes');
    axes.forEach((axis,i)=>{
     const column=el('section','training-axis');column.dataset.trainingAxis=axis;column.append(el('b','',names[i]),el('span','training-answer',item.known[i]?'조합법 · '+(P.labels[item.recipe[i]]||root.MartialTraining.labels[item.recipe[i]]):'조합법 미해독'),el('span','training-selection',draft[axis]?'선택됨 · '+(P.labels[draft[axis]]||root.MartialTraining.labels[draft[axis]]):'선택 안 함'));
     const options=m.elements[axis].filter(o=>filter==='all'||(filter==='owned'?o.owned:!o.owned));
     for(const o of options){const b=button('',()=>{draft[axis]=o.id;render();},!o.owned||!m.safe||!item.discovered,'secondary training-element-card');b.dataset.prototypeElement=o.id;b.dataset.owned=String(o.owned);b.setAttribute('aria-pressed',String(draft[axis]===o.id));b.append(el('strong','',o.label),el('span','training-element-state',o.owned?'획득':'미획득'),el('small','',o.source));column.append(b);}
     if(!options.length)column.append(el('small','',filter==='owned'?'획득한 요소가 없습니다.':'모든 요소를 획득했습니다.'));slots.append(column);
    });picker.append(slots);box.append(picker);
    const actions=el('div','training-actions');actions.append(button('구성 확인',()=>change(g=>P.compose(g,id,axes.map(a=>draft[a])),{success:!item.learned?()=>completed('learn'):null}),!m.safe||!item.discovered||!axes.every(a=>draft[a]),'primary'));
    if(item.learned){actions.append(button('원형 실습 (선택)',()=>change(g=>P.startPractice(g,id),{leave:true}),!m.safe||m.world!=='murim'),button('원형 장착',()=>change(g=>P.equip(g,id)),!m.safe||m.world!=='murim'));}
    box.append(actions,el('p','training-caption','구성하면 즉시 습득 · 재료 소모 없음 · 원리 성취와 플레이 스타일 숙련도는 별개'));
   }else{
    const sources=el('div','training-sources');
    for(const [i,key]of item.sources.entries()){const b=m.basics.find(x=>x.id===key),card=el('section','training-source');card.append(el('small','',i?'차용할 원리':'기본 원형'),el('strong','',b.name),el('span','',b.learned?'습득 완료':'미습득'),el('small','',b.proven?'원리 성취 완료':'실제 운용으로 원리 성취 필요'));sources.append(card);}
    const principle=el('div','training-principle');principle.append(el('small','','차용 원리'),el('strong','',item.principle));box.append(sources,principle,el('p','training-clue',item.restriction));
    const actions=el('div','training-actions');
    if(!item.created)actions.append(button('무공 창안하기',()=>change(g=>P.create(g,id),{success:()=>completed('create')}),!m.safe||!item.ready,'primary'));
    else {actions.append(button('무림 연계 실습',()=>change(g=>P.startPractice(g,id),{leave:true}),!m.safe||m.world!=='murim'),button(item.equipped?'창안 운용 중':'창안 무공 장착',()=>change(g=>P.equip(g,id)),!m.safe||item.equipped||m.world==='reality'&&!item.reality));}
    if(item.proven)actions.append(button(item.reality?'현실 적용 중':'현실에 적용',()=>change(g=>P.apply(g,id)),!m.safe||m.world!=='reality'||item.reality));
    if(item.reality)actions.append(button('현실 연계 실습',()=>change(g=>P.startPractice(g,id,{world:'reality'}),{leave:true}),!m.safe||m.world!=='reality'));
    box.append(actions,el('p','training-caption',item.realityProven?'현실 재현 완료':'무림에서 실제 효과 증명 → 현실 거점에서 적용 → 현실 재현'));
   }
   if(P.state(g).equipped===id)box.append(button('기본 검격으로 복귀',()=>change(g=>P.equip(g,null)),!m.safe));
   if(item.reason)box.append(el('p','training-reason',item.reason));
  }
  return {detail,reset};
 }};
})(globalThis);
