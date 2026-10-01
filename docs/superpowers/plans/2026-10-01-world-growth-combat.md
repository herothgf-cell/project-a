# 쌍계 세계별 성장과 전투 개편 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 독립적인 현실·무림 성장, 성취 기반 현실 대응 기술, 명확한 성장 UI와 성장 전후가 드러나는 전투를 구현하고 main에서 v0.12.0으로 배포한다.

**Architecture:** 기존 v0.11.0은 보관판으로 먼저 고정한다. 새 게임 모델은 기존 장 진행을 재사용하되 세계별 성장·정착·보고·소식은 독립 모듈과 단일 버전 10 저장 경계에서 소유한다. 화면은 상태를 조회하고 명시적인 행동을 호출하며 알림 확인·대사 넘김으로 보상을 지급하지 않는다.

**Tech Stack:** 기존 JavaScript UMD/CommonJS, Canvas, HTML/CSS, Node test runner, Playwright, Python, GitHub Pages. 런타임 제품 의존성을 추가하지 않는다.

**Spec:** `docs/superpowers/specs/2026-10-01-world-growth-combat-design.md`. 사용자가 이 문서를 승인했다. 실행 방식은 앞서 선택한 직접 순차 구현과 마지막 한 번의 독립 코드 검토를 유지한다. 이 구현 계획은 문서 검토 후 실행한다.

## Global Constraints

- main에서 직접 작업하고 별도 브랜치나 worktree를 만들지 않는다.
- 사용자 소유의 미추적 아트 후보·Unity·참고 파일은 수정하거나 승격하지 않는다. 새로운 이미지 제작은 이번 구현에 자동 포함하지 않는다.
- 기존 1장부터 7장까지의 중심 사건과 인물을 유지한다. 정보 전달 순서와 새 기술의 사건 해결 조건은 함께 수정한다.
- 새 장, 장비 파밍, 추가 경지 단계, 정식 헌터 승급, 멀티플레이, 서버 최초 경쟁은 추가하지 않는다.
- 방향키 이동과 QWER ASDF 전투, G 상호작용, 키 변경, 키보드 대화 선택을 유지한다. 대화 버튼에 별도 단축키 배지를 다시 붙이지 않는다.
- 자동 이동은 추가하지 않는다. 이전에 고친 길 안내, UI 클릭 차단, 글씨 크기와 비차단 레벨 알림을 유지한다.
- 새 저장 버전은 10이며 기존 dualworld.save.v1 원문을 자동 수정·삭제하지 않는다. 테스트는 독립 브라우저 컨텍스트에서 실행한다.
- 최대 레벨 80, 기본 경험치 곡선 70 + 현재 레벨 × 45, 기본 체력 120·자원 80·공격력 16, 레벨 증가 18·5·3을 최초 기준으로 한다.
- 현장 의뢰는 개편판에서 제거한다. 세 계열 모두 반복 의뢰 없이 본편을 완료해야 한다.
- 배포 버전은 v0.12.0으로 묶는다. 중간 작업은 로컬 커밋하고 최종 전체 검사 후 main 최신 통합·푸시·Pages·공개 해시 확인을 수행한다.

## Review Focus

1. 구 저장이 손상됐거나 저장소 쓰기가 실패해도 원문을 보존해야 한다. 보관판과 테스트 시작점의 저장은 개편판과 섞이지 않는다. Task 1·8에서 실패 주입 브라우저 검사를 한다.
2. 레벨업과 귀환이 같은 행동에서 발생하거나 정산 직후 재접속해도 다른 세계 경험치와 보너스가 중복되거나 유실되지 않는다. Task 2·3에서 경계 값을 저장/복원한다.
3. 새 현실 기술이 실제 귀환·잔향·결계를 하지 않는데 구 판정이 성공하거나, 반대로 필수 인증이 불가능해지지 않는다. Task 4·5에서 세 계열의 4~7장 실제 효과를 검사한다.
4. 해금을 연속으로 얻거나 소식을 다른 메뉴에서 읽어도 레드닷이 정확한 항목에만 남고, 확인만으로 보고·장착·돌파가 실행되지 않는다. Task 6·7에서 키 유지와 재접속을 포함한다.
5. 적 수 증가로 길 막힘·동시 피격·불가능한 모바일 예고가 생기거나 보상으로 과성장하지 않는다. Task 8에서 전체 반경 길찾기·공격 슬롯·전투 지표·모바일 검수를 수행한다.

## 개발 순서와 파일 책임

Tasks 1~5는 저장과 전투 의미를 만드는 순차 작업이다. Task 6은 그 사건을 소식으로 기록하고 Task 7은 화면을 연결한다. Task 8은 모든 성장 경로를 실제 전투 수치로 검수한다. Task 9가 통합 검토와 배포다. 공유 모델이 많으므로 병렬 구현자는 두지 않는다.

