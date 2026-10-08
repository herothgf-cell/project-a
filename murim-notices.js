/* Read receipts refer to earned facts, never to unspent balances. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.MurimNotices=api;})(globalThis,function(){
 'use strict';
 function catalog(g,kind){const j=g.worldState.murimJourney,m=g.worldState.murimGrowth;return ['intro',...m.grants.map(id=>'grant:'+id),...(kind==='skills'?[...(m.levels.arc?['learn:samjae-arc']:[]),...(j.disciple==='accept'?['learn:plum-first']:[]),...j.mentors.map(id=>'mentor:'+id)]:[])];}
 function state(g){const j=g.worldState.murimJourney;if(!j.notices)j.notices=Object.fromEntries(['stats','skills'].map(k=>[k,j.viewed[k]?catalog(g,k):[]]));return j.notices;}
 function unread(g,kind){return catalog(g,kind).filter(id=>!state(g)[kind].includes(id));}
 function read(g,kind){if(!['stats','skills'].includes(kind))return false;state(g)[kind]=catalog(g,kind);g.worldState.murimJourney.viewed[kind]=true;return true;}
 function validate(g){const s=state(g);if(!s||Object.keys(s).length!==2)throw Error('무림 성장 알림 오류');for(const k of ['stats','skills'])if(!Array.isArray(s[k])||new Set(s[k]).size!==s[k].length||s[k].some(id=>!catalog(g,k).includes(id)))throw Error('무림 성장 알림 오류');return s;}
 return {catalog,state,unread,read,validate};
});
