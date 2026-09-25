'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('hidden screens are actually removed from layout',()=>{
  const css=fs.readFileSync(path.join(__dirname,'..','style.css'),'utf8');
  assert.match(css,/\[hidden\]\{display:none!important\}/);
});
