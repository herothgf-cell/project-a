# 쌍계 두 번째 피드백과 6장 7장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 길 찾기와 대화 문제를 해결하고 재화 및 성장 구조를 정리한 다음, 승인된 6장과 7장에서 두 세계를 연결하는 주인공의 힘을 플레이로 증명한다.

**Architecture:** 기존 Game 모델과 확장 모듈을 유지한다. 목표 해석, 대화 표현, 재화 이관, 후속 장 진행을 별도 모듈로 분리하고 app.js는 화면과 입력 연결을 맡는다. 게임 진행과 보상은 모델에서만 바꾸며 대사 넘김과 길 안내는 진행을 바꾸지 않는다. 영구 상태와 전투 중 일시 상태를 분리한다.

**Tech Stack:** 기존 JavaScript UMD/CommonJS, Canvas, HTML/CSS, Node test runner, Playwright, Python browser regression, GitHub Pages. 제품 의존성을 추가하지 않는다.

**Spec:** `docs/superpowers/specs/2026-10-01-feedback-two-design.md`, `docs/superpowers/specs/2026-10-01-chapters-six-seven-story.md`. 사용자 메시지 ‘승인 개발 진행해줘’로 두 설계 승인. 이 구현 계획은 아직 검토 전이다.

## Global Constraints

- main에서 직접 작업한다. 추가 브랜치나 worktree를 만들지 않는다.
- 사용자 소유의 미추적 이미지 후보, Unity 파일, 참고 자료를 건드리거나 배포하지 않는다.
- 기존 캐릭터, 세계관, 계열, 완료 기록은 유지한다. 다른 저장에 실제로 하지 않은 사건을 만들어 넣지 않는다.
- 자동 이동은 추가하지 않는다. 길 안내는 최종 목적과 다음 경유지를 보여 주며, 이동은 플레이어가 직접 한다.
- 대화 버튼의 별도 단축키 표시는 다시 추가하지 않는다. 키보드 선택과 확인 기능은 유지한다.
- 신규 기연 획득 방식과 정식 헌터 승급은 별도 확정 없이는 추가하지 않는다.
- 6장과 7장 스토리 승인 조건은 충족했다. 신설 운용은 첫 경지와 독립적인 쌍계 호흡이며 미돌파 기록을 임의로 변경하지 않는다.
- 기준 배포 v0.10.3 커밋 `87ebdd3` 완료. 최종 릴리스는 v0.11.0 한 번으로 묶고 개발 중간 커밋은 로컬에만 보관한다. 모든 작업과 검증 완료 후 main 최신 반영, 푸시, Pages 및 공개 파일 검증까지 진행한다.
- 기존 프로토타입 아트를 재사용한다. 새 이미지 생성과 미승인 후보의 정식 승격은 포함하지 않는다.

## Review Focus

1. 다른 계열 해석만 발견하거나 계열이 없는 저장이 길 안내에 갇히지 않아야 한다. Task 1의 상태표 테스트로 고정한다.
2. 확인 키를 누른 채 대사 전환 또는 앱 재실행을 해도 보상과 정산이 재지급되지 않아야 한다. Task 3과 4에서 검증한다.
3. 과거 최대 골드와 강화 저장의 환급이 상한으로 사라지지 않아야 한다. Task 3에서 잔액 인출과 반복 이관을 검증한다.
4. 6장과 7장 도중 계열 또는 심법을 바꾸거나 패배해도 완료한 준비 상태가 사라지거나 진행이 막히지 않아야 한다. Task 6과 7에서 검증한다.
5. 좁은 화면, 사용자 변경 키, 확대된 글씨에서도 모달 버튼과 목표를 읽고 조작할 수 있어야 한다. Task 2와 8에서 검증한다.

## 개발 단위와 의존 관계

