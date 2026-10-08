# 무림 1~2장 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, Native implementation. Steps use checkbox syntax.

**Goal:** 10개 무림 던전과 영구 성장 선택을 거쳐 첫 현실 귀환까지 플레이 가능하게 한다.
**Architecture:** Optional early journey state over WorldGame, independent growth ledger, existing combat/art reused; old saves keep old path.
**Tech Stack:** JavaScript UMD, Node test, Playwright.
**Spec:** docs/superpowers/specs/2026-10-08-murim-journey-design.md

## Global Constraints
main 직접 작업. 기존 투자/완료 저장 보존. 새 여정 1~2장만. 효과/수치 검증안. 푸시/배포는 기존 승인 범위와 최신 사용자 지시에 따라 처리.

## Review Focus
- 안내 목적지와 실제 진행 조건, 무투자/기연 없음/제자 거절의 완주.
- 새 지역 저장의 기본 validator 투영, 부분 처치/사망/클리어 직후 재로드.
- UI 저장 실패와 이중 클릭에 따른 투자/보상 중복, 초기화 우회.
- 구 저장이 새 분기로 자동 편입되거나 기존 완료/투자 상실하는지.

### Task 1: 진행 모델과 구 안내 복구
**Files:** murim-journey.js, world-game.js, save-v10.js, world-growth.js, plan-b-story.js; tests/murim-journey.test.cjs
**Interfaces:** start/state/validate/areas/points/objective/interact/onEnter/reward/step; Game.startMurimJourney/chooseDisciple.
- [ ] RED: 안내는 소개 후 던전 입구, 순차 10개 지역/치료/제자/귀환, 구 저장 보존.
- [ ] 구현 후 Node 테스트 GREEN. 저장·보상 회귀 포함.

### Task 2: 무림 재료와 선택 성장
**Files:** murim-growth.js, world-game.js; tests/murim-growth.test.cjs
**Interfaces:** balance/allocate/upgrade/bonus/skillInfo; worldState.murimGrowth.
- [ ] RED: 재료 최초 지급, 3개 분기 선행/영구 투자, 현실에 직접 투자 복제 금지.
- [ ] 검술·보법·내공 실제 효과, 삼재검법/수락 시 매화 제1초식, 선택 기연 검증. GREEN.

### Task 3: 실제 플레이 UI와 문서
**Files:** murim-journey-ui.js/css, app.js, intro-ui.js, character-ui.js, skills-screen.js, index.html, server.cjs, docs/planning/*; tests/murim-journey.browser.cjs
- [ ] RED: 새 게임 초반 스토리/튜토리얼/여정 선택/스탯·트리 화면/360px.
- [ ] 새 UI 연결, 구 흐름 테스트에 classic 경로 명시. GREEN.
- [ ] 전체 Node/구문·관련 브라우저 검증, 신규 1~2장 실제 입력 완주.
- [ ] fresh 최종 리뷰 1회와 중요 결함 RED→GREEN, 범위/플레이 안내 보고.
