"""Discovery + fifth chapter UI checks; fixtures arrange actors, inputs use the real DOM.
HTTP/native storage in CI, optional inline mode for restricted local environments.
"""
import argparse,json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from v06_browser import HOOK,load,new_game,dismiss
ROOT=Path(__file__).resolve().parents[1]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--url');ap.add_argument('--red',action='store_true');ap.add_argument('--output',default='.superpowers/v07/screens');a=ap.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True);results=[];errors=[]
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None),args=['--no-sandbox'])
  ctx=b.new_context(viewport={'width':1440,'height':900});ctx.add_init_script(HOOK);p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)));load(p,a.url);new_game(p)
  expect(p.locator('#fieldNotes')).to_be_visible(timeout=1500)
  if a.red:return
  p.evaluate("()=>{const g=__game;g.progress=2;g.training=1;g.enter('archive');g.events=[];const o=g.points().find(o=>o.id==='relic-echo');Object.assign(g.player,{x:o.x,y:o.y,face:0});}")
  p.keyboard.press('KeyB');p.wait_for_function("__game.journey.facts.some(f=>f.id==='sense-echo')")
  p.keyboard.press('KeyE');expect(p.locator('#dialog')).to_be_visible();assert p.evaluate("__game.journey.items.includes('echo')");assert not p.evaluate('__game.journey.known.length');dismiss(p)
  p.evaluate("()=>{const g=__game;g.experimentRuntime.pulse={path:'echo',x:g.player.x,y:g.player.y,wind:1.5,max:1.5};g.player.cool.dash=0;g.player.face=0;}")
  p.keyboard.press('Space');p.wait_for_function('__game.experimentRuntime.echo?.moved');p.keyboard.press('KeyJ');p.wait_for_function("__game.journey.known.includes('echo-replay')")
  expect(p.locator('#dialogTitle')).to_contain_text('이름보다');p.screenshot(path=str(out/'first-interpretation.png'));p.get_by_role('button',name='지금은 발견만 기록한다',exact=True).click()
  p.keyboard.press('KeyN');expect(p.locator('#dialogTitle')).to_contain_text('관찰 수첩');p.get_by_role('button',name='다른 여정',exact=True).click();assert '시뮬레이션' in p.locator('#dialogBody').inner_text();assert '실제 유저' in p.locator('#dialogBody').inner_text();p.screenshot(path=str(out/'other-journeys.png'));dismiss(p)
  results.append('sense -> real item -> dash and remote slash -> voluntary discovered interpretation; labeled rumors')
  # Arrange a valid advanced save; create chapter4 via its real interactions.
  p.evaluate("""()=>{const g=__game;g.progress=12;g.training=3;g.level=12;Object.assign(g.fate,{stage:6,path:'echo',proven:['echo'],discovered:['echo']});g.enter('city');const at=id=>Object.assign(g.player,g.points().find(o=>o.id===id));at('warden');g.interact();g.enter('returnPass');for(const e of g.enemies.filter(e=>!e.boss))g.strike(e,999999);at('winch');g.interact();for(const e of g.enemies)g.strike(e,999999);g.enter('returnDock');for(const e of g.enemies)g.strike(e,999999);g.enter('city');at('warden');g.interact();g.events=[];}""")
  p.keyboard.press('KeyE');expect(p.locator('#dialogTitle')).to_contain_text('기록에 없는');dismiss(p)
  p.evaluate("()=>{__game.enter('archive');__game.events=[];}");p.keyboard.press('KeyN');p.get_by_role('button',name='무공 해석',exact=True).click();p.get_by_role('button',name='먹향 · 재현검 이어가기',exact=True).click();assert p.evaluate('__game.journey.phase')==2;dismiss(p)
  p.evaluate("()=>{__game.enter('city');__game.events=[];Object.assign(__game.player,__game.points().find(o=>o.id==='warden'));}");p.keyboard.press('KeyE');dismiss(p);assert p.evaluate('__game.journey.phase')==3
  p.evaluate("()=>{__game.enter('station');__game.events=[];Object.assign(__game.player,__game.points().find(o=>o.id==='partner'));}");p.keyboard.press('KeyE');dismiss(p);assert p.evaluate('__game.journey.companion')
  p.evaluate("()=>{Object.assign(__game.player,__game.points().find(o=>o.id==='station-lens'));}");p.keyboard.press('KeyB');p.wait_for_function("__game.journey.facts.some(f=>f.id==='station-sense')")
  p.evaluate("()=>{const g=__game;g.enemies.forEach(e=>e.cd=99);const e=g.enemies[0];Object.assign(e,{x:850,y:620,hp:3000,maxHp:3000});Object.assign(g.player,{x:745,y:620,mp:500,face:0});g.combat.echo={x:850,y:620,life:5};g.player.cool.signature2=0;}");p.keyboard.press('KeyR');p.wait_for_function('__game.journey.measured===true',timeout=3500);p.screenshot(path=str(out/'reality-reproduction.png'))
  p.evaluate("()=>{const g=__game;for(const e of g.enemies)g.strike(e,999999);}");p.wait_for_function('__game.journey.phase===4');dismiss(p)
  p.evaluate("()=>{__game.enter('city');__game.events=[];Object.assign(__game.player,__game.points().find(o=>o.id==='warden'));}");p.keyboard.press('KeyE');expect(p.locator('#dialogBody')).to_contain_text('C급 현장 인증');dismiss(p)
  p.locator('#menu').click();p.get_by_role('button',name='타이틀로',exact=True).click();p.locator('#continue').click();assert p.evaluate('__game.journey.phase')==5;assert p.evaluate('__game.journey.seed')>0;assert not errors,errors
  results.append('chapter5 real UI: legacy finish -> choice -> ally -> sense -> delayed skill -> certification -> save/continue')
  ctx.close()
  for w,h in [(390,844),(360,640),(844,390)]:
   ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=2,is_mobile=True,has_touch=True);ctx.add_init_script(HOOK);p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)));load(p,a.url);new_game(p)
   p.evaluate("()=>{__game.progress=2;__game.training=1;Object.assign(__game.fate,{path:'echo',proven:['echo'],discovered:['echo']});__game.enter('archive');__game.events=[];}");p.wait_for_timeout(180)
   selectors=['#objective','#sense','#fieldNotes','#stick','#interact','#potion','[data-action=attack]','[data-action=signature1]','[data-action=signature2]','[data-action=ultimate]'];boxes=[]
   for sel in selectors:
    x=p.locator(sel).bounding_box();assert x and x['width']>=32 and x['height']>=30,(w,h,sel,x);assert x['x']>=0 and x['y']>=0 and x['x']+x['width']<=w+1 and x['y']+x['height']<=h+1,(w,h,sel,x);boxes.append((sel,x))
   for i,(name,x) in enumerate(boxes):
    for other,y in boxes[i+1:]:assert min(x['x']+x['width'],y['x']+y['width'])<=max(x['x'],y['x']) or min(x['y']+x['height'],y['y']+y['height'])<=max(x['y'],y['y']),(w,h,name,other,x,y)
   p.locator('#sense').click();assert p.evaluate('__game.player.cool.sense')>0;p.locator('#fieldNotes').click();expect(p.locator('#dialog')).to_be_visible();p.get_by_role('button',name='성장 · 준비',exact=True).click();p.screenshot(path=str(out/f'notes-{w}x{h}.png'));x=p.locator('#dialog').bounding_box();assert x['x']>=0 and x['y']>=0 and x['y']+x['height']<=h+1
   dismiss(p);p.screenshot(path=str(out/f'archive-{w}x{h}.png'));assert not errors,errors;results.append(f'{w}x{h}: sense and notes controls nonoverlapping; responsive paused journal');ctx.close()
  b.close()
 (out/'results.json').write_text(json.dumps({'mode':'HTTP/native storage' if a.url else 'inline/shim','passed':len(results),'checks':results,'page_errors':errors},ensure_ascii=False,indent=2));print(json.dumps({'passed':len(results),'checks':results,'errors':errors},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
