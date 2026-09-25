/* DOM-free simulation. Rendering and controls consume, never mutate, effects. */
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./world.js'):root.WorldData,typeof module==='object'&&module.exports?require('./fate.js'):root.FateRules);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.DualWorld=api;
})(globalThis,function(data,Fate){
  'use strict';
  const {VERSION,AREAS,QUESTS,SKILLS}=data;
  Fate.install(AREAS);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const trainingFor=s=>s>=10?3:s>=4?2:s>=2?1:0;
  const dialog=(title,text,portrait='system')=>({type:'dialog',title,text,portrait});
  class Game {
    constructor(){
      Object.assign(this,{area:'city',progress:0,training:0,level:1,xp:0,gold:40,potions:3,upgrade:0,clears:0,harborClears:0,playTime:0,combo:0,lastAttack:-10,shake:0,notice:0});
      this.player={swing:0,x:640,y:650,r:16,hp:120,mp:80,face:-Math.PI/2,invuln:0,flash:0,dash:0,dx:0,dy:0,walking:false,cool:{attack:0,moon:0,storm:0,dash:0,potion:0}};
      this.events=[];this.enemies=[];this.fx=[];this.activated=[];
      Fate.init(this);this.enter('city');this.events=[];
    }
    stats(){return {hp:120+(this.level-1)*18,mp:80+(this.level-1)*5,attack:16+(this.level-1)*3+this.training*6+this.upgrade*4,next:70+this.level*45};}
    emit(type,extra={}){this.events.push({type,...extra});}
    toast(text){this.emit('toast',{text});}
    effect(kind,x,y,extra={}){this.fx.push({kind,x,y,life:.6,max:.6,...extra});if(this.fx.length>160)this.fx.shift();}
    enter(id){
      if(!Object.hasOwn(AREAS,id))return false;
      const old=AREAS[this.area],a=AREAS[id],p=this.player;this.area=id;
      [p.x,p.y]=a.spawn;p.dash=0;p.invuln=1;p.flash=0;p.walking=false;p.swing=0;
      this.enemies=[];this.fx=[];this.activated=[];this.combo=0;
      for(const k in p.cool)p.cool[k]=0;
      if(a.safe){p.hp=this.stats().hp;p.mp=this.stats().mp;}
      else {
        const scale=id==='harbor'?1+Math.min(this.harborClears,30)*.15:id==='rift'?1+Math.min(this.clears,30)*.12:1;
        a.positions.forEach(([x,y],i)=>{
          const boss=i===a.positions.length-1,hp=Math.round((boss?a.bossHp:a.hp)*scale);
          this.enemies.push({id:'enemy-'+i,x,y,r:boss?31:19,boss,hp,maxHp:hp,name:boss?a.boss:a.mob,kind:boss?a.bossKind:a.mobKind,damage:Math.round((boss?a.damage*1.7:a.damage)*scale),speed:boss?78:94,cd:.6+i*.09,wind:0,windMax:1,tx:x,ty:y,range:boss?130:64,flash:0,attacks:0,pattern:'strike',rewarded:false});
        });
      }
      Fate.entry(this);this.emit('area',{text:a.name});
      if(old.world==='무림'&&a.world==='현실'&&this.training>0)this.emit('transfer',{title:'무공이 현실에 남았다',text:`공격력 ${this.stats().attack} · 전승 무공 ${Math.min(2,this.training)}개\n${this.training>=3?'경계 공명 · 받는 피해 15% 감소\n':''}\n다른 하늘 아래에서도, 몸은 같은 호흡을 기억한다.`});
      return true;
    }
    blocked(x,y,r=16){
      const a=AREAS[this.area];if(x<24+r||y<24+r||x>a.w-24-r||y>a.h-24-r)return true;
      return a.blocks.some(b=>Math.hypot(x-clamp(x,b.x,b.x+b.w),y-clamp(y,b.y,b.y+b.h))<r);
    }
    move(e,dx,dy){
      const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/10));
      for(let i=0;i<steps;i++){
        if(!this.blocked(e.x+dx/steps,e.y,e.r))e.x+=dx/steps;
        if(!this.blocked(e.x,e.y+dy/steps,e.r))e.y+=dy/steps;
      }
    }
    lineClear(a,b){const n=Math.ceil(dist(a,b)/16);for(let i=1;i<n;i++)if(this.blocked(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,1))return false;return true;}
    guardsAlive(){return this.enemies.some(e=>!e.boss&&e.hp>0);}
    seals(){return AREAS[this.area].points.filter(o=>o.kind==='seal');}
    bossLocked(){return this.guardsAlive()||this.seals().some(o=>!this.activated.includes(o.id));}
    nearestPoint(){return AREAS[this.area].points.filter(o=>dist(o,this.player)<95).sort((a,b)=>dist(a,this.player)-dist(b,this.player))[0]||null;}
    target(){
      const custom=Fate.objective(this,AREAS);if(custom)return custom.target;
      const a=AREAS[this.area],s=this.progress,points=a.points;
      if(!a.safe){
        const done={forest:3,rift:6,ruins:9,harbor:12}[this.area];
        if(s>=done)return points.find(o=>o.id==='exit');
        const enemies=this.enemies.filter(e=>e.hp>0&&!e.boss).sort((a,b)=>dist(a,this.player)-dist(b,this.player));
        if(enemies[0])return {...enemies[0],label:enemies[0].name,kind:'enemy'};
        const node=this.seals().filter(o=>!this.activated.includes(o.id)).sort((a,b)=>dist(a,this.player)-dist(b,this.player))[0];
        if(node)return node;
        const boss=this.enemies.find(e=>e.boss&&e.hp>0);return boss?{...boss,label:boss.name,kind:'enemy'}:points[0];
      }
      let id='portal';
      if(this.area==='city')id=[0,4,6,10,12].includes(s)?'warden':s===5?'gate':s===11?'harbor':'portal';
      else id=[1,3,7,9].includes(s)?'master':s===2?'forest':s===8?'ruins':'portal';
      return points.find(o=>o.id===id)||points[0];
    }
    objective(){
      const custom=Fate.objective(this,AREAS);if(custom)return custom;
      const t=this.target(),a=AREAS[this.area];let text=QUESTS[this.progress][1];
      if(a.safe&&t.id==='portal')text=`${a.world==='현실'?'무림':'현실'}으로 이동하세요. 금빛 방향 표식을 따라 경계석을 찾으세요.`;
      if(a.safe&&t.id==='master')text='백련 사부에게 다가가 대화하세요.';
      if(!a.safe){
        if(t.id==='exit')text='이 지역의 이야기 목표를 마쳤습니다. 귀환 후 다음 인물에게 보고하세요.';
        else if(this.guardsAlive())text=`호위 ${this.enemies.filter(e=>!e.boss&&e.hp===0).length} / ${this.enemies.filter(e=>!e.boss).length} · 붉은 공격 예고를 피하며 처치하세요.`;
        else if(t.kind==='seal')text=`${this.area==='harbor'?'침식 닻':'인장'} ${this.activated.length} / ${this.seals().length} · 표식 가까이에서 E / 대화·이동`;
        else text='보스의 보호막이 해제되었습니다. 공격 예고를 피하고 무공을 사용하세요.';
      }
      return {title:QUESTS[this.progress][0],text,target:t,chapter:this.progress>=7?2:1};
    }
    interact(){
      const o=this.nearestPoint(),s=this.progress;if(!o)return {type:'toast',text:'금빛 표식 가까이에서 대화 / 이동을 누르세요.'};
      const fateEvent=Fate.interact(this,o);if(fateEvent)return fateEvent;
      if(o.kind==='shop')return {type:'shop',title:o.label};
      if(o.kind==='rest'){this.player.hp=this.stats().hp;this.player.mp=this.stats().mp;this.effect('heal',o.x,o.y);return dialog('호흡을 고르다','체력과 내력이 모두 회복되었습니다.\n금화가 부족해도 이곳에서는 무료로 쉴 수 있습니다.');}
      if(o.id==='warden'){
        if(s===0){this.progress=1;return dialog('서린 · 낯선 신호','경계석이 당신에게만 반응하고 있어요.\n푸른 균열 너머에, 또 다른 세계가 보인다고 했죠?\n\n동쪽 경계석을 조사해 주세요. 금빛 방향 표식을 따라가면 됩니다.','warden');}
        if(s===4){this.progress=5;return dialog('서린 · 현실에 남은 검','손에 굳은살이 늘었네요. 사흘도 지나지 않았는데…\n\n그 호흡, 이곳에서도 쓸 수 있나요?\n남동쪽 D급 균열을 맡아 주세요. 월영참과 천뢰격이 그대로 이어집니다.','warden');}
        if(s===6){this.progress=7;return dialog('제2장 · 잔월의 서약','감시자의 잔해에서 이 검은 인장이 나왔어요.\n그런데 항만의 실종 현장에도 같은 문양이 있습니다.\n\n두 세계의 균열이 연결되어 있다면…\n무림의 사부에게 이 인장을 보여 주세요.','warden');}
        if(s===10){this.progress=11;return dialog('서린 · 검은 파도','월영문의 봉인이… 이쪽 항만을 지탱하고 있었다고요?\n\n동북쪽 항만 출입구를 열어두었어요.\n호위를 처치하고 두 침식 닻을 해제해야 집행관을 벨 수 있습니다.','warden');}
        return dialog('서린 · 관리관',s>=12?'항만의 신호가 잠잠해졌어요.\n당신이 돌아올 자리는 여기에도, 저편에도 있습니다.\n\n제2장 완료. 보급과 강화를 마친 뒤 더 강한 균열에 다시 도전할 수 있어요.':'경계 너머의 힘을 믿어요.\n화면의 목표 안내를 따라가세요. 출발 전 보급소에서 회복약을 준비할 수 있습니다.','warden');
      }
      if(o.id==='master'){
        if(s===1){this.progress=2;this.training=1;return dialog('백련 · 첫 번째 호흡','다른 하늘에서 온 제자로구나.\n검을 휘두르는 것은 팔이 아니라 호흡이다.\n\n월영참 습득 · K / 月\n동남쪽 흑풍 죽림에서 호위를 쓰러뜨리고 두목을 제압하거라.','master');}
        if(s===3){this.progress=4;this.training=2;this.gold+=80;return dialog('백련 · 경계를 베는 검','두려워도 한 발을 내딛었구나.\n이제 청명검과 천뢰격을 가져가거라.\n몸에 새긴 것은, 어느 세계에서도 사라지지 않는다.\n\n천뢰격 습득 · L / 雷 · 금화 +80\n경계석으로 현실에 돌아가 서린에게 보고하자.','master');}
        if(s===7){this.progress=8;return dialog('백련 · 잔월의 흔적','월영문의 인장이다. 닫힌 문을 누군가 다시 열었군.\n\n동북쪽 월영 폐사로 가거라.\n파수꾼을 물리친 뒤 세 인장을 깨우면 수문장의 보호막이 사라진다.\n\n돌아오면 두 세계의 호흡을 하나로 잇는 법을 알려주마.','master');}
        if(s===9){this.progress=10;this.training=3;this.gold+=120;return dialog('백련 · 경계 공명','저쪽의 파도와 이쪽의 달은 같은 상처를 비추고 있다.\n두 세계를 오간 네 호흡만이 그 틈을 메울 수 있지.\n\n경계 공명 완성 · 공격력 +6 · 받는 피해 15% 감소\n금화 +120 · 현실의 서린에게 돌아가자.','master');}
        return dialog('백련 · 사부','붉은 원은 적이 노리는 자리다.\n회피로 벗어난 뒤, 비어 있는 틈을 베어라.\n\n무공과 장비의 성장은 현실에도 그대로 남는다.','master');
      }
      if(o.id==='portal'){
        if(s===0)return dialog('잠든 경계석','먼저 관리관 서린에게 경계석에 대해 물어보세요.');
        this.enter(this.area==='city'?'village':'city');return {type:'travel'};
      }
      if(o.kind==='gate'){
        if(s<o.need)return dialog('아직 닫힌 길','먼저 현재 이야기 목표를 완료하세요.\n다음 인물과 출입구는 금빛 표식으로 안내됩니다.');
        this.enter(o.to);return {type:'travel'};
      }
      if(o.kind==='seal'){
        if(this.activated.includes(o.id))return {type:'toast',text:'이미 해제한 봉인입니다.'};
        if(this.guardsAlive())return {type:'toast',text:'호위가 봉인을 지키고 있습니다. 먼저 호위를 모두 처치하세요.'};
        this.activated.push(o.id);this.effect('seal',o.x,o.y,{life:1,max:1});this.emit('sound',{name:'reward'});
        return {type:'toast',text:this.bossLocked()?`${o.label} 해제 · ${this.activated.length}/${this.seals().length}`:'모든 봉인 해제 · 보스의 보호막이 사라졌습니다!'};
      }
      if(o.id==='exit'){this.retreat();return {type:'travel'};}
      return null;
    }
    buy(item){
      if(!AREAS[this.area].safe||!['potion','upgrade'].includes(item))return false;
      const cost=item==='potion'?25:80+this.upgrade*60;
      if(this.gold<cost||item==='potion'&&this.potions>=99||item==='upgrade'&&this.upgrade>=10)return false;
      this.gold-=cost;if(item==='potion')this.potions++;else this.upgrade++;
      this.toast(item==='potion'?'회복약 +1':`무기 강화 +${this.upgrade} · 두 세계 공격력 +4`);this.emit('sound',{name:'reward'});return true;
    }
    skillInfo(action){return Fate.info(this,action)||SKILLS[action];}
    beginTrial(path){return Fate.begin(this,path);}
    acceptFate(path){return Fate.accept(this,path);}
    act(action){
      if(Fate.names.includes(action))return Fate.act(this,action);
      if(!Object.hasOwn(SKILLS,action))return false;
      const p=this.player,k=SKILLS[action];if(p.hp<=0||p.cool[action]>0)return false;
      if(this.training<k.need||p.mp<k.cost)return false;
      if(action==='potion'){
        if(this.potions<=0||p.hp>=this.stats().hp)return false;
        this.potions--;p.hp=Math.min(this.stats().hp,p.hp+Math.ceil(this.stats().hp*.55));p.cool.potion=1;
        this.effect('heal',p.x,p.y,{life:1,max:1});this.emit('sound',{name:'heal'});return true;
      }
      p.cool[action]=k.cool;p.mp-=k.cost;
      if(action==='dash'){
        p.dash=.17;p.invuln=.33;p.dx=Math.cos(p.face);p.dy=Math.sin(p.face);
        this.effect('dash',p.x,p.y,{angle:p.face,life:.3,max:.3});this.emit('sound',{name:'dash'});return true;
      }
      p.swing=.24;
      if(action==='attack'){this.combo=this.playTime-this.lastAttack<1.1?this.combo%3+1:1;this.lastAttack=this.playTime;}
      const heavy=action==='attack'&&this.combo===3;
      const range=action==='storm'?250:action==='moon'?215:heavy?120:96;
      const nearest=this.enemies.filter(e=>e.hp>0&&dist(p,e)<range+60&&this.lineClear(p,e)).sort((a,b)=>dist(a,p)-dist(b,p))[0];
      if(nearest)p.face=Math.atan2(nearest.y-p.y,nearest.x-p.x);
      this.effect(action==='storm'?'storm':'slash',p.x,p.y,{angle:p.face,range,combo:this.combo,skill:action,life:action==='storm'?.6:.25,max:action==='storm'?.6:.25});
      this.emit('sound',{name:action==='attack'?'slash':'skill'});
      for(const e of this.enemies){
        if(e.hp<=0||dist(p,e)>range+e.r||!this.lineClear(p,e))continue;
        const angle=Math.atan2(e.y-p.y,e.x-p.x);if(action!=='storm'&&Math.cos(angle-p.face)<-.05)continue;
        if(e.boss&&this.bossLocked()){if(this.notice<=0){this.effect('text',e.x,e.y-65,{text:'보호막 · 호위 / 봉인',color:'#c8ced2',life:1,max:1});this.notice=1;}continue;}
        const mult=action==='storm'?3.6:action==='moon'?2.4:heavy?1.7:this.combo===2?1.1:1;
        this.strike(e,Math.round(this.stats().attack*mult),action);
      }
      return true;
    }
    strike(e,damage,source='attack'){
      if(e.hp<=0||e.boss&&this.bossLocked())return 0;
      const before=e.hp;e.hp=Math.max(e.trial&&!this.trial?.feat?1:0,e.hp-damage);e.flash=.17;
      this.shake=source==='attack'?.06:.13;this.hitStop=source==='attack'?.025:.045;
      this.effect('text',e.x,e.y-50,{text:String(before-e.hp),color:source==='attack'?'#fff4d5':Fate.PATHS[Fate.active(this)]?.color||'#e2d493',life:.8,max:.8});
      this.effect('spark',e.x,e.y-20,{life:.3,max:.3});
      if(source!=='ultimate')this.fate.focus=Math.min(100,this.fate.focus+(source==='attack'?6:11));
      if(!e.boss&&!e.trial){const angle=Math.atan2(e.y-this.player.y,e.x-this.player.x);this.move(e,Math.cos(angle)*14,Math.sin(angle)*14);}
      if(e.hp===0)this.reward(e);return before-e.hp;
    }
    takeHit(e){
      const p=this.player;if(p.invuln>0)return;
      const base=Math.round(e.damage*(this.training>=3?.85:1)),damage=Fate.incoming(this,e,base);
      p.hp=Math.max(0,p.hp-damage);p.invuln=.5;if(!damage)return;p.flash=.18;this.shake=.18;
      this.effect('text',p.x,p.y-58,{text:`−${damage}`,color:'#ffa98e',life:.7,max:.7});this.emit('sound',{name:'hurt'});
    }
    reward(e){
      if(e.rewarded)return;e.rewarded=true;
      if(e.trial){Fate.reward(this,e);return;}
      const gold=e.boss?110:16;this.gold=Math.min(999999,this.gold+gold);this.xp+=e.boss?145:32;
      this.effect('text',e.x,e.y-20,{text:`+${gold} 금화`,color:'#d5bd82',life:1.1,max:1.1});this.emit('sound',{name:'reward'});
      while(this.level<80&&this.xp>=this.stats().next){this.xp-=this.stats().next;this.level++;this.player.hp=Math.min(this.stats().hp,this.player.hp+45);this.player.mp=this.stats().mp;this.toast(`경지 상승 · Lv.${this.level}`);this.effect('heal',this.player.x,this.player.y,{life:1,max:1});}
      this.xp=Math.min(this.xp,this.stats().next-1);
      if(e.boss){
        if(Fate.reward(this,e))return;
        const next={forest:3,rift:6,ruins:9,harbor:12}[this.area];
        if(this.area==='rift')this.clears++;if(this.area==='harbor')this.harborClears++;
        if(this.progress===next-1)this.progress=next;
        const titles={forest:'죽림에 다시 고요가',rift:'제1장 완료 · 두 세계의 검',ruins:'달빛 아래 되살아난 인장',harbor:'제2장 완료 · 잔월의 서약'};
        const body={forest:'두목의 칼이 땅에 떨어졌다.\n청운촌으로 돌아가 백련 사부에게 보고하자.',rift:'무림에서 새긴 무공으로 현실의 균열을 베었다.\n기지의 서린이 새로운 신호를 기다리고 있다.',ruins:'세 인장에 다시 빛이 깃들었다.\n백련 사부에게 돌아가 경계 공명을 완성하자.',harbor:'검은 파도가 가라앉고, 두 세계에 같은 달이 떠올랐다.\n당신은 이제 돌아갈 곳을 두 개 가진 사람이다.\n\n더 강해진 균열과 항만에 다시 도전할 수 있습니다.'};
        this.emit('victory',{title:titles[this.area],text:body[this.area]});
      }
    }
    step(dt,input={}){
      if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);
      if(this.hitStop>0){this.hitStop=Math.max(0,this.hitStop-dt);return;}
      Fate.tick(this,dt);this.playTime+=dt;
      const p=this.player;for(const k in p.cool)p.cool[k]=Math.max(0,p.cool[k]-dt);
      p.swing=Math.max(0,(p.swing||0)-dt);p.invuln=Math.max(0,p.invuln-dt);p.flash=Math.max(0,p.flash-dt);this.shake=Math.max(0,this.shake-dt);this.notice=Math.max(0,this.notice-dt);p.mp=Math.min(this.stats().mp,p.mp+dt*6);
      let x=Number.isFinite(input.x)?clamp(input.x,-1,1):0,y=Number.isFinite(input.y)?clamp(input.y,-1,1):0;
      const n=Math.hypot(x,y);if(n>1){x/=n;y/=n;}p.walking=n>.1||p.dash>0;
      if(p.dash>0){p.dash=Math.max(0,p.dash-dt);this.move(p,p.dx*650*dt,p.dy*650*dt);}
      else {if(n>.1)p.face=Math.atan2(y,x);this.move(p,x*215*dt,y*215*dt);}
      if(input.attack)this.act('attack');
      for(const e of this.enemies){
        e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,(e.stun||0)-dt);e.root=Math.max(0,(e.root||0)-dt);if(e.stun>0)continue;if(e.hp<=0||e.boss&&this.bossLocked())continue;
        e.cd=Math.max(0,e.cd-dt);const d=dist(e,p);
        if(e.wind>0){
          e.wind-=dt*(Fate.speed(this,e)<1?.6:1);
          if(e.wind<=0){
            this.effect('impact',e.tx,e.ty,{range:e.range,pattern:e.pattern,life:.42,max:.42});
            if(e.pattern==='dive'){this.move(e,e.tx-e.x,e.ty-e.y);}
            if(Math.hypot(p.x-e.tx,p.y-e.ty)<e.range+p.r*.4&&p.invuln<=0){
              this.takeHit(e);
            }
            e.cd=e.boss?(e.hp<e.maxHp*.5?1.2:1.7):1.5;
          }
        }else if(d<(e.boss?270:e.kind==='shade'||e.kind==='drone'?240:100)&&e.cd<=0&&this.lineClear(e,p)){
          e.attacks++;e.windMax=e.trial?1.3:e.boss?(e.hp<e.maxHp*.5?.75:1):.85;e.wind=e.windMax;
          e.pattern=e.boss&&e.attacks%2===0?'sweep':e.boss&&['tide','guardian'].includes(e.kind)?'dive':'strike';
          e.tx=e.pattern==='sweep'?e.x:p.x;e.ty=e.pattern==='sweep'?e.y:p.y;e.range=e.pattern==='sweep'?175:e.boss?108:e.kind==='shade'||e.kind==='drone'?72:62;
        }else if(d<570&&d>60&&e.root<=0){
          const angle=Math.atan2(p.y-e.y,p.x-e.x),before={x:e.x,y:e.y};this.move(e,Math.cos(angle)*e.speed*Fate.speed(this,e)*dt,Math.sin(angle)*e.speed*Fate.speed(this,e)*dt);
          if(dist(before,e)<.2)this.move(e,Math.cos(angle+1.1)*e.speed*Fate.speed(this,e)*dt,Math.sin(angle+1.1)*e.speed*Fate.speed(this,e)*dt);
        }
      }
      for(const f of this.fx)f.life-=dt;this.fx=this.fx.filter(f=>f.life>0);
      if(p.hp<=0){const inTrial=!!this.trial;this.gold=Math.max(0,this.gold-(inTrial?0:15));this.enter(AREAS[this.area].world==='무림'?'village':'city');this.emit('defeat',{title:'쓰러져도, 성장은 남는다',text:(inTrial?'시험은 금화 손실 없이 다시 도전할 수 있습니다. ':'거점에서 체력과 내력을 회복했습니다. 금화 최대 15를 잃었지만 ')+ '  무공과 이야기 진행은 유지됩니다.\n\n호위와 봉인은 재입장하면 초기화됩니다. 붉은 공격 예고에서 회피하고, 회복약을 준비하세요.'});}
    }
    retreat(){if(!AREAS[this.area].safe)this.enter(AREAS[this.area].world==='무림'?'village':'city');}
    save(){const d={version:3,fate:this.fate};for(const k of ['area','progress','training','level','xp','gold','potions','upgrade','clears','harborClears','playTime'])d[k]=this[k];return JSON.stringify(d);}
    static load(text){
      const d=JSON.parse(text);if(!d||Array.isArray(d)||![1,2,3].includes(d.version)||!Object.hasOwn(AREAS,d.area))throw Error('지원하지 않거나 손상된 저장입니다.');
      const ranges={progress:[0,d.version===1?6:12],training:[0,3],level:[1,80],xp:[0,3670],gold:[0,999999],potions:[0,99],upgrade:[0,10],clears:[0,99999]};
      for(const [k,[lo,hi]] of Object.entries(ranges))if(!Number.isInteger(d[k])||d[k]<lo||d[k]>hi)throw Error(`잘못된 저장 항목: ${k}`);
      if(d.xp>=70+d.level*45||d.training!==trainingFor(d.progress))throw Error('진행과 성장 정보가 일치하지 않습니다.');
      if(d.version>=2&&(!Number.isInteger(d.harborClears)||d.harborClears<0||d.harborClears>99999||!Number.isFinite(d.playTime)||d.playTime<0||d.playTime>1e10))throw Error('잘못된 저장 시간 또는 클리어 수입니다.');
      const g=new Game();for(const k of Object.keys(ranges))g[k]=d[k];g.harborClears=d.harborClears||0;g.playTime=d.playTime||0;
      if(d.version===3)g.fate=Fate.validate(d.fate,d.progress);
      g.enter(AREAS[d.area].safe?d.area:AREAS[d.area].world==='무림'?'village':'city');g.events=[];return g;
    }
  }
  return {VERSION,Game,AREAS,QUESTS,SKILLS,clamp,dist,Fate};
});
