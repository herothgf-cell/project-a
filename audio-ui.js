(function(root){'use strict';root.AudioUI={create({audio,show,node}){
 function open(){const body=node('section','audio-settings'),s=audio.settings();body.append(node('p','','전투 예고는 소리와 화면으로 함께 표시됩니다.'));
  const mute=node('button','secondary',s.muted?'소리 켜기':'소리 끄기');mute.setAttribute('aria-pressed',String(s.muted));mute.onclick=()=>{audio.setSettings({muted:!audio.settings().muted});audio.unlock();open();};body.append(mute);
  for(const [key,label]of [['master','전체'],['music','배경음'],['combat','전투 효과음'],['ui','UI 효과음']]){const row=node('label','audio-setting'),text=node('span','',label),input=node('input',''),value=node('output','',Math.round(s[key]*100)+'%');input.type='range';input.min='0';input.max='100';input.step='1';input.value=String(Math.round(s[key]*100));input.setAttribute('aria-label',label+' 음량');input.oninput=()=>{audio.setSettings({[key]:Number(input.value)/100});value.textContent=input.value+'%';};row.append(text,input,value);body.append(row);}
  body.append(node('p','','배경음 설정은 보존됩니다. 현재 별도 배경음 트랙은 없습니다.'),node('h3','','미리듣기'));
  for(const [world,label]of [['murim','무림'],['reality','현실']]){const row=node('div','audio-previews');row.append(node('span','',label));for(const [kind,name]of [['telegraph','예고'],['hit','타격'],['counter','반격']]){const b=node('button','secondary',name);b.setAttribute('aria-label',label+' '+name+' 미리듣기');b.onclick=()=>audio.preview(kind,world);row.append(b);}body.append(row);}
  if(s.muted)body.append(node('p','','음소거 중입니다. 소리를 켜면 미리들을 수 있습니다.'));show('설정 · 소리',body,[{label:'닫기',secondary:true}],'settings','음량과 전투 신호');
 }
 return {open};
}};})(globalThis);
