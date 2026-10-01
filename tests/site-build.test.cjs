'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto');
test('explicit prototype build packages candidate play without promoting production art',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'ssanggye-prototype-'));
 try{
  require('../scripts/build-site.cjs').buildSite({out,commit:'c'.repeat(40),includePrototype:true});
  assert.ok(fs.existsSync(path.join(out,'art-play.html')),'prototype entry is missing');
  const html=fs.readFileSync(path.join(out,'art-play.html'),'utf8');
  assert.match(html,/art-preview-runtime.js/);assert.match(html,/SSANGGYE_PROTOTYPE/);
  assert.match(html,/data-art-loading/);
  for(const [,url]of html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css)[^"\s]*)"/g))assert.ok(url.endsWith('?build='+'c'.repeat(40)),url);
  const manifest=JSON.parse(fs.readFileSync(path.join(out,'asset-manifest.json')));
  for(const file of ['art-runtime.js','art-preview-runtime.js','art-review.html','assets/art/scene-candidate.json'])assert.ok(manifest.assets[file],file);
  const scene=JSON.parse(fs.readFileSync(path.join(out,'assets/art/scene-candidate.json')));
  assert.ok(scene.assets.every(a=>a.status==='candidate'));
  for(const a of scene.assets)for(const atlas of [a.atlas,...Object.values(a.atlases||{})].filter(Boolean))assert.ok(manifest.assets[atlas.path],atlas.path);
  assert.equal(fs.existsSync(path.join(out,'references')),false);
  assert.equal(fs.readFileSync(path.join(out,'index.html'),'utf8').includes('art-preview-runtime.js'),true,'public root must use the current art, not the retired entry');
 }finally{fs.rmSync(out,{recursive:true,force:true});}
});
test('site build contains every versioned runtime asset and records exactly their source hashes',()=>{
 const output=fs.mkdtempSync(path.join(os.tmpdir(),'ssanggye-site-'));
 try {
  const run=cp.spawnSync(process.execPath,['scripts/build-site.cjs',output,'a25872353ee7949086b74b5a3faffd3bc1a0afad'],{cwd:path.join(__dirname,'..'),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const manifest=JSON.parse(fs.readFileSync(path.join(output,'asset-manifest.json'))),info=JSON.parse(fs.readFileSync(path.join(output,'build-info.json')));
  assert.equal(info.version,require('../package.json').version);assert.equal(manifest.commit,info.commit);
  assert.ok(Object.hasOwn(manifest.assets,'chapter-five.js'));assert.ok(Object.hasOwn(manifest.assets,'journey.css'));assert.ok(!Object.hasOwn(manifest.assets,'server.cjs'));
  for(const file of ['objective-model.js','objective-ui.js','feedback-two.css','economy.js','save-v9.js','dialogue-data.js','dialogue-ui.js','quest-data.js','growth-model.js','dual-breath.js','later-story-data.js','chapter-six.js','chapter-seven.js'])assert.ok(Object.hasOwn(manifest.assets,file),file);
  assert.ok(Object.hasOwn(manifest.assets,'assets/art/manifest.json'),'binary art catalog is packaged and hashed');
  for(const [file,sha]of Object.entries(manifest.assets)){const bytes=fs.readFileSync(path.join(output,file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sha,file);}
  assert.equal(fs.existsSync(path.join(output,'tests')),false);assert.equal(fs.existsSync(path.join(output,'docs')),false);
  for(const file of ['world-game.js','world-growth.js','save-v10.js','reality-skills.js','encounter-director.js','personal-news.js','character-ui.js','development-ui.js','news-ui.js','world-growth.css','legacy/v011/index.html','legacy/v011/app.js'])assert.ok(manifest.assets[file],file);
  for(const file of ['tests/dev-starts-ui.js','tests/helpers/world-journey.cjs','__dev/starts.js','Library','ProjectSettings'])assert.equal(fs.existsSync(path.join(output,file)),false,file);
 } finally {fs.rmSync(output,{recursive:true,force:true});}
});

test('approved binary bytes are copied and hashed, candidates and reference boards are excluded',()=>{
 const {buildSite}=require('../scripts/build-site.cjs');assert.equal(typeof buildSite,'function');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ssanggye-art-build-')),source=path.join(tmp,'source'),out=path.join(tmp,'site');
 try {
  fs.mkdirSync(path.join(source,'assets/art/reality/hero/test'),{recursive:true});
  fs.writeFileSync(path.join(source,'index.html'),'<html>\r\n</html>\r\n');
  fs.writeFileSync(path.join(source,'package.json'),JSON.stringify({version:'0.8.0'}));
  fs.writeFileSync(path.join(source,'world.js'),'exports.VERSION="0.8.0"');
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVVEAAAAASUVORK5CYII=','base64');
  const approved='assets/art/reality/hero/test/approved.png',candidate='assets/art/reality/hero/test/candidate.png';
  fs.writeFileSync(path.join(source,approved),png);fs.writeFileSync(path.join(source,candidate),png);
  const asset=(id,file,status)=>({id:'reality.'+id,entityId:id,world:'reality',status,sources:['R01'],atlas:{path:file,width:1,height:1},review:{visual:true,evidence:['qa/approved.png']},clips:{idle:{s:[{rect:[0,0,1,1],pivot:[.5,1],duration:1}]}}});
  fs.writeFileSync(path.join(source,'assets/art/manifest.json'),JSON.stringify({schemaVersion:1,required:['reality.a'],assets:[asset('a',approved,'approved'),asset('b',candidate,'candidate')]}));
  buildSite({root:source,out,commit:'a'.repeat(40),requireApprovedArt:true});
  assert.equal(fs.readFileSync(path.join(out,'index.html'),'utf8'),'<html>\n</html>\n','release hashes must not depend on checkout line endings');
  const manifest=JSON.parse(fs.readFileSync(path.join(out,'asset-manifest.json')));
  assert.deepEqual(fs.readFileSync(path.join(out,approved)),png);assert.equal(manifest.assets[approved],crypto.createHash('sha256').update(png).digest('hex'));
  assert.equal(fs.existsSync(path.join(out,candidate)),false);assert.equal(fs.existsSync(path.join(out,'references')),false);
  const runtime=JSON.parse(fs.readFileSync(path.join(out,'assets/art/manifest.json')));assert.equal(runtime.assets.find(a=>a.entityId==='b').status,'BLOCKED_ART');
 } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});

test('art release gate refuses the incomplete production set',()=>{
 const {buildSite}=require('../scripts/build-site.cjs');assert.equal(typeof buildSite,'function');
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'ssanggye-art-gate-'));
 try {assert.throws(()=>buildSite({root:path.join(__dirname,'..'),out,commit:'b'.repeat(40),requireApprovedArt:true}),/BLOCKED_ART/);}
 finally {fs.rmSync(out,{recursive:true,force:true});}
});
