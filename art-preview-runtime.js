/* Explicit LOCAL review only. Never included in the Pages runtime package. */
(async function(){
 'use strict';
 const diagnostics=new Map(),images=new Map(),cache=ProductionArt.createImageCache();
 const effectDiagnostics=new Map(),state=globalThis.ArtPreview={ready:false,diagnostics,effectDiagnostics,error:null};
 try{
  const assets=[];
  const sceneResponse=await fetch('assets/art/scene-candidate.json');if(!sceneResponse.ok)throw Error('Missing scene review catalog');assets.push(...(await sceneResponse.json()).assets);
  for(const world of ['reality','murim']){
   const response=await fetch('assets/art/'+world+'/hero/yunseo/candidate.json');if(!response.ok)throw Error('Missing '+world+' review catalog');
   assets.push(...(await response.json()).assets);
  }
  const catalog=ProductionArt.createCatalog({schemaVersion:1,required:[],assets});
  for(const a of assets)for(const atlas of [a.atlas,...Object.values(a.atlases||{})]){
   const loaded=await cache.load({status:'candidate',atlas});if(loaded.status!=='loaded')throw Error(atlas.path+': '+loaded.reason);images.set(atlas.path,loaded.image);
  }
  const badge=document.createElement('div');badge.id='artPreviewBadge';badge.textContent='제작 검수 · 대기·걷기 8방향 / SE 3연타·회피·시전·피격 후보 · 나머지 동작·환경 BLOCKED_ART · 미배포';
  badge.style.cssText='position:fixed;bottom:23px;left:10px;z-index:200;background:#152432e8;color:#ffe1a3;font:11px system-ui;padding:5px 8px;pointer-events:none;max-width:85vw';document.body.append(badge);
  const previous=WorldArt.human,begin=RealmArt.begin,previousPortrait=WorldArt.portrait,enemyObservations=new Map();let game,portraitWorld;
  WorldArt.portrait=function(canvas,kind,expression='neutral'){
   if(!game){delete canvas.dataset.productionPortrait;return previousPortrait(canvas,kind);}
   const world=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',entityId=kind==='hero'?'hero':ArtRuntime.npcIdentity(world,kind),v=catalog.resolve({world,entityId,action:'portrait-'+expression,facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART'){delete canvas.dataset.productionPortrait;return previousPortrait(canvas,kind);}
   const c=canvas.getContext('2d'),size=Math.min(canvas.width,canvas.height);c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(images.get(v.atlas.path),...v.frame.rect,(canvas.width-size)/2,(canvas.height-size)/2,size,size);
   canvas.dataset.productionPortrait=v.id;canvas.dataset.expression=expression;canvas.dataset.portrait=kind;
  };
  RealmArt.begin=function(g){game=g;const result=begin(g),world=DualWorld.AREAS[g.area].world;if(world!==portraitWorld){portraitWorld=world;const hud=document.getElementById('hudPortrait');if(hud)WorldArt.portrait(hud,'hero');}return result;};
  WorldArt.human=function(c,e,t,kind='hero',scale=1){
   if(!game)return previous(c,e,t,kind,scale);
   if(kind!=='hero'){
    const enemyWorld=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',key=game.area+':'+e.id,prior=enemyObservations.get(key),observation={x:e.x,y:e.y,attacks:e.attacks,moving:!!prior&&Math.hypot(e.x-prior.x,e.y-prior.y)>.01,attackAt:prior?.attackAt};
    if(prior&&e.attacks>prior.attacks)observation.attackAt=game.playTime;
    const eq=ArtRuntime.enemyQuery(enemyWorld,e,game.playTime,observation);
    if(eq){enemyObservations.set(key,observation);if(enemyObservations.size>48)enemyObservations.delete(enemyObservations.keys().next().value);const ev=catalog.sample(eq,{preview:true});
     if(ev.status!=='BLOCKED_ART'){const ep=ArtRuntime.placement(ev,e,ev.frame.displayHeight*scale);c.drawImage(images.get(ev.atlas.path),...ev.frame.rect,...ep.destination);diagnostics.set(key,{...eq,status:ev.status,id:ev.id});return;}
    }
    const world=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',entityId=ArtRuntime.npcIdentity(world,e.id)||ArtRuntime.npcIdentity(world,kind);
    if(!entityId)return previous(c,e,t,kind,scale);
    const facing=['e','s','w','n'][(Math.round((e.face||0)/(Math.PI/2))+4)%4],v=catalog.resolve({world,entityId,action:'idle',facing},{preview:true});
    diagnostics.set(world+'.'+entityId,{status:v.status,id:v.id,facing});
    if(v.status==='BLOCKED_ART')return previous(c,e,t,kind,scale);
    const p=ArtRuntime.placement(v,e,135*scale);c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);return;
   }
   const world=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',q=ArtRuntime.query(world,'hero',e,game.playTime),v=catalog.sample(q,{preview:true});
   diagnostics.set(world+'.hero',{...q,status:v.status,id:v.id||null,frame:v.frameIndex??null});
   if(v.status==='BLOCKED_ART'){
    previous(c,e,t,kind,scale);c.save();c.font='10px system-ui';c.textAlign='center';c.fillStyle='#ffe1a3';c.fillText('BLOCKED_ART · '+q.action,e.x,e.y-142*scale);c.restore();return;
   }
   const p=ArtRuntime.placement(v,e,(v.frame.displayHeight||110)*scale);c.save();if(e.flash>0)c.globalAlpha=.75;c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);c.restore();
  };
  const previousEffect=RealmArt.effect;
  RealmArt.effect=function(c,f,quality,g){
   const effectQuery=ArtRuntime.effectQuery(f),effectVisual=effectQuery&&catalog.resolve(effectQuery,{preview:true});
   if(f.kind!=='slash'||!f.actionInstance){
    if(!effectVisual||effectVisual.status==='BLOCKED_ART')return previousEffect(c,f,quality,g);
    const size=f.kind==='storm'?Math.min(300,(f.range||150)*1.6):Math.min(340,(f.range||100)*2),isStorm=f.kind==='storm';
    c.save();c.globalAlpha=Math.max(0,Math.min(1,f.life/f.max));c.translate(f.x,f.y);if(!isStorm)c.rotate(f.angle||0);
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
  WorldArt.prop=function(c,b,theme){
   if(!game||!['city','village'].includes(game.area))return oldProp(c,b,theme);
   const index=DualWorld.AREAS[game.area].blocks.indexOf(b),world=game.area==='city'?'reality':'murim';
   const cell=game.area==='city'?[0,1,1,2,3][index]:[0,1,2,null,3][index];
   if(cell==null)return oldProp(c,b,theme);
   const v=catalog.resolve({world,entityId:'environment.buildings',action:'cell-'+cell,facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART')return oldProp(c,b,theme);
   const h=Math.max(b.h+80,b.w*1.1),p=ArtRuntime.placement(v,{x:b.x+b.w/2,y:b.y+b.h},h);
   c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);
  };
  const oldTerrain=ClassicArt.terrain;
  ClassicArt.terrain=function(area){
   const id=Object.entries(DualWorld.AREAS).find(([,a])=>a===area)?.[0];if(!['city','village'].includes(id))return oldTerrain(area);
   const world=id==='city'?'reality':'murim',v=catalog.resolve({world,entityId:'environment.ground',action:'cell-0',facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART')return oldTerrain(area);
   const terrain=document.createElement('canvas');terrain.width=area.w;terrain.height=area.h;const c=terrain.getContext('2d');
   const tile=document.createElement('canvas');tile.width=tile.height=256;const tc=tile.getContext('2d');
   tc.drawImage(images.get(v.atlas.path),...v.frame.rect,0,0,256,256);c.fillStyle=c.createPattern(tile,'repeat');c.fillRect(0,0,area.w,area.h);
   const road=catalog.resolve({world,entityId:'environment.ground',action:'cell-1',facing:'none'},{preview:true});tc.clearRect(0,0,256,256);tc.drawImage(images.get(road.atlas.path),...road.frame.rect,0,0,256,256);
   c.strokeStyle=c.createPattern(tile,'repeat');c.lineWidth=id==='city'?132:112;c.lineCap='round';c.lineJoin='round';
   for(const points of area.roads){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
   return {terrain,decorations:[]};
  };
  const oldPortal=WorldArt.portal;
  WorldArt.portal=function(c,o,t,theme,locked){
   if(!game||o.kind!=='portal'||!['city','village'].includes(game.area))return oldPortal(c,o,t,theme,locked);
   const world=game.area==='city'?'reality':'murim',v=catalog.resolve({world,entityId:'environment.portal',action:ArtRuntime.portalState(game,o),facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART')return oldPortal(c,o,t,theme,locked);
   const p=ArtRuntime.placement(v,o,170);c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);
  };
  badge.textContent='제작 검수 · 독립 NPC 6종·적 4종·두 마을·무공 후보 · 추가 방향·타이밍 최종 검수 BLOCKED_ART · 미배포';
  dispatchEvent(new Event('wuxia-assets-ready'));
  state.ready=true;
 }catch(error){state.error=error.message;console.error('Art preview:',error.message);}
})();
