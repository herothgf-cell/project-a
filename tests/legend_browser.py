"""v0.5: actual field input -> manifestation -> voluntary awakening, plus art/viewport.
Uses a DOM-free model fixture for encounters, not production debug hooks. Offline
mode has inline assets and a storage shim; CI uses HTTP/native storage instead.
"""
import argparse,json,os,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from browser_smoke import INSTRUMENT
ROOT=Path(__file__).resolve().parents[1]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--url');ap.add_argument('--red',action='store_true');ap.add_argument('--output',default='.superpowers/v05/screens');a=ap.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True);checks=[];errors=[]
 with sync_playwright() as pw:
  launch={'args':['--no-sandbox']}
  if os.environ.get('CHROMIUM_PATH'):launch['executable_path']=os.environ['CHROMIUM_PATH']
  elif not a.url and Path('/usr/bin/chromium').exists():launch['executable_path']='/usr/bin/chromium'
  browser=pw.chromium.launch(**launch)
  def load(page):
   page.on('pageerror',lambda e:errors.append(str(e)))
   if a.url:page.goto(a.url,wait_until='load')
   else:
    html=(ROOT/'index.html').read_text();page.goto('about:blank');page.set_content(re.sub(r'<script[^>]*>.*?</script>|<link rel="stylesheet"[^>]*>','',html,flags=re.S));page.evaluate("()=>{const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}");page.evaluate(INSTRUMENT)
    for css in re.findall(r'<link rel="stylesheet" href="([^?\"]+)',html):page.add_style_tag(content=(ROOT/css).read_text())
    for js in re.findall(r'<script defer src="([^?\"]+)',html):page.add_script_tag(content=(ROOT/js).read_text())
   page.locator('#start').click();page.locator('#dialogActions button').first.click();page.wait_for_timeout(100)
  def field(page):page.evaluate("()=>{__game.progress=2;__game.training=1;__game.enter('forest');__game.events=[];__game.player.invuln=0;}")
  def counter(page,i):
   page.evaluate("i=>{const e=__game.enemies[i];Object.assign(e,{x:650,y:650,hp:500,maxHp:500,wind:.28,windMax:1,attacks:1,tx:610,ty:650,range:90,cd:10});Object.assign(__game.player,{x:610,y:650,face:0});__game.player.cool.attack=0;__game.hitStop=0;}",i);page.keyboard.press('KeyJ');page.wait_for_timeout(60)
  ctx=browser.new_context(viewport={'width':1440,'height':900});ctx.add_init_script(INSTRUMENT);p=ctx.new_page();load(p)
  assert p.evaluate("typeof ClassicArt==='object'"),'classic illustrated runtime must be loaded'
  if a.red:return
  p.evaluate("()=>{const c=document.createElement('canvas').getContext('2d');for(const kind of ['legend-ripple','legend-echo','legend-seal'])for(const life of [1.1,.5,.001])ClassicArt.effect(c,{kind,x:200,y:200,max:1.1,life,range:170},2);}")
  p.screenshot(path=str(out/'classic-city.png'));p.evaluate("()=>{__game.enter('village');__game.events=[];}");p.wait_for_timeout(150);p.screenshot(path=str(out/'classic-village.png'))
  assert p.evaluate("document.querySelector('#canvas').getContext('2d').getImageData(10,10,1,1).data[3]")==255
  checks.append('original cached painterly terrain and live character drawing, city/village')
  field(p);counter(p,0);assert p.evaluate('__game.legend.counts.ripple')==1;assert not p.locator('#dialog').is_visible(),p.locator('#dialogBody').inner_text();p.screenshot(path=str(out/'first-manifestation.png'));counter(p,1)
  expect(p.get_by_role('button',name='이 호흡을 붙잡는다',exact=True)).to_be_visible();assert '흑풍 죽림' in p.locator('#dialogBody').inner_text();assert '흑풍 산적' in p.locator('#dialogBody').inner_text();assert p.evaluate('__game.fate.path') is None
  p.screenshot(path=str(out/'field-awakening.png'));p.get_by_role('button',name='이 호흡을 붙잡는다',exact=True).click();p.locator('#dialogActions button').first.click();assert p.evaluate('__game.area')=='forest';assert p.evaluate('__game.fate.path')=='ripple';p.keyboard.press('KeyQ');assert p.evaluate('__game.player.cool.signature1')>0
  checks.append('real keyboard counters reveal field choice, no mentor required, Q usable in same encounter')
  p.locator('#fateJournal').click();assert '내가 남긴 기억' in p.locator('#dialogBody').inner_text();assert '흑풍 산적' in p.locator('#dialogBody').inner_text();p.locator('#closeDialog').click();assert not errors,errors;ctx.close()
  checks.append('journal records the actual place, adversary and action rather than invented biography')
  for w,h in [(390,844),(360,640),(844,390)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=2,is_mobile=True,has_touch=True);ctx.add_init_script(INSTRUMENT);p=ctx.new_page();load(p);field(p);counter(p,0);counter(p,1);expect(p.locator('#dialog')).to_be_visible();b=p.locator('#dialog').bounding_box();assert b['x']>=0 and b['y']>=0 and b['x']+b['width']<=w+1 and b['y']+b['height']<=h+1,(w,h,b)
   p.get_by_role('button',name='지금은 이 감각만 기억한다',exact=True).click();assert p.evaluate('__game.fate.path') is None;p.locator('#fateJournal').click();p.get_by_role('button',name='파문검 · 내 호흡으로',exact=True).click();p.locator('#dialogActions button').first.click()
   boxes=[]
   for sel in ['#stick','[data-action=attack]','[data-action=signature1]','[data-action=signature2]','[data-action=ultimate]','#interact','#potion']:
    b=p.locator(sel).bounding_box();assert b and b['width']>=32 and b['height']>=30 and b['x']>=0 and b['y']>=0 and b['x']+b['width']<=w+1 and b['y']+b['height']<=h+1,(w,h,sel,b);boxes.append((sel,b))
   for i,(s,x) in enumerate(boxes):
    for t,y in boxes[i+1:]:assert min(x['x']+x['width'],y['x']+y['width'])<=max(x['x'],y['x']) or min(x['y']+x['height'],y['y']+y['height'])<=max(x['y'],y['y']),(w,h,s,t)
   p.screenshot(path=str(out/f'classic-mobile-{w}x{h}.png'));assert not errors,errors;checks.append(f'{w}x{h}: readable field-choice dialog, defer/reopen, unoccluded combat controls');ctx.close()
  browser.close()
 (out/'legend-results.json').write_text(json.dumps({'mode':'HTTP native storage' if a.url else 'inline assets / storage shim','passed':len(checks),'checks':checks,'page_errors':errors},ensure_ascii=False,indent=2));print(json.dumps({'passed':len(checks),'checks':checks},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
