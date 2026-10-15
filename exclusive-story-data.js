(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.ExclusiveStoryData=api;})(globalThis,function(){
 'use strict';
 const chapters=['돌아갈 문이 없는 곳','두 번의 아침','처음으로 맡은 앞자리','남의 검이 끝나는 곳','갈 수 있게 된 곳','누구에게도 없는 지도','가져올 수 없는 스승','한쪽에서 닫힌 문','먼저 건너온 쪽의 싸움','따라오지 못한 사람들의 기술','두 권의 수첩'];
 // Ordered events are also the save-format vocabulary. Combat and martial evidence is supplied by the game adapter.
 const rows=[
 [1,'recovery-work','combat','reality','recovery','회수 현장','민재가 퇴로를 확보하는 동안 접근하는 괴물을 막는다. 반격은 접촉한 충격 일부만 잠시 붙잡으며, 큰 충격은 그대로 상처가 된다.'],
 [1,'stone-accident','scene','reality','recovery','파손된 문석','유물 분류대의 돌 조각이 손안에서 떨렸다. 빠져나가려던 잔류 흐름이 반격에 붙잡혔다. 문석은 빛을 잃고 부서졌다. 같은 돌로 사고를 재현할 수는 없다.'],
 [1,'clinic-return','scene','reality','city','진료를 마치고','검사는 끝났지만 손목의 표식은 남았다. 민재는 쉬라고 했다. 윤서는 자취방으로 돌아갔다.'],
 [1,'first-crossing','cross','murim','shrine','낯선 돌바닥','자취방에서 맞물린 두 흐름이 윤서를 폐사당으로 옮겼다. 몸과 직접 멘 짐만 남아 있다. 전화는 연결되지 않는다. 시계와 촬영은 작동한다.'],
 [1,'yeoul-arrival','scene','murim','yeoul','소연과 여울장','소연은 길을 잃은 윤서를 여울장으로 데려갔다. 담희는 새벽객점의 방과 품삯을 계산했다. 누구도 윤서가 다른 세계에서 왔다고 생각하지 않는다.'],
 [2,'return-failed','scene','murim','shrine','돌아갈 자리를 기억하다','갈라진 바위를 사진으로 남겼다. 처음 도착한 돌바닥에서만 두 흐름이 맞물린다. 표식에 다가가면 다시 건널 수 있다.'],
 [2,'first-return','cross','reality','home','두 번째 아침','출근 시간은 이쪽에서도 지나고 있었다. 왕래는 잠을 대신하지 않는다. 윤서는 연락하지 못한 시간을 설명해야 했다.'],
 [2,'work-schedule','scene','reality','city','비워 둔 시간','정순은 맡긴 장비를 건네며 다음 수리 날짜를 적었다. 지우에게는 다음 출근 시간을 약속했다. 두 세계의 시간을 따로 쓸 수는 없다.'],
 [2,'voluntary-return','cross','murim','shrine','스스로 돌아간 길','윤서는 돌아올 시간을 수첩에 적고 여울장으로 향했다. 이번에는 사고에 떠밀린 발걸음이 아니다.'],
 [2,'four-principles','scene','murim','yeoul','백련의 첫 수업','형은 몸이 만드는 모양, 기는 힘의 성질, 운은 힘을 움직이는 방식, 의는 겨누는 뜻이다. 백련은 널리 알려진 월영참의 네 요소와 조합법을 가르쳤다. 직접 골라 구성하면 습득한다.','basic-elements'],
 [2,'basic-composition','learn','murim','yeoul','월영참을 구성하다','배운 요소를 골라 월영참을 완성한다. 목인 실습은 원할 때 시작하고 직접 종료한다.'],
 [3,'blade-field','combat','murim','southernRoad','첫 검을 쓰는 자리','소연과 남쪽 길을 정리한다. 검이 닿을 거리와 물러설 자리를 함께 살핀다.'],
 [3,'guard-shift','combat','reality','guardSite','처음으로 맡은 앞자리','지우는 짧은 구간의 경계를 맡겼다. 윤서는 배운 자세로 앞자리를 지킨다. 긴 운기를 그대로 유지하기는 어렵다.'],
 [3,'thunder-lesson','scene','murim','yeoul','힘을 모으고 내보내기','백련은 천뢰격의 요소를 가르쳤다. 섬광검·횡월검·축기결도 원할 때 익힐 수 있다. 소연과 보법을 살피면 측행보로 이어진다.','thunder-elements'],
 [4,'different-start','scene','murim','yeoul','남의 검이 끝나는 곳','검은 밖으로 뻗고 반격은 접촉한 자리에서 시작한다. 백련은 윤서의 몸에 맞는 시작점을 찾으라고 했다. 비경의 형·기, 실제 대응으로 얻는 운, 이곳 사람들의 부탁으로 얻는 의를 조합해 보자.'],
 [4,'measurement','scene','reality','city','민재의 계측','민재는 힘이 늦게 풀리는 구간을 영상에서 짚었다. 윤서는 출처를 말하지 않고 계측 가능한 문제를 함께 시험한다.'],
 [4,'first-creation','create','murim','yeoul','내 몸에 맞춘 무공','습득한 무공을 결합하여 자신의 창안을 만든다. 이름이나 계통은 플레이어가 고른 창안을 인정한다.'],
 [4,'creation-proof','proof','murim','yeoul','무림에서 확인한 동작','창안한 무공으로 실제 효과를 확인한다. 구성이나 장착만으로 실전 검증이 끝나지는 않는다.'],
 [4,'first-reproduction','reproduce','reality','city','다른 환경에서 다시','무림에서 검증한 창안을 현실에 적용하고 실제 효과를 낸다. 민재는 재현되는 변화만 기록한다.'],
 [5,'north-contract','scene','murim','yeoul','북쪽으로 가는 약속','소연은 북쪽 상단의 일을, 서하는 길 조사를 준비한다. 담희에게 숙박비를 정산하고 각자의 일정을 맞췄다.'],
 [5,'absence-cost','scene','reality','city','빠진 자리의 비용','지우에게 비울 근무 시간을 알리고 정순에게 수리를 맡긴다. 숨기는 일이 있다고 동료에게 위험까지 숨길 수는 없다.'],
 [5,'north-survey','combat','murim','northRoad','갈 수 있게 된 곳','서하의 조사 길을 확보한다. 기맥을 따라가자 한쪽 땅은 풍요롭고 다른 쪽은 메말라 있었다.'],
 [6,'array-discovery','scene','murim','northRoad','정도관의 정맥진','차도겸의 정맥진은 흐름을 모아 일부를 살리고 다른 곳의 몫을 빼앗는다. 서하는 길과 물의 변화를 따로 기록한다.'],
 [6,'local-experiment','scene','reality','city','현대의 별도 실험','민재가 균열 현장의 불규칙한 에너지를 계측한다. 두 곳의 문제를 비교하는 사람은 윤서뿐이다.'],
 [6,'mentor-secret','scene','murim','yeoul','백련에게만 털어놓다','윤서는 백련에게 왕래를 말했다. 백련은 처음 듣는 현상을 단정하지 않고 함께 확인하자고 했다. 다른 무림 사람과 현대 사람에게는 비밀이다.'],
 [6,'companion-refused','companion','murim','shrine','함께 건널 수 없는 길','백련과 함께 표식에 서자 호흡이 시작되지 않았다. 살아 있는 동행자는 건널 수 없다. 스승은 이쪽에 남는다.'],
 [7,'small-circulation','scene','murim','yeoul','작은 순환','백련은 몸 안에서 짧게 닫히는 흐름을 가르쳤다. 다른 세계에 데려갈 수 있는 것은 스승이 아니라 배운 원리다.'],
 [7,'paired-measurement','scene','reality','city','기록을 들고 돌아오다','민재와 계측 곡선을 확인했다. 직접 가져온 작은 장치와 기록으로 에너지 반응을 비교한다. 전화나 무전으로 세계를 연결하지 않는다.'],
 [7,'hypothesis-field','combat','reality','experimentSite','현장에서 확인한 가설','불규칙한 흐름 속에서도 짧은 동작을 유지하며 현장을 확보한다. 계측만으로 확인하지 못한 부분을 몸으로 검증한다.'],
 [8,'closed-road','scene','murim','yeoul','닫힌 길','서하가 정도관에 붙잡혔다. 소연과 백련은 각자의 위치에서 움직일 준비를 한다. 현대의 동료에게 지원을 요청할 수는 없다.'],
 [8,'dogyeom-limit','combat','murim','outerArray','차도겸의 벽','전방의 압박을 견디고 물러설 틈을 만든다. 정맥진이 유지되는 한 정면 승부만으로 해결할 수 없다.'],
 [8,'local-preparation','scene','murim','yeoul','이쪽 사람들의 준비','백련은 진의 흐름을, 소연은 우회로를 맡는다. 윤서는 서하를 구출하고 공급과 순환을 끊는 순서를 확인한다.'],
 [8,'reality-preparation','scene','reality','city','저쪽 사람들의 준비','지우와 민재는 현대 균열의 장비와 퇴로를 점검한다. 윤서는 돌아올 수 있는 시간을 계산한다. 서로의 세계를 알리는 공동 작전은 아니다.'],
 [9,'bypass-secured','combat','murim','bypass','우회로 확보','소연이 찾은 우회로의 위협을 제거한다. 완료한 준비는 패배해도 유지된다.'],
 [9,'supply-stopped','combat','murim','supply','공급을 끊다','공급 장치를 지키는 적을 제압하고 흐름을 끊는다.'],
 [9,'murim-rescue','combat','murim','prison','서하를 구하다','감금 장소의 경계를 제거해 서하의 퇴로를 확보한다. 서하는 이 세계의 동료들과 함께 빠져나간다.','signature'],
 [9,'murim-array-stopped','combat','murim','circulation','순환을 멈추다','마지막 순환 장치까지 차단한다. 흩어진 준비가 이제 하나의 빈틈을 만든다.'],
 [9,'murim-support','support','murim','arrayHeart','세 번의 틈','백련과 소연이 차도겸을 제압할 수 있도록 위협 세 번에 대응하며 12초를 버틴다. 혼자 적을 쓰러뜨리는 것이 목표가 아니다.'],
 [9,'injured-wait','scene','murim','shrine','부상과 귀환 준비','싸움의 상처는 남아 있다. 이동은 회복이 아니다. 붕대를 고쳐 묶고 돌아갈 준비를 한다.','ultimate'],
 [10,'return-injured','cross','reality','home','늦게 돌아온 사람','부상을 안고 돌아왔다. 지우는 상태를 확인하고 윤서의 역할을 엄호로 제한한다.'],
 [10,'role-assessment','scene','reality','city','할 수 있는 몫','민재의 장비가 작동할 시간을 벌어야 한다. 무리하게 앞을 독점하지 않고, 실제 위협에 대응하며 살아남는 것이 윤서의 몫이다.'],
 [10,'reality-support','support','reality','riftFinal','따라오지 못한 사람들의 기술','12초 동안 장비를 엄호하고 세 번의 위협에 대응한다. 마지막 공격은 지우와 현대의 전투조가 맡는다.'],
 [11,'reality-account','scene','reality','city','현실의 수첩','민재에게 계측 결과를, 지우에게 현장 보고를 남겼다. 윤서는 정식 전투 업무를 맡는다. 무림의 실재는 공개하지 않는다.'],
 [11,'murim-account','scene','murim','yeoul','무림의 수첩','서하의 길 기록과 담희의 장부를 정리한다. 소연은 자신의 다음 일로 향한다. 백련과는 윤서가 고른 창안을 다시 살핀다.'],
 [11,'two-notebooks','scene','murim','yeoul','두 권의 수첩','두 세계의 기록은 각각 남았다. 익힌 무공과 스스로 만든 동작은 윤서의 몸에 남는다. 다음 탐험을 준비하되, 돌아갈 시간도 함께 적는다.']
 ];
 const events=rows.map(([chapter,id,kind,world,area,title,text,reward],i)=>Object.freeze({chapter,id,kind,world,area,title,text,reward:reward||null,requires:i?[rows[i-1][1]]:[]}));
 return {chapters:Object.freeze(chapters),events:Object.freeze(events)};
});