Task 1 목표 모델 → Task 2 길 안내 UI → Task 3 재화와 저장 → Task 4 대화와 보상 → Task 5 성장 및 기존 판정 → Task 6 쌍계 호흡과 6장 → Task 7 양방향 상태와 7장 → Task 8 전체 검증과 배포 순서다. 개별 항목을 완료할 때 전체 단위 테스트를 실행한다. 테스트의 기존 기대값은 승인된 제품 변경에 해당하는 경우에만 바꾸며, 실패를 숨기기 위해 테스트를 삭제하지 않는다.

명세를 수정해야 하는 충돌은 작업 기록에 이유, 결정, 사용자 영향과 함께 남긴다. 이야기를 바꾸거나 기존 진행을 파괴해야 하는 변경은 구현하지 않고 다시 확인한다.

## Task 1 단일 목표와 경로 모델

**Files:** Create `objective-model.js`, `tests/objective-model.test.cjs`; modify `chapter-five.js`, `presentation.js`, `revision.js`, `server.cjs`, `index.html`, `package.json`.

**Interfaces:** `ObjectiveModel.resolve(g, track='story')` → `{kind, chapter, purpose, condition, currentAction, target, route, status, rewards}`. `kind`는 story/explore/contract, `route`는 `{area, pointId, label}` 배열이며 첫 항목이 현재 경유지다. `rewards`는 실제 규칙에서 확인 가능한 예정 보상 목록이다. 현재 game.objective()는 기존 소비자 호환용으로 남기며 resolve에서 재귀 호출이 생기지 않게 story resolver와 exploration resolver를 분리한다.

- [ ] **RED:** phase 1 미발견의 archive 목표가 exit가 아님을 검사한다. 발견한 현재 계열 미장착은 status='equip', 다른 계열만 발견은 status='family-required', 장착 상태는 purpose가 서린 보고이며 archive/village/city 이동에 따라 target.id가 exit/portal/warden인 테스트를 작성한다. 조기 탐험 중 story 복귀, 계열 없음, 이미 장착한 phase 1, 관측 조사와 미재현 상태도 각각 고정한다.
- [ ] **Run:** `node --test tests/objective-model.test.cjs`. Expected: 모듈 또는 목표 상태 미구현으로 실패.
- [ ] **Implement:** 실제 출입구 연결에서 경유지를 생성하고 조사 상태는 Presentation.guide의 관찰 조건을 재사용한다. 완료한 해석을 재장착하지 않아도 서린 보고로 이어진다. contract 활성 시에만 의뢰 추적을 기본으로 전환하며 종료 시 story 복귀한다. 숨은 조건과 미발견 무공 이름은 공개하지 않는다.
- [ ] **Verify:** `node --test tests/*.test.cjs`. Expected: 기존 및 신규 전체 통과.
- [ ] **Commit:** `feat: unify story objectives and route guidance`.

## Task 2 클릭 차단과 읽을 수 있는 길 안내

**Files:** Create `objective-ui.js`, `feedback-two.css`, `tests/navigation.browser.cjs`; modify `app.js`, `render.js`, `realm-ui.js`, `index.html`, `server.cjs`, `package.json`.

**Interfaces:** `ObjectiveUI.create({game,node,show,refresh})` → `{open,update}`. HUD, minimap, marker, edgeMarker가 모두 Task 1의 target을 사용한다. 안내 버튼의 accessible name은 길 안내이며 클릭은 open만 호출한다.

