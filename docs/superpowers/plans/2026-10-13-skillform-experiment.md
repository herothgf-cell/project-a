# 무공 조합 실험 구현 계획

> Execution: `executing-plans`로 현재 세션에서 구현, `test-driven-development`로 모델·전투·격리 계약 검증. 마지막에는 독립 읽기 전용 리뷰.

**Goal:** 월영참 네 축 제작 → 세 기연 요소 학습·Q 제작 → 세 연계 → 현실 적용을 직접 조작하는 낮은 난도 실험을 제공한다.
**Architecture:** 개발 전용 독립 페이지, DOM-free 제작/저장 모델, 기존 WorldGame/FateRules/RealitySkills를 사용하는 실험 전투 어댑터, 캔버스+반응형 편집 UI. 본편 클래스의 전역 프로토타입과 저장은 수정하지 않는다.
**Tech Stack:** 기존 브라우저 JavaScript/Node test/Playwright, 새 의존성 없음.
**Spec:** `docs/design/skillform/README.md` 및 사용자의 개발 진행·전투 난도 완화 요청.

## Global Constraints

- main 직접 작업. 새 브랜치·워크트리·푸시·배포 없음. 기존 미추적 산출물 보존.
- 별도 저장 `dualworld.experiment.skillform.v1`만 사용. 본편 저장 가져오기/역수입은 이번 실험에서 제공하지 않는다.
- 네 기본 초식, 세 연계, 현실 적용을 모두 제공. R/F와 세 초식 중첩은 불가.
- 실험 전투는 HP 180, 적 피해 6, 예고 1.6초, MP 회복 12/초, 패배 손실 없음. 본편 수치 불변.
- 시험의 실제 타격/방어/회피/억제/연계 효과만 증명. 버튼 입력만으로 체득하지 않음.
- 스크립트와 실험 페이지는 ART_REVIEW=1 + dev=1 + loopback에만 노출. 공개 빌드에 포함하지 않는다.

## Review Focus

1. 미체득 초식·요소, 현실 적용 미완료 상태의 실행과 위조 저장 거부.
2. 충격 단일 소비·회피 실제 예고 이탈·억제 전이 남은 시간 보존.
3. 저장 실패·손상 시 원문 보존 및 계속 실험/재시도 안내.
4. 시험 재시작/세계 전환/키 누름·포커스 상실에서 큐·준비 상태·키 누수 없음.
5. 본편/기존 테스트 슬롯·공개 서버/빌드 격리, 좁은 화면의 실제 조작 가능성.

## Task 1: 제작 모델과 별도 저장

Files: `experiments/skillform/model.js`, `tests/skillform-model.test.cjs`.
Interfaces: `initial()`, `learn(state,family)`, `compose(state,{form,qi,flow,intent})`, `prove(state,technique)`, `link(state,family,value)`, `proveLink(state,family)`, `applyReality(state,family)`, `serialize(state)`, `load(raw)`.

- [x] RED: 미학습·불호환, 튜토리얼 순서, 체득 전 연결, 결정적 범위·비용, 변형 보관 상한, 저장 위조·중복 증거를 검사.
- [x] GREEN: 축별 1개·원형 1개·연계 2초식의 유한 카탈로그 구현. 학습/초안/체득/연계 검증/현실 적용 기록 분리.
- [x] Verify: `node --test tests/skillform-model.test.cjs`.

## Task 2: 실제 시험 전투

Files: `experiments/skillform/trial.js`, `tests/skillform-combat.test.cjs`.
Interfaces: `Trial(state,{family,world,linked})`, `.act(action)`, `.step(dt,input)`, `.g` (격리 WorldGame), `.result`, `.events`, `.finished`.

