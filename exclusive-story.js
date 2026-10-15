(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./exclusive-story-data.js'):root.ExclusiveStoryData);if(n)module.exports=api;else root.ExclusiveStory=api;})(globalThis,function(Data){
 'use strict';
 function initial(){return {version:1,chapter:1,completed:[],rewards:[],records:{reality:[],murim:[]}};}
 function next(s){return Data.events[s.completed.length]||null;}
 function validate(s){
  if(!s||s.version!==1||!Array.isArray(s.completed)||s.completed.length>Data.events.length)throw Error('이야기 저장 형식 오류');
  s.completed.forEach((id,i)=>{if(Data.events[i].id!==id)throw Error('이야기 순서 오류');});
  const expected=initial();for(const id of s.completed){const e=next(expected);complete(expected,id,{kind:e.kind});}
  if(JSON.stringify(s)!==JSON.stringify(expected))throw Error('이야기 기록 오류');return s;
 }
 function complete(s,id,evidence={}){
  const e=next(s);if(!e||e.id!==id||evidence.kind!==e.kind)return {changed:false,rewards:[],scene:null};
  s.completed.push(id);s.chapter=(next(s)||e).chapter;s.records[e.world].push(id);
  const rewards=e.reward?[e.reward]:[];for(const r of rewards)if(!s.rewards.includes(r))s.rewards.push(r);
  return {changed:true,rewards,scene:e};
 }
 return {initial,next,complete,validate,...Data};
});
