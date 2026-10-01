(function(root){'use strict';
 function create({game,node,show,refresh,active}){
  const button=node('button','contract-shortcut','현장 의뢰');button.id='contractButton';button.type='button';document.getElementById('journeyTools').append(button);button.onclick=()=>open();
  function open(result=null){const g=game();if(!active()||g.introActive)return;const c=Progression.contract(g),body=node('section','contract-screen');body.append(node('small','contract-category','현실 · 반복 실전'),node('h3','','균열 잔당 토벌'),node('p','','안정화한 균열에 남은 네 위협을 제거하고 돌아오세요. 공통 무공만으로도 수행할 수 있습니다.'),node('p','contract-rewards','총 금화 140 · 경험치 100 (처치 16 × 4 / 보고 76)'),node('p','',`완료 ${c.completed}회 · 적 체력/피해 배율 ${(1+Math.min(c.completed,10)*.05).toFixed(2)}`),node('p','','실전 숙련은 정상 획득합니다. 처치한 적마다 금화 16을 즉시 얻으며 본편 진행과 클리어 횟수는 바뀌지 않습니다.'));
   for(const [label,text]of [['배경','안정화한 균열에 위협이 다시 나타났습니다.'],['수행 목표',`균열 잔당 처치 ${c.kills} / 4`],['보고 대상','현실 기지 · 의뢰판'],['예정 보상','처치 금화 16 × 4 / 보고 금화 76 · 경험치 100']]){const section=node('section','contract-section');section.append(node('h3','',label),node('p','',text));body.append(section);}if(result)body.append(node('h3','','획득 결과'),node('p','quest-result',result));
   const actions=[];
   if(c.status==='ready'){body.append(node('p','node-state','토벌 완료 · 현실 기지에서 보상을 받으세요.'));actions.push({label:'보상 수령',disabled:g.area!=='city',run:()=>{const before=g.gold,ok=g.claimContract();refresh();open(ok?'보고 완료 · 금화 +'+(g.gold-before)+' / 경험치 100\n다음 행동 · 본편 길 안내 또는 새로운 의뢰':null);}});}
   else if(c.status==='active'){body.append(node('p','node-state',`처치 ${c.kills} / 4`),node('p','','전투 중 저장을 불러오거나 지역을 떠나면 의뢰는 중단됩니다.'));actions.push({label:'의뢰 중단 · 기지 귀환',secondary:true,run:()=>{g.cancelContract();refresh();}});}
   else {body.append(node('p','',g.progress<6?'개방 조건: 본편 첫 D급 균열 공략 완료':'수주 가능 · 현실 기지에서 출발'),node('p','','성공 후 기지에서 보상을 수령합니다. 완료 전 후퇴·쓰러짐·불러오기는 보고 보상 없이 중단되며 이미 획득한 처치 금화는 유지됩니다. 다시 도전할 수 있습니다.'));actions.push({label:'의뢰 수주',disabled:g.area!=='city'||g.progress<6||!!g.trial,run:()=>{g.startContract();refresh();}});}
   actions.push({label:'돌아가기',secondary:true});show('현장 의뢰판',body,actions,'warden','현실에서 증명하는 무공');
  }
  function update(){const g=game();button.hidden=!active()||g.introActive;button.classList.toggle('reward-ready',Progression.contract(g).status==='ready');}
  return {open,update};
 }
 root.ContractUI={create};
})(globalThis);
