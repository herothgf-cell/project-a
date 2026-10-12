(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.SaveSlots=api;})(globalThis,function(){
 'use strict';
 const keys=Object.freeze({current:'dualworld.save.proto49859ea',backup:'dualworld.backup.proto49859ea',previous:'dualworld.save.v10',legacyOriginal:'dualworld.save.v1',legacyCopy:'dualworld.legacy.v011',test:'dualworld.test.proto49859ea'});
 function read(storage,key){return storage.getItem(key);}
 function write(storage,key,raw){if(!Object.values(keys).includes(key)||[keys.legacyOriginal,keys.previous].includes(key))throw Error('읽기 전용 또는 알 수 없는 저장 슬롯');if(typeof raw!=='string')throw Error('저장 원문이 필요합니다.');storage.setItem(key,raw);}
 function preserveLegacy(storage){const raw=read(storage,keys.legacyOriginal);if(raw!==null&&read(storage,keys.legacyCopy)===null)write(storage,keys.legacyCopy,raw);return raw;}
 return {keys,read,write,preserveLegacy};
});
