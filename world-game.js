(function(root,f){const n=typeof module==='object'&&module.exports;if(n)require('./chapter-seven.js');const api=f(n?require('./save-v9.js'):root.SaveV9,n?require('./world-growth.js'):root.WorldGrowth,n?require('./save-v10.js'):root.SaveV10,n?require('./world-achievements.js'):root.WorldAchievements,n?require('./reality-skills.js'):root.RealitySkills,n?require('./world-reports.js'):root.WorldReports,n?require('./dual-breath.js'):root.DualBreath,n?require('./personal-news.js'):root.PersonalNews,n?require('./encounter-director.js'):root.EncounterDirector);if(n)module.exports=api;else root.WorldGame=api;})(globalThis,function(api,Growth,Save,Achievements,Reality,Reports,Dual,News,Director){
 'use strict';const Base=api.Game,baseSave=Base.prototype.save,baseLoad=Base.load;
 api.AREAS.comparison={...api.AREAS.rift,name:'현실 대응 비교 현장',sub:'선택 체험 · 처치 보상 없음',positions:[[470,700],[710,700]],points:[{id:'exit',x:150,y:970,label:'헌터 기지로 귀환',kind:'exit'}]};
 class Game extends Base{
  constructor(){super();this.worldGrowth=Growth.initial();this.questRewards=[];this.worldState={news:{items:[]}};this.installWorldState();}
  installWorldState(){const g=this;Object.defineProperty(this.journey,'mastery',{configurable:true,enumerable:true,get(){return g.worldGrowth[Growth.worldOf(g)].mastery;},set(v){g.worldGrowth[Growth.worldOf(g)].mastery=v;}});Object.defineProperty(this.journey,'breath',{configurable:true,enumerable:true,get(){return g.worldGrowth[Growth.worldOf(g)].mode;},set(v){g.worldGrowth[Growth.worldOf(g)].mode=v;}});}
  get level(){return this.worldGrowth?this.worldGrowth[Growth.worldOf(this)].level:this._oldLevel||1;}set level(v){if(this.worldGrowth)this.worldGrowth[Growth.worldOf(this)].level=v;else this._oldLevel=v;}
  get xp(){return this.worldGrowth?this.worldGrowth[Growth.worldOf(this)].xp:this._oldXp||0;}set xp(v){if(this.worldGrowth)this.worldGrowth[Growth.worldOf(this)].xp=v;else this._oldXp=v;}
  stats(){return this.worldGrowth?Growth.stats(this):super.stats();}
  collectAchievements(){if(this.worldState)return Achievements.collect(this);}
  achievementBonuses(){return Achievements.bonuses(this);}
  validateWorldState(){Achievements.validate(this);Reality.validate(this);Reports.validate(this);News.validate(this);const {achievements,reality,reports,news,potionHintSeen=false}=this.worldState;if(typeof potionHintSeen!=='boolean')throw Error('회복약 안내 기록 오류');this.worldState={achievements,reality,reports,news,potionHintSeen};if(this.contract?.status!=='idle'||this.contract?.completed)throw Error('개편판에는 반복 의뢰가 없습니다.');}
  reportFact(id){Reports.collect(this);return Reports.report(this,id);}
  publishNews(item){return News.publish(this,item);}
  refreshNews(){return News.refresh(this);}
  newsList(){return News.list(this);}
  readNews(id){return News.read(this,id);}
  unreadNews(section){return News.unread(this,section);}
  realmReady(){return News.realmReady(this);}
  allowEnemyStep(e){return Director.allow(this,e);}
  mayStartAttack(e){return Director.mayStartAttack(this,e);}
  prepareEnemyAttack(e){return Director.prepare(this,e);}
  enemyImpact(e){return Director.impact(this,e);}
  startContract(){return false;}
  claimContract(){return false;}
  cancelContract(){return false;}
  points(){return super.points().filter(p=>p.id!=='contract-board');}
  potionHint(){if(this.worldState.potionHintSeen||this.potions<=0||this.player.hp>this.stats().hp*.4)return '';this.worldState.potionHintSeen=true;return '회복약을 직접 사용하면 최대 체력의 55%를 회복합니다. 보유 '+this.potions+'개 · 자동 사용되지 않습니다.';}
  regenerateEnemy(e,amount){if(e.realitySuppressedUntil>this.playTime){if(e.hp<e.maxHp&&e.realitySuppressionCast){e.realitySuppressionProven=true;Reality.onEffect(this,e.realitySuppressionCast,e,'suppress');}return;}e.hp=Math.min(e.maxHp,e.hp+amount);}
  onRealityEffect(e){const {family,kind,target}=e,key=this.journey.selected[family];if(key&&this.journey.known.includes(key)&&(family==='ripple'&&['absorb','counter'].includes(kind)||family==='echo'&&kind==='pursuit'||family==='seal'&&kind==='weakness')){this.journey.sync[key]=2;this.onInterpretation(key,target);}Dual.contact(this,target,{id:'reality-'+e.castId,family,action:e.action,manual:e.manual});}
  realityStatus(f){return Reality.status(this,f);}
  beginComparison(){if(this.area!=='city'||!this.worldGrowth.reality.equipped)return false;return this.enter('comparison');}
  equipReality(f){if(!api.AREAS[this.area].safe||Growth.worldOf(this)!=='reality'||!['ripple','echo','seal'].includes(f)||this.realityStatus(f)==='locked')return false;this.worldGrowth.reality.equipped=f;this.realityRuntime=null;return true;}
  skillInfo(a){return this.worldGrowth&&Growth.worldOf(this)==='reality'&&(Reality.info(this,a))||super.skillInfo(a);}
  act(a,held=false){if(this.worldGrowth&&Growth.worldOf(this)==='reality'){const result=Reality.act(this,a,held);if(result!==null)return result;}return super.act(a,held);}
  takeHit(e){if(this.worldGrowth&&Growth.worldOf(this)==='reality'){if(this.area==='woundDock'&&e.laterPulse&&Math.hypot(this.player.x-730,this.player.y-700)<(this.laterStory?.passOpened?180:65))return;if(this.player.invuln>0||Reality.absorb(this,e))return;const p=this.player,damage=this.area==='returnDock'&&this.chapter4.route==='ripple'&&Math.hypot(p.x-750,p.y-610)<155?Math.round(e.damage*.5):e.damage;p.hp=Math.max(0,p.hp-damage);p.invuln=.5;p.flash=.18;this.shake=.18;this.effect('text',p.x,p.y-58,{text:'−'+damage,color:'#ffa98e',life:.7,max:.7});this.emit('sound',{name:'hurt'});return;}return super.takeHit(e);}
  strike(e,damage,source='attack',cast=null){if(this.worldGrowth&&source.startsWith('reality:')){const value=this.worldGrowth.reality.mastery[source.slice(8)]||0;damage=Math.round(damage*(1+.03*[5,10,20,30].filter(n=>value>=n).length));}if(this.worldGrowth&&Growth.worldOf(this)==='reality'&&source==='attack'&&this.legendRuntime.manual){const r=Reality.runtime(this);if(r.boost?.until>this.playTime){damage=Math.round(damage*r.boost.mult);r.boost=null;}}if(this.worldGrowth&&e?.hp>0)e.alerted=true;return super.strike(e,damage,source,cast);}
  step(dt,input={}){const at=this.playTime,area=this.area;if(this.worldGrowth&&Number.isFinite(dt)&&dt>0&&this.hitStop<=0)Director.step(this,Math.min(dt,.05));super.step(dt,input);if(this.worldGrowth&&area===this.area&&this.playTime>at&&Growth.worldOf(this)==='reality')Reality.step(this);if(this.worldState){Reports.collect(this);this.refreshNews();}}
  breakthrough(){return Growth.worldOf(this)==='murim'&&super.breakthrough();}
  grantExperience(info){return Growth.grantExperience(this,info);}
  activeFamily(){return this.worldGrowth?this.worldGrowth[Growth.worldOf(this)].equipped:this.fate.path;}
  acceptFate(path){const ok=super.acceptFate(path);if(ok&&this.worldGrowth)this.worldGrowth.murim.equipped=path;return ok;}
  awaken(path){const ok=super.awaken(path);if(ok&&this.worldGrowth)this.worldGrowth.murim.equipped=path;return ok;}
  emit(type,extra){if(this.worldGrowth&&type==='transfer')return;return super.emit(type,extra);}
  reward(e){if(e.comparison){e.rewarded=true;return;}if(!this.worldGrowth)return super.reward(e);const w=Growth.worldOf(this),before=this.level,xp=this.xp,events=this.events.length;super.reward(e);const after=this.level;let amount=this.xp-xp;for(let level=before;level<after;level++)amount+=70+level*45;this.worldGrowth[w].level=before;this.worldGrowth[w].xp=xp;this.events=this.events.filter((e,i)=>i<events||e.type!=='level-up');if(amount>0)this.grantExperience({world:w,amount});}
  interact(){if(!this.worldGrowth)return super.interact();const before=Object.fromEntries(Object.entries(this.worldGrowth).map(([k,v])=>[k,{level:v.level,xp:v.xp}])),six=this.laterStory?.six,seven=this.laterStory?.seven,point=this.nearestPoint()?.id,progress=this.progress,events=this.events.length,result=super.interact();let total=0;for(const [world,start]of Object.entries(before)){const current=this.worldGrowth[world];let amount=current.xp-start.xp;for(let level=start.level;level<current.level;level++)amount+=70+level*45;total+=amount;Object.assign(current,start);}if(total>0){this.events=this.events.filter((e,i)=>i<events||e.type!=='level-up');const split=six!==5&&this.laterStory?.six===5||seven!==5&&this.laterStory?.seven===5;if(split){for(const world of ['murim','reality'])this.grantExperience({world,amount:total/2,eventId:(this.laterStory?.seven===5?'seven':'six')+'-report-'+world});}else this.grantExperience({world:['master'].includes(point)?'murim':Growth.worldOf(this),amount:total,eventId:'quest:'+progress+':'+point+':'+(this.chapter4?.phase||0)+':'+(this.journey?.phase||0)});}return Reports.dialogue(this,point,result);}
  enter(id){const previous=this.area;if(this.worldGrowth)this.collectAchievements();const ok=super.enter(id);if(ok){if(this.worldGrowth)Director.populate(this);this.realityRuntime=null;if(id==='comparison'){this.enemies=this.enemies.slice(0,2);for(const e of this.enemies)Object.assign(e,{boss:false,comparison:true,hp:140,maxHp:140,damage:18});Object.assign(this.player,{x:400,y:700,face:0});}}if(ok&&this.worldGrowth&&Growth.worldOf({area:previous})!==Growth.worldOf(this)){this.combat.charges=0;this.combat.echo=null;this.combat.field=null;if(this.experimentRuntime){this.experimentRuntime.pending=[];this.experimentRuntime.charge=0;this.experimentRuntime.guard=null;}if(Growth.worldOf(this)==='reality'){Achievements.settle(this);if(api.AREAS[this.area].safe){this.player.hp=this.stats().hp;this.player.mp=this.stats().mp;}}}return ok;}
  save(){this.refreshNews();return Save.save(this,baseSave);}
  static load(raw){return Save.load(raw,Game,baseLoad);}
 }
 return {...api,Game,Growth};
});
