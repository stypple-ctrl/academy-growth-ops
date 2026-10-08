const assert=require('node:assert/strict'),G=require('./model.js');
const db=G.seed(),task={...db.tasks[0],secondaryRequired:false};db.tasks=[task];
G.result(db,task,'결과','조교',24);
assert.equal(task.open,false,'선택 복습만 남으면 필수 과제 완료');assert.equal(task.status,'완료');assert.equal(Boolean(task.secondaryDone),false);
const count=db.events.length;G.result(db,task,'귀가','조교');assert.equal(task.open,false);assert(!task.notification);assert.equal(db.events.length,count);
G.result(db,task,'복습완료','조교');assert(task.secondaryDone);const done=db.events.length;G.result(db,task,'복습완료','조교');assert.equal(db.events.length,done);
for(const flag of [true,undefined]){const d=G.seed(),t={...d.tasks[0]};if(flag!==undefined)t.secondaryRequired=flag;G.result(d,t,'결과','조교',24);assert(t.open);G.result(d,t,'귀가','조교');assert.equal(t.notification,'검토 필요');}
const failed=G.seed(),ft={...failed.tasks[0],secondaryRequired:false};G.result(failed,ft,'결과','조교',23);assert(ft.open);G.result(failed,ft,'귀가','조교');assert.equal(ft.notification,'검토 필요');G.result(failed,ft,'結果','조교',24); // unknown operations must not change state
G.result(failed,ft,'결과','조교',24);assert.equal(ft.notification,'취소됨');assert(!ft.open);
const {boot}=require('./test-storage.cjs');
const a=boot();a.run("role='교사';selected=new Set([1]);form('assign')");assert.match(a.node('overlay').innerHTML,/id="secondaryRequired"/);
a.node('reason').value='단어 FAIL';a.node('primary').value='재시험';a.node('secondary').value='복습';a.node('secondaryRequired').value='optional';a.submit('assign');assert.equal(a.run('db.tasks.at(-1).secondaryRequired'),false);
const id=a.run('db.tasks.at(-1).id');a.run("role='조교';page='board'");a.node('score-'+id).value='24';const before=a.run('JSON.stringify(db)');a.store.fail=true;a.click('task',id,'결과');assert.equal(a.run('JSON.stringify(db)'),before);a.store.fail=false;a.click('task',id,'결과');assert.equal(a.run('db.tasks.at(-1).open'),false);assert.match(a.node('app').innerHTML,/선택 복습 잔여/);
a.click('task',id,'복습완료');assert.equal(a.run('db.tasks.at(-1).secondaryDone'),true);
a.run("role='교사';selected=new Set([2]);form('assign')");a.node('secondaryRequired').value='required';a.submit('assign');assert.equal(a.run('db.tasks.at(-1).secondaryRequired'),true);
const b=boot();b.run("db.tasks=[{...db.tasks[0],secondaryRequired:false}];save();role='조교';page='board'");b.node('score-1').value='24';b.click('task',1,'결과');b.run("role='원장';page='dashboard';render()");assert.match(b.node('app').innerHTML,/완료 1 ÷ 전체 1 × 100/);b.run("page='board';render()");assert.match(b.node('app').innerHTML,/<b>0<\/b>명 관리 중/);
console.log('PASS: 선택/필수/과거 과제 호환, 23/24 경계·복습 별도 처리·중복 방지, 알림 취소, 지정 UI·저장 실패·집계 연결');
const sent=boot();sent.run("db.tasks=[{...db.tasks[0],secondaryRequired:false}];save();role='조교';page='board'");sent.click('task',1,'귀가');sent.run("role='원장'");sent.click('notify-review',1);sent.click('notify-send',1);const sentAt=sent.run('db.tasks[0].sentAt');sent.node('score-1').value='24';sent.click('task',1,'결과');assert.equal(sent.run('db.tasks[0].notification'),'후속 확인 필요');assert.equal(sent.run('db.tasks[0].sentAt'),sentAt);sent.run("page='notifications';render()");assert(!sent.node('app').innerHTML.includes('data-action="notify-send"'));sent.click('notify-send',1);assert.equal(sent.run('db.tasks[0].notification'),'후속 확인 필요');
const pending=boot();pending.run("db.tasks=[{...db.tasks[0],secondaryRequired:false}];save();role='조교';page='board'");pending.click('task',1,'귀가');pending.run("role='원장'");pending.click('notify-review',1);pending.node('score-1').value='24';pending.click('task',1,'결과');assert.equal(pending.run('db.tasks[0].notification'),'취소됨');pending.run("page='notifications';render()");assert(!pending.node('app').innerHTML.includes('data-action="notify-send"'));pending.click('notify-review',1);assert.equal(pending.run('db.tasks[0].notification'),'취소됨');
const restore=boot(a.store.value);assert.equal(restore.run('db.tasks.find(t=>t.secondaryRequired===false).open'),false);assert.equal(restore.run('db.tasks.at(-1).secondaryRequired'),true);
console.log('PASS: 승인 후 완료 시 안내 취소, 모의 발송 시각 보존·후속 확인, 오래된 승인/발송 버튼 차단, 재조회 정책 보존');
const required=G.seed(),rt={...required.tasks[0],secondaryRequired:true};G.result(required,rt,'귀가','조교');rt.notification='승인 완료';rt.reviewedBy='교사';G.result(required,rt,'결과','조교',24);assert.equal(rt.notification,'검토 필요','기본 과제 해소 후 필수 추가 과제 안내는 다시 검토');assert.equal(rt.notificationBody,rt.secondary+' 미완료 · 다음 등원 이월');
console.log('PASS: 필수 과제 안내 내용이 바뀌면 이전 승인을 재사용하지 않음');
