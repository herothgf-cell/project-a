# 제작 에셋 매트릭스

## 권장 구조
```text
assets/
  art/
    manifest.json
    reality/
      hero/yunseo/
      npc/seorin/
      npc/dogyeom/
      npc/supply/
      npc/researcher/
      npc/medic/
      enemies/
      environments/
      portals/
    murim/
      hero/yunseo/
      npc/baekryun/
      npc/yeonhwa/
      npc/common/
      enemies/
      environments/
      portals/
    shared/
      vfx/
      ui/
```

키는 `world + entityId + action + facing + frame`.

예:
`reality.hero.yunseo.walk.ne.0`
`murim.hero.yunseo.attack1.s.2`
`reality.npc.seorin.idle.s.0`

## P0 — 먼저 제작
### 플레이어 2세계
각 세계마다:
- idle 8방향: 2~4 frames.
- walk 8방향: 6~8 frames.
- dodge 8방향: 4~6 frames.
- attack1/2/3 8방향: 접촉 frame 포함 4~8 frames.
- cast/seal: 4~8 frames.
- hit: 2~4 frames.
- portrait neutral / focus / hurt / slight-smile.
- weapon socket / hand socket / effect origin.

단순 좌우 flip만으로 8방향 완료 처리 금지.

### 핵심 NPC
현실: 서린, 도겸, 보급/정비 담당.
무림: 백련, 연화, 문파 제자/상인 대표.
각 NPC: field idle 4방향 이상 + portrait neutral/story emotion 2종 이상.

### P0 지역
현실 헌터 기지 / 무림 청운촌.
각각 ground, road/path, 3~5 building families, props, vegetation/industrial clutter, portal, foreground deco.

## P1
기존 전투 지역으로 환경/적/포털 확장.

## P2 — UI
HP/MP HUD, 미니맵 frame/markers, quest tracker, 5-tab news panel, dialogue frame, skill buttons, journal/fate panels, tutorial highlight.

## 메타데이터 필수
logical size, anchor/pivot, foot point, hand socket, weapon socket, effect origin.
충돌 판정은 기존 게임 로직이 권위.

## fallback 규칙
1. 같은 entity의 같은 world에서 가장 가까운 facing fallback만 허용.
2. 다른 world 캐릭터/복장 fallback 금지.
3. NPC 고유 에셋이 없으면 `BLOCKED_ART:<id>`.
4. production build에서 필수 P0 placeholder를 검출 가능하게 한다.