- `legacy/v011/`: 고정된 구 런타임과 저장 복사본 부트스트랩. 원본 아트 파일은 해시가 고정된 공개 목록으로만 재사용한다.
- `save-slots.js`: 브라우저 저장 키·복사·백업·원문 내보내기 정책.
- `world-growth.js`: 두 세계 경험치·능력치·숙련·장착 기록과 전투용 현재 세계 조회.
- `world-achievements.js`: 영구 성취 ID, 귀환 정착, 보상 계산.
- `reality-skills.js`: 현실 대응 기술 및 유효 성공 사건.
- `world-reports.js`: 플레이어가 확인한 사실과 NPC에게 보고한 사실.
- `personal-news.js`: 중복 없는 소식과 공유 읽음 상태.
- `world-game.js`: 기존 Game을 확장한 최신 실행 모델과 서비스 연결. 기존 모듈을 불러오는 것만으로 구 모델 테스트가 최신 규칙으로 변하지 않게 한다.
- `save-v10.js`: 최신 모델 전체 저장/검증/복원. 버전 9 직렬화를 현재 저장으로 재사용하지 않는다.
- `character-ui.js`, `development-ui.js`, `news-ui.js`, `world-growth.css`: 상태, 성장 실행, 소식의 독립 화면.
- `encounter-director.js`: 적 무리·역할·공격 시작 슬롯. `render.js`는 판정과 같은 예고 정보를 그린다.
- `tests/world-fixtures.cjs`, `tests/world-growth.browser.cjs`: 새 규칙 시작점과 종단 흐름. 제품 클래스에 테스트 전용 완료 함수를 넣지 않는다.

## Task 1 보관판과 안전한 저장 슬롯

**Files:** Create `legacy/v011/manifest.json`, 고정 런타임 스냅샷, `legacy/v011/bootstrap.js`, `save-slots.js`, `tests/save-slots.test.cjs`, `tests/legacy-v011.browser.cjs`; modify `app.js`, `index.html`, `server.cjs`, `scripts/build-site.cjs`, `scripts/check-live.py`.

**Interfaces:** `SaveSlots.keys={current:'dualworld.save.v10',backup:'dualworld.backup.v10',legacyOriginal:'dualworld.save.v1',legacyCopy:'dualworld.legacy.v011',test:'dualworld.test.v10'}`. `SaveSlots.read(storage,key)` returns raw string or null without mutation. `preserveLegacy(storage)` copies only when source exists and destination does not. `write(storage,key,raw)` validates the permitted key and throws on storage errors. Export uses raw bytes, not parse/re-serialization.

- [ ] **RED:** 손상된 원문 문자열과 유효 v9 저장을 각각 둔다. 첫 보관판 실행 후 원문 불변, 두 번째 실행 후 복사본 불변, 새 저장 쓰기 후 두 구 키 불변, quota 예외 시 원문 불변을 검사한다. `node --test tests/save-slots.test.cjs` → 기능 부재로 FAIL.
- [ ] **Implement:** 커밋 `18bb83671dab8b84ee6c9f2e32b4847307c0c5c0`의 추적된 런타임만 고정한다. 최신 작업 디렉터리나 미추적 파일에서 보관판을 수집하지 않는다. 스냅샷 생성은 기계적 복사이며 manifest에 원본 커밋·파일별 해시를 남긴다. 보관판 bootstrap은 저장 키와 보관판 표시만 변경한다.
- [ ] **Implement:** 새 시작 화면에서 구 기록 발견·원문 다운로드·보관판 열기를 제공한다. 아직 최신 저장 모델이 없을 때 구 기록을 새 모델로 열지 않는다. 기존 새 저장만 재시작 확인과 최신 backup 대상으로 삼는다.
- [ ] **Implement:** 서버와 빌더는 legacy manifest의 정확한 경로만 허용한다. 보관판의 상대 스크립트/아트 요청이 실제로 200을 반환하도록 한다. 공유 아트는 고정 해시가 같을 때만 재사용하고 다르면 전용 자산으로 보관한다. 공개 asset-manifest에 보관판 런타임도 포함한다.
- [ ] **Verify:** 단위 검사 및 `node tests/legacy-v011.browser.cjs`로 구 저장 이어하기·복사본 재저장·새 키 비변경을 검사한다. 보관판 화면에서 v0.11.0과 보관판 문구가 보이고 새 메뉴가 없어야 한다. 전체 `npm test` → PASS.
- [ ] **Commit:** `feat: preserve v011 saves in isolated archive`.

## Task 2 세계별 성장과 최신 저장 모델

