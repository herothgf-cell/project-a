# 무림 장면 연결·기술 편성 구현 계획

> **For agentic workers:** Use superpowers:executing-plans for integration and verification. Independent model work follows superpowers:dispatching-parallel-agents. Track steps below.

**Goal:** 승인된 무림 1~2장을 이미지·대사 → 준비 → 다음 전투로 연결하고 습득 기술만 직접 단축키에 편성한다.

**Architecture:** `murim-journey.js`가 장면·순서·선택을 소유한다. `murim-loadout.js`는 기술과 입력 슬롯을 분리하고, `murim-notices.js`는 획득 원장에 대응하는 읽음 상태만 저장한다. 화면은 모든 영구 변경을 기존 저장 트랜잭션으로 처리한다.

**Tech Stack:** 기존 JavaScript UMD/DOM/canvas, Node test, Playwright. 새 의존성 없음.

**Spec:** ../specs/2026-10-08-murim-scenes-loadout-design.md

## Global Constraints
- main 직접 작업. 기존 이미지 및 별도 로컬 파일 보존.
- 첫 현실 귀환은 2장 보스 이후. 옛 왕복·별도 전수자 조건을 새 여정에 노출하지 않는다.
- 10개 길목, 미투자·기연 없음·제자 거절 진행, 확정 투자 보존.
- 빈/미습득 전투 슬롯 비노출. 트리의 조건·효과는 유지.
- 슬롯 2개·튜토리얼 2/2/3명·중간 대사는 검증안.

## Review Focus
- 저장 불가 시 장면 페이지·선택·장착·읽음 상태도 원복한다.
- 이미지/지역 준비 중 취소·저장 교체 후 늦은 응답이 화면과 진행을 바꾸지 않는다.
- 슬롯 교환 후 쿨다운·기력 비용·성취가 원래 기술에 대응한다.
- 전멸 후 빠진 조작 학습을 완료할 수 있고, 사망·철수 후 재도전할 수 있다.
- v0.14 중간 저장의 완료·보상·투자를 재지급하거나 재선택하지 않는다.

## Tasks

### 1. 장면·순차 진행 모델
- [x] `murim-scenes.js`, `murim-journey.js`: 기존 intro-0/1 출발 이미지와 새 사건을 연결. 장면 ID/페이지, 치료/제자 선택, 문파 만남, 선택 기연, 다음 지역을 모델에서 검증.
- [x] `tests/murim-scenes.test.cjs`: 읽기/건너뛰기, 제자 양쪽 선택, 무투자 완주, 3차례 튜토리얼, 저장 이관·중복 보상 방지의 실패를 먼저 확인한 뒤 구현.
- [x] `node --test tests/murim-scenes.test.cjs` 및 기존 여정 모델 검사 통과.

### 2. 습득 기술 편성
- [x] `murim-loadout.js`, `murim-growth.js`, `world-game.js`: moon/storm 슬롯을 canonical 기술 moon/storm에 매핑. `describe`, `assign`, `resolve` API. 배치·교환·해제는 안전한 준비 상태에서만 허용.
- [x] `tests/murim-loadout.test.cjs`: 빈 슬롯 차단, 레거시 배치 이관, 기술 소유 쿨다운·성취, 영구 투자 불변, 잘못된 저장 거부 RED→GREEN.

### 3. 장면 화면·준비·알림·HUD
- [x] `murim-journey-ui.js`, `murim-journey.css`: 이미지·화자·대사 및 다음 지역 하나의 준비 화면. 명시적 제자 선택, 선택 기연 진입/건너뛰기, 읽기 전용 회상.
- [x] `murim-notices.js`: 최초 안내/새 재료/새 기술·만남별 읽음 원장. 메뉴 열람 시 해제, 투자 잔량 무관.
- [x] `app.js`, `realm-ui.js`, `index.html`: HUD 이름·아이콘·키·접근성·도움말 통일, 미습득 미장착 키 차단, 새 장면 재개와 저장 실패 원복.
- [x] `tests/murim-scenes.browser.cjs`: 이미지 표시, 순서, 편성/키/모바일, 읽음 저장, 비동기 취소/실패, 이전 문구 혼입 검사 RED→GREEN.

### 4. 통합·문서·검증
- [x] 기존 여정 브라우저 검사를 새 승인 흐름으로 갱신. 전체 단위·구문 검사와 배포 워크플로의 브라우저 검사 실행.
- [x] 실제 브라우저 새 게임→첫 귀환 확인. 데스크톱/360px 스크린샷 검토.
- [x] 기획·중앙 문서·결정대장·변경 이력·실제 범위/제한/플레이 순서 갱신.
- [x] 독립 검토 후 결함 수정. main 커밋 및 사용자 요청 범위에 따른 배포 여부 명시.

## Execution record
- 2026-10-08: 원격 538b368 통합. 사용자 인계는 설계 승인과 개발·검증 계속 진행 요청으로 해석하여 추가 승인 단계 없이 실행한다.
- 문서 전체 검토는 planning_audit가 수행하고 모델 담당자가 관련 문서를 교차 검토한다. UI·통합은 주 작업자가 담당한다.

- 최종 검증: Node 801/801, Node 브라우저 50/50, Python 브라우저 7/7. 저장 실패 쿨다운·첫 귀환 준비 실패·옛 조작 안내·옛 목표 대체 경로를 재현 후 수정했다.
- 실제 키 입력 관찰: 위치·체력·쿨다운 변경 없이 3차례 튜토리얼 완료. 자동 조작이므로 사람의 재미 평가는 남는다.
- 선택: 새 사건에 기존 정지 이미지 재사용. 사건별 신규 아트·동행 AI·3장 이후 개편은 이번 범위에서 제외한다.
