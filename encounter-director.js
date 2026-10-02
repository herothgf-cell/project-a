(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.EncounterDirector=api;})(globalThis,function(){
 'use strict';const counts={forest:7,rift:7,ruins:9,harbor:9,returnPass:9,returnDock:9,station:9,stabilization:6,woundPass:6,woundDock:6,woundCore:6};const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 // Final spawn values. Returning to an old area never scales it to the player.
 const profiles=Object.freeze(Object.fromEntries([
  ['forest',5800,300,1400,240,25],['rift',4800,250,1400,210,30],
  ['ruins',6400,340,1500,280,31],['harbor',6400,310,1600,260,32],
  ['returnPass',7400,380,1800,320,34],['returnDock',7400,370,1900,300,35],
  ['station',8400,420,2100,340,36],['stabilization',9000,440,2200,360,37],
  ['woundPass',10000,500,2400,400,38],['woundDock',10800,530,2500,420,39],
  ['woundCore',12000,560,2800,440,42]
 ].map(([id,bossHp,pressureHp,heavyHp,rangedHp,damage])=>[id,Object.freeze({bossHp,pressureHp,heavyHp,rangedHp,damage,bossWind:1,heavyWind:1.15,rangedWind:1,pressureWind:.85})])));
 function populate(g){const n=counts[g.area];if(!n)return;const original=g.enemies,mob=original.find(e=>!e.boss),boss=original.find(e=>e.boss);if(!mob||!boss)return;const out=[],centers=[{x:mob.x,y:mob.y},original[Math.floor(original.length/2)]],per=Math.ceil((n-1)/2);
  for(let i=0;i<n;i++){const isBoss=i===n-1,group=isBoss?2:Math.floor(i/per),role=isBoss?'boss':['pressure','heavy','ranged'][i%3],source=isBoss?boss:mob,e={...source,id:'group-'+group+'-'+i,boss:isBoss,group,role,awake:false,wind:0,attacks:0,rewarded:false};delete e.motion; // Presentation initializes independent transient animation state per spawn.
   const center=isBoss?boss:centers[group];let found=false;
   for(let radius=0;radius<=360&&!found;radius+=70)for(let a=0;a<8;a++){const x=center.x+Math.cos(a*Math.PI/4)*radius,y=center.y+Math.sin(a*Math.PI/4)*radius;if(g.blocked(x,y,e.r)||out.some(o=>distance(o,{x,y})<o.r+e.r+20))continue;Object.assign(e,{x,y,homeX:x,homeY:y,tx:x,ty:y});found=true;break;}if(!found)throw Error('적 배치 경로 오류: '+g.area);
   const profile=profiles[g.area];e.hp=e.maxHp=isBoss?profile.bossHp:profile[role+'Hp'];e.damage=isBoss?profile.damage:role==='heavy'?Math.round(profile.damage*.85):role==='ranged'?Math.round(profile.damage*.55):Math.round(profile.damage*.65);e.speed=role==='heavy'?70:role==='ranged'?65:95;e.profile=g.area;e.name=(isBoss?'':role==='heavy'?'강타 · ':role==='ranged'?'사격 · ':'압박 · ')+source.name;out.push(e);
  }g.enemies=out;
 }
 function step(g,dt){const groups=new Set(g.enemies.filter(e=>e.hp>0&&(distance(e,g.player)<=350||e.alerted)).map(e=>e.group));for(const e of g.enemies){if(e.group===undefined)continue;if(groups.has(e.group))e.awake=true;if(distance(e,{x:e.homeX,y:e.homeY})>600){e.returning=true;e.awake=false;e.wind=0;}if(e.returning){const dx=e.homeX-e.x,dy=e.homeY-e.y,n=Math.hypot(dx,dy);g.move(e,dx/Math.max(n,1)*100*dt,dy/Math.max(n,1)*100*dt);if(n<15){e.returning=false;e.alerted=false;}}}}
 function allow(g,e){return e.group===undefined||e.awake&&!e.returning;}
 function mayStartAttack(g,e){if(!allow(g,e))return false;if(e.role==='ranged')return true;return g.enemies.filter(x=>x!==e&&x.hp>0&&x.group===e.group&&x.role!=='ranged'&&x.wind>0).length<2;}
 function prepare(g,e){if(!e.role)return;const profile=profiles[g.area];if(profile){e.wind=e.windMax=profile[e.role+'Wind'];if(e.boss&&e.hp<e.maxHp*.5)e.wind=e.windMax=.8;}if(e.role==='heavy'){e.pattern='heavy';e.range=95;}if(e.role==='ranged'){e.pattern='shot';e.range=24;}e.telegraph={x:e.x,y:e.y,tx:e.tx,ty:e.ty,width:24};}
 function segmentDistance(p,t){const dx=t.tx-t.x,dy=t.ty-t.y,u=Math.max(0,Math.min(1,((p.x-t.x)*dx+(p.y-t.y)*dy)/(dx*dx+dy*dy||1)));return distance(p,{x:t.x+u*dx,y:t.y+u*dy});}
 function impact(g,e){if(e.pattern!=='shot')return false;const t=e.telegraph;if(!t)return false;g.effect('fate-chain',t.x,t.y,{path:'ripple',tx:t.tx,ty:t.ty,life:.25,max:.25});if(segmentDistance(g.player,t)<t.width+g.player.r*.4&&g.lineClear(e,g.player))g.takeHit(e);return true;}
 function contains(p,e){return e.pattern==='shot'&&e.telegraph?segmentDistance(p,e.telegraph)<e.telegraph.width+p.r*.4:distance(p,{x:e.tx,y:e.ty})<e.range+p.r*.4;}
 return {profiles,counts,populate,step,allow,mayStartAttack,prepare,impact,segmentDistance,contains};
});
