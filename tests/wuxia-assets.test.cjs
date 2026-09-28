'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('all major NPCs share the painted wuxia portrait atlas and eight views',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../wuxia-data.js'),'utf8'),context);
 const a=context.window.WuxiaAssets;for(const who of ['hero','master','warden','hunter','yeonhwa'])assert.ok(a.portraits[who].startsWith('data:image/webp;base64,'));
 assert.equal(a.cellWidth,80);assert.equal(a.cellHeight,128);assert.ok(a.sprites.length>2000);
 const index=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 assert.match(index,/wuxia-art.js/);assert.match(index,/NPC 시뮬레이션/);
});
test('afterimages capture the wuxia renderer, not the retired blonde pose',()=>{const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');assert.ok(html.indexOf('wuxia-art.js')<html.indexOf('fate-art.js'));assert.ok(html.indexOf('wuxia-art.js')<html.indexOf('render.js'));});
