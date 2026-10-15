# 단독 왕래 스토리 교체 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 무공 기능을 유지한 새 게임에서 「쌍계 홀로 건너는 사람」 11장을 끝까지 플레이한다.

**Architecture:** 새 이야기의 사건·시간·왕래를 독립 모듈로 관리하고 기존 전투 엔진에 연결한다. 공개 진입점은 새 이야기 게임 클래스를 사용하며 기존 이야기의 자동 대사·보상·지역 이동은 새 플레이에서 실행하지 않는다. 저장은 새 버전을 사용하며 구버전 성장 이관은 하지 않는다.

**Tech Stack:** 기존 JavaScript UMD/CommonJS, Canvas, DOM, localStorage, Node test runner, Playwright. 외부 런타임 의존성 추가 없음.

**Spec:** [사용자 확정 교체안](../specs/2026-10-14-exclusive-worlds-story-replacement.md). 대사 원문은 [최신 원고](../../ssanggye-exclusive-worlds-story.md). 원고의 문장 수정은 범위 밖이다.

## Global Constraints

- main에서 작업. 추가 브랜치·worktree 금지. 관련 없는 로컬 파일 보존. 이번 요청에 공개 배포는 포함하지 않음.
- 새 게임 기준. 구버전 저장의 백업·성장 이관 UI를 만들지 않음. 새 저장의 이어하기·실패 복구는 지원.
- 기본 5개·전승 원형 4개·기존 창안 3개·신규 창안 2개 및 기존 R/F·심법 기능 유지.
- 구성 즉시 습득, 실습 선택, 수동 종료, 요소 필터, 습득/창안 연출 유지.
- 윤서만 왕래. 백련은 6장 이후만 비밀을 알고, 현대 NPC는 끝까지 무림을 모름.
- 왕래 대기 360 게임 분, 플레이 1초에 게임 시간 1/6분. 정지 호흡 10초. 명시적 휴식으로 남은 대기 시간 경과 가능.
- 이동 자체의 HP/MP 회복 금지. 휴식·치료·회복약은 명시적 행동으로 제공.
- 신규 플레이 스타일 숙련도 및 비껴돌림·이음 공격 기술 추가 제외. 창안 선택을 인정하는 이야기.
- 낮은 전투 난이도 유지. 개발용 순차 테스트·스토리 시작점은 로컬 전용.
- 전체 11장이 검증되기 전에 공개하지 않음.

## Review Focus

- 구버전 데이터가 localStorage에 남은 사용자: 새 스토리로 잘못 이어지거나 기존 성장 보상이 혼입되지 않아야 함. Task 2.
- 호흡 중 메뉴·피격·저장 실패: 이동이 두 번 일어나거나 시간만 차감되면 안 됨. Task 1·2.
- 이미 습득/창안한 뒤 스토리 확인 장면에 도착: 같은 무공 재습득이나 재료 재수집을 강요하지 않아야 함. Task 4.
- 임무 도중 패배·지역 재진입: 완료한 준비는 남고 아직 수행하지 않은 구조/엄호를 성공 처리하면 안 됨. Task 5.
- 기존 클래스의 자동 이벤트: 새 대화 직후 옛 공개 통로·감독관·공동 작전 대사가 노출되지 않아야 함. Task 2·6.

## 파일 경계

| 새 파일 | 책임 |
|---|---|
| exclusive-story-data.js | 11장 장면·인물·목표·사건 선행·일회 보상 데이터 |
| exclusive-story.js | 사건 상태, 선행 검사, 완료·보상 중복 방지 |
| exclusive-travel.js | 공통 게임 시간, 왕래 자격, 호흡 중단, 휴식 |
| exclusive-areas.js | 자취방·폐사당·여울장 및 탐사/최종전의 지역·표식 |
| exclusive-game.js | 기존 전투와 새 이야기를 연결하는 Game 클래스, 저장/복구 |
| exclusive-story-ui.js | 새 인트로·이야기 대화, 왕래/휴식, 세계별 기록 |

기존 `world-game.js`는 전투 엔진의 기반으로 사용한다. `exclusive-game.js`는 `{...WorldGame, Game:ExclusiveGame}`을 내보내며 브라우저에서 `ExclusiveGame` 전역으로 노출한다. `app.js`가 이 API를 선택하도록 수정한다. 기존 핵심 전투 테스트는 기존 클래스를 계속 검사하고 새 본편의 전체 검증은 새 클래스로 수행한다. 테스트 전용 분기를 제품에 넣지 않는다.

### Task 1: 사건 상태와 왕래 규칙

