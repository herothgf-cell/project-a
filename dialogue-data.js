/* Authored story beats. UI paging never owns game progression or rewards. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.DialogueData=api;})(globalThis,function(){
 'use strict';const portraits={윤서:'hero',백련:'master',서린:'warden',연화:'yeonhwa',도겸:'hunter',이야기:'system'};
 const scene=(speaker,text)=>({speaker,portrait:portraits[speaker]||'system',text,kind:speaker==='이야기'?'narration':'speech'});
 const authored={
  'intro-0':[['이야기','안정화가 끝난 지하역에서 잔류 신호가 다시 잡혔다. 윤서는 외곽 장비를 회수하러 왔다.'],['서린','안쪽으로는 가지 마. 오늘은 바깥쪽 측정기만 회수해.'],['윤서','알았어. E급한테 시킬 만한 일만 하고 갈게.']],
  'intro-1':[['윤서','신호가 벽 안쪽에서 돌아오는데… 이 돌은 공사 자재가 아닌 것 같아.'],['이야기','손끝에 닿은 금이 빛났다. 균열의 소음 대신 대나무가 부딪치는 소리가 들렸다.']],
  'intro-2':[['윤서','지하역이었는데… 저기 사람 있나?'],['백련','가까이 오지 마라. 바람이 거꾸로 흐른다.'],['윤서','움직이지 마세요. 피부터 막을게요.']],
  'intro-3':[['백련','약을 찾지 마라. 상처의 기운을 먼저 눌러야 한다.'],['윤서','피를 막는 건 알아요. 숨부터 천천히 쉬세요.'],['이야기','백련에게 다가가 응급처치한 뒤, 처마 아래까지 부축하자.']],
  'intro-4':[['윤서','제가 건너온 돌이 다시 켜졌어요. 혼자 괜찮으시겠어요?'],['백련','네 덕에 숨은 붙었다. 가까이에 제자들이 있다. 빛이 남았을 때 돌아가거라.'],['윤서','다시 올 수 있으면 상태 보러 올게요.'],['백련','나는 백련이다. 이곳은 청운촌. 그 이름을 기억해라.']],
  'intro-5':[['서린','무전이 끊기고 어디 갔었어? 현장 사람들이 찾고 있었어.'],['윤서','다른 곳에 다녀왔어. 다친 백련이라는 사람을 돕고 돌아왔어. 청운촌이라더라.'],['서린','농담할 얼굴은 아니네. 우리 균열 기록과 네가 본 것을 맞춰 보자.']],
  'intro-6':[['이야기','서린의 손에는 반응이 없었다. 윤서가 닿자 경계석에 세 빛줄기가 이어졌다.'],['서린','너한테만 반응하네. 귀환 위치부터 확인하자. 이상이 생기면 바로 돌아와.'],['윤서','백련의 상태를 보고 올게. 다시 오겠다고 약속했거든.'],['이야기','안전 확인 뒤 현실 기지와 청운촌 사이의 왕복 통로가 정비되었다.']],
  'chapter-1':[['백련','돌아왔구나. 네가 감아 둔 천 덕에 제자들이 나를 찾았다.'],['윤서','얼굴은 나아지셨네요. 윤서입니다. 저쪽에서는 헌터 일을 해요.'],['백련','그 길을 계속 오갈 생각이라면 몸을 지킬 호흡부터 익혀라. 흑풍 죽림의 길을 살펴보거라.']],
  'training-2':[['백련','힘을 크게 쓰려고만 하지 않았구나. 길이 열린 걸 보니 알겠다.'],['윤서','아직 손에 힘이 먼저 들어가요.'],['백련','그래서 다음 호흡이 필요하다. 흐름을 끊지 않고 이어 보거라.']],
  'reality-test':[['서린','백련이라는 분은 괜찮아졌어?'],['윤서','응. 나한테 검 쓰는 법을 가르쳐 줬어. 이쪽에서도 되는지 알고 싶어.'],['서린','외곽의 제한된 현장에서 확인하자. 관리국이 주변을 통제하고 귀환 신호를 유지할게.']],
  'chapter-2':[['서린','감시자 잔해에서 검은 인장이 나왔어. 항만에서도 같은 문양이 확인됐고. 백련에게 보여 줘.']],
  'temple':[['백련','이 문양은 나를 다치게 한 천흔 곁에도 있었다.'],['윤서','현실 균열에서도 나왔습니다.'],['백련','월영 폐사의 세 인장은 흐름을 고르게 하던 장치다. 호위를 물리치고 세 인장을 살펴보거라.']],
  'chapter-3':[['서린','현장 영상에 네가 없는 위치에서도 검격이 남았어. 백련에게 흔적을 보여 주고 네가 발견한 힘을 확인해 보자.']],
  'chapter-4':[['서린','청운 귀환로에 상인 한 명이 고립됐어. 네 무공으로 길을 잇거나 위쪽 권양기로 우회로를 놓을 수 있어. 현장에서 판단해 줘.']],
  'chapter-5':[['서린','영상과 보고가 맞지 않는 이유를 알아야 해. 환서정의 물건과 연화가 남긴 기록을 비교해 보자. 새 기술을 받는 의뢰가 아니라 네 힘을 확인하는 일이야.']],
  'certification':[['서린','관측값도 이제 따라왔네. C급 현장 인증을 발급할게. 개인 헌터 등급과는 별개로 관측소 조사에 참여할 자격이 생긴 거야.']]
 };
 const scenes=Object.fromEntries(Object.entries(authored).map(([id,rows])=>[id,rows.map(r=>scene(...r))]));
 const titles={'백련 · 첫 번째 호흡':'chapter-1','백련 · 경계를 베는 검':'training-2','서린 · 현실에 남은 검':'reality-test','제2장 · 잔월의 서약':'chapter-2','백련 · 잔월의 흔적':'temple','제3장 · 이름 없는 전설':'chapter-3','서린 · 돌아오지 못한 사람':'chapter-4','서린 · 기록에 없는 귀환자':'chapter-5','서린 · 먼저 움직인 사람':'certification'};
 function lookup(title,text,portrait){if(titles[title])return scenes[titles[title]];if(portrait==='system')return null;const name=Object.keys(portraits).find(k=>portraits[k]===portrait)||'이야기',parts=text.split(/(?=^(?:서린|백련|윤서|연화|도겸):\s*)/m).filter(Boolean);return parts.map(part=>{const m=part.match(/^(서린|백련|윤서|연화|도겸):\s*([\s\S]*)$/);return scene(m?m[1]:name,(m?m[2]:part).trim());});}
 function sequence(pages,actions){let index=0,done=false;return {get index(){return index;},next(){index=Math.min(pages.length-1,index+1);},skip(){index=pages.length-1;},choose(i){if(done||index!==pages.length-1||!actions[i]||actions[i].disabled)return;done=true;actions[i].run?.();}};}
 return {scenes,lookup,sequence,scene};
});