**Files:** Create `world-growth.js`, `world-game.js`, `save-v10.js`, `tests/world-growth.test.cjs`, `tests/save-v10.test.cjs`, `tests/world-fixtures.cjs`, `tests/world-growth.browser.cjs`; modify `game.js`, `cultivation.js`, `progression.js`, `later-story-data.js`, `app.js`, `index.html`, `server.cjs`의 최신 모델 연결.

**Interfaces:** `WorldGrowth.initial()` returns `{reality:{level:1,xp:0,mastery:{sword:0,ripple:0,echo:0,seal:0},equipped:null,mode:'flow'},murim:{...same}}`. `worldOf(g)` returns reality/murim. `grantExperience(g,{world,amount,eventId})` applies XP once for fixed quest IDs; enemy rewards use that encounter's rewarded guard rather than a permanent enemy ID. `stats(g,world)` returns `{hp,mp,attack,next}`. `WorldGame.Game` is the latest class; `SaveV10.load(raw)` returns a fully validated latest Game.

- [ ] **RED:** 무림 115XP로 무림만 Lv2, 현실 Lv1/XP0 유지. 현실 115XP도 역방향 동일. 무림 수련·경지는 현실 공격력에 직접 합산되지 않음. 퀘스트 보상 세계는 보고 장소와 무관함. 최대 레벨 XP 범위, 음수·NaN·잘못된 세계 거부. `node --test tests/world-growth.test.cjs tests/save-v10.test.cjs` → FAIL.
- [ ] **Implement:** 최신 Game만 두 성장 기록을 소유하게 한다. 이전 level/xp 소비자가 필요하면 현재 세계를 읽는 호환 접근자를 두되 두 영구 저장을 별도로 유지한다. 기존 XP를 직접 쓰는 보스/보고/후속 장 보상을 목록화하고 최신 모델에서는 모두 grantExperience를 거치게 한다. 레벨 알림에 세계를 포함한다.
- [ ] **Implement:** 처치 XP는 현재 세계, 본편 보상은 고정된 reward world로 정의한다. 두 세계 완료 보상인 6장 120XP는 각60, 7장180XP는 각90으로 배분하고 UI와 테스트에 동일한 정의를 사용한다. 기존 명시적 보상이 없는 사건에 임의 XP를 추가하지 않는다.
- [ ] **Implement:** 숙련과 모드는 세계별이다. 최신 전투에서 현실 타격이 기존 journey.mastery를 올리지 않도록 credit 경계를 분리한다. 무림 최초 경지 조건은 무림 숙련 합계8, 두 세계 실전, 발견 해석1개다. 돌파 기본 보상12/8/2는 무림에만 적용한다. 금화와 회복약은 공통으로 유지한다.
- [ ] **Implement:** 버전10은 성장 두 벌, 공통 본편 상태, 전승·보고·소식 상태를 소유한다. 구 검증기는 읽기 전용 검증 투영에만 재사용할 수 있고 로드 중 정산·알림·XP 이벤트를 발생시키지 않는다. 구 save를 Game.load에 주면 명확히 거부한다. 최대 길이·정수 범위·허용 ID·지역과 단계 관계를 검증한 뒤에만 인스턴스를 공개한다.
- [ ] **Verify:** 새 저장 round-trip과 중간 장 저장, 모순 값 거부, 실패 import 후 원문 유지, 귀환 때 이전 세계 장착 보존을 검사한다. `npm test` → PASS. 최신 UI 시작/이어하기가 SaveV10을 사용함을 브라우저로 확인한다.
- [ ] **Commit:** `feat: separate reality and murim progression`.

## Task 3 성취 정착과 귀환 결과

**Files:** Create `world-achievements.js`, `tests/world-achievements.test.cjs`; modify `world-game.js`, `save-v10.js`, `quest-data.js`, `app.js`의 transfer 처리.

**Interfaces:** `collect(g)` records eligible earned IDs without payment. `settle(g)` returns new `{id,source,before,after,unlocked}` rows and applies only unclaimed earned IDs on reality return. `bonuses(g)` derives permanent reality stats from settled IDs, not arbitrary saved bonus numbers. Families are ripple/echo/seal; only those count as 기연 계열.

