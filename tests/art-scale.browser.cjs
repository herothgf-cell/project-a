'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const {createServer}=require('../server.cjs');
(async()=>{const server=createServer({artReview:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});const p=await browser.newPage({viewport:{width:1280,height:760}});
 await p.goto('http://127.0.0.1:'+server.address().port+'/art-play.html?campaign=classic');await p.waitForFunction(()=>ArtPreview.ready);
 for(const world of ['reality','murim']){
  await p.evaluate(async world=>{document.body.innerHTML='<canvas id="comparison" width="1280" height="760"></canvas>';const c=document.querySelector('canvas').getContext('2d');c.fillStyle='#24333d';c.fillRect(0,0,1280,760);
   const a=(await(await fetch('assets/art/'+world+'/hero/yunseo/candidate.json')).json()).assets[0],dirs=['s','se','e','ne','n','nw','w','sw'];
   for(const [row,action]of ['idle','attack1','attack2','attack3'].entries())for(const [col,d]of dirs.entries()){
    const frames=a.clips[action][d],f=frames[frames.length-1],image=new Image();image.src=a.atlases[f.atlas].path;await image.decode();const h=f.displayHeight||110,placed=ArtRuntime.placement({frame:f},{x:col*160+80,y:row*185+155},h);c.drawImage(image,...f.rect,...placed.destination);c.strokeStyle='#85959d';c.beginPath();c.moveTo(col*160+10,row*185+155);c.lineTo(col*160+150,row*185+155);c.stroke();c.fillStyle='white';c.font='12px sans-serif';c.fillText(world+' '+action+' '+d,col*160+5,row*185+177);
   }
  },world);const out=path.resolve('.superpowers/art-production/evidence/scale-'+(process.env.ART_SCALE_STAGE||'after')+'-'+world+'.png');await p.screenshot({path:out});console.log(out);
 }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
