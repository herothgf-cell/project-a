'use strict';
const assert=require('node:assert/strict');
const {Game,AREAS}=require('../../journey.js');
function g0(path='echo'){const g=new Game();g.progress=2;g.training=1;g.fate.path=path;g.fate.proven=[path];g.fate.discovered=[path];g.level=8;g.events=[];return g;}
function at(g,id){const o=g.points().find(x=>x.id===id);assert.ok(o,id);Object.assign(g.player,{x:o.x,y:o.y});return o;}
function prepare(g,path){g.enter('archive');g.events=[];const o=at(g,'relic-'+path);g.sense();g.interact();return o;}
function experiment(g,path,mode){prepare(g,path);g.experimentRuntime.pulse={path,wind:.25,max:1,x:g.player.x,y:g.player.y,serial:1};g.hitStop=0;
 if(path==='ripple'&&mode==='return')g.act('attack');
 else if(path==='ripple'){at(g,'anchor-ripple');g.interact();}
 else if(path==='echo'){g.player.face=0;g.act('dash');for(let i=0;i<6;i++)g.step(.05);if(mode==='return'){const mark=g.experimentRuntime.echo;assert.ok(mark);Object.assign(g.player,{x:mark.x,y:mark.y});g.step(.05);}else{g.player.cool.attack=0;g.act('attack');}}
 else if(mode==='hold')g.interact();
 else {g.player.cool.sense=0;g.sense();at(g,'anchor-seal');g.interact();}
}
module.exports={g0,at,prepare,experiment};
