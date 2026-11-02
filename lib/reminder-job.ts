import { canRead, type Membership } from './policy';
import { reminders } from './reminders';
import { deliver, type DeliveryConfig } from './delivery';
import type { RecordItem } from '../db/schema';
export async function runReminderJob(db:D1Database,config:DeliveryConfig={},workspace?:string,now=new Date()) {
  const at=now.toISOString(),today=now.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
  const memberships=await db.prepare(`SELECT * FROM workspace_members WHERE active=1 ${workspace?'AND workspace=?':''}`).bind(...(workspace?[workspace]:[])).all<{email:string;name:string;workspace:string;role:Membership['role'];functions:string;customers:string;active:number}>();
  let events=0,accepted=0;
  const grouped=new Map<string,typeof memberships.results>();
  for(const m of memberships.results)grouped.set(m.workspace,[...(grouped.get(m.workspace)||[]),m]);
  for(const [scope,members] of grouped) {
    try {
      const result=await db.prepare('SELECT id,kind,data,updated_at FROM records WHERE workspace=?').bind(scope).all<{id:string;kind:string;data:string;updated_at:string}>();
      const all:RecordItem[]=result.results.map(r=>({...JSON.parse(r.data),id:r.id,kind:r.kind,version:r.updated_at}));
      const customerMap=new Map(all.filter(r=>r.kind==='customer').map(r=>[r.id,r]));
      for(const m of members) {
        const member:Membership={...m,active:true,functions:JSON.parse(m.functions),customers:JSON.parse(m.customers)};
        const prefsRow=await db.prepare('SELECT data FROM user_preferences WHERE id=?').bind(`${scope}:${m.email}`).first<{data:string}>();
        const prefs=prefsRow?JSON.parse(prefsRow.data):{};
        const visible=all.filter(r=>canRead(member,r,customerMap.get(r.customerId||'')));
        const alerts=reminders(visible,today).filter(n=>prefs.prefs?.[n.category]!==false);
        const statements:D1PreparedStatement[]=[];
        for(const n of alerts) {
          const id=`${scope}:${m.email}:${n.id}`;
          statements.push(db.prepare('INSERT INTO notifications (id,workspace,user_id,type,title,message,priority,entity_type,entity_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(id,scope,m.email,n.category,n.title,n.message,n.priority,n.kind,n.record.id,at));
          for(const channel of ['email','push'])if(prefs.channels?.[channel]===true)statements.push(db.prepare('INSERT INTO delivery_outbox (id,workspace,email,notification_id,record_id,channel,status,attempts,next_attempt_at,created_at) VALUES (?,?,?,?,?,?,?,0,?,?) ON CONFLICT(id) DO NOTHING').bind(`${id}:${channel}`,scope,m.email,id,n.record.id,channel,'pending',at,at));
        }
        for(let i=0;i<statements.length;i+=40)await db.batch(statements.slice(i,i+40));
        events+=alerts.length;
        // Recheck current permissions and event relevance immediately before sending.
        const due=await db.prepare("SELECT * FROM delivery_outbox WHERE workspace=? AND email=? AND status IN ('pending','retry') AND next_attempt_at<=? LIMIT 25").bind(scope,m.email,at).all<{id:string;notification_id:string;record_id:string;channel:string;attempts:number}>();
        for(const delivery of due.results) {
          if(!alerts.some(n=>`${scope}:${m.email}:${n.id}`===delivery.notification_id)||prefs.channels?.[delivery.channel]!==true) {
            await db.prepare("UPDATE delivery_outbox SET status='cancelled' WHERE id=?").bind(delivery.id).run();continue;
          }
          if(delivery.channel==='email'&&(!config.EMAIL_API_KEY||!config.EMAIL_FROM))continue;
          if(delivery.channel==='push'&&(!config.EXPO_ACCESS_TOKEN||!prefs.pushToken))continue;
          const claim=await db.prepare("UPDATE delivery_outbox SET status='sending',attempts=attempts+1,next_attempt_at=? WHERE id=? AND status IN ('pending','retry') RETURNING id").bind(new Date(now.getTime()+300000).toISOString(),delivery.id).first();
          if(!claim)continue;
          try {
            const sent=await deliver(delivery.channel,delivery.id,m.email,prefs.pushToken,config);
            if(sent.status==='accepted') {await db.prepare("UPDATE delivery_outbox SET status='accepted',delivered_at=?,last_error=NULL WHERE id=?").bind(at,delivery.id).run();accepted++;}
            else await db.prepare("UPDATE delivery_outbox SET status='pending' WHERE id=?").bind(delivery.id).run();
          }catch(error){await db.prepare('UPDATE delivery_outbox SET status=?,next_attempt_at=?,last_error=? WHERE id=?').bind(delivery.attempts>=4?'failed':'retry',new Date(now.getTime()+Math.min(3600000,60000*2**delivery.attempts)).toISOString(),(error as Error).message.slice(0,250),delivery.id).run();}
        }
      }
      await db.prepare('INSERT INTO workspace_jobs (workspace,last_run_at,last_error) VALUES (?,?,NULL) ON CONFLICT(workspace) DO UPDATE SET last_run_at=excluded.last_run_at,last_error=NULL').bind(scope,at).run();
    }catch(error){await db.prepare('INSERT INTO workspace_jobs (workspace,last_run_at,last_error) VALUES (?,?,?) ON CONFLICT(workspace) DO UPDATE SET last_error=excluded.last_error').bind(scope,at,(error as Error).message.slice(0,250)).run();throw error;}
  }
  // A crashed send has unknown delivery state. Do not automatically duplicate it.
  await db.prepare("UPDATE delivery_outbox SET status='review_required',last_error='Delivery interrupted; verify provider before retrying.' WHERE status='sending' AND next_attempt_at<?").bind(at).run();
  return {workspaces:grouped.size,events,accepted};
}
