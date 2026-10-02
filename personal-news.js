(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.PersonalNews=api;})(globalThis,function(){
 'use strict';const names={ripple:'파문검',echo:'잔영보',seal:'경계봉인'};
 function realmReady(g){return !g.journey.realm&&Object.values(g.worldGrowth.murim.mastery).reduce((a,b)=>a+b,0)>=8&&g.journey.worlds.length>=2&&g.journey.known.length>0;}
 function catalog(g){const out=[],add=(id,section,subject,title,text)=>out.push({id,section,subject,title,text});
  for(const f of g.revision.inherited)add('inherit:'+f,'skills',f,names[f]+' 계승','무림의 호흡을 계승했습니다. 현실로 귀환하면 대응 기술을 따로 장착할 수 있습니다.');
  for(const k of g.journey.known)add('interpret:'+k,'skills',k,'새 무공 해석','무공에서 해석의 효과를 확인하고 직접 장착하세요.');
  if(g.training>0)add('mode:unlocked','growth','mode','심법과 현실 운용 개방','성장에서 유수·집중 심법과 현실 회복·집중 운용을 선택할 수 있습니다.');
  if(realmReady(g)||g.journey.realm)add('realm:ready','growth','realm','첫 경지 돌파 가능','무림 거점의 성장 화면에서 조건을 확인하고 직접 돌파하세요.');
  if(g.laterStory?.dualBreath)add('mode:dual','growth','mode','심법 심화 달성','서로 다른 계열의 실제 효과를 연결해 적의 재생을 끊습니다.');
  for(const f of g.worldState.reality?.settled||[])add('response:'+f,'skills',f,'현실 대응 정착','무림의 원리를 현실의 몸으로 실제 사용했습니다.');
  if(g.worldState.reports?.reported.includes('first-response'))add('role:first-response','status','role','초동 대응자 · 현장 성과 인정','기연 귀환 후 현실 위협을 제압하고 서린에게 보고했습니다. 기지에서 1회 회복약 보급을 받습니다. 공식 헌터 등급은 E급입니다.');
  if(g.worldState.reports?.reported.includes('yeonhwa-rescued'))add('role:rescue','status','role','핵심 수행자 · 구조 성과 보고','직접 확인한 구조 결과를 전했습니다. 기지 보급과 후속 공동 조사로 이어집니다.');
  if(g.laterStory?.six===5)add('role:joint','status','role','공동 대응 제안자','7장 준비에서 대피 통로 또는 정예 차단을 선택하면 현재 전장의 조건이 바뀝니다.');
  for(const r of g.worldState.achievements?.results||[])add('return:'+r.id,r.unlocked?'skills':'status',r.unlocked||r.id,'귀환 성과 · '+(r.unlocked?names[r.unlocked]+'의 현실 대응':r.id==='inherit:first'?'첫 기연의 신체 성장':r.id),'체력 '+r.before.hp+' → '+r.after.hp+' · 자원 '+r.before.mp+' → '+r.after.mp+' · 공격력 '+r.before.attack+' → '+r.after.attack+(r.unlocked?'\n무공에서 현실 대응을 선택해 장착하세요.':''));
  return out;
 }
 function publish(g,item){if(!catalog(g).some(x=>x.id===item.id)||JSON.stringify(item).length>2048)throw Error('허용되지 않은 소식');const s=g.worldState.news;if(s.items.some(x=>x.id===item.id))return false;s.items.push({id:item.id,at:g.playTime,read:false});return true;}
 function refresh(g){for(const item of catalog(g))publish(g,{id:item.id});}
 function list(g){const c=catalog(g);return g.worldState.news.items.map(x=>({...c.find(y=>y.id===x.id),...x})).sort((a,b)=>b.at-a.at||b.id.localeCompare(a.id));}
 function read(g,id){const item=g.worldState.news.items.find(x=>x.id===id);if(!item)return false;item.read=true;return true;}
 function unread(g,section){return list(g).filter(x=>!x.read&&(!section||x.section===section));}
 function validate(g){const s=g.worldState.news,c=catalog(g);if(!s||!Array.isArray(s.items)||s.items.length>60||new Set(s.items.map(x=>x.id)).size!==s.items.length||s.items.some(x=>!c.some(y=>y.id===x.id)||typeof x.read!=='boolean'||!Number.isFinite(x.at)||x.at<0||x.at>g.playTime))throw Error('소식 읽음 기록 오류');g.worldState.news={items:s.items.map(x=>({id:x.id,read:x.read,at:x.at}))};}
 return {realmReady,catalog,publish,refresh,list,read,unread,validate};
});