- [ ] **RED:** 목표창 중앙 좌클릭과 우클릭으로 attack/dash cooldown 및 player 위치가 바뀌지 않음을 검사한다. 닫은 뒤 필드 좌클릭/우클릭은 기존 전투 동작을 실행해야 한다. 클릭으로 목적·경유지 창이 열리며 자동 이동하지 않는지 검사한다.
- [ ] **Run:** `node tests/navigation.browser.cjs`. Expected: 클릭 통과 또는 길 안내 미구현으로 실패.
- [ ] **Implement:** objective를 키보드 접근 가능한 버튼으로 변경하고 pointer-events 차단 원인을 제거한다. UI 위 전투 입력은 허용하지 않되 화면 공격 버튼 자체는 유지한다. 단순 직선 자동 경로처럼 오해할 표현 대신 출입구 순서와 현재 방향을 강조한다.
- [ ] **Implement:** 대화 17px/최소 16px, line-height 1.7, 목표 14px/보조 12px. 표식은 화면상 최소 18px 다이아, 외곽선, 바닥 링, 이름과 거리로 최상단 월드 레이어에서 렌더링한다. 움직임 감소 설정에서도 표식이 보인다.
- [ ] **Verify:** 위 브라우저 검사와 `node --test tests/*.test.cjs`. 1280x900, 390x844, 360x640, 844x390, 200% 확대 화면을 캡처하고 잘림과 겹침을 직접 검사한다. Expected: 모든 입력 검사 통과, 최종 목적과 표식 일치.
- [ ] **Commit:** `feat: readable navigation without combat click-through`.

## Task 3 재화 단순화와 버전 9 이관

**Files:** Create `economy.js`, `save-v9.js`, `tests/economy.test.cjs`, `tests/save-v9.test.cjs`; modify `game.js`, `cultivation.js`, `journey.js`, `progression.js`, `revision.js`, `app.js`, `growth-ui.js`, `journey-ui.js`, `contract-ui.js`, `index.html`, `server.cjs`, `package.json`.

**Interfaces:** `Economy.legacySettlement({upgrade,materials,lens})` → `{gold,legacyAttack}`; `Game.claimSettlement()` → boolean. `g.economy={legacyAttack,refundBalance}`를 영구 저장한다. `save-v9.js`를 최종 규칙 모듈 뒤에 설치해 Game.save/load의 단일 최신 진입점을 만든다. 저장은 version 9이며 optional laterStory 필드의 부재는 후속 장 미시작으로 해석한다. 새 필드 검증은 각 도메인이 제공하고 SaveV9가 호출한다.

- [ ] **RED:** upgrade=3/materials=2/lens=true의 정산이 gold=600, legacyAttack=12임을 검사한다. upgrade=10 환급은 3500. 최대 gold=999999에서는 금화 불변과 잔액 600, 소비 후 인출, 저장 재불러오기 후 추가 환급 0을 검사한다. versions 1~8은 기존 검증을 통과한 경우에만 이관하고 version 9 조작값·음수·잘못된 타입은 거부한다.
- [ ] **RED:** 일반 무림 적 16/보스110, 마정석을 주던 현실 적46/보스200, 의뢰 적16씩/보고76+경험치100, 잔류 파형·시험·중복 보상은 추가 골드 0을 검사한다. 의뢰 일부 처치 후 후퇴·죽음·load에도 이미 지급한 골드만 유지하며 ready 상태는 한 번만 수령한다.
- [ ] **Run:** `node --test tests/economy.test.cjs tests/save-v9.test.cjs`. Expected: 정산 미구현 및 구 보상값으로 실패.
- [ ] **Implement:** 새 게임 upgrade=0, buy('upgrade')와 tradeMaterial은 무효화한다. 구 마정석과 렌즈 값은 이전 저장 검증 경계에서만 읽고 최신 UI에서는 제거한다. 기감 범위 340. 공격력 계산은 기존 upgrade 항 대신 legacyAttack을 한 번만 더하며 summary 합계도 일치시킨다.
- [ ] **Implement:** 환급액은 현재 금화의 남은 한도만 지급하고 나머지는 정산 잔액에 보존한다. 실패한 import는 현재 저장을 덮어쓰지 않는다. 새로운 장의 필드와 경제 필드를 소유한 모듈이 다르더라도 최신 버전은 9 하나로 유지한다.
- [ ] **Verify:** `node --test tests/*.test.cjs` 및 기존 저장 브라우저 테스트. 변경된 보상 기대값은 새 규칙의 실제 획득 시점으로 갱신하고 검증을 약화하지 않는다. Expected: 새 게임과 기존 저장 모두 정상, 반복 환급 없음.
- [ ] **Commit:** `feat: gold economy and lossless legacy settlement`.

