# 쌍계 Codex 그래픽·미구현 개발 인수인계

## 기준
- Repository: `herothgf-cell/project-a`
- Base branch: `main`
- 기준 커밋: `c1f33e39a4394528a77c6809c71bab2491ecddf4`
- 현재 버전: `v0.8.0 — 두 세계의 호흡`
- 목적: 기존 12지역 / 5장 / 저장 version 6의 **게임 규칙과 진행을 보존**하면서, 임시·혼합 아트를 제작용 아트로 교체하고 캐릭터/무기/VFX/UI를 하나의 동작 언어로 통합한다.

## 그래픽 레퍼런스 전달
`references/manifest.json`은 저장소에 있다. 실제 R01/R02/R03/R16 이미지와 원본 컨셉 보드는 별도 첨부 ZIP `ssanggye-codex-art-production-handoff-v09.zip`에 들어 있다.

ZIP을 받은 뒤 루트에 풀면 다음 경로가 생긴다.
- `references/codex-art/R01...`
- `references/source-boards/...`

Codex는 레퍼런스 이미지를 실제로 열어본 뒤 작업한다.

## 가장 중요한 문제
현재 v0.8은 세계별 렌더링 분기와 모션 보정은 구현되어 있지만 최종 아트 파이프라인은 아니다.

다음을 최종 완성으로 간주하면 안 된다.
1. 현실 인물의 공통 절차형 몸체 + 기존 얼굴/머리 재사용.
2. 무협 인물 한 장을 분절해 걷는 것처럼 보이게 한 방식.
3. `hero`, `warden`, `shop`, `boss` 같은 넓은 role 단위 외형 공유.
4. 절차형 박스/다각형 건물과 몬스터.
5. 컨셉 보드를 게임 런타임 에셋으로 직접 사용하는 것.

R16은 현실 세계인데 인물/환경/전투 아트 언어가 혼합되어 보이는 현재 문제의 검수 기준이다.

## Codex 작업 원칙
- 컨셉은 고전 2D 아이소메트릭/핸드페인팅 RPG 감성을 참고하되 특정 상용 게임의 캐릭터, UI, 타일, 로고를 그대로 복제하지 않는다.
- 현실과 무림은 같은 작품의 화풍이지만 **실루엣/재질/조명/복장/적 디자인이 즉시 구분**되어야 한다.
- 새 아트를 만들 수 없는 경우 다른 세계 에셋으로 대체하지 말고 `BLOCKED_ART`로 남긴다.
- 테스트가 초록색이어도 시각 결과가 R16 수준이면 완료가 아니다.
- 기능 변경보다 표현 교체를 우선한다. 전투 수치/판정 변경은 별도 근거 없이 하지 않는다.

## 읽는 순서
1. `01_CURRENT_STATE_AND_GAPS.md`
2. `02_ART_DIRECTION.md`
3. `03_PRODUCTION_ASSET_MATRIX.md`
4. `04_SKILL_VFX_IMPLEMENTATION.md`
5. `05_RUNTIME_INTEGRATION.md`
6. `06_CODEX_WORK_ORDER.md`
7. `07_DONE_CRITERIA.md`
8. `docs/superpowers/plans/2026-09-29-codex-art-production.md`

## 첫 품질 기준
**현실 헌터 기지**와 **무림 청운촌** 두 곳을 먼저 완성한다. 주인공, NPC, 건물, 포털, HUD, 전투가 기준을 통과한 뒤 다른 지역으로 확장한다.
