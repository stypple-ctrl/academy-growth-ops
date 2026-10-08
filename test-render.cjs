const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');const nodes={};const handlers={};const ctx={console,Date,Math,Set,Number,String,JSON,confirm:()=>true,setTimeout:()=>0,clearTimeout:()=>{},localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:id=>nodes[id]??=( {innerHTML:'',textContent:'',style:{}}),addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>[]},window:{addEventListener:()=>{}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('model.js','utf8'),ctx);ctx.Growth=ctx.window.Growth;vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);for(const p of ['dashboard','home','session','board','students','cases','reports','notifications','settings']){vm.runInContext(`page='${p}';render()`,ctx);assert(nodes.app.innerHTML.length>2000,p);assert(!nodes.app.innerHTML.includes('NaN'),p)}vm.runInContext("role='조교';page='dashboard';render()",ctx);assert(nodes.app.innerHTML.includes('나머지 학습실'));assert(!nodes.app.innerHTML.includes('data-page="settings"'));vm.runInContext("role='교사';teacher='James';page='students';render()",ctx);assert(nodes.app.innerHTML.includes('김민수'));vm.runInContext("role='원장';page='dashboard';filters={school:'한빛초',class:'Bridge A'};render()",ctx);assert(nodes.app.innerHTML.includes('과제 마무리 현황'));assert(nodes.app.innerHTML.includes('기록이 쌓이는 흐름'));console.log('PASS: 9개 화면 템플릿 렌더, 역할별 메뉴, 복수 교사 학생 조회, 조합 필터, 데이터 그래프 — 실제 브라우저 검증과는 별도');
vm.runInContext("role='원장';filters={};db.tasks=[{...db.tasks[0],id:101,student:1,open:false},{...db.tasks[0],id:102,student:1,open:true},{...db.tasks[0],id:103,student:2,open:true}];page='dashboard';render()",ctx);
assert.match(nodes.app.innerHTML,/나머지 대상[\s\S]*?class="value">2<small>명/);
assert(nodes.app.innerHTML.includes('완료 1 ÷ 전체 3 × 100'));
vm.runInContext("filters={class:'존재하지 않는 반'};render()",ctx);assert(!/NaN|Infinity/.test(nodes.app.innerHTML));
console.log('PASS: 복수 과제의 고유 학생 수·과제 분모·빈 대상');
vm.runInContext("filters={};page='board';db=G.seed();render()",ctx);
assert.match(nodes.app.innerHTML,/<option value="" selected>미확인<\/option>/);
assert(!nodes.app.innerHTML.includes('PRIMARY TASK'));assert(nodes.app.innerHTML.includes('기본 과제'));assert(nodes.app.innerHTML.includes('추가 과제'));assert(nodes.app.innerHTML.includes('미해결'));
vm.runInContext("db.tasks[1].help='혼자 수행';render()",ctx);assert.match(nodes.app.innerHTML,/<option value="혼자 수행" selected>혼자 수행<\/option>/);
vm.runInContext("page='dashboard';render()",ctx);assert(nodes.app.innerHTML.includes('반 수업 기록 →'));assert(nodes.app.innerHTML.includes('과제 마무리 현황 · 현재'));assert(nodes.app.innerHTML.includes('학습 기록 · 선택 기간'));
vm.runInContext("filters={from:'2030-01-01'};render()",ctx);assert(nodes.app.innerHTML.includes('선택 기간에 기록이 없습니다.'));assert.match(nodes.app.innerHTML,/나머지 대상[\s\S]*?class="value">10<small>명/);
vm.runInContext("filters={school:'한빛초',class:'Bridge A'};render()",ctx);assert.match(nodes.app.innerHTML,/나머지 대상[\s\S]*?class="value">8<small>명/);
console.log('PASS: 미확인 표시·기존 관찰 유지, 한국어 용어, 날짜/현재 구분, 학교+반 필터');

// Work-centered UI: direct records target one student, and empty bulk actions stay disabled.
vm.runInContext("db=G.seed();role='교사';teacher=db.students[0].teacher;filters={};page='session';selected.clear();render()",ctx);
assert.match(nodes.app.innerHTML,/data-action="event" disabled/);
const target=vm.runInContext('scope()[0].id',ctx);
for(const kind of ['event','exam','assign']){
  vm.runInContext('selected=new Set(scope().slice(0,3).map(s=>s.id))',ctx);
  handlers.click({target:{closest:()=>({dataset:{action:'quick-record',id:String(target),kind}})}});
  assert.equal(vm.runInContext('[...selected].join()',ctx),String(target));
  assert(nodes.overlay.innerHTML.includes('entryForm'),kind);
}
const before=nodes.overlay.innerHTML;
handlers.click({target:{closest:()=>({dataset:{action:'quick-record',id:'999999',kind:'event'}})}});
assert.equal(nodes.overlay.innerHTML,before);
vm.runInContext("role='조교';page='board';render()",ctx);
assert.equal((nodes.app.innerHTML.match(/<article class="task"/g)||[]).length,vm.runInContext('db.tasks.length',ctx));
assert(nodes.app.innerHTML.indexOf('data-state="확인대기"')<nodes.app.innerHTML.indexOf('data-state="대기"'));
assert.match(nodes.app.innerHTML,/<details class="completed-tasks">/);
console.log('PASS: 학생별 기록 대상·범위 제한, 빈 선택 차단, 과제 누락 없음·확인대기 우선·완료 접기');

// Student identity stays consistent when task status changes.
vm.runInContext("role='조교';page='board';db=G.seed();render()",ctx);
assert.equal((nodes.app.innerHTML.match(/class="task-cover"/g)||[]).length,vm.runInContext('db.tasks.length',ctx));
assert.equal((nodes.app.innerHTML.match(/class="student-gallery"/g)||[]).length,4);
const tone=vm.runInContext('taskCard(db.tasks[0]).match(/data-tone="(\\d+)"/)[1]',ctx);
vm.runInContext("db.tasks[0].status='확인대기';render()",ctx);
assert.equal(vm.runInContext('taskCard(db.tasks[0]).match(/data-tone="(\\d+)"/)[1]',ctx),tone);
assert(nodes.app.innerHTML.includes('지시서 크게 보기'));
handlers.click({target:{closest:()=>({dataset:{action:'task-guide',id:'1'}})}});
assert(nodes.overlay.innerHTML.includes('오늘의 작업 지시서'));
console.log('PASS: 모든 학생 카드 헤더·상태별 갤러리, 상태 이동 후 식별 색 유지, 지시서 확대');
