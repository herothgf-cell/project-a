/* Local opt-in observations only. Never imports a game, reads saves, or sends data. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.ReturnProofTelemetry=api;})(globalThis,function(){
 'use strict';
 function create(metadata={},options={}){const enabled=options.enabled===true,limit=Math.max(1,Math.min(2000,Math.floor(options.maxEvents)||2000)),events=[];let dropped=0,serial=0;const meta={};for(const k of ['build','device','profile','feedback','checkpoint'])if(typeof metadata[k]==='string')meta[k]=metadata[k].slice(0,80);const session=Math.random().toString(36).slice(2)+Date.now().toString(36);
  function record(type,data={}){if(!enabled)return;try{if(!['act','proof-start','proof-evidence','proof-result','proof-choice','proof-reported','response-feedback','help','checkpoint'].includes(type))return;const row={n:++serial,type};for(const k of ['action','mode','family','kind','outcome','choice','consumer','targetId','castId','profileVersion','at','manual','eligible','hp','mp','attack']){const v=data[k];if(typeof v==='string')row[k]=v.slice(0,80);else if(typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v))row[k]=v;}if(events.length===limit){events.shift();dropped++;}events.push(row);}catch{/* Observability must never block play. */}}
  return {record,export:()=>JSON.stringify({version:1,session,metadata:meta,dropped,events}),clear:()=>{events.length=0;dropped=0;serial=0;}};
 }
 return {create};
});
