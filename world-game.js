(function(root,f){const n=typeof module==='object'&&module.exports;if(n)require('./chapter-seven.js');const api=f(n?require('./save-v9.js'):root.SaveV9,n?require('./world-growth.js'):root.WorldGrowth,n?require('./save-v10.js'):root.SaveV10);if(n)module.exports=api;else root.WorldGame=api;})(globalThis,function(api,Growth,Save){
 'use strict';const Base=api.Game,baseSave=Base.prototype.save,baseLoad=Base.load;
 class Game extends Base{
  constructor(){super();this.worldGrowth=Growth.initial();this.questRewards=[];this.worldState={};this.installWorldState();}
  installWorldState(){const g=this;Object.defineProperty(this.journey,'mastery',{configurable:true,enumerable:true,get(){return g.worldGrowth[Growth.worldOf(g)].mastery;},set(v){g.worldGrowth[Growth.worldOf(g)].mastery=v;}});Object.defineProperty(this.journey,'breath',{configurable:true,enumerable:true,get(){return g.worldGrowth[Growth.worldOf(g)].mode;},set(v){g.worldGrowth[Growth.worldOf(g)].mode=v;}});}
  get level(){return this.worldGrowth?this.worldGrowth[Growth.worldOf(this)].level:this._oldLevel||1;}set level(v){if(this.worldGrowth)this.worldGrowth[Growth.worldOf(this)].level=v;else this._oldLevel=v;}
  get xp(){return this.worldGrowth?this.worldGrowth[Growth.worldOf(this)].xp:this._oldXp||0;}set xp(v){if(this.worldGrowth)this.worldGrowth[Growth.worldOf(this)].xp=v;else this._oldXp=v;}
  stats(){return this.worldGrowth?Growth.stats(this):super.stats();}
  breakthrough(){return Growth.worldOf(this)==='murim'&&super.breakthrough();}
  grantExperience(info){return Growth.grantExperience(this,info);}
  activeFamily(){return this.worldGrowth?.[Growth.worldOf(this)].equipped||this.fate.path;}
  acceptFate(path){const ok=super.acceptFate(path);if(ok&&this.worldGrowth)this.worldGrowth.murim.equipped=path;return ok;}
  awaken(path){const ok=super.awaken(path);if(ok&&this.worldGrowth)this.worldGrowth.murim.equipped=path;return ok;}
  emit(type,extra){if(this.worldGrowth&&type==='transfer')return;return super.emit(type,extra);}
  reward(e){if(!this.worldGrowth)return super.reward(e);const w=Growth.worldOf(this),before=this.level,xp=this.xp,events=this.events.length;super.reward(e);const after=this.level;let amount=this.xp-xp;for(let level=before;level<after;level++)amount+=70+level*45;this.worldGrowth[w].level=before;this.worldGrowth[w].xp=xp;this.events=this.events.filter((e,i)=>i<events||e.type!=='level-up');if(amount>0)this.grantExperience({world:w,amount});}
  interact(){if(!this.worldGrowth)return super.interact();const before=Object.fromEntries(Object.entries(this.worldGrowth).map(([k,v])=>[k,{level:v.level,xp:v.xp}])),six=this.laterStory?.six,seven=this.laterStory?.seven,point=this.nearestPoint()?.id,progress=this.progress,events=this.events.length,result=super.interact();let total=0;for(const [world,start]of Object.entries(before)){const current=this.worldGrowth[world];let amount=current.xp-start.xp;for(let level=start.level;level<current.level;level++)amount+=70+level*45;total+=amount;Object.assign(current,start);}if(total>0){this.events=this.events.filter((e,i)=>i<events||e.type!=='level-up');const split=six!==5&&this.laterStory?.six===5||seven!==5&&this.laterStory?.seven===5;if(split){for(const world of ['murim','reality'])this.grantExperience({world,amount:total/2,eventId:(this.laterStory?.seven===5?'seven':'six')+'-report-'+world});}else this.grantExperience({world:['master'].includes(point)?'murim':Growth.worldOf(this),amount:total,eventId:'quest:'+progress+':'+point+':'+(this.chapter4?.phase||0)+':'+(this.journey?.phase||0)});}return result;}
  enter(id){const previous=this.area,ok=super.enter(id);if(ok&&this.worldGrowth&&Growth.worldOf({area:previous})!==Growth.worldOf(this)){this.combat.charges=0;this.combat.echo=null;this.combat.field=null;if(this.experimentRuntime){this.experimentRuntime.pending=[];this.experimentRuntime.charge=0;this.experimentRuntime.guard=null;}}return ok;}
  save(){return Save.save(this,baseSave);}
  static load(raw){return Save.load(raw,Game,baseLoad);}
 }
 return {...api,Game,Growth};
});