## Task 4 화자별 이야기와 구조화한 퀘스트 보상

**Files:** Create `dialogue-data.js`, `dialogue-ui.js`, `quest-data.js`, `tests/dialogue.test.cjs`, `tests/dialogue.browser.cjs`; modify `intro-ui.js`, `revision.js`, `chapter-five.js`, `sequel.js`, `app.js`, `contract-ui.js`, `objective-ui.js`, `index.html`, `server.cjs`, `package.json`, `tests/dialog-keyboard.browser.cjs`.

**Interfaces:** 장면은 `{speaker,portrait,text,kind}` 배열이며 kind는 speech/narration/result다. `DialogueUI.create(env).open({id,scenes,result,actions})`로 연다. `result`는 이미 지급한 보상과 다음 행동을 담고 예정 보상과 섞지 않는다. UI는 보상을 직접 지급하지 않는다. `QuestData.describe(g)`는 `{background,goals,reportTo,rewards}`를 반환한다.

- [ ] **RED:** 인트로 및 각 장 대표 대화에서 화면마다 단일 화자이고 본문에 다수 화자 접두사가 남지 않는지 검사한다. 계속하기, 전체 건너뛰기, held G/Enter, remapped Q가 진행 및 금화를 중복 변경하지 않아야 한다. 시스템 메뉴는 페이지 대화로 바뀌지 않아야 한다.
- [ ] **Run:** `node --test tests/dialogue.test.cjs`와 `node tests/dialogue.browser.cjs`. Expected: 기존 복수 화자 본문과 보상 구분 미구현으로 실패.
- [ ] **Implement:** 인트로와 1~5장 주요 진행 대사를 ID 기반 데이터로 편집한다. 임의 문자열 정규식만으로 모든 대화를 자동 분할하지 않는다. 반복 대사는 current objective 한두 문장으로 줄인다. action callback은 마지막 사용자 결정 때 한 번 호출하고 페이지 이동에는 게임 side effect가 없다.
- [ ] **Implement:** 퀘스트 수락 및 상세의 배경, 수행 목표, 보고 대상, 예정 보상 영역과 완료 결과 영역을 분리한다. 이미 획득한 보상은 모델 이벤트에서 받은 delta만 표시한다. 수락과 보상 수령은 명시적 입력을 요구하며 대화 스킵으로 실행하지 않는다. 모든 장면에 본문 최소 크기와 scrolling을 적용한다.
- [ ] **Verify:** `node --test tests/*.test.cjs`, `node tests/dialogue.browser.cjs`, `node tests/dialog-keyboard.browser.cjs`, `node tests/v09.browser.cjs`. Expected: 대화/수락/회상/저장 모두 통과.
- [ ] **Commit:** `feat: speaker dialogue and explicit quest rewards`.

## Task 5 성장 가시성과 기존 사건 정합성

**Files:** Create `growth-model.js`, `tests/growth-visibility.test.cjs`, `tests/rescue-interpretation.test.cjs`; modify `growth-ui.js`, `journey-ui.js`, `martial-tree.js`, `app.js`, `sequel.js`, `chapter-five.js`, `cultivation.js`, `feedback-two.css`, `objective-model.js`, `index.html`, `server.cjs`, `package.json`.

**Interfaces:** `GrowthModel.describe(g)` → `{breath,realm,resource,mastery,requirements,readiness}`. readiness는 focus-ready/flow-recovery/none이며 전투 상태에서 계산한다. 기존 사용 자원은 내력, 내공은 별도 소비 자원이 아닌 설명이다.

