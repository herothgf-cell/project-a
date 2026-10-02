(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.CombatEvents=api;})(globalThis,function(){
 'use strict';const installed=new WeakSet(),states=new WeakMap();let session=0;
 function state(g){let s=states.get(g);if(!s){s={session:++session,serial:0,cast:null,hits:new Map(),dash:null,warnings:new WeakMap(),queue:null};states.set(g,s);}return s;}
 function install(Game,{worldOf=()=> 'murim'}={}){const p=Game.prototype;if(installed.has(p))return;installed.add(p);
  function emit(g,kind,extra={}){const s=state(g),castId=extra.castId??s.cast??('event-'+(++s.serial)),event={kind,world:worldOf(g),castId:s.session+':'+castId,hit:0,result:kind,...extra};event.castId=s.session+':'+castId;if(s.queue)s.queue.push(event);else g.emit('combat-sound',event);}
  function wrap(name,fn){const old=p[name];if(typeof old==='function')p[name]=function(...args){return fn.call(this,old,args);};}
  function attainment(g,before){const s=state(g);if(!before&&g.laterStory?.dualBreath&&!s.attainmentNotified){s.attainmentNotified=true;emit(g,'attain',{castId:'attain-dual'});}}
  const pending=g=>[...(g.combat?.pending||[]),...(g.experimentRuntime?.pending||[]),...(g.realityRuntime?.pending||[])];
  wrap('act',function(old,args){const had=this.laterStory?.dualBreath,s=state(this),previous=s.cast,queue=s.queue,before=pending(this),at={x:this.player.x,y:this.player.y},winds=this.enemies.filter(e=>e.hp>0&&e.wind>0),charge=this.combat?.charges||0;const id='cast-'+(++s.serial);s.cast=id;s.queue=[];let ok,events;
   try{ok=old.apply(this,args);events=s.queue;}finally{s.cast=previous;s.queue=queue;}
   if(!ok)return ok;for(const h of pending(this))if(!before.includes(h))h.audioCastId=id;
   const action=args[0];if(action==='dash')s.dash={id,played:false,threats:new Set(winds.filter(e=>this.enemyThreatContains?.(e))),until:this.playTime+.6};
   else if(['attack','moon','storm','signature1','signature2','ultimate'].includes(action))emit(this,action==='attack'?'swing':'skill',{castId:id,family:this.skillInfo?.(action)?.path});
   if(this.player.x!==at.x||this.player.y!==at.y)emit(this,'move',{castId:id});
   for(const e of events){if(queue)queue.push(e);else this.emit('combat-sound',e);}
   attainment(this,had);
   if(charge>0&&this.combat?.charges===0&&events.some(e=>e.kind==='hit'))emit(this,'counter',{castId:id});
   // A canceled warning is an actual interrupt, not simply the use of a seal button.
   for(const e of winds)if(e.hp>0&&e.wind<=0&&!events.some(x=>x.target===e.id&&x.kind==='suppress'))emit(this,'suppress',{castId:id,target:e.id});
   return ok;
  });
  wrap('strike',function(old,args){const [e,,source,cast]=args,before=e?.hp,s=state(this),result=old.apply(this,args);if(e&&before>e.hp){const id=s.cast??cast?.id??s.due?.audioCastId??('contact-'+(++s.serial)),hit=s.hits.get(id)||0;s.hits.set(id,hit+1);if(s.hits.size>256)s.hits.delete(s.hits.keys().next().value);emit(this,'hit',{castId:id,hit,target:e.id,source});if(e.hp<=0)emit(this,'kill',{castId:id,hit,target:e.id});}return result;});
  wrap('takeHit',function(old,args){const [e]=args,hp=this.player.hp,charges=this.combat?.charges||0,s=state(this),result=old.apply(this,args);if(this.player.hp<hp)emit(this,'hurt',{target:'player',castId:'enemy-'+(e?.id||'pulse')+'-'+(s.warnings.get(e)||++s.serial)});else if((this.combat?.charges||0)>charges)emit(this,'block',{target:e?.id});return result;});
  wrap('prepareEnemyAttack',function(old,args){const result=old.apply(this,args),e=args[0];if(e?.hp>0&&e.wind>0){const s=state(this),id=++s.serial;s.warnings.set(e,id);emit(this,'telegraph',{castId:'enemy-'+e.id+'-'+id,target:e.id});}return result;});
  wrap('enemyImpact',function(old,args){const e=args[0],s=state(this);emit(this,'launch',{castId:'enemy-'+e.id+'-'+(s.warnings.get(e)||++s.serial),target:e.id});const hp=this.player.hp,result=old.apply(this,args);if(s.dash?.played&&s.dash.until>=this.playTime&&s.dash.threats.has(e)&&this.player.hp===hp&&(!this.enemyThreatContains?.(e)||this.player.invuln>0)){emit(this,'evade',{castId:s.dash.id,target:e.id});s.dash.threats.delete(e);}return result;});
  wrap('onRealityEffect',function(old,args){const e=args[0],result=old.apply(this,args);if(['absorb','evade','counter','pursuit','suppress','weakness'].includes(e.kind))emit(this,e.kind==='weakness'?'heavy':e.kind,{castId:'reality-'+e.castId,target:e.target?.id});return result;});
  wrap('onDualLink',function(old,args){const had=this.laterStory?.dualBreath,result=old.apply(this,args);emit(this,'link',{target:args[0]?.id});attainment(this,had);return result;});
  wrap('move',function(old,args){const [entity]=args,x=entity.x,y=entity.y,result=old.apply(this,args),s=state(this);if(entity===this.player&&s.dash&&!s.dash.played&&this.player.dash>0&&(x!==entity.x||y!==entity.y)){s.dash.played=true;emit(this,'move',{castId:s.dash.id});}return result;});
  wrap('step',function(old,args){const s=state(this),before=this.enemies.map(e=>({e,wind:e.wind,followup:e.followup})),had=this.laterStory?.dualBreath;s.due=pending(this).find(h=>h.at<=this.playTime+Math.min(args[0]||0,.05)||h.delay<=Math.min(args[0]||0,.05));let result;try{result=old.apply(this,args);}finally{s.due=null;}
   for(const {e,wind,followup}of before)if(this.enemies.includes(e)&&e.hp>0&&e.wind>0&&wind>0&&e.followup&&!followup){const id=++s.serial;s.warnings.set(e,id);emit(this,'telegraph',{castId:'enemy-'+e.id+'-'+id,target:e.id});}
   attainment(this,had);return result;
  });
  wrap('enter',function(old,args){const result=old.apply(this,args);if(result){const s=state(this);s.dash=null;s.due=null;s.hits.clear();this.emit('audio-clear',{});}return result;});
 }
 return {install};
});
