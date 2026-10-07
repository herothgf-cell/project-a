(function(root){'use strict';root.GrowthScreen={create({game,show,node,refresh,commit,close,character,skills,objective=()=>{},prepare=async()=>true}){
 let kind='realm',confirming=false,ticket=0,message='';
 const labels={realm:'경지 돌파',hunter:'헌터 승급'},worlds={realm:'murim',hunter:'reality'},hubs={realm:'청운촌',hunter:'현실 기지'};
 const button=(label,run,disabled=false)=>{const b=node('button','secondary',label);b.type='button';b.disabled=disabled;b.onclick=run;return b;};
 function open(section='realm'){if(!['realm','hunter'].includes(section))return skills(section);kind=section;confirming=false;message='';ticket++;const ids=game().unreadNews('growth').filter(x=>x.subject===kind).map(x=>x.id);if(ids.length)commit(g=>{ids.forEach(id=>g.readNews(id));return true;});render();}
 async function start(body,b){const serial=++ticket;b.disabled=true;try{if(await prepare(Advancement.areas[kind])===false)throw Error('art');if(serial!==ticket||!body.isConnected||!document.querySelector('#dialog')?.open)return;if(!Advancement.start(game(),kind))throw Error('conditions');close();refresh();}catch{message='시련을 준비하지 못했습니다. 현재 위치와 도전 조건을 확인하고 다시 시도하세요.';if(body.isConnected)render();}}
 function render(){const g=game(),m=Advancement.describe(g,kind),world=worlds[kind],body=node('section','advancement-screen purpose-screen');body.dataset.world=world;body.dataset.section=kind;
  body.append(node('p','purpose-eyebrow',(kind==='realm'?'무림':'현실')+' · '+hubs[kind]+'에서 도전'),node('h3','',labels[kind]));
  if(message)body.append(node('p','purpose-notice',message));
  if(!m.menuUnlocked){const panel=node('section','purpose-lock');panel.append(node('strong','','이야기 잠금'),node('h4','',m.menuReason),node('p','','경계의 심장에서 새 호흡을 증명하고 현실 기지로 돌아와 결과를 보고하세요.'),button('현재 임무 안내',objective));body.append(panel,node('p','purpose-next','현재 '+m.name+(kind==='hunter'?'급':'')+' → '+m.nextName+(kind==='hunter'?'급':'')));}
  else {
   const status=m.status==='complete'?'최종 단계 달성':m.status==='active'?'실전 진행 중':m.status==='passed'?(kind==='realm'?'돌파 확정 대기':'서린 보고 대기'):m.unlocked?'도전 조건 충족':'메뉴 해금 · 준비 중';
   body.append(node('p','purpose-state',status));const rail=node('ol','advancement-stages');rail.setAttribute('aria-label',labels[kind]+' 진행');for(const [i,name]of Advancement.names[kind].entries()){const li=node('li',i===m.stage?'current':i<m.stage?'completed':'',name+(kind==='hunter'?'급':''));if(i===m.stage)li.setAttribute('aria-current','step');rail.append(li);}body.append(rail);
   if(m.nextName){body.append(node('h4','purpose-next',m.name+(kind==='hunter'?'급':'')+' → '+m.nextName+(kind==='hunter'?'급':'')));const req=node('ul','purpose-requirements');for(const r of m.requirements){const li=node('li',r.met?'met':'', (r.met?'✓ 완료 · ':'○ 필요 · ')+r.text);if(!r.met)li.append(button(r.text.includes('숙련')?'무공/스킬 확인':'관련 임무 확인',r.text.includes('숙련')?()=>skills(world):objective));req.append(li);}body.append(req);
    const reward=node('section','purpose-reward');reward.append(node('h4','','확정 후 보상'),node('p','',kind==='realm'?`무림 생명 +${m.reward.hp} · 내력 +${m.reward.mp} · 공격 +${m.reward.attack}`:m.nextName+'급 공식 헌터'),node('p','',(kind==='realm'?'경지 특화':'헌터 훈련')+' 포인트 +'+m.reward.points+' · 캐릭터에서 배분'));body.append(reward);
    if(m.status==='active'){body.append(node('p','',m.trial?.text||'전장 목표를 수행하세요.'),button('실전으로 돌아가기',close));}
    else if(m.status==='passed'&&kind==='hunter'){body.append(node('p','purpose-notice','실전 평가는 통과했습니다. 현실 기지의 서린에게 가까이 가서 E로 결과를 보고하면 공식 등급이 바뀝니다.'),button('서린 위치 안내',()=>{message='현실 기지 · 서린(현장 담당자). 화면을 닫고 임무 길 안내를 따라 이동한 뒤 대화하세요.';render();}));}
    else if(m.canConfirm){body.append(button(confirming?'돌파 확정 · 보상 적용':'돌파 결과 확인',()=>{if(!confirming){confirming=true;render();return;}if(commit(g=>Advancement.confirm(g,kind))){confirming=false;message='돌파 확정 · 보상과 경지 기록을 저장했습니다.';}else message='저장하지 못했습니다. 돌파 결과와 보상을 다시 확인해 주세요.';render();}));if(confirming)body.append(node('p','purpose-notice','위 보상으로 돌파를 확정합니다. 닫으면 취소됩니다.'));}
    else{const startButton=button(kind==='realm'?'경지 시련 신청':'공식 평가 신청',()=>start(body,startButton),!m.canStart);body.append(node('p','purpose-notice',m.reason),node('p','','예고 대응 → 위협 제압 → 지점 확보 · 처치 보상 없음 · 재도전 비용 없음'),startButton);}
   }
   if(m.stage>0)body.append(button('캐릭터에서 '+(kind==='realm'?'경지 특화':'헌터 훈련')+' 배분 · 남은 '+m.points.available+'포인트',()=>character.open(world,kind)));
  }
  show(labels[kind],body,[{label:'닫기',secondary:true}],'system',kind==='realm'?'무림의 다음 경지':'현실의 공식 평가');
 }
 return {open};
}};})(globalThis);