- [ ] **RED:** 유수 사용 후 1.2초 경계, 집중 호흡 1.4초 경계의 실제 계산과 화면 상태가 일치해야 한다. 돌파 조건 합계8/두 세계/해석1의 충족과 미충족을 각각 설명해야 한다. 최초 및 legacy 상태에 신설 이야기 완료를 만들지 않아야 한다.
- [ ] **RED:** 먹향 R 사용 성공이지만 위치 변화 없는 경우 연화 귀환 구조 미완료. 실제 기본 귀환보 이동과 거리 및 예고 조건 충족은 완료. 과거 완료 구조는 장착 변경이나 load 후 취소되지 않는다. 관측 버튼 누름만으로 measured=true가 되지 않는 것도 유지한다.
- [ ] **Run:** `node --test tests/growth-visibility.test.cjs tests/rescue-interpretation.test.cjs`. Expected: 설명 모델 미구현 및 잘못된 귀환 판정으로 실패.
- [ ] **Implement:** HUD의 현재 심법·경지를 성장 진입 버튼으로 표시하고 UI 전투 차단을 적용한다. 수련/숙련/해석/심법/경지의 현재 효과, 행동 조건, 다음 효과를 구분한다. 상태 변경 때만 비차단 안내하며 프레임마다 토스트를 만들지 않는다.
- [ ] **Implement:** actual displacement와 실제 귀환 동작을 구조 판정에 사용한다. 잘못된 운용이면 운용 변경 또는 우회로를 안내한다. 백련 계열 대사, 연화 재대화, 관측 남은 조건을 명세대로 정리한다.
- [ ] **Verify:** `node --test tests/*.test.cjs` 및 `node tests/dialogue.browser.cjs`. Expected: 실제 성장 계산과 표시 및 구조 의미 일치.
- [ ] **Commit:** `feat: visible cultivation and consistent story conditions`.

## Task 6 쌍계 호흡과 6장

**Files:** Create `later-story-data.js`, `dual-breath.js`, `chapter-six.js`, `tests/dual-breath.test.cjs`, `tests/chapter-six.test.cjs`; modify `save-v9.js`, `objective-model.js`, `dialogue-data.js`, `quest-data.js`, `growth-model.js`, `growth-ui.js`, `render.js`, `index.html`, `server.cjs`, `package.json`.

**Interfaces:** `g.laterStory={six:0,seven:0,dualBreath:false,passOpened:false,dockStabilized:false,coreOpened:false,completed:false}`. six 단계는 0 미시작 → 1 현실 조사 → 2 백련 상담 → 3 운용 습득 → 4 현장 안정 → 5 보고 완료다. `LaterStory.validate(raw,g)`는 단계와 영구 플래그의 관계를 검사한다. `DualBreath.status(g)`는 일시적인 연계 가능 상태를 반환한다.

- [ ] **RED:** 5장 보고 전에 6장을 시작할 수 없고, 완료 후 서린에게 시작하는지 검사한다. 첫 경지 미돌파와 돌파 완료 모두에서 학습할 수 있고 기존 realm 값은 변하지 않는다. 학습 전 조사에서는 적 처치만으로 안정화가 완료되지 않으며 기존 기술도 약화되지 않는다. 모든 단계의 save/load를 검증한다.
- [ ] **RED:** 유수는 서로 다른 계열의 유효 운용이 4초 이내에 이어지면 다음 유료 무공 1회의 내력 비용을 6 낮추되 최소 비용은 1이다. 같은 시전의 다단 타격은 한 번으로 센다. 집중은 1.4초 호흡 후 수동 기본 타격으로 4초의 틈을 만들고, 그 안의 유효 기연 운용은 재생을 6초 정지시킨다. 허공 공격, 누른 채 유지, 시험, 잔류 파형, 심법 재장착으로 자원과 장 진행을 얻지 못한다. 이 수치는 첫 전투 시제품 기준이며 변경하면 테스트와 조정 근거를 함께 갱신한다.
- [ ] **Run:** `node --test tests/dual-breath.test.cjs tests/chapter-six.test.cjs`. Expected: 미구현 동작으로 실패.
- [ ] **Implement:** 기존 station 지형을 재사용한 독립 안정화 지역을 추가하며 5장의 진행 상태나 적을 공유하지 않는다. 첫 조사 후 귀환 가능, 백련에게 운용 습득, 현실 재도전으로 이어진다. 재도전은 적 HP 증가가 아니라 재생 대응이 달라져야 한다. 재생 중에도 적을 완전 무적으로 만들지 않으며 현상 안정 조건과 적 처치를 구분한다.
- [ ] **Implement:** 파문은 실제 받아내기, 잔영은 실제 잔향 공격 적중, 봉인은 실제 예고 취소도 유효 기연 운용으로 인정한다. 공격 시전 ID 및 방어 반응 ID로 중복을 막는다. 피해량이 없는 계열 운용 때문에 특정 계열이 진행에서 배제되지 않아야 한다.
- [ ] **Implement:** 새로운 지역 저장은 SaveV9 경계에서 검증된 거점의 구 저장으로 기본 정보를 검증한 다음, laterStory 단계와 지역 관계를 별도로 검사하고 안전한 지역 진입점으로 복원한다. 알 수 없는 지역 또는 단계와 모순인 지역은 거부한다. 보고 보상과 행적은 사건 ID별로 한 번만 기록한다.
- [ ] **Verify:** `node --test tests/*.test.cjs`. 세 계열과 두 심법, 기존 강화 없음, 첫 경지 유무를 조합한 전투 시제품을 검수한다. 같은 적을 상대로 습득 전후 차이를 기록한다. Expected: 모든 조합이 진행 가능하며 강제 패배가 없음.
- [ ] **Commit:** `feat: chapter six and dual-world breathing`.

