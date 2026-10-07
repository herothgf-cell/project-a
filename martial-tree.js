(function(root){'use strict';
 const actions=['signature1','signature2','ultimate'];
 const variantAction=key=>['ripple-guard','seal-hold'].includes(key)?0:1;
 function create({g,node,close,refresh,commit,notes,subject=null,onDetail=()=>{}}){
  const rootEl=node('section','martial-tree'),map=node('div','tree-map'),detail=node('section','tree-detail');detail.setAttribute('aria-live','polite');let selected=JourneyData.variants[subject]&&g.journey.known.includes(subject)?'variant:'+subject:g.revision.inherited.includes(subject)?'family:'+subject:'common:attack';
  const b=(label,fn,disabled=false)=>{const e=node('button','secondary',label);e.type='button';e.disabled=disabled;e.onclick=fn;return e;};
  const owned=path=>g.revision.inherited.includes(path),ready=path=>g.legend.ready.includes(path)||g.fate.proven.includes(path);
  function nodeButton(id,glyph,name,state){const e=b('',()=>{selected=id;render();notifyDetail();map.querySelector('[data-node="'+id+'"]')?.focus({preventScroll:true});detail.scrollIntoView({block:'nearest'});});e.className='tree-node '+state;e.dataset.node=id;e.setAttribute('aria-pressed',String(selected===id));e.append(node('span','tree-glyph',glyph),node('b','',name),node('small','',state==='locked'?'미발견':state==='equipped'?'장착 중':state==='ready'?'계승 가능':state==='owned'?'습득':'흔적 발견'));e.setAttribute('aria-label',name+' · '+e.lastChild.textContent);return e;}
  function render(){map.replaceChildren();detail.replaceChildren();
   const common=node('section','common-tree');common.append(node('h3','','공통 무공 · 수련으로 학습'));
   const row=node('div','common-nodes');for(const [i,a]of ['attack','moon','storm'].entries()){const k=g.skillInfo(a);row.append(nodeButton('common:'+a,k.glyph,k.name,g.training>=i?'owned':'locked'));}common.append(row,node('p','tree-legend','실선: 학습 흐름 · 연결선: 계열 소속 · 점선: 기술 변형 대상'));map.append(common);
   const branches=node('div','tree-branches');Object.entries(DualWorld.Fate.PATHS).forEach(([path,v],index)=>{const have=owned(path),can=ready(path),seen=g.fate.discovered.includes(path),column=node('section','tree-branch');column.style.setProperty('--branch-color',v.color);
    column.append(nodeButton('family:'+path,have?v.glyph:'?',have?v.name:'미확인 기연 '+['①','②','③'][index],have?'owned':can?'ready':seen?'seen':'locked'));
    const skills=node('div','tree-skills');for(const [i,k]of v.skills.entries())skills.append(nodeButton('skill:'+path+':'+i,have?k[1]:'◇',have?k[0]:i===2?'미확인 오의':'계승 후 공개',have?'owned':'locked'));column.append(skills);
    const variants=node('div','tree-variants');for(const [key,vv]of Object.entries(JourneyData.variants).filter(([,x])=>x.path===path)){const known=g.journey.known.includes(key);const cell=node('div','variant-link');cell.append(node('small','',have?'↳ '+v.skills[variantAction(key)][0]+' 변형':'↳ 기술 변형'),nodeButton('variant:'+key,known?vv.glyph:'?',known?vv.name:'미발견 해석',g.journey.selected[path]===key?'equipped':known?'seen':'locked'));variants.append(cell);}column.append(variants);branches.append(column);
   });map.append(branches);
   const [kind,id,index]=selected.split(':'),path=kind==='variant'?JourneyData.variants[id].path:id;
   if(kind==='common'){const k=g.skillInfo(id),need={attack:0,moon:1,storm:2}[id];detail.append(node('h3','',k.name),node('p','',k.description||'전방의 적에게 기본 검격을 가합니다.'),node('p','',`{key:${id}} · 내력 ${k.cost} · 재사용 ${k.cool}초`),node('p','',g.training>=need?'현재 사용 가능':'백련과 본편 수련을 통해 습득합니다.'));showMastery('sword');}
   else if(kind==='family'){
    const v=DualWorld.Fate.PATHS[path],have=owned(path),can=ready(path);detail.append(node('h3','',have?v.name:'미확인 기연'),node('p','',have?'계승 완료 · 이 가지의 기술을 사용할 때 해당 계열 숙련이 성장합니다.':can?'직접 확인한 힘을 자신의 무공으로 계승할 수 있습니다.':'전투와 탐험에서 평소와 다른 반응을 관찰하세요. 아직 이름과 획득 방법은 밝혀지지 않았습니다.'));
    if(have||can){showMastery(path);if(!have||g.fate.path!==path){const field=g.legend.ready.includes(path),allowed=!g.trial&&(field?(!g.fate.path||g.fate.path===path||DualWorld.AREAS[g.area].safe):g.area==='village'&&g.fate.stage>=2);detail.append(b(have?'이 계열로 재수련':'계승 수락',()=>{close();if(commit)commit(current=>field?current.awaken(path):current.acceptFate(path));else {field?g.awaken(path):g.acceptFate(path);refresh();}},!allowed));if(!allowed)detail.append(node('p','','시험을 마친 뒤 '+(field?'안전 거점':'청운촌')+'에서 선택하세요.'));}else detail.append(node('p','node-state','현재 운용 계열'));}
   }else if(kind==='skill'){
    if(!owned(path)){detail.append(node('h3','','계승 후 공개'),node('p','','기연을 정식 계승하면 기술과 오의의 이름·효과가 열립니다.'));}
    else {const k=DualWorld.Fate.PATHS[path].skills[Number(index)];detail.append(node('h3','',k[0]),node('p','',k[4]),node('p','',`{key:${actions[index]}} · ${Number(index)===2?'기세 100':`내력 ${k[2]}`} · 재사용 ${k[3]}초`),node('p','',g.fate.path===path?'현재 계열에서 사용 가능':'거점에서 이 계열로 재수련하면 사용할 수 있습니다.'));showMastery(path);}
   }else{
    const v=JourneyData.variants[id],known=g.journey.known.includes(id);
    if(!known)detail.append(node('h3','','미발견 해석'),node('p','','환서정에서 직접 관찰한 현상을 토대로 기술의 다른 운용을 발견할 수 있습니다.'));
    else {const base=DualWorld.Fate.PATHS[path].skills[variantAction(id)],have=g.fate.path===path,chosen=g.journey.selected[path]===id,allowed=have&&!g.trial&&(DualWorld.AREAS[g.area].safe||g.area==='archive');detail.append(node('h3','',v.name),node('small','',owned(path)?'기술 변형 · '+base[0]:'기술 변형 · 기본 기술은 계승 후 공개'),node('p','comparison-base',owned(path)?'기본: '+base[4]:'아직 기본 기술을 계승하지 않았습니다.'),node('p','comparison-new','변형: '+(owned(path)?v.description:v.description.replace(base[0],'해당 기술'))),b(chosen?'장착 중':'이 해석 장착',()=>{g.chooseInterpretation(id);refresh();render();},chosen||!allowed));if(!have)detail.append(node('p','','먼저 해당 계열을 계승하고 운용하세요. 발견 기록은 유지됩니다.'));else if(!allowed)detail.append(node('p','','시험을 마친 뒤 환서정 또는 안전 거점에서 장착하세요.'));if(chosen)detail.append(node('p','node-state','적용 완료 · 본편을 이어가거나 다른 흔적을 살펴보세요.'));showMastery(path);}
   }
  }
  function notifyDetail(){const [kind,id]=selected.split(':');if(kind==='variant'&&g.journey.known.includes(id)||kind==='family'&&owned(id))onDetail(id);}
  function showMastery(path){const m=Progression.mastery(g,path);detail.append(node('p','mastery-effect',`계열 숙련 ${m.value}/30 · 해당 계열 피해 +${m.percent}%`),node('p','',m.next===null?'숙련 최종 단계 달성':`다음 단계: 숙련 ${m.next} · 피해 +${m.percent+3}%`));}
  rootEl.append(node('p','tree-intro','발견 → 계승 → 실전 숙련 → 기술 변형. 포인트로 구매하는 트리가 아닙니다.'),detail,map,b('관찰 기록과 요청형 힌트',()=>notes.open('facts')),b('기본 운용으로 복귀',()=>{g.clearInterpretation();refresh();render();},!DualWorld.AREAS[g.area].safe||!!g.trial));render();notifyDetail();return rootEl;
 }
 root.MartialTree={create};
})(globalThis);
