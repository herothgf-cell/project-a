/* Explicit LOCAL review only. Never included in the Pages runtime package. */
(async function(){
 'use strict';
 const diagnostics=new Map(),images=new Map(),cache=ProductionArt.createImageCache();
 const effectDiagnostics=new Map(),state=globalThis.ArtPreview={ready:false,diagnostics,effectDiagnostics,error:null};
 try{
  const assets=[];
  for(const world of ['reality','murim']){
   const response=await fetch('assets/art/'+world+'/hero/yunseo/candidate.json');if(!response.ok)throw Error('Missing '+world+' review catalog');
   assets.push(...(await response.json()).assets);
  }
  const catalog=ProductionArt.createCatalog({schemaVersion:1,required:[],assets});
  for(const a of assets)for(const atlas of [a.atlas,...Object.values(a.atlases||{})]){
   const loaded=await cache.load({status:'candidate',atlas});if(loaded.status!=='loaded')throw Error(atlas.path+': '+loaded.reason);images.set(atlas.path,loaded.image);
  }
  const badge=document.createElement('div');badge.id='artPreviewBadge';badge.textContent='제작 검수 · 전신 대기 / SE 걷기·1타 후보 · 나머지 동작·환경 BLOCKED_ART · 미배포';
  badge.style.cssText='position:fixed;bottom:23px;left:10px;z-index:200;background:#152432e8;color:#ffe1a3;font:11px system-ui;padding:5px 8px;pointer-events:none;max-width:85vw';document.body.append(badge);
  const previous=WorldArt.human,begin=RealmArt.begin,previousPortrait=WorldArt.portrait;let game,portraitWorld;
  WorldArt.portrait=function(canvas,kind,expression='neutral'){
   if(!game||kind!=='hero'){delete canvas.dataset.productionPortrait;return previousPortrait(canvas,kind);}
   const world=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',v=catalog.resolve({world,entityId:'hero',action:'portrait-'+expression,facing:'none'},{preview:true});
   if(v.status==='BLOCKED_ART'){delete canvas.dataset.productionPortrait;return previousPortrait(canvas,kind);}
   const c=canvas.getContext('2d'),size=Math.min(canvas.width,canvas.height);c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(images.get(v.atlas.path),...v.frame.rect,(canvas.width-size)/2,(canvas.height-size)/2,size,size);
   canvas.dataset.productionPortrait=v.id;canvas.dataset.expression=expression;canvas.dataset.portrait='hero';
  };
  RealmArt.begin=function(g){game=g;const result=begin(g),world=DualWorld.AREAS[g.area].world;if(world!==portraitWorld){portraitWorld=world;const hud=document.getElementById('hudPortrait');if(hud)WorldArt.portrait(hud,'hero');}return result;};
  WorldArt.human=function(c,e,t,kind='hero',scale=1){
   if(!game||kind!=='hero')return previous(c,e,t,kind,scale);
   const world=DualWorld.AREAS[game.area].world==='현실'?'reality':'murim',q=ArtRuntime.query(world,'hero',e,game.playTime),v=catalog.sample(q,{preview:true});
   diagnostics.set(world+'.hero',{...q,status:v.status,id:v.id||null,frame:v.frameIndex??null});
   if(v.status==='BLOCKED_ART'){
    previous(c,e,t,kind,scale);c.save();c.font='10px system-ui';c.textAlign='center';c.fillStyle='#ffe1a3';c.fillText('BLOCKED_ART · '+q.action,e.x,e.y-142*scale);c.restore();return;
   }
   const p=ArtRuntime.placement(v,e,(v.frame.displayHeight||110)*scale);c.save();if(e.flash>0)c.globalAlpha=.75;c.drawImage(images.get(v.atlas.path),...v.frame.rect,...p.destination);c.restore();
  };
  const previousEffect=RealmArt.effect;
  RealmArt.effect=function(c,f,quality,g){
   if(f.kind!=='slash'||!f.actionInstance)return previousEffect(c,f,quality,g);
   const world=DualWorld.AREAS[g.area].world==='현실'?'reality':'murim';
   const q=ArtRuntime.query(world,'hero',{motion:{instance:f.actionInstance}},g.playTime,{linger:true}),v=catalog.sample(q,{preview:true});
   if(v.status==='BLOCKED_ART'||!v.frame.sockets?.hand||!v.frame.sockets?.blade)return previousEffect(c,f,quality,g);
   const p=ArtRuntime.placement(v,{x:f.x,y:f.y},(v.frame.displayHeight||110)*1.15),hand=p.sockets.hand,tip=p.sockets.blade;
   effectDiagnostics.set(f.actionInstance.actionId,{...q,frame:v.frameIndex,hand,tip});if(effectDiagnostics.size>32)effectDiagnostics.delete(effectDiagnostics.keys().next().value);
   const angle=Math.atan2(tip.y-hand.y,tip.x-hand.x),radius=Math.hypot(tip.x-hand.x,tip.y-hand.y);
   c.save();c.globalAlpha=Math.max(0,f.life/f.max);c.strokeStyle='#d1ecff';c.lineWidth=2;c.beginPath();c.arc(hand.x,hand.y,radius,angle-.32,angle);c.stroke();
   if(quality>0){c.globalAlpha*=.18;c.lineWidth=7;c.stroke();}c.restore();return true;
  };
  state.ready=true;
 }catch(error){state.error=error.message;console.error('Art preview:',error.message);}
})();
