# Boundary Resonance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 무림 성취를 보관·투자 가능한 공명으로 전환하고 현실의 빌드 선택과 무림 선택 도전을 연결한다.

**Architecture:** 독립 공명 모델이 보상·투자·검증을 소유하고 기존 WorldGame/Passive/RealitySkills가 효과를 소비한다. 별도 도전 인스턴스는 본편 진행을 변경하지 않으며 기존 성장 메뉴 안의 공명 UI가 모델을 조작한다. v0.2 저장 슬롯과 명시적 이전으로 기존 기록을 보호한다.

**Tech Stack:** 기존 UMD JavaScript, Node >=20, node:test, Playwright/Chromium, CSS/SVG.

**Spec:** `docs/superpowers/specs/2026-10-06-boundary-resonance-redesign.md`

## Global Constraints

- `v0.2_proto_patch`의 기존 클라우드 체크아웃에서 Native로 실행한다. 추가 worktree/브랜치·푸시·배포 없음.
- 사용자가 ‘계획으로 넘어가고 바로 개발’을 명시했으므로 별도 계획 승인 질문 없이 계획 작성 후 실행한다.
- 무림→현실 단방향. 결정은 공격 +1/HP +6/MP +3, 각인은 현실 공통 8노드와 계열 9노드에 사용한다.
- 레벨당 HP +18/MP +5/공격 +3 유지. Q/R/F 이야기 권한과 무림 로컬 성장을 보존한다.
- 수령/소비/환불은 재접속과 재시도에 중복되지 않으며 기존 자동 숫자/복사 효과와 이중 적용하지 않는다.
- 지역×생존/연속/대응 도전 9개, 각 최초 완료 결정 1·각인 1. 목표는 선택/해제 가능하다.
- UI의 최종 효과와 실제 전투 계산을 공유한다. 360px·키보드·200% 확대 지원.

## Review Focus

- 손상된 저장의 금액·비용·완료 사건 위조 → 검증에서 거부하고 원본 보존 (1/3).
- 전투/다른 세계/대여 시험에서 성장 변경 → 거부하며 조회는 가능 (1/2/5).
- 사망·철수·도전 중 재접속 → 본편 증거와 보상을 오염시키지 않음 (3/4).
- 장착 변경·할인·기술 변형 합산 → 실제 비용/시간과 표시 일치 (2/5).
- 저장 공간 부족과 빠른 연속 클릭 → 변경 롤백, 중복 지급·허위 성공 없음 (3/5/6).

## Task 1: 공명 모델과 지급 원장

**Files:** create `boundary-resonance.js`, `tests/boundary-resonance.test.cjs`.
**Interfaces:** `initial()`, `sync(g)`, `validate(g)`, `grant(g,id)`, `balance(g)`, `bonus(g)`, `allocate(g,{attack,hp,mp})`, `upgrade(g,id)`, `select(g,family,branch)`, `reset(g,kind)`, `setGoal(g,goal)`, `describe(g)`; model lives at `worldState.resonance`.

- [x] RED: 최초 영구 계승 결정 8, 중복 지급 없음; 추천 배분 공격4/HP4의 +4/+24; 전체 비용과 잔액의 일치; 안전 거점 제한; 부정 수량/노드/사건 거부.
- [x] GREEN: 유한 사건 카탈로그, 독립 패시브 레벨과 계열 해금/선택, 상한 10/20/30과 공격 4/8/12 구현.
- [x] Verify: `node --test tests/boundary-resonance.test.cjs`.
- [x] Commit model and tests.

## Task 2: 성취·패시브·실제 기술 통합

**Files:** modify `world-achievements.js`, `world-growth.js`, `world-game.js`, `passive-growth.js`, `reality-skills.js`; add `tests/resonance-combat.test.cjs`; update intentionally changed existing assertions.
**Interfaces:** model `bonus(g)` → reality stats; `levels(g)` → reality passive; `effects(g,family)` → cost/time/cool; `sync(g)` after permanent changes. Existing old-save achievement validation remains supported.

- [x] RED: 신규 귀환의 자동 숫자와 패시브 복사 중복 없음; 무림 변화 없음; Q 방향 하나 활성; 파문 .9초·잔영 3.5초·봉인 5초/정박6초; 고정 할인/하한1; R 이야기 잠금 유지.
- [x] GREEN: 원장 지급을 영구 성취에 연결하고 모든 실제 행동과 표시가 같은 계산을 사용하게 한다.
- [x] Verify: new tests plus `tests/world-achievements.test.cjs`, `tests/v12-passive.test.cjs`, `tests/growth-arc.test.cjs`.
- [x] Commit integration.

