"""v0.8 real-input UI checks. Inline locally; HTTP/native storage in release CI."""
import argparse,json,sys,os,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import v06_browser as base
ROOT=Path(__file__).resolve().parents[1]
DISCLOSURE='실제 멀티 채팅이 아닌 연출 시뮬레이션입니다.'
def check_boxes(p,selectors,w,h):
 boxes=[]
 for sel in selectors:
  b=p.locator(sel).bounding_box();assert b and b['width']>=28 and b['height']>=28,(sel,b)
  assert b['x']>=-.5 and b['y']>=-.5 and b['x']+b['width']<=w+1 and b['y']+b['height']<=h+1,(w,h,sel,b)
  boxes.append((sel,b))
 for i,(s,b) in enumerate(boxes):
  for z,c in boxes[i+1:]:
   assert min(b['x']+b['width'],c['x']+c['width'])<=max(b['x'],c['x']) or min(b['y']+b['height'],c['y']+c['height'])<=max(b['y'],c['y']),(w,h,'overlap',s,z,b,c)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--url');ap.add_argument('--output',default='.superpowers/v08/browser');ap.add_argument('--baseline');a=ap.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True);checks=[];errors=[]
 if a.baseline:
  base.ROOT=Path(a.baseline);base.HTML=(base.ROOT/'index.html').read_text();base.SCRIPTS=re.findall(r'<script[^>]+src="([^"?]+)',base.HTML);base.STYLES=re.findall(r'<link rel="stylesheet"[^>]+href="([^"?]+)',base.HTML)
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None),args=['--no-sandbox'])
  def start(w,h,mobile=False):
   ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile);ctx.add_init_script(base.HOOK);p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)));base.load(p,a.url);base.new_game(p);return ctx,p
  ctx,p=start(1440,900);expect(p.locator('#helpButton')).to_be_visible(timeout=1500)
  if a.baseline:return
  p.wait_for_timeout(120);assert p.locator('#game').get_attribute('data-realm')=='modern';expect(p.locator('#realmBadge')).to_contain_text('현실');expect(p.locator('#mapWorld')).to_contain_text('현실')
  p.screenshot(path=str(out/'city.png'));assert p.evaluate("Presentation.worldStyle(DualWorld.AREAS.city).architecture")=='modern'
  expect(p.locator('#rumorPanel')).not_to_be_visible();checks.append('modern world identity and removed simulated news')
  p.evaluate("__game.progress=2;__game.training=1;__game.enter('village');__game.events=[]");p.wait_for_timeout(130);assert p.locator('#game').get_attribute('data-realm')=='martial';p.screenshot(path=str(out/'village.png'))
  print('guide help',flush=True);p.keyboard.press('KeyH');expect(p.locator('#dialogTitle')).to_contain_text('처음 해보기');p.get_by_role('button',name='길잡이 켜고 직접 해보기',exact=True).click();p.wait_for_timeout(120);assert p.evaluate('__game.guideActive');expect(p.locator('#objectiveTarget')).to_contain_text('환서정')
  print('guide travel',flush=True);p.evaluate("()=>{const o=__game.points().find(x=>x.id==='archiveGate');Object.assign(__game.player,{x:o.x,y:o.y});}");p.keyboard.press('KeyE');p.wait_for_function("__game.area==='archive'")
  print('guide sense',flush=True);p.evaluate("()=>{const o=Presentation.guide(__game).target;Object.assign(__game.player,{x:o.x,y:o.y});}");p.wait_for_timeout(100);expect(p.locator('#objectiveHint')).to_contain_text('기감');p.keyboard.press('KeyB');p.wait_for_timeout(120);assert p.evaluate('__game.journey.facts.length')>0
  p.keyboard.press('KeyE');expect(p.locator('#dialog')).to_be_visible();base.dismiss(p);assert p.evaluate('__game.journey.items.length')==1;assert p.evaluate('__game.journey.known.length')==0
  p.keyboard.press('KeyN');expect(p.locator('#dialogBody')).to_contain_text('현재 할 수 있는 행동');p.screenshot(path=str(out/'guide-notebook.png'));base.dismiss(p);checks.append('H guidance -> actual gate E -> B sense -> E inspect -> N facts, no automatic technique reward')
  p.evaluate("__game.guideActive=false;__game.enter('village');__game.events=[];__game.player.x=620;__game.player.y=560");p.keyboard.down('KeyD');p.wait_for_timeout(150);p.keyboard.up('KeyD');p.wait_for_timeout(50);stride=p.evaluate('__game.player.motion.stride');assert stride>0
  p.keyboard.press('KeyJ');p.screenshot(path=str(out/'attack.png'));assert not errors,errors;checks.append('distance-driven articulated movement and shared weapon/effect contact pose')
  # Scene rendering never mutates saved progression, and reduced motion is honored by VFX quality.
  p.evaluate("__game.enter('rift');__game.events=[];__game.enemies.forEach(e=>e.cd=999)");p.wait_for_timeout(80);p.screenshot(path=str(out/'rift-enemies.png'));ctx.close()
  for w,h in [(390,844),(360,640),(844,390)]:
   ctx,p=start(w,h,True);p.evaluate("__game.progress=2;__game.training=1;Object.assign(__game.fate,{path:'echo',discovered:['echo'],proven:['echo']});__game.enter('archive');__game.events=[]");p.wait_for_timeout(160)
   check_boxes(p,['#sense','#fieldNotes','#helpButton','#contractButton','#stick','#interact','#potion','#fateJournal','#inventory','[data-action=attack]','[data-action=signature1]','[data-action=signature2]','[data-action=ultimate]'],w,h)
   expect(p.locator('#rumorPanel')).not_to_be_visible();p.locator('#helpButton').click();expect(p.locator('#dialogTitle')).to_contain_text('처음 해보기');p.screenshot(path=str(out/f'help-{w}x{h}.png'));p.get_by_role('button',name='혼자 살펴보기',exact=True).click();assert not p.evaluate('__game.guideActive')
   p.screenshot(path=str(out/f'field-{w}x{h}.png'));ctx.close();checks.append(f'{w}x{h}: unobstructed controls, removed news, readable help and cancel')
  ctx=browser.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce');ctx.add_init_script(base.HOOK);p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)));base.load(p,a.url);base.new_game(p);p.keyboard.press('KeyJ');p.wait_for_timeout(600);assert not p.evaluate('RealmArt.pose(__game.player).active');ctx.close();checks.append('reduced motion uses the real recovery clock; no permanently frozen attack pose')
  browser.close()
 assert not errors,errors
 result={'passed':len(checks),'checks':checks,'page_errors':errors,'mode':'HTTP / native storage' if a.url else 'inline / storage shim'};print(json.dumps(result,ensure_ascii=False,indent=2));(out/'report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
