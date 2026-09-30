"""v0.6 browser regressions. Supports HTTP CI and documented offline local execution.
Uses real buttons, keyboard and CDP touch. Model fixtures arrange encounters;
this is not an unassisted playthrough or physical-device benchmark.
"""
from pathlib import Path
import argparse,json,re,os
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
HOOK="""(()=>{let api;Object.defineProperty(window,'DualWorld',{configurable:true,get(){return api},set(v){api=v;for(const k of ['save','step']){const original=api.Game.prototype[k];api.Game.prototype[k]=function(...args){window.__game=this;return original.apply(this,args)}}}})})();"""
SHIM="""seed=>{const m=new Map(Object.entries(seed||{}));Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear(),key:i=>Array.from(m.keys())[i]??null,get length(){return m.size}}})}"""
HTML=(ROOT/'index.html').read_text()
SCRIPTS=re.findall(r'<script[^>]+src="([^"?]+)',HTML)
STYLES=re.findall(r'<link rel="stylesheet"[^>]+href="([^"?]+)',HTML)
def load(page,url=None,seed=None):
    if url:page.goto(url,wait_until='load')
    else:
        page.goto('about:blank');page.set_content(re.sub(r'<script[^>]*>.*?</script>|<link rel="stylesheet"[^>]*>','',HTML,flags=re.S));page.evaluate(SHIM,seed or {});page.evaluate(HOOK)
        for f in STYLES:page.add_style_tag(content=(ROOT/f).read_text())
        for f in SCRIPTS:page.add_script_tag(content=(ROOT/f).read_text())
    page.wait_for_function('window.WuxiaArt && WuxiaArt.ready()',timeout=10000)
def new_game(page):
    page.locator('#start').click();expect(page.locator('#dialog')).to_be_visible();page.locator('#dialogActions button').first.click();expect(page.locator('#dialog')).not_to_be_visible();expect(page.locator('#canvas')).to_be_visible()
def dismiss(page):
    for i in range(3):
        if not page.locator('#dialog').is_visible():return
        page.locator('#closeDialog').click()
def ready(page,path='ripple'):
    dismiss(page)
    page.evaluate("""p=>{const g=__game;g.progress=12;g.training=3;g.level=12;Object.assign(g.fate,{stage:6,path:p,proven:[p],discovered:[p],focus:100});g.enter('city');g.events=[];const o=DualWorld.AREAS.city.points.find(o=>o.id==='warden');Object.assign(g.player,{x:o.x,y:o.y});} """,path)
    page.keyboard.press('KeyE');expect(page.locator('#dialog')).to_be_visible();page.locator('#dialogActions button').first.click()
    page.evaluate("""()=>{const g=__game;g.enter('returnPass');g.events=[];g.enemies.forEach(e=>{e.cd=999;e.x+=300;e.y-=300});Object.assign(g.player,{x:660,y:630,face:Math.PI,mp:500,invuln:0});Object.assign(g.storyRuntime.pulse,{wind:1.15,max:1.15,cd:0});} """)
