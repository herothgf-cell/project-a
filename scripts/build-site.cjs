'use strict';
// A deliberate runtime-only package; never publish docs, test fixtures or the server.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),out=path.resolve(process.argv[2]||'site'),commit=process.argv[3];
if(!/^[a-f0-9]{40}$/.test(commit||''))throw Error('A complete tested commit SHA is required.');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=['index.html',...new Set([...html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))(?:\?[^"\s]*)?"/g)].map(m=>m[1]))];
if(files.some(f=>!/^[-a-z0-9]+\.(html|js|css)$/.test(f)))throw Error('Unexpected runtime asset path.');
const version=require('../package.json').version;
if(require('../world.js').VERSION!==version)throw Error('Runtime and package versions differ.');
fs.mkdirSync(out,{recursive:true});
const assets={};for(const name of files){const bytes=fs.readFileSync(path.join(root,name));fs.writeFileSync(path.join(out,name),bytes);assets[name]=crypto.createHash('sha256').update(bytes).digest('hex');}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify({version,commit})+'\n');
fs.writeFileSync(path.join(out,'asset-manifest.json'),JSON.stringify({version,commit,assets},null,2)+'\n');
console.log(JSON.stringify({version,commit,runtimeAssets:files.length}));
