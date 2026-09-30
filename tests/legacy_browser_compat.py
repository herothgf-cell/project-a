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
