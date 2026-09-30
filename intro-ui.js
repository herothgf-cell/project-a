(function(root){'use strict';
 const scenes=[
 ['되돌아오는 신호','signal','hero','뉴스: 안정화 구역 세 곳에서 잔류 반응이 다시 확인됐습니다. 관리국은 출입 제한을 유지하고 있습니다.\n윤서: 끝난 현장 장비만 가져오면 된다더니.\n서린의 무전: 윤서야, 안쪽으로는 가지 마. 오늘은 바깥쪽 측정기만 회수해.\n윤서: 알았어. E급한테 시킬 만한 일만 하고 갈게.'],
 ['깨진 벽 뒤의 돌','stone','hero','윤서: 신호가 안쪽에서 돌아오는데… 측정기 문제인가?\n윤서: 이 돌은 공사 자재가 아닌 것 같은데.\n서린의 무전: 윤서야? 지금 네 신호가—\n\n손끝에 닿은 금이 빛났다. 균열의 소음 대신, 바람에 대나무가 부딪치는 소리가 들렸다.'],
 ['청운촌의 낯선 하늘',null,'hero','윤서: 지하역이었는데… 이건 촬영장도 아니고.\n윤서: 저기 사람 있나?\n백련: 가까이… 오지 마라. 바람이 거꾸로 흐른다.\n윤서: 움직이지 마세요. 피부터 막을게요.'],
 ['무공 대신 응급처치',null,'master','백련: 약을 찾지 마라. 상처의 기운을 먼저 눌러야 한다.\n윤서: 치료사는 아니지만, 피를 막는 건 알아요. 숨부터 천천히 쉬세요.\n백련: 천흔을 보았느냐? 갑자기 열린 틈이다. 조사하러 간 이들조차 돌아오지 못했다.\n윤서: 제가 알던 균열과는 달랐어요.'],
 ['돌아갈 표식','return','master','윤서: 저 돌이… 다시 켜졌어요.\n백련: 네가 건너온 길인 모양이구나. 빛이 남았을 때 돌아가거라.\n윤서: 혼자 괜찮으시겠어요?\n백련: 네 덕에 숨은 붙었다. 가까이에 내 제자들이 있다. 네가 찾을 길부터 잃지 마라.\n윤서: 다시 올 수 있으면 상태 보러 올게요.\n백련: 나는 백련이다. 이곳은 청운촌. 다시 온다면 그 이름을 기억해라.\n\n처마 쪽에서 백련을 부르는 소리가 들린다.'],
 ['소꿉친구에게 털어놓다','report','warden','서린: 무전 끊기고 어디 갔었어? 현장 사람들 다 찾고 있었어.\n윤서: 미안. 믿기 어려울 텐데, 다른 곳에 다녀왔어. 기와집하고 대숲이 있는 마을.\n서린: 농담할 얼굴은 아니네. 처음부터 말해 봐.\n윤서: 검은 돌에 손을 대니까 길이 열렸어. 다친 사람을 돕고 같은 돌을 타고 돌아왔어. 백련, 청운촌이라고 했어. 틈을 천흔이라 부르더라.\n서린: 우리 균열 보고에도 바람이 거꾸로 움직였다는 내용이 있어. 우선 네 말과 기록을 맞춰 보자.'],
 ['두 번째 방문의 이유','compare','warden','서린의 손에는 반응이 없다. 윤서가 닿자 세 빛줄기가 이어진다.\n\n서린: 정말 너한테만 반응하네. 이건 일반 균열 출입 장치가 아니야.\n윤서: 그 사람 상태를 보고 오고 싶어. 약속도 했고.\n서린: 통로 반응과 귀환 위치부터 확인하자. 확인 끝나면 짧게 다녀와. 이상이 생기면 싸우지 말고 바로 돌아와.\n윤서: 이번엔 돌아오기 전에 소식 남길게.\n\n현장 통제와 안전 확인 뒤, 경계석은 현실 기지와 청운촌의 왕복 지점으로 정비되었다.']
 ];
 function create(env){let replay=false,original=null;const {game,setGame,show,node,refresh}=env;
  function finish(){if(replay){setGame(original);original=null;replay=false;}else game().finishIntro();game().events=[];refresh();}
  function resume(){const g=game(),s=g.revision;if(!s||s.intro>=7){finish();return;}const [title,art,portrait,text]=scenes[s.intro],body=node('section','intro-scene');
   if(art){const img=node('img','intro-still');img.src='assets/art/intro/'+art+'.webp';img.alt=title;body.append(img);}body.append(node('p','intro-lines',text));
   const label=s.intro===3?(s.aid?'부축 계속하기':'응급처치하기'):s.intro===6?'백련을 다시 만나러':'계속하기';
   show(title,body,[{label,run:()=>{if(s.intro===3){refresh();return;}g.advanceIntro();if(s.intro>=7)finish();else resume();refresh();}},{label:replay?'회상 끝내기':'인트로 건너뛰기',secondary:true,run:finish}],portrait,'첫 만남 · '+(s.intro+1)+' / 7');
  }
  function start(isReplay=false){replay=isReplay;if(replay){original=game();const g=new DualWorld.Game();g.beginIntro(true);setGame(g);}else if(!game().introActive)game().beginIntro(true);resume();}
  return {start,resume,finish,get replay(){return replay;},get active(){return !!game().introActive;}};
 }
 root.IntroUI={create,scenes};
})(globalThis);
