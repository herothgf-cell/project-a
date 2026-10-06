# Return Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 파문 계열의 체득 전후 선택 임무, 실제 대응 피드백, 직접 보고와 현장 선택을 기존 본편·저장을 보존하며 연결한다.

**Architecture:** `return-proof.js`가 전용 임무와 영구 결과를 소유하고 `world-game.js`의 명시적인 훅으로 기존 전투·보상·보고·저장과 연결한다. UI는 읽기 모델과 확정 함수만 사용한다. 실제 효과와 테스트용 관찰 로그를 분리한다.

**Tech Stack:** 기존 UMD JavaScript, Node >=20, node:test, Playwright 1.57.0 + Chromium. 신규 제품 의존성 없음.

**Spec:** [구현 설계](../specs/2026-10-06-return-proof-design.md), [사용자 제공 원문 보존본](../specs/2026-10-06-return-proof-source.md)

**Status:** 구현 전 검토안. 브랜치 `v0.1_proto_patch`만 생성했고 제품 코드는 아직 변경하지 않았다.

## Global Constraints

- 기준 main SHA: `6039e71f6e91ce580f8dc1c446e71479f0bca324`; 브랜치 `v0.1_proto_patch`에서 작업.
- 원문 P0~P5 구현, P6의 신규 계열 맞춤 콘텐츠·후속 장 확장은 사람 검증 이후.
- 기존 1~10장·기연·본편 진입권·세계별 성장·7장 준비 선택을 보존한다.
- 새 스킬 레벨·강화 재화·호감도·동행 AI·온라인 분석 서버를 추가하지 않는다.
- E1/E4 동일 `profileVersion`, 동일 적 역할/HP/피해/배치/예고, HP·MP 시작 비율 100%.
- 전용 강타 예고 1.2초, 후딜 0.8초; 대응 정지 초기 0.06초; 안전 영역 피해 배율 0.75.
- 기존 파문 흡수 0.7초·강화 4초·후속기 쿨 5초 및 잔영 강화 3초를 유지한다.
- 임무 XP·금화·숙련 0, 시도 종료 시 입장 전 자원·소모품 복원, 보급 ID `first-response` 재사용.
- save version 10, improvementVersion 2, `worldState.returnProof.version = 1`; 누락된 구버전 묶음만 초기화.
- 실제 키는 `Controls.key(action)`으로 표시한다. 문서의 Q/R/J/E를 고정 키로 구현하지 않는다.
- `g.trial`, `e.comparison`, `e.assessment`를 E1/E4/E6의 표식으로 재사용하지 않는다.
- 사람 테스트와 배포 결과를 자동 테스트 통과로 대신하지 않는다. push·배포는 수행하지 않는다.

## Review Focus

- 저장 직전 실제 효과만 획득하고 임무는 미완료인 상태: 효과는 보존하되 보고·완료를 생성하지 않는다 → Task 3.
- 이미 역할을 가진 저장, 보급 99개 또는 보급을 먼저 받은 저장: 중복 지급 없이 다른 선택 체험 가능 → Task 5.
- 입장 준비 중 창 닫기·가져오기·빠른 중복 클릭: 옛 게임 인스턴스를 이동시키지 않는다 → Task 6.
- 기존 심화/진화/발현/6~10장 훅과 전용 임무 대상이 만나는 경우: 의도한 E4 정착 외 영구 보상 없음 → Task 2.
- 재지정 키, 200% 글자, 저효과 설정, 로그 실패: 안내 접근성과 규칙 일치 유지 → Tasks 1, 6, 7.

## 파일 책임

