/* v2 narrative and persistent facts layered over the existing combat rules. */
(function(root,f){const api=f(typeof module==='object'&&module.exports?require('./chapter-five.js'):root.ChapterFiveRules);if(typeof module==='object'&&module.exports)module.exports=api;else root.Revision=api;})(globalThis,function(api){
 'use strict';const {Game,AREAS,Fate}=api,P=Game.prototype;
 const old=Object.fromEntries(['save','enter','interact','nearestPoint','points','objective','target','act','emit','step','acceptFate','awaken'].map(k=>[k,P[k]])),load=Game.load;
 const initial=(origin='new')=>({origin,intro:origin==='legacy'?7:0,aid:0,inherited:[],history:[],transfer:0});
 const state=g=>g.revision||(g.revision=initial('legacy'));
 function record(g,id,text,area=g.area){const s=state(g);if(s.history.some(e=>e.id===id))return;s.history.push({id,text,area,at:g.playTime});}
 const rescuePoints=[{id:'intro-wounded',x:400,y:740,label:'백련 · 응급처치',kind:'npc',role:'master'},{id:'intro-shelter',x:480,y:680,label:'처마 아래로 부축하기',kind:'npc',role:'master'}];
 const inIntro=g=>!!g.introActive&&state(g).intro<7;
 const dialogue={
  'warden-4':'서린: 다녀온 얼굴이네. 백련이라는 분은?\n윤서: 괜찮아졌어. 나한테 검 쓰는 법을 가르쳐 줬어.\n서린: 기록부터 남기자. 네가 강해졌다는 말만 믿고 위험한 임무를 줄 순 없으니까.\n윤서: 나도 이쪽에서 되는지 알고 싶어.\n서린: 도겸과 관리국이 주변을 통제할 거야. 외곽의 제한된 현장에서 확인하자. 귀환 신호는 계속 켜 두고.\n\nD급은 균열의 현장 위험도입니다. 윤서의 개인 등급은 E급입니다.',
  'warden-6':'서린: 감시자 잔해에서 검은 인장이 나왔어. 항만에서도 같은 문양이 확인됐고.\n백련에게 이 흔적을 보여 줘. 그쪽 천흔과 무엇이 닮았는지 기록을 맞춰 보자.',
  'warden-10':'서린: 두 침식 닻에서 무림의 천흔과 같은 맥동이 잡혔어.\n항만 출입구를 열어 뒀어. 호위와 두 닻을 해제한 뒤 흑조 집행관을 막아 줘. 이상이 생기면 바로 돌아와.',
  'master-3':'백련: 힘을 크게 쓰려고만 하지 않았구나. 길이 열린 걸 보니 알겠다.\n윤서: 아직 손에 힘이 먼저 들어가요.\n백련: 그래서 다음 호흡이 필요하다. 흐름을 끊지 않고 이어 보거라.\n\n천뢰격 습득 · L / 금화 80\n현실의 서린에게 돌아가 무공의 변화를 보여 주자.',
  'master-7':'백련: 이 문양… 나를 다치게 한 천흔 곁에도 있었다.\n윤서: 현실 균열에서도 나왔습니다.\n백련: 다른 하늘에 같은 흉터라. 우연이라 하기엔 너무 닮았구나.\n월영 폐사의 세 인장은 기운의 흐름을 고르게 하던 장치다. 무엇이 작동을 틀었는지 살펴보거라.\n\n월영 폐사의 호위 → 세 인장 → 수문장 조사'
 };
 P.beginIntro=function(fresh=false){if(fresh)this.revision=initial();const s=state(this);if(s.intro>=7)return false;this.introActive=true;if(s.intro>=2&&s.intro<=4){this.enter('village');Object.assign(this.player,{x:s.aid?430:250,y:s.aid?730:810});}return true;};
 P.advanceIntro=function(){const s=state(this);if(!inIntro(this)||s.intro===3&&s.aid<2)return false;s.intro++;if(s.intro===2){this.enter('village');Object.assign(this.player,{x:250,y:810});}if(s.intro===5)this.enter('city');if(s.intro>=7)this.finishIntro();return true;};
 P.finishIntro=function(){const s=state(this);if(s.origin!=='new'||s.intro>=7&&!this.introActive)return false;s.intro=7;s.aid=2;this.introActive=false;this.progress=Math.max(1,this.progress);this.enter('city');this.events=[];record(this,'intro-rescue','현장 응급처치로 백련을 돕고 귀환했다.','village');record(this,'intro-report','서린에게 청운촌을 보고하고 통로를 확인했다.');return true;};
 P.points=function(){return inIntro(this)&&state(this).intro===3?[rescuePoints[state(this).aid]]:old.points.call(this);};
 P.nearestPoint=function(){if(inIntro(this)){const s=state(this),o=rescuePoints[s.aid];return s.intro===3&&o&&api.dist(this.player,o)<90?o:null;}return old.nearestPoint.call(this);};
 P.act=function(...args){if(inIntro(this))return false;return old.act.apply(this,args);};
 P.step=function(dt,input={}){if(inIntro(this)&&state(this).intro!==3)return;old.step.call(this,dt,input);};
 P.interact=function(){
  const s=state(this);if(inIntro(this)){const o=this.nearestPoint();if(!o)return {type:'toast',text:'백련의 표식 가까이에서 E를 누르세요.'};s.aid++;if(s.aid===2){s.intro=4;return {type:'intro-next'};}return {type:'toast',text:'출혈을 눌렀습니다. 백련을 처마 아래로 부축하세요.'};}
  const progress=this.progress,training=this.training,chapter=this.journey.phase,fate=this.fate.stage,four=this.chapter4.phase,id=this.nearestPoint()?.id,result=old.interact.call(this);
  if(this.training>training)record(this,'training-'+this.training,['','백련과 재회하여 월영참을 배웠다.','죽림의 길을 확보하고 천뢰격을 배웠다.','두 세계의 흔적으로 경계 공명을 완성했다.'][this.training]);
  if(this.journey.phase===5&&chapter!==5)record(this,'certification','새 해석을 현실에서 재현하여 C급 현장 인증을 받았다.');
  if(result?.type==='dialog'&&this.nearestPoint()?.id==='master'&&progress===1&&s.origin==='new')result.text='백련: 돌아왔구나. 네가 감아 둔 천 덕에 제자들이 나를 찾았다.\n윤서: 얼굴은 좀 나아지셨네요. 윤서입니다. 저쪽에서는 헌터 일을 해요.\n백련: 그 길을 계속 오갈 생각이라면, 몸을 지킬 호흡부터 익혀라.\n\n월영참 습득 · K\n회복하는 동안 마을 길을 지킬 수 있도록 흑풍 죽림을 살펴보자.';
  if(result?.type==='dialog'){
   if(dialogue[id+'-'+progress])result.text=dialogue[id+'-'+progress];
   if(id==='warden'&&progress===12){
    if(four===4){result.text=chapter===0?'서린: 네가 한 일을 의심하는 건 아니야. 그런데 영상과 보고가 맞지 않는 이유는 알아야 해.\n그쪽에 남은 기록도 찾아보자. 연화가 적어 둔 글과 환서정의 물건이 도움이 될 거야.':chapter===4?'서린: 관측값도 이제 따라왔네. C급 현장 인증을 발급할게.\n네 개인 등급과는 별개로, 관측소 조사에 참여할 자격이 생긴 거야.\n연화에게도 소식을 전해 줘.':this.journey.phase===3?'서린: 공명 관측소에서 장치 가까이 기감(B)을 펼친 뒤, 적에게 새 해석의 실제 효과를 보여 줘. 도겸이 주변을 살필 거야.':chapter===5?'서린: 돌아왔네. 물이랑 보급을 준비해 뒀어. 관측소 재공략 자격은 그대로야.':'서린: 환서정에서 발견한 해석을 장착하고 돌아와. 확인한 사실은 수첩에서 볼 수 있어.';}
    else if(fate>=6)result.text=four===0?'서린: 네가 관찰한 청운 귀환로의 천흔과 현실 부두 신호가 같은 박자로 흔들려.\n고립된 사람이 돌아올 길부터 찾아보자. 무공을 쓰거나 위쪽 협로의 권양기를 쓸 수 있어.':four===3?'서린: 연화 씨가 돌아갔다는 소식 들었어. 여기 부두에도 같은 흔적이 남았더라.\n다음에 가면 잘 지내는지 보고 와.':'서린: 청운 귀환로와 현실 부두의 울림을 맞춰 보고 있어. 지금 목표를 확인해 줘.';
    else if(fate===0)result.text='서린: 현장 영상에 네가 없는 위치에서도 검격이 남았어. 같은 파형이 반복돼.\n백련에게 이 흔적을 보여 주고 네가 발견한 힘을 확인해 보자.';
   }
   if(id==='warden'&&![0,4,6,10,12].includes(progress))result.text='서린: 출발 전 보급 챙기고, 돌아오면 기록을 같이 보자.\n지금 해야 할 일은 '+this.objective().title+'야.';
   if(id==='master'&&fate===1&&this.fate.path)result.text='백련: 그 파문은 옛 기록에서 본 적이 있다. 하지만 네가 움직인 방식까지 적혀 있지는 않았지.\n잃어버린 무공도 이어받는 사람의 삶을 따라 달라진다. 다음에 무엇을 지킬지는 네가 정해라.\n\n현실로 돌아가 이 힘을 확인하자.';
  }
  if(result?.type==='awakening'&&fate===5)result.text='서린: 현장의 기록을 정리했어. 이번 별호는 네 움직임을 보고 붙인 이름이야.\n\n별호 · '+Fate.PATHS[this.fate.path].title+' / 금화 160';
  return result;
 };
 P.target=function(){if(inIntro(this)&&state(this).intro===3)return rescuePoints[state(this).aid];return old.target.call(this);};
 P.objective=function(){if(inIntro(this))return {title:'첫 만남 · 백련 구조',text:state(this).aid?'처마 아래까지 이동해 E로 부축을 마치세요.':'핏자국을 따라 백련에게 다가가 E로 응급처치하세요.',target:rescuePoints[Math.min(1,state(this).aid)],chapter:0};const result=old.objective.call(this);if(this.area==='archive'&&this.journey.phase===0)return {...result,title:'환서정 · 선택 탐험',text:'본편과 별개로 현상을 관찰하고 해석을 발견할 수 있습니다.',chapter:Math.max(1,this.progress>=7?2:1)};return result;};
 P.emit=function(type,extra={}){
  const s=state(this);
  if(type==='victory'&&this.area==='heart')extra={...extra,text:'경계의 심장이 고요해졌다. 서린에게 돌아가 결과를 보고하자.'};
  if(type==='interpretation')record(this,'interpret-'+extra.key,api.Data.variants[extra.key].name+'을 직접 발견했다.');
  if(type==='transfer'){if(this.training<=s.transfer)return;s.transfer=this.training;}
  if(type==='awakening'&&Fate.PATHS[extra.path]){
   if(s.inherited.includes(extra.path)){old.emit.call(this,'toast',{text:Fate.PATHS[extra.path].name+' · 운용을 바꾸었습니다.'});return;}
   s.inherited.push(extra.path);record(this,'inherit-'+extra.path,'잃어버린 무공 「'+Fate.PATHS[extra.path].name+'」을 계승했다.');
   const text='윤서님이 잃어버린 무공 「'+Fate.PATHS[extra.path].name+'」을 계승했습니다.';
   extra={...extra,title:'계승 완료 · '+Fate.PATHS[extra.path].name,text:text+'\n\n'+Fate.PATHS[extra.path].skills.map((v,i)=>['Q','R','F'][i]+' · '+v[0]).join('\n')+'\n\n계승 공지 · 싱글플레이 연출',inheritance:true};
  }
  old.emit.call(this,type,extra);
 };
 P.enter=function(id){return old.enter.call(this,id);};
 P.save=function(){const d=JSON.parse(old.save.call(this));d.version=7;d.revision=state(this);return JSON.stringify(d);};
 function validate(raw,d){
  if(!raw||!['new','legacy'].includes(raw.origin)||!Number.isInteger(raw.intro)||raw.intro<0||raw.intro>7||!Number.isInteger(raw.aid)||raw.aid<0||raw.aid>2||!Number.isInteger(raw.transfer)||raw.transfer<0||raw.transfer>3)throw Error('인트로 기록 오류');
  if(raw.origin==='legacy'&&raw.intro!==7||raw.intro<7&&(d.progress!==0||d.training!==0)||raw.intro<3&&raw.aid!==0||raw.intro>3&&raw.origin==='new'&&raw.aid!==2)throw Error('인트로 진행 오류');
  if(!Array.isArray(raw.inherited)||raw.inherited.length>3||new Set(raw.inherited).size!==raw.inherited.length||raw.inherited.some(p=>!Fate.PATHS[p]||!d.fate.proven.includes(p)))throw Error('계승 기록 오류');
  if(!Array.isArray(raw.history)||raw.history.length>80||new Set(raw.history.map(h=>h.id)).size!==raw.history.length||raw.history.some(h=>typeof h.id!=='string'||h.id.length>60||typeof h.text!=='string'||h.text.length>240||!AREAS[h.area]||!Number.isFinite(h.at)||h.at<0||h.at>d.playTime))throw Error('행적 기록 오류');
  return JSON.parse(JSON.stringify(raw));
 }
 Game.load=function(text){const d=JSON.parse(text),isNew=d.version===7,s=isNew?validate(d.revision,d):initial('legacy');if(isNew)d.version=6;const g=load.call(this,JSON.stringify(d));g.revision=s;if(!isNew){s.inherited=[...new Set([...(g.legend.awakened||[]),...(g.fate.path?[g.fate.path]:[])])];s.transfer=g.training;}if(s.intro<7)g.beginIntro();g.events=[];return g;};
 const onInterpretation=P.onInterpretation;P.onInterpretation=function(key,e){onInterpretation.call(this,key,e);record(this,'reproduce-'+key,api.Data.variants[key].name+'의 실제 효과를 현실에서 재현했다.');};
 function history(g){const s=state(g),rows=[...s.history];for(const m of g.legend.memories)rows.push({id:'memory-'+m.path+'-'+m.at,text:m.action,area:m.area,at:m.at});if(g.chapter4.rescued)rows.push({id:'rescue-route',text:'연화 구조 · '+api.label[g.chapter4.route],...g.chapter4.records[0]});for(const key of g.journey.known)if(!rows.some(h=>h.id==='interpret-'+key))rows.push({id:'interpret-'+key,text:api.Data.variants[key].name+' 발견',area:'archive',at:g.journey.facts.find(f=>f.id==='proof-'+key)?.at??null});return rows.sort((a,b)=>(a.at??Infinity)-(b.at??Infinity));}
 function summary(g){const s=g.stats(),j=g.journey;return {stats:s,attack:{기본:16,레벨:(g.level-1)*3,수련:g.training*6,강화:g.upgrade*4,경지:j.realm?2:0},hp:{기본:120,레벨:(g.level-1)*18,경지:j.realm?12:0},mp:{기본:80,레벨:(g.level-1)*5,경지:j.realm?8:0},requirements:[Object.values(j.mastery).reduce((a,b)=>a+b,0)>=8,j.worlds.length===2,j.known.length>0]};}
 return {...api,state,history,summary,inIntro};
});
