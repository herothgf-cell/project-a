/* Eight movement sectors from five independently pictured views plus mirrored pairs.
   This is not an eight-direction, frame-by-frame walk animation sheet. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WuxiaDirection=api;})(globalThis,function(){
  'use strict';
  const frames=[{name:'E',cell:1,flip:true},{name:'SE',cell:2,flip:false},{name:'S',cell:0,flip:false},{name:'SW',cell:2,flip:true},{name:'W',cell:1,flip:false},{name:'NW',cell:3,flip:true},{name:'N',cell:4,flip:false},{name:'NE',cell:3,flip:false}];
  function facing(angle){if(!Number.isFinite(angle))angle=Math.PI/2;const sector=((Math.round(angle/(Math.PI/4))%8)+8)%8;return {...frames[sector]};}
  return {facing,frames};
});