- [ ] **RED:** 무림 레벨5/10 각HP5, 계열 숙련5/10 각공격1, 첫 돌파HP10/MP5, 최초 계승 기술available를 검사한다. 현실 레벨은 변하지 않는다. 여러 성취를 한 번에 얻고 귀환·저장·재접속·심법 교체를 반복해도 같은 보너스는 한 번. 미획득 ID를 claimed에 넣은 save는 거부. `node --test tests/world-achievements.test.cjs` → FAIL.
- [ ] **Implement:** ID를 `murim-level:5`, `murim-mastery:ripple:5`, `murim-realm:1`, `inherit:ripple`, `interpret:<known-id>`처럼 제한된 catalog로 정의한다. 레벨 구간은5/10, 숙련 구간5/10, 첫 돌파만 보상한다. 검사나 연습의 허공 사용으로 조건을 채우지 않는다.
- [ ] **Implement:** 최신 transfer의 총 공격력·무공 개수 창을 제거하고 settle 결과에 실제 차이를 기록한다. 무변화 왕복은 조용히 끝낸다. 이벤트 처리가 소식 모듈보다 먼저 완성되는 동안 결과는 모델에 보관하고 이후 Task6이 같은 ID로 소비한다.
- [ ] **Verify:** settled 순서를 바꿔도 최종 stats 동일, 계열 변경 후 보정 유지, 저장 실패 후 동일 세션 재귀환 중복 없음, 저장 이전 상태로 복원하면 그 상태의 보상만 존재함. `npm test` → PASS.
- [ ] **Commit:** `feat: settle permanent murim achievements on return`.

## Task 4 현실 대응 기술과 유효 성공 판정

**Files:** Create `reality-skills.js`, `tests/reality-skills.test.cjs`, `tests/reality-settlement.browser.cjs`; modify `world-game.js`, `dual-breath.js`, `render.js`, `art-runtime.js`, `save-v10.js`, `index.html`, `server.cjs`.

**Interfaces:** `RealitySkills.info(g,action)` returns current-world metadata. `act(g,action,held)` performs reality actions only. `onEffect(g,{castId,family,kind,target,manual})` emits once per effective cast/target and excludes trial/residual from XP or permanent settlement. `status[family]` is locked/available/settled. Rendering consumes effect shapes and cannot mark success.

초기 조정표의 배율은 현재 현실 stats.attack에 곱한다. 모든 오의는 기세 100을 소비하며 허공 사용으로 숙련이나 정착을 얻지 않는다. 아래는 승인한 대표 동작을 구현하기 위한 초기 수치다. 최종 조정은 Task 8에서 변경 전후와 이유를 기록한다.

| 계열과 동작 | 비용과 대기 | 초기 효과 |
| --- | --- | --- |
| 현실 기본 집중 타격 Q | 자원14, 3초 | 전방140 범위, 공격력1.8배 단일 관통 없는 검격 |
| 현실 기본 연속 타격 W | 자원20, 5초 | 전방160 범위, 0.15초 간격1.1배 두 타격, 동일 시전 ID |
| 충격 흡수 E | 자원12, 4초 | 0.7초 내 한 번의 유효 적 공격 방어, 다음 수동 타격1.8배를4초 보관 |
| 압축 반격 R | 자원16, 5초 | 전방170 범위2배, 보관 중인 충격을 소비하면3배, 다중 파문 없음 |
| 반격 돌파 F | 기세100, 1초 | 전방240 범위4배와 적 경직0.8초, 충격 보관 소비 |
| 긴급 가속 E | 자원12, 4초 | 보는 방향160 이동, 무적0.35초, 예고 회피 성공 뒤 다음 수동 타격1.6배를3초 보관 |
| 추격 타격 R | 자원16, 5초 | 전방170 범위2배, 가속 성공 보정 소비 시2.8배, 이전 위치 귀환 없음 |
| 돌파 기동 F | 기세100, 1초 | 전방240까지 충돌 검사하며 이동, 경로 주변90 범위3.5배, 적당1회 |
| 균열 억제 E | 자원14, 5초 | 전방220의 가까운 적1명, 공격 예고 취소와 재생 억제4초, 광역 필드 없음 |
| 약점 타격 R | 자원18, 5초 | 전방200의 적1명2배, 억제 중이면3배 |
| 집중 봉쇄 F | 기세100, 1초 | 전방280의 적1명4배, 재생 억제6초와 경직1초 |

