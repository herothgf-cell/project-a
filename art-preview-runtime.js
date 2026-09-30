/* Candidate presentation. Public only through the explicit prototype build. */
(async function(){
 'use strict';
 const diagnostics=new Map();let redrawQueued=false;
 const images=ProductionArt.createResidentImages({onLoad(){if(redrawQueued)return;redrawQueued=true;requestAnimationFrame(()=>{redrawQueued=false;dispatchEvent(new Event('wuxia-assets-ready'));});}});
 const effectDiagnostics=new Map(),state=globalThis.ArtPreview={ready:false,diagnostics,effectDiagnostics,residency:images,error:null};
 try{
  const assets=[];
  const sceneResponse=await fetch('assets/art/scene-candidate.json');if(!sceneResponse.ok)throw Error('Missing scene review catalog');assets.push(...(await sceneResponse.json()).assets);
  for(const world of ['reality','murim']){
   const response=await fetch('assets/art/'+world+'/hero/yunseo/candidate.json');if(!response.ok)throw Error('Missing '+world+' review catalog');
   assets.push(...(await response.json()).assets);
  }
  const sourceCatalog=ProductionArt.createCatalog({schemaVersion:1,required:[],assets});
  function resident(v){if(v.status==='BLOCKED_ART'||images.request(v))return v;return {...v,status:'BLOCKED_ART',reason:images.failure(v.atlas.path)||'loading image'};}
  const catalog={resolve:(...args)=>resident(sourceCatalog.resolve(...args)),sample:(...args)=>resident(sourceCatalog.sample(...args))};
  const badge=document.createElement('div');badge.id='artPreviewBadge';badge.textContent='제작 검수 · 양 세계 주인공 동작 8방향 후보 · 시각·지역 검수 진행 중 · 미배포';
  if(globalThis.SSANGGYE_PROTOTYPE)badge.textContent='프로토타입 · 후보 아트 / 일부 방향·지역은 간소화 표현 · 최종 아트 검수 미완료';
  badge.style.cssText='position:fixed;bottom:23px;left:10px;z-index:200;background:#152432e8;color:#ffe1a3;font:11px system-ui;padding:5px 8px;pointer-events:none;max-width:85vw';document.body.append(badge);
  const previous=WorldArt.human,begin=RealmArt.begin,previousPortrait=WorldArt.portrait,enemyObservations=new Map(),portraitRequests=new WeakMap();let game,portraitWorld;
  addEventListener('wuxia-assets-ready',()=>{
   portraitWorld=null;if(!game)return;
   const world=DualWorld.AREAS[game.area].world;
   for(const canvas of document.querySelectorAll('canvas')){
    const request=portraitRequests.get(canvas);
    if(request&&request.world===world)WorldArt.portrait(canvas,request.kind,request.expression);
   }
  });
  WorldArt.portrait=function(canvas,kind,expression='neutral'){
   if(!game){delete canvas.dataset.productionPortrait;return previousPortrait(canvas,kind);}
   portraitRequests.set(canvas,{kind,expression,world:DualWorld.AREAS[game.area].world});
   const world=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',entityId=kind==='hero'?'hero':ArtRuntime.npcIdentity(world,kind),v=catalog.resolve({world,entityId,action:'portrait-'+expression,facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART'){delete canvas.dataset.productionPortrait;return previousPortrait(canvas,kind);}
   const c=canvas.getContext('2d'),size=Math.min(canvas.width,canvas.height);c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(images.get(v.atlas.path),...v.frame.rect,(canvas.width-size)/2,(canvas.height-size)/2,size,size);
   canvas.dataset.productionPortrait=v.id;canvas.dataset.expression=expression;canvas.dataset.portrait=kind;
  };
  RealmArt.begin=function(g){game=g;const result=begin(g),world=DualWorld.AREAS[g.area].world;if(world!==portraitWorld){portraitWorld=world;const hud=document.getElementById('hudPortrait');if(hud)WorldArt.portrait(hud,'hero');}return result;};
  WorldArt.human=function(c,e,t,kind='hero',scale=1){
   if(!game)return previous(c,e,t,kind,scale);
   if(kind!=='hero'){
    const enemyWorld=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',key=game.area+':'+e.id,prior=enemyObservations.get(key),observation={x:e.x,y:e.y,moving:!!prior&&Math.hypot(e.x-prior.x,e.y-prior.y)>.01};
    const eq=ArtRuntime.enemyQuery(enemyWorld,e,game.playTime,observation);
    if(eq){enemyObservations.set(key,observation);if(enemyObservations.size>48)enemyObservations.delete(enemyObservations.keys().next().value);const ev=catalog.sample(eq,{preview:true});
     diagnostics.set(key,{...eq,status:ev.status,id:ev.id||null,reason:ev.reason||null,frame:ev.frameIndex??null});
     if(ev.status!=='BLOCKED_ART'){const ep=ArtRuntime.placement(ev,e,ev.frame.displayHeight*scale);c.drawImage(images.get(ev.atlas.path),...ev.frame.rect,...ep.destination);return;}
     previous(c,e,t,kind,scale);c.save();c.font='10px system-ui';c.textAlign='center';c.fillStyle='#ffe1a3';c.fillText('BLOCKED_ART · '+eq.action+'.'+eq.facing,e.x,e.y-142*scale);c.restore();return;
    }
    const world=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',entityId=ArtRuntime.npcIdentity(world,e.id)||ArtRuntime.npcIdentity(world,kind);
    if(!entityId)return previous(c,e,t,kind,scale);
    const facing=['e','s','w','n'][(Math.round((e.face||0)/(Math.PI/2))+4)%4],v=catalog.resolve({world,entityId,action:'idle',facing},{preview:true});
    diagnostics.set(world+'.'+entityId,{status:v.status,id:v.id,facing});
    if(v.status==='BLOCKED_ART')return previous(c,e,t,kind,scale);
    const p=ArtRuntime.placement(v,e,135*scale);c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);return;
   }
   const world=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',q=ArtRuntime.query(world,'hero',e,e.presentationTime??game.playTime),v=catalog.sample(q,{preview:true});
   diagnostics.set(world+'.hero',{...q,status:v.status,id:v.id||null,frame:v.frameIndex??null});
   if(v.status==='BLOCKED_ART'){
    previous(c,e,t,kind,scale);c.save();c.font='10px system-ui';c.textAlign='center';c.fillStyle='#ffe1a3';c.fillText('BLOCKED_ART · '+q.action,e.x,e.y-142*scale);c.restore();return;
   }
   const p=ArtRuntime.placement(v,e,(v.frame.displayHeight||110)*scale);c.save();if(e.flash>0)c.globalAlpha=.75;c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);c.restore();
  };
  const previousEffect=RealmArt.effect;
  const previousField=FateArt.field,previousGround=FateArt.ground,previousGuard=JourneyArt.guard;
  FateArt.ground=function(c,g,q,t){effectDiagnostics.delete('persistent-field');return previousGround(c,g,q,t);};
  function drawField(c,f,q,t,family,fallback){
   const visual=ArtRuntime.fieldVisual(f,family),asset=visual&&catalog.resolve(visual.query,{preview:true});
   if(!asset||asset.status==='BLOCKED_ART')return fallback(c,f,q,t);
   c.save();c.globalAlpha*=visual.alpha;c.drawImage(images.get(asset.atlas.path),...asset.frame.rect,...visual.destination);c.restore();
   effectDiagnostics.set('persistent-field',{status:asset.status,id:asset.id,life:f.life,radius:f.radius,quality:q});
  }
  FateArt.field=(c,f,q,t)=>drawField(c,f,q,t,'seal',previousField);
  JourneyArt.guard=(c,f,q,t)=>drawField(c,f,q,t,'ripple',previousGuard);
  RealmArt.effect=function(c,f,quality,g){
   const effectQuery=ArtRuntime.effectQuery(f),effectVisual=effectQuery&&catalog.resolve(effectQuery,{preview:true});
   if(f.kind!=='slash'||!f.actionInstance){
    if(!effectVisual||effectVisual.status==='BLOCKED_ART')return previousEffect(c,f,quality,g);
    const size=f.kind==='storm'?Math.min(300,(f.range||150)*1.6):Math.min(340,(f.range||100)*2),isStorm=f.kind==='storm';
    c.save();c.globalAlpha=Math.max(0,Math.min(1,f.life/f.max));c.translate(f.x,f.y);c.rotate(ArtRuntime.effectRotation(f));
    c.drawImage(images.get(effectVisual.atlas.path),...effectVisual.frame.rect,-size/2,isStorm?-size*.9:-size*.35,size,isStorm?size:size*.7);c.restore();return true;
   }
   const world=DualWorld.AREAS[g.area].world==='현실'?'reality':'murim';
   const q=ArtRuntime.query(world,'hero',{motion:{instance:f.actionInstance}},g.playTime,{linger:true}),v=catalog.sample(q,{preview:true});
   if(v.status==='BLOCKED_ART'||!v.frame.sockets?.hand||!v.frame.sockets?.blade)return previousEffect(c,f,quality,g);
   const p=ArtRuntime.placement(v,{x:f.x,y:f.y},(v.frame.displayHeight||110)*1.15),hand=p.sockets.hand,tip=p.sockets.blade;
   effectDiagnostics.set(f.actionInstance.actionId,{...q,frame:v.frameIndex,hand,tip});if(effectDiagnostics.size>32)effectDiagnostics.delete(effectDiagnostics.keys().next().value);
   const angle=Math.atan2(tip.y-hand.y,tip.x-hand.x),radius=Math.hypot(tip.x-hand.x,tip.y-hand.y);
   if(!effectVisual||effectVisual.status==='BLOCKED_ART')return previousEffect(c,f,quality,g);
   c.save();c.globalAlpha=Math.max(0,f.life/f.max);c.translate(hand.x,hand.y);c.rotate(angle);
   const width=radius*2.1;c.drawImage(images.get(effectVisual.atlas.path),...effectVisual.frame.rect,-width*.25,-width*.4,width,width*.8);c.restore();return true;
  };
  const oldProp=WorldArt.prop;
  function drawProp(c,o,cell,height){const world=game.area==='city'?'reality':'murim',v=catalog.resolve({world,entityId:'environment.props',action:'cell-'+cell,facing:'none'},{preview:true});if(v.status==='BLOCKED_ART')return false;const p=ArtRuntime.placement(v,o,height||v.frame.displayHeight);c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);diagnostics.set(world+'.'+(o.kind||'prop'),{status:v.status,id:v.id,cell});return true;}
  WorldArt.rest=function(c,o){return game&&['city','village'].includes(game.area)&&drawProp(c,o,game.area==='city'?0:1,90);};
  WorldArt.prop=function(c,b,theme){
   if(!game||!['city','village'].includes(game.area))return oldProp(c,b,theme);
   const index=DualWorld.AREAS[game.area].blocks.indexOf(b),world=game.area==='city'?'reality':'murim';
   const cell=game.area==='city'?[0,1,1,2,3][index]:[0,1,2,null,3][index];
   if(cell==null){if(game.area==='village'&&index===3&&drawProp(c,{x:b.x+b.w/2,y:b.y+b.h},0,170))return;return oldProp(c,b,theme);}
   const v=catalog.resolve({world,entityId:'environment.buildings',action:'cell-'+cell,facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART')return oldProp(c,b,theme);
   const h=Math.max(b.h+80,b.w*1.1),p=ArtRuntime.placement(v,{x:b.x+b.w/2,y:b.y+b.h},h);
   c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);
  };
  const oldTerrain=ClassicArt.terrain;
  WorldArt.foreground=function(c,o){
   const v=catalog.resolve({world:o.world,entityId:'environment.foreground',action:'cell-'+o.cell,facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART')return;
   const height=v.frame.displayHeight*o.scale,p=ArtRuntime.placement(v,o,height),hero=game.player;
   c.save();if(hero.y<o.y&&hero.y>o.y-height&&Math.abs(hero.x-o.x)<height*.35)c.globalAlpha*=.4;
   c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);c.restore();
   diagnostics.set(o.world+'.foreground',{status:v.status,id:v.id});
  };
  ClassicArt.terrain=function(area){
   const id=Object.entries(DualWorld.AREAS).find(([,a])=>a===area)?.[0];if(!['city','village'].includes(id))return oldTerrain(area);
   const world=id==='city'?'reality':'murim',v=catalog.resolve({world,entityId:'environment.ground',action:'cell-0',facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART')return oldTerrain(area);
   const terrain=document.createElement('canvas');terrain.width=area.w;terrain.height=area.h;const c=terrain.getContext('2d');
   const tile=document.createElement('canvas');tile.width=tile.height=512;const tc=tile.getContext('2d');
   ArtRuntime.drawTerrainRepeat(tc,images.get(v.atlas.path),v.frame.rect,256);c.fillStyle=c.createPattern(tile,'repeat');c.fillRect(0,0,area.w,area.h);
   const road=catalog.resolve({world,entityId:'environment.ground',action:'cell-1',facing:'none'},{preview:true});if(road.status==='BLOCKED_ART')return oldTerrain(area);tc.clearRect(0,0,512,512);ArtRuntime.drawTerrainRepeat(tc,images.get(road.atlas.path),road.frame.rect,256);
   c.strokeStyle=c.createPattern(tile,'repeat');c.lineWidth=id==='city'?132:112;c.lineCap='round';c.lineJoin='round';
   for(const points of area.roads){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
   let dressingCount=0;
   for(const d of ArtRuntime.groundDetails(area,world)){
    const detail=catalog.resolve({world,entityId:'environment.dressing',action:'cell-'+d.cell,facing:'none'},{preview:true});
    if(detail.status==='BLOCKED_ART')continue;
     c.save();c.translate(d.x,d.y);c.rotate(d.rotation||0);c.drawImage(images.get(detail.atlas.path),...detail.frame.rect,-d.size/2,-d.size/2,d.size,d.size);c.restore();dressingCount++;
   }
   diagnostics.set(world+'.ground-dressing',{count:dressingCount,status:dressingCount?'candidate':'BLOCKED_ART'});
   return {terrain,decorations:ArtRuntime.foregroundDetails(area,world).map(o=>({...o,kind:'production-foreground'}))};
  };
  const oldPortal=WorldArt.portal;
  WorldArt.pointLabelHeight=o=>game&&['city','village'].includes(game.area)&&o.kind==='portal'?280:null;
  WorldArt.portal=function(c,o,t,theme,locked){
   if(!game||!['city','village'].includes(game.area))return oldPortal(c,o,t,theme,locked);
   if(o.kind!=='portal'){const cell=game.area==='city'?(locked?2:1):(o.kind==='journey-gate'?3:2);if(drawProp(c,o,cell,165))return;return oldPortal(c,o,t,theme,locked);}
   const world=game.area==='city'?'reality':'murim',v=catalog.resolve({world,entityId:'environment.portal',action:ArtRuntime.portalState(game,o),facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART')return oldPortal(c,o,t,theme,locked);
   const p=ArtRuntime.placement(v,o,270);c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);
  };
  dispatchEvent(new Event('wuxia-assets-ready'));
  state.ready=true;
 }catch(error){state.error=error.message;console.error('Art preview:',error.message);}
})();