| 파일 | 책임 |
| --- | --- |
| 신규 `return-proof.js` | 모드·프로필·전이·실제 증거·자원 스냅샷·일시 연습 안내 |
| 신규 `return-proof-ui.js`, `return-proof.css` | 모드 상세·결과·귀환 카드·보고·선택 및 짧은 강화 상태 표시 |
| 신규 `return-proof-telemetry.js` | opt-in 로컬 관찰 기록; 제품 상태 전이를 호출하지 않음 |
| `reality-skills.js` | 읽기 전용 기술/강화 준비 상태, 실제 효과와 단일 강화 소비 |
| `world-game.js`, `encounter-director.js` | 모델 통합, 시간·피격·처치·전용 프로필 훅 |
| `cultivation.js`, `legend.js` | 전용 모드에서 숙련·발현 획득 차단 |
| `fate.js`, `revision.js` | 기존 계승 안에서 선택 파문 연습 사건 전달 |
| `world-reports.js`, `personal-news.js` | 직접 보고, 같은 역할·보급 원장과 사실 기반 소식 |
| `save-v10.js` | 하위 상태 검증 및 임무 중 저장/재시작 |
| `dungeon-entry.js`, `dungeon-ui.js`, `objective-model.js` | 현실 통합 입구와 읽기 전용 목표/입장 보호 |
| `app.js`, `render.js`, `development-ui.js` | 실제 키·기술 상태·장착·모달 저장 트랜잭션·전장 표식 |
| `index.html`, `server.cjs`, `package.json` | 새 모듈 로드/서빙/검사 연결, 개발 전용 2장 시작점 |
| `tests/return-proof*.cjs`, 관련 기존 테스트 | 기능·저장·UI·재현 시작점 검증 |

`scripts/build-site.cjs`는 HTML의 런타임 자산을 수집하므로 새 JS/CSS가 자동 포함되는지 기존 빌드 테스트로 확인한다. 새 런타임 파일을 수동으로 중복 열거하지 않는다. `legacy/v011`은 보존한다.

---

### Task 1: 실제 대응과 후속 기회의 일치

**Files:** Modify `reality-skills.js`, `world-game.js`, `render.js`, `app.js`; Create `return-proof-ui.js`, `return-proof.css`; Test `tests/return-proof-feedback.test.cjs`.

**Interfaces:**
- `RealitySkills.readiness(g, action) -> {canUse, reason, charged, boostRemaining, hasTarget}`. 읽기 중 런타임/영구 상태 변경 없음.
- `RealitySkills.consumeBoost(g, consumer) -> boost|null`. 살아 있는 강화만 한 번 소비하며 기존 피해 배율을 반환.
- `ReturnProofUI.create({game,node,show,close,commit,refresh,skills})`의 `updateCombat()`은 위 읽기 모델과 `Controls.key()`만 참조.

- [ ] 쿨 2초·자원 부족·강화 4초가 동시에 존재하는 사례에서 `charged=true`, `canUse=false`이며 쿨이 그대로임을 검사한다. 읽기 전후 객체가 동일한지 비교한다.
- [ ] 수동 흡수→기본 타격→후속기, 3.99초/4초 경계, 허공·무적·유지 입력, 다중 적중의 표식·소비·정지 중복을 실패 테스트로 추가한다(F05~F10, CB02~05).
- [ ] `node --test tests/return-proof-feedback.test.cjs`가 신규 기능 미구현 때문에 실패하는 것을 확인한다.
- [ ] 읽기 모델과 소비를 구현하고 기존 `Reality.act`, `WorldGame.strike`를 연결한다. 전투 성공은 `onRealityEffect`를 사용하고 입력만으로 성공 이벤트를 만들지 않는다.
- [ ] 강화 있음/쿨 대기/자원 부족/대상 없음/대기 종료를 구분하고, 예고·발동·후딜에 형태/문구를 제공한다. 저효과에서는 새 정지/강조를 약화한다.
- [ ] 위 신규 테스트와 `tests/reality-skills.test.cjs`, `tests/combat-audio-events.test.cjs`, `tests/controls.test.cjs`를 통과시킨 후 관련 파일만 커밋한다.

### Task 2: E1/E4/E6 임무와 무보상 전투

