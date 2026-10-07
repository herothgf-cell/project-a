(function(root){'use strict';root.NewsUI={create({game,show,node,refresh,openDestination,commit}){
 const category=item=>item.id.startsWith('return:')?'귀환 성과':({skills:'무공',growth:'성장',status:'현장 성과'}[item.section]||'여정');
 function open(id){const g=game();g.refreshNews();const body=node('section','growth-screen personal-news');
  if(id){const item=g.newsList().find(x=>x.id===id);if(!item)return;const read=current=>item.subject==='mode'?current.dismissNews(id):current.readNews(id);if(commit)commit(read);else{read(g);refresh();}
   if(item.section==='status'&&item.subject!=='crystal'){body.append(node('h3','',item.title),node('p','',item.text));show('현장 성과',body,[{label:'내 소식으로',secondary:true,run:()=>open()}],'system','이야기와 귀환 성과');return;}
   openDestination(item);return;}
  const items=g.newsList(),unread=items.filter(x=>!x.read);body.append(node('p','news-summary',unread.length?'새 소식 '+unread.length+'개 · 항목을 누르면 해당 기능으로 이동합니다.':'새 소식을 모두 확인했습니다.'));
  if(!items.length)body.append(node('p','','새로운 발견과 귀환 성과가 이곳에 쌓입니다.'));
  for(const [title,rows] of [['새 소식',unread],['확인한 소식',items.filter(x=>x.read)]]){if(!rows.length)continue;const group=node('section','news-group');group.append(node('h3','',title+' · '+rows.length));
   for(const item of rows){const b=node('button','news-item'+(item.read?'':' has-news')),copy=node('span','news-copy');copy.append(node('span','news-category',category(item)),node('strong','news-title',item.title.replace(/^귀환 성과 · /,'')),node('span','news-preview',item.text.split('\n')[0]));b.append(copy,node('span','news-open','›'));b.setAttribute('aria-label',item.title+(item.read?' · 확인함':' · 새 소식'));b.onclick=()=>open(item.id);group.append(b);}body.append(group);}
  show('내 소식',body,[{label:'돌아가기',secondary:true}],'hero','해금 / 성장 / 귀환 성과');
 }return {open};}};})(globalThis);
