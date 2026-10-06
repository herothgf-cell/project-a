const assert=require('node:assert/strict'),{inherited}=require('../world-fixtures.cjs');
function ready(f='ripple'){const g=inherited(f);Object.assign(g.player,{x:1170,y:850});return g;}
function tick(g,n){for(let i=0;i<n;i++){g.hitStop=0;g.step(.05);}}
function complete(g){for(const e of g.enemies)while(e.hp>0)g.strike(e,g.stats().attack,'attack');Object.assign(g.player,{x:700,y:700});tick(g,41);return g.interact();}
module.exports={ready,tick,complete};
