(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.ExclusiveTravel=api;})(globalThis,function(){
 'use strict';const WAIT=360,BREATHS=10;
 function initial(){return {version:1,minutes:0,arrivedAt:null};}
 function validate(s){if(!s||s.version!==1||!Number.isFinite(s.minutes)||s.minutes<0||(s.arrivedAt!==null&&(!Number.isFinite(s.arrivedAt)||s.arrivedAt<0||s.arrivedAt>s.minutes)))throw Error('왕래 시간 기록 오류');return s;}
 function remaining(s){validate(s);return s.arrivedAt===null?0:Math.max(0,WAIT-(s.minutes-s.arrivedAt));}
 function tick(s,seconds){validate(s);if(!Number.isFinite(seconds)||seconds<0)throw Error('게임 시간 오류');s.minutes+=seconds/6;}
 function rest(s){const elapsed=remaining(s);s.minutes+=elapsed;return elapsed;}
 function canCross(s,{area,companions=0}={}){if(!['home','shrine'].includes(area))return {ok:false,reason:'자취방 또는 폐사당의 표식에서만 건널 수 있습니다.'};if(companions)return {ok:false,reason:'살아 있는 동행자는 함께 건널 수 없습니다.'};if(remaining(s)>1e-9)return {ok:false,reason:'도착 후 여섯 게임 시간이 필요합니다. 휴식으로 남은 시간을 보낼 수 있습니다.'};return {ok:true,reason:''};}
 function cancel(g){g.travelRuntime=null;}
 function start(g){const result=canCross(g.worldState.exclusiveTravel,g);if(result.ok)g.travelRuntime={area:g.area,x:g.player.x,y:g.player.y,hp:g.player.hp,seconds:0};return result;}
 function update(g,dt,input={}){
  const r=g.travelRuntime;if(!r)return false;
  if(!Number.isFinite(dt)||dt<0)throw Error('호흡 시간 오류');
  if(input.paused||input.cancel||input.x||input.y||input.attack||g.area!==r.area||g.player.x!==r.x||g.player.y!==r.y||g.player.hp<r.hp||!canCross(g.worldState.exclusiveTravel,g).ok){cancel(g);return false;}
  r.seconds+=dt;if(r.seconds+1e-9<BREATHS)return false;
  cancel(g);const to=r.area==='home'?'shrine':'home';
  if(g.enter(to)===false)return false;
  g.worldState.exclusiveTravel.arrivedAt=g.worldState.exclusiveTravel.minutes;
  g.onStoryCrossing?.(to);return true;
 }
 return {WAIT,BREATHS,initial,validate,remaining,tick,rest,canCross,start,update,cancel};
});
