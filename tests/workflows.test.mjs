import test from 'node:test';
import assert from 'node:assert/strict';
import { canRead, canWrite, validateActionChange } from '../lib/policy.ts';
import { validateRecord, date } from '../lib/record-validation.ts';
import { getMonthlyFeedbackStats, getCustomerRiskMetrics, getActionsByStatus, getFeedbackByFunction, overdue } from '../lib/data.ts';
const admin={email:'admin@example.test',name:'Admin',role:'admin',active:true,functions:[],customers:[]};
const customer={id:'c1',kind:'customer',title:'Customer',function:'IT',ownerEmail:'relationship@example.test'};
const action={id:'a1',kind:'action',title:'Restore service',customerId:'c1',ownerEmail:'owner@example.test',owner:'Owner',due:'2026-10-01',status:'Open',confirmationRequired:true};
test('role scopes isolate functions, relationships and assigned actions',()=>{
  const head={...admin,role:'function_head',functions:['Finance']};assert.equal(canRead(head,customer),false);
  assert.equal(canRead({...head,functions:['IT']},action,customer),true);
  assert.equal(canRead({...admin,role:'relationship_owner',email:'relationship@example.test'},customer),true);
  const owner={...admin,role:'action_owner',email:'owner@example.test'};
  assert.equal(canRead(owner,action,customer),true);assert.equal(canRead(owner,{...action,ownerEmail:'someone@example.test'},customer),false);
  assert.equal(canWrite(owner,{id:'f',kind:'feedback',title:'Restricted',customerId:'c1'},customer),false);
  assert.equal(canRead({...admin,active:false},customer),false);
});
test('sensitive feedback needs an explicit grant even for leadership',()=>{
  const feedback={id:'f1',kind:'feedback',title:'Sensitive',sensitive:true,createdBy:'other@example.test'};
  assert.equal(canRead(admin,feedback,customer),false);
  assert.equal(canRead(admin,{...feedback,allowedEmails:[admin.email]},customer),true);
});
test('closure cannot bypass existing confirmation or assigned ownership',()=>{
  assert.throws(()=>validateActionChange(action,{...action,status:'Closed',confirmationRequired:false,closure:'Done'},admin));
  assert.throws(()=>validateActionChange(action,{...action,status:'Closed',closure:'Done'},admin));
  assert.doesNotThrow(()=>validateActionChange(action,{...action,status:'Closed',closure:'Customer verified',confirmed:true},admin));
  assert.throws(()=>validateActionChange(action,{...action,ownerEmail:'other@example.test'},{...admin,role:'action_owner'}));
});
test('server rejects invalid dates and statuses; accepts escalation',()=>{
  assert.equal(date.safeParse('2026-02-30').success,false);
  assert.equal(date.safeParse('2028-02-29').success,true);
  assert.throws(()=>validateRecord('action',{...action,status:'Anything'}));
  assert.throws(()=>validateRecord('action',{...action,ownerEmail:undefined}));
  assert.equal(validateRecord('escalation',{title:'Incident',customerId:'c1',date:'2026-11-01',status:'Open'}).status,'Open');
  const record=validateRecord('customer',{title:'Customer',id:'forged',workspace:'other',kind:'action',createdBy:'forged'});
  assert.equal(record.id,undefined);assert.equal(record.workspace,undefined);assert.equal(record.createdBy,undefined);
});
test('analytics follow supplied saved records and never import demo totals',()=>{
  assert.equal(getMonthlyFeedbackStats([],new Date('2026-11-01')).reduce((n,m)=>n+m.total,0),0);
  const feedback=[{id:'f',kind:'feedback',title:'Good',date:'2026-11-01',sentiment:'Positive',customerId:'c1'}];
  assert.equal(getMonthlyFeedbackStats(feedback,new Date('2026-11-02')).at(-1).Positive,1);
  assert.equal(getFeedbackByFunction(feedback,[customer])[0].count,1);
  assert.equal(getActionsByStatus([{...action,status:'Closed'}]).find(s=>s.status==='Closed').count,1);
  assert.equal(getCustomerRiskMetrics([customer],[action])[0].overdueActions,1);
  assert.equal(overdue({...action,status:'Closed'}),false);
});
