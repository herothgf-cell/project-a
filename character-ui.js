(function(root){'use strict';root.CharacterUI={create({game,show,node,grid,refresh=()=>{},openSection=()=>{}}){
 function open(world=WorldGrowth.worldOf(game())){
  const g=game(),s=WorldGrowth.stats(g,world),w=g.worldGrowth[world],name=world==='murim'?'무림':'현실',body=node('section','growth-screen character-screen'),tabs=node('nav','growth-tabs character-tabs');
  for(const [id,label]of [['overview','개요'],['growth','성장'],['skills','무공']]){const b=node('button','secondary',label);b.setAttribute('aria-pressed',String(id==='overview'));b.onclick=()=>id==='overview'?open(world):openSection(id);tabs.append(b);}body.append(tabs);
  const compare=node('nav','world-comparison');for(const [id,label]of [['reality','현실 비교'],['murim','무림 비교']]){const b=node('button','secondary',label);b.onclick=()=>open(id);b.setAttribute('aria-pressed',String(id===world));compare.append(b);}body.append(compare,node('h3','',name+' 능력치'),node('p','','현재 전투 세계: '+(WorldGrowth.worldOf(g)==='murim'?'무림':'현실')+' · 비교는 이동이나 장착을 변경하지 않습니다.'),grid([['레벨',w.level],['경험치',w.xp+' / '+s.next],['최대 체력',s.hp],[world==='murim'?'최대 내력':'최대 자원',s.mp],['공격력',s.attack],['공식 등급','E급 헌터']]));
  if(world==='reality'){
   const b=g.achievementBonuses();body.append(node('h3','','귀환으로 몸에 남은 성장'),node('p','stat-origin',`세계 기본 성장 + 정착 성취: 체력 +${b.hp} · 자원 +${b.mp} · 공격력 +${b.attack}`),node('h3','','현실에서 맡은 역할'),node('p','',WorldReports.role(g).name+' · '+WorldReports.role(g).objective),node('p','','현장 자격: '+WorldReports.role(g).qualification));
  }
  const details=node('details'),summary=node('summary','','능력치 계산과 다음 성장');details.append(summary,node('p','','기본 체력 120 · 자원 80 · 공격력 16. 레벨마다 +18 / +5 / +3.'),node('p','',world==='murim'?'백련 수련과 경지 보상은 무림에 적용됩니다.':'첫 기연의 공통 신체 성장과 정착 성취가 더해집니다. 계열을 추가로 얻어도 첫 보너스는 반복 지급되지 않습니다.'));body.append(details);
  show('캐릭터 · 개요',body,[{label:'돌아가기',secondary:true}],'hero','현재 능력과 현장 역할');if(world==='reality'){const unread=g.unreadNews('status');for(const item of unread)g.readNews(item.id);if(unread.length)refresh();}
 }return {open};}};})(globalThis);
