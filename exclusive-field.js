(function(root,f){const n=typeof module==='object'&&module.exports,api=f(n?require('./exclusive-story-data.js'):root.ExclusiveStoryData);if(n)module.exports=api;else root.ExclusiveField=api;})(globalThis,function(Data){
 'use strict';
 const npc=(id,label,x,y,role='shop')=>({id,label,x,y,kind:'npc',role});
 const object=(id,label,x,y)=>({id,label,x,y,kind:'story-clue'});
 const residents={
  city:[npc('npc-minjae','민재 · 장비 작업대',600,540),npc('npc-jiwoo','지우 · 현장 책임자',850,550,'warden'),npc('npc-jeongsun','정순 · 수리점',340,650)],
  clinic:[npc('npc-minjae','민재',560,480),object('clinic-chart','진료 기록',780,400)],
  home:[object('home-notes','탁자 · 두 장의 기록',540,360)],
  shrine:[npc('npc-soyeon','소연 · 여울장으로 가는 길',350,700,'warden'),object('shrine-mark','돌바닥의 겹친 흔적',820,410)],
  yeoul:[npc('master','백련 · 수련 마당',600,430,'master'),npc('npc-soyeon','소연 · 길목',840,660,'warden'),npc('npc-seoha','서하 · 조사 지도',420,640)],
  inn:[npc('npc-damhee','담희 · 새벽객점',600,430),object('inn-ledger','객점 장부',850,430)],
  recovery:[npc('npc-minjae','민재 · 회수 대기소',370,760),object('stone-table','분류대 · 파손된 문석',600,360)],
  northRoad:[npc('npc-seoha','서하 · 조사 표식',420,760),object('array-map','정맥진의 흐름',1060,350)],
  outerArray:[npc('npc-soyeon','소연 · 임시 야영지',370,800,'warden'),npc('master','백련 · 야영지',580,800,'master')],
  prison:[npc('npc-seoha','서하 · 닫힌 감방',1120,350)]
 };
 const edges=[['city','home'],['city','clinic'],['city','recovery'],['city','guardSite'],['city','experimentSite'],['city','riftFinal'],['city','comparison'],['shrine','songrim'],['songrim','yeoul'],['yeoul','inn'],['yeoul','southernRoad'],['yeoul','sanctum'],['yeoul','northRoad'],['northRoad','outerArray'],['outerArray','bypass'],['bypass','supply'],['supply','prison'],['prison','circulation'],['circulation','arrayHeart']];
 const locations={
  'stone-accident':['recovery','stone-table'],'clinic-return':['clinic','npc-minjae'],'yeoul-arrival':['inn','npc-damhee'],'return-failed':['shrine','shrine-mark'],
  'work-schedule':['city','npc-jeongsun'],'four-principles':['yeoul','master'],'thunder-lesson':['yeoul','master'],'different-start':['yeoul','master'],'measurement':['city','npc-minjae'],
  'north-contract':['yeoul','npc-seoha'],'absence-cost':['city','npc-jiwoo'],'array-discovery':['northRoad','array-map'],'local-experiment':['city','npc-minjae'],'mentor-secret':['yeoul','master'],
  'companion-refused':['shrine','master'],'small-circulation':['yeoul','master'],'paired-measurement':['city','npc-minjae'],'closed-road':['yeoul','npc-soyeon'],
  'local-preparation':['outerArray','master'],'reality-preparation':['city','npc-jiwoo'],'injured-wait':['shrine','shrine-mark'],'role-assessment':['city','npc-jiwoo'],
  'reality-account':['city','npc-minjae'],'murim-account':['inn','npc-damhee'],'two-notebooks':['yeoul','master']
 };
 const jobs={
  'recovery-work':[['recovery','npc-minjae'],['recovery','npc-minjae']],
  'basic-composition':[['yeoul','master'],['yeoul','master']],
  'blade-field':[['yeoul','npc-soyeon'],['yeoul','master']],
  'guard-shift':[['city','npc-jiwoo'],['city','npc-jiwoo']],
  'first-creation':[['yeoul','master'],['yeoul','master']],
  'creation-proof':[['yeoul','master'],['yeoul','master']],
  'first-reproduction':[['city','npc-minjae'],['city','npc-minjae']],
  'north-survey':[['yeoul','npc-seoha'],['yeoul','npc-seoha']],
  'hypothesis-field':[['city','npc-minjae'],['city','npc-minjae']],
  'dogyeom-limit':[['yeoul','npc-soyeon'],['outerArray','master']],
  'bypass-secured':[['outerArray','npc-soyeon'],['outerArray','npc-soyeon']],
  'supply-stopped':[['outerArray','master'],['outerArray','master']],
  'murim-rescue':[['outerArray','npc-soyeon'],['outerArray','npc-soyeon']],
  'murim-array-stopped':[['outerArray','master'],['outerArray','master']],
  'murim-support':[['outerArray','master'],['outerArray','npc-soyeon']],
  'reality-support':[['city','npc-jiwoo'],['city','npc-jiwoo']]
 };
 // These are playable adaptations. The manuscript remains unchanged; cooldown passages follow the approved gameplay revision.
 const scenes={
  'stone-accident':[['민재','회수는 여기까지야. 무거운 건 두고, 분류대의 작은 조각만 봉투에 넣어 줘.'],['윤서','이 돌… 봉인이 갈라졌는데.'],['서술','놓으려는 순간 팔 안에서 반격이 먼저 작동했다. 나가려던 충격과 차가운 흐름이 맞부딪혔다. 돌은 손안에서 빛을 잃고 부서졌다.'],['민재','윤서! 손 펴 봐. 일어나지 말고, 나를 봐. 진료소로 가자.']],
  'clinic-return':[['민재','검사엔 이상이 없대. 그렇다고 내일 바로 현장에 나오지는 마.'],['윤서','팔 안에 뭔가 남은 것 같아. 돌은 어떻게 됐어?'],['민재','반응이 없어. 그냥 가루야. 오늘은 집에 가서 쉬고, 연락은 받아.'],['서술','붕대 아래 두 선이 서로 어긋나 있었다. 윤서는 자취방으로 돌아가 보기로 했다.']],
  'yeoul-arrival':[['담희','이 종이는 여기서 돈으로 못 써요. 어느 고을에서 왔어요?'],['윤서','멀리서… 왔습니다. 지금은 돌려드릴 돈이 없습니다.'],['소연','오늘 방값은 제가 낼게요. 사당에서 다친 채로 있던 사람이에요.'],['담희','밥부터 먹어요. 빚은 내일 장작을 옮겨서 갚아도 되니까.'],['서술','윤서는 뜨거운 숟가락을 꼭 쥐었다. 꿈이라면 이 온기까지 남을까. 돌아갈 길부터 확인해야 했다.']],
  'return-failed':[['윤서','사진에는 내 방과 이 사당이 연달아 찍혀 있어. 꿈은 아니야.'],['서술','계단 아래 갈라진 바위를 사진에 남겼다. 표식 밖에서는 흐름이 흩어지고, 처음 도착한 자리에서만 다시 모였다.'],['윤서','장소가 열쇠였어. 저 돌바닥으로 가 보자.']],
  'work-schedule':[['정순','수리 맡겨 놓고 연락이 없어서 걱정했지. 손은 괜찮아?'],['윤서','다음 일은 날짜를 확인하고 잡으려고요. 당분간 비는 날이 좀 있습니다.'],['정순','떠나는 건 네 사정이지. 맡은 일의 날짜는 남겨. 기다리는 사람도 시간을 쓰니까.'],['윤서','네. 이번엔 먼저 말씀드릴게요.']],
  'four-principles':[['백련','방패를 세워 보게. …팔보다 먼저 발이 굳는군.'],['윤서','받는 동안에는 움직이면 안 된다고 배웠습니다.'],['백련','처음 가르칠 때 범위를 줄인 말이겠지. 평생 그 자리에 있으라는 뜻은 아닐 걸세.'],['서술','백련이 윤서의 왼발을 반 뼘 옮겼다. 버티기는 어려워졌지만, 물러날 자리가 생겼다.'],['백련','형은 몸의 모양, 기는 힘의 성질, 운은 움직임, 의는 겨누는 뜻일세. 월영참의 네 가지부터 익혀 보게. 조합은 자네 손으로 해야 하네.']],
  'thunder-lesson':[['백련','남쪽 길에서 자네가 칼을 거뒀다더군.'],['윤서','한 번 더 치면 발이 따라오지 않을 것 같았습니다.'],['백련','멈출 때를 알면 모을 때도 배울 수 있지. 오늘은 천뢰격일세. 힘을 모은 뒤, 놓아야 할 곳에 한 번에 놓는 걸세.']],
  'different-start':[['윤서','배운 대로 베는데도 반격을 섞으면 늦습니다.'],['백련','내 검은 밖으로 나가며 시작하네. 자네 힘은 닿은 뒤 안에서 시작하지. 같은 출발점으로 다루면 엉킬 수밖에.'],['윤서','그럼 검을 버려야 합니까?'],['백련','배운 것을 버리라는 말이 아니네. 자네에게 맞는 순서로 다시 엮어 보라는 걸세.']],
  'measurement':[['민재','영상 멈춰 봐. 여기, 힘을 쓰기 전에 어깨가 두 번 움직여.'],['윤서','하나로 이어진 줄 알았는데.'],['민재','무슨 훈련을 했는지는 아직 말 안 해도 돼. 대신 어디서 끊기는지는 같이 보자. 위험한 걸 숨기면 그땐 화낼 거야.']],
  'north-contract':[['서하','북쪽 옛 관문을 조사하려 합니다. 호위가 필요한데, 소연에게 이야기를 들었어요.'],['소연','거기 상단 일이 잘 풀리면 어머니 모실 집도 알아볼 수 있어요. 난 그 일도 같이 볼 거예요.'],['윤서','저도 갈 수 있을까요? 배운 걸 써 볼 곳이 필요합니다.'],['서하','그럼 출발 전에 비울 날짜부터 정해 줘요. 길 위에선 각자 빠져나갈 수 없으니까.']],
  'absence-cost':[['지우','이번 근무도 비우겠다고? 네 자리를 누가 맡는지는 알고 있지?'],['윤서','대신 들어갈 수 있는 날을 적었습니다. 급하게 연락을 끊지는 않겠습니다.'],['지우','사정은 다 말하지 않아도 돼. 현장에 올 수 있는지 없는지는 확실하게 해 줘.']],
  'array-discovery':[['서하','이쪽 수로는 넘치는데, 고개 반대편 우물은 말랐어요. 비가 적어서만은 아니에요.'],['윤서','흐름이 저 건물로 모이고 있습니다.'],['서하','정도관의 정맥진이에요. 살린 땅만 기록하면, 말라 버린 땅은 없었던 일이 되겠죠. 전 둘 다 적을 겁니다.']],
  'local-experiment':[['민재','동력 실험 이후부터 곡선이 흔들려. 장비 고장인 줄 알았는데 전부 같은 시간에 튀어.'],['윤서','한쪽으로 몰렸다가 다시 빠지는 모양이네.'],['민재','맞아. 직접 현장을 보기 전에는 원인을 단정하면 안 돼. 이 기록은 가져가도 좋아.']],
  'mentor-secret':[['윤서','스승님께는 말씀드려야겠습니다. 제 고향은 이 길 끝에 있는 곳이 아닙니다.'],['백련','…다른 하늘이라. 자네가 사라지는 이유가 그것이었나.'],['윤서','믿으시겠습니까?'],['백련','모르는 것을 안다고 할 수는 없지. 그렇다고 자네 말을 듣지도 않고 버릴 수도 없네. 사당에서 함께 확인해 보세.']],
  'companion-refused':[['백련','함께 서니 선이 사라지는군. 내가 물러나면 어떤가?'],['서술','백련이 표식 밖으로 발을 뺐다. 윤서의 손목에서 두 선이 다시 맞물렸다.'],['윤서','저 혼자만 갈 수 있는 것 같습니다.'],['백련','그럼 내가 가서 대신 풀어 줄 수는 없겠군. 대신 자네가 가져갈 수 있는 것을 가르쳐야지.']],
  'small-circulation':[['백련','바깥 기운을 계속 빌릴 수 없다면 몸 안에서 짧게 닫아 보게.'],['윤서','작게 만들면 힘이 모자라지 않습니까?'],['백련','끝나지 못할 큰 동작보다, 끝까지 마칠 작은 동작이 다음 수를 남기네.']],
  'paired-measurement':[['민재','가져온 기록과 이쪽 곡선의 간격이 같아. 통신은 안 되는데 에너지 반응은 맞물려 있네.'],['윤서','사람이 지나갈 통로와는 다른 거야.'],['민재','그건 현장에서 확인하자. 지금 우리가 할 일은 이 장비가 버티는 범위를 알아내는 거야.']],
  'closed-road':[['소연','서하가 안 돌아왔어요. 정도관에 기록을 보여 주러 간 뒤로요.'],['윤서','마른 우물 이야기를 적은 장부 때문에?'],['소연','마지막으로 만난 사람이 문을 닫는 걸 봤대요. 이번엔 길을 조사하러 가는 게 아니에요. 사람을 데리러 가요.']],
  'local-preparation':[['백련','정면에서 받아내려 하면 두 번째 칼에 무너지네. 진이 그자의 다음 힘을 채우고 있어.'],['소연','우회로는 제가 찾았어요. 공급부터 끊으면 안쪽으로 들어갈 수 있어요.'],['윤서','제가 서하를 찾겠습니다. 혼자 끝내려고 하지는 않겠습니다.']],
  'reality-preparation':[['지우','시설 안쪽이 무너지고 있어. 민재 장비를 옮길 통로부터 확보한다.'],['윤서','다른 일을 마치고 돌아오겠습니다. 돌아오면 제가 맡을 수 있는 구간을 주세요.'],['지우','돌아올 약속은 해. 몸이 성하지 않으면 역할을 바꾼다. 여기서는 네가 혼자 버틸 필요 없어.']],
  'injured-wait':[['서술','검을 쥔 손가락이 잘 펴지지 않았다. 사당의 바람이 옷 안으로 들어왔다.'],['윤서','건너가도 이 상처가 없어지는 건 아니지. 이번에는 먼저 상태부터 말하자.'],['서술','윤서는 붕대를 고쳐 묶고 표식으로 걸어갔다. 기다리게 한 사람들이 있었다.']],
  'role-assessment':[['지우','팔 들어 봐. …거기까지면 됐어. 선두는 내가 맡는다.'],['윤서','싸울 수는 있습니다.'],['지우','알아. 그래서 민재 옆을 맡기는 거야. 장비가 돌아갈 시간을 벌어 줘. 끝내는 건 우리가 한다.']],
  'reality-account':[['민재','이번엔 먼저 손을 보여 주더라. 전에는 괜찮다는 말부터 했는데.'],['윤서','혼자 할 수 있는 일부터 줄여 봤어.'],['민재','덕분에 장비가 끝까지 돌았어. 다음 현장도 같이 가자. 보고서에는 네 몫을 제대로 적을게.']],
  'murim-account':[['담희','방값은 다 갚았어요. 다음엔 빚 갚으러 오는 얼굴로 안 들어와도 돼요.'],['윤서','그럼 밥 먹으러 오겠습니다. 서하는요?'],['담희','살아서 돌아오자마자 또 지도를 펴더군요. 소연도 자기 일 보러 갔고요. 다들 제 길을 다시 걷나 봐요.']],
  'two-notebooks':[['백련','이제 자네가 만든 동작을 자네 말로 설명할 수 있겠나?'],['윤서','어디서 시작하고, 어디서 멈춰야 하는지는 적었습니다. 다음엔 다른 사람도 따라 할 수 있게 남기고 싶습니다.'],['백련','좋네. 이름보다 오래 남는 건 다시 해낼 수 있는 배움이지.'],['서술','현실의 수첩과 무림의 수첩을 따로 덮었다. 두 곳의 사람들은 만나지 못했다. 윤서는 두 곳에서 배운 것을 같은 손으로 쥐고 있었다.']]
 };
 const missionLines={
  'recovery-work':[['민재','지난번처럼 충격을 끝까지 받아내려 하지 마. 용량을 넘으면 네 팔부터 다쳐.'],['윤서','알아. 이번엔 발부터 빼 볼게.'],['민재','터널 안쪽 세 놈만 밀어내 줘. 난 입구에서 장비를 회수할게. 끝나면 여기로 돌아와.']],
  'basic-composition':[['백련','이제 네 요소를 자네 손으로 골라 보게. 정답은 배웠지만 몸에 새기는 일은 대신할 수 없네.'],['윤서','완성하면 보여 드리겠습니다.']],
  'blade-field':[['소연','남쪽 길에 짐승이 모였어요. 장작꾼들이 못 돌아오고 있어요.'],['윤서','배운 검으로 도움이 될까요?'],['소연','칼을 얼마나 크게 휘두르는지 보러 가는 게 아니에요. 돌아올 길을 여는 거예요. 백련 선생님께 결과도 전해 주세요.']],
  'guard-shift':[['지우','오늘은 짧은 경계 구간을 맡아. 무리하면 바로 뒤로 빠지고.'],['윤서','앞자리에 서도 되는 겁니까?'],['지우','네가 할 수 있는 만큼 맡기는 거야. 현장을 정리하면 직접 보고해 줘.']],
  'first-creation':[['백련','배운 무공 두 가지를 엮어 보게. 내 동작을 똑같이 만드는 게 목표는 아니네.'],['윤서','반격이 시작되는 자리부터 바꿔 보겠습니다.']],
  'creation-proof':[['백련','글로 맞는 순서와 몸이 해내는 순서는 다르네. 수련장에서 실제 효과를 확인하고 오게.'],['윤서','이름을 붙이기 전에 먼저 써 보겠습니다.']],
  'first-reproduction':[['민재','연습한 동작을 이쪽 환경에서 해 보자. 장착했다는 기록 말고 실제로 바뀌는 걸 봐야 해.'],['윤서','긴 동작을 줄여 왔어. 비교 현장에서 확인하고 올게.']],
  'north-survey':[['서하','북쪽 길의 표식을 읽으려면 먼저 위험한 구간을 비워야 해요.'],['윤서','위협을 정리하고 여울장으로 돌아오겠습니다.'],['서하','기록도 좋지만 사람부터 돌아와야 해요. 무리하지 말아요.']],
  'hypothesis-field':[['민재','이제 계측 현장에서 짧은 순환이 유지되는지 보자. 위험하면 장비는 두고 나와.'],['윤서','현장을 확보하면 기록을 들고 돌아올게.']],
  'dogyeom-limit':[['소연','정도관 외곽까지는 갈 수 있어요. 안에서 누가 기다리는지는 몰라요.'],['윤서','서하의 흔적을 찾고, 막히면 물러나겠습니다.'],['소연','백련 선생님은 외곽 야영지로 갈 거예요. 거기로 돌아와요.']],
  'bypass-secured':[['소연','절벽 밑으로 돌아가는 길을 찾았어요. 저 길목만 열면 공급소에 닿아요.'],['윤서','길을 확보하고 이 야영지로 돌아오겠습니다.']],
  'supply-stopped':[['백련','공급소가 살아 있으면 안에서 베어도 다시 힘이 차오르네. 먼저 거길 끊게.'],['윤서','돌아와서 흐름이 어떻게 바뀌었는지 말씀드리겠습니다.']],
  'murim-rescue':[['소연','서하가 감금된 곳을 찾았어요. 공급소 뒤 통로로 들어가면 돼요.'],['윤서','경계를 치운 뒤 직접 문을 열겠습니다.'],['소연','서하를 만나면 야영지로 오라고 해 줘요. 제가 여기서 기다릴게요.']],
  'murim-array-stopped':[['백련','사람은 나왔네. 이제 마지막 순환 장치를 멈춰야 다시 붙잡힐 일이 없겠지.'],['윤서','장치 앞 경계를 정리하고 돌아오겠습니다.']],
  'murim-support':[['백련','도겸의 칼을 혼자 끝까지 받지 말게. 세 번의 틈만 내 주면 우리 둘이 들어가겠네.'],['소연','돌아올 자리도 남겨 놔요. 살아서 야영지에서 만나는 거예요.']],
  'reality-support':[['지우','맥갑수가 장비 쪽으로 붙는다. 세 번의 위협을 끊고 열두 초만 벌어 줘.'],['민재','네 뒤는 내가 볼게. 신호가 나면 물러나.'],['윤서','끝내는 건 너희에게 맡길게.']]
 };
 const reportLines={
  'basic-composition':[['윤서','네 가지를 맞추니 동작이 한 번에 이어졌습니다. 이게 월영참입니까?'],['백련','그렇네. 이제 자네가 익힌 무공일세. 목인으로 더 확인해도 좋고, 소연과 길에 나가 보아도 좋네.']],
  'hypothesis-field':[['윤서','오래 붙들수록 강해지는 줄 알았는데, 먼저 새어 나갔어. 짧게 끊으니 남았고.'],['민재','계측도 같아. 네 설명에 맞춰 기록을 고칠게. 이 정도면 장비가 버티는 시간도 잡을 수 있겠어.']],
  'bypass-secured':[['윤서','뒤편 길을 열었습니다. 순찰이 돌아오기 전에 움직일 수 있습니다.'],['소연','그 길로 서하에게 갈게요. 당신은 선생님께 공급소 쪽 상황을 물어봐요.']],
  'supply-stopped':[['윤서','공급소 경계는 걷어 냈습니다. 더 들어오는 짐은 없습니다.'],['백련','잘했네. 진 안에 남은 힘은 아직 흐를 걸세. 먼저 사람을 꺼내야 하네.']],
  'murim-array-stopped':[['윤서','순환 장치 앞의 경계를 정리했습니다. 길이 열렸습니다.'],['백련','장치는 내가 멈추겠네. 소연과 돌아올 길을 지켜 주게. 이제 도겸도 이 일을 알았을 테니.']],
  'recovery-work':[['윤서','안쪽은 정리했어. 그런데 받아낸 힘이 손에 남아서 잘 안 펴져.'],['민재','봉부터 내려놔. 싸움이 끝난 뒤에 나가는 반격으로는 네 몸을 못 지켜. 오늘은 여기까지 하자.']],
  'blade-field':[['윤서','길은 열었습니다. 두 번째로 베려다가 멈췄습니다.'],['백련','그 멈춤 덕에 돌아온 것일 수도 있네. 자네 몸이 할 수 있는 일을 하나 알아낸 셈이지.']],
  'guard-shift':[['윤서','경계 구간 정리했습니다. 긴 동작은 중간에 힘이 끊겼습니다.'],['지우','멈추고 보고한 건 잘했어. 다음엔 그 짧은 동작을 기준으로 역할을 잡자.']],
  'first-creation':[['윤서','배운 동작을 제 반격이 시작되는 순서로 엮어 봤습니다.'],['백련','자네가 고른 이름으로 남기게. 이제 몸이 그 순서를 지키는지 볼 차례군.']],
  'creation-proof':[['윤서','이번에는 힘이 겹치지 않았습니다. 다음 동작을 놓을 자리도 남았습니다.'],['백련','그 감각을 잊기 전에 적어 두게. 다른 환경에서는 어디가 달라지는지도.']],
  'first-reproduction':[['민재','봤어. 끊기던 구간에서 이번엔 이어졌어.'],['윤서','완전히 같은 힘은 아니야. 이쪽에서 버티는 길이를 찾은 거지.'],['민재','그 정도면 재현할 수 있는 기록이야. 다시 해낼 수 있다는 게 중요해.']],
  'north-survey':[['윤서','조사 길은 열렸습니다. 그런데 북쪽 수로와 반대편 땅의 상태가 너무 다릅니다.'],['서하','제가 본 것과 같군요. 이제 그 차이를 만든 곳을 직접 보러 가요.']],
  'dogyeom-limit':[['윤서','막아도 다음 공격이 바로 들어옵니다. 저 혼자서는 못 뚫겠습니다.'],['백련','알아내고 돌아온 것이 중요하네. 그자가 아니라 그자에게 힘을 주는 순서를 끊어야겠군.']],
  'murim-rescue':[['윤서','서하를 찾았습니다. 야영지로 돌아오라고 했습니다.'],['소연','살아 있었군요… 고마워요. 기록은 다시 쓸 수 있어도 사람은 그럴 수 없잖아요.']],
  'murim-support':[['소연','선생님이 도겸을 제압했어요. 당신이 비워 준 틈으로 들어갔어요.'],['윤서','끝까지 받았으면… 또 넘어졌겠죠.'],['소연','넘어지기 전에 우리한테 넘겼잖아요. 그게 이번에 달랐어요.']],
  'reality-support':[['지우','맥갑수 처리 완료. 민재, 장비 끄고 윤서부터 봐.'],['민재','이번엔 마지막까지 혼자 안 붙들었네.'],['윤서','기다리고 있는 사람이 있다는 걸 배웠거든.']]
 };
 function initial(){return {version:1,accepted:[],ready:[],cleared:[]};}
 function state(g){return g.worldState.exclusiveField||(g.worldState.exclusiveField=initial());}
 function phase(g,e=g.storyObjective()){return !e?'done':!jobs[e.id]?'scene':state(g).ready.includes(e.id)?'report':state(g).accepted.includes(e.id)?'field':'offer';}
 function destination(g){const e=g.storyObjective();if(!e)return ['yeoul','master'];const p=phase(g);if(jobs[e.id])return p==='offer'?jobs[e.id][0]:p==='report'?jobs[e.id][1]:[e.area,null];return locations[e.id]||[e.kind==='cross'?(e.area==='home'?'shrine':'home'):e.area,e.kind==='cross'?'exclusive-travel':'master'];}
 function route(from,to){if(from===to)return [];const q=[[from]],seen=new Set([from]);while(q.length){const path=q.shift(),at=path.at(-1);for(const pair of [...edges,['home','shrine']])if(pair.includes(at)){const n=pair.find(x=>x!==at);if(seen.has(n))continue;const next=[...path,n];if(n===to)return next.slice(1);seen.add(n);q.push(next);}}return [];}
 function near(g,id){const p=g.points().find(p=>p.id===id);return p&&Math.hypot(g.player.x-p.x,g.player.y-p.y)<90;}
 function dialogue(g,p){const e=g.storyObjective(),[area,id]=destination(g),ph=phase(g);if(e&&area===g.area&&id===p.id&&ph!=='field')return {type:'exclusive-dialogue',eventId:e.id,phase:ph,pointId:p.id,title:e.title,speaker:p.label.split(' · ')[0],lines:ph==='offer'?(missionLines[e.id]||[[p.label.split(' · ')[0],e.text],['윤서','확인하고 직접 돌아와 말씀드리겠습니다.']]):ph==='report'?(reportLines[e.id]||[['윤서','맡은 일을 마치고 돌아왔습니다.'],[p.label.split(' · ')[0],'돌아왔군요. 현장에서 확인한 일은 기록에 남겨 두겠습니다.']]):scenes[e.id]||[['윤서',e.text]]};
  const ambient={master:'발을 둘 자리를 먼저 보게. 칼은 그 다음일세. 필요한 수련이 있으면 말하게.', 'npc-minjae':'장비는 여기서 볼게. 어디가 불편한지는 숨기지 말고 알려 줘.', 'npc-jiwoo':'현장에 갈 때는 맡은 구간과 돌아올 길부터 확인해.', 'npc-jeongsun':'날이 무뎌지면 들러. 오래 쓰려면 손질도 해야지.', 'npc-soyeon':'사당에서 내려오는 길은 송림 고개예요. 여울장의 새벽객점에 가면 밥과 잘 곳을 구할 수 있어요.', 'npc-damhee':'밥은 따뜻할 때 먹어요. 빚 이야기는 그 뒤에 해도 돼요.', 'npc-seoha':'길은 지도만 보고는 다 알 수 없어요. 직접 걸으며 달라진 곳을 기록해야죠.'};
  return {type:'exclusive-dialogue',phase:'ambient',speaker:p.label.split(' · ')[0],pointId:p.id,title:p.label,lines:[[p.label.split(' · ')[0],ambient[p.id]||'낯선 흔적을 수첩에 남겼다. 지금 해야 할 일부터 마치자.']]};
 }
 function guidance(g,areas){
  const e=g.storyObjective(),ph=phase(g),[area,id]=destination(g),target=g.target();
  const name=pair=>(residents[pair[0]]||[]).find(p=>p.id===pair[1])?.label.split(' · ')[0]||'백련';
  if(!e)return {action:'다음 탐험 준비하기',text:'무공 수련에서 배운 무공을 확인하세요.',steps:[],stepIndex:0};
  const job=jobs[e.id],person=job?name(ph==='report'?job[1]:job[0]):name([area,id]);
  const tasks={learn:['월영참 구성하기','화면의 무공 수련 버튼 → 무공 습득 → 월영참 → 배운 요소 선택 → 구성 확인'],create:['새 무공 창안하기','화면의 무공 수련 버튼 → 무공 창안 → 조합 선택 → 필요한 무공 확인 후 창안'],proof:['창안 무공의 실제 효과 확인하기','무공 수련 → 무공 창안 → 만든 무공의 실습을 시작하고 실제 효과를 확인하세요. 실습 종료는 직접 누르세요.'],reproduce:['창안 무공을 현실에서 재현하기','무공 수련 → 무공 창안 → 검증한 무공을 현실에 적용하고 실습에서 실제 효과를 확인하세요.'],combat:['현장 위협 처치하기','방향키 / 스틱으로 적에게 접근 → {key:attack} / 공격 버튼으로 남은 적을 처치하세요.'],support:['동료 엄호하기','12초 동안 생존하며 서로 다른 위협에 세 번 대응하세요. 공격·회피로 동료를 지켜 주세요.']};
  const task=tasks[e.kind]||[e.title,'대화를 끝까지 읽고 진행 버튼을 선택하세요.'];
  let action,text,steps,stepIndex;
  if(job){steps=[name(job[0])+'에게 의뢰 받기',task[0],name(job[1])+'에게 보고하기'];stepIndex=ph==='offer'?0:ph==='report'?2:1;
   action=steps[stepIndex];text=ph==='offer'?person+' 가까이에서 {key:interact} / 상호작용 → 맡겠습니다':ph==='report'?person+' 가까이에서 {key:interact} / 상호작용 → 결과를 전한다':task[1];
  }else{action=e.kind==='cross'?'왕래 표식으로 건너가기':id?.includes('table')||id?.includes('mark')||id==='array-map'?'현장의 흔적 조사하기':person+'와 이야기하기';text=e.kind==='cross'?'왕래 표식 가까이에서 {key:interact} / 상호작용 → 잠시 멈춰 전환 완료':(target?.label||person)+' 가까이에서 {key:interact} / 상호작용 → 대화의 진행 버튼 선택';steps=[action];stepIndex=0;}
  const travel=g.area!==area?(target?.label||areas[area].name)+' 가까이로 이동 → {key:interact} / 상호작용. 도착 후: ':'';
  return {action,text:travel+text,steps,stepIndex,destinationLabel:areas[area].name};
 }
 function validate(g){const s=state(g),ids=Object.keys(jobs);if(s.version!==1)throw Error('현장 의뢰 버전 오류');for(const key of ['accepted','ready','cleared'])if(!Array.isArray(s[key])||new Set(s[key]).size!==s[key].length||s[key].some(id=>!ids.includes(id)))throw Error('현장 의뢰 기록 오류');if(s.ready.some(id=>!s.accepted.includes(id))||s.cleared.some(id=>!s.ready.includes(id)))throw Error('현장 의뢰 선행 오류');return s;}
 return {residents,edges,locations,jobs,scenes,missionLines,reportLines,guidance,initial,state,phase,destination,route,near,dialogue,validate};
});
