# 완료 기준 / 리뷰 체크리스트

## R16 해결
- [ ] 현실 헌터 기지에 무림 도포/무림 건물/무림 몬스터 placeholder가 없다.
- [ ] 현실/무림 주인공의 얼굴 정체성은 이어지되 복장/실루엣/장비가 명확히 다르다.
- [ ] 주요 NPC가 공통 몸체의 머리 교체처럼 보이지 않는다.

## 캐릭터 모션
- [ ] 8방향 이동 영상에서 front/side/back/diagonal 구분.
- [ ] 지면 미끄러짐 없음.
- [ ] 3연격 body/hand/blade/slash가 같은 contact frame.
- [ ] hit-stop 동안 body/effect가 따로 진행하지 않음.
- [ ] 회피 후 자연스러운 pose 복귀.

## 무공
- [ ] 월영참은 1회 광역 검격, 가짜 hit 없음.
- [ ] 천뢰격 잔류 번개는 추가 damage로 오해되지 않음.
- [ ] 파문세는 실제 parry 성공 시 큰 파문.
- [ ] 잔영각 잔향 pose/facing 보존.
- [ ] 재현검은 본체 teleport 없음.
- [ ] 쇄경진/수호진은 생성 위치 고정.
- [ ] low effect/reduced motion도 판정 동일.

## 세계 분리
- [ ] 현실: flat roof/glass/concrete/roads/security equipment.
- [ ] 무림: tile roof/wood/stone/dirt/natural props.
- [ ] 적 silhouette만 보고 세계 구분.
- [ ] 포털 두 종류가 서로 다른 외부 프레임/preview.

## UI
- [ ] desktop HUD 4개 정보 영역.
- [ ] mobile news/help가 조작을 가리지 않음.
- [ ] 소식 5탭 어디서나 고지 문구 보임.
- [ ] 대화 초상과 field NPC가 같은 인물.

## 온보딩
- [ ] H 길잡이가 현재 상태에 맞는 한 단계만 제시.
- [ ] B → E → N → 실험을 플레이만으로 재현.
- [ ] 도움말만 읽어 기연/해석이 열리지 않음.

## 필수 증거
1. reality hunter base screenshot.
2. murim village screenshot.
3. reality↔murim hero comparison.
4. 8-direction walk GIF/video 또는 frame sheet.
5. 3-hit combo GIF/video.
6. 현재 스킬/개인 무공 VFX 캡처.
7. portal comparison.
8. 390x844 news disclosure screenshot.
9. live Pages build-info + asset hash 결과.

정지 컨셉 그림만으로 대체할 수 없다.
