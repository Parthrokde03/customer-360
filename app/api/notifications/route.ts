import { context, authorizedRecords, failure } from '../../../lib/server-workspace';
import { notifications } from '../../../db/schema';
import { reminders } from '../../../lib/reminders';
export async function GET() {
  try {
    const ctx=await context();const {visible}=await authorizedRecords(ctx);
    const alerts=reminders(visible,new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}));
    const now=new Date().toISOString();
    // Stable event IDs make automatic reconciliation repeatable without duplicate alerts.
    for(let start=0;start<alerts.length;start+=50) {
      const slice=alerts.slice(start,start+50);const [first,...rest]=slice;
      const query=(n:typeof first)=>ctx.db.insert(notifications).values({id:`${ctx.workspace}:${ctx.member.email}:${n.id}`,workspace:ctx.workspace,userId:ctx.member.email,type:n.category,title:n.title,message:n.message,priority:n.priority,entityId:n.record.id,entityType:n.kind,createdAt:now}).onConflictDoNothing();
      if(first)await ctx.db.batch([query(first),...rest.map(query)]);
    }
    return Response.json(alerts,{headers:{'Cache-Control':'no-store'}});
  }catch(e){return failure(e);}
}