## Task 7 두 세계의 상호 변화와 7장

**Files:** Create `chapter-seven.js`, `tests/chapter-seven.test.cjs`, `tests/later-story.browser.cjs`; modify `later-story-data.js`, `save-v9.js`, `objective-model.js`, `dialogue-data.js`, `quest-data.js`, `render.js`, `index.html`, `server.cjs`, `package.json`.

**Interfaces:** Task 6의 laterStory를 사용한다. seven은 0 미시작, 1 무림 준비, 2 현실 안정, 3 무림 중심부, 4 최종 보고, 5 완료다. passOpened/dockStabilized/coreOpened는 완료 후 되돌리지 않으며 completed는 최종 보고 후에만 true다. 각 상태의 선행 조건을 검증한다.

- [ ] **RED:** six=5 이전 시작 불가. 무림 준비 후에만 현실 방어 패턴 감소와 안전 영역 증가. 현실 안정 후에만 무림 중심부 개방. 모든 조건과 최종 위협 처치 후에만 보고 가능. 패배, 불러오기, 왕복, 계열 변경에도 완료 플래그를 보존하며 보상은 중복 지급하지 않는다.
- [ ] **Run:** `node --test tests/chapter-seven.test.cjs`. Expected: 단계 및 상호 효과 미구현으로 실패.
- [ ] **Implement:** returnPass/returnDock의 배경과 인물 자산을 재사용한 독립 지역을 추가한다. 4장을 덮어쓰지 않는다. 최종 목적은 유지하고 경유지만 바꾸며, 각 방향의 의미 있는 전환은 최대 두 번이다. 보고만을 위한 추가 왕복, 세계 사이 무전, 양쪽 동시 조작 타이머를 추가하지 않는다.
- [ ] **Implement:** 실제 공격 예고, 통행 장애물, 안전 영역에 세계 상태 변화를 반영한다. 마지막 위협은 Task 6의 운용을 이용하되 특정 계열이 필수가 되지 않는다. 무료 반응 시간 보조 설정은 기본 4초의 연계 허용 시간을 8초로 늘리고 피해와 보상은 동일하게 유지한다.
- [ ] **Verify:** `node --test tests/*.test.cjs`, `node tests/later-story.browser.cjs`. 브라우저 fixture는 5장까지의 선행 진행 준비에만 사용한다. 새 장의 진행, 실제 효과, 처치와 보고는 실제 모델과 상호작용으로 검증한다. Expected: 완료와 재불러오기, 세계 변화, 화자별 대사 및 보상 구분 확인.
- [ ] **Commit:** `feat: chapter seven and reciprocal world consequences`.

