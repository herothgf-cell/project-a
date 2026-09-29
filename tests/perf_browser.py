"""Opt-in performance overlay contract. Chromium is a UI check, not device benchmarking."""
import argparse, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
FILES=re.findall(r'<script[^>]+src="([^"?]+)',(ROOT/'index.html').read_text())
CAPTURE="""Object.defineProperty(window,'WorldRenderer',{configurable:true,set(Base){Object.defineProperty(window,'WorldRenderer',{configurable:true,value:class extends Base{constructor(...args){super(...args);window.__renderer=this;}}});}});"""

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--url');args=parser.parse_args()
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,args=['--no-sandbox'])
        for query,enabled in [('',False),('?perf=1',True),('?perf=0',False)]:
            context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
            context.add_init_script(CAPTURE)
            page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            if args.url:page.goto(args.url+query,wait_until='load')
            else:
                page.goto('about:blank'+query)
                html=re.sub(r'<script[^>]*>.*?</script>|<link rel="stylesheet"[^>]*>','',(ROOT/'index.html').read_text(),flags=re.S)
                page.set_content(html)
                page.evaluate("()=>{const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}")

                for f in re.findall(r'<link rel="stylesheet"[^>]+href="([^"?]+)',(ROOT/'index.html').read_text()):page.add_style_tag(content=(ROOT/f).read_text())
                for file in FILES:page.add_script_tag(content=(ROOT/file).read_text())
            page.locator('#start').click();page.locator('#dialogActions button').first.click()
            hud=page.locator('#perfHud')
            if enabled:
                expect(hud).to_contain_text('viewport 390×844',timeout=3000)
                expect(hud).to_contain_text('DPR 2')
                expect(hud).to_contain_text('slow >35 ms ')
                assert page.evaluate("document.elementFromPoint(380,15)?.id")!='perfHud'
                page.evaluate("()=>{__renderer.slowFrames=101;__renderer.draw(new DualWorld.Game(),.036)}")
                expect(hud).to_contain_text('autoLow ON · quality 0',timeout=3000)
            else:assert hud.count()==0
            assert not errors,errors
            context.close()
        browser.close()
    print('perf overlay: default and perf=0 absent; perf=1 metrics and autoLow visible')

if __name__=='__main__':main()
