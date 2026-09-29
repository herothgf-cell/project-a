/* Read-only presentation helpers + transient motion; damage and save schema stay authoritative. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./chapter-five.js'):root.DualWorld);if(typeof module==='object'&&module.exports)module.exports=api;else root.Presentation=api;})(globalThis,function(api){
 'use strict';
 const {Game,AREAS,Fate,dist}=api,proto=Game.prototype;
 const previous={act:proto.act,step:proto.step,enter:proto.enter,takeHit:proto.takeHit};
 const actionSequences=new WeakMap();
 const DISCLOSURE='실제 멀티 채팅이 아닌 연출 시뮬레이션입니다.';
 const channels=[['all','전체'],['world','월드'],['server','서버'],['recruit','모집'],['system','시스템']];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function worldStyle(area){const world=area?.world==='현실'?'현실':'무림';return {world,architecture:world==='현실'?'modern':'martial',npc:world==='현실'?'uniform':'robe',accent:world==='현실'?'#82dbe7':'#e0c18a'};}
 function fresh(){return {stride:0,speed:0,action:'idle',at:-10,angle:Math.PI/2,duration:.32,combo:0};}
 proto.takeHit=function(...args){
  const hp=this.player.hp,result=previous.takeHit.apply(this,args);
  if(this.player.hp<hp){const m=this.player.motion||(this.player.motion=fresh()),sequence=(actionSequences.get(this)||0)+1;actionSequences.set(this,sequence);m.reaction=Object.freeze({actionId:'hit-'+sequence,action:'hit',startedAt:this.playTime,contactAt:this.playTime,duration:.18,angle:this.player.face});}
  return result;
 };
 function pose(e,time=0,{linger=false}={}){const motion=e.motion||fresh(),m=motion.instance?{...motion,...motion.instance,at:motion.instance.startedAt}:motion,age=Math.max(0,time-m.at),active=(age<m.duration||linger)&&m.action!=='idle';
  const u=active?clamp(age/m.duration,0,1):1,angle=active?m.angle:Number.isFinite(e.face)?e.face:Math.PI/2;
  const step=m.stride*Math.PI/25,strength=e.walking?clamp(m.speed/150,0,1):0,foot=Math.sin(step)*strength;
  const magic=active&&['storm','seal','ultimate-seal'].includes(m.action);
  // Contact is at the same simulation instant as damage. The remaining pose is follow-through / recovery.
  const sweep=active?(m.combo===2?-1:1)*(-.36+1.6*Math.sin(u*Math.PI*.65)):0;
  const reach=active?18+14*Math.sin((1-u)*Math.PI*.65):14;
  const shoulder={x:e.x+Math.cos(angle)*5,y:e.y-55},hand={x:e.x+Math.cos(angle)*reach,y:e.y-42+Math.sin(angle)*reach*.55};
  const bladeAngle=angle+sweep,tip={x:hand.x+Math.cos(bladeAngle)*53,y:hand.y+Math.sin(bladeAngle)*53*.65};
  return {actionId:m.actionId||null,contactAt:m.contactAt??null,action:active?m.action:'idle',active,magic,u,angle,bladeAngle,foot,bob:Math.abs(foot)*1.8,lean:active?Math.sin((1-u)*Math.PI)*.1:foot*.012,shoulder,hand,tip,stride:step};
 }
 // Released visuals retain their emission coordinates, but sample the same action clock as the body.
 function effectPose(f,time){if(!f.actionInstance)return null;return pose({x:f.x,y:f.y,face:f.actionInstance.angle,motion:{...fresh(),instance:f.actionInstance}},time,{linger:true});}
 proto.enter=function(id){const from=this.area,ok=previous.enter.call(this,id);if(ok){this.player.motion=fresh();for(const e of this.enemies)e.motion=fresh();this.presentationTravel={from:AREAS[from]?.world||AREAS[id].world,to:AREAS[id].world,at:this.playTime};}return ok;};
 proto.act=function(action,...rest){const before=new Set(this.fx),charge=this.combat?.charges||0,ok=previous.act.call(this,action,...rest);if(!ok||!['attack','moon','storm','dash','signature1','signature2','ultimate'].includes(action))return ok;
  const m=this.player.motion||(this.player.motion=fresh()),path=Fate.active(this);m.action=action==='signature1'||action==='signature2'?path:action==='ultimate'?'ultimate-'+path:action;m.at=this.playTime;m.angle=this.player.face;m.duration=action==='dash'?.22:action==='ultimate'?.58:.3;m.combo=this.combo;
  const sequence=(actionSequences.get(this)||0)+1;actionSequences.set(this,sequence);
  m.instance=Object.freeze({actionId:'player-'+sequence,action:m.action,input:action,charge,startedAt:m.at,contactAt:['attack','moon','storm'].includes(action)?m.at:null,angle:m.angle,duration:m.duration,combo:m.combo});
  for(const f of this.fx)if(!before.has(f)){
   f.actionInstance=m.instance;
   if(['slash','fate-wave'].includes(f.kind)){f.actorBound=true;f.motionAt=m.at;f.motionAngle=m.angle;f.motionCombo=m.combo;}
  }
  return ok;
 };
 proto.step=function(dt,input={}){const entities=[this.player,...this.enemies],positions=entities.map(e=>[e.x,e.y]),t=this.playTime;previous.step.call(this,dt,input);const elapsed=this.playTime-t;if(elapsed<=0)return;
  entities.forEach((e,i)=>{if(e!==this.player&&!this.enemies.includes(e))return;const d=Math.hypot(e.x-positions[i][0],e.y-positions[i][1]),m=e.motion||(e.motion=fresh());if(d<80)m.stride+=d;m.speed=d<80?d/elapsed:0;e.walking=d>.08;});
 };
 function guide(g,path){
  const a=AREAS[g.area],points=g.points?g.points():a.points,s=g.journey;
  if(g.progress<2)return {stage:'locked',title:'먼저 기본기를 익히세요',text:'현실 서린 → 무림 백련 순서로 대화하면 기감을 사용할 수 있습니다. 기감은 주변 흔적을 찾는 도구이며 직업 보상이 아닙니다.',target:null};
  if(g.area!=='archive')return {stage:'travel',title:'환서정으로 가기 · 선택 탐험',text:a.world==='현실'?'무림으로 이동한 뒤 청운촌 남동쪽 「환서정」으로 가세요. 기존 무공을 다른 방식으로 쓰는 단서를 찾는 곳입니다.':'청운촌 남동쪽 「환서정」으로 가세요. B 기감 → 가까이 E 조사 → N 수첩 순서로 시작합니다.',target:points.find(o=>o.id===(g.area==='village'?'archiveGate':a.safe?'portal':'exit'))||null};
  const candidates=points.filter(o=>o.kind==='discovery'&&o.path!=='station');
  const o=candidates.find(o=>o.path===(path||g.guidePath||g.fate.path))||candidates.slice().sort((a,b)=>dist(a,g.player)-dist(b,g.player))[0];
  if(!o)return {stage:'done',title:'주변을 살펴보세요',text:'관찰 수첩에는 실제 발견만 남습니다.',target:null};
  const known=s.known.filter(k=>k.startsWith(o.path+'-'));
  if(known.length)return {stage:'interpret',title:'발견한 운용을 살펴보세요',text:g.fate.path===o.path?'N 수첩 → 무공 해석에서 읽고 「이어가기」를 선택하세요. 같은 계열의 Q/R 사용법을 바꾸며 무료로 되돌릴 수 있습니다.':'새 해석은 발견했지만 해당 기연 계열을 아직 익히지 않았습니다. 기록은 보존됩니다. 나의 기연에서 계열을 확인하세요.',target:o,path:o.path};
  if(dist(g.player,o)>230)return {stage:'approach',title:'물건 가까이 다가가기',text:'빛이 머무는 물건에 가까이 가세요. B 기감은 주변의 흔적만 드러냅니다. 멀리서 눌러도 모든 물건을 찾아주지는 않습니다.',target:o,path:o.path};
  if(!s.facts.some(f=>f.id==='sense-'+o.path))return {stage:'sense',title:'B · 기감으로 살펴보기',text:'B 또는 「기감」을 누르세요. 지금 앞에 있는 물건의 보이지 않던 기운이 드러납니다.',target:o,path:o.path};
  if(!s.items.includes(o.path))return {stage:'inspect',title:'E · 물건 조사하기',text:'물건 가까이에서 E / 「조사」를 누르세요. 읽는 것만으로 무공을 받지는 않습니다. 알아낸 사실은 N 수첩에 남습니다.',target:o,path:o.path};
  const hints={ripple:'안전한 검풍이 모이는 동안 곁의 수호 석판에 다가가 E를 눌러 보세요. 또는 검풍이 닿기 직전 J를 직접 눌러 다른 반응을 살펴보세요.',echo:'물건의 원 안에 울림이 모일 때 회피하세요. 발자국이 남으면 돌아가 보거나, 벗어난 자리에서 J 공격을 눌러 보세요.',seal:'파동이 모일 때 비석 가까이 E로 붙잡아 보세요. 다른 방법은 파동 중 B 기감 → 옆 수로 가까이 E입니다.'};
  return {stage:'experiment',title:'안전한 현상에 반응해 보기',text:hints[o.path]+' 실패해도 물건과 기록은 사라지지 않습니다.',target:o,path:o.path};
 }
 function news(g){const rows=[],feed=g.chapter4?.feed||[];
  for(const m of feed)rows.push({id:'event-'+m.key,channel:m.kind==='npc'?'world':'server',speaker:m.speaker,text:m.text,at:m.at||0,simulated:true,origin:'현재 여정 · NPC 연출'});
  const rumors=typeof globalThis.JourneyData!=='undefined'?globalThis.JourneyData.rumors(g.journey):require('./journey-data.js').rumors(g.journey);
  rumors.forEach((m,i)=>rows.push({id:'traveler-'+i,channel:'world',speaker:m.speaker,text:m.text,at:null,simulated:true,origin:'가상 모험가'}));
  rows.push({id:'ai-party',channel:'recruit',speaker:'동행 안내',text:'제5장 공명 관측소의 도겸은 AI 동료입니다. 도겸에게 직접 대화해 동행을 제안하세요. 실제 유저 모집이나 파티 연결은 없습니다.',at:null,simulated:true,origin:'AI 동행 안내'});
  rows.push({id:'local-notice',channel:'system',speaker:'시스템 안내',text:'서버 탭은 현재 여정에서 발생한 사건을 알리는 연출입니다. 실제 서버 최초·접속자·다른 유저의 기록이 아닙니다.',at:null,simulated:true,origin:'싱글플레이 안내'});
  return rows.slice(-40);
 }
 return {worldStyle,pose,effectPose,guide,news,DISCLOSURE,channels};
});
