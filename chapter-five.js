/* A fifth chapter validates a self-discovered interpretation in the other world. */
(function(root,f){const n=typeof module==='object'&&module.exports,x=f(n?require('./cultivation.js'):root.CultivationRules);if(n)module.exports=x;else root.ChapterFiveRules=x;})(globalThis,function(api){
 'use strict';const {Game,AREAS,Data:D,state:S,runtime:R,record,active,dist}=api,P=Game.prototype;
 const old=Object.fromEntries(['enter','interact','objective','target','step','reward'].map(k=>[k,P[k]]));
 const dialog=(title,text,portrait='hero')=>({type:'dialog',title,text,portrait});
 const direct=g=>!!(g.worldGrowth||S(g).directProgression);
 function fieldObjective(g){const s=S(g);if(!s.phase&&g.chapter4?.phase!==4&&g.area!=='archive')return null;const points=g.points();let target,text;
  if(g.area==='archive'){target=points.find(p=>p.id==='exit');text='청운촌으로 돌아가 현재 임무를 이어가세요.';}
  else if(g.area==='station'){const enemy=g.enemies.filter(e=>e.hp>0).sort((a,b)=>Number(a.boss)-Number(b.boss)||dist(a,g.player)-dist(b,g.player))[0];target=s.phase>=4?points.find(p=>p.id==='exit'):enemy?{...enemy,label:enemy.name,kind:'enemy'}:points.find(p=>p.id==='station-reset');text=s.phase>=4?'현장 확보 완료 · 현실 기지의 서린에게 보고하세요.':s.measured?'대응 성공 · 남은 위협과 우두머리를 제압하세요.':'도겸의 엄호를 받으며 일반 검격·회피로 기록을 지키고 우두머리를 제압하세요.';}
  else if(AREAS[g.area].safe){target=points.find(p=>p.id===(g.area==='city'?'warden':'portal'));text=s.phase===0||s.phase===1?'청운촌의 연화와 백련에게 귀환 결과를 전한 뒤 현실 기지의 서린을 만나세요.':s.phase===2?'현실 기지의 서린에게 현장 임무를 받으세요.':s.phase===3?'현실 던전 입구에서 공명 관측소를 선택하세요.':s.phase===4?'현실 기지의 서린에게 확보 결과를 보고하세요.':'서린에게 후속 임무를 확인하세요.';}
  return target?{title:'제5장 · 공명 관측소 확보',text,target,chapter:5}:null;
 }
 function companion(g){R(g).companion=null;}
 function finish(g){const s=S(g);if(s.phase===3&&s.boss&&(s.measured||g.worldState?.planB)){s.measured=true;s.phase=4;g.emit('victory',{title:direct(g)?'공명 관측소 확보':'기록이 뒤늦게 따라왔다',text:direct(g)?'적의 공격에 대응하고 우두머리를 제압했습니다.\n현실 기지의 서린에게 돌아가 현장 확보를 보고하세요.':'장치가 멈춘 뒤에도 당신의 새 호흡은 현실에 남았다.\n무공을 받은 일이 아니라, 이미 있던 힘을 직접 재현한 일이다.\n서린에게 돌아가 관측 기록을 보여 주자.',portrait:'hunter'});}}
 P.onStationResponse=function(event){const s=S(this),e=event?.target;if(!direct(this)||this.area!=='station'||s.phase!==3||!event.manual||!['signature1','signature2'].includes(event.action)||!e||!this.enemies.includes(e)||e.trial||e.assessment||e.comparison||e.boss&&this.bossLocked())return false;s.measured=true;finish(this);return true;};
 P.onInterpretation=function(key,e){const s=S(this);if(!direct(this)&&this.area==='station'&&s.phase===3&&s.facts.some(f=>f.id==='station-sense')&&this.enemies.some(x=>x.id===e.id)){s.measured=true;finish(this);}};
 P.enter=function(id){const ok=old.enter.call(this,id);if(ok)companion(this);return ok;};
 function objective(g){if(direct(g))return fieldObjective(g);const s=S(g);if(!s.phase&&g.chapter4?.phase!==4&&g.area!=='archive')return null;const points=g.points();let target,text;
  if(g.area==='archive'){target=points.find(o=>o.id==='exit');text=active(g)?'해석 장착 완료 · 출구로 돌아가 본편을 이어가거나 다른 흔적을 자유롭게 탐험하세요.':'스킬 진화 · 표시된 물건을 기감으로 살펴보세요. 휴식은 회복 기능이며, 원할 때 출구로 돌아갈 수 있습니다.';}
  else if(g.area==='station'){const e=g.enemies.filter(e=>e.hp>0).sort((a,b)=>Number(a.boss)-Number(b.boss)||dist(a,g.player)-dist(b,g.player))[0];
   if(!s.facts.some(f=>f.id==='station-sense')){target=points.find(o=>o.id==='station-lens');text='관측 기록 가까이에서 기감(B)을 펼치고, 새로 해석한 무공으로 실제 적을 상대하세요.';}
   else if(s.boss&&!s.measured){target=points.find(o=>o.id==='station-reset');text='관측은 끝나지 않았습니다. 잔류 파형을 재현한 뒤 새 무공을 적에게 실제로 사용하세요.';}
   else {target=e?{...e,label:e.name,kind:'enemy'}:points[0];text=s.measured?'몸의 재현은 확인되었습니다. 남은 위협을 끝내고 서린에게 돌아가세요.':'내가 완성한 Q/R 운용을 실제 적에게 사용해 기록과 비교하세요. 내가 가한 기술의 효과만 증명에 기록됩니다.';}}
  else if(AREAS[g.area].safe){let id='portal';if(g.area==='city')id=s.phase===1?'portal':s.phase===3?'stationGate':'warden';else id=s.phase===1?'archiveGate':s.phase===5&&s.promise?'returned-yeonhwa':'portal';target=points.find(o=>o.id===id);text=s.phase===0?'제4장 이후 · 서린의 관측 기록에 남은 차이를 확인하세요.':s.phase===1?'환서정의 필사본에는 퀘스트 목록에 없는 흔적이 있습니다. 연화도 그날의 일을 기억합니다.':s.phase===2?'새 해석을 현실에서 재현할 차례입니다. 서린과 관측소 출입에 대해 이야기하세요.':s.phase===5?'C급 현장 인증을 받았습니다. 관측소를 재공략하거나 연화에게 후일담을 들을 수 있습니다.':'서린이 기다리는 현실의 공명 관측소로 향하세요.';}
  return target?{title:g.area==='archive'&&!s.phase?'환서정 · 스킬 진화':s.phase===5?'제5장 · 기록에 남긴 나의 호흡':'제5장 · 기록에 없는 귀환자',text,target,chapter:5}:null;
 }
 P.objective=function(){return objective(this)||old.objective.call(this);};
 P.target=function(){return objective(this)?.target||old.target.call(this);};
 P.interact=function(){const o=this.nearestPoint(),s=S(this);if(!o)return old.interact.call(this);
  if(direct(this)){
   if(o.id==='warden'&&this.chapter4?.phase===4){
    if(s.phase===0){s.phase=1;return dialog('서린 · 다음 현장 준비','청운촌에서 연화의 귀환을 확인하고 백련에게 결과를 전해 줘. 준비를 마치면 공명 관측소 임무를 맡길게.','warden');}
    if((s.phase===1&&(this.worldState?.cycleOne?.invited||this.worldState?.cycleOne?.legacyAccess))||s.phase===2){s.phase=3;s.rank='현장 재평가 중';return dialog('서린 · 공명 관측소 확보','현실 던전 입구에서 공명 관측소를 선택해 줘.\n일반 검격·회피 또는 체득한 특별 기술로 위협을 정리하고 기록을 확보해 줘.\n임무를 마치면 내게 돌아와 보고해 줘.','warden');}
    if(s.phase===4){s.phase=5;s.rank='C급 현장 인증';return dialog('서린 · 현장 확보 확인','관측소를 확보했어. C급 현장 인증을 발급할게.\n보급을 정비하고 다시 말을 걸면 다음 임무를 알려 줄게.','warden');}
    return dialog('서린 · 현장 임무',s.phase===1?'청운촌의 연화와 백련에게 귀환 결과를 전하고 돌아와 줘.':s.phase===3?'공명 관측소에서 Q로 공격에 대응하거나 R을 적에게 명중시키고 우두머리를 제압해 줘.':'관측소 재공략 자격은 유지돼. 보급을 정비하고 다음 임무를 확인해 줘.','warden');
   }
   if(o.id==='returned-yeonhwa'&&this.chapter4?.rescued&&s.phase>0)return dialog('연화 · 돌아온 일상','덕분에 무사히 돌아왔어요. 이제 마을과 현실의 사람들도 안심하고 길을 건널 수 있겠네요.','yeonhwa');
   if(o.id==='partner'&&this.area==='station')return dialog('도겸 · 현장 조언','Q는 적의 공격 예고에 맞춰 사용하고, R은 적에게 실제로 명중시켜. 우두머리까지 제압하면 서린에게 보고하자.\n대응할 적이 없다면 입구의 잔류 파형 장치로 다시 시도할 수 있어.','hunter');
  }
  if(o.id==='warden'&&this.chapter4?.phase===4){
   if(s.phase===0){s.phase=1;return dialog('서린 · 기록에 없는 귀환자','부두의 영상과 현장 보고가 서로 맞지 않아요.\n당신이 없던 자리에도 검의 흔적이 남아 있습니다.\n\n이번에는 새 기술을 받아 오는 의뢰가 아니에요. 무림의 환서정에 남은 필사본과 비교해 주세요. 연화 씨는 그날 당신이 어떻게 돌아왔는지 기억하고 있을 거예요.','warden');}
   if(s.phase===1&&active(this))s.phase=2;
   if(s.phase===2){s.phase=3;s.rank='현장 재평가 중';return dialog('서린 · 당신의 몸으로 확인하는 일','당신이 읽어 낸 해석을 장치가 아직 분류하지 못해요.\n공명 관측소의 기록에 기감(B)을 겹쳐 본 뒤, 실제 적에게 그 호흡을 써 보세요.\n\n도겸에게 현장 조언을 들을 수 있습니다. 기존 무공은 약해지거나 잠기지 않습니다. 새 성질이 현실에서도 작동하는지만 확인합시다.','warden');}
   if(s.phase===4){s.phase=5;s.rank='C급 현장 인증';return dialog('서린 · 먼저 움직인 사람','현장의 행동과 기계의 기록이 이제 일치합니다.\n당신의 무공에 이름을 붙인 것은 이 장치가 아니라 당신이에요.\n\nC급 현장 인증 · 관측소 재공략/조사 전리품 활용 가능\n그 힘을 어디에 쓸지는 여전히 당신이 정합니다.\n\n연화에게 돌아가 그 이후의 이야기도 들어 보세요.','warden');}
   return dialog('서린 · 남아 있는 기록',s.phase===5?'관측소의 재공략 자격은 유지됩니다. 기감으로 흔적을 살펴보고 발견한 해석의 운용을 시험해 보세요.':'관찰 수첩에서 발견한 해석을 확인하세요. 관측소에서는 장치 가까이에서 기감(B)을 펼친 뒤 적을 상대해야 합니다.','warden');}
  if(o.id==='returned-yeonhwa'&&this.chapter4?.rescued&&s.phase>0){s.promise=true;record(this,'yeonhwa-letter');const method=api.label[this.chapter4.route];return dialog('연화 · 기다릴 수 있게 된 사람',`그날의 「${method}」, 저는 직접 걸어서 돌아왔어요.\n당신이 자리를 비운 동안 그 일을 종이에 적어 두었습니다. 환서정의 글과 비교해 보세요.\n\n${s.phase===5?'이번에는 당신의 이야기를 제가 기다렸네요. 제가 아는 귀환자는 장치에 적힌 사람이 아니라 저 길을 함께 만든 사람입니다.':'돌아오겠다는 말이 명령이 아니라 약속일 수도 있다는 걸 이제 알아요.'}`,'yeonhwa');}
  if(o.id==='partner'&&this.area==='station')return dialog('도겸 · 현장 조언','장치 가까이에서 기감을 펼치고, 장착한 해석의 실제 효과를 적에게 사용해 보세요.\n\n전투는 직접 진행합니다. 재현할 적이 없다면 입구의 잔류 파형을 이용하세요.','hunter');
  if(o.id==='station-lens')return dialog('엇갈린 관측 기록',s.facts.some(f=>f.id==='station-sense')?'기감과 장치의 흔적을 겹쳐 보았다. 이제 새롭게 해석한 무공을 실제 적에게 사용하면 몸의 기록과 비교할 수 있다.':'장치에 찍힌 파형은 끊겨 있다. 가까이에서 기감(B)으로 보이지 않는 연결을 읽어 보자.');
  if(o.id==='station-reset'){if(this.enemies.some(e=>e.hp>0))return {type:'toast',text:'현재 파형이 남아 있습니다. 먼저 실제 적에게 무공을 재현하세요.'};this.enemies.push({id:'residual',name:'잔류 파형',x:610,y:790,r:20,hp:600,maxHp:600,boss:false,kind:'shade',damage:9,speed:65,cd:1,wind:0,windMax:1,tx:610,ty:790,range:65,flash:0,attacks:0,rewarded:false,residual:true});return {type:'toast',text:'잔류 파형이 나타났다. Q 대응 또는 R 명중을 연습할 대상이며 전리품은 없습니다.'};}
  return old.interact.call(this);
 };
 P.reward=function(e){if(!e||e.hp>0||e.rewarded)return;if(e.residual){e.rewarded=true;return;}
  if(this.area!=='station'||!e.boss)return old.reward.call(this,e);e.rewarded=true;const s=S(this);s.boss=true;s.materials=Math.min(9999,s.materials+3);this.gold=Math.min(999999,this.gold+130);this.xp+=160;
  while(this.level<80&&this.xp>=this.stats().next){this.xp-=this.stats().next;this.level++;}this.xp=Math.min(this.xp,this.stats().next-1);this.toast('기록 사냥꾼 제압 · 마정석 +3');finish(this);if(s.phase===3&&!s.measured)this.toast('재현할 적이 없다면 입구의 잔류 파형 장치를 사용하세요.');
 };
 P.step=function(dt,input={}){const prev=this.playTime,area=this.area,impacts=this.enemies.filter(e=>e.hp>0&&e.wind>0).map(e=>({e,tx:e.tx,ty:e.ty,range:e.range}));old.step.call(this,dt,input);const d=this.playTime-prev;if(d<=0||area!==this.area||area!=='station')return;const c=R(this).companion;if(!c)return;
  c.flash=Math.max(0,c.flash-d);if(c.down>0){c.down-=d;if(c.down<=0){c.hp=100;c.x=this.player.x-35;c.y=this.player.y+25;}return;}
  for(const h of impacts)if(h.e.wind<=0&&h.e.stun<=0&&dist(c,{x:h.tx,y:h.ty})<h.range){const ward=R(this).guard;c.hp=Math.max(0,c.hp-Math.ceil(h.e.damage*(ward&&dist(c,ward)<ward.radius?.45:.7)));c.flash=.2;}
  if(c.hp<=0){c.down=10;this.toast('도겸이 숨을 고릅니다 · 임무 실패 없음');return;}
  const delta=dist(c,this.player);c.walking=delta>80;c.face=Math.atan2(this.player.y-c.y,this.player.x-c.x);if(c.walking)this.move(c,Math.cos(c.face)*180*d,Math.sin(c.face)*180*d);
  c.cd-=d;const target=this.enemies.find(e=>e.hp>0&&dist(c,e)<320&&this.lineClear(c,e)&&!(e.boss&&this.bossLocked()));if(c.cd<=0&&target){c.cd=2.6;c.face=Math.atan2(target.y-c.y,target.x-c.x);this.strike(target,Math.round(this.stats().attack*.4),'companion');this.effect('partner-shot',c.x,c.y-30,{tx:target.x,ty:target.y-25,life:.45,max:.45});}
 };
 return {...api};
});
