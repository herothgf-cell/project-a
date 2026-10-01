(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.QuestData=api;})(globalThis,function(){
 function describe(g){const o=globalThis.ObjectiveModel?.resolve(g)||g.objective(),contract=g.contract?.status==='active'||g.contract?.status==='ready';return contract?{background:'안정화된 균열에 남은 네 위협을 제거합니다.',goals:['균열 잔당 4명 처치'],reportTo:'현실 기지 · 의뢰판',rewards:['처치마다 금화 16 (총 64)','보고 금화 76 · 경험치 100']}:{background:o.purpose||o.title,goals:[o.condition||o.text],reportTo:o.status==='report'?'현실 기지 · 서린':'현재 목표 완료 후 길 안내 확인',rewards:o.rewards?.length?o.rewards:['이야기 진행 · 수련과 인증은 해당 사건 완료 시 결과 표시']};}
 return {describe};
});
