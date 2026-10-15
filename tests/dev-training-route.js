/* Local-only route. Served only by the loopback developer server, never the public builder. */
(function(root,f){const api=f(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.DevTrainingRoute=api;})(globalThis,function(root){
 'use strict';
 const responses=['ripple','echo','seal'],basics=['sword','thunder',...responses];
 const prototypes=()=>root.MartialPrototypes||(typeof require==='function'?require('../martial-prototypes.js'):null);
 const newBasics=['flash','crescent','gathering','sidestep'],newLinks=['chargedCrescent','sideFlash'];
 const steps=[...['sword','thunder'].map(family=>({kind:'learn',family})),...responses.flatMap(family=>['discover','flow','quest','learn'].map(kind=>({kind,family}))),...responses.map(family=>({kind:'create',family})),...responses.map(family=>({kind:'reality',family})),...newBasics.flatMap(family=>['acquire','learn','prove'].map(kind=>({kind,family,prototype:true}))),...newLinks.flatMap(family=>['create','reality'].map(kind=>({kind,family,prototype:true})))];
 const enabled=()=>root.SSANGGYE_DEV===true&&new URLSearchParams(root.location.search).get('training')==='1';
 const key=()=>root.SaveSlots.keys.test+(new URLSearchParams(root.location.search).get('story')==='1'?'.exclusive-v1':'')+'.training-route';
 function completed(){try{const value=JSON.parse(root.localStorage.getItem(key()+'.proofs')||'[]');return Array.isArray(value)?value.filter(f=>responses.includes(f)):[];}catch{return [];}}
 function next(g,T,done=[]){const s=T.state(g);for(const [index,step]of steps.entries()){
  let complete;if(step.prototype){const p=prototypes().state(g);const key={acquire:'discovered',learn:'learned',prove:'proven',create:'linkProof',reality:'realityProof'}[step.kind];complete=p[key].includes(step.family);}
  else complete=step.kind==='discover'?s.discovered.includes(step.family):step.kind==='flow'?T.owns(g,'flow',T.catalog[step.family].recipe[2]):step.kind==='quest'?T.owns(g,'intent',T.catalog[step.family].recipe[3]):step.kind==='learn'?s.learned.includes(step.family):step.kind==='create'?s.linkProof.includes(step.family):done.includes(step.family);
  if(!complete)return {...step,index,total:steps.length};}return null;}
 function create(Game,T){const g=new Game();if(g.skipStoryIntro){g.skipStoryIntro();g.events=[];return g;}g.beginIntro(true);g.finishIntro();g.enter('village');T.introduce(g);g.events=[];return g;}
 function move(g,T,done=[]){const step=next(g,T,done);if(!step)return null;const {family,kind}=step;if(g.worldState?.exclusiveStory){const to=kind==='reality'?'city':'yeoul';if(g.growthWorld()!==(kind==='reality'?'reality':'murim')){g.area=to;g.enter(to);}if(kind==='learn'&&family==='thunder')T.introduce(g,'thunder');}
  if(step.prototype){
   const P=prototypes();
   if(kind==='acquire'&&family==='sidestep'){
    if(!g.enter('sanctum'))throw Error('비경에 진입하지 못했습니다.');const p=P.points(g).find(x=>x.id==='prototype-sidestep');Object.assign(g.player,{x:p.x,y:p.y+25});g.events=[];return {...step,section:'learn',leave:true};
   }
   if(!g.enter(kind==='reality'?'city':'village'))throw Error('수련 거점에 진입하지 못했습니다.');g.events=[];
   if(kind==='prove'){P.startPractice(g,family,{world:'murim'});return {...step,section:'learn',leave:true};}
   return {...step,section:['create','reality'].includes(kind)?'create':'learn',leave:false};
  }
  if(kind==='learn'&&['sword','thunder'].includes(family)){
   g.enter('village');if(family==='thunder'&&!T.state(g).discovered.includes(family))g.progress=3;
   const p=g.points().find(p=>p.id==='master');Object.assign(g.player,{x:p.x,y:p.y+25});g.interact();g.events=[];
   return {...step,section:'learn',leave:false};
  }
  if(kind==='discover'){
   g.progress=12;g.training=3;if(g.fate.stage<2){g.fate.stage=2;g.worldState.growthArc.phase='reported';}
   if(!g.enter('sanctum'))throw Error('비경 시작점에 진입하지 못했습니다.');
   const p=g.points().find(p=>p.id==='relic-'+family);Object.assign(g.player,{x:p.x,y:p.y+25});g.events=[];
   return {...step,section:'learn',leave:true};
  }
  if(kind==='flow'||kind==='quest'){
   const A=root.MartialAcquisition||(typeof require==='function'?require('../martial-acquisition.js'):null);g.enter('village');
   if(kind==='quest'&&T.state(g).quests[family]==='ready')return {...step,section:'learn',leave:false};
   if(kind==='flow')A.startFlow(g,family);else A.startQuest(g,family);
   return {...step,section:'learn',leave:true};
  }
  if(kind==='learn'){g.enter('village');g.events=[];return {...step,section:'learn',leave:false};}
  if(!g.enter(kind==='reality'?'city':'village'))throw Error('수련 거점에 진입하지 못했습니다.');
  g.events=[];return {...step,section:'create',leave:false};
 }
 function record(g,event){if(!enabled()||event.type!=='martial-link-proven'||event.world!=='reality'||!responses.includes(event.family))return false;const done=completed();if(!done.includes(event.family))done.push(event.family);root.localStorage.setItem(key()+'.proofs',JSON.stringify(done));return true;}
 return {enabled,key,completed,next,create,move,record,steps};
});