## Task 8 전체 회귀 검사와 공개 배포

**Files:** Modify `README.md`, `package.json`, `world.js`, `index.html`, `.github/workflows/pages.yml`; 승인된 제품 변경에 해당하는 기존 브라우저 기대값을 갱신한다. Tasks 2,4,7의 브라우저 검사를 CI에 추가한다. 현재 조작과 성장 설명은 `docs/feedback-two-play-guide.md`에 정리한다.

**Interfaces:** 공개 버전 0.11.0, 저장 버전 9. 공개 커밋 SHA와 build-info 및 런타임 파일 해시가 같아야 한다. 새 런타임 파일은 index.html과 서버 허용 목록에 등록해 기존 빌더에 포함시킨다.

- [ ] **RED:** 새 런타임 파일의 서버 응답 및 빌드 포함, 문서 배포 제외, 6장과 7장 중간 저장의 버전 9 검증 테스트를 추가한다. 패키징을 고치기 전 누락 자산 실패를 확인한다.
- [ ] **Implement:** 스크립트, 문법 검사와 CI 브라우저 검사 목록을 갱신한다. 기능 구현 완료 뒤 버전을 올리며 과거 릴리스 기록은 보존한다. 현재 사용 설명에서는 제거된 요소를 삭제한다. 관측한 밸런스 변경과 근거를 남긴다.
- [ ] **Verify:** `npm run check`, `npm run check:revision`, `npm test`, 기존 JS 브라우저 검사 네 개와 새 검사 세 개. Python 브라우저 검사 일곱 개를 pages.yml과 동일한 방식으로 독립 서버에서 실행한다. Windows에서는 번들 Node/Python 절대 경로와 Chrome을 쓰며 사용자 프로젝트에 개발 의존성을 설치하지 않는다.
- [ ] **Visual QA:** 데스크톱, 390x844, 360x640, 844x390, 글자 확대 화면을 캡처하고 최종 이미지를 직접 연다. 화자, 결과창, 경로 문구, 새 지역 표식, 터치 버튼 가림을 확인한다. 증거 이미지는 제품 자산이 아니라 검수 자료로 보관한다.
- [ ] **Review:** executing-plans와 requesting-code-review 절차에 따라 읽기 전용 독립 검토자 한 명에게 승인 명세, 이 계획, base87ebdd3..HEAD, 결정 기록을 전달한다. 중요한 지적은 실패 테스트부터 재현하고 수정한 다음 전체 검사를 다시 실행한다.
- [ ] **Commit:** 명시한 변경 파일만 `release: ship feedback improvements and chapters six-seven (v0.11.0)`으로 커밋한다.
- [ ] **Publish:** `git fetch origin main` 후 새 원격 커밋이 있으면 강제 푸시 없이 통합하고 변경된 최종 상태에서 검증한다. 모든 검사를 통과한 뒤 main을 푸시한다. Pages 빌드와 배포 및 check-live 전체 해시 검증을 기다리고 공개 버전과 SHA를 확인한다. 실패하면 원인을 보고하며 완료라고 하지 않는다.

## 자체 검토와 실행 방식

일반 개선 A/B는 Tasks 1/2, C는 4, D는 3, E/F는 5, 승인된 이야기는 6/7, 배포와 전체 저장 검증은 8에 대응한다. Review Focus의 다섯 위험에 각각 테스트를 배정했다. 신규 기연 획득 방식과 정식 헌터 승급은 승인된 제외 범위를 유지한다.

권장 실행 방식은 Native다. 이 작업의 main에서 직접 순서대로 구현하고 마지막에 독립 코드 검토를 한 번 수행한다. 기존 Game 확장과 저장 호환을 공유하므로 여러 구현자가 동시에 바꾸는 방식은 피한다. 사용자가 이 구현 계획을 확인하면 executing-plans의 작업 기록과 TDD에 따라 Task 1부터 8까지 진행한다.
