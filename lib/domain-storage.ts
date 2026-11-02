import type { RecordItem } from '../db/schema';
type Value=string|number|null;
const str=(value:unknown)=>value==null?null:String(value);
// Only fixed table/column identifiers from this module reach SQL construction.
// All user data is parameterized. A version guard keeps projections consistent
// with the record mutation inside the same atomic D1 batch.
export function domainWrites(db:D1Database,r:RecordItem,workspace:string,at:string,createdAt=at) {
  const writes:D1PreparedStatement[]=[];
  const add=(table:string,values:Record<string,Value>,key='id')=>{
    const columns=Object.keys(values);const update=columns.filter(c=>c!==key&&c!=='created_at').map(c=>`${c}=excluded.${c}`).join(',');
    writes.push(db.prepare(`INSERT INTO ${table} (${columns.join(',')}) SELECT ${columns.map(()=>'?').join(',')} WHERE EXISTS(SELECT 1 FROM records WHERE id=? AND workspace=? AND updated_at=?) ON CONFLICT(${key}) DO UPDATE SET ${update}`).bind(...Object.values(values),r.id,workspace,at));
  };
  const common={id:r.id,workspace,created_at:createdAt,updated_at:at};
  const customer=str(r.customerId),owner=str(r.ownerEmail);
  add('domain_links',{record_id:r.id,workspace,customer_id:customer,feedback_id:str(r.feedbackId),meeting_id:str(r.meetingId),owner_email:owner},'record_id');
  if(r.kind==='customer'){
    add('customers',{...common,name:r.title,business_function:r.function||'Unassigned',location:str(r.location),relationship_owner_id:owner,relationship_owner_name:str(r.owner),current_sentiment:r.sentiment||'Neutral',criticality:str(r.criticality)||'medium',created_by:str(r.createdBy),notes:str(r.description)});
    writes.push(db.prepare('UPDATE stakeholders SET is_active=0,updated_at=? WHERE customer_id=? AND workspace=? AND EXISTS(SELECT 1 FROM records WHERE id=? AND updated_at=?)').bind(at,r.id,workspace,r.id,at));
    const contacts=[...(r.stakeholder?[{id:`${r.id}:primary`,name:r.stakeholder,title:r.stakeholderTitle,email:r.stakeholderEmail,phone:r.stakeholderPhone,criticality:r.criticality,isPrimary:true}]:[]),...(Array.isArray(r.additionalStakeholders)?r.additionalStakeholders:[])];
    contacts.forEach((s,i)=>{if(!s.name)return;add('stakeholders',{id:String(s.id||`${r.id}:contact:${i}`),workspace,customer_id:r.id,full_name:String(s.name),title:str(s.title),email:str(s.email),phone:str(s.phone),location:str(s.location||r.location),criticality:str(s.criticality)||'medium',is_primary:s.isPrimary?1:0,is_active:1,created_at:createdAt,updated_at:at});});
  }
  if(r.kind==='meeting'){
    add('meetings',{...common,customer_id:customer,title:r.title,meeting_type:r.type||'General Discussion',scheduled_at:`${r.date}T${r.time||'09:00'}:00+05:30`,status:r.status||'Scheduled',summary:str(r.summary),location:str(r.location),organizer_id:owner,organizer_name:str(r.owner),created_by:str(r.createdBy)});
    writes.push(db.prepare('DELETE FROM meeting_participants WHERE meeting_id=? AND workspace=? AND EXISTS(SELECT 1 FROM records WHERE id=? AND updated_at=?)').bind(r.id,workspace,r.id,at));
    const gcc=Array.isArray(r.participants)?r.participants:[];const client=String(r.customerParticipants||'').split(',').map(s=>s.trim()).filter(Boolean);
    [...gcc.map(name=>({name,type:'gcc_leader'})),...client.map(name=>({name,type:'customer_stakeholder'}))].forEach((p,i)=>add('meeting_participants',{id:`${r.id}:${i}`,workspace,meeting_id:r.id,participant_type:p.type,participant_name:String(p.name),created_at:createdAt}));
  }
  if(r.kind==='feedback'){
    add('feedback',{...common,customer_id:customer,meeting_id:str(r.meetingId),title:r.title,description:str(r.description),category:r.category||'General Feedback',sentiment:r.sentiment||'Neutral',is_sensitive:r.sensitive?1:0,requires_action:r.requiresAction?1:0,captured_by_id:str(r.createdBy),captured_by_name:str(r.owner),feedback_date:r.date||createdAt.slice(0,10),created_by:str(r.createdBy)});
    add('sentiment_history',{id:`${r.id}:${at}`,workspace,customer_id:customer,sentiment:r.sentiment||'Neutral',triggered_by:r.id,recorded_at:at,recorded_by:str(r.createdBy)});
  }
  if(r.kind==='action'){
    add('actions',{...common,customer_id:customer,feedback_id:str(r.feedbackId),meeting_id:str(r.meetingId),title:r.title,description:str(r.description),owner_id:owner,owner_name:r.owner||'Unassigned legacy owner',owner_department:str(r.function),priority:r.priority||'Medium',status:r.status||'Open',due_date:r.due||'',progress_notes:str(r.progressNotes),closure_notes:str(r.closure),customer_confirmation_required:r.confirmationRequired?1:0,customer_confirmed:r.confirmed?1:0,completed_at:r.status==='Closed'?at:null,created_by:str(r.createdBy)});
    add('action_updates',{id:`${r.id}:${at}`,workspace,action_id:r.id,update_type:'record_update',new_value:JSON.stringify({status:r.status,ownerEmail:r.ownerEmail,due:r.due,confirmed:r.confirmed}),notes:str(r.progressNotes||r.closure),updated_by_id:str(r.updatedBy||r.createdBy),created_at:at});
  }
  if(r.kind==='escalation')add('escalations',{...common,customer_id:customer,feedback_id:str(r.feedbackId),action_id:str(r.actionId),title:r.title,description:str(r.description),severity:str(r.severity)||'high',status:r.status||'Open',escalated_by_id:str(r.createdBy),assigned_to_id:owner,assigned_to_name:str(r.assignedTo||r.owner),resolution_notes:str(r.resolutionNotes)});
  return writes;
}
