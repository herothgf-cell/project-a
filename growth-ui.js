(function(root){'use strict';
 function create(env){const {game,show,node,grid,refresh,notes,shop,close}=env;
  function button(label,run,disabled=false){const b=node('button','secondary',label);b.disabled=disabled;b.onclick=run;return b;}
  function open(tab='status'){
   const g=game();if(g.introActive)return;const r=Revision.summary(g),j=g.journey,s=Revision.state(g),body=node('section','growth-screen'),nav=node('nav','growth-tabs');
   for(const [id,label]of [['status','상태'],['martial','무공'],['history','행적']]){const b=button(label,()=>open(id));b.classList.toggle('selected',id===tab);b.setAttribute('aria-current',id===tab?'page':'false');nav.append(b);}body.append(nav);
   if(tab==='status'){
    body.append(grid([['이름 / 개인 등급','윤서 / E급 헌터'],['현장 자격',j.phase===5?'C급 현장 인증':'미인증'],['레벨 / 경험치',`Lv.${g.level} · ${g.xp} / ${r.stats.next}`],['체력',`${Math.ceil(g.player.hp)} / ${r.stats.hp}`],['내력',`${Math.ceil(g.player.mp)} / ${r.stats.mp}`],['공격력',r.stats.attack]]));
    const level=Progression.levelPreview(g),preview=node('div','level-preview');preview.append(node('b','',level.capped?'최대 레벨 달성':'다음 레벨의 변화'));if(level.next)for(const [key,label]of [['hp','최대 체력'],['mp','최대 내력'],['attack','공격력']])preview.append(node('p','',`${label} ${level.current[key]} → ${level.next[key]} (+${level.next[key]-level.current[key]})`));body.append(preview);
    for(const [key,label]of [['attack','공격력'],['hp','최대 체력'],['mp','최대 내력']])body.append(node('p','stat-origin',label+' = '+Object.entries(r[key]).map(([k,v])=>k+' '+v).join(' + ')));
    body.append(grid([['무기 강화','+'+g.upgrade],['다음 강화',g.upgrade>=10?'최대 단계':`${80+g.upgrade*60} 금화 / 공격력 +4`],['금화',g.gold],['회복약',g.potions],['마정석',j.materials],['관측 렌즈',j.lens?'보유 · 기감 340':'미보유 · 기감 260']]));
    body.append(node('h3','','숙련과 심법'));for(const [key,label]of [['sword','공통 검술'],['ripple',s.inherited.includes('ripple')?'파문검':'미계승 기연 ①'],['echo',s.inherited.includes('echo')?'잔영보':'미계승 기연 ②'],['seal',s.inherited.includes('seal')?'경계봉인':'미계승 기연 ③']]){const row=node('div','mastery-row');row.append(node('span','',label),node('b','',j.mastery[key]+' / 30'));const bar=node('progress');bar.max=30;bar.value=j.mastery[key];bar.setAttribute('aria-label',label+' 숙련');row.append(bar);const m=Progression.mastery(g,key);row.append(node('small','mastery-caption',`해당 계열 피해 +${m.percent}% · ${m.next===null?'최종 단계':`다음 숙련 ${m.next}: +${m.percent+3}%`}`));body.append(row);}
    body.append(node('p','',j.breath==='flow'?'유수심법 · 사용 후 1.2초부터 내력 회복 초당 6 + 3':'집중심법 · 1.4초 호흡 뒤 첫 수동 타격에 내력 6, 피해 1.2배'));
    body.append(node('p','','영구 피해 경감: '+(g.training>=3?'경계 공명 15%':'없음')+' · 일시 수호진과 전장 결계는 별도 효과입니다.'));
    const temporary=[];if(g.experimentRuntime.guard)temporary.push('수호진');if(g.combat.field)temporary.push('결계');body.append(node('p','','현재 일시 효과: '+(temporary.join(', ')||'없음')));
    body.append(node('p','','계열 숙련은 유효한 실전 운용으로 오릅니다. 5 / 10 / 20 / 30마다 해당 계열 피해 +3%, 최대 +12%. 기본 공격력 수치에는 합산되지 않습니다.'));
    body.append(node('h3','',j.realm?'이류의 호흡 · 돌파 완료':'이류의 호흡 · 돌파 조건'));
    ['유효 숙련 합계 8 이상','두 세계 실전 경험','직접 발견한 해석 1개'].forEach((label,i)=>body.append(node('p','',`${r.requirements[i]?'✓':'○'} ${label}`)));
    body.append(button('심법 변경 · 돌파 · 마정석 사용',()=>notes.open('growth')),button('보급 · 무기 강화',shop,!DualWorld.AREAS[g.area].safe));
   }else if(tab==='martial'){
    body.append(MartialTree.create({g,node,close,refresh,notes}));
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
