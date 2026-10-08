(function(root){
const TODAY='2026-10-01';
function seed(){const teachers=['김서연','박지훈','이수진','James'];const classes=['Bridge A','Bridge B','Focus A','Focus B','Summit A','Summit B'];const names=['김민수','이지우','박서준','최하린','정도윤','강서아','윤지호','한예린','오시우','서유진','장하준','임수아','김도현','이서윤','박준우','최지안','정우진','강하윤','윤건우','한수빈','오예준','서채원','장민재','임다은','김현우','이나연','박시윤','최예은','정지훈','강소율','윤민준','한지민','오도하','서예서','장준서','임채아','김태윤','이유나','박정우','최서현','정시온','강예나','윤승우','한지아','오준혁','서다인','장유준','임소민'];
const students=names.map((name,i)=>({id:i+1,name,class:classes[Math.floor(i/8)],teacher:teachers[Math.floor(i/16)],native:'James',school:['한빛초','솔빛초','다온중'][Math.floor(i/16)],grade:Math.floor(i/16)===2?'중1':['초5','초6'][Math.floor(i/8)%2]}));
let events=[];students.forEach((s,i)=>{events.push({id:events.length+1,student:s.id,date:'2026-09-24T16:00:00',type:'시험',area:'Vocabulary',text:`단어 본시험 ${i%3===0?21:26}/30 · ${i%3===0?'FAIL':'PASS'}`,actor:s.teacher,visibility:'REPORTABLE',correct:i%3===0?21:26,total:30,pass:i%3!==0});events.push({id:events.length+1,student:s.id,date:'2026-09-25T17:00:00',type:'잘함',area:'Speaking',text:'근거를 덧붙여 자신의 의견을 완전한 문장으로 설명함.',actor:'James',visibility:'REPORTABLE'});events.push({id:events.length+1,student:s.id,date:'2026-09-28T16:00:00',type:i%3===0?'어려움':'개선',area:'Reading',text:i%3===0?'긴 문장에서 주어와 동사를 구분하는 데 추가 연습이 필요함.':'문장 구조 표시 연습 후 주요 내용을 스스로 요약함.',actor:s.teacher,visibility:'REPORTABLE'});events.push({id:events.length+1,student:s.id,date:'2026-09-29T16:00:00',type:'과제',area:'Reading',text:i%4===0?'Reading p.32~35 미완료':'Reading p.32~35 완료',actor:s.teacher,visibility:'REPORTABLE'});});
const tasks=students.slice(0,10).map((s,i)=>({id:i+1,student:s.id,reason:i%2?'Reading 과제 미완료':'단어 FAIL',primary:i%2?'Reading p.32~35 완료':'Unit 8 단어 재시험',secondary:i%2?'핵심 문장 3개 요약':'누적 단어 오답 10개 복습',vocab:i%2===0,status:['대기','학습중','확인대기','완료','미완료'][i%5],open:i%5!==3,started:i%5===0?null:Date.now()-(i+1)*5*60000,notification:i%5===4?'검토 필요':null,attempt:0,primaryDone:i%5===3,secondaryDone:i%5===3}));
const cases=students.filter((s,i)=>i%5===0).map((s,i)=>({id:i+1,student:s.id,title:i%2?'Reading 과제 습관':'문장 구조 이해',status:['OPEN','MONITORING','IMPROVING'][i%3],discovery:'동일 어려움이 2회 관찰됨',intervention:'문장 구조 표시 연습과 개별 확인',change:i%3===2?'최근 수업에서 스스로 주어·동사 구분':'다음 수업에서 수행 여부 재확인',visibility:'REPORTABLE'}));
tasks.forEach((t,i)=>{events.push({id:events.length+1,student:t.student,date:'2026-09-30T17:30:00',type:t.open?'나머지 지정':'완료',area:'나머지',text:t.open?t.primary+' · 다음 등원에서 이어서 확인':t.primary+' 및 '+t.secondary+' 완료',actor:'조교 이지은',visibility:'REPORTABLE'});});
return {students,events,tasks,cases,settings:{total:30,threshold:80},reports:{},version:1};}
function assessment(correct,total,threshold){if(!Number.isInteger(correct)||correct<0||correct>total)throw Error('정답수를 확인해 주세요.');return {correct,total,percentage:Math.round(correct/total*100),pass:correct/total*100>=threshold};}
function event(db,id,type,area,text,actor,visibility='REPORTABLE',extra={}){const e={id:Date.now()+Math.random(),student:id,date:TODAY+'T'+new Date().toTimeString().slice(0,8),type,area,text,actor,visibility,...extra};db.events.push(e);return e;}
function requiresSecondary(task){return task.secondaryRequired!==false;}
function optionalPending(task){return !requiresSecondary(task)&&task.primaryDone&&!task.secondaryDone&&Boolean(task.secondary);}
function resolveNotification(task){
 if(['검토 필요','승인 완료'].includes(task.notification))task.notification='취소됨';
 else if(task.notification==='모의 발송 완료')task.notification='후속 확인 필요';
}
function result(db,task,action,actor,correct){
 if(action==='복습완료'){
  if(!optionalPending(task))return;
  task.secondaryDone=true;event(db,task.student,'선택 복습 완료','나머지',task.secondary+' · 선택 복습 완료',actor);return;
 }
 // Completed required work cannot be reopened by an accidental repeated click.
 if(!task.open)return;
 if(action==='귀가'){
  task.status='미완료';task.open=true;task.notification='검토 필요';task.reviewedBy=null;task.sentAt=null;
  task.notificationBody=`${task.primaryDone?task.secondary:task.primary} 미완료 · 다음 등원 이월`;
  event(db,task.student,'미완료 귀가','나머지',task.notificationBody,actor);return;
 }
 if(action==='시작'){task.started=Date.now();task.status='학습중';event(db,task.student,'입실','나머지',(task.primaryDone?task.secondary:task.primary)+' 시작',actor);return;}
 if(action==='확인'){task.status='확인대기';return;}
 if(action!=='결과')return;
 const a=task.vocab&&!task.primaryDone?assessment(correct,db.settings.total,db.settings.threshold):null;
 const facts=[task.help,task.progress].filter(Boolean);if(facts.length)event(db,task.student,'수행 사실','나머지',facts.join(' · '),actor);
 if(a){task.attempt=(task.attempt||0)+1;event(db,task.student,'재시험','Vocabulary',`${correct}/${a.total} · ${a.pass?'PASS':'FAIL'} · ${task.attempt}차`,actor,'REPORTABLE',{...a,attempt:task.attempt,elapsed:task.started?(Date.now()-task.started)/60000:null});if(!a.pass){task.status='학습중';return;}}
 if(task.primaryDone){task.secondaryDone=true;task.open=false;task.status='완료';resolveNotification(task);event(db,task.student,'완료','나머지',task.secondary+' 완료',actor);}
 else{
  task.primaryDone=true;task.open=requiresSecondary(task);task.status=task.open?'학습중':'완료';
  if(!task.open)resolveNotification(task);
  else if(task.notification){
   task.notificationHistory??=[];
   task.notificationHistory.push({status:task.notification,body:task.notificationBody||task.primary+' 미완료 · 다음 등원 이월',reviewedBy:task.reviewedBy||null,sentAt:task.sentAt||null});
   task.notificationBody=task.secondary+' 미완료 · 다음 등원 이월';
   task.notification='검토 필요';task.reviewedBy=null;task.sentAt=null;
  }
  event(db,task.student,'Primary 완료','나머지',task.primary+' 완료'+(task.secondary?` · ${requiresSecondary(task)?'필수 추가 과제':'선택 복습'}: ${task.secondary}`:''),actor);
 }
}
function reportEvents(db,id,month){return db.events.filter(e=>e.student===id&&e.date.startsWith(month)&&e.visibility==='REPORTABLE');}
root.Growth={seed,assessment,event,result,reportEvents,requiresSecondary,optionalPending,TODAY};if(typeof module!=='undefined')module.exports=root.Growth;
})(typeof window==='undefined'?globalThis:window);