**Files:** Create `return-proof.js`, `tests/return-proof.test.cjs`, `tests/return-proof-integration.test.cjs`, `tests/helpers/return-proof.cjs`; Modify `world-game.js`, `encounter-director.js`, `reality-skills.js`, `cultivation.js`, `legend.js`.

**Interfaces:**
- `ReturnProof.install(api)`는 rift 기반 `AREAS.returnProof`를 등록한다.
- `initial()`, `validate(g)`는 하위 버전 1 상태를 생성·검증한다. `describe(g)`는 초기 상태를 쓰지 않는 읽기 모델이다.
- `entry(g,{entrance})`, `requestEntry(g,mode,prepare,{entrance}) -> Promise<{ok,reason?}>`; 모드는 `baseline|proof|application`.
- `begin(g,mode)`, `step(g,elapsed)`, `interact(g,pointId)`, `finish(g,outcome)`이 유일한 임무 전이 경로다. outcome은 `complete|retreat|defeat`이며 완료는 모델의 확보 조건을 검사한다.
- `onEffect(g,{castId,family,kind,target,manual,action}) -> boolean`은 활성 E4 증거만 확정한다.
- `prepareEnemy(g,e)`, `mayStartAttack(g,e)`, `safeZone(g)`가 전용 적/선택만 처리한다.

- [ ] 2장 보고 이전 미노출, 정상 진입, 기본 공격 승리, 과성장 즉시 제압, E1/E4 프로필 동일, 2초 확보와 상호작용의 경계를 검사한다(F01~04, F14).
- [ ] XP/금화/숙련/발현/소유권/클리어/6~10장 상태를 시도 전후 비교한다. 효과 없는 입력·다른 모드/대상/실행·중복 cast는 검증 상태를 바꾸지 않아야 한다(F10, F21, F25~27).
- [ ] 신규 테스트의 실패를 확인한 후 공통 프로필, 적 역할 3종, 안전한 좌표/탈출로, 분리된 최초 예고, 1.2초/0.8초 전용 강타를 구현한다. 기존 지역 프로필을 변경하지 않는다.
- [ ] 전용 `returnProofTarget` 표식과 `proofRuntime`을 사용한다. 처치·숙련·발현을 각각 차단하고 E4의 실제 현실 정착만 명시적으로 허용한다.
- [ ] 모델 시간을 `Game.step` 전후 차이로 전달하고, 예고/후딜/확보/강화가 정지 중 같이 멈추는지 검사한다(F09).
- [ ] 벽 뒤 사격, 범위 밖 판정, 첫 예고 겹침, 기본 공격·회피만으로 클리어 가능한 경로를 재현한다(F02, F13; CB01,06~08).
- [ ] 위 신규 테스트와 기존 `encounter-director`, `world-combat`, `dungeon-entry`, `legend`, `v12-integration` 테스트를 통과시킨 후 커밋한다.

### Task 3: 저장 투영·재접속·구버전 보호

**Files:** Modify `return-proof.js`, `save-v10.js`, `world-game.js`; Create `tests/return-proof-save.test.cjs`.

**Interfaces:**
- `ReturnProof.withSaveSnapshot(g, serialize) -> string`은 원래 상태 투영을 `try/finally`로 감싼다.
- `ReturnProof.session(g) -> null|{version:1,mode,profileVersion,choice}`는 최상위 `returnProofSession`의 유일한 생성 경로다.
- `ReturnProof.restoreSession(g, descriptor)`는 본편 저장 검증 이후에만 임무 시작점으로 재개한다.
- 영구 묶음은 `baselineCompleted, proofCompleted, verifiedFamily, evidence, reported, roleChoice, applicationCompleted`와 version 1; evidence 없는 verified/report, 선행 없는 선택/완료는 오류다.

