# Codex 실행 순서

## 목표
새 스토리를 늘리기 전에 **현실 헌터 기지 + 무림 청운촌**을 vertical-slice 품질 기준 장면으로 완성한다.

## Phase 0 — 아트 파이프라인
1. 최신 main.
2. `references/manifest.json`과 첨부 ZIP R01/R02/R03/R16 확인.
3. baseline tests.
4. `assets/art/manifest.json`, loader, build-site binary/hash tests를 TDD로 추가.
5. 없는 ID는 `BLOCKED_ART`.

## Phase 1 — 주인공 두 세계 완전 분리
- reality 윤서 전신/초상/방향/동작.
- murim 윤서 전신/초상/방향/동작.
- 같은 action instance의 hand/blade/effect socket.
- 8방향 + 3연격 evidence.

## Phase 2 — 핵심 NPC
현실: 서린, 도겸, 보급 담당.
무림: 백련, 연화, 대표 문파/상인 NPC.
field + portrait 일치, cross-world fallback 금지.

## Phase 3 — P0 환경/포털
- 현실 헌터 기지.
- 무림 청운촌.
- portal locked/available/active/transition.
- minimap marker와 실제 portal 형태 일치.

## Phase 4 — 몬스터 분리
현재 실제 spawn ID부터 world-specific asset 연결. 컨셉만 있는 신규 적은 spawn 금지.

## Phase 5 — 현재 스킬 VFX
`04_SKILL_VFX_IMPLEMENTATION.md` 순서.
1. 연환검 / 월영참 / 천뢰격 / 회피.
2. 파문검 3종.
3. 잔영보 3종.
4. 경계봉인 3종.
5. 여섯 해석.

## Phase 6 — UI 제작 아트
HUD / 퀘스트 / 미니맵 / 대화 / 5탭 소식 / 수첩 / 기연 / 성장 / 모바일.
고지 문구 유지:
`실제 멀티 채팅이 아닌 연출 시뮬레이션입니다.`

## Phase 7 — 기감 온보딩 polish
기능 재구현 금지. 기존 H/B/E/N 흐름을 이해시키는 visual feedback.
- H 도움말 highlight.
- B 반응점.
- E 조사 거리.
- N 다음 행동 1줄.
- 환서정 입구.
- 해석 수락/보류/되돌리기.

## Phase 8 — 나머지 기존 지역
P0에서 확정한 pipeline을 나머지 10개 지역에 적용. 새 챕터 추가 금지.

## Phase 9 — QA / 배포
- npm check/test.
- 모든 browser suite + visual suite.
- desktop / 390x844 / 360x640 / 844x390.
- perf=1 regression.
- live Pages hash verification.
- 공개 URL 캡처.

## 금지
- 컨셉 보드를 게임 배경으로 통째로 사용.
- 한 장 캐릭터 좌우 flip만으로 8방향 완료.
- 현실 NPC를 무림 몸체 + 현실 머리로 제작.
- art polish 이유로 전투 밸런스 변경.
- 테스트 통과만으로 그래픽 완료 선언.