**Files:** Create `exclusive-story-data.js`, `exclusive-story.js`, `exclusive-travel.js`; Test `tests/exclusive-story.test.cjs`, `tests/exclusive-travel.test.cjs`.

**Interfaces:**
- Story.initial() → `{version:1,chapter:1,completed:[],rewards:[],records:{reality:[],murim:[]}}`.
- Story.next(state) → 현재 사건 정의; Story.complete(state,id,evidence) → `{changed,rewards,scene}`. evidence는 행동 어댑터가 생성하며 UI 버튼이 임의의 전투 성공을 만들지 않는다.
- Travel.initial() → `{version:1,minutes:0,arrivedAt:null}`; Travel.remaining(state) → 0~360; Travel.tick(state,seconds) → 상태 갱신; Travel.rest(state) → 남은 시간 경과.
- Travel.canCross(state,{area,companions}) → `{ok,reason}`; Travel.start(g), Travel.update(g,dt,input), Travel.cancel(g). 호흡 상태는 g.travelRuntime에만 둔다.

- [ ] 실패 테스트 작성: 도착 후 359분59초에는 이동 불가, 360분에는 가능; 휴식은 정확히 남은 시간 경과; 메뉴/종료 시간은 더하지 않음; 다른 위치/동반자 거부; 9.9초에서 움직이면 취소; 10초 완료 한 번만 이동.
- [ ] `node --test tests/exclusive-story.test.cjs tests/exclusive-travel.test.cjs`로 미구현 실패 확인.
- [ ] 위 API와 11장 사건의 선행 그래프 구현. 사건 ID는 장 이름 대신 `stone-accident`, `first-crossing`, `basic-composition`, `first-reproduction`, `mentor-secret`, `murim-rescue`, `murim-array-stopped`, `reality-support`, `two-notebooks` 같은 의미 단위로 정의. 해당 장 내부 장면도 명시적 ID로 정의하고 원고 순서를 유지.
- [ ] 중복 완료 changed=false 및 보상 재지급 없음, 선행 없는 완료 거부, 유효하지 않은 시간/ID 거부를 검증한 뒤 위 명령 통과 확인.
- [ ] 해당 모듈과 테스트만 커밋: `feat: add exclusive story state and travel rules`.

### Task 2: 새 게임·지역·저장과 기존 이야기 차단

**Files:** Create `exclusive-game.js`, `exclusive-areas.js`; Modify `world-game.js`, `save-v10.js`, `save-slots.js`, `app.js`, `index.html`, `server.cjs`; Test `tests/exclusive-game.test.cjs`, `tests/exclusive-save.test.cjs`.

**Interfaces:**
- ExclusiveGame.Game extends WorldGame.Game. new Game()는 새 1장; Game.load(raw)는 새 스토리 버전을 검사. save()에 worldState.exclusiveStory와 worldState.exclusiveTravel 포함.
- Areas.install(api)로 `home`, `shrine`, `yeoul` 및 새 임무 지역 등록. world 판정과 거점 판정은 명시적 지역 메타데이터를 사용.
- Game.storyAction(id), Game.storyObjective(), Game.restUntilCrossing(), Game.startCrossing()를 UI 경계로 제공. 입력에서 사건 완료 evidence를 받지 않음.
- SaveSlots의 공개·개발·순차 슬롯에 `.exclusive-v1` 접미사를 적용. 새 슬롯이 없고 이전 저장이 있으면 “새 이야기에서는 새 게임을 시작해 주세요.” 안내. 이전 값을 삭제하거나 복사하지 않음.

- [ ] 새 게임 무공 미획득, 구버전 raw 거부, 새 저장 로드 성공, 손상 저장 거부, 저장 실패 시 메모리 상태 복구 테스트를 먼저 작성·실패 확인: `node --test tests/exclusive-game.test.cjs tests/exclusive-save.test.cjs`.
- [ ] 지도상 자취방↔현실 기지, 폐사당↔여울장 현지 이동을 제공. 왕래는 home↔shrine만 허용. 기존 portal 및 다른 세계 임무 직행으로 우회 불가.
- [ ] 새 클래스에서 옛 스토리 enter/interact/objective/emit 후크를 격리. 필요한 전투 로직은 world-game의 명시적 분기로 분리하고 옛 phase를 새 장 번호로 일괄 채우지 않음. 기존 게임 클래스 동작은 유지.
- [ ] enter와 load에서 자동 회복 차단, 수치 최대치 clamp, 호흡 런타임 초기화 구현. 휴식은 남은 시간을 경과시키고 UI에 고지한 회복을 수행. 9장 부상 역할 제한은 휴식으로 지우지 않음.
- [ ] 새 Game으로 세계 이동을 반복해 옛 intro-rescue/intro-report·통로 보고·감독관 재회가 발생하지 않는 테스트 추가. 기존 `tests/martial-training.test.cjs`, `tests/martial-prototypes.test.cjs`와 새 테스트 통과 후 커밋.