- [ ] 새 묶음 없는 기존 v10 저장·후기 역할 저장을 읽어 능력과 기존 원장이 동일하고 새 임무 기록만 초기 상태임을 검사한다.
- [ ] 실제 효과 직후, E4 완료 후, 보고 후, 선택 후 각각 저장/복원을 검사한다. E4 미완료 저장의 검증은 유지하되 보고는 거부한다(F18, F22).
- [ ] 중간 전투 저장은 원래 허브 스냅샷과 세션 설명만 담고 로드 시 새 적·새 확보 타이머로 시작해야 한다. HP·MP·포션 복원과 Set/Map 사용 가능성도 검사한다(F21, F23).
- [ ] callback 예외·손상 상태·허용되지 않은 family/choice/profileVersion·너무 큰 배열·선행 없는 reported를 검사한다. 저장 실패 후 실행 중 객체와 원본 문자열이 보존돼야 한다(F24, F28).
- [ ] 테스트 실패 확인 후 스냅샷 투영, 새 상태 whitelist, 원자적 validation, 재개 순서를 구현한다. 최상위 버전을 불필요하게 올리지 않는다.
- [ ] 신규 저장 테스트와 `save-v10`, `v12-runtime-safety`, `v12-advancement-integration`, `v12-cycle-integration`을 통과시킨 후 커밋한다.

### Task 4: 선택 체득 안내와 귀환·장착 연결

**Files:** Modify `fate.js`, `revision.js`, `return-proof.js`, `return-proof-ui.js`, `development-ui.js`, `app.js`; Test `tests/return-proof-practice.test.cjs`, `tests/return-proof-integration.test.cjs`.

**Interfaces:**
- `ReturnProof.practiceEvent(g,{kind,target,castId})`는 기존 파문 비경의 관찰/받아내기/후속 적중 사건을 일시 `proofPracticeRuntime`에만 기록한다.
- `ReturnProof.practiceView(g)`는 다음 한 행동·실패 횟수·선택 도움말을 읽는다.
- `ReturnProofUI.showReturn(rows)`는 기존 정착 결과를 받아 현실 장착 화면으로 연결한다. 닫기로 영구 결과를 만들지 않는다.

- [ ] 기존 증명·계승 경로를 추가 응용 없이 완료할 수 있고 이미 보유한 기능·재수련 조건이 동일함을 검사한다. E2 효과가 E4 검증으로 들어가지 않아야 한다.
- [ ] 관찰/실제 받아내기/축적 소비 후 유효 적중을 각각 재현하고 허공·무적을 성공 처리하지 않는다. 실패 2회 뒤 선택 도움말, 중도 종료, 이미 proven인 연습 재시도에 신규 보상이 없어야 한다.
- [ ] 귀환 카드의 출처·현실 기술명·장착 연결을 검사한다. 카드 표시/닫기 전후 성취/숙련/검증 상태가 동일해야 한다.
- [ ] 테스트 실패 확인 후 기존 Fate 이벤트 접점과 선택 안내를 구현한다. 윤서의 보고 전에 백련이 현실 사건을 아는 대사를 추가하지 않는다.
- [ ] 신규 테스트와 `fate`, `world-achievements`, `reality-skills`, `controls` 및 기존 계승 통합 테스트를 통과시킨 후 커밋한다.

### Task 5: 직접 보고·중복 없는 역할·선택 효과

**Files:** Modify `return-proof.js`, `world-game.js`, `world-reports.js`, `personal-news.js`, `return-proof-ui.js`; Create `tests/return-proof-reports.test.cjs`.

**Interfaces:**
- `ReturnProof.report(g) -> {ok,firstReport}`는 실제 서린 근접과 E4 완료/근거를 검사한다.
- `WorldReports.acceptReturnProof(g)`는 위 확정 후 기존 `role-first-response` 이력·관찰·보고·`first-response` 보급 경로를 재사용한다. 공유 지급 함수를 재사용하고 중복 원장을 만들지 않는다.
- `WorldGame.reportReturnProof()`가 두 경로를 연결하며 UI의 저장 트랜잭션에서만 확정된다.
- `ReturnProof.choiceView(g,id)`는 읽기만, `choose(g,id)`는 보고 후 비활성 시도에서 확정한다. `id = cut-support|secure-route`; 진행 중 변경은 거부한다.

