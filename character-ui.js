/* Character owns stat inspection and draft allocation; the app owns persistence. */
(function(root){'use strict';root.CharacterUI={create({game,show,node,refresh=()=>{},commit=()=>false}){
 const R=BoundaryResonance,A=Advancement,W=WorldGrowth;
 const sum=a=>Object.values(a).reduce((n,v)=>n+v,0),fmt=n=>String(Math.round(n*100)/100);
 const names={crystal:'공명 결정',hunter:'헌터 훈련 포인트',realm:'경지 특화 포인트'};
 let world='reality',source='crystal',draft=null,body=null,message='',pendingLeave=null,history=false;
 const allocation=()=>source==='crystal'?R.describe(game()).allocation:A.describe(game(),source).allocation;
 const dirty=()=>!!draft&&Object.keys(draft).some(k=>draft[k]!==allocation()[k]);
 const connected=()=>!!body?.isConnected;
 function button(label,run,{disabled=false,key=label,primary=false}={}){
  const b=node('button',primary?'primary':'secondary',label);b.type='button';b.disabled=disabled;b.dataset.characterFocus=key;
  b.onclick=()=>{const focused=document.activeElement===b;run();if(focused&&connected()&&!pendingLeave)body.querySelectorAll('[data-character-focus]').forEach(x=>{if(x.dataset.characterFocus===key&&!x.disabled)x.focus({preventScroll:true});});};return b;
 }
 function context(){
  const g=game(),r=R.describe(g),a=source==='crystal'?null:A.describe(g,source),old=a?.allocation||r.allocation;
  const available=a?.points.available??r.balance.crystal,total=sum(draft||old),used=sum(old),cap=source==='crystal'?r.limits:null;
  const safe=source==='crystal'?r.safe:g.area===(source==='realm'?'village':'city')&&!g.introActive&&!g.trial&&!g.advancementTrial&&g.player.hp>0&&!g.enemies?.some(e=>e.hp>0);
  return {g,r,a,old,available,total,used,cap,safe,remaining:available+used-total};
 }
 function reset(nextWorld,nextSource){world=nextWorld;source=nextSource;draft={...allocation()};pendingLeave=null;history=false;message='';render();}
 function open(nextWorld=W.worldOf(game()),nextSource){nextWorld=nextWorld==='murim'?'murim':'reality';nextSource=nextWorld==='murim'?'realm':nextSource==='hunter'?'hunter':'crystal';return requestLeave(()=>reset(nextWorld,nextSource));}
 function requestLeave(run){if(!connected()||!dirty()){pendingLeave=null;run();return true;}pendingLeave=run;render();body.querySelector('[data-character-focus="keep-editing"]')?.focus({preventScroll:true});return false;}
 function apply(){
  const c=context();if(!dirty()||!c.safe)return false;
  const next={...draft};let ok=false;try{ok=commit(g=>source==='crystal'?R.allocate(g,next):A.allocate(g,source,next))===true;}catch{ok=false;}
  if(ok){draft={...allocation()};message='저장됨 · 배분을 적용했습니다.';refresh();}else message='저장하지 못했습니다. 보유량과 스탯은 유지되며 초안을 다시 확정할 수 있습니다.';
  render();return ok;
 }
 function rows(){return source==='hunter'?[['attack','공격',1.5],['hp','최대 생명',8],['speed','이동 속도',1]]:[['attack','공격',source==='crystal'?1:1.5],['hp','최대 생명',source==='crystal'?6:8],['mp','최대 기력',source==='crystal'?3:5]];}
 function openProvenance(){
  const trigger=body.querySelector('[data-character-focus="provenance"]'),{g,r}=context(),s=W.stats(g,world),popup=node('dialog','character-provenance-dialog'),title=node('h3','','스탯 출처');
  title.id='character-provenance-title';popup.setAttribute('aria-labelledby',title.id);popup.append(title);
  const advanced=A.bonus(g,world),passive=PassiveGrowth.bonus(g,world),legacy=world==='reality'?(g.achievementBonuses?.()||{attack:0,hp:0,mp:0}):{attack:0,hp:0,mp:0},res=world==='reality'?r.bonus:{attack:0,hp:0,mp:0},table=node('div','character-provenance');
  for(const [label,v]of [['기본 / 레벨 / 기본 수련',{attack:s.attack-advanced.attack-(passive.attack||0)-legacy.attack-res.attack,hp:s.hp-advanced.hp-passive.hp-legacy.hp-res.hp,mp:s.mp-advanced.mp-passive.mp-legacy.mp-res.mp}],['기존 성취',legacy],['공명 결정',res],['심법',passive],['경지 / 훈련',advanced]])table.append(node('p','',label+' · 공격 '+fmt(v.attack||0)+' / 생명 '+fmt(v.hp||0)+' / 기력 '+fmt(v.mp||0)));
  const close=()=>{popup.close();popup.remove();if(trigger.isConnected)trigger.focus({preventScroll:true});},dismiss=node('button','secondary','닫기');dismiss.type='button';dismiss.onclick=close;popup.append(table,dismiss);
  popup.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'||e.key.startsWith('Arrow')){e.preventDefault();dismiss.focus();}});
  popup.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();close();});body.append(popup);popup.showModal();dismiss.focus();
 }
 function historyToggle(){
  history=!history;if(history&&source==='crystal'){
   const unread=game().unreadNews?.('status')?.filter(n=>n.subject==='crystal')||[];
   if(unread.length){let ok=false;try{ok=commit(g=>{for(const item of unread)g.readNews(item.id);return true;})===true;}catch{}
    if(ok)refresh();else message='획득 내역은 열었지만 읽음 상태를 저장하지 못했습니다.';
   }
  }render();
 }
 function render(){
  const c=context(),{g,r,old,available,total,used,cap,safe,remaining}=c,s=W.stats(g,world),w=g.worldGrowth[world],actual=W.worldOf(g);
  draft||={...old};body=node('section','character-screen profile-screen character-growth');body.dataset.world=world;
  const more=node('section','character-more'),toolbar=node('div','character-toolbar');
  const nav=node('nav','character-worlds');nav.setAttribute('aria-label','세계별 캐릭터');
  for(const [id,label]of [['reality','현실'],['murim','무림']]){const b=button(label,()=>open(id),{key:'world-'+id});b.setAttribute('aria-label',label+' 캐릭터');b.setAttribute('aria-pressed',String(id===world));nav.append(b);}
  const identity=node('header','character-identity');identity.append(node('h3','','윤서'),node('span','','Lv. '+w.level),node('span','',world==='reality'?A.describe(g,'hunter').name+'급 헌터':A.describe(g,'realm').name));toolbar.append(identity,nav);body.append(toolbar);more.append(node('p','character-location','조회: '+(world==='reality'?'현실':'무림')+' · 현재 위치: '+(root.WorldGame?.AREAS?.[g.area]?.name||root.DualWorld?.AREAS?.[g.area]?.name||({city:'현실 기지',village:'청운촌'}[g.area])||g.area)+(actual!==world?' · 다른 세계 조회 중':'')));
  const exp=node('div','profile-exp'),bar=node('progress');bar.max=s.next;bar.value=w.xp;bar.setAttribute('aria-label','경험치');exp.append(node('span','','EXP'),bar,node('span','',w.xp+' / '+s.next));more.append(exp);
  const equipped=w.equipped;more.append(node('p','profile-equipped','장착 무공 · '+(equipped?(world==='reality'?root.RealitySkills?.table?.[equipped]?.[0]?.[0]:root.DualWorld?.Fate?.PATHS?.[equipped]?.name)||R.familyNames[equipped]||'기본 무공':'기본 무공')));
  const details=button('ⓘ',openProvenance,{key:'provenance'});details.classList.add('character-info');details.setAttribute('aria-label','스탯 출처 보기');details.setAttribute('aria-haspopup','dialog');toolbar.insertBefore(details,nav);
  const resources=node('nav','character-resources');resources.setAttribute('aria-label','배분 자원');for(const id of world==='murim'?['realm']:['crystal','hunter']){const b=button(id==='hunter'?'헌터 훈련':names[id],()=>requestLeave(()=>reset(world,id)),{key:'source-'+id});b.setAttribute('aria-label',names[id]);b.setAttribute('aria-pressed',String(source===id));resources.append(b);}
  const wallet=node('section','character-resource'),receipts=node('section','character-resource-extra');const resourceTitle=node('h3','',names[source]);resourceTitle.hidden=world!=='murim';if(world!=='murim')wallet.append(resources);wallet.append(resourceTitle,node('strong','','보유 '+available+'개'));
  if(source==='crystal'){
   const grants=R.state(g)?.grants||[],sources=r.sources.filter(x=>x.crystal>0).sort((a,b)=>grants.indexOf(a.id)-grants.indexOf(b.id)),latest=sources.at(-1),news=g.unreadNews?.('status')?.some(n=>n.subject==='crystal');
   if(news)receipts.append(node('span','character-new','NEW · 새 획득 내역'));
   receipts.append(node('p','',latest?'최근 획득 +'+latest.crystal+' · '+latest.name:'아직 공명 결정을 획득하지 않았습니다.'));
   const hb=button(history?'획득 내역 접기':'획득 내역',historyToggle);hb.setAttribute('aria-expanded',String(history));receipts.append(hb);
   if(history){const list=node('div','character-receipts');for(const x of sources)list.append(node('p','',x.name+' · 결정 +'+x.crystal));if(!sources.length)list.append(node('p','','획득 내역이 없습니다.'));receipts.append(list);}
   if(available===0){const state=R.state(g),next=R.catalog(g).find(x=>x.crystal>0&&!state?.grants.includes(x.id)&&!state?.legacy.includes(x.id));receipts.append(node('p','character-next-source',next?'다음 미수령 획득처: '+next.name+' · 결정 +'+next.crystal:'현재 모든 공명 결정 출처를 수령했습니다.'));}
  }else{receipts.append(node('p','','확정한 '+(source==='realm'?'경지':'헌터 등급')+' 보상 · 총 '+c.a.points.total+'개 / 투자 '+used+'개'));if(!available)receipts.append(node('p','character-next-source',c.a.nextName?'다음 포인트: '+c.a.nextName+(source==='realm'?' 경지 돌파 확정':'급 평가 후 서린 보고')+' · +2':'모든 단계 보상을 받았습니다.'));}body.append(wallet);more.prepend(receipts);
  if(!safe)more.append(node('p','character-notice',source==='crystal'?'공명 결정은 보관 중입니다. 현실 기지에서 배분할 수 있습니다. 미리보기만 가능합니다.':(source==='realm'?'청운촌':'현실 기지')+'의 안전한 상태에서 확정할 수 있습니다. 미리보기만 가능합니다.'));
  if(cap){more.append(node('p','character-limits','공격 '+(draft.attack+cap.legacyAttack)+'/'+cap.attack+' · 총 투자 '+(total+cap.occupied)+'/'+cap.total),node('small','',cap.next));if(cap.occupied)more.append(node('p','character-notice','이전 고정 성취는 상한에 포함되며 환불되지 않습니다. 공격 +'+r.legacy.attack+' · 생명 +'+r.legacy.hp+' · 기력 +'+r.legacy.mp));}

  const editor=node('div','character-allocation');editor.setAttribute('aria-label','현재 스탯과 배분 미리보기');
  const editable=rows(),allRows=[...editable];if(source==='hunter')allRows.splice(2,0,['mp','최대 기력',0]);
  for(const [key,label,unit]of allRows){
   const row=node('div','character-allocation-row');row.dataset.stat=key;
   const canEdit=editable.some(([k])=>k===key),change=canEdit?draft[key]-old[key]:0,current=key==='speed'?A.bonus(g,world).speed*100:s[key],after=current+change*unit,suffix=key==='speed'?'%':'';
   const copy=node('div','character-stat-copy'),title=node('strong','',key==='attack'?'공격력':key==='speed'?'이동 속도 보너스':label),values=node('div','character-stat-values');
   const now=node('span','character-current',fmt(current)+suffix);now.setAttribute('aria-label','현재 '+fmt(current)+suffix);
   const preview=node('span','character-after',change?fmt(after)+suffix+' ('+(change>0?'+':'')+fmt(change*unit)+suffix+')':'변경 없음');preview.setAttribute('aria-label',change?'배분 후 '+fmt(after)+suffix:'배분 변경 없음');row.dataset.changed=String(change!==0);
   values.append(now,node('span','character-value-arrow','→'),preview);copy.append(title,values);
   if((key==='hp'||key==='mp')&&(actual!==world||g.player[key]<s[key]))title.append(node('small','character-vital',actual===world?'잔여 '+fmt(g.player[key]):'다른 세계 조회 중'));
   row.append(copy);
   if(canEdit){const controls=node('div','character-stepper');
    const minus=button('−',()=>{draft[key]--;message='';render();},{disabled:draft[key]<=old[key],key:key+'-minus'});minus.setAttribute('aria-label',label+' 감소');
    const plus=button('+',()=>{draft[key]++;message='';render();},{disabled:remaining<=0||!!cap&&(total+cap.occupied>=cap.total||key==='attack'&&draft.attack+cap.legacyAttack>=cap.attack)||!cap&&draft[key]>=10,key:key+'-plus'});plus.setAttribute('aria-label',label+' 증가');
    const count=node('span','character-draft-count',String(draft[key]));count.setAttribute('aria-label','투자 '+draft[key]+'개');controls.append(minus,count,plus);row.append(controls);
   }else row.append(node('small','character-readonly','공명 결정으로 배분'));
   editor.append(row);
  }body.append(node('p','character-table-caption','현재 → 배분 후 · −/+로 투자 조절'),editor);
  more.append(node('p','character-unit',source==='crystal'?'결정 1개 = 공격 +1 / 최대 생명 +6 / 최대 기력 +3':source==='realm'?'포인트 1개 = 공격 +1.5 / 최대 생명 +8 / 최대 기력 +5':'포인트 1개 = 공격 +1.5 / 최대 생명 +8 / 이동 속도 +1%'));
  const footer=node('div','character-confirm growth-footer');footer.append(node('p','','이번 소비 '+Math.max(0,total-used)+'개'+' · 적용 후 잔량 '+remaining+'개'));
  const label=!safe?(source==='realm'?'청운촌에서 확정':'현실 기지에서 확정'):!dirty()?'배분할 스탯을 선택하세요':(source==='crystal'?'결정 ':'포인트 ')+Math.max(0,total-used)+'개로 배분 확정';footer.firstElementChild.append(node('small','character-permanent','확정 후 환불 · 재배분 불가'));footer.append(button(label,apply,{disabled:!safe||!dirty(),primary:true,key:'apply'}));body.append(footer);
  if(source==='crystal'&&!used&&!cap.occupied)more.prepend(button('첫 정착 추천',()=>{draft={attack:4,hp:4,mp:0};message='추천 초안 · 공격 +4 / 최대 생명 +24';render();},{disabled:available<8}));
  body.append(more);
  if(message){const status=node('p','character-status',message);status.setAttribute('role','status');body.append(status);}
  if(pendingLeave){const run=pendingLeave,panel=node('section','character-confirmation');panel.setAttribute('role','group');panel.setAttribute('aria-label','저장하지 않은 배분 초안');panel.append(node('h3','','배분 초안이 남아 있습니다'),node('p','','이동하기 전에 초안을 어떻게 할지 선택하세요.'),button('배분 확정 후 이동',()=>{if(apply()){pendingLeave=null;run();}},{disabled:!safe,primary:true,key:'leave-apply'}),button('초안 버리기',()=>{draft={...allocation()};pendingLeave=null;run();},{key:'leave-discard'}),button('계속 편집',()=>{pendingLeave=null;render();},{key:'keep-editing'}));body.append(panel);}
  show('캐릭터',body,[],'system','스탯 확인 · 능력치 배분');
  if(pendingLeave)body.querySelector('[data-character-focus="keep-editing"]')?.focus();
 }
 return {open,requestLeave};
}};})(globalThis);