### Task 3: 1~3장 인트로와 첫 습득

**Files:** Create `exclusive-story-ui.js`; Modify `exclusive-story-data.js`, `exclusive-game.js`, `app.js`, `intro-ui.js`, `objective-model.js`, `quest-data.js`, `index.html`, `server.cjs`; Test `tests/exclusive-intro.browser.cjs`, `tests/exclusive-early-story.test.cjs`.

**Interfaces:** StoryUI.create({game,show,node,commit,refresh}) → `{openScene,resume,openTravel,openRecords}`. Game.beginIntro/advanceIntro/finishIntro는 새 이야기 장면만 사용. Story.next가 목표 모델의 우선 입력.

- [ ] 실제 UI로 회수 사고→진료→자취방→폐사당→소연→여울장 도달하는 브라우저 실패 테스트 작성. 최초 이동은 정상 자격·호흡 경로 사용. 인트로 건너뛰기는 기초 사사 직전까지만 이동하고 무공/성취를 지급하지 않음.
- [ ] 원고 1~3장 대사·장면·표식 구현. 백련 구조와 서린 보고를 새 이야기에서 제거. 민재·지우·정순·소연·담희를 역할에 맞춰 배치. 미제작 초상화는 중립 표시.
- [ ] 월영참은 사사로 조합법/요소만 지급하고 구성은 기존 UI에서 수행. 첫 현실 임무와 대련의 실제 행동 확인 후 천뢰격 사사 접근 허용.
- [ ] `node --test tests/exclusive-early-story.test.cjs` 및 `node tests/exclusive-intro.browser.cjs` 통과. 스킵/재시작/모바일 360px/단계별 저장 후 재개를 확인하고 커밋.

### Task 4: 4~7장, 무공 선택과 세계별 증거

**Files:** Modify `exclusive-story-data.js`, `exclusive-story.js`, `exclusive-game.js`, `martial-training.js`, `martial-acquisition.js`, `martial-prototypes.js`, `martial-training-ui.js`, `world-reports.js`, `personal-news.js`, `passive-growth.js`; Test `tests/exclusive-martial-story.test.cjs`, `tests/exclusive-knowledge.test.cjs`.

**Interfaces:** Game.onStoryCombatEvidence({kind,family,world,targetId})는 실제 효과 후 호출. 허용 kind는 `creation-proof`, `reality-reproduction`, `objective-protection`. 기존 martial-link-proven 이벤트를 이 인터페이스에 연결. 새 story의 기초 사사/현지 의뢰가 기존 T/A/P의 획득 API를 호출.

- [ ] 서로 다른 두 경로(반류일선, 축산참)로 4장 첫 창안/현실 재현을 통과하는 실패 테스트 작성. 적용 버튼만 누름·빗맞힘은 미완료, 이미 증명한 창안은 재수집 없이 인정. `node --test tests/exclusive-martial-story.test.cjs` 실행.
- [ ] 여울장 교습 및 탐사 흔적을 기존 획득 API에 연결. 소유 요소와 조합법 구분, 기존 의뢰의 운/의 증거, 신규 원형 성취를 유지. 장소 하드코딩은 새 지역 메타데이터로 확장.
- [ ] 5~7장 일정·탐사·정맥진 조사·백련의 비밀 확인·현대 가설 재현 장면 구현. 장면별 화자와 지식 범위를 데이터에 명시하여 현대의 공적 기록에 무림 자료가 전달되지 않게 함.
- [ ] R은 현지 구조 경험 후 선택 후속 실습, F는 후반 위기 성취에서 개방. 심법의 기존 보상량은 유지하되 새 사건 ledger에 한 번만 기록. 옛 장 번호 보상과 이중 지급 금지.
- [ ] `node --test tests/exclusive-martial-story.test.cjs tests/exclusive-knowledge.test.cjs tests/martial*.test.cjs` 통과. 6장 이전 백련 장면 및 모든 현대 NPC 장면의 지식 누출 검토 후 커밋.

### Task 5: 8~11장 구조·현지 협동전·결말

**Files:** Modify `exclusive-story-data.js`, `exclusive-story.js`, `exclusive-areas.js`, `exclusive-game.js`; Test `tests/exclusive-finale.test.cjs`.