- [ ] 미증명 승리→성과만 인정, 증명·완료 후 미보고→서린 사실/결정권 미갱신, 직접 보고→최초 역할 보급 2개를 검사한다(F15~17).
- [ ] 연타·재대화·기존 역할·이미 지급된 보급·포션 99개 경계를 검사한다. 공식 등급/7장 준비에는 변화가 없어야 한다(F18, F27).
- [ ] 미리보기 무변화, 확정 전 E6 거부, 선택 A의 사격 적 1개 비활성/안전 영역 없음, B의 사격 유지/영역 안 피해 25% 감소를 검사한다(F19~20).
- [ ] 두 선택의 실제 완료·실패 후 재시도·종료 후 다른 선택 재체험이 가능하고 반복 보급이 없는지 검사한다.
- [ ] 실패 테스트 확인 후 보고·협력 배치·사실 기반 소식과 도겸의 고정 후방 표시를 구현한다. 후속 장의 대화/상태를 대체하지 않는다.
- [ ] 신규 보고 테스트와 `world-reports`, `personal-news`, `world-full-journey`, `v12-cycle-integration`을 통과시킨 후 커밋한다.

### Task 6: 입구·UI·체크포인트·관찰 도구

**Files:** Modify `dungeon-entry.js`, `dungeon-ui.js`, `objective-model.js`, `app.js`, `return-proof-ui.js`, `return-proof.css`, `index.html`, `server.cjs`, `package.json`, `tests/dev-starts-ui.js`; Create `return-proof-telemetry.js`, `tests/return-proof-telemetry.test.cjs`, `tests/return-proof.browser.cjs`.

**Interfaces:**
- 입구의 별도 모드 행은 Task 2의 `entry/requestEntry`를 사용하고 준비 목적지는 `returnProof`를 전달한다. 기존 세션 티켓과 닫힘 검사를 유지한다.
- `ReturnProof.objective(g)`는 활성 임무에서만 우선하는 목표이며 비활성 본편 목표를 바꾸지 않는다.
- `ReturnProofTelemetry.create(metadata,{enabled:false,maxEvents:2000}) -> {record,export,clear}`. 초과 수를 기록하고 오래된 로그부터 버리며 게임 모델을 변경하지 않는다.
- 개발 시작점 이름 `two`: 2장 최종 보고 후·기연 미보유 상태. `SaveSlots.keys.test`만 쓰며 공개 빌드에서 제외한다.

- [ ] 입장 상세 조회, 준비 실패, 닫기, 중복 클릭, 준비 도중 다른 저장 가져오기를 브라우저에서 재현한다. 옛 인스턴스나 닫힌 창의 입장이 실행되지 않아야 한다(F11).
- [ ] 실제 DOM/키보드로 귀환 카드→장착→E4→직접 보고→미리보기→확정→E6 결과를 진행한다. 허공 입력/미증명 승리/기본 타격 소비/저장 실패 경로도 포함한다.
- [ ] 360×640, 844×390, 200% 확대, 기본 및 재지정 키, 터치·우클릭·키 유지 닫기를 검사한다. 강화/쿨과 닫기·확정 버튼을 읽고 누를 수 있어야 한다(F12).
- [ ] 로그 off/on/기록 실패의 같은 플레이 입력에서 영구 게임 결과가 같고 외부 fetch가 없음을 검사한다. 로그는 anonymized metadata와 사건만 보유한다(F28).
- [ ] 실패 확인 후 새 UI·입구·개발 시작점·telemetry를 연결한다. 사용자에게 새로운 기술을 추가 구매하게 하지 않는다.
- [ ] 신규 브라우저, `npm run test:browser:v12`, `tests/dev-starts.browser.cjs`, `tests/dialog-keyboard.browser.cjs`, `tests/navigation-followup.browser.cjs`, `tests/fantasy-ui.browser.cjs`를 통과시킨 후 커밋한다. 스크린샷은 저장소 밖 증거 경로에서 실행한다.

