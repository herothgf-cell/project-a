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
 function create({game}){
  function updateCombat(){
   const g=game(),button=document.querySelector('[data-action="signature2"]');
   let status=document.getElementById('responseOpportunity');
   if(!status){status=document.createElement('div');status.id='responseOpportunity';status.setAttribute('aria-label','현실 대응과 후속 기회');document.getElementById('canvas').parentElement.append(status);}
   const visible=g.worldGrowth&&g.growthWorld()==='reality'&&g.worldGrowth.reality.equipped&&g.responseFeedbackEnabled!==false;
   const view=visible?combatView(g,globalThis.Controls.key):{text:'',charged:false,ready:false};
   status.hidden=!view.text;status.textContent=view.text;status.dataset.ready=String(view.ready);
   if(button){button.classList.toggle('response-charged',view.charged);button.dataset.responseReady=String(view.ready);if(view.text)button.setAttribute('aria-label',g.skillInfo('signature2').name+' · '+view.text);}
  }
  return {updateCombat};
 }
 return {combatView,create};
});
