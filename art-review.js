(async function(){
 'use strict';
 const error=document.getElementById('error'),actors=document.getElementById('actors'),cache=ProductionArt.createImageCache();
 const names={reality:'현실 · 윤서 / 현대 헌터',murim:'무림 · 윤서 / 도포 검객'},directions=['s','se','e','ne','n','nw','w','sw'],labels=['정면 S','우전 SE','우측 E','우후 NE','후면 N','좌후 NW','좌측 W','좌전 SW'];
 const fetchJson=async p=>{const r=await fetch(p);if(!r.ok)throw Error(p+' HTTP '+r.status);return r.json();};
 try{
  const manifest=ProductionArt.createCatalog(await fetchJson('assets/art/manifest.json'));
  for(const issue of manifest.releaseIssues()){const li=document.createElement('li');li.textContent=issue.id+' — '+issue.status+' · '+issue.reason;document.getElementById('issues').append(li);}
  const renders=[],animations=[];
  let redrawQueued=false;
  const repaint=()=>{if(redrawQueued)return;redrawQueued=true;requestAnimationFrame(()=>{redrawQueued=false;renders.forEach(f=>f());});};
  const resident=ProductionArt.createResidentImages({maxBytes:64*1024*1024,onLoad:repaint,onError:repaint});
  const control=document.createElement('label'),toggle=document.createElement('input');toggle.type='checkbox';toggle.id='animate';control.append(toggle,' 선택 방향 동작 후보 재생');document.querySelector('header').append(control);
  const action=document.getElementById('reviewAction'),frame=document.getElementById('reviewFrame'),facing=document.getElementById('reviewFacing');
  const play=document.createElement('a');play.href='art-play.html';play.textContent='실제 게임에서 전신 후보 보기';document.querySelector('header').append(document.createElement('br'),play);
  for(const world of ['reality','murim']){
   const catalog=ProductionArt.createCatalog(await fetchJson('assets/art/'+world+'/hero/yunseo/candidate.json'));
   const section=document.createElement('section'),heading=document.createElement('h2'),status=document.createElement('p'),grid=document.createElement('div');
   heading.textContent=names[world];status.className='status';status.textContent='양 세계 독립 8방향 동작 후보 / 사용자 승인 유지 / 발 접지·연결 동작 시각 검수 중 · 최종 아트 아님';grid.className='directions';section.append(heading,status,grid);actors.append(section);
   for(let i=0;i<directions.length;i++){
    const visual=catalog.resolve({world,entityId:'hero',action:'idle',facing:directions[i]},{preview:true}),loaded=await cache.load(visual);
    if(loaded.status!=='loaded')throw Error(world+': '+loaded.reason);
    const cell=document.createElement('div'),canvas=document.createElement('canvas'),caption=document.createElement('span');cell.className='cell';canvas.width=220;canvas.height=270;canvas.dataset.assetId=visual.id;canvas.dataset.facing=directions[i];caption.textContent=labels[i];cell.append(canvas,caption);grid.append(cell);
    const paint=()=>{const c=canvas.getContext('2d'),height=Number(document.getElementById('scale').value),r=visual.frame.rect,p=visual.frame.pivot,w=height*r[2]/r[3];c.clearRect(0,0,220,270);c.fillStyle='#1a2832';c.fillRect(0,0,220,270);c.drawImage(loaded.image,...r,110-w*p[0],230-height*p[1],w,height);if(document.getElementById('pivot').checked){c.strokeStyle='#66b9c780';c.beginPath();c.moveTo(14,230);c.lineTo(206,230);c.moveTo(110,218);c.lineTo(110,242);c.stroke();}};renders.push(paint);paint();
   }
   {
    const row=document.createElement('div'),canvas=document.createElement('canvas'),note=document.createElement('p');canvas.width=280;canvas.height=300;canvas.dataset.action='walk';canvas.dataset.frame='0';
    canvas.dataset.assetId=world+'.hero.yunseo';row.append(canvas,note);section.append(row);
    const paint=elapsed=>{
     const q={world,entityId:'hero',action:action.value,facing:facing.value},v=toggle.checked?catalog.sample({...q,elapsed,loop:true},{preview:true}):catalog.resolve({...q,frame:Number(frame.value)},{preview:true}),c=canvas.getContext('2d');
     c.fillStyle='#1a2832';c.fillRect(0,0,280,300);canvas.dataset.action=action.value;canvas.dataset.blocked=String(v.status==='BLOCKED_ART');canvas.dataset.contact=String(v.frame?.contact===true);canvas.dataset.frame=v.frameIndex??'';
     canvas.dataset.loading='false';
     if(v.status==='BLOCKED_ART'){note.textContent='BLOCKED_ART · '+action.value+' '+facing.value+' · 미제작 프레임은 다른 동작으로 대체하지 않습니다.';return;}
     const sprite=resident.request(v);
     if(!sprite){const reason=resident.failure(v.atlas.path);canvas.dataset.loading=String(!reason);canvas.dataset.blocked=String(!!reason);note.textContent=(reason?'BLOCKED_ART · '+reason:'이미지 불러오는 중')+' · '+action.value+' '+facing.value;return;}
     const r=v.frame.rect,p=v.frame.pivot,h=(v.frame.displayHeight||110)*Number(document.getElementById('scale').value)/110,w=h*r[2]/r[3],x=140-w*p[0],y=250-h*p[1];
     canvas.dataset.renderHeight=String(h);
     c.drawImage(sprite,...r,x,y,w,h);
     note.textContent=action.value+' '+facing.value+' · '+(v.frameIndex+1)+'프레임'+(v.frame.contact?' / 실제 타격 시점':'')+' · 소켓/발 접지 검수 중';
     if(document.getElementById('pivot').checked){c.strokeStyle='#66b9c780';c.beginPath();c.moveTo(20,250);c.lineTo(260,250);c.stroke();c.font='10px system-ui';for(const [name,s]of Object.entries(v.frame.sockets||{})){const sx=x+s[0]*w/r[2],sy=y+s[1]*h/r[3];c.fillStyle=name==='blade'?'#ffbe73':'#66e9dc';c.beginPath();c.arc(sx,sy,3,0,Math.PI*2);c.fill();c.fillText(name,sx+5,sy-5);}}
    };
    animations.push(paint);renders.push(()=>paint(0));paint(0);
   }
  }
  for(const id of ['scale','pivot'])document.getElementById(id).addEventListener('change',()=>renders.forEach(f=>f()));
  action.addEventListener('change',()=>{frame.max=action.value==='walk'?'5':action.value==='idle'?'1':'3';frame.value='0';renders.forEach(f=>f());});
  facing.addEventListener('change',()=>{frame.value='0';renders.forEach(f=>f());});
  frame.addEventListener('input',()=>{toggle.checked=false;renders.forEach(f=>f());});
  document.body.dataset.ready='true';
  let started=null;function tick(now){if(toggle.checked){if(started===null)started=now;animations.forEach(f=>f((now-started)/1000));}else started=null;requestAnimationFrame(tick);}requestAnimationFrame(tick);
 }catch(e){error.textContent='검수 로드 실패: '+e.message;document.body.dataset.ready='error';}
})();