### Task 7: 인수·재현 자료·사람 테스트 인계

**Files:** Create `docs/return-proof-verification.md`, `docs/return-proof-playtest.md`; Update `README.md`, 이 계획의 체크리스트.

**Interfaces:** 앞 단계의 실제 결과를 F01~F28/CB01~08에 매핑한다. 사람 테스트 양식은 `미실행`으로 시작하며 자동 실행기로 H1~H5를 채우지 않는다.

- [ ] 같은 스탯·같은 프로필에서 피드백 A/B를 비교할 opt-in 개발 설정을 준비하고 게임 계산값이 동일함을 검사한다. 학습 순서는 참가자 양식에 별도 기록한다.
- [ ] 기본 공격·회피 완료, 실제 대응이 만든 위치/위험/후속 기회, 3계열×2심법×미투자 상태의 기능 호환을 검사한다. HP 증가만으로 통과한 결과를 기술 효과 증거로 쓰지 않는다(F02, F26).
- [ ] `npm run check`, `npm run check:revision`, `npm run check:world`, `npm test`, 현재 버전 및 신규 브라우저 검사를 실행한다. 프로토타입 빌드를 빈 외부 디렉터리에 생성해 새 JS/CSS와 동일 서브경로 로딩을 확인한다.
- [ ] 3장·4장 진행 우회 가능, 6장 잔류 파형·7장 준비·10장 결전 회귀 및 저장/보상/입력 차단 항목을 확인한다. 실패가 있으면 원인을 수정하고 영향을 받은 검사를 재실행한다.
- [ ] 실행 빌드·환경·재현 저장·관찰값·증거·판정과 남은 항목을 기록한다. 기준 670개 결과를 신규 기능 통과 수로 복사하지 않는다.
- [ ] PC/모바일 총 8명 목표, 비유도 질문, 개입 기준 2분, 실제 20~30분 관찰, A/B 순서 분산, 동의한 기록만 사용, 실제 새 게임 도달 측정의 후속 단계를 양식으로 작성한다. 모집/외부 연락을 수행하지 않는다.
- [ ] 한 차례 전체 변경 검토 후 수정·관련 검증을 마치고 커밋한다. 브랜치·검사·제한을 보고하며 push·배포는 하지 않는다.

## 요구사항 연결

| 범위 | 담당 작업 | 증거 유형 |
| --- | --- | --- |
| F01~04 | 2, 6 | 진입/프로필/기본 전투 모델 및 UI |
| F05~10, CB01~08 | 1, 2 | 실제 효과·강화·시계·타격과 예고 |
| F11~13 | 2, 6 | 벽/범위, 실제 입력·반응형 화면 |
| F14~20 | 2, 5, 6 | 미증명 승리·직접 보고·선택 효과 |
| F21~24 | 2, 3 | 자원/무보상·저장·손상/부분 상태 |
| F25~27 | 2, 4, 5, 7 | 본편/계열/심법/후속 장 회귀 |
| F28 | 3, 6 | 로그·영구 저장 실패 |
| H1~H5, 재미·체험 길이 | 7 이후 사람 테스트 | 미실행 양식, 실제 관찰 후 기록 |
| P6 | 사람 테스트 이후 | 현재 구현 범위 밖 |

## 실행 방식 권장

**Native**를 권장한다. 7개 작업이 동일 `world-game.js`의 전투·저장·보고 계약을 공유하므로 한 구현자가 순서대로 통합하는 편이 충돌과 문맥 반복을 줄인다. 계획 검토 후 같은 세션에서 실행하고 마지막에 독립적인 전체 변경 검토를 수행한다. 세부 구현에 따라 테스트 수는 늘어날 수 있지만 원문 단계 조건을 이유 없이 줄이지 않는다.
