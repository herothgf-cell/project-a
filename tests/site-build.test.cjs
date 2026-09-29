'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto');
test('site build contains every versioned runtime asset and records exactly their source hashes',()=>{
 const output=fs.mkdtempSync(path.join(os.tmpdir(),'ssanggye-site-'));
 try {
  const run=cp.spawnSync(process.execPath,['scripts/build-site.cjs',output,'a25872353ee7949086b74b5a3faffd3bc1a0afad'],{cwd:path.join(__dirname,'..'),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const manifest=JSON.parse(fs.readFileSync(path.join(output,'asset-manifest.json'))),info=JSON.parse(fs.readFileSync(path.join(output,'build-info.json')));
  assert.equal(info.version,require('../package.json').version);assert.equal(manifest.commit,info.commit);
  assert.ok(Object.hasOwn(manifest.assets,'chapter-five.js'));assert.ok(Object.hasOwn(manifest.assets,'journey.css'));assert.ok(!Object.hasOwn(manifest.assets,'server.cjs'));
  for(const [file,sha]of Object.entries(manifest.assets)){const bytes=fs.readFileSync(path.join(output,file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sha,file);}
  assert.equal(fs.existsSync(path.join(output,'tests')),false);assert.equal(fs.existsSync(path.join(output,'docs')),false);
 } finally {fs.rmSync(output,{recursive:true,force:true});}
});