- [ ] **RED:** 실제 공격 없는 충격 흡수, 안전한 곳에서 가속, 예고/재생이 없는 적에게 억제는 첫 정착을 만들지 않는다. 실제 적 공격 방어, 타격 예고 안에서 밖으로 벗어나 살아남은 회피, 적 예고 취소 또는 실제 재생 차단은 해당 기술 정착을 만든다. 환경파동과 연습은 보상 없음. 비용 부족·쿨다운·벽을 넘는 이동 거부. `node --test tests/reality-skills.test.cjs` → FAIL.
- [ ] **Implement:** 표의 기술을 실제로 분리한다. 무림에서는 기존 기술, 현실에서는 대응 기술만 실행한다. 설명만 바꾸고 원본 기술을 호출해 잔향 귀환·다중 파문·광역 결계가 남는 방식은 쓰지 않는다. 해석과 쌍계 호흡은 Task5의 효과 사건을 소비한다.
- [ ] **Implement:** 첫 계승 후 현실 기지에서 선택 가능한 비교 전투 진입을 제공한다. 기존 rift 지형과 실제 적2명을 재사용하는 별도 비교 구역을 두고 처치 XP·금화는 지급하지 않는다. 이 구역은 진짜 대응의 최초 정착만 허용하고 연습 보상 파밍을 막는다. 일반 본편의 같은 실제 성공으로도 정착 가능하게 해 선택 전투가 강제 문턱이 되지 않게 한다.
- [ ] **Implement:** 죽음·이탈은 임시 cast/강화만 초기화한다. available 기술과 이미 settled인 기술을 회수하지 않는다. 장착을 강제로 덮어쓰지 않고 최초 장착 선택을 안내한다. 기본 공격과 회피는 미계승 상태에도 동작한다.
- [ ] **Implement:** 기존 주인공 공격·회피·시전 아틀라스를 사용하고 현실용 선·원·잔상·단일 억제 표식을 Canvas로 구분한다. 실제 판정 범위와 예고를 같은 data에서 그린다. 첫 사용 전 필요한 기존 동작 선로딩을 검사한다.
- [ ] **Verify:** 세 계열 각각 available→실제성공→settled→save/load, 동일 cast 중복 방지, 세계 왕복 후 원래 무림 기술 복원. `node tests/reality-settlement.browser.cjs`와 `npm test` → PASS.
- [ ] **Commit:** `feat: manifest distinct reality response skills`.

## Task 5 NPC 보고와 기존 장의 효과 연결

**Files:** Create `world-reports.js`, `tests/world-reports.test.cjs`, `tests/world-chapters.test.cjs`; modify `world-game.js`, `sequel.js`, `chapter-five.js`, `chapter-six.js`, `chapter-seven.js`, `dual-breath.js`, `dialogue-data.js`, `objective-model.js`, `quest-data.js`, `save-v10.js`.

**Interfaces:** `WorldReports.state(g)` has observed/reported sets of allowed fact IDs. `observe(g,id)` records only when real model conditions hold. `report(g,id)` returns false unless observed; duplicate is false. `reality-skills.onEffect` is adapted into interpretation/dual-link events; original action names alone are never proof. Fact IDs: yeonhwa-stranded, yeonhwa-rescued, yeonhwa-returned, seven-pass-open, seven-dock-stable.

- [ ] **RED:** 구조 전 서린은 연화 이름·고립을 먼저 말하지 않는다. 구조 후 미보고면 구조 내용을 모르고, 윤서 보고 후에만 아는 대사. 가게 직접 확인 없이 재개업 문구 없음. 대사 건너뛰기와 held Enter로 report 자동/중복 실행 없음. `node --test tests/world-reports.test.cjs` → FAIL.
- [ ] **Implement:** 4장 도입은 현실 이상 신호, 무림에서 고립 발견, 귀환 후 윤서의 보고 순서다. 기존 stage 값만으로 모든 인물 지식을 판단하지 않는다. 최신 대사 ID/장면을 단일 source로 선택하고 revision의 제목 기반 교체가 최신 대사를 다시 덮지 않게 한다.
- [ ] **RED:** 실제 위치 귀환이 없는 현실 가속은 무림의 귀환 구조 판정을 대신하지 않는다. 5장 기감·적·해석 조건 없이 최신 스킬만 눌러도 measured가 되지 않는다. 실제 원리 재현 후 보스 처치와 보고까지 모든 계열이 진행 가능해야 한다. `node --test tests/world-chapters.test.cjs` → FAIL.
- [ ] **Implement:** 파문 해석은 현실의 충격 흡수 성공 또는 강화 반격 적중, 잔영 해석은 위험 회피 성공 후 추격 적중, 봉인 해석은 실제 억제 후 약점 타격으로 재현한다. 두 해석이 같은 대응을 공유해도 발견/장착된 해당 ID만 재현 처리한다. 잔류 파형은 5장 인증만 허용하고 XP·계승·정착 보상은 주지 않는다.
- [ ] **Implement:** 6장 연계 family를 sword와 현재 현실 계열의 실제 성공 사건으로 연결한다. 유수4초와 보조8초, 비용감소6/최소1, 집중준비1.4초와 억제6초를 유지한다. available 기술의 실전 성공도 연계로 인정하되 같은 성공을 중복 계산하지 않는다.
- [ ] **Implement:** 7장 pass/dock의 물리 효과는 기존대로 유지한다. 백련의 현실 상황 설명은 윤서의 전달 대화 이후로 제한한다. 이동 경로에 있는 NPC 대화에 보고를 통합하고 보고만을 위한 새로운 왕복을 추가하지 않는다. 보고하지 않아도 물리 변화 자체는 취소되지 않는다.
- [ ] **Verify:** 세 계열×두 운용에서 4장 구조, 5장 인증, 6장 안정, 7장 완료. 새 사건의 fixture 직행이 아니라 해당 효과·처치·보고를 실제 호출한다. 실패와 중간 저장에서 재개 가능. `npm test` → PASS.
- [ ] **Commit:** `feat: align reports and chapters with world-specific abilities`.

