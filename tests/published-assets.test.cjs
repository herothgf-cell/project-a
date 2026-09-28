'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createServer}=require('../server.cjs');
test('all HTML runtime scripts and styles are served with correct MIME, including version queries',async()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const urls=[...html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css)(?:\?[^"\s]*)?)"/g)].map(m=>m[1]);
  assert.ok(urls.includes('legend.js?v=0.5.0'));assert.ok(urls.includes('portrait-data.js?v=0.5.0'));
  const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));
  try{const base='http://127.0.0.1:'+s.address().port;
    for(const url of urls){const r=await fetch(base+'/'+url);assert.equal(r.status,200,url);assert.match(r.headers.get('content-type'),url.includes('.js')?/javascript/:/css/);assert.ok((await r.text()).length>0,url);}
    assert.equal((await fetch(base+'/docs/verification-v05.md')).status,404);
  }finally{await new Promise(r=>s.close(r));}
});
