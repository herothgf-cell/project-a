/* Only the archival copy is writable. Do not alter the original v1 key. */
try{const raw=localStorage.getItem('dualworld.save.v1');if(raw!==null&&localStorage.getItem('dualworld.legacy.v011')===null)localStorage.setItem('dualworld.legacy.v011',raw);}catch(e){console.warn('보관판 저장 복사 불가',e.message);}
