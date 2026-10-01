/* Intentional simulated news, one-step guidance and a unified HUD. No remote chat or analytics. */
(function(root){
 'use strict';
 const P=Presentation,$=id=>document.getElementById(id);
 function create(env){
  const {game,show,node,refresh,active,clearInput,notes}=env;
  let signature='',newsViews=[],lastWorld='',lastGame=null;
  const button=(label,fn,cls='secondary')=>{const b=node('button',cls,label);b.type='button';b.addEventListener('click',fn);return b;};
  const help=button('도움말',()=>openHelp(),'realm-help');help.id='helpButton';help.setAttribute('aria-label','기감과 무공 해석 도움말 H');help.append(node('kbd','','H'));$('journeyTools').append(help);
  const worldBadge=node('span','world-badge');worldBadge.id='realmBadge';$('playArea').append(worldBadge);
  const guideToggle=button('길잡이 끄기',()=>{game().guideActive=false;refresh();},'guide-dismiss');
  const guideHint=node('div','guide-card');guideHint.id='guideCard';guideHint.hidden=true;guideHint.append(node('strong','','선택 탐험 길잡이'),node('p','',''),button('현재 단계 자세히',()=>openHelp()),guideToggle);$('playArea').append(guideHint);
  $('rumorPanel').hidden=true;
  function openNews(){}
  function openHelp(){if(!active())return;const g=game(),u=P.guide(g),body=node('section','realm-help-sheet');
   body.append(node('p','help-purpose','환서정은 기존 무공의 사용법을 바꾸는 단서를 찾는 선택 탐험입니다. 진행하지 않아도 기존 이야기와 무공은 유지됩니다.'));
   for(const [title,copy]of [['기감 · B / 화면 기감','내 주변의 숨겨진 반응을 찾습니다. 전체 지도 정답을 표시하지는 않습니다.'],['조사 · E / 화면 대화·이동','드러난 물건 가까이에 서서 내용을 살펴봅니다.'],['관찰 수첩 · N / 수첩','확인한 사실, 발견한 무공 해석, 성장 방법을 읽습니다.'],['무공 해석 · 기존 기술의 변형','세 계열에 두 가지씩 있습니다. 발견만으로 직업이 바뀌지 않으며 수락·보류·원래 운용 복귀가 가능합니다.']]){const row=node('article','help-step');row.append(node('b','',title),node('p','',copy));body.append(row);}
   const next=node('section','guide-next');next.append(node('small','','지금 할 일'),node('h3','',u.title),node('p','',u.text));body.append(next);
   if(g.area==='archive'){const choose=node('div','guide-paths');for(const [path,label]of [['ripple','호위검'],['echo','필사본'],['seal','봉인 탁본']])choose.append(button(label,()=>{g.guidePath=path;openHelp();},g.guidePath===path?'primary':'secondary'));body.append(choose);}
   show('기감과 무공 해석 · 처음 해보기',body,[{label:'길잡이 켜고 직접 해보기',disabled:g.progress<2,run:()=>{g.guideActive=true;refresh();}},{label:'수첩 열기',secondary:true,run:()=>notes.open('facts')},{label:'혼자 살펴보기',secondary:true,run:()=>{g.guideActive=false;refresh();}}],'hero','조작은 알려드리고, 발견은 직접 합니다');
  }
  function notebookHint(body){const g=game(),u=P.guide(g),card=node('div','guide-next');card.append(node('small','','다음에 할 수 있는 행동'),node('b','',u.title),node('p','',u.text));card.append(button('실제 화면에서 안내 받기',()=>{g.guideActive=true;openHelp();}));body.prepend(card);}
  function update(){const g=game(),a=DualWorld.AREAS[g.area];if(g!==lastGame){lastGame=g;signature='';}
   const world=P.worldStyle(a);$('game').dataset.realm=world.architecture;worldBadge.textContent=world.world==='현실'?'현실 / HUNTER DISTRICT':'무림 / MARTIAL REALM';
   const mapLabel=$('mapWorld');if(mapLabel)mapLabel.textContent='['+a.world+'] '+a.name.split(' · ')[0];
   help.classList.toggle('help-recommended',g.progress>=2&&!g.journey?.facts?.length);
   guideHint.hidden=!g.guideActive;const u=P.guide(g);if(g.guideActive){guideHint.querySelector('p').textContent=u.title;guideHint.querySelector('strong').textContent='선택 탐험 · '+(u.path?DualWorld.Fate.PATHS[u.path].name:'기감 안내');}
   if(a.world!==lastWorld){lastWorld=a.world;$('hudPortrait').setAttribute('aria-label',a.world+'의 윤서');}
  }
  return {update,openHelp,openNews,notebookHint,guide:()=>game().guideActive?P.guide(game()):null};
 }
 root.RealmUI={create};
})(globalThis);
