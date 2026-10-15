(function(root){'use strict';
 function create({game,show,node,refresh,training,commit}){
  const F=root.ExclusiveField;
  function open(){const g=game(),e=g.storyObjective(),body=node('section','exclusive-journal'),[destination]=F.destination(g),phase=F.phase(g);
   body.append(node('p','exclusive-place','현재 위치 · '+root.ExclusiveGame.AREAS[g.area].name));
   body.append(node('p','exclusive-journal-stage',({offer:'의뢰인 만나기',field:'현장 수행',report:'복귀하여 보고',scene:'인물과 이야기하기',done:'여정 완료'})[phase]));
   body.append(node('h3','',e?.title||'두 권의 수첩'),node('p','',g.objective().text));
   const route=F.route(g.area,destination);body.append(node('p','dialog-note',route.length?'가는 길 · '+[g.area,...route].map(id=>root.ExclusiveGame.AREAS[id].name).join(' → '):'현재 장소에서 금빛 목표 표식을 따라가세요.'));
   if(e?.kind==='support'&&phase==='field'){const r=g.storyEncounter();body.append(node('p','','엄호 · 남은 '+r.remaining.toFixed(1)+'초 · 실제 대응 '+r.responses+'/3'));}
   body.append(node('p','dialog-note','NPC와 출입구 가까이에서 G 또는 상호작용 버튼을 누르세요. 수첩에서는 사건을 진행하거나 장소를 이동하지 않습니다.'));
   show('임무 수첩',body,[{label:'세계별 기록',secondary:true,run:records},{label:'닫기'}],'system','현재의 약속');
  }
  function openDialogue(scene){const g=game(),body=node('section','exclusive-conversation');body.dataset.world=g.growthWorld();body.append(node('p','exclusive-place',root.ExclusiveGame.AREAS[g.area].name));
   for(const [speaker,text]of scene.lines){const row=node('div','exclusive-line'+(speaker==='윤서'?' is-hero':speaker==='서술'?' is-narration':''));if(speaker!=='서술')row.append(node('strong','',speaker));row.append(node('p','',text));body.append(row);}
   const actions=[];const complete=fn=>()=>{if(!(commit?commit(fn):fn()))g.toast('대화 상대 가까이에서 다시 이야기하세요.');refresh();};
   if(scene.phase==='offer')actions.push({label:'맡겠습니다',run:complete(()=>g.acceptStoryQuest(scene.eventId))});
   if(scene.phase==='report')actions.push({label:'결과를 전한다',run:complete(()=>g.reportStoryQuest(scene.eventId))});
   if(scene.phase==='scene')actions.push({label:scene.eventId==='four-principles'?'배워 보겠습니다':scene.pointId?.includes('table')||scene.pointId?.includes('mark')?'흔적을 확인한다':'이야기를 마친다',run:complete(()=>g.storyAction(scene.eventId))});
   if(scene.pointId==='master'&&g.worldState.martialTraining.introduced){actions.push({label:'무공 수련',secondary:true,run:()=>training()});if(g.area==='yeoul'&&g.worldState.exclusiveStory.completed.includes('murim-rescue')&&!g.worldState.exclusiveFollowup)actions.push({label:'후속 운용을 배우고 싶습니다',secondary:true,run:()=>{g.startFollowupPractice();refresh();}});}
   actions.push({label:scene.phase==='ambient'?'대화 마치기':'잠시 생각한다',secondary:true});show(scene.title,body,actions,'system',scene.speaker+'와의 대화');
  }
  function records(){const g=game(),body=node('section','exclusive-journal');for(const [world,label]of [['reality','현실의 수첩'],['murim','무림의 수첩']]){body.append(node('h3','',label));for(const id of g.worldState.exclusiveStory.records[world]){const e=root.ExclusiveStory.events.find(e=>e.id===id),entry=node('details','exclusive-record');entry.append(node('summary','',e.title));const lines=F.scenes[id]||F.reportLines[id];entry.append(node('p','',lines?lines.map(([speaker,text])=>speaker+' — '+text).join('\n\n'):e.text));body.append(entry);}}show('두 권의 수첩',body,[{label:'닫기'}]);}
  function start(){game().toast('민재가 회수 대기소에서 기다리고 있다. 금빛 표식을 따라 가까이 가서 이야기를 듣자.');refresh();}
  return {start,resume:open,openScene:open,openDialogue,openTravel:open,openRecords:records,get active(){return false;},get replay(){return false;}};
 }
 root.ExclusiveStoryUI={create};
})(globalThis);
