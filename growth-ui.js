(function(root){'use strict';
 function create(env){const {game,show,node,grid,refresh,notes,shop,close}=env;
  function button(label,run,disabled=false){const b=node('button','secondary',label);b.disabled=disabled;b.onclick=run;return b;}
  function open(tab='status'){
   const g=game();if(g.introActive)return;const r=Revision.summary(g),j=g.journey,s=Revision.state(g),body=node('section','growth-screen'),nav=node('nav','growth-tabs');
   for(const [id,label]of [['status','상태'],['martial','무공'],['history','행적']]){const b=button(label,()=>open(id));b.classList.toggle('selected',id===tab);b.setAttribute('aria-current',id===tab?'page':'false');nav.append(b);}body.append(nav);
   if(tab==='status'){
    body.append(grid([['이름 / 개인 등급','윤서 / E급 헌터'],['현장 자격',j.phase===5?'C급 현장 인증':'미인증'],['레벨 / 경험치',`Lv.${g.level} · ${g.xp} / ${r.stats.next}`],['체력',`${Math.ceil(g.player.hp)} / ${r.stats.hp}`],['내력',`${Math.ceil(g.player.mp)} / ${r.stats.mp}`],['공격력',r.stats.attack]]));
    for(const [key,label]of [['attack','공격력'],['hp','최대 체력'],['mp','최대 내력']])body.append(node('p','stat-origin',label+' = '+Object.entries(r[key]).map(([k,v])=>k+' '+v).join(' + ')));
    body.append(grid([['무기 강화','+'+g.upgrade],['다음 강화',g.upgrade>=10?'최대 단계':`${80+g.upgrade*60} 금화 / 공격력 +4`],['금화',g.gold],['회복약',g.potions],['마정석',j.materials],['관측 렌즈',j.lens?'보유 · 기감 340':'미보유 · 기감 260']]));
    body.append(node('h3','','숙련과 심법'));for(const [key,label]of [['sword','공통 검술'],['ripple','파문검'],['echo','잔영보'],['seal','경계봉인']]){const row=node('div','mastery-row');row.append(node('span','',label),node('b','',j.mastery[key]+' / 30'));const bar=node('progress');bar.max=30;bar.value=j.mastery[key];bar.setAttribute('aria-label',label+' 숙련');row.append(bar);body.append(row);}
    body.append(node('p','',j.breath==='flow'?'유수심법 · 사용 후 1.2초부터 내력 회복 초당 6 + 3':'집중심법 · 1.4초 호흡 뒤 첫 수동 타격에 내력 6, 피해 1.2배'));
    body.append(node('p','','영구 피해 경감: '+(g.training>=3?'경계 공명 15%':'없음')+' · 일시 수호진과 전장 결계는 별도 효과입니다.'));
    const temporary=[];if(g.experimentRuntime.guard)temporary.push('수호진');if(g.combat.field)temporary.push('결계');body.append(node('p','','현재 일시 효과: '+(temporary.join(', ')||'없음')));
    body.append(node('h3','',j.realm?'이류의 호흡 · 돌파 완료':'이류의 호흡 · 돌파 조건'));
    ['유효 숙련 합계 8 이상','두 세계 실전 경험','직접 발견한 해석 1개'].forEach((label,i)=>body.append(node('p','',`${r.requirements[i]?'✓':'○'} ${label}`)));
    body.append(button('심법 변경 · 돌파 · 마정석 사용',()=>notes.open('growth')),button('보급 · 무기 강화',shop,!DualWorld.AREAS[g.area].safe));
   }else if(tab==='martial'){
    body.append(node('h3','','공통 무공'),node('p','martial-flow','연환검 → 월영참 → 천뢰격'));
    for(const [action,need]of [['attack',0],['moon',1],['storm',2]]){const k=g.skillInfo(action);body.append(node('p','',`${g.training>=need?'✓':'○'} ${k.name} · {key:${action}} · 내력 ${k.cost} / 재사용 ${k.cool}초`));}
    body.append(node('p','',g.training>=3?'경계 공명 · 수련 공격력 +6 / 피해 15% 경감':'경계 공명 · 수련을 이어가며 발견'));
    for(const [path,v]of Object.entries(DualWorld.Fate.PATHS)){
     const inherited=s.inherited.includes(path),ready=g.legend.ready.includes(path)||g.fate.proven.includes(path),seen=g.fate.discovered.includes(path),card=node('article','martial-branch');
     card.append(node('h3','',seen||ready||inherited?v.name:'미확인 흔적'),node('p','node-state',inherited?'계승 완료':ready?'계승 가능':seen?'이름 없는 발현':'아직 모름'));
     card.append(node('p','',inherited?'흔적 발견 → 계승 완료 → 두 해석 중 선택':ready?'몸으로 확인한 힘을 계승하거나 보류할 수 있습니다.':seen?'직접 확인한 현상은 행적과 수첩에 기록됩니다.':'관찰과 행동이 흔적의 정체를 드러냅니다.'));
     if(ready&&(!inherited||g.fate.path!==path)){
      const fieldReady=g.legend.ready.includes(path),eligible=!g.trial&&(fieldReady?(!g.fate.path||g.fate.path===path||DualWorld.AREAS[g.area].safe):(g.area==='village'&&g.fate.stage>=2));
      if(!eligible)card.append(node('p','dialog-note',fieldReady?'시험을 마치고 안전 거점에서 재수련하세요.':'청운촌으로 돌아가 계승을 수락하세요.'));
      card.append(button(inherited?'이 계열로 재수련':'계승 수락',()=>{close();if(fieldReady)g.awaken(path);else g.acceptFate(path);refresh();},!eligible));
     }
     if(inherited){v.skills.forEach((k,i)=>card.append(node('p','',`{key:${['signature1','signature2','ultimate'][i]}} · ${k[0]} · ${k[4]}`)));}
     for(const [key,variant]of Object.entries(JourneyData.variants).filter(([,v])=>v.path===path)){
      if(!j.known.includes(key)){card.append(node('p','node-unknown','미발견 해석 · 잠김'));continue;}
      const selected=j.selected[path]===key;card.append(node('h4','',variant.name+' · '+(selected?'해석 장착':'해석 발견')),node('p','',variant.description));
      card.append(button(selected?'운용 중':'이 해석 장착',()=>{g.chooseInterpretation(key);refresh();open('martial');},selected||g.fate.path!==path||g.trial||!DualWorld.AREAS[g.area].safe&&g.area!=='archive'));
     }
     body.append(card);
    }
    body.append(button('기본 운용으로 복귀',()=>{g.clearInterpretation();refresh();open('martial');},!DualWorld.AREAS[g.area].safe),button('관찰한 사실과 힌트 보기',()=>notes.open('facts')));
   }else{
    if(s.origin==='legacy')body.append(node('p','dialog-note','이전 버전에서 이어 온 여정입니다. 새 인트로는 회상으로 볼 수 있으며, 과거에 하지 않은 구조 기록은 추가하지 않습니다.'));
    body.append(node('p','','현재 목표 · '+g.objective().title));
    const history=Revision.history(g);if(!history.length)body.append(node('p','','앞으로 직접 겪은 사건이 이곳에 남습니다.'));
    for(const h of history){const row=node('article','history-entry');row.append(node('small','',`${h.at==null?'이전 발견':Math.floor(h.at/60)+'분 '+Math.floor(h.at%60)+'초'} · ${DualWorld.AREAS[h.area].name}`),node('p','',h.text));body.append(row);}
    body.append(node('p','','선택 탐험 · 환서정의 해석 발견은 본편 진행과 별개입니다.'),node('p','',`재공략 · D급 균열 ${g.clears}회 / 항만 ${g.harborClears}회`));
   }
   show('성장 · 몸에 남은 여정',body,[{label:'돌아가기',secondary:true}],'hero','상태 / 무공 / 행적');
  }
  return {open};
 }
 root.GrowthUI={create};
})(globalThis);
