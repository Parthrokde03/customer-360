import { env } from 'cloudflare:workers';
import { domainWrites } from '../../../lib/domain-storage';
import { records, audit, workspaceMembers, secureFiles, type RecordItem } from '../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { context, authorizedRecords, checkOrigin, failure, HttpError } from '../../../lib/server-workspace';
import { canRead, canWrite, privileged, validateActionChange } from '../../../lib/policy';
import { kindSchema, validateRecord } from '../../../lib/record-validation';
export async function GET() {
  try { const ctx=await context(); return Response.json((await authorizedRecords(ctx)).visible,{headers:{'Cache-Control':'no-store'}}); } catch(e){return failure(e);}
}
export async function POST(req:Request) {
  try {
    checkOrigin(req); const ctx=await context(); const {db,member,workspace}=ctx;
    const body=await req.text(); if(body.length>150000) throw new HttpError(413,'Record is too large. Upload evidence separately.');
    const parsed=z.object({id:z.string().min(1).max(100).optional(),version:z.string().optional(),kind:kindSchema,data:z.unknown()}).parse(JSON.parse(body));
    const {kind}=parsed; const data=validateRecord(kind,parsed.data); const id=parsed.id||crypto.randomUUID();
    const {all}=await authorizedRecords(ctx); const before=all.find(r=>r.id===id);
    if(parsed.id&&!before) throw new HttpError(404,'Record not found.');
    if(before&&before.kind!==kind) throw new HttpError(400,'Record type cannot change.');
    if(before&&parsed.version!==before.version) throw new HttpError(409,'This record changed. Refresh before editing again.');
    const parent=all.find(r=>r.id===data.customerId&&r.kind==='customer');
    if(kind!=='customer'&&!parent) throw new HttpError(400,'Select an authorized customer.');
    const after={...data,id,kind,createdBy:before?.createdBy||member.email,updatedBy:member.email} as RecordItem;
    if(before&&!canWrite(member,before,all.find(c=>c.id===before.customerId))) throw new HttpError(403,'You cannot update this record.');
    if(!canWrite(member,after,parent)) throw new HttpError(403,'Your role does not permit this operation.');
    if(!privileged(member)&&before&& (before.ownerEmail!==after.ownerEmail || !!before.sensitive!==!!after.sensitive || JSON.stringify(before.allowedEmails||[])!==JSON.stringify(after.allowedEmails||[]))) throw new HttpError(403,'Only leadership or administrators may change ownership or restricted access.');
    if(data.ownerEmail) {
      const [owner]=await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.email,data.ownerEmail),eq(workspaceMembers.workspace,workspace),eq(workspaceMembers.active,true)));
      if(!owner) throw new HttpError(400,'Owner must be an active workspace member.');
      after.owner=owner.name;
    }
    if(kind==='action') validateActionChange(before,after,member);
    for(const [field,sourceKind] of [['feedbackId','feedback'],['meetingId','meeting']] as const) {
      if(after[field]) {const source=all.find(r=>r.id===after[field]&&r.kind===sourceKind&&r.customerId===after.customerId); if(!source||!canRead(member,source,parent)) throw new HttpError(400,'Source must be an accessible record for the same customer.');}
    }
    for(const file of (data.attachments||[])) {
      const [stored]=await db.select().from(secureFiles).where(and(eq(secureFiles.id,file.id),eq(secureFiles.workspace,workspace),eq(secureFiles.recordId,id)));
      if(!stored) throw new HttpError(400,'Evidence must be uploaded to this record first.');
    }
    const now=new Date().toISOString(); const payload=JSON.stringify(after);
    const store=env.DB!;
    const mutation=before
      ? store.prepare('UPDATE records SET data=?,customer_id=?,updated_at=? WHERE id=? AND workspace=? AND updated_at=? RETURNING id').bind(payload,kind==='customer'?null:String(data.customerId),now,id,workspace,parsed.version!)
      : store.prepare('INSERT INTO records (id,workspace,kind,customer_id,data,created_at,updated_at) VALUES (?,?,?,?,?,?,?) RETURNING id').bind(id,workspace,kind,kind==='customer'?null:String(data.customerId),payload,now,now);
    const result=await store.batch([mutation,store.prepare('INSERT INTO audit (id,workspace,actor,record_id,operation,details,at) SELECT ?,?,?,?,?,?,? WHERE changes()>0').bind(crypto.randomUUID(),workspace,member.email,id,before?'update':'create',JSON.stringify({before:before||null,after}),now),...domainWrites(store,after,workspace,now)]);
    if(!result[0].results.length) throw new HttpError(409,'This record changed. Refresh before saving.');
    return Response.json({...after,version:now});
  } catch(e) {
    if(e instanceof z.ZodError) return Response.json({error:e.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},{status:400});
    if(e instanceof SyntaxError) return Response.json({error:'Invalid JSON.'},{status:400});
    if(e instanceof Error && !(e instanceof HttpError) && !('query' in e)) return Response.json({error:e.message},{status:400});
    return failure(e);
  }
}
