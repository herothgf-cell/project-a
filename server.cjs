'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const assets=new Set(['journey-data.js','journey.js','cultivation.js','chapter-five.js','journey-art.js','journey-ui.js','journey.css','sequel.js','wuxia-direction.js','wuxia-data.js','wuxia-art.js','wuxia.css','index.html','presentation.js','realm-art.js','realm-ui.js','realm.css','world.js','fate.js','legend.js','game.js','art.js','fate-art.js','classic-art.js','portrait-data.js','classic.css','render.js','app.js','style.css']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.ogg':'audio/ogg','.wav':'audio/wav'};
function createServer({artReview=false}={}){
 const archived=require('./scripts/legacy-assets.cjs').payloads(__dirname);
 const Art=require('./art-loader.js'),allowed=new Set([...assets,'art-loader.js','assets/art/manifest.json']);
 for(const name of ['save-slots','world-growth','world-achievements','save-v10','world-game'])allowed.add(name+'.js');
 for(const file of ['controls.js','revision.js','progression.js','martial-tree.js','contract-ui.js','progression-ui.js','progression.css','intro-ui.js','growth-ui.js','revision.css',...['signal','stone','return','report','compare'].map(id=>'assets/art/intro/'+id+'.webp')])allowed.add(file);
  for(const name of ['chapter-seven.js','dual-breath.js','later-story-data.js','chapter-six.js','growth-model.js','dialogue-data.js','dialogue-ui.js','quest-data.js','economy.js','save-v9.js','objective-model.js','objective-ui.js','feedback-two.css'])allowed.add(name);
  const catalog=Art.createCatalog(JSON.parse(fs.readFileSync(path.join(__dirname,'assets/art/manifest.json'))));
 for(const file of catalog.files())allowed.add(file);
 if(artReview){
  for(const p of ['art-review.html','art-review.js','art-play.html','art-runtime.js','art-preview-runtime.js'])allowed.add(p);
  for(const file of ['assets/art/scene-candidate.json',...['reality','murim'].flatMap(world=>['candidate','runtime'].map(kind=>'assets/art/'+world+'/hero/yunseo/'+kind+'.json'))]){
   if(fs.existsSync(path.join(__dirname,file))){allowed.add(file);const review=Art.createCatalog(JSON.parse(fs.readFileSync(path.join(__dirname,file))));for(const p of review.files({preview:true}))allowed.add(p);}
  }
 }
 return http.createServer((req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-cache');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end('Method not allowed');}
  let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
  if(url==='/favicon.ico'){res.writeHead(204);return res.end();}
  const file=url==='/'?'index.html':url==='/legacy/v011/'?'legacy/v011/index.html':url.slice(1);if(archived.has(file)){res.writeHead(200,{'Content-Type':types[path.extname(file)]});return res.end(req.method==='HEAD'?undefined:archived.get(file));}if(!allowed.has(file)){res.writeHead(404);return res.end('Not found');}
  fs.readFile(path.join(__dirname,file==='art-play.html'?'index.html':file),(error,content)=>{
   if(error){res.writeHead(500);return res.end('Unable to read game asset');}
   if(file==='art-play.html')content=Buffer.from(require('./scripts/prototype-html.cjs').prototypeHtml(content.toString('utf8')));
   res.writeHead(200,{'Content-Type':types[path.extname(file)]});res.end(req.method==='HEAD'?undefined:content);
  });
});}
if(require.main===module){const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');if(process.env.ART_REVIEW==='1'&&!['127.0.0.1','localhost','::1'].includes(host))throw Error('Art review must bind to loopback');const server=createServer({artReview:process.env.ART_REVIEW==='1'});server.on('error',e=>{console.error(e.message);process.exitCode=1;});server.listen(port,host,()=>console.log('쌍계: http://'+host+':'+server.address().port));}
module.exports={createServer};
