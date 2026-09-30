/* Exact-identity production art catalog. A missing clip is never another actor. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ProductionArt=api;})(globalThis,function(){
 'use strict';
 const worlds=['reality','murim','shared'],statuses=['BLOCKED_ART','candidate','approved'];
 const safePath=p=>typeof p==='string'&&/^assets\/art\/(?:[a-z0-9_-]+\/)+[a-z0-9_-]+\.(png|webp|json|ogg|wav)$/.test(p);
 function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
 const validAtlas=(atlas,world)=>atlas&&safePath(atlas.path)&&atlas.path.startsWith('assets/art/'+world+'/')&&Number.isInteger(atlas.width)&&Number.isInteger(atlas.height)&&atlas.width>0&&atlas.height>0&&atlas.width*atlas.height<=16777216;
 function heroIssues(a){
  if(a.kind!=='actor'||a.entityId!=='hero')return [];
  const issues=[],directions=['n','ne','e','se','s','sw','w','nw'];
  for(const [clip,min]of Object.entries({idle:2,walk:6,dodge:4,attack1:4,attack2:4,attack3:4,cast:4,hit:2})){
   if(directions.some(d=>(a.clips?.[clip]?.[d]?.length||0)<min))issues.push('incomplete '+clip+' (8 directions / '+min+' frames)');
   const frames=Object.values(a.clips?.[clip]||{}).flat();
   if(!frames.length||frames.some(f=>['foot','hand','blade','effect'].some(k=>!f.sockets?.[k])))issues.push('missing sockets in '+clip);
   if(clip.startsWith('attack')&&directions.some(d=>a.clips?.[clip]?.[d]?.[0]?.contact!==true))issues.push('missing immediate contact in '+clip);
  }
  for(const expression of ['neutral','focus','hurt','slight-smile'])if(!a.clips?.['portrait-'+expression]?.none?.length)issues.push('missing portrait '+expression);
  return issues;
 }
 function validate(m){
  const issues=[],ids=new Set(),actors=new Set();
  if(m?.schemaVersion!==1||!Array.isArray(m?.assets)||!Array.isArray(m?.required))return ['invalid schema'];
  for(const a of m.assets){
   if(!a||typeof a.id!=='string'){issues.push('missing asset id');continue;}
   if(ids.has(a.id))issues.push('duplicate id '+a.id);ids.add(a.id);
   if(!worlds.includes(a.world)||!a.id.startsWith(a.world+'.'))issues.push('world mismatch '+a.id);
   if(!statuses.includes(a.status))issues.push('invalid status '+a.id);
   if(a.entityId){const key=a.world+':'+a.entityId;if(actors.has(key))issues.push('duplicate actor '+key);actors.add(key);}
   if(a.status==='BLOCKED_ART'){if(!a.reason)issues.push('missing blocker '+a.id);continue;}
   const atlas=a.atlas;
   if(!validAtlas(atlas,a.world)){issues.push('invalid atlas '+a.id);continue;}
   for(const [key,sheet]of Object.entries(a.atlases||{}))if(!/^[a-z0-9_-]+$/.test(key)||!validAtlas(sheet,a.world))issues.push('invalid alternate atlas '+a.id+'.'+key);
   if(!Array.isArray(a.sources)||!a.sources.length)issues.push('missing provenance '+a.id);
   if(a.status==='approved'&&(!a.review?.evidence?.length||a.review?.visual!==true))issues.push('missing visual approval '+a.id);
   if(!a.clips||!Object.keys(a.clips).length)issues.push('missing clips '+a.id);
   for(const [clip,facings] of Object.entries(a.clips||{}))for(const [facing,frames] of Object.entries(facings)){
    if(!['n','ne','e','se','s','sw','w','nw','none'].includes(facing)||!Array.isArray(frames)||!frames.length){issues.push('invalid facing '+a.id);continue;}
    for(const f of frames){
     const r=f?.rect,p=f?.pivot,sheet=f?.atlas===undefined?atlas:a.atlases?.[f.atlas];
     if(!validAtlas(sheet,a.world)||!Array.isArray(r)||r.length!==4||!r.every(Number.isInteger)||r[0]<0||r[1]<0||r[2]<=0||r[3]<=0||r[0]+r[2]>sheet.width||r[1]+r[3]>sheet.height||!Array.isArray(p)||p.length!==2||!p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)||!Number.isFinite(f.duration)||f.duration<=0){issues.push('invalid frame '+a.id+'.'+clip+'.'+facing);continue;}
     for(const socket of Object.values(f.sockets||{}))if(!Array.isArray(socket)||socket.length!==2||!socket.every(Number.isFinite)||socket[0]<0||socket[1]<0||socket[0]>r[2]||socket[1]>r[3])issues.push('invalid socket '+a.id+'.'+clip);
    }
   }
  }
  for(const id of m.required)if(!ids.has(id))issues.push('required id missing '+id);
  return issues;
 }
 function createCatalog(input){
  const issues=validate(input);if(issues.length)throw Error('Invalid art catalog: '+issues.join('; '));
  // Detach caller-owned input so later mutations cannot bypass validation.
  const manifest=freeze(JSON.parse(JSON.stringify(input)));
  function resolve(q,{preview=false}={}){
   const blocked=reason=>({status:'BLOCKED_ART',world:q.world,entityId:q.entityId,reason});
   const a=manifest.assets.find(a=>a.world===q.world&&a.entityId===q.entityId);
   if(!a)return blocked('missing identity');
   if(a.status==='BLOCKED_ART')return blocked(a.reason);
   if(a.status!=='approved'&&!preview)return blocked('awaiting visual approval');
   const frames=a.clips[q.action]?.[q.facing];if(!frames)return blocked('missing clip '+q.action+'.'+q.facing);
   const index=Number.isInteger(q.frame)&&q.frame>=0?q.frame:0;
   if(index>=frames.length)return blocked('missing frame');
   const frame=frames[index];
   return {status:a.status,id:a.id,world:a.world,entityId:a.entityId,atlas:frame.atlas===undefined?a.atlas:a.atlases[frame.atlas],frame,frameIndex:index};
  }
  function sample(q,options){
   const first=resolve({...q,frame:0},options);if(first.status==='BLOCKED_ART')return first;
   if(!Number.isFinite(q.elapsed)||q.elapsed<0)return {status:'BLOCKED_ART',reason:'invalid animation time'};
   const a=manifest.assets.find(a=>a.id===first.id),frames=a.clips[q.action][q.facing],total=frames.reduce((n,f)=>n+f.duration,0);
   let elapsed=q.loop?q.elapsed%total:Math.min(q.elapsed,total),index=0;
   while(index<frames.length-1&&elapsed>=frames[index].duration){elapsed-=frames[index].duration;index++;}
   return resolve({...q,frame:index},options);
  }
  function releaseIssues(){return manifest.required.flatMap(id=>{const a=manifest.assets.find(a=>a.id===id),gaps=a?.status==='approved'?heroIssues(a):[];return a?.status==='approved'&&!gaps.length?[]:[{id,status:'BLOCKED_ART',reason:gaps.length?gaps.join('; '):a?.reason||'awaiting complete production set and visual approval'}];});}
  function files({preview=false}={}){return [...new Set(manifest.assets.filter(a=>a.status==='approved'||preview&&a.status==='candidate').flatMap(a=>[a.atlas,...Object.values(a.atlases||{})].map(s=>s.path)))];}
  return {resolve,sample,releaseIssues,files,manifest};
 }
 function createImageCache({ImageClass=globalThis.Image,maxEntries=24}={}){
  const cache=new Map();
  async function load(visual){
   if(visual?.status==='BLOCKED_ART')return visual;
   const p=visual?.atlas?.path;if(!safePath(p))return {status:'BLOCKED_ART',reason:'invalid image path'};
   if(cache.has(p)){const promise=cache.get(p);cache.delete(p);cache.set(p,promise);return promise;}
   const promise=new Promise(resolve=>{const img=new ImageClass();img.onload=()=>resolve(img.naturalWidth===visual.atlas.width&&img.naturalHeight===visual.atlas.height?{status:'loaded',image:img}:{status:'BLOCKED_ART',reason:'image dimensions differ'});img.onerror=()=>resolve({status:'BLOCKED_ART',reason:'image load failed'});img.src=p;});
   cache.set(p,promise);while(cache.size>maxEntries)cache.delete(cache.keys().next().value);
   const result=await promise;if(result.status!=='loaded'&&cache.get(p)===promise)cache.delete(p);return result;
  }
  return {load,clear:()=>cache.clear(),get size(){return cache.size;}};
 }
 function createResidentImages({maxBytes=128*1024*1024,maxConcurrent=2,load,onLoad=()=>{},onError=()=>{}}={}){
  const loader=load||createImageCache({maxEntries:1}).load,resident=new Map(),pending=new Set(),failed=new Map(),queue=[];
  let bytes=0,active=0;
  function fail(path,reason){failed.set(path,reason);onError(path,reason);}
  maxBytes=Math.max(1,Number.isFinite(maxBytes)?maxBytes:128*1024*1024);maxConcurrent=Math.max(1,Math.floor(maxConcurrent)||1);
  function get(path){const entry=resident.get(path);if(!entry)return;resident.delete(path);resident.set(path,entry);return entry.image;}
  function pump(){while(active<maxConcurrent&&queue.length){const {visual,path,cost}=queue.shift();active++;
   let task;try{task=loader(visual);}catch(error){task=Promise.reject(error);}
   Promise.resolve(task).then(result=>{
    if(result.status!=='loaded'){fail(path,result.reason||'image load failed');return;}
    while(bytes+cost>maxBytes&&resident.size){const first=resident.keys().next().value;bytes-=resident.get(first).cost;resident.delete(first);}
    resident.set(path,{image:result.image,cost});bytes+=cost;onLoad(path);
   }).catch(()=>fail(path,'image load failed')).finally(()=>{active--;pending.delete(path);pump();});
  }}
  function request(visual){const path=visual?.atlas?.path;if(visual?.status==='BLOCKED_ART'||!safePath(path))return null;
   const image=get(path);if(image)return image;if(pending.has(path)||failed.has(path))return null;
   const cost=visual.atlas.width*visual.atlas.height*4;
   if(!Number.isFinite(cost)||cost<=0||cost>maxBytes){failed.set(path,'image exceeds resident budget');return null;}
   pending.add(path);queue.push({visual,path,cost});pump();return null;
  }
  return {request,get,failure:path=>failed.get(path),get bytes(){return bytes;},get size(){return resident.size;},get pending(){return pending.size;}};
 }
 return {safePath,validate,createCatalog,createImageCache,createResidentImages};
});
