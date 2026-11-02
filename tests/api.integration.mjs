import assert from 'node:assert/strict';
const base='http://127.0.0.1:5173';
const auth=await fetch(base+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});
const cookie=auth.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie,'Local sign-in cookie');
async function call(path,body,expected=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{cookie,origin:base,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const data=await r.json();assert.equal(r.status,expected,JSON.stringify(data));return data;}
assert.equal((await fetch(base+'/api/records')).status,401);
const initial=await call('/api/records');
const ctx=await call('/api/workspace');
const ownerEmail=ctx.member.email;const owner=ctx.member.name;
const c=await call('/api/records',{kind:'customer',data:{title:'QA customer '+Date.now(),function:'IT',owner,ownerEmail}});
const m=await call('/api/records',{kind:'meeting',data:{title:'Service review',customerId:c.id,date:'2026-11-01',status:'Completed',owner,ownerEmail}});
const f=await call('/api/records',{kind:'feedback',data:{title:'Resolution delays',customerId:c.id,meetingId:m.id,date:'2026-11-01',sentiment:'Concerned',owner,ownerEmail}});
const a=await call('/api/records',{kind:'action',data:{title:'Improve resolution time',customerId:c.id,feedbackId:f.id,due:'2026-11-15',status:'Open',owner,ownerEmail,confirmationRequired:true}});
await call('/api/records',{id:a.id,version:a.version,kind:'action',data:{...a,status:'Closed',confirmationRequired:false,closure:'Done'}},400);
const closed=await call('/api/records',{id:a.id,version:a.version,kind:'action',data:{...a,status:'Closed',confirmed:true,closure:'Customer verified restored service'}});
await call('/api/records',{id:a.id,version:a.version,kind:'action',data:a},409);
const e=await call('/api/records',{kind:'escalation',data:{title:'Executive follow-up',customerId:c.id,feedbackId:f.id,date:'2026-11-01',status:'Open',owner,ownerEmail}});
const reload=await call('/api/records');for(const r of [c,m,f,closed,e])assert.ok(reload.some(s=>s.id===r.id));
assert.equal(reload.find(r=>r.id===a.id).status,'Closed');
await call('/api/workspace',{operation:'preferences',data:{read:['n-test'],prefs:{overdue:true,critical:true,meetings:true,escalations:true}}});assert.ok((await call('/api/workspace')).preferences.read.includes('n-test'));
// Secure evidence upload, signature rejection, authenticated download.
const fd=new FormData();fd.set('recordId',a.id);fd.set('file',new File(['%PDF-1.4\nQA evidence'], 'evidence.pdf',{type:'application/pdf'}));
let upload=await fetch(base+'/api/files',{method:'POST',headers:{cookie,origin:base},body:fd});assert.equal(upload.status,200,await upload.clone().text());const file=await upload.json();
let download=await fetch(base+'/api/files?id='+file.id,{headers:{cookie}});assert.equal(download.status,200);assert.ok((await download.text()).startsWith('%PDF-'));
assert.equal((await fetch(base+'/api/files?id='+file.id)).status,401);
await call('/api/records',{id:a.id,version:closed.version,kind:'action',data:{...closed,attachments:[file]}});
console.log('PASS: authenticated persistence, customer → meeting → feedback → action → closure, escalation, stale-write rejection, notification preferences, secure upload/download.');
