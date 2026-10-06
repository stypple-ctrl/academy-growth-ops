const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function boot(initial=null){
 const nodes={},handlers={},store={value:initial,fail:false,writes:0},reportInputs=[];
 const node=id=>nodes[id]??={innerHTML:'',textContent:'',value:'',style:{},dataset:{}};
 const ctx={console,Date,Math,Set,Number,String,JSON,confirm:()=>true,setTimeout:()=>0,clearTimeout:()=>{},localStorage:{getItem:()=>store.value,setItem:(key,value)=>{store.writes++;if(store.fail)throw Error('QuotaExceededError');store.value=value;}},document:{getElementById:node,addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>reportInputs,querySelector:()=>null},window:{addEventListener:(type,fn)=>handlers[type]=fn}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('model.js','utf8'),ctx);ctx.Growth=ctx.window.Growth;vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
 const run=code=>vm.runInContext(code,ctx),click=(action,id,op)=>handlers.click({target:{closest:()=>({dataset:{action,id:String(id??''),op}})}});
 return {nodes,node,handlers,store,reportInputs,run,click,submit:kind=>handlers.submit({preventDefault(){},target:{id:'entryForm',dataset:{kind}}})};
}
const app=boot();app.run('selected.add(1)');app.node('memo').value='저장 실패 후 재시도';app.node('eventType').value='개선';app.node('area').value='Reading';app.node('visibility').value='REPORTABLE';app.node('overlay').innerHTML='열린 입력창';
const before=app.run('JSON.stringify(db)'),count=app.run('db.events.length');app.store.fail=true;app.submit('event');
assert.equal(app.run('JSON.stringify(db)'),before,'저장 실패 시 인메모리 변경 복구');assert.equal(app.run('selected.size'),1);assert.equal(app.node('overlay').innerHTML,'열린 입력창');assert.equal(app.node('memo').value,'저장 실패 후 재시도');assert.match(app.node('toast').textContent,/저장.*못|저장.*실패/);
app.store.fail=false;app.submit('event');assert.equal(app.run('db.events.length'),count+1);assert.equal(app.run('selected.size'),0);assert.equal(app.node('overlay').innerHTML,'');
const fresh=boot(app.store.value);assert.equal(fresh.run('db.events.length'),count+1);assert.equal(fresh.run('db.events.at(-1).text'),'저장 실패 후 재시도');
const board=boot();board.node('score-1').value='24';board.store.fail=true;const old=board.run('JSON.stringify(db)');board.click('task',1,'결과');assert.equal(board.run('JSON.stringify(db)'),old);assert.equal(board.node('score-1').value,'24');board.store.fail=false;board.click('task',1,'결과');assert.equal(board.run('db.tasks[0].attempt'),1);assert.equal(board.run('db.events.filter(e=>e.type==="재시험").length'),1);
console.log('PASS: 저장 실패 시 데이터·선택·입력창 보존, 재시도 1회 저장, 재조회, 조교 재시험 복구');
module.exports={boot};
// Every persistent action must leave confirmed state untouched on failure.
function failureThenRetry(setup,action,check){const a=boot();setup(a);const before=a.run('JSON.stringify(db)');a.store.fail=true;action(a);assert.equal(a.run('JSON.stringify(db)'),before);assert.match(a.node('toast').textContent,/저장.*못/);a.store.fail=false;action(a);check(a);return a;}
for(const correct of [23,24])failureThenRetry(a=>{a.run('selected.add(1)');a.node('correct').value=String(correct);},a=>a.submit('exam'),a=>{assert.equal(a.run('db.events.filter(e=>e.type==="시험"&&e.date.startsWith("2026-10")).length'),1);});
failureThenRetry(a=>{a.run('selected.add(1)');a.node('primary').value='새 기본 과제';a.node('secondary').value='새 추가 과제';a.node('reason').value='단어 FAIL';},a=>a.submit('assign'),a=>assert.equal(a.run('db.tasks.filter(t=>t.primary==="새 기본 과제").length'),1));
failureThenRetry(a=>{a.node('total').value='40';a.node('threshold').value='75';},a=>a.click('settings-save'),a=>assert.equal(a.run('db.settings.total'),40));
failureThenRetry(()=>{},a=>a.click('notify-review',5),a=>assert.equal(a.run('db.tasks[4].notification'),'승인 완료'));
failureThenRetry(a=>a.click('notify-review',5),a=>a.click('notify-send',5),a=>assert.equal(a.run('db.tasks[4].notification'),'모의 발송 완료'));
for(const status of ['report-save','report-approve'])failureThenRetry(a=>a.reportInputs.push(...Array.from({length:7},(_,i)=>({value:'수정 문장 '+i}))),a=>a.click(status),a=>{assert.equal(a.run('db.reports["1-2026-09"].body[0]'),'수정 문장 0');assert.match(a.node('toast').textContent,/저장했습니다|승인했습니다/);});
failureThenRetry(a=>{a.reportInputs.push(...Array.from({length:7},()=>({value:'기존 수정본'})));a.click('report-save');},a=>a.click('report-generate'),a=>assert.equal(a.run('db.reports["1-2026-09"]'),undefined));
failureThenRetry(a=>{a.run("db.settings.total=40;save();selected.add(1)");},a=>a.click('reset'),a=>assert.equal(a.run('db.settings.total'),30));
for(const field of ['help','progress','case'])failureThenRetry(()=>{},a=>a.handlers.change({target:{id:'',dataset:{[field]:'1'},value:field==='case'?'IMPROVING':field==='help'?'1~2회 도움':'반복 독촉',closest:()=>null}}),a=>assert.equal(a.run(field==='case'?'db.cases[0].status':`db.tasks[0].${field}`),field==='case'?'IMPROVING':field==='help'?'1~2회 도움':'반복 독촉'));
failureThenRetry(a=>{a.run("G.event(db,1,'어려움','Reading','반복','교사');G.event(db,1,'어려움','Reading','반복','교사');save()");},a=>a.click('case-create',0),a=>assert.equal(a.run('db.cases.filter(c=>c.title==="반복 학습 어려움 확인").length'),1));
console.log('PASS: 본시험 PASS/FAIL, 과제 지정, 설정, 알림 승인/모의 발송, 리포트 저장/승인/재생성, 초기화, 조교 선택, Case 변경/등록 실패·재시도');
const oldData=require('./model.js').seed();oldData.tasks[1].help='혼자 수행';oldData.events[0].text='기존 Primary 메모 <그대로>';const serialized=JSON.stringify(oldData),unchanged=boot(serialized);unchanged.run('page="board";render()');assert.equal(unchanged.store.value,serialized);assert.equal(unchanged.run('JSON.stringify(db)'),serialized);
const invalid=boot();invalid.node('score-1').value='31';const baseline=invalid.run('JSON.stringify(db)');invalid.click('task',1,'결과');assert.equal(invalid.run('JSON.stringify(db)'),baseline);
console.log('PASS: 기존 저장 데이터 무변환 보존, 유효하지 않은 재시험 입력 시 미저장 기록 제거');
for(const field of ['help','progress','case']){
 const a=boot();const target={id:'',dataset:{[field]:'1'},value:field==='case'?'IMPROVING':field==='help'?'1~2회 도움':'반복 독촉',closest:()=>null};
 a.store.fail=true;a.handlers.change({target});assert(a.node('toast').innerHTML.includes('data-action="retry-save"'));
 a.store.fail=false;a.click('retry-save');assert.equal(a.run(field==='case'?'db.cases[0].status':`db.tasks[0].${field}`),target.value);assert.equal(a.node('toast').textContent,'저장했습니다.');
}
console.log('PASS: 자동 저장 선택 항목의 명시적 재시도 버튼 및 성공 안내');
