(function(root){'use strict';root.DevelopmentUI={create({game,show,node,refresh,notes,close,character,news,history}){
 const names={ripple:'파문검',echo:'잔영보',seal:'경계봉인'};
 function button(parent,label,fn,disabled=false){const b=node('button','secondary',label);b.disabled=disabled;b.onclick=fn;parent.append(b);return b;}
 function open(section='growth',subject=null){const g=game();if(g.introActive)return;g.refreshNews();const world=WorldGrowth.worldOf(g),murim=world==='murim',w=g.worldGrowth[world],safe=DualWorld.AREAS[g.area].safe,body=node('section','growth-screen development-screen'),nav=node('nav','growth-tabs');
  for(const [id,label]of [['growth','성장'],['skills','무공']])button(nav,label+(g.unreadNews(id).length?' ●':''),()=>open(id));button(nav,'캐릭터 상태',()=>character.open());button(nav,'소식',()=>news().open());button(nav,'행적',()=>history.open('history'));body.append(nav);
  if(subject){for(const item of g.unreadNews(section))if(item.subject===subject)g.readNews(item.id);refresh();}
  if(section==='growth'){
   body.append(node('h3','',murim?'심법 · 호흡의 운용':'현실 운용 · 자원 사용'),node('p','',murim?'유수심법은 호흡 사이 회복, 집중심법은 호흡 후 수동 검격 강화.':'회복 운용은 기술 사이 자원 회복, 집중 운용은 호흡 후 수동 타격 강화.'));
   for(const [mode,label]of [['flow',murim?'유수심법':'회복 운용'],['focus',murim?'집중심법':'집중 운용']])button(body,label+(w.mode===mode?' · 운용 중':''),()=>{g.setBreath(mode);g.readNews('mode:unlocked');refresh();open();},!safe||g.training<1||w.mode===mode);
   body.append(node('p','','회복: 1.2초 기술을 쉬면 초당 회복 +3. 집중: 1.4초 호흡 후 수동 타격에 자원 6, 피해 1.2배.'),node('h3','','첫 경지 돌파'),node('p','',g.journey.realm?'무림의 이류 경지 · 체력 +12 / 내력 +8 / 공격력 +2':'무림 숙련 합계 8 · 두 세계 실전 · 직접 발견한 해석 1개가 필요합니다.'));
   const total=Object.values(g.worldGrowth.murim.mastery).reduce((a,b)=>a+b,0);body.append(node('p','',`숙련 ${total}/8 · 실전 세계 ${g.journey.worlds.length}/2 · 해석 ${g.journey.known.length}/1`));
   button(body,g.journey.realm?'첫 돌파 완료':murim?'경지 돌파 실행':'무림 거점에서 경지 돌파',()=>{g.breakthrough();g.readNews('realm:ready');refresh();open();},!murim||!safe||!g.realmReady());
   if(g.laterStory?.dualBreath){body.append(node('h3','','쌍계 호흡'),node('p','','유수: 공통 타격과 기연 대응을 4초 내 연결. 집중: 1.4초 호흡 후 수동 검격 → 대응 기술. 실제 성공으로 재생을 6초 끊습니다.'));button(body,g.dualAssist?'연계 시간 보조 · 8초':'연계 시간 보조 · 4초',()=>{g.dualAssist=!g.dualAssist;refresh();open();});}
   if(!safe)body.append(node('p','','변경과 돌파는 안전한 거점에서 실행할 수 있습니다.'));
  }else{
   body.append(node('h3','',murim?'무림 무공 · 계승과 해석':'현실 대응 · 별도 장착'),node('p','',murim?'배운 동작과 직접 발견한 해석을 운용합니다.':'무림의 원리가 현실의 몸에 맞는 다른 기술이 됩니다. 장착 후 실제 효과에 성공하면 정착됩니다.'));
   if(murim){body.append(MartialTree.create({g,node,close,refresh,notes}));}
   else {if(!g.revision.inherited.length)body.append(node('p','','아직 계승한 기연이 없습니다. 기본 타격과 회피로 현장을 살펴보세요.'));for(const family of g.revision.inherited){const card=node('article','world-card'),status=g.realityStatus(family);card.dataset.subject=family;card.append(node('h3','',names[family]+' → '+RealitySkills.table[family][0][0]),node('p','',status==='locked'?'무림에서 현실로 귀환하면 열립니다.':status==='settled'?'실전 대응 정착 완료':'장착 가능 · 실제 대응 성공으로 정착'));for(const [i,row]of RealitySkills.table[family].entries())card.append(node('p','',Controls.key(['signature1','signature2','ultimate'][i])+' · '+row[0]+' — '+row[5]));button(card,w.equipped===family?'현재 장착 중':'현실 대응 장착',()=>{g.equipReality(family);g.readNews('inherit:'+family);g.readNews('return:inherit:'+family);refresh();open('skills',family);},!safe||status==='locked'||w.equipped===family);body.append(card);}button(body,'대응 비교 전투 · 처치 보상 없음',()=>{close();g.beginComparison();refresh();},g.area!=='city'||!w.equipped);}
   body.append(node('h3','','현재 세계 숙련'));for(const [family,value]of Object.entries(w.mastery)){if(family!=='sword'&&!g.revision.inherited.includes(family))continue;const percent=[5,10,20,30].filter(n=>value>=n).length*3;body.append(node('p','',(names[family]||'공통 검술')+' '+value+'/30 · 피해 +'+percent+'%'));}button(body,'발견한 해석 확인',()=>notes.open('styles'));
  }
  show(section==='growth'?'성장 · 지금 할 수 있는 행동':'무공 · 세계별 운용',body,[{label:'돌아가기',secondary:true}],'hero',murim?'무림 성장':'현실 성장');
 }
 return {open};
}};})(globalThis);
