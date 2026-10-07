const assert=require('node:assert/strict'),{run}=require('./browser-harness.cjs');
run(async p=>{
 assert.equal(await p.locator('#recordsMenu').count(),0,'records entry is removed');
 for(const id of ['sense','fieldNotes'])assert.equal(await p.locator('#'+id).isVisible(),false);
 await p.evaluate(()=>{const s=CycleOne.state(__game);s.returnReceipt=s.recordDelivered=s.invited=true;__game.events=[];});
 await p.keyboard.press('Tab');assert.equal(await p.locator('#dialog').evaluate(d=>d.open),false,'old notebook shortcut cannot reopen removed content');
 await p.click('#helpButton');
 assert.doesNotMatch(await p.locator('#dialog').innerText(),/관찰 수첩|무공 해석|해석 장착|길잡이 켜고/);
 assert.match(await p.locator('#dialog').innerText(),/임무|캐릭터|심법/);await p.keyboard.press('Escape');
 await p.evaluate(()=>__game.emit('interpretation',{key:'ripple-guard',title:'이전 해석',text:'이전 저장의 발견 이벤트'}));
 await p.waitForFunction(()=>!__game.events.length);
 assert.equal(await p.locator('#dialog').evaluate(d=>d.open),false,'legacy discovery event does not open removed content');
 await p.click('#menu');await p.getByRole('button',{name:'입력 설정',exact:true}).click();
 assert.doesNotMatch(await p.locator('.control-settings').innerText(),/관찰 수첩|기감/);
 await p.keyboard.press('Escape');for(const [width,height]of [[360,640],[844,390]]){await p.setViewportSize({width,height});assert.equal(await p.locator('#personalNews').isVisible(),true,'mobile keeps direct access to earned resource notices');}
 await p.click('#missionsMenu');await p.getByRole('button',{name:'공명 도전',exact:true}).click();assert.equal(await p.getByRole('button',{name:'도전 기록',exact:true}).count(),0);assert.doesNotMatch(await p.locator('.resonance-screen').innerText(),/도전 기록|영구 기록|최근 2회/);
 console.log('Removed records, shortcuts, help and legacy discovery popup remain inaccessible');
}).catch(e=>{console.error(e);process.exitCode=1;});