def resolve(page,path):
    ready(page,path)
    if path=='ripple':
        # Leave enough wall time to press Q, whose parry window is 0.7s.
        page.evaluate('__game.storyRuntime.pulse.wind=.45');page.keyboard.press('KeyQ')
    elif path=='echo':
        page.keyboard.press('KeyQ');page.wait_for_function('__game.player.cool.signature1>0');page.wait_for_function('__game.player.dash<=0');page.evaluate('__game.storyRuntime.pulse.wind=1');page.keyboard.press('KeyR')
    else:page.keyboard.press('KeyQ')
    page.wait_for_function('__game.chapter4.rescued===true',timeout=4000)
    assert page.evaluate('__game.chapter4.route')==path

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--url');parser.add_argument('--output',default='.superpowers/v06/screens');args=parser.parse_args();out=Path(args.output);out.mkdir(parents=True,exist_ok=True);results=[];errors=[]
    with sync_playwright() as pw:
        exe=os.getenv('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)
        b=pw.chromium.launch(executable_path=exe,headless=True,args=['--no-sandbox'])
        def context(**kw):
            ctx=b.new_context(**kw);ctx.set_default_timeout(5000);ctx.add_init_script(HOOK);p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)));return ctx,p
        ctx,p=context(viewport={'width':1440,'height':900},device_scale_factor=1)
        load(p,args.url);p.screenshot(path=str(out/'title.png'));new_game(p)
        x=p.evaluate('__game.player.x');p.keyboard.down('KeyD');p.wait_for_function('x=>__game.player.x>x+32',arg=x);p.keyboard.up('KeyD');assert not errors,errors
        p.screenshot(path=str(out/'wuxia-city.png'));results.append('title-to-play and actual keyboard movement')
        p.evaluate("()=>{__game.progress=2;__game.training=1;__game.enter('village');__game.events=[];Object.assign(__game.player,{x:650,y:590,face:Math.PI/2});}")
        p.wait_for_timeout(220);p.screenshot(path=str(out/'wuxia-village.png'))
        # Capture actual renderer directional views without adding a production debug API.
        facing=[]
        moves=[['KeyD'],['KeyD','KeyS'],['KeyS'],['KeyS','KeyA'],['KeyA'],['KeyA','KeyW'],['KeyW'],['KeyW','KeyD']]
        names=['E','SE','S','SW','W','NW','N','NE']
        for i,keys in enumerate(moves):
            for key in keys:p.keyboard.down(key)
            p.wait_for_function('name=>WuxiaDirection.facing(__game.player.face).name===name',arg=names[i],timeout=1500)
            # Read/capture while the complete chord is held. Sequential key-up
            # events can legitimately leave one cardinal key pressed for a frame.
            d=p.evaluate('WuxiaDirection.facing(__game.player.face)');assert d['name']==names[i];facing.append(d['name'])
            p.locator('#canvas').screenshot(path=str(out/f'direction-{i}.png'))
            for key in keys:p.keyboard.up(key)
        assert len(set(facing))==8;assert p.evaluate("WuxiaDirection.facing(Math.PI/2).cell!==WuxiaDirection.facing(-Math.PI/2).cell")
        p.evaluate("()=>{const o=DualWorld.AREAS.village.points.find(o=>o.id==='master');__game.player.x=o.x;__game.player.y=o.y;}");p.keyboard.press('KeyE');expect(p.locator('#dialog')).to_be_visible();assert p.locator('#portrait').get_attribute('data-portrait')=='master';p.screenshot(path=str(out/'master-portrait.png'));dismiss(p);results.append('eight distinct facing views and painted NPC portrait')
        # Three causes use actual Q/R input against the timed pulse; no direct rescue API.
        for path in ['ripple','echo','seal']:
            print('BEGIN',path,flush=True)
            ctx2,p2=context(viewport={'width':1440,'height':900});load(p2,args.url);new_game(p2);resolve(p2,path);print('resolved',path,flush=True)
            assert not p2.evaluate('__game.blocked(775,600,16)');assert p2.evaluate('__game.fate.path')==path
            p2.wait_for_timeout(120);p2.screenshot(path=str(out/f'bridge-{path}.png'))
            p2.evaluate("()=>{__game.enemies.filter(e=>!e.boss).forEach(e=>__game.strike(e,99999,'storm'));const e=__game.enemies.find(e=>e.boss);__game.strike(e,99999,'storm');}")
            p2.wait_for_function('__game.chapter4.phase===2')
            expect(p2.locator('#dialog')).to_be_visible();expect(p2.locator('#dialogTitle')).to_have_text('제4장 · 길을 남긴 사람');dismiss(p2)
            p2.evaluate("()=>{__game.enter('village');__game.events=[];const o=DualWorld.AREAS.village.points.find(o=>o.id==='returned-yeonhwa');Object.assign(__game.player,{x:o.x,y:o.y+20});}")
            p2.keyboard.press('KeyE');expect(p2.locator('#dialog')).to_be_visible();assert '가게' in p2.locator('#dialogBody').inner_text();assert p2.locator('#portrait').get_attribute('data-portrait')=='yeonhwa'
            if path=='ripple':p2.screenshot(path=str(out/'returned-npc.png'))
            dismiss(p2);p2.evaluate("()=>{__game.enter('returnDock');__game.events=[];Object.assign(__game.player,{x:750,y:610});}");p2.wait_for_timeout(200);p2.screenshot(path=str(out/f'dock-{path}.png'));assert not errors,errors
            assert 'NPC 시뮬레이션' in p2.locator('#rumorPanel').inner_text();assert '실제 유저 채팅 아님' in p2.locator('#rumorPanel').inner_text();assert p2.locator('.rumor-entry').count()>1
            p2.evaluate("()=>{__game.enemies.filter(e=>!e.boss).forEach(e=>__game.strike(e,99999,'storm'));__game.strike(__game.enemies.find(e=>e.boss),99999,'storm');}");p2.wait_for_function('__game.chapter4.phase===3')
            expect(p2.locator('#dialog')).to_be_visible();expect(p2.locator('#dialogTitle')).to_have_text('건너온 울림 · 귀환 부두 안정');dismiss(p2)
            p2.evaluate("()=>{__game.enter('city');__game.events=[];const o=DualWorld.AREAS.city.points.find(o=>o.id==='warden');Object.assign(__game.player,{x:o.x,y:o.y});}");p2.keyboard.press('KeyE');p2.wait_for_function('__game.chapter4.phase===4');dismiss(p2)
            # Menu/continue through native storage in HTTP or equivalent offline snapshot.
            p2.locator('#menu').click();p2.get_by_role('button',name='타이틀로',exact=True).click();p2.locator('#continue').click();p2.wait_for_function('__game.chapter4.phase===4');assert p2.evaluate('__game.chapter4.route')==path
            print('complete',path,flush=True);results.append(f'{path}: timed skill rescue, open collision, returned NPC, new battle, ending, save/continue');ctx2.close()
        # News never asks the player to believe in a populated online server; closable.
        p.locator('#rumorToggle').click();expect(p.locator('#rumorContent')).not_to_be_visible();p.locator('#rumorToggle').click();expect(p.locator('#rumorContent')).to_be_visible();results.append('truthful NPC news disclosure and close/open')
        ctx.close()
        for w,h in [(390,844),(360,640),(844,390)]:
            print('MOBILE',w,h,flush=True)
            ctx,p=context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True,device_scale_factor=1);load(p,args.url);new_game(p)
            p.evaluate("()=>{const g=__game;g.progress=12;g.training=3;Object.assign(g.fate,{stage:6,path:'seal',discovered:['seal'],proven:['seal'],focus:100});g.enter('village');g.events=[];Object.assign(g.player,{x:650,y:610});}");p.wait_for_timeout(100)
            selectors=['#stick','[data-action=attack]','[data-action=signature1]','[data-action=signature2]','[data-action=ultimate]','#potion','#interact','#rumorToggle','#fateJournal','#inventory'];boxes={}
            for s in selectors:
                a=p.locator(s).bounding_box();assert a and a['width']>=28 and a['height']>=28,(w,h,s,a);assert a['x']>=-.5 and a['y']>=-.5 and a['x']+a['width']<=w+1 and a['y']+a['height']<=h+1,(w,h,s,a);boxes[s]=a
            for i,s in enumerate(selectors):
                for z in selectors[i+1:]:
                    a,bb=boxes[s],boxes[z];ox=min(a['x']+a['width'],bb['x']+bb['width'])-max(a['x'],bb['x']);oy=min(a['y']+a['height'],bb['y']+bb['height'])-max(a['y'],bb['y']);assert ox<=0 or oy<=0,('overlap',w,h,s,z)
            a,q=boxes['#stick'],boxes['[data-action=signature1]'];sx=a['x']+a['width']/2;sy=a['y']+a['height']/2;qx=q['x']+q['width']/2;qy=q['y']+q['height']/2;cdp=ctx.new_cdp_session(p)
            def touch(x,y,i):return {'x':x,'y':y,'id':i,'radiusX':2,'radiusY':2,'force':1}
            x=p.evaluate('__game.player.x');cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[touch(sx,sy,1)]});cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[touch(sx+22,sy,1)]});cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[touch(sx+22,sy,1),touch(qx,qy,2)]});p.wait_for_function('x=>__game.player.x>x+20',arg=x);assert p.evaluate('__game.player.cool.signature1')>0
            cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});p.wait_for_timeout(70);x=p.evaluate('__game.player.x');p.wait_for_timeout(180);assert abs(p.evaluate('__game.player.x')-x)<.1
            p.locator('#rumorToggle').tap();expect(p.locator('#dialog')).to_be_visible();assert '실제 유저' in p.locator('#dialogBody').inner_text();p.get_by_role('button',name='돌아가기',exact=True).click();expect(p.locator('#dialog')).not_to_be_visible();p.screenshot(path=str(out/f'mobile-{w}x{h}.png'));assert not errors,errors;results.append(f'{w}x{h}: controls, multi-touch, cancel, NPC news');ctx.close()
        b.close()
    result={'passed':len(results),'mode':'HTTP / native storage' if args.url else 'offline document / storage shim','checks':results,'page_errors':errors};(out/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
