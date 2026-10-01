(function(root){'use strict';
 function create({node}){
  const notices=[];
  function channel(id,cls){const el=node('div',cls);el.id=id;el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.setAttribute('popover','manual');el.hidden=true;document.body.append(el);const item={el,remaining:0,last:performance.now()};notices.push(item);return item;}
  const inheritance=channel('inheritanceNotice','inheritance-notice'),levelup=channel('levelNotice','level-notice');
  function hide(item){if(item.el.matches(':popover-open'))item.el.hidePopover();item.el.hidden=true;}
  function clear(){for(const item of notices){hide(item);item.remaining=0;item.el.replaceChildren();}}
  function update(){const now=performance.now(),blocked=!!document.querySelector('dialog[open]')||document.hidden;
   for(const item of notices){if(!blocked&&!item.el.hidden)item.remaining-=now-item.last;item.last=now;
    if(blocked||item.remaining<=0){hide(item);continue;}if(item.el.hidden){item.el.hidden=false;item.el.showPopover?.();}}
  }
  function inherit(e){if(!e.inheritance)return;const item=inheritance;hide(item);item.el.replaceChildren();item.el.style.setProperty('--inherit-color',DualWorld.Fate.PATHS[e.path].color);item.el.append(node('small','','기연 계승'),node('strong','','윤서님이 잃어버린 무공 「'+DualWorld.Fate.PATHS[e.path].name+'」을 계승했습니다.'),node('span','','이 여정의 첫 계승 · 싱글플레이 연출'));item.remaining=7000;item.last=performance.now();update();}
  function level(e){const item=levelup;hide(item);item.el.replaceChildren(node('small','','LEVEL UP'),node('strong','',(e.world==='reality'?'현실 ':e.world==='murim'?'무림 ':'')+'Lv.'+e.level),node('span','','최대 체력 +'+e.hp+(e.world==='reality'?' · 최대 자원 +':' · 최대 내력 +')+e.mp+' · 공격력 +'+e.attack));item.remaining=3000;item.last=performance.now();update();}
  document.addEventListener('visibilitychange',update);
  return {inherit,level,update,clear};
 }
 root.ProgressionUI={create};
})(globalThis);
