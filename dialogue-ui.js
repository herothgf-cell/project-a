(function(root){'use strict';root.DialogueUI={create({show,node}){return {open({id,title=id,scenes,result,actions=[{label:'계속하기'}],art=null,intro=false,escapeAction=null}){
 const pages=[...scenes];if(result?.length)pages.push({speaker:'획득 결과',portrait:'system',kind:'result',text:result.join('\n')});const cursor=DialogueData.sequence(pages,actions);
 function render(){const s=pages[cursor.index],body=node('section',intro?'intro-scene speaker-scene':'speaker-scene');body.dataset.scene=id||title;
 if(art&&cursor.index===0){const img=node('img','intro-still');img.src='assets/art/intro/'+art+'.webp';img.alt=title;body.append(img);}
 body.append(node('h3','dialog-speaker',s.speaker),node('p',s.kind==='result'?'quest-result':'dialog-lines',s.text));
 const last=cursor.index===pages.length-1,buttons=last?actions.map((a,i)=>({...a,run:()=>cursor.choose(i)})):[{label:'계속하기',run:()=>{cursor.next();render();}},{label:'대화 건너뛰기',secondary:true,run:()=>{cursor.skip();render();}}];if(escapeAction&&!last)buttons.push(escapeAction);
 show(title,body,buttons,s.portrait,`${s.kind==='result'?'이미 획득한 결과':'이야기'} · ${cursor.index+1} / ${pages.length}`);
 }render();
 }};}};})(globalThis);
