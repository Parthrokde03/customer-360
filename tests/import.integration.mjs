import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {admin,teammate,feedback}=JSON.parse(readFileSync('outputs/roles-fixture.json','utf8'));
const base=process.env.TEST_BASE||'http://127.0.0.1:5175';
async function call(user,path,body,status=200){const r=await fetch(base+path,{signal:AbortSignal.timeout(10000),method:body?'POST':'GET',headers:{'accept-encoding':'identity','oai-authenticated-user-id':user.id,'oai-authenticated-user-email':user.email,'Content-Type':'application/json',origin:base},body:body?JSON.stringify(body):undefined});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
await call(admin,'/api/seed',{});console.log('First import complete');
const once=await call(admin,'/api/records');console.log('Read back',once.length);
await call(admin,'/api/seed',{});assert.equal((await call(admin,'/api/records')).length,once.length);
const notes=await call(admin,'/api/notifications');assert.ok(notes.some(n=>n.record.id===feedback.id));
await call(admin,'/api/workspace',{operation:'member',data:{email:teammate.email,name:'QA Function Head',role:'function_head',functions:['IT'],customers:[],active:false}});
await call(teammate,'/api/records',undefined,403);
console.log('PASS: complete import readback, idempotent re-import, notification reconciliation and disabled-member denial.');

