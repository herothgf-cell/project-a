'use strict';
// Runtime-only package. References, review candidates, tests and docs never ship.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const Art=require('../art-loader.js');
function buildSite({root=path.join(__dirname,'..'),out,commit,requireApprovedArt=false}){
 root=path.resolve(root);out=path.resolve(out||'site');
 if(!/^[a-f0-9]{40}$/.test(commit||''))throw Error('A complete tested commit SHA is required.');
 if(out===root||root.startsWith(out+path.sep))throw Error('Output cannot contain source tree.');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const files=['index.html',...new Set([...html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))(?:\?[^"\s]*)?"/g)].map(m=>m[1]))];
 if(files.some(f=>!/^[-a-z0-9]+\.(html|js|css)$/.test(f)))throw Error('Unexpected runtime asset path.');
 const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version;
 if(require(path.join(root,'world.js')).VERSION!==version)throw Error('Runtime and package versions differ.');
 const catalogPath='assets/art/manifest.json',catalog=Art.createCatalog(JSON.parse(fs.readFileSync(path.join(root,catalogPath))));
 const blocked=catalog.releaseIssues();
 if(requireApprovedArt&&blocked.length)throw Error('BLOCKED_ART: '+blocked.map(x=>x.id).join(', '));
 const runtime={...catalog.manifest,releaseState:blocked.length?'BLOCKED_ART':'approved',assets:catalog.manifest.assets.map(a=>a.status==='approved'?a:{id:a.id,world:a.world,entityId:a.entityId,kind:a.kind,status:'BLOCKED_ART',reason:a.reason||'Awaiting visual approval'})};
 const payloads=new Map();
 for(const name of [...files,...catalog.files()]){
  const filename=path.join(root,name),real=fs.realpathSync(filename);
  if(!real.startsWith(fs.realpathSync(root)+path.sep))throw Error('Runtime symlink outside source: '+name);
  payloads.set(name,fs.readFileSync(filename));
 }
 payloads.set(catalogPath,Buffer.from(JSON.stringify(runtime,null,2)+'\n'));
 // Refuse stale output rather than leaving previously copied documents/candidates online.
 if(fs.existsSync(out)&&fs.readdirSync(out).length)throw Error('Build output must be empty.');
 fs.mkdirSync(out,{recursive:true});
 const assets={};for(const [name,bytes]of payloads){const filename=path.join(out,name);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,bytes);assets[name]=crypto.createHash('sha256').update(bytes).digest('hex');}
 fs.writeFileSync(path.join(out,'.nojekyll'),'');
 fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify({version,commit})+'\n');
 fs.writeFileSync(path.join(out,'asset-manifest.json'),JSON.stringify({version,commit,assets},null,2)+'\n');
 return {version,commit,runtimeAssets:payloads.size,artReady:blocked.length===0};
}
if(require.main===module)console.log(JSON.stringify(buildSite({out:process.argv[2],commit:process.argv[3],requireApprovedArt:process.argv.includes('--require-approved-art')})));
module.exports={buildSite};
