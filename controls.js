/* One mapping for input dispatch, help copy and saved user preferences. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.Controls=api;})(globalThis,function(){
 'use strict';
 const previous={up:'KeyW',left:'KeyA',down:'KeyS',right:'KeyD',attack:'KeyJ',moon:'KeyK',storm:'KeyL',signature1:'KeyU',signature2:'KeyO',ultimate:'KeyP',dash:'Space',interact:'KeyE',sense:'KeyH',potion:'KeyN',growth:'KeyI',notes:'Tab',map:'KeyM',help:'F1',menu:'Escape'};
 const defaults={...previous,up:'ArrowUp',left:'ArrowLeft',down:'ArrowDown',right:'ArrowRight',attack:'KeyA',moon:'KeyQ',storm:'KeyW',signature1:'KeyE',signature2:'KeyR',ultimate:'KeyF',dash:'KeyS',interact:'KeyG',sense:'KeyD',potion:'Digit1'};
 const legacy={...previous,signature1:'KeyQ',signature2:'KeyR',ultimate:'KeyF',sense:'KeyB',potion:'Digit1',notes:'KeyN',help:'KeyH'};
 const labels={up:'위로',left:'왼쪽',down:'아래로',right:'오른쪽',attack:'연환검',moon:'월영참',storm:'천뢰격',signature1:'첫 무공',signature2:'두 번째 무공',ultimate:'오의',dash:'회피',interact:'상호작용',sense:'기감',potion:'회복약',growth:'성장 화면',notes:'관찰 수첩',map:'지도',help:'도움말',menu:'메뉴'};
 const allowed=code=>/^(Key[A-Z]|Digit[0-9]|Space|Tab|F[1-9]|F1[0-2]|Escape|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|ShiftLeft|ShiftRight)$/.test(code);
 function validate(map){return map&&Object.keys(map).length===Object.keys(defaults).length&&Object.keys(defaults).every(a=>allowed(map[a]))&&new Set(Object.values(map)).size===Object.keys(defaults).length;}
 function create(storage){
  let mapping={...defaults};try{const saved=JSON.parse(storage?.getItem('ssanggye.controls.v1'));if(validate(saved)&&!Object.keys(previous).every(k=>saved[k]===previous[k]))mapping=saved;}catch{}
  function save(){try{storage?.setItem('ssanggye.controls.v1',JSON.stringify(mapping));}catch{}}
  const label=code=>({ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'})[code]||code?.replace(/^Key|^Digit/,'').replace('Escape','Esc').replace('Arrow','').replace(/Shift(Left|Right)/,'Shift')||'';
  function action(code){const explicit=Object.keys(mapping).find(a=>mapping[a]===code);if(explicit)return explicit;return ({ShiftLeft:'dash',ShiftRight:'dash',ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'})[code];}
  function bind(a,code,swap=false){if(!Object.hasOwn(defaults,a)||!allowed(code))return {ok:false};const conflict=Object.keys(mapping).find(k=>k!==a&&mapping[k]===code);if(conflict&&!swap)return {ok:false,conflict};if(conflict)mapping[conflict]=mapping[a];mapping[a]=code;save();return {ok:true};}
  function preset(name){mapping={...(name==='legacy'?legacy:defaults)};save();}
  function format(text){if(typeof text!=='string')return text;const keys={Q:'signature1',R:'signature2',F:'ultimate',B:'sense',N:'notes',H:'help',J:'attack',K:'moon',L:'storm',E:'interact',I:'growth',M:'map',Space:'dash',Esc:'menu'};return text.replace(/(?<![\p{L}\p{N}_])(?:WASD|Space|Esc|[QRFBNHJKLEIM])(?![A-Za-z0-9_]|급)/gu,k=>k==='WASD'?[mapping.up,mapping.left,mapping.down,mapping.right].map(label).join(''):label(mapping[keys[k]])).replace(/\b1(?=\s*[:·/]\s*회복약)/g,label(mapping.potion)).replace(/\{key:(\w+)\}/g,(_,a)=>label(mapping[a]));}
  return {action,bind,preset,format,key:a=>label(mapping[a]),code:a=>mapping[a],get mapping(){return {...mapping};}};
 }
 const current=create(typeof localStorage!=='undefined'?localStorage:null);
 return {create,validate,defaults,legacy,labels,...current};
});
