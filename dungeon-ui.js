(function(root,f){const api=f(typeof module==='object'&&module.exports?require('./dungeon-entry.js'):root.DungeonEntry,typeof module==='object'&&module.exports?require('./advancement.js'):root.Advancement);if(typeof module==='object'&&module.exports)module.exports=api;else root.DungeonUI=api;})(globalThis,function(D,A){
 'use strict';return {create({game,node,show,refresh,close,prepare,isOpen=()=>true}){
  let hub=null,detail=false,busy=false,error='',generation=0,panel=null,selectedId=null;
  const button=(label,run,cls='secondary')=>{const b=node('button',cls,label);b.type='button';b.addEventListener('click',e=>{e.stopPropagation?.();if(!busy)run();});return b;};
  function remember(list,g){D.state(g).scroll[hub]=list.scrollTop;}
  function render(){const g=game(),s=D.state(g),rows=D.list(g),assessment=A.entry(g,{entrance:D.hubs[hub]});if(assessment)rows.push(assessment);const selected=rows.find(r=>r.id===(selectedId||s.selected[hub]));panel=node('section','dungeon-screen'+(detail?' dungeon-detail-open':''));panel.setAttribute('aria-busy',String(busy));
   const list=node('div','dungeon-list');list.setAttribute('aria-label','목적지 목록');
   for(const row of rows){const b=button('',()=>{remember(list,g);selectedId=row.id;if(!row.assessment&&!row.resonance){s.selected[hub]=row.id;D.markSeen(g,row.id);}detail=true;error='';render();},'dungeon-row');b.setAttribute('aria-pressed',String(selected?.id===row.id));b.append(node('strong','',row.name),node('span','dungeon-status',(row.current?(row.resonance?'성장 목표 · ':'현재 임무 · '):'')+row.statusText));b.disabled=busy;list.append(b);}
   list.addEventListener('scroll',()=>remember(list,g));
   const body=node('section','dungeon-detail');body.append(button('목록으로',()=>{detail=false;render();},'secondary dungeon-back'));
   if(selected){body.append(node('h3','',selected.name),node('p','dungeon-status',selected.statusText));for(const [label,value]of [['목적',selected.purpose],['위협 특징',selected.threat],['입장 조건',selected.reason||'입장 조건을 충족했습니다.'],['현재 진행',selected.report?'현장 목표 완료 · 담당 인물에게 보고하세요.':selected.completed?'공략을 완료한 지역입니다.':'현장에서 현재 목표를 확인하세요.']])if(value)body.append(node('h4','',label),node('p','',value));if(selected.requirements)for(const requirement of selected.requirements)body.append(node('p','', (requirement.met?'✓ ':'○ ')+requirement.text));if(selected.rewardPolicy){const more=node('details');more.append(node('summary','','보상과 재방문 안내'),node('p','',selected.rewardPolicy));body.append(more);}}
   else body.append(node('p','','목적지를 선택하고 상세를 확인한 뒤 입장하세요.'));
   if(error){const warning=node('p','dungeon-error',error);warning.setAttribute('role','alert');body.append(warning);}if(busy)body.append(node('p','','지역 준비 중…'));
   panel.append(list,body);const actions=[{label:busy?'입장 준비 중…':error?'다시 입장하기':selected?.assessment?'시련·평가 시작':'입장하기',disabled:busy||!selected?.canEnter,run:enter},{label:'닫기',secondary:true,run:cancel}];
   show(hub==='city'?'현실 던전 선택':'무림 탐험지 선택',panel,actions,'system','던전 입구');list.scrollTop=s.scroll[hub]||0;if(detail){body.tabIndex=-1;body.focus({preventScroll:true});}
  }
  async function enter(){if(busy)return;const g=game(),id=selectedId||D.state(g).selected[hub],ticket=++generation;busy=true;error='';render();const activePanel=panel;
   const request=id?.startsWith('assessment:')?(g,id,fn)=>A.requestEntry(g,id,fn,{entrance:D.hubs[hub]}):D.request;const result=await request(g,id,async target=>{const ready=await prepare(target);if(ticket!==generation||game()!==g||!isOpen()||activePanel.isConnected===false)throw Error('cancelled');return ready;});
   busy=false;if(ticket!==generation||game()!==g||!isOpen()||activePanel.isConnected===false)return;
   if(result.ok){close();refresh();}else{error=result.reason;render();}
  }
  function cancel(){generation++;busy=false;close();}
  function open(){const g=game();if(!g.worldGrowth)return;hub=D.list(g)[0]?.hub;if(!hub)return;generation++;busy=false;error='';detail=false;selectedId=null;render();}
  return {open,cancel};
 }};
});