**Interfaces:** Game.storyEncounter() → `{kind,objective,completed,remaining}`. 임무 상태는 새 이야기 상태에 영구 준비 완료와 일시 전투 진행을 분리 저장. 패배 시 일시 전투만 재설정.

- [ ] 9장 장치 순서 위반·서하 미구출 상태에서는 승리 불가, 장치 완료 후 재진입 보존, 9장 종료 뒤 즉시 왕래 불가, 10장 작업 엄호 전에는 보스 처치만으로 완료 불가 테스트를 먼저 작성·실패 확인.
- [ ] 8장 구금·준비·휴식, 9장 우회→공급→순환 차단·구출·동료 엄호 구현. 백련·소연의 공격 참여는 실제 목표 성공과 연결된 전투 단계/장면으로 표시하고 동료가 세계를 넘어오지 않게 함.
- [ ] 10장 민재 작업 보호 구간 12초 구현: 플레이어 사망 시 실패, 유효한 위협 처리 3회 이상 및 작업 종료가 성공 조건. 회피는 실제 발동을 벗어남, 제어는 실제 행동 중단, 공격은 살아 있는 위협 피해만 인정. 반복 동일 cast는 한 번만 기록. 지원 성공 후 지우의 맥갑수 마무리 장면 제공.
- [ ] 11장 두 권의 기록과 독립 후일담, 정식 전투 임무 및 다음 탐사 안내 구현. 기존 선택 수련/현실 적용은 결말 후에도 접근 가능.
- [ ] `node --test tests/exclusive-finale.test.cjs` 통과. 최소 기존 대응 계열 경로와 신규 창안 경로로 완주, 실패 재도전·저장 재개 확인 후 커밋.

### Task 6: 로컬 테스트와 전체 공개 준비 검증

**Files:** Modify `tests/dev-training-route.js`, `tests/dev-training-route.browser.cjs`, `tests/dev-starts-ui.js`, `server.cjs`, `package.json`, `.github/workflows/pages.yml`, `docs/martial-training-play-guide.md`; Create `tests/exclusive-story.browser.cjs`, `tests/helpers/exclusive-journey.cjs`.

**Interfaces:** 로컬 무공 순차 테스트는 새 Game과 새 테스트 슬롯을 사용. `move`는 장소/스토리 시험 환경만 준비하고 무공·원형·현실 증명은 지급하지 않음. 새 이야기 전체 테스트 helper는 실제 상호작용을 수행하며 완료 플래그를 직접 쓰지 않음.

- [ ] 새 Game의 첫 시작→11장 결말 브라우저 테스트 작성. 각 장에서 저장 후 이어하기, 팝업 수동 종료, 각 세계 지도·임무·수첩·뉴스를 검증. 기존 36단계 순차 테스트도 새 클래스에서 전 단계 수행.
- [ ] 개발 진입점을 새 이야기 지역/시간 규칙에 맞춤. 테스트용 시간 건너뛰기는 로컬 모듈에만 두고 공개 게임의 startCrossing 검사를 약화하지 않음.
- [ ] 공개 builder 테스트에서 새 runtime/UI 파일 포함과 dev 파일 제외 확인. 공개 query dev=1로 개발 기능 활성화되지 않음을 브라우저로 확인.
- [ ] `node --test tests/*.test.cjs`, package.json의 check/check:world/check:revision, 새 이야기 브라우저·무공 브라우저·36단계 브라우저를 실행. 구형 UI 기대값만 갱신하고 기존 전투 회귀 실패를 삭제해 숨기지 않음.
- [ ] 독립 코드 검토 후 중요 결함 수정·관련 검증 재실행. 테스트 결과와 로컬 확인 경로를 안내하고 커밋. 공개 배포는 사용자 요청 전까지 실행하지 않음.

## 자체 검토 및 실행 제안

11장·시간/왕래·세계별 정보·무공·새 저장·로컬 격리는 각각 Task 1~6에 배정했다. 구버전 이관은 제외했다. 게임 시간과 전투 성공은 실제 상태 변화로 검사하고, 문구 검색만으로 전체 동작 검증을 대신하지 않는다.

실행은 **직접 구현 후 독립 최종 검토**를 추천한다. 기존 스토리 후크와 저장·무공 연결이 서로 밀접하므로 동일 구현자가 끝까지 연결하는 편이 인터페이스 전달 비용을 줄인다. 대안은 작업별 구현자·검토자를 나누는 방식이며, 단계마다 독립 검토가 강화되는 대신 작업 비용이 늘어난다.

현재 상태: 구현 계획 작성 및 자체 검토 완료. 실행 방식 선택과 계획 검토 후 제품 코드 변경 시작.
