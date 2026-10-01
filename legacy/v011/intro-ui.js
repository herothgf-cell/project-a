(function(root){'use strict';
 const scenes=[['되돌아오는 신호','signal'],['깨진 벽 뒤의 돌','stone'],['청운촌의 낯선 하늘'],['무공 대신 응급처치'],['돌아갈 표식','return'],['소꿉친구에게 털어놓다','report'],['두 번째 방문의 이유','compare']];
 function create(env){let replay=false,original=null;const {game,setGame,show,node,refresh}=env,dialogues=DialogueUI.create({show,node});
  function finish(){if(replay){setGame(original);original=null;replay=false;}else game().finishIntro();game().events=[];refresh();}
  function resume(){const g=game(),s=g.revision;if(!s||s.intro>=7){finish();return;}const [title,art]=scenes[s.intro],label=s.intro===3?(s.aid?'부축 계속하기':'응급처치하기'):s.intro===6?'백련을 다시 만나러':'계속하기',escapeAction={label:replay?'회상 끝내기':'인트로 건너뛰기',secondary:true,run:finish};
   dialogues.open({id:'intro-'+s.intro,title,scenes:DialogueData.scenes['intro-'+s.intro],intro:true,art,escapeAction,actions:[{label,run:()=>{if(s.intro===3){refresh();return;}g.advanceIntro();if(s.intro>=7)finish();else resume();refresh();}},escapeAction]});
  }
  function start(isReplay=false){replay=isReplay;if(replay){original=game();const g=new DualWorld.Game();g.beginIntro(true);setGame(g);}else if(!game().introActive)game().beginIntro(true);resume();}
  return {start,resume,finish,get replay(){return replay;},get active(){return !!game().introActive;}};
 }root.IntroUI={create,scenes};
})(globalThis);
