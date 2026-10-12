# 런타임 / 에셋 파이프라인 지침

## 현재 구조
- `presentation.js`: 절차형 pose와 world presentation helper.
- `realm-art.js`: 현실/무림 분기, procedural building/uniform/threat, 기존 시트 조합.
- `wuxia-art.js`, `wuxia-data.js`, `wuxia-direction.js`: 기존 무협 인물/방향 처리.
- `render.js`: Canvas 2D render.
- `realm-ui.js`, `journey-ui.js`, `app.js`: HUD/모달/입력.
- `scripts/build-site.cjs`: 현재 HTML에서 발견한 JS/CSS runtime 파일 중심 복사.

## 목표
새 binary art를 runtime에서 읽고 Pages build가 PNG/WebP/JSON/atlas를 복사/해시 검증해야 한다.

### 제안
- Create `assets/art/manifest.json`.
- Create `art-loader.js` 또는 작은 manifest loader.
- Modify `realm-art.js`: manifest-backed sprite/portrait/environment 우선.
- dev fallback은 허용하되 production build에서 필수 P0 placeholder를 검출.
- Modify `scripts/build-site.cjs`: manifest가 가리키는 PNG/WebP/JSON도 `site/assets`에 복사하고 SHA-256 기록.
- Modify `scripts/check-live.py`: 공개 URL binary/hash 검증.

## resolver
```text
resolveArt({world, entityId, action, facing, frame})
resolvePortrait({world, entityId, expression})
resolveEnvironment({world, areaId, layer})
resolveVfx({skillId, phase})
```

world/entityId가 빠진 fallback은 final mode 금지.

## 모션 action instance
한 번의 action이 body/weapon/vfx에 공유:
- actionId
- startedAt
- contactAt 또는 damageAlreadyApplied
- facing
- combo
- handSocket
- bladeSocket

피해 로직은 `game.js`가 권위이며 render가 판정을 생성하지 않는다.

## 테스트
- `tests/art-manifest.test.cjs`: P0 entity/action/facing 존재, cross-world fallback 없음.
- `tests/site-build.test.cjs`: binary 모두 복사 + hash 일치.
- `tests/presentation.test.cjs`: contact/effect origin 동일 action id.
- `tests/v09_visual_browser.py`: 세계별 hero/NPC/monster/portal asset id 검증.

## 배포
- 그래픽 교체만으로 저장 version6 변경 금지.
- image 누락을 반대 세계 fallback으로 숨기지 않는다.
- Pages 후 build-info / asset-manifest / art manifest hash 검증.
