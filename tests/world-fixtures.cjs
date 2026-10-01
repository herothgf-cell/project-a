const {Game}=require('../world-game.js');
function inherited(family='ripple'){const g=new Game();g.progress=12;g.training=3;g.fate.stage=2;g.fate.discovered=[family];g.fate.proven=[family];g.enter('village');g.acceptFate(family);g.enter('city');g.equipReality(family);g.events=[];return g;}
function opponent(g){g.enter('rift');Object.assign(g.player,{x:400,y:700,face:0,hp:g.stats().hp,mp:g.stats().mp,invuln:0});const e={id:'real-target',x:470,y:700,r:20,hp:500,maxHp:500,boss:false,kind:'shade',damage:18,speed:0,cd:5,wind:0,range:62,tx:400,ty:700,flash:0,attacks:0};g.enemies=[e];return e;}
function talk(g,id){const p=g.points().find(p=>p.id===id);if(!p)throw Error('Missing '+id);Object.assign(g.player,{x:p.x,y:p.y});return g.interact();}
module.exports={inherited,opponent,talk};
