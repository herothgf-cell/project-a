'use strict';
const fs=require('node:fs'),path=require('node:path');
function skillformHtml(root=path.join(__dirname,'..')){
 const seen=new Set(),ordered=[];
 function visit(name){if(seen.has(name))return;seen.add(name);const source=fs.readFileSync(path.join(root,name),'utf8');for(const [,file]of source.matchAll(/require\(['"]\.\/([-a-z0-9]+\.js)['"]\)/g))visit(file);ordered.push(name);}
 visit('world-game.js');
 const scripts=ordered.map(file=>'<script defer src="/'+file+'"></script>').join('\n');
 return fs.readFileSync(path.join(root,'experiments/skillform/index.html'),'utf8').replace('<!-- GAME_RULES -->',scripts);
}
module.exports={skillformHtml};
