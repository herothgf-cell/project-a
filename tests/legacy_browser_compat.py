"""Keep pre-v0.9 encounter suites on their original starting state and key preset.
New intro/default controls are exercised separately by v09.browser.cjs.
"""
def finish_intro(page):
    page.get_by_role('button', name='인트로 건너뛰기', exact=True).click()
    page.evaluate("""() => {
      Controls.preset('legacy');
      if (window.__game) {
        __game.progress=0;
        Object.assign(__game.revision,{origin:'legacy',intro:7,aid:0,history:[]});
      }
    }""")
    # The frozen release preloads art on a world transition. Historical suites
    # positioned actors and pressed keys in the same tick, before that barrier.
    if not getattr(page, '_asset_aware_keys', False):
        original_press = page.keyboard.press
        def press_ready(key, **kwargs):
            page.wait_for_function("!globalThis.ArtPreview || !globalThis.__game || ArtPreview.ensureWorld(DualWorld.AREAS[__game.area].world==='현실'?'reality':'murim')===true")
            return original_press(key, **kwargs)
        page.keyboard.press = press_ready
        page._asset_aware_keys = True
