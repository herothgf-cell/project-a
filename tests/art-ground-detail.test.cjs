'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Runtime=require('../art-runtime.js'),Art=require('../art-loader.js');
test('terrain sampling mirrors opposite tile edges without changing source art',()=>{
 const calls=[],ctx={save(){calls.push(['save']);},restore(){calls.push(['restore']);},translate(...a){calls.push(['translate',...a]);},scale(...a){calls.push(['scale',...a]);},drawImage(...a){calls.push(['draw',...a]);}},image={},rect=[0,0,887,887];
 Runtime.drawTerrainRepeat(ctx,image,rect,256);
 assert.deepEqual(calls.filter(c=>c[0]==='scale'),[['scale',1,1],['scale',-1,1],['scale',1,-1],['scale',-1,-1]]);
 assert.equal(calls.filter(c=>c[0]==='draw').length,4);assert.equal(calls.filter(c=>c[0]==='save').length,4);assert.equal(calls.filter(c=>c[0]==='restore').length,4);assert.deepEqual(rect,[0,0,887,887]);
});
test('hunter base painted road marks follow each road without altering navigation',()=>{
 const area={w:900,h:900,roads:[[[100,300],[700,300]],[[400,500],[400,800]]],blocks:[]},before=JSON.stringify(area);
 const marks=Runtime.groundDetails(area,'reality').filter(d=>d.cell===1);
 assert.ok(marks.length>=3,'painted road atlas cell must actually be connected');
 assert.ok(marks.some(d=>d.y===300&&Math.abs(d.rotation+Math.PI/4)<1e-8));
 assert.ok(marks.some(d=>d.x===400&&Math.abs(d.rotation-Math.PI/4)<1e-8));
 assert.equal(JSON.stringify(area),before);
 const blocked={...area,blocks:[{x:0,y:0,w:900,h:900}]};assert.equal(Runtime.groundDetails(blocked,'reality').length,0);
});
test('foreground keeps routes, entrances and collision unchanged, with world-specific identities',()=>{
 const area={w:1200,h:900,roads:[[[0,450],[1200,450]]],blocks:[],points:[{x:220,y:80}]},before=JSON.stringify(area);
 for(const world of ['reality','murim']){
  const details=Runtime.foregroundDetails(area,world);assert.ok(details.length>3);assert.deepEqual(details,Runtime.foregroundDetails(area,world));
  assert.ok(details.every(d=>d.world===world&&Math.abs(d.y-450)>130&&Math.hypot(d.x-220,d.y-80)>170));
 }
 assert.equal(JSON.stringify(area),before);assert.deepEqual(Runtime.foregroundDetails(area,'unknown'),[]);
 const c=Art.createCatalog(require('../assets/art/scene-candidate.json'));
 for(const world of ['reality','murim'])for(let cell=0;cell<4;cell++)assert.equal(c.resolve({world,entityId:'environment.foreground',action:'cell-'+cell,facing:'none'},{preview:true}).status,'candidate');
});
test('ground overlay atlas dimensions match actual PNG bytes',()=>{
 const fs=require('node:fs'),path=require('node:path');
 for(const a of require('../assets/art/scene-candidate.json').assets.filter(a=>a.entityId==='environment.dressing')){
  const png=fs.readFileSync(path.resolve(__dirname,'..',a.atlas.path));assert.equal(a.atlas.width,png.readUInt32BE(16));assert.equal(a.atlas.height,png.readUInt32BE(20));
 }
});
test('ground dressing uses world-specific independent assets without release approval',()=>{
 const c=Art.createCatalog(require('../assets/art/scene-candidate.json'));
 for(const world of ['reality','murim'])for(let cell=0;cell<4;cell++){
  const q={world,entityId:'environment.dressing',action:'cell-'+cell,facing:'none'},v=c.resolve(q,{preview:true});
  assert.equal(v.status,'candidate');assert.ok(v.atlas.path.includes('/'+world+'/'));assert.equal(c.resolve(q).status,'BLOCKED_ART');
 }
});
test('roadside dressing is deterministic and does not alter collision or road geometry',()=>{
 const area={w:800,h:800,roads:[[[100,400],[700,400]]],blocks:[{x:350,y:250,w:100,h:300}]},before=JSON.stringify(area);
 const details=Runtime.groundDetails(area,'murim');assert.ok(details.length>2);assert.deepEqual(details,Runtime.groundDetails(area,'murim'));
 assert.equal(JSON.stringify(area),before);assert.ok(details.every(d=>d.x>=24&&d.y>=24&&d.x<=776&&d.y<=776));
 assert.ok(details.every(d=>d.x<326||d.x>474||d.y<226||d.y>574));
 assert.ok(details.every(d=>Math.abs(d.y-400)>=50));assert.deepEqual(Runtime.groundDetails(area,'unknown'),[]);
});