## Task 3: 저장 이전과 슬롯 격리

**Files:** modify `save-v10.js`, `save-slots.js`, `app.js`, `world-game.js`; add `tests/resonance-save.test.cjs`.
**Interfaces:** `migrate(g)` reconstructs old applied bonus/copy; `validate(g)` checks imported state; `SaveSlots` exposes v0.2 current/test and readonly v10 import keys.

- [x] RED: 구저장 능력치/효과 동일, 이미 받은 성취 재지급 없음, 미정착 성취 1회 지급, 현실 패시브 이전/환불/재로드, 슬롯 원본 보존, ReturnProof 미지원 명시, 장부 위조 거부.
- [x] GREEN: 새 형식 식별과 구형 이전 분리, 허용 목록 등록, 원본 백업/불러오기 실패 처리.
- [x] Verify: save and model tests plus slot tests.
- [x] Commit save changes.

## Task 4: 공명 도전과 실제 행동 판정

**Files:** create `resonance-challenges.js`, `tests/resonance-challenges.test.cjs`; modify `world-game.js`, `world-growth.js`, `dungeon-entry.js`, `dungeon-ui.js`, `save-v10.js` and area loading integration as required.
**Interfaces:** `install(api)`, `list(g)`, `start(g,id)`, `onEnter(g)`, `onAction(g,...)`, `onEffect(g,...)`, `step(g,dt)`, `interact(g,id)`, `leave(g)`, `validate(g)`; completion calls model `grant` with a unique challenge id.

- [x] RED: 9개 조건과 잠금, 실제 유료 행동3/실제 대응2/제압후확보2초, 허공 입력 제외, 반복 수령 없음, 본편 진행·봉인 보존, 실패·재접속 안전, 오래된 비동기 입장 취소.
- [x] GREEN: 기존 지역의 독립 도전 인스턴스·기록·진행 안내·귀환을 연결한다.
- [x] Verify: challenge tests plus dungeon and story regression tests.
- [x] Commit challenges.

## Task 5: 성장 목표·보관함·능력치/스킬 UI

**Files:** create `resonance-ui.js`, `resonance.css`, small SVG icons under `assets/ui/resonance/`; modify `growth-screen.js`, `development-ui.js`, `app.js`, `index.html`, `server.cjs` as needed; add `tests/resonance.browser.cjs`.
**Interfaces:** `ResonanceUI.create({game,show,node,commit,close,refresh,prepare}).open(section)`; all mutating operations use application transaction commit.

- [x] RED browser: 성장→경계공명 발견, 세 목표, 보유·출처·미리보기, 실제 배분/구매/장착/환불, 잠금 구분, 무림 조회, 도전 입장, storage failure rollback.
- [x] GREEN: 청금색 공명 화면과 연결 트리, 작은 화면 한 열, 포커스/키보드, 최종 비용 표시, 실제 획득/귀환 알림과 결과 기록 구현.
- [x] Verify: desktop and 360px browser, 200% text, no horizontal overflow or console errors.
- [x] Commit UI.

## Task 6: 개발 시작점·전체 회귀·최종 검토

**Files:** modify `tests/dev-starts-ui.js`, `server.cjs`, `package.json`, `README.md`; create `docs/boundary-resonance-test-guide.md`; expand integration/browser tests.
**Interfaces:** developer presets: 공명 정착 전/첫 계승 후/도전 가능 (real validated journey saves, never fabricated evidence); existing new/five/six remain supported.

- [x] RED: 새 시작점 로드 후 원장과 이야기 증거 일치, 선택 UI에서 배분→도전→저장 복원까지 실제 조작.
- [x] GREEN: 시작점과 사용자 안내, 새 파일 check 스크립트 등록.
- [x] Verify: `npm test`, `npm run check`, `npm run check:revision`, `npm run check:world`, resonance browser plus relevant existing growth/navigation/save browser checks.
- [x] Fresh whole-branch reviewer; resolve important findings with regression evidence.
- [x] Commit completed implementation and report tested path, remaining limits, local branch state. No push/deploy without request.

## Completion evidence

2026-10-06: 720 tests passed; all required syntax checks and affected browser checks passed. Fresh review findings reproduced and fixed with regression coverage. [Implementation review](../../boundary-resonance-implementation-review.md) records decisions and practical validation limits.
