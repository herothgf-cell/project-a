/* Isolated experiment progression. No access to production save slots or rewards. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.Skillform=api;})(globalThis,function(){
 'use strict';
 const KEY='dualworld.experiment.skillform.v1',families=['sword','ripple','echo','seal'],axes=['form','qi','flow','intent'];
 const names={sword:'월영참',ripple:'파문세',echo:'잔영각',seal:'쇄경진'};
 const recipes={
  sword:{form:'slash',qi:'breath',flow:'instant',intent:'front'},
  ripple:{form:'guard',qi:'rebound',flow:'store',intent:'self'},
  echo:{form:'step',qi:'echo',flow:'burst',intent:'origin'},
  seal:{form:'field',qi:'bind',flow:'hold',intent:'point'}
 };
 const labels={slash:'베기',guard:'받아내기',step:'보법',field:'진법',breath:'기본 운기',rebound:'반탄기',echo:'잔향',bind:'봉합기',instant:'즉시 전개',store:'받아낸 충격 축적',burst:'순간 전개',hold:'유지',front:'전방 범위',line:'좁은 직선',self:'자신 중심',origin:'출발점에 흔적',point:'지정 지점'};
 const links={ripple:{minRank:1,name:'반류일선',principle:'관통 방출',min:260,max:380,unit:'거리',base:260,description:'받아낸 충격 → 전방 선형 최대 2명. 즉시 반격을 포기합니다.'},echo:{minRank:2,name:'유영잔참',principle:'잔향 지연',min:.25,max:.8,unit:'지연(초)',base:.45,description:'실제 예고 회피 → 떠난 위치에 지연 검격. 현재 위치를 베지 않습니다.'},seal:{minRank:3,name:'이맥봉류',principle:'억제 전이',min:100,max:180,unit:'전이 거리',base:100,description:'억제한 적을 타격 → 다음 적에게 남은 억제 최대 2초. 첫 억제는 끝납니다.'}};
 const initial=()=>({version:1,learned:['sword'],basics:{},proven:[],links:{},linkProof:[],reality:null,rank:1,results:[]});
 const clone=x=>JSON.parse(JSON.stringify(x));
 function assert(v,message){if(!v)throw Error(message);}
 function learn(s,f){assert(families.includes(f),'알 수 없는 배움');assert(f==='sword'||s.proven.includes('sword'),'먼저 월영참을 체득하세요.');if(!s.learned.includes(f))s.learned.push(f);return s;}
 function allowed(s,axis){return [...new Set(s.learned.map(f=>recipes[f][axis]).concat(axis==='intent'&&s.proven.includes('sword')?['line']:[]))];}
 function preview(s,r){
  assert(r&&typeof r==='object'&&!Array.isArray(r)&&Object.keys(r).length===4&&axes.every(a=>typeof r[a]==='string'),'각 축에는 요소 하나씩 넣으세요.');
  for(const a of axes)assert(allowed(s,a).includes(r[a]),'아직 배우지 않은 요소입니다: '+(labels[r[a]]||r[a]));
  const family=families.find(f=>axes.every(a=>recipes[f][a]===r[a]||f==='sword'&&a==='intent'&&r[a]==='line'));
  assert(family,'호환 불가: 충격 축적은 받아내기, 잔향은 보법, 봉합은 진법과 연결해야 합니다.');
  return {...r,family,name:names[family],range:family==='sword'?(r.intent==='line'?260:215):family==='seal'?165:0};
 }
 function compose(s,r){const b=preview(s,r);s.basics[b.family]=b;return clone(b);}
 function prove(s,f){assert(s.basics[f],'먼저 기본 초식을 구성하세요.');if(!s.proven.includes(f))s.proven.push(f);return s;}
 function bounds(s,f){const p=links[f];assert(p,'기본 초식 두 개만 연결할 수 있습니다.');const c=(s.rank-1)/8;return f==='echo'?{min:Number((p.base-(p.base-p.min)*c).toFixed(2)),max:Number((p.base+(p.max-p.base)*c).toFixed(2))}:{min:p.min,max:p.min+(p.max-p.min)*c};}
 function link(s,f,value){assert(links[f],'연계 무공을 다시 재료로 쓸 수 없습니다.');assert(s.proven.includes('sword')&&s.proven.includes(f),'두 기본 초식을 먼저 체득하세요.');assert(s.rank>=links[f].minRank,links[f].minRank+'성 이상에서 연결할 수 있습니다.');const b=bounds(s,f);assert(Number.isFinite(value)&&value>=b.min&&value<=b.max,'현재 숙련의 조정 범위를 벗어났습니다.');const p=links[f],costExtra=f==='echo'?3:Math.ceil(2+2*(value-p.min)/(p.max-p.min));const result={family:f,value,costExtra};s.links[f]=result;return clone(result);}
 function setRank(s,rank){assert([1,3,5].includes(rank),'실험 숙련은 1·3·5성입니다.');s.rank=rank;for(const f of Object.keys(s.links)){if(rank<links[f].minRank){delete s.links[f];s.linkProof=s.linkProof.filter(v=>v!==f);if(s.reality===f)s.reality=null;continue;}const b=bounds(s,f);link(s,f,Math.min(b.max,Math.max(b.min,s.links[f].value)));}return s;}
 function proveLink(s,f){assert(s.links[f],'연계 초안이 없습니다.');if(!s.linkProof.includes(f))s.linkProof.push(f);return s;}
 function applyReality(s,f){assert(s.linkProof.includes(f),'먼저 무림 연계 시험에서 실제 효과를 확인하세요.');s.reality=f;return s;}
 function record(s,row){s.results.push(row);s.results=s.results.slice(-18);}
 function load(raw){
  assert(typeof raw==='string'&&raw.length<=50000,'실험 저장 크기가 잘못되었습니다.');const s=JSON.parse(raw),keys=Object.keys(initial());
  assert(s&&typeof s==='object'&&!Array.isArray(s)&&Object.keys(s).length===keys.length&&keys.every(k=>Object.hasOwn(s,k))&&s.version===1,'지원하지 않는 실험 저장입니다.');
  const list=(x,options)=>Array.isArray(x)&&x.length<=options.length&&new Set(x).size===x.length&&x.every(v=>options.includes(v));
  assert(list(s.learned,families)&&s.learned.includes('sword')&&list(s.proven,families)&&list(s.linkProof,Object.keys(links))&&[1,3,5].includes(s.rank),'학습·숙련 기록 오류');
  const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
  assert(object(s.basics)&&object(s.links)&&Object.keys(s.basics).every(f=>families.includes(f))&&Object.keys(s.links).every(f=>Object.hasOwn(links,f)),'초식 목록 오류');
  assert(s.learned.length===1||s.proven.includes('sword'),'월영참 선행 증거가 없습니다.');
  for(const [f,b]of Object.entries(s.basics)){assert(object(b),'기본 초식 오류');const r=Object.fromEntries(axes.map(a=>[a,b[a]])),expected=preview(s,r);assert(expected.family===f&&Object.keys(b).length===Object.keys(expected).length&&Object.keys(expected).every(k=>b[k]===expected[k]),'초식 요소 또는 원형 오류');}
  assert(s.proven.every(f=>s.basics[f]),'미구성 초식 체득 기록');
  const copy=clone(s);for(const [f,l]of Object.entries(s.links)){assert(object(l),'연계 오류');const expected=link(copy,f,l.value);assert(Object.keys(l).length===3&&Object.keys(expected).every(k=>l[k]===expected[k]),'연계 비용·범위 오류');}
  assert(s.linkProof.every(f=>s.links[f])&&(s.reality===null||s.linkProof.includes(s.reality)),'현실 적용·연계 증명 오류');
  assert(Array.isArray(s.results)&&s.results.length<=18,'시험 기록 오류');
  for(const r of s.results){assert(object(r)&&Object.keys(r).length===8&&families.includes(r.family)&&['murim','reality'].includes(r.world)&&typeof r.linked==='boolean'&&(!r.linked||Object.hasOwn(links,r.family))&&typeof r.success==='boolean'&&['hits','damage','spent','seconds'].every(k=>Number.isFinite(r[k])&&r[k]>=0&&r[k]<=100000),'시험 결과 오류');}
  return clone(s);
 }
 const serialize=s=>JSON.stringify(load(JSON.stringify(s)));
 return {KEY,families,axes,names,recipes,labels,links,initial,allowed,preview,learn,compose,prove,bounds,link,setRank,proveLink,applyReality,record,load,serialize};
});
