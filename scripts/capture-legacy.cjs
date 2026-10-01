/* One-time mechanical snapshot of the approved v0.11.0 release, never the dirty worktree. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),out=path.join(root,'legacy/v011'),commit='18bb83671dab8b84ee6c9f2e32b4847307c0c5c0';
if(fs.existsSync(path.join(out,'manifest.json')))throw Error('Archive already captured');
const read=name=>cp.execFileSync('git',['show',commit+':'+name],{cwd:root,maxBuffer:128*1024*1024});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const html=read('index.html').toString(),files=[...new Set(['index.html',...Array.from(html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))/g),m=>m[1]),'art-runtime.js','art-preview-runtime.js'])];
const assets=new Set(['assets/art/manifest.json','assets/art/scene-candidate.json',...['reality','murim'].flatMap(w=>['candidate','runtime'].map(k=>`assets/art/${w}/hero/yunseo/${k}.json`)),...['signal','stone','return','report','compare'].map(x=>`assets/art/intro/${x}.webp`)]);
const Art=require('../art-loader.js');for(const name of [...assets].filter(x=>x.endsWith('.json'))){const raw=read(name),catalog=Art.createCatalog(JSON.parse(raw));for(const p of catalog.files({preview:true}))assets.add(p);}
const manifest={version:'0.11.0',commit,files:{},shared:{}};
for(const name of files){let bytes=read(name);const original=hash(bytes);if(name==='app.js')bytes=Buffer.from(bytes.toString().replace("SAVE='dualworld.save.v1',BACKUP='dualworld.backup.v1'","SAVE='dualworld.legacy.v011',BACKUP='dualworld.legacy.backup.v011'"));if(name==='index.html')bytes=Buffer.from(require('./prototype-html.cjs').prototypeHtml(bytes.toString()).replace('<head>','<head><script defer src="bootstrap.js"></script>').replace('<h2>두 세계의 호흡</h2>','<h2>v0.11.0 보관판 · 이전 기록 복사본</h2>'));
 fs.mkdirSync(path.dirname(path.join(out,name)),{recursive:true});fs.writeFileSync(path.join(out,name),bytes);manifest.files[name]={sha256:hash(bytes),original};}
for(const name of assets){const bytes=read(name);if(name.endsWith('.json')){fs.mkdirSync(path.dirname(path.join(out,name)),{recursive:true});fs.writeFileSync(path.join(out,name),bytes);manifest.files[name]={sha256:hash(bytes),original:hash(bytes)};}else manifest.shared[name]=hash(bytes);}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log('Captured '+files.length+' runtime files and '+assets.size+' asset references');
