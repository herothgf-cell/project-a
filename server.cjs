'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const assets=new Set(['index.html','world.js','fate.js','game.js','art.js','fate-art.js','render.js','app.js','style.css']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
function createServer(){return http.createServer((req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-cache');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end('Method not allowed');}
  let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
  if(url==='/favicon.ico'){res.writeHead(204);return res.end();}
  const file=url==='/'?'index.html':url.slice(1);if(!assets.has(file)){res.writeHead(404);return res.end('Not found');}
  fs.readFile(path.join(__dirname,file),(error,content)=>{if(error){res.writeHead(500);return res.end('Unable to read game asset');}res.writeHead(200,{'Content-Type':types[path.extname(file)]});res.end(req.method==='HEAD'?undefined:content);});
});}
if(require.main===module){const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');const server=createServer();server.on('error',e=>{console.error(e.message);process.exitCode=1;});server.listen(port,host,()=>console.log('쌍계: http://'+host+':'+server.address().port));}
module.exports={createServer};