## Task 6 소식과 공유 읽음 상태

**Files:** Create `personal-news.js`, `tests/personal-news.test.cjs`; modify `world-game.js`, `save-v10.js`.

**Interfaces:** `publish(g,{id,kind,subject,at,payload})` is idempotent. `read(g,id)` marks one allowed item. `unread(g,section)` returns items for status/growth/skills. `list(g)` sorts newest first. Payload references trusted catalog IDs; import된 HTML·임의 링크를 렌더링하지 않는다. 모든 저장 필드는 검증 후 허용 필드만 복사한다.

- [ ] **RED:** 같은 해금 두 번에 소식1개, 목록 조회로 읽음 변화 없음, 상세 확인 후 메뉴·소식 둘 다 해제, reload 후 유지, 새 항목만 다시 점등. 확인만으로 장착·돌파·보상 상태 불변. `node --test tests/personal-news.test.cjs` → FAIL.
- [ ] **Implement:** 기술·해석·운용 최초해금, 경지 가능 첫 충족, 귀환정착 행을 고유 ID로 발행한다. 매 타격·처치·골드·레벨마다 기록을 쌓지 않는다. 전체 수는 성취 catalog 크기로 제한하고 동일 ID를 재발행하지 않는다.
- [ ] **Implement:** 돌파 가능 조건이 처음 참일 때 소식은 한 번 발생한다. 읽음 후에도 UI의 현재 가능 상태는 모델에서 따로 계산한다. 아직 모르는 계열의 숨은 이름과 조건은 발행하지 않는다.
- [ ] **Verify:** 이벤트 연속 도착과 두 메뉴 교차 읽기, 잘못된 id와 oversized payload 거부, 읽음 정보 없음/손상 save 거부. `npm test` → PASS.
- [ ] **Commit:** `feat: persist actionable personal news and read state`.

## Task 7 상태와 성장 화면 분리 및 입력 접근성

**Files:** Create `character-ui.js`, `development-ui.js`, `news-ui.js`, `world-growth.css`, `tests/world-ui.browser.cjs`; modify `growth-ui.js`, `journey-ui.js`, `martial-tree.js`, `app.js`, `index.html`, `server.cjs`.

**Interfaces:** `CharacterUI.open(world=current)`, `DevelopmentUI.open(section='realm')`, `NewsUI.open(id?)`; all receive `{game,show,node,refresh}`. Skills 화면은 최신 WorldGrowth/RealitySkills를 사용하고 기존 무림 트리는 유지한다. `openDestination({section,subject})` routes a news item to exact detail then marks that ID read.

- [ ] **RED:** 초상화 클릭/Enter로 현재 세계 스탯만 표시, 비교 탭이 전투 세계를 바꾸지 않음. 성장 첫 화면에 심법·돌파 버튼, 수첩에서 다시 메뉴를 찾아갈 필요 없음. 현재 계열 재수락 없음. `node tests/world-ui.browser.cjs` → FAIL.
- [ ] **Implement:** HUD 초상화를 button으로 감싸고 성장은 실행 카드, 무공은 장착, 행적/수첩은 읽기로 분리한다. 상세 계산식은 접고 펼칠 수 있게 한다. 현실에는 자원·회복/집중 운용, 무림에는 내력·심법으로 표시한다. 현재 세계에 적용되지 않는 경지는 비교 정보이며 현실에서는 무림 거점 안내로 연결한다.
- [ ] **Implement:** 현재 운용중 버튼 비활성, 보유 계열 하나면 불필요한 변경 진입 생략. 최초 계승과 변경을 구분하고 상세 입력은 Controls.key를 사용한다. 해석 장착과 현실 대응 장착을 다른 화면 상태로 저장한다.
- [ ] **Implement:** 소식은 작은 버튼으로 여는 목록형 패널이며 전투를 방해하는 상시 채팅창이 아니다. 항목 상세→해당 기능으로 이동, 읽음과 실행 분리. 상위 메뉴 레드닷은 같은 unread를 조회하고 접근성 이름에 수를 표시한다. 모든 메뉴에 Escape와 키보드 포커스 복귀를 적용한다.
- [ ] **Implement:** 최신 계약 버튼·판·메뉴·목표·보상 기능을 제거한다. Game.startContract/claimContract는 최신 모델에서 false. 숨김 CSS만으로 기능을 남기지 않는다. 기존 완료 대사의 의뢰 권유도 제거한다.
- [ ] **Implement:** 회복약 버튼에 보유량·회복량 설명과 불가 사유, HP40% 이하/약보유 첫 안내를 연결한다. 감소효과 설정은 정적 강조. 안내 완료 여부는 최신 저장에 보관하며 대화 중에는 안내를 지연한다. 자동 사용은 하지 않는다.
- [ ] **Verify:** 1280×900,390×844,360×640,844×390,본문32px, remapped G키, held Enter, 마우스 우클릭 전투 차단을 검사한다. 소식 상세 확인만으로 능력치 변화 없음. 실제 스크린샷 검수와 `npm test` → PASS.
- [ ] **Commit:** `feat: expose stats cultivation and personal news directly`.

