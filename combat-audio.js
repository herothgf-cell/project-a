(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.CombatAudio=api;})(globalThis,function(){
 'use strict';
 const KEY='ssanggye.audio.v1',LIMIT=24,RESERVE=4;
 // One oscillator per voice: the voice cap is also the source-node cap.
 const sounds={swing:[220,.10,1],skill:[360,.16,2],move:[510,.08,1],hit:[125,.095,1],heavy:[85,.18,2],telegraph:[680,.24,4],launch:[260,.14,3],hurt:[95,.19,3],block:[420,.13,3],absorb:[185,.22,3],evade:[760,.12,2],counter:[75,.24,2],pursuit:[290,.16,2],suppress:[330,.17,2],kill:[68,.22,2],link:[530,.2,2],attain:[620,.4,2],ui:[820,.055,0]};
 const success=new Set(['evade','counter','pursuit','suppress','kill','link','attain']);
 function create({storage,contextFactory,onUnavailable}={}){
  let settings={master:1,music:1,combat:1,ui:1,muted:false},ctx=null,unlocked=false,reported=false,pendingUnlock=null,generation=0,serial=0,lastVariant=-1;
  const voices=[],seen=new Set(),grouped=new Map(),variants=new Map();
  function normalize(p){const next={...settings};for(const k of ['master','music','combat','ui'])if(typeof p?.[k]==='number'&&Number.isFinite(p[k]))next[k]=Math.max(0,Math.min(1,p[k]));if(typeof p?.muted==='boolean')next.muted=p.muted;return next;}
  try{settings=normalize(JSON.parse(storage?.getItem(KEY)||'null'));}catch(_){}
  function unavailable(){unlocked=false;if(!reported){reported=true;try{onUnavailable?.();}catch(_){}}return false;}
  function unlock(){if(pendingUnlock)return pendingUnlock;pendingUnlock=(async()=>{try{if(!ctx){const factory=contextFactory||(()=>{const C=globalThis.AudioContext||globalThis.webkitAudioContext;return C?new C():null;});ctx=factory();}if(!ctx)return unavailable();if(ctx.state==='suspended')await ctx.resume();unlocked=ctx.state==='running';return unlocked||unavailable();}catch(_){return unavailable();}})().finally(()=>{pendingUnlock=null;});return pendingUnlock;}
  function stop(v){try{v.osc.onended=null;v.osc.stop();}catch(_){}try{v.osc.disconnect();v.gain.disconnect();}catch(_){}const i=voices.indexOf(v);if(i>=0)voices.splice(i,1);}
  function clear(){generation++;for(const v of [...voices])stop(v);grouped.clear();/* Keep dedup IDs so drained pre-pause events cannot replay. */}
  function play(event={}){
   const spec=sounds[event.kind];if(!spec||!unlocked||ctx?.state!=='running'||settings.muted)return false;
   const category=event.kind==='ui'?'ui':'combat',volume=settings.master*settings[category];if(!volume)return false;
   const key=event.castId==null?null:[event.world||'',event.castId,event.hit??0,event.target??'',event.result||event.kind,event.kind].join('|');
   if(key&&seen.has(key))return false;if(key){seen.add(key);if(seen.size>1024)seen.delete(seen.values().next().value);}
   const now=ctx.currentTime;for(const v of [...voices])if(v.end<=now)stop(v);
   if(success.has(event.kind)&&now-(grouped.get(event.kind)??-Infinity)<.3)return false;
   const priority=spec[2],critical=priority>=3,ordinary=voices.filter(v=>v.priority<3);
   if(!critical&&ordinary.length>=LIMIT-RESERVE)return false;
   if(voices.length>=LIMIT){const victim=voices.reduce((a,b)=>a.priority<=b.priority?a:b);if(victim.priority>priority||!critical)return false;stop(victim);}
   let osc,gain;try{
    const variant=((variants.get(event.kind)??-1)+1)%4;variants.set(event.kind,variant);lastVariant=variant;
    const reality=event.world==='reality',motif=event.kind==='skill'?({ripple:.72,echo:1.6,seal:1.08}[event.family]||1):1,frequency=spec[0]*motif*[.94,1.04,.98,1.08][variant]*(reality?1.13:1),duration=spec[1]*(reality?.82:1),peak=.035*volume;
    osc=ctx.createOscillator();gain=ctx.createGain();osc.type=event.kind==='telegraph'?'sine':reality?'triangle':'sine';
    osc.frequency.setValueAtTime(frequency,now);osc.frequency.exponentialRampToValueAtTime(frequency*(event.kind==='telegraph'?1.45:.46),now+duration);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,peak),now+.006);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(gain);gain.connect(ctx.destination);const v={osc,gain,priority,end:now+duration+.015,generation};voices.push(v);osc.onended=()=>stop(v);osc.start(now);osc.stop(v.end);if(success.has(event.kind))grouped.set(event.kind,now);return true;
   }catch(_){try{osc?.stop();osc?.disconnect();gain?.disconnect();}catch(_){}for(const v of [...voices])if(v.osc===osc)stop(v);return unavailable();}
  }
  function setSettings(p){settings=normalize(p);clear();try{storage?.setItem(KEY,JSON.stringify(settings));}catch(_){}return {...settings};}
  async function preview(kind,world='murim'){if(!['telegraph','hit','counter'].includes(kind))return false;const requestGeneration=generation;await unlock();if(requestGeneration!==generation)return false;return play({kind,world,castId:'preview-'+(++serial)});}
  return {unlock,play,clear,preview,setSettings,settings:()=>({...settings}),inspect:()=>({voices:voices.length,critical:voices.filter(v=>v.priority>=3).length,lastVariant,unlocked,generation})};
 }
 return {create,KEY,LIMIT,RESERVE};
});
