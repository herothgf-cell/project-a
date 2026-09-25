"""Chromium offline-document UI checks. Local assets are inlined because browser HTTP navigation is administrator-blocked. Storage shim checks app logic, NOT real browser disk persistence. Test instrumentation never ships."""
import argparse, json, os, re, subprocess, time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
INSTRUMENT="""(() => {let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api;},set(value){api=value;const Base=api.Game;api.Game=class extends Base{constructor(...args){super(...args);window.__game=this;}static load(text){const g=Base.load(text);window.__game=g;return g;}};}});})();"""
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--red',action='store_true');parser.add_argument('--url');parser.add_argument('--output',default=str(ROOT/'.superpowers/v03/screens'));args=parser.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    server=None
    url=args.url
    storage_shim="""(seed)=>{const data=new Map(Object.entries(seed));Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(String(k),String(v)),removeItem:k=>data.delete(k),clear:()=>data.clear(),key:i=>Array.from(data.keys())[i]??null,get length(){return data.size}}});}"""
    def load(page,seed=None):
        if url:
            page.goto(url,wait_until='load');return
        page.goto('about:blank')
        html=(ROOT/'index.html').read_text(encoding='utf-8')
        html=re.sub(r'<script[^>]*>.*?</script>','',html,flags=re.S)
        html=re.sub(r'<link rel="stylesheet"[^>]*>','',html)
        page.set_content(html,wait_until='load')
        page.evaluate(storage_shim,seed or {})
        page.evaluate(INSTRUMENT)
        page.add_style_tag(content=(ROOT/'style.css').read_text(encoding='utf-8'))
        for name in ['world.js','game.js','art.js','render.js','app.js']:
            if args.red and name=='app.js':continue
            page.add_script_tag(content=(ROOT/name).read_text(encoding='utf-8'))
    def reload_page(page):
        # Offline documents need the pagehide event that real HTTP navigation emits.
        if not url: page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide'))")
        seed=page.evaluate("Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>{const k=localStorage.key(i);return [k,localStorage.getItem(k)]}))")
        load(page,seed)
    def seed_save_at_title(page,raw):
        # Match user behavior: finish the session before replacing its checkpoint.
        # A native pagehide while playing MUST save the live game, not test data.
        if page.locator('#game').is_visible():
            page.locator('#menu').click()
            page.get_by_role('button',name='타이틀로',exact=True).click()
        expect(page.locator('#title')).to_be_visible()
        expect(page.locator('#game')).not_to_be_visible()
        page.evaluate("raw=>localStorage.setItem('dualworld.save.v1',raw)",raw)
    results=[]
    try:
        with sync_playwright() as p:
            launch={'headless':True,'args':['--no-sandbox']}
            if not url and Path('/usr/bin/chromium').exists(): launch['executable_path']='/usr/bin/chromium'
            if os.environ.get('CHROMIUM_PATH'): launch['executable_path']=os.environ['CHROMIUM_PATH']
            browser=p.chromium.launch(**launch)
            context=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
            context.add_init_script(INSTRUMENT);page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
            load(page);page.screenshot(path=str(out/'title.png'));page.locator('#start').click();expect(page.locator('#dialog')).to_be_visible(timeout=1500)
            if args.red: print('unexpected RED pass');return
            page.locator('#dialogActions button').first.click();expect(page.locator('#dialog')).not_to_be_visible();expect(page.locator('#canvas')).to_be_visible();expect(page.locator('#title')).not_to_be_visible()
            page.wait_for_timeout(100);x=page.evaluate('__game.player.x');page.keyboard.down('KeyD');page.wait_for_timeout(400);page.keyboard.up('KeyD');assert page.evaluate('__game.player.x')>x+30
            assert 'undefined' not in page.locator('#objective').inner_text();assert not errors,errors;results.append('new journey, intro close, visible canvas and keyboard movement')
            page.screenshot(path=str(out/'desktop-city.png'))
            # Real model fixtures for all encounters; keyboard and pointer actions remain real UI input.
            for area,stage in [('village',1),('forest',2),('rift',5),('ruins',8),('harbor',11)]:
                page.evaluate('([a,s])=>{__game.progress=s;__game.training=s>=10?3:s>=4?2:s>=2?1:0;__game.enter(a);__game.events=[];}',[area,stage]);page.wait_for_timeout(180)
                if area!='village':
                    page.evaluate('()=>{const e=__game.enemies[0];__game.player.x=e.x-45;__game.player.y=e.y;}');page.wait_for_timeout(120)
                    hp=page.evaluate('__game.enemies[0].hp');page.keyboard.press('KeyK');page.wait_for_timeout(60);assert page.evaluate('__game.enemies[0].hp')<hp;assert page.locator('[data-action=moon] em').is_visible()
                    page.evaluate('()=>{const e=__game.enemies.find(e=>e.boss);__game.player.x=e.x-80;__game.player.y=e.y;}');page.wait_for_timeout(200);expect(page.locator('#boss')).to_be_visible();assert 'undefined' not in page.locator('#objective').inner_text()
                page.screenshot(path=str(out/f'desktop-{area}.png'));assert not errors,errors
            results.append('six areas rendered, skill effects/cooldown, boss HUD and enemy target label')
            page.evaluate("()=>{__game.enter('city');__game.progress=0;__game.training=0;__game.events=[];}");page.wait_for_timeout(100)
            # Held attack must advance combo, then stop on release or dialog.
            a=page.locator('[data-action=attack]');box=a.bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.wait_for_timeout(900);assert page.evaluate('__game.lastAttack')>.3;page.mouse.up();last=page.evaluate('__game.lastAttack');page.wait_for_timeout(400);assert page.evaluate('__game.lastAttack')==last
            page.locator('#menu').click();pt=page.evaluate('__game.playTime');page.wait_for_timeout(200);assert page.evaluate('__game.playTime')==pt;page.locator('#closeDialog').click();results.append('held attack/release and modal pause')
            page.evaluate("()=>{__game.progress=8;__game.training=2;__game.enter('ruins');__game.events=[];}");page.locator('#menu').click();page.get_by_role('button',name='거점으로 후퇴',exact=True).click();page.get_by_role('button',name='후퇴하기',exact=True).click();page.wait_for_timeout(120);assert page.evaluate('__game.area')=='village';assert page.evaluate('__game.progress')==8
            # Exported/imported schema and continue exercise browser localStorage, same key.
            seed_save_at_title(page,json.dumps(dict(version=1,area="rift",progress=6,training=2,level=5,xp=10,gold=135,potions=2,upgrade=3,clears=1)))
            reload_page(page);page.locator('#continue').click();page.wait_for_timeout(150);assert page.evaluate('__game.progress')==6;assert page.evaluate('__game.gold')==135;assert page.evaluate('__game.area')=='city';results.append('retreat and v1 saved-game migration/continue')
            for width,height in [(390,844),(360,640),(844,390)]:
                mobile=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=2,is_mobile=True,has_touch=True)
                mobile.add_init_script(INSTRUMENT);m=mobile.new_page();me=[];m.on('pageerror',lambda e:me.append(str(e)));m.on('console',lambda x:me.append(x.text) if x.type=='error' else None);load(m);m.locator('#start').click();m.locator('#dialogActions button').first.click();m.wait_for_timeout(150)
                cb=m.locator('#canvas').bounding_box();assert cb['height']>200;assert cb['y']+cb['height']<=height+1
                sb=m.locator('#stick').bounding_box();ab=m.locator('[data-action=attack]').bounding_box();assert sb and ab
                cdp=mobile.new_cdp_session(m)
                def touch(x,y,id):return {'x':x,'y':y,'id':id,'radiusX':2,'radiusY':2,'force':1}
                sx,sy=sb['x']+sb['width']/2,sb['y']+sb['height']/2;ax,ay=ab['x']+ab['width']/2,ab['y']+ab['height']/2
                start=m.evaluate('__game.player.x');cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[touch(sx,sy,1)]});cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[touch(sx+28,sy,1)]});cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[touch(sx+28,sy,1),touch(ax,ay,2)]});m.wait_for_timeout(550)
                assert m.evaluate('__game.player.x')>start+25;assert m.evaluate('__game.lastAttack')>0
                cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});m.wait_for_timeout(70);after=m.evaluate('__game.player.x');la=m.evaluate('__game.lastAttack');m.wait_for_timeout(300);assert abs(m.evaluate('__game.player.x')-after)<.1;assert m.evaluate('__game.lastAttack')==la
                cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[touch(sx,sy,3)]});cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[touch(sx+25,sy,3)]});m.wait_for_timeout(70)
                m.evaluate("document.getElementById('menu').click()");cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});after=m.evaluate('__game.player.x');m.locator('#closeDialog').click();m.wait_for_timeout(220);assert abs(m.evaluate('__game.player.x')-after)<.1;assert not me,me
                m.screenshot(path=str(out/f'mobile-{width}x{height}.png'));mobile.close();results.append(f'{width}x{height}: viewport, multitouch movement+attack, cancel and modal reset')
            # Corrupt storage is preserved; overwrite requires confirmation.
            seed_save_at_title(page,"broken-save");reload_page(page);assert page.locator('#continue').is_hidden();assert '읽을 수 없' in page.locator('#titleError').inner_text();page.locator('#start').click();assert page.evaluate("localStorage.getItem('dualworld.save.v1')")=='broken-save';page.locator('#closeDialog').click();assert page.evaluate("localStorage.getItem('dualworld.save.v1')")=='broken-save';results.append('corrupt storage preserved until explicit confirmation')
            assert not errors,errors;browser.close()
            (out/'results.json').write_text(json.dumps({'mode':'HTTP origin; real browser storage' if url else 'offline document; storage shim','passed':len(results),'checks':results,'page_errors':errors},ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'passed':len(results),'checks':results},ensure_ascii=False,indent=2))
    finally:
        if server:server.terminate();server.wait(timeout=5)
if __name__=='__main__':main()
