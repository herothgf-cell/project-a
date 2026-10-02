(function(root){'use strict';root.CharacterUI={create({game,show,node,grid,refresh=()=>{},openSection=()=>{}}){
 function open(world=WorldGrowth.worldOf(game())){
  const g=game(),s=WorldGrowth.stats(g,world),w=g.worldGrowth[world],body=node('section','character-screen profile-screen');body.dataset.world=world;
  const portraits=node('nav','profile-worlds');portraits.setAttribute('aria-label','세계별 캐릭터');
  for(const [id,label]of [['reality','현실'],['murim','무림']]){const b=node('button','profile-world'),img=node('img');img.src='assets/art/'+id+'/hero/yunseo/runtime-portrait-neutral.webp';img.alt='';b.setAttribute('aria-label',label+' 캐릭터');b.setAttribute('aria-pressed',String(id===world));b.append(img,node('span','',label));b.onclick=()=>open(id);portraits.append(b);}body.append(portraits);
  const identity=node('div','profile-identity');identity.append(node('h3','','윤서'),node('span','profile-level','Lv. '+w.level),node('span','profile-rank',world==='reality'?Advancement.describe(g,'hunter').name+'급 헌터':Advancement.describe(g,'realm').name));body.append(identity);
  const exp=node('div','profile-exp'),bar=node('progress');bar.max=s.next;bar.value=w.xp;bar.setAttribute('aria-label','경험치');exp.append(node('span','','EXP'),bar,node('span','',w.xp+' / '+s.next));body.append(exp);
  const stats=node('div','profile-stats');for(const [icon,label,value]of [['♥','체력',s.hp],['◈',world==='murim'?'내력':'자원',s.mp],['⚔','공격력',s.attack]]){const row=node('div','profile-stat');const glyph=node('span','profile-stat-icon',icon);glyph.setAttribute('aria-hidden','true');row.append(glyph,node('span','',label),node('strong','',String(value)));stats.append(row);}body.append(stats);
  const equipped=g.worldGrowth[world].equipped;body.append(node('div','profile-equipped',equipped?(globalThis.DualWorld.Fate.PATHS[equipped]?.name||'기본 무공'):'기본 무공'));
  show('캐릭터',body,[{label:'닫기',secondary:true}],'system');if(world==='reality'){const unread=g.unreadNews('status');for(const item of unread)g.readNews(item.id);if(unread.length)refresh();}
 }return {open};}};})(globalThis);
