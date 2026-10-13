'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{createServer}=require('../server.cjs');
test('skillform entry and experiment sources require explicit loopback development mode',async()=>{
 for(const artReview of [false,true]){const server=createServer({artReview});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{for(const path of ['/__dev/skillform','/__dev/skillform/model.js','/experiments/skillform/model.js'])assert.equal((await fetch(base+path)).status,404);
 const res=await fetch(base+'/__dev/skillform?dev=1');assert.equal(res.status,artReview?200:404);
 if(artReview){const html=await res.text();assert.match(html,/월영참/);assert.match(html,/world-game.js/);assert.doesNotMatch(html,/src="\/app.js/);
 for(const [,url]of html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css)[^"\s]*)"/g))assert.equal((await fetch(base+url)).status,200,url);
 assert.equal((await fetch(base+'/__dev/skillform/../../AGENTS.md?dev=1')).status,404);}
 }finally{await new Promise(r=>server.close(r));}}
});
