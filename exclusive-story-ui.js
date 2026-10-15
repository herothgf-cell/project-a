(function(root){'use strict';
 function create({game,show,node,refresh,training}){
  function open(){const g=game();g.checkStoryEvidence();const e=g.storyObjective(),body=node('section','exclusive-story');
   body.append(node('p','',e?e.text:'두 권의 기록을 남겼습니다. 다음 탐험과 무공 수련을 계속할 수 있습니다.'));
   const time=root.ExclusiveTravel.remaining(g.worldState.exclusiveTravel);body.append(node('p','dialog-note','공통 게임 시간 '+Math.floor(g.worldState.exclusiveTravel.minutes/60)+'시간 '+Math.floor(g.worldState.exclusiveTravel.minutes%60)+'분 · 다음 왕래까지 '+Math.ceil(time)+'분'));
   const actions=[];const run=fn=>()=>{fn();refresh();open();};
   if(e?.chapter<=2&&!g.worldState.exclusiveStory.completed.includes('four-principles'))actions.push({label:'인트로 건너뛰기 · 조합 수업부터',secondary:true,run:run(()=>g.skipStoryIntro())});
   if(e?.area===g.area&&['scene','companion'].includes(e.kind))actions.push({label:'이야기 진행',run:run(()=>g.storyAction(e.id))});
   if(e&&['combat','support'].includes(e.kind)&&e.area===g.area){const r=g.storyEncounter();body.append(node('p','',e.kind==='support'?'엄호 · 남은 '+r.remaining.toFixed(1)+'초 · 대응 '+r.responses+'/3':'현장의 위협을 제압하세요.'));actions.push({label:'전투 계속하기'});}
   if(e&&root.ExclusiveGame.AREAS[e.area].world===root.ExclusiveGame.AREAS[g.area].world&&e.area!==g.area)actions.push({label:root.ExclusiveGame.AREAS[e.area].name+'으로 이동',run:run(()=>g.enter(e.area))});
   if(['home','shrine'].includes(g.area))actions.push({label:'왕래 시작 · 정지 호흡 10초',run:()=>{const result=g.startCrossing();if(!result.ok){g.toast(result.reason);refresh();open();}else refresh();}});
   else {const to=g.growthWorld()==='murim'?'shrine':'home';actions.push({label:root.ExclusiveGame.AREAS[to].name+'으로 이동',secondary:true,run:run(()=>g.enter(to))});}
   if(root.ExclusiveGame.AREAS[g.area].safe)actions.push({label:'휴식 · 남은 대기 시간 보내기',secondary:true,run:run(()=>g.restUntilCrossing())});
   if(g.growthWorld()==='murim'&&g.area!=='yeoul')actions.push({label:'여울장으로 돌아가기',secondary:true,run:run(()=>g.enter('yeoul'))});
   if(g.growthWorld()==='reality'&&g.area!=='city')actions.push({label:'헌터 기지로 이동',secondary:true,run:run(()=>g.enter('city'))});
   if(g.area==='yeoul'&&g.worldState.exclusiveStory.completed.includes('murim-rescue')&&!g.worldState.exclusiveFollowup)actions.push({label:'후속 운용 실습 (선택)',secondary:true,run:()=>{if(!g.startFollowupPractice())g.toast('파문세·잔영각·쇄경진 중 하나를 먼저 습득하세요.');refresh();}});
   if(g.worldState.martialTraining.introduced)actions.push({label:'무공 수련',secondary:true,run:()=>training()});
   if(g.growthWorld()==='murim'&&g.worldState.martialTraining.learned.includes('sword'))actions.push({label:'무명 비경 · 요소 조사',secondary:true,run:run(()=>g.enter('sanctum'))});
   actions.push({label:'세계별 기록',secondary:true,run:records},{label:'닫기',secondary:true});
   show((e?e.chapter+'장 · '+e.title:'두 권의 수첩'),body,actions,'system','쌍계 · 홀로 건너는 사람');
  }
  function records(){const g=game(),body=node('section');for(const [world,label]of [['reality','현실의 수첩'],['murim','무림의 수첩']]){body.append(node('h3','',label));for(const id of g.worldState.exclusiveStory.records[world])body.append(node('p','',root.ExclusiveStory.events.find(e=>e.id===id).title));}show('두 권의 수첩',body,[{label:'이야기로',run:open},{label:'닫기'}]);}
  return {start:open,resume:open,openScene:open,openTravel:open,openRecords:records,get active(){return false;},get replay(){return false;}};
 }
 root.ExclusiveStoryUI={create};
})(globalThis);
