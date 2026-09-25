"""v0.4 integration checks. HTTP in CI, offline local document where networking is unavailable.
Model fixtures position actors and prime encounters; user inputs exercise actual DOM handlers.
No production debug API is added. This is not a real-device certification.
"""
import argparse,json,os,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from browser_smoke import INSTRUMENT
ROOT=Path(__file__).resolve().parents[1]
FILES=['world.js','fate.js','game.js','art.js','fate-art.js','render.js','app.js']
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--url');parser.add_argument('--output',default='.superpowers/v04/fate-screens');parser.add_argument('--red',action='store_true');args=parser.parse_args();out=Path(args.output);out.mkdir(parents=True,exist_ok=True);checks=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,args=['--no-sandbox']);errors=[]
  def load(page):
   page.on('pageerror',lambda e:errors.append(str(e)))
   if args.url:page.goto(args.url,wait_until='load')
   else:
    page.goto('about:blank');page.set_content(re.sub(r'<script[^>]*>.*?</script>|<link rel="stylesheet"[^>]*>','',(ROOT/'index.html').read_text(),flags=re.S));page.evaluate("()=>{const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}");page.evaluate(INSTRUMENT);page.add_style_tag(content=(ROOT/'style.css').read_text());
    for f in FILES:
     if (ROOT/f).exists():page.add_script_tag(content=(ROOT/f).read_text())
   page.locator('#start').click();page.locator('#dialogActions button').first.click();page.wait_for_timeout(80)
  def dismiss(page):
   if page.locator('#dialog').is_visible():page.locator('#dialogActions button').first.click()
  def at(page,id):
   page.evaluate("id=>{const p=DualWorld.AREAS[__game.area].points.find(p=>p.id===id);__game.player.x=p.x;__game.player.y=p.y;}",id);page.keyboard.press('KeyE');page.wait_for_timeout(80)
  for path in ['ripple','echo','seal']:
   ctx=browser.new_context(viewport={'width':1440,'height':900});ctx.add_init_script(INSTRUMENT);p=ctx.new_page();load(p)
   expect(p.locator('#fateJournal')).to_be_visible(timeout=1000)
   if args.red:return
   p.evaluate("()=>{__game.progress=12;__game.training=3;__game.level=8;__game.enter('city');__game.events=[];}");at(p,'warden');dismiss(p);at(p,'portal');dismiss(p);at(p,'master');dismiss(p);at(p,'sanctum');at(p,'relic-'+path)
   p.get_by_role('button',name='공명 시험 시작',exact=True).click();dismiss(p);expect(p.locator('#fateControls')).to_be_visible();assert p.evaluate('__game.fate.path') is None
   p.evaluate("()=>{const e=__game.enemies[0];__game.player.x=e.x-45;__game.player.y=e.y;__game.player.face=0;__game.player.invuln=0;e.cd=10;e.wind=.18;e.windMax=1.3;e.tx=__game.player.x;e.ty=__game.player.y;e.range=110;}")
   p.keyboard.press('KeyQ');p.wait_for_timeout(250)
   if path=='echo':p.keyboard.press('KeyR');p.wait_for_timeout(80)
   assert p.evaluate('__game.trial.feat'),path
   p.evaluate("()=>{const e=__game.enemies[0];__game.strike(e,e.hp,'attack');}");p.wait_for_timeout(90);p.get_by_role('button',name='거점으로 귀환',exact=True).click();at(p,'master');p.get_by_role('button',name={'ripple':'파문검','echo':'잔영보','seal':'경계봉인'}[path]+' 수락',exact=True).click();dismiss(p)
   assert p.evaluate('__game.fate.path')==path;at(p,'portal');dismiss(p);at(p,'warden');dismiss(p);at(p,'heart');p.wait_for_timeout(100)
   p.evaluate("()=>{const e=__game.enemies[0];__game.player.x=e.x-60;__game.player.y=e.y;__game.fate.focus=100;}");p.keyboard.press('KeyF');p.wait_for_timeout(60)
   assert not p.locator('#areaBanner').evaluate("e=>e.classList.contains('show')"),'ultimate and area banner must not overlap';assert p.evaluate('__game.player.cool.ultimate')>0;expect(p.locator('#ultimateBanner')).to_have_class(re.compile('show'));p.screenshot(path=str(out/f'ultimate-{path}.png'))
   p.locator('#fateJournal').click();assert {'ripple':'파문검','echo':'잔영보','seal':'경계봉인'}[path] in p.locator('#dialogBody').inner_text();p.locator('#closeDialog').click();assert not errors,errors
   checks.append(path+': discovery, real signature proof, acceptance, world transfer, ultimate and journal');ctx.close()
  for w,h in [(390,844),(360,640),(844,390)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=2,is_mobile=True,has_touch=True);ctx.add_init_script(INSTRUMENT);p=ctx.new_page();load(p)
   p.evaluate("()=>{__game.progress=12;__game.training=3;Object.assign(__game.fate,{stage:4,path:'seal',discovered:['seal'],proven:['seal']});__game.enter('heart');__game.events=[];__game.fate.focus=100;}");p.wait_for_timeout(150)
   selectors=['#stick','[data-action=attack]','[data-action=signature1]','[data-action=signature2]','[data-action=ultimate]','#interact','#potion']
   boxes={}
   for s in selectors:
    b=p.locator(s).bounding_box();assert b and b['width']>=32 and b['height']>=30,(w,h,s,b);assert b['x']>=0 and b['y']>=0 and b['x']+b['width']<=w+1 and b['y']+b['height']<=h+1,(w,h,s,b);boxes[s]=b
   for i,s in enumerate(selectors):
    for t in selectors[i+1:]:
     a,b=boxes[s],boxes[t];ow=min(a['x']+a['width'],b['x']+b['width'])-max(a['x'],b['x']);oh=min(a['y']+a['height'],b['y']+b['height'])-max(a['y'],b['y']);assert ow<=0 or oh<=0,('overlap',w,h,s,t)
   cdp=ctx.new_cdp_session(p);s=boxes['#stick'];q=boxes['[data-action=signature1]'];sx=s['x']+s['width']/2;sy=s['y']+s['height']/2;qx=q['x']+q['width']/2;qy=q['y']+q['height']/2
   def touch(x,y,id):return {'x':x,'y':y,'id':id,'radiusX':2,'radiusY':2,'force':1}
   start=p.evaluate('__game.player.x');cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[touch(sx,sy,1)]});cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[touch(sx+25,sy,1)]});cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[touch(sx+25,sy,1),touch(qx,qy,2)]});p.wait_for_timeout(400);assert p.evaluate('__game.player.x')>start+20;assert p.evaluate('__game.player.cool.signature1')>0
   cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});p.wait_for_timeout(70);x=p.evaluate('__game.player.x');p.wait_for_timeout(180);assert abs(p.evaluate('__game.player.x')-x)<.1
   p.locator('[data-action=ultimate]').tap();p.wait_for_timeout(100);assert p.evaluate('__game.player.cool.ultimate')>0;p.screenshot(path=str(out/f'mobile-{w}x{h}.png'));assert not errors,errors;checks.append(f'{w}x{h}: unobstructed controls, touch+signature, cancellation, ultimate');ctx.close()
  ctx=browser.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce');ctx.add_init_script(INSTRUMENT);p=ctx.new_page();load(p);p.evaluate("()=>{__game.progress=12;__game.training=3;__game.fate.stage=2;__game.enter('sanctum');__game.events=[];}");p.wait_for_timeout(150);p.screenshot(path=str(out/'sanctum-low.png'));assert not errors,errors;checks.append('reduced motion and sanctum render');ctx.close();browser.close()
  result={'passed':len(checks),'mode':'HTTP / native storage' if args.url else 'offline document / storage shim','checks':checks,'page_errors':errors};(out/'fate-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
