(function(root){'use strict';root.DevelopmentUI={create({game,show,node,refresh,notes,close,character,news,history}){
 const names={ripple:'파문검',echo:'잔영보',seal:'경계봉인'};
 function button(parent,label,fn,disabled=false){const b=node('button','secondary',label);b.disabled=disabled;b.onclick=fn;parent.append(b);return b;}
 function open(section='growth',subject=null){const g=game();if(g.introActive)return;g.refreshNews();const world=WorldGrowth.worldOf(g),murim=world==='murim',w=g.worldGrowth[world],safe=DualWorld.AREAS[g.area].safe,body=node('section','growth-screen development-screen'),nav=node('nav','growth-tabs');
  body.dataset.section=section;nav.classList.add('character-tabs');const tabs=[];button(nav,'개요',()=>character.open()).setAttribute('aria-pressed','false');for(const [id,label]of [['growth','성장'],['skills','무공']]){const b=button(nav,label,()=>open(id));b.setAttribute('aria-pressed',String(section===id));tabs.push({id,label,b});}body.append(nav);
  function updateBadges(){for(const {id,label,b}of tabs){const count=g.unreadNews(id).length;b.querySelector('.news-dot')?.remove();b.classList.toggle('has-news',count>0);b.setAttribute('aria-label',label+(count?' · 새 소식 '+count+'개':''));if(count){const dot=node('span','news-dot');dot.setAttribute('aria-hidden','true');b.append(dot);}}}
  updateBadges();
  function readDetail(id){let changed=false;for(const item of g.unreadNews(section))if(item.subject===id){g.readNews(item.id);changed=true;}if(changed){refresh();updateBadges();}}
  if(section==='growth'){
   body.append(node('h3','',murim?'심법 · 호흡의 운용':'현실 운용 · 자원 사용'),node('p','',murim?'유수심법은 호흡 사이 회복, 집중심법은 호흡 후 수동 검격 강화.':'회복 운용은 기술 사이 자원 회복, 집중 운용은 호흡 후 수동 타격 강화.'));
   for(const [mode,label]of [['flow',murim?'유수심법':'회복 운용'],['focus',murim?'집중심법':'집중 운용']])button(body,label+(w.mode===mode?' · 운용 중':''),()=>{g.setBreath(mode);g.readNews('mode:unlocked');refresh();open();},!safe||g.training<1||w.mode===mode);
   body.append(node('p','','회복: 1.2초 기술을 쉬면 초당 회복 +3. 집중: 1.4초 호흡 후 수동 타격에 자원 6, 피해 1.2배.'),node('h3','','첫 경지 돌파'),node('p','',g.journey.realm?'무림의 이류 경지 · 체력 +12 / 내력 +8 / 공격력 +2':'무림 숙련 합계 8 · 두 세계 실전 · 직접 발견한 해석 1개가 필요합니다.'));
   const total=Object.values(g.worldGrowth.murim.mastery).reduce((a,b)=>a+b,0);body.append(node('p','',`무림 실전 숙련 ${total>=8?'충족':'부족'} (${total}/8) · 두 세계 실전 ${g.journey.worlds.length>=2?'충족':'필요'} · 직접 발견한 해석 ${g.journey.known.length?'충족':'필요'}`));
   const realmButton=button(body,g.journey.realm?'첫 돌파 완료':murim?'경지 돌파 실행':'무림 거점에서 경지 돌파',()=>{g.breakthrough();g.readNews('realm:ready');refresh();open();},!murim||!safe||!g.realmReady());realmButton.classList.add('primary');realmButton.classList.remove('secondary');
   const deep=node('div','deepening-state');deep.append(node('h4','','심법 심화 · '+(g.laterStory?.dualBreath?'체득 완료':'미체득')),node('p','',g.laterStory?.dualBreath?'연계 강화: 유수는 공통 타격과 기연 대응을 4초 내 연결합니다. 집중은 1.4초 호흡 후 수동 검격 → 대응 기술로 잇습니다. 실제 성공으로 재생을 6초 끊습니다.':'6장의 현장 관찰과 백련의 조언을 실제 운용으로 이어 가면 체득합니다.'));
   if(g.laterStory?.dualBreath)button(deep,g.dualAssist?'연계 시간 보조 · 8초':'연계 시간 보조 · 4초',()=>{g.dualAssist=!g.dualAssist;refresh();open();});
   body.insertBefore(deep,body.querySelectorAll('h3')[1]);
   if(!safe)body.append(node('p','','변경과 돌파는 안전한 거점에서 실행할 수 있습니다.'));
  }else{
   body.append(node('h3','',murim?'무림 무공 · 계승과 해석':'현실 대응 · 별도 장착'),node('p','',murim?'배운 동작과 직접 발견한 해석을 운용합니다.':'무림의 원리가 현실의 몸에 맞는 다른 기술이 됩니다. 장착 후 실제 효과에 성공하면 정착됩니다.'));
   if(murim){body.append(MartialTree.create({g,node,close,refresh,notes,subject,onDetail:readDetail}));}
   else {if(!g.revision.inherited.length)body.append(node('p','','아직 계승한 기연이 없습니다. 기본 타격과 회피로 현장을 살펴보세요.'));for(const family of [...g.revision.inherited].sort((a,b)=>Number(b===w.equipped)-Number(a===w.equipped))){const card=node('article','world-card'),status=g.realityStatus(family);card.dataset.subject=family;card.append(node('h3','',names[family]+' → '+RealitySkills.table[family][0][0]),node('p','',status==='locked'?'무림에서 현실로 귀환하면 열립니다.':status==='settled'?'실전 대응 정착 완료':'장착 가능 · 실제 대응 성공으로 정착'));for(const [i,row]of RealitySkills.table[family].entries())card.append(node('p','',Controls.key(['signature1','signature2','ultimate'][i])+' · '+row[0]+' — '+row[5]));button(card,w.equipped===family?'현재 장착 중':'현실 대응 장착',()=>{g.equipReality(family);g.readNews('inherit:'+family);g.readNews('return:inherit:'+family);refresh();open('skills',family);},!safe||status==='locked'||w.equipped===family);body.append(card);readDetail(family);}button(body,'대응 비교 전투 · 처치 보상 없음',()=>{close();g.beginComparison();refresh();},g.area!=='city'||!w.equipped);}
   if(!murim&&JourneyData.variants[subject]&&g.journey.known.includes(subject)){const v=JourneyData.variants[subject],detail=node('article','world-card');detail.dataset.interpretation=subject;detail.append(node('h3','',v.name),node('p','','무림에서 발견한 해석 · 무림 무공에 적용'),node('p','',v.description),node('p','','현실에서는 별도 대응 기술을 장착합니다. 무림으로 돌아가 무공 화면에서 이 해석을 변경할 수 있습니다.'));body.append(detail);readDetail(subject);}
   body.append(node('h3','','현재 세계 숙련'));for(const [family,value]of Object.entries(w.mastery)){if(family!=='sword'&&!g.revision.inherited.includes(family))continue;const percent=[5,10,20,30].filter(n=>value>=n).length*3;body.append(node('p','',(names[family]||'공통 검술')+' '+value+'/30 · 피해 +'+percent+'%'));}button(body,'발견한 해석 확인',()=>notes.open('styles'));
  }
  if(section==='growth'){readDetail('mode');readDetail('realm');}
  let group=null;for(const child of [...body.children]){if(child===nav)continue;if(child.tagName==='H3'){group=node('section','development-section');body.insertBefore(group,child);}if(group)group.append(child);}
  show(section==='growth'?'성장 · 지금 할 수 있는 행동':'무공 · 세계별 운용',body,[{label:'돌아가기',secondary:true}],'hero',murim?'무림 성장':'현실 성장');
 }
 return {open};
}};})(globalThis);
