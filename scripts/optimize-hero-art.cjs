'use strict';
// Keep source candidates untouched; pack only frames used by the prototype.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const Art=require('../art-loader.js');
async function build(){
 for(const world of ['reality','murim']){
  const dir=`assets/art/${world}/hero/yunseo`,manifest=Art.prototypeProfile(JSON.parse(await fs.readFile(`${dir}/candidate.json`,'utf8')));
  for(const actor of manifest.assets){
   const original=structuredClone(actor),atlases={};let first=true;
   for(const [action,facings] of Object.entries(actor.clips)){
    const frames=Object.values(facings).flat(),cols=Math.min(8,frames.length),rows=Math.ceil(frames.length/cols),cell=256;
    const sheet={path:`${dir}/runtime-${action}.webp`,width:cols*cell,height:rows*cell},layers=[];
    for(let i=0;i<frames.length;i++){
     const f=frames[i],src=f.atlas===undefined?original.atlas:original.atlases[f.atlas],r=f.rect;
     const scale=Math.min((cell-4)/r[2],(cell-4)/r[3]),w=Math.max(1,Math.round(r[2]*scale)),h=Math.max(1,Math.round(r[3]*scale));
     const x=(i%cols)*cell+2,y=Math.floor(i/cols)*cell+2;
     layers.push({input:await sharp(src.path).extract({left:r[0],top:r[1],width:r[2],height:r[3]}).resize(w,h).png().toBuffer(),left:x,top:y});
     f.rect=[x,y,w,h];f.sockets=Object.fromEntries(Object.entries(f.sockets||{}).map(([k,p])=>[k,[p[0]*w/r[2],p[1]*h/r[3]]]));
     if(first)delete f.atlas;else f.atlas=action;
    }
    await sharp({create:{width:sheet.width,height:sheet.height,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(sheet.path);
    if(first){actor.atlas=sheet;first=false;}else atlases[action]=sheet;
   }
   actor.atlases=atlases;
  }
  Art.createCatalog(manifest);
  await fs.writeFile(`${dir}/runtime.json`,JSON.stringify(manifest,null,2)+'\n');
  console.log(world,Art.createCatalog(manifest).files({preview:true}).length,'optimized sheets');
 }
}
build().catch(e=>{console.error(e);process.exitCode=1;});