## Task 8 전투 무리와 성장 비교 검수

**Files:** Create `encounter-director.js`, `tests/encounter-director.test.cjs`, `tests/world-combat.test.cjs`, `tests/world-balance.browser.cjs`, `docs/world-growth-balance-review.md`; modify `world-game.js`, `game.js`, `render.js`, `save-v10.js`의 역할·runtime reset 경계.

**Interfaces:** `EncounterDirector.populate(g)` creates unique IDs/groups/roles for latest world maps. `mayStartAttack(g,e)` limits concurrent melee windups per active group to2. `step(g,dt)` manages awake groups without moving simulation time. Roles are pressure/heavy/ranged/boss; art kind stays a supported existing kind. Role and telegraph data are shared with renderer.

- [ ] **RED:** forest/rift 총 7명, ruins/harbor/returnPass/returnDock/station 총 9명, stabilization/woundPass/woundDock/woundCore 총 6명, 지역당 보스 1명. 비교 구역 2명과 sanctum 시험은 별도 구성을 유지한다. 겹친 좌표·벽 안·막힌 경로가 없어야 한다. 비활성 무리는 돌진해 합류하지 않고 동시에 근접 예고 3개를 시작할 수 없다. `node --test tests/encounter-director.test.cjs` → FAIL.
- [ ] **Implement:** 기존 지형에 2~3무리를 배치하고 플레이어와 거리 350 이내 또는 같은 무리 피격으로 활성화한다. 쫓는 적은 원점에서 600 이상 이탈 시 복귀하되 한 번 준 보상과 처치를 취소하지 않는다. 보스에 잡몹 역할이 중복 적용되지 않게 한다. 각 적의 보상 지급 상태를 유지하고 지역 클리어 판정은 전체 생존 적을 사용한다.
- [ ] **Implement:** pressure는 기존 근접, heavy는 1초 이상 예고 후 강타, ranged는 1초 예고 후 사선 투사체로 구분한다. 초기 적의 1회 피해는 플레이어 기본 체력의 10~20%, 보스는 20~30% 범위로 시작한다. 피해와 체력은 플레이어 레벨에 따라 자동 증가시키지 않는다. 회피·흡수·억제가 적용되는 예고를 공통 판정으로 사용한다.
- [ ] **RED:** 결정론적 전투 입력으로 성장 전후 같은 적과 공격 기회를 비교한다. 대응 정착 후 처치 시간 또는 받은 피해 25% 개선, 다른 지표 악화 없음을 검사한다. 무대응 평타 반복과 예고 회피 입력의 차이가 있어야 한다. 경험치·보상 과지급 없는 고정 seed를 사용한다. `node --test tests/world-combat.test.cjs` → 최초 기준 미충족을 확인.
- [ ] **Implement:** 플레이어 기술표, 적 수·공격 피해·HP, 본편 XP를 함께 조정하고 전후 지표를 문서화한다. 결과를 맞추기 위해 비교 대상 적을 다르게 만들거나 성공 테스트에서만 무적·즉사 피해를 사용하지 않는다. 검사로 재미를 단정하지 않는다.
- [ ] **Verify:** UI를 통한 실제 전투 검수에서 거리·피격·약 소비·전투 시간·시각 예고를 기록한다. 자동 입력 검사와 사람이 수행한 플레이 검사를 구분하며 후자를 수행하지 못하면 그 한계를 명시한다. 독립 브라우저에서 실제 프레임과 로드 오류를 기록하고 저사양 기기 성능까지 보장하지 않는다. `node tests/world-balance.browser.cjs`, `npm test` → PASS.
- [ ] **Verify:** 테스트 전용 시작점 새 게임/5장 완료/6장 완료는 localhost의 명시적 개발 모드에서만 노출하며 별도 test 키에 저장한다. 공개 빌드에는 버튼·fixture 코드가 없어야 한다. 사용자의 실제 기록은 건드리지 않는다.
- [ ] **Commit:** `feat: balance grouped encounters around measurable growth`.

