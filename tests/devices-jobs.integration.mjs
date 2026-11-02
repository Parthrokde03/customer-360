import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {admin}=JSON.parse(readFileSync('outputs/roles-fixture.json','utf8'));
const base='http://127.0.0.1:5175';
const headers={connection:'close','oai-authenticated-user-id':admin.id,'oai-authenticated-user-email':admin.email,'content-type':'application/json'};
async function call(path,body,token,status=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:token?{connection:'close',authorization:`Bearer ${token}`,'content-type':'application/json'}:headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});const data=await r.json();console.log(path,r.status);assert.equal(r.status,status,JSON.stringify(data));return data;}
const device=await call('/api/devices',{name:'Automated local test'});
try{
 const rows=await call('/api/records',undefined,device.token);assert.ok(rows.length);
 await call('/api/devices',{name:'Forbidden device delegation'},device.token,403);
 const list=await call('/api/devices');assert.ok(list.every(d=>!d.token&&!d.tokenHash));
 const backfill=await call('/api/migrate',{});assert.ok(backfill.migrated>0);
 const scheduled=await fetch(base+'/__local-reminders',{method:'POST',headers:{Authorization:'Bearer '+JSON.parse(readFileSync('.sites-runtime/reminder-worker.json','utf8')).vars.LOCAL_REMINDER_TOKEN}});assert.equal(scheduled.status,200);await scheduled.text();
 const jobs=await call('/api/jobs');assert.ok(jobs.runs[0]?.lastRunAt);assert.equal(jobs.runs[0].lastError,null);
}finally{await call('/api/devices',{revoke:device.id});}
await call('/api/records',undefined,device.token,401);
console.log('PASS: device authentication, no delegated minting, secret-safe listing, revocation, relational backfill and browser-independent scheduled reminders.');

