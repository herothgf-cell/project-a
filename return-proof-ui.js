/* UI projections never award responses, ownership, or report credit. */
(function(root,f){const api=f(typeof module==='object'&&module.exports?require('./reality-skills.js'):root.RealitySkills);if(typeof module==='object'&&module.exports)module.exports=api;else root.ReturnProofUI=api;})(globalThis,function(Reality){
 'use strict';
 function combatView(g,key){
  const view=Reality.readiness(g,'signature2'),r=g.realityRuntime||{};
  let text='';
  if(view.charged){
   const power=view.family==='ripple'?'보관 충격':view.family==='echo'?'가속 성공':'예고 억제';
   const availability=view.reason==='cooldown'?'쿨 '+view.cooldown.toFixed(1)+'초':view.reason==='resource'?'자원 부족':!view.hasTarget?'대상 없음':'후속 타격 가능';
   text=power+(view.boostRemaining?' '+view.boostRemaining.toFixed(1)+'초':'')+' · '+key('signature2')+' '+availability;
  }else if(r.guard?.until>g.playTime)text=key('signature1')+' 충격 흡수 대기';
  else if(r.lastResponse?.until>g.playTime)text=({consumed:'강화 소비 · '+key(r.lastResponse.consumer||'attack'),expired:'강화 종료', 'waiting-ended':'대기 종료 · 실제 공격이 닿지 않았습니다.'})[r.lastResponse.kind]||'';
  return {...view,text,ready:view.charged&&view.canUse&&view.hasTarget};
 }
 function returnView(rows){const inherited=rows.filter(r=>r.unlocked&&Reality.table[r.unlocked]);if(!inherited.length)return null;return {title:'현실에서 달라진 대응',text:inherited.map(r=>Reality.table[r.unlocked][0][0]+' / '+Reality.table[r.unlocked][1][0]).join(' · ')+'\n적용 세계 · 현실. 무공에서 장착한 뒤 같은 위협을 다시 만나 보세요.',rows:inherited};}
 function create({game,node,show,close,commit,refresh,skills}){
  function showReturn(rows){const view=returnView(rows);if(!view)return;const body=node('div');body.append(node('p','',view.text));const details=node('details');details.append(node('summary','','출처와 능력치 변화'));for(const r of view.rows)details.append(node('p','',r.source+' · 체력 '+r.before.hp+' → '+r.after.hp+' · 공격 '+r.before.attack+' → '+r.after.attack));body.append(details);show(view.title,body,[{label:'현실 대응 장착하기',run:skills},{label:'나중에 확인',secondary:true}],'hero','무림에서 체득한 원리 → 현실 대응');}

  function choices(){const g=game(),P=globalThis.ReturnProof;show('다음 현장 · 역할 분담','도겸은 후방 회수를 맡습니다. 두 배치의 현장 변화를 확인한 뒤 선택하세요. 시도 종료 후 다른 배치도 체험할 수 있습니다.', ['cut-support','secure-route'].map(id=>({label:P.choiceView(g,id).title,run:()=>{const v=P.choiceView(game(),id);show(v.title,v.text,[{label:'이 배치로 확정',disabled:!v.canChoose,run:()=>{if(commit(g=>P.choose(g,id)))refresh();}},{label:'선택으로 돌아가기',secondary:true,run:choices}],'warden','선택 미리보기 · 아직 변경되지 않음');}})).concat([{label:'나중에 결정',secondary:true}]),'warden','직접 보고로 열린 현장 결정권');}
  function report(){const g=game(),s=globalThis.ReturnProof.describe(g);if(s.reported)return choices();show('서린 · 귀환 대응 결과',s.verifiedFamily?'실제 대응과 회수 완료를 직접 보고합니다. 기존 초동 대응 역할과 보급 기록을 함께 확인합니다.':'회수 임무는 완료했습니다. 실제 기술 대응 근거는 아직 없습니다. 기본 전투 성과를 확인하고 다시 연습할 수 있습니다.',[{label:'검증 결과 보고',disabled:!s.proofCompleted||!s.verifiedFamily,run:()=>{if(commit(g=>g.reportReturnProof().ok))choices();}},{label:'나중에 보고',secondary:true}],'warden','확인한 성과만 보고');}
  function result(e){const s=globalThis.ReturnProof.describe(game());show('귀환 대응 · '+({complete:'회수 완료',retreat:'후퇴',defeat:'재도전'}[e.outcome]),'입장 전 체력·내력·소모품을 복구했습니다.\n'+(e.outcome==='complete'?(e.mode==='baseline'?'무림에서 기연을 계승하고 현실로 돌아와 같은 현장을 다시 확인하세요.':e.mode==='proof'?(s.verifiedFamily?'실제 대응 근거가 남았습니다. 서린에게 직접 보고하세요.':'기본 전투로 회수했습니다. 실제 기술 대응은 재도전으로 확인하세요.'):(globalThis.ReturnProof.choiceView(game(),e.choice)?.text||'')):'확정한 증거는 유지되며 임무는 다시 시작할 수 있습니다.'),[{label:'계속하기'}],'system','무보상 선택 체험');}
  function updateCombat(){
   const g=game(),button=document.querySelector('[data-action="signature2"]');
   let status=document.getElementById('responseOpportunity');
   if(!status){status=document.createElement('div');status.id='responseOpportunity';status.setAttribute('aria-label','현실 대응과 후속 기회');document.getElementById('canvas').parentElement.append(status);}
   const visible=g.worldGrowth&&g.growthWorld()==='reality'&&g.worldGrowth.reality.equipped&&g.responseFeedbackEnabled!==false;
   const view=visible?combatView(g,globalThis.Controls.key):{text:'',charged:false,ready:false};
   const practice=globalThis.ReturnProof.practiceView(g);status.hidden=!(view.text||practice);status.textContent=practice?'선택 연습 · '+practice.next+' ('+globalThis.Controls.key('signature1')+' 받아내기 / '+globalThis.Controls.key('signature2')+' 후속기)':view.text;if(practice?.helpAvailable){const help=document.createElement('button');help.type='button';help.textContent='도움말 보기';help.onclick=()=>show('선택 연습 도움말','적의 예고가 끝나기 직전 받아내기를 누르세요. 성공하면 축적 표시가 생깁니다. 후속기는 가까운 적을 향해 사용합니다. 연습을 생략해도 기존 계승 조건은 같습니다.',[{label:'직접 다시 시도'}]);status.append(help);}status.dataset.ready=String(view.ready);
   if(button){button.classList.toggle('response-charged',view.charged);button.dataset.responseReady=String(view.ready);if(view.text)button.setAttribute('aria-label',g.skillInfo('signature2').name+' · '+view.text);}
  }
  return {updateCombat,showReturn,report,choices,result};
 }
 return {combatView,returnView,create};
});
