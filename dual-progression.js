/* Completion ledger for the post-return loop. No hit-to-completion conversion. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.DualProgression=api;})(globalThis,function(){
 'use strict';
 const skills=['samjae','arc','plum-first','plum-second','plum-third','g1','g2','r1'];
 const variants={training:['samjae','plum-first','r1'],bounty:['scattered','elite'],raid:['basic','swarm','core']};
 const initial=(legacyTraining=false)=>({version:1,legacyTraining,lateAccepted:false,counts:Object.fromEntries(skills.map(k=>[k,0])),raids:0,bounties:0,serial:0,run:null,r1:false,upgrades:{g1:0,g2:0,r1:0},slots:['g1','g2']});
 const integer=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000;
 function allowed(kind,skill){return kind==='raid'?['g1','g2','r1'].includes(skill):kind==='bounty'?skills.slice(0,5).includes(skill):skills.includes(skill);}
 function begin(s,kind,variant){if(s.run||!variants[kind]?.includes(variant)||kind==='raid'&&variant!=='basic'&&!s.raids||s.serial>=1000000)return false;s.run={id:++s.serial,kind,variant,segment:0,used:[],banked:[]};return true;}
 function use(s,skill){const r=s.run;if(!r||!allowed(r.kind,skill)||r.kind==='training'&&skill!==r.variant)return false;if(!r.used.includes(skill))r.used.push(skill);return true;}
 function checkpoint(s){const r=s.run;if(!r||r.segment!==0)return false;r.banked=[...new Set([...r.banked,...r.used])];r.used=[];r.segment=1;return true;}
 function retry(s){if(!s.run)return false;s.run.used=[];return true;}
 function abandon(s){if(!s.run)return false;s.run=null;return true;}
 function finish(s){const r=s.run;if(!r)return false;const used=[...new Set([...r.banked,...r.used])];if(r.kind==='training'&&!used.includes(r.variant))return false;const first=r.kind==='raid'&&!s.raids;
  for(const id of used)s.counts[id]=Math.min(1000000,s.counts[id]+1);
  if(r.kind==='raid')s.raids++;if(r.kind==='bounty')s.bounties++;
  const receipt={kind:r.kind,variant:r.variant,skills:used,crystal:r.kind==='raid'?(first?4:2):0,scroll:r.kind==='bounty'?1:0,xp:r.kind==='raid'?(first?120:80):r.kind==='bounty'?40:0};s.run=null;return receipt;
 }
 function walletDelta(s){if(!s)return {crystal:0,seal:0};const c=s.counts,basic=c.samjae>=3,second=c['plum-second']>=3,third=c['plum-third']>=3,spent=Object.values(s.upgrades).reduce((n,v)=>n+(v===2?5:v===1?2:0),0);return {crystal:(s.raids?2+s.raids*2:0)+(basic?2:0)+(second?2:0)+(third?3:0)-(s.r1?2:0)-spent,seal:(basic&&!s.legacyTraining?1:0)+(second?1:0)+(third?1:0)-(s.r1?1:0)};}
 const stage=n=>n>=8?2:n>=3?1:0;
 function validate(s){const fail=()=>{throw Error('양세계 완료 원장 오류');};if(!s||s.version!==1||!['legacyTraining','lateAccepted','r1'].every(k=>typeof s[k]==='boolean')||!['serial','raids','bounties'].every(k=>integer(s[k]))||s.raids+s.bounties>s.serial)fail();
  if(!s.counts||Object.keys(s.counts).length!==skills.length||skills.some(k=>!integer(s.counts[k])||s.counts[k]>s.serial))fail();
  if(!s.upgrades||Object.keys(s.upgrades).length!==3||['g1','g2','r1'].some(k=>![0,1,2].includes(s.upgrades[k])||s.upgrades[k]>stage(s.counts[k])))fail();
  if(s.r1&&s.counts['plum-first']<3||!s.r1&&(s.counts.r1||s.upgrades.r1))fail();
  if(!Array.isArray(s.slots)||s.slots.length!==2||new Set(s.slots).size!==2||s.slots.some(k=>!['g1','g2',...(s.r1?['r1']:[])].includes(k)))fail();
  if(s.counts.g1>s.raids||s.counts.g2>s.raids||s.counts.arc>s.bounties||s.counts['plum-second']>s.bounties||s.counts['plum-third']>s.bounties)fail();const settledLimit=s.serial-(s.run?1:0);if(s.raids+s.bounties>settledLimit||skills.some(k=>s.counts[k]>settledLimit))fail();const r=s.run;if(r!==null){if(!r||r.id!==s.serial||!variants[r.kind]?.includes(r.variant)||![0,1].includes(r.segment)||r.kind==='raid'&&r.variant!=='basic'&&!s.raids||r.kind==='training'&&r.variant==='r1'&&!s.r1)fail();for(const key of ['used','banked'])if(!Array.isArray(r[key])||r[key].length>skills.length||new Set(r[key]).size!==r[key].length||r[key].some(k=>!allowed(r.kind,k)||r.kind==='training'&&k!==r.variant))fail();if(!r.segment&&r.banked.length)fail();}
  return s;
 }
 return {skills,variants,initial,begin,use,checkpoint,retry,abandon,finish,walletDelta,stage,validate};
});