- [x] RED: 월영참 적중 체득, 받아내기·회피·억제 실효, 관통 2대상·1회 소비, 원위치 지연, 억제 전이, 잠긴 현실/자원 부족·패배·경제 무변화.
- [x] GREEN: 기존 Q 실행과 이동/충돌을 이용하고 전투 시간·적 예고를 실험이 관리. 상태 소비·후속 변환은 실험 인스턴스에만 연결.
- [x] Verify: `node --test tests/skillform-combat.test.cjs tests/skillform-model.test.cjs`.

## Task 3: 편집·실습 UI, 진입과 안내

Files: `experiments/skillform/index.html`, `style.css`, `ui.js`, `server.cjs`, `tests/dev-starts-ui.js`, `tests/skillform-server.test.cjs`, `tests/skillform.browser.cjs`, `docs/skillform-test-guide.md`, `package.json`.

- [x] RED: 개발 전용 경로, 공개 404, 스크립트 의존성, 본편 저장 보존·요소 구성부터 현실 효과까지 브라우저 검증.
- [x] GREEN: 네 축 선택, 세 배움 경로, 호환 이유, 숙련 fixture/범위, 실제 Q→검격 시험, 결과/무료 재시도/현실 적용, 저장 실패 경고·확인 후 실험만 초기화.
- [x] Verify: 신규 Node 테스트, 전체 `npm test`, 기존 문법 검사, 신규 브라우저 흐름/모바일 확인. 실행 페이지를 로컬 서버에서 열어 제공.

## 실행 기록

- Ruling: 사용자에게 이미 기획 검토 후 ‘개발 진행’ 승인을 받았으므로 별도 실행 방식 재질문 없이 직접 구현한다. main 유지와 미배포는 사용자 지침을 따른다.
- Ruling: 실험의 통로 사건은 간단한 요약과 시험 전장으로 제공한다. 본편 1~3장 획득 로직 변경과 기존 저장 마이그레이션은 제외하고 실험 전체 조합 흐름을 완성한다.
- Ruling: 숙련 1/3/5성은 명시적인 실험 설정으로 선택한다. 영구 수치 파밍·등급·재화 보상 없이 초식/원리의 실효 증명은 별도 저장한다.
- Pre-flight: Task 1 state/validation을 Task 2와 Task 3에서 공유한다. 시험 중 영구 기록만 모델로 전달하고 임시 상태는 재접속 시 복원하지 않는다.

- Task 1/2/3 complete: 월영참 네 축 제작, 세 Q 제작·실효 증명, 세 연계·현실 적용, 개발 UI와 별도 저장까지 구현.
- RED→GREEN: 최소 숙련 누락, 완료 액션 내력/타격 집계 시점, 현실 일반 공격 이후 준비 중복 소비, Q 이후 기본형 비교 조기 종료, 존재하지 않는 sword 연계 결과 저장 검증을 재현하고 수정했다.
- Final independent review: review_skillform이 발견한 P1 1개·P2 2개를 모두 회귀 테스트와 함께 수정. 미해결 필수 항목 없음.
- Verification: `node --test tests/*.test.cjs` 740/740 통과 (npm test와 동일 명령; 이 실행 환경의 npm 경로가 없어 Node 직접 실행). `check`, `check:revision`, `check:world`의 각 문법 검사와 신규 파일 문법 검사 통과.
- Browser: Playwright Chrome에서 UI 입력만으로 네 기본 초식·세 무림 연계·세 현실 연계·현실 기본형 후속 검격 완료. 새로고침, 390px 모바일 버튼/가로 넘침, 저장 용량 실패·손상·초기화의 본편 원문 보존 확인. `.skillform-review`에 데스크톱·모바일 이미지 보관.
- Public build: 일반/프로토타입 패키지의 실험 자산 제외를 기존 build 테스트에서 확인. 공개 서버 404, 개발 경로의 의존성 로드 검증 완료.
- Delivery: `node scripts/start-skillform.cjs`, loopback 3103에서 실행. main 작업 상태 유지, 커밋·푸시·배포 없음. 본편의 스토리·경제·저장 키와 기존 검수 산출물은 변경하지 않았다.