## Task 9 전체 회귀 검토와 배포

**Files:** Modify `README.md`, `package.json`, `world.js`, `index.html`, `.github/workflows/pages.yml`, `tests/site-build.test.cjs`, `tests/server.test.cjs`, `scripts/check-live.py`; create `docs/world-growth-release-review.md`.

**Interfaces:** Public version 0.12.0 / save 10. Latest and archived runtime manifests both ship and their bytes are covered by check-live. Source docs, tests, user art candidates, Unity files and development fixtures do not ship.

- [ ] **RED:** 새 runtime 모듈과 legacy 경로의 응답·빌드 포함, fixture와 문서 제외, 저장 분리 실패에 대한 검사를 추가한다. `node --test tests/site-build.test.cjs tests/server.test.cjs` → 누락되는 기능 FAIL. 이미 등록된 기능은 기존 회귀 검증임을 기록하고 억지로 깨뜨리지 않는다.
- [ ] **Implement:** package 문법 목록과 브라우저 CI를 갱신한다. 구 경제·구 메뉴에 종속된 검사는 보관판 대상으로 유지하고, 일반 입력·렌더링·선로딩·저장 불가 검사는 최신판에서도 수행한다. 테스트 기대값만 바꿔 이전 오류를 숨기지 않는다. 전체 단위 명령은 `npm test`, 문법은 `npm run check`와 `npm run check:revision`이다.
- [ ] **Verify:** 기존 Python 7종과 JS 9종의 적용 대상을 분류해 실행한다. 추가 browser 5종은 legacy-v011/world-growth/reality-settlement/world-ui/world-balance이며 world-growth는 1~7장 진행과 저장 단계를 검사한다. 해당 영역별 테스트와 전체 suite가 모두 통과한 상태를 남긴다. Windows 번들 환경에서는 동일 Node/Python 명령을 절대 경로로 실행하고 사용자 프로젝트에 의존성을 설치하지 않는다.
- [ ] **Review:** 직접 구현 후 읽기 전용 독립 검토자 한 명에게 명세·계획·실제 범위·테스트·결정 기록을 제공한다. 저장 파괴·전승 중복·보고 누락·세계 기술 판정·적 동시 공격을 집중 검토한다. 중요한 지적은 실패 테스트→수정→전체 통과로 한 차례 수정한다. 새 구현자를 병렬로 추가하지 않는다.
- [ ] **Art audit:** 충격 흡수·긴급 가속·균열 억제, 후속 기술·오의, 적 역할의 실제 화면을 검수한다. 필수·권장·재사용 가능과 임시 동작 재사용을 `docs/world-growth-release-review.md`에 기록한다. 판정이 안 보이면 코드 효과를 고치고, 고유 동작과 아이콘 제작은 별도 요청으로 남긴다.
- [ ] **Commit:** 최종 검증 후 승인된 파일만 `release: ship world-specific growth and combat (v0.12.0)`으로 커밋한다. main fetch 후 원격 변경이 있으면 통합하고 다시 검사한다. 사용자 미추적 파일은 건드리지 않는다.
- [ ] **Publish:** main 푸시→GitHub 검사→Pages 배포→공개 build-info 버전/SHA→latest와 legacy 런타임 해시 일치를 확인한다. 실패 상태를 완료라고 하지 않는다. 성공 시 커밋, 게임 주소, 검사 결과, 저장 시작 방법, 추가 아트 판단을 최종 보고한다.

## 자체 검토와 실행 인계

명세의 저장은 Tasks 1/2, 독립 성장은 2, 귀환 성과는 3, 현실 기술은 4, 이야기 연동은 5, 알림은 6, UI·의뢰 제거·약 안내는 7, 전투는 8, 아트 검수·배포는 9에 대응한다. Review Focus 다섯 항목에는 모두 회귀 검사가 배정돼 있다. 세 계열 완료·공유 자원·기존 스토리 유지·저장 원본 보존을 다른 단계가 덮어쓰지 않도록 인터페이스를 고정했다.

직접 순차 구현 후 최종 독립 검토 한 번이라는 기존 실행 방식을 유지한다. 이 계획 확인 후에는 작업 단위별 재승인 없이 구현과 검사를 이어가며, 파괴적 변경이나 승인 범위 밖의 새 요구가 생길 때만 멈춘다. 사용자 요청으로 main 푸시와 최종 배포는 이미 허용되어 있다.
