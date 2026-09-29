(async function(){
 'use strict';
 const error=document.getElementById('error'),actors=document.getElementById('actors'),cache=ProductionArt.createImageCache();
 const names={reality:'현실 · 윤서 / 현대 헌터',murim:'무림 · 윤서 / 도포 검객'},directions=['s','se','e','ne','n','nw','w','sw'],labels=['정면 S','우전 SE','우측 E','우후 NE','후면 N','좌후 NW','좌측 W','좌전 SW'];
 const fetchJson=async p=>{const r=await fetch(p);if(!r.ok)throw Error(p+' HTTP '+r.status);return r.json();};
 try{
  const manifest=ProductionArt.createCatalog(await fetchJson('assets/art/manifest.json'));
  for(const issue of manifest.releaseIssues()){const li=document.createElement('li');li.textContent=issue.id+' — '+issue.status+' · '+issue.reason;document.getElementById('issues').append(li);}
  const renders=[];
  for(const world of ['reality','murim']){
   const catalog=ProductionArt.createCatalog(await fetchJson('assets/art/'+world+'/hero/yunseo/candidate.json'));
   const section=document.createElement('section'),heading=document.createElement('h2'),status=document.createElement('p'),grid=document.createElement('div');
   heading.textContent=names[world];status.className='status';status.textContent='후보 v1 · 대기 8방향 / 아트 승인 전 / 애니메이션 미제작';grid.className='directions';section.append(heading,status,grid);actors.append(section);
   for(let i=0;i<directions.length;i++){
    const visual=catalog.resolve({world,entityId:'hero',action:'idle',facing:directions[i]},{preview:true}),loaded=await cache.load(visual);
    if(loaded.status!=='loaded')throw Error(world+': '+loaded.reason);
    const cell=document.createElement('div'),canvas=document.createElement('canvas'),caption=document.createElement('span');cell.className='cell';canvas.width=220;canvas.height=270;canvas.dataset.assetId=visual.id;canvas.dataset.facing=directions[i];caption.textContent=labels[i];cell.append(canvas,caption);grid.append(cell);
    const paint=()=>{const c=canvas.getContext('2d'),height=Number(document.getElementById('scale').value),r=visual.frame.rect,p=visual.frame.pivot,w=height*r[2]/r[3];c.clearRect(0,0,220,270);c.fillStyle='#1a2832';c.fillRect(0,0,220,270);c.drawImage(loaded.image,...r,110-w*p[0],230-height*p[1],w,height);if(document.getElementById('pivot').checked){c.strokeStyle='#66b9c780';c.beginPath();c.moveTo(14,230);c.lineTo(206,230);c.moveTo(110,218);c.lineTo(110,242);c.stroke();}};renders.push(paint);paint();
   }
  }
  for(const id of ['scale','pivot'])document.getElementById(id).addEventListener('change',()=>renders.forEach(f=>f()));
  document.body.dataset.ready='true';
 }catch(e){error.textContent='검수 로드 실패: '+e.message;document.body.dataset.ready='error';}
})();
