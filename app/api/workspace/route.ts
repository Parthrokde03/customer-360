import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { context, checkOrigin, failure, HttpError } from '../../../lib/server-workspace';
import { workspaceMembers, workspaceInvites, userPreferences, audit } from '../../../db/schema';
const memberInput=z.object({email:z.string().email().transform(v=>v.toLowerCase()),name:z.string().trim().min(1).max(200),role:z.enum(['admin','ceo','function_head','relationship_owner','action_owner']),functions:z.array(z.string()).max(50),customers:z.array(z.string()).max(1000),active:z.boolean()});
export async function GET() {
  try {
    const {db,member,workspace}=await context();
    const members=await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspace,workspace));
    const invitations=await db.select().from(workspaceInvites).where(eq(workspaceInvites.email,member.email));
    const [prefs]=await db.select().from(userPreferences).where(eq(userPreferences.id,`${workspace}:${member.email}`));
    return Response.json({member,members:members.filter(m=>member.role==='admin'||m.active).map(m=>({...m,functions:JSON.parse(m.functions),customers:JSON.parse(m.customers)})),invitations:invitations.map(i=>({id:i.id,...JSON.parse(i.data)})),preferences:prefs?JSON.parse(prefs.data):null},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return failure(e);}
}
export async function POST(req:Request) {
  try {
    checkOrigin(req);const ctx=await context();const {db,member,workspace}=ctx;const body=z.object({operation:z.string(),data:z.unknown().optional(),id:z.string().optional()}).parse(await req.json());
    if(body.operation==='preferences') {
      const data=z.object({read:z.array(z.string().max(200)).max(10000).optional(),prefs:z.record(z.boolean()).optional(),channels:z.object({email:z.boolean(),push:z.boolean()}).optional(),pushToken:z.string().regex(/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/).optional()}).parse(body.data);
      const id=`${workspace}:${member.email}`;
      const [previous]=await db.select().from(userPreferences).where(eq(userPreferences.id,id));
      const merged=JSON.stringify({...(previous?JSON.parse(previous.data):{}),...data});
      await db.insert(userPreferences).values({id,workspace,data:merged}).onConflictDoUpdate({target:userPreferences.id,set:{data:merged}});
    } else if(body.operation==='accept') {
      const [invite]=await db.select().from(workspaceInvites).where(and(eq(workspaceInvites.id,String(body.id)),eq(workspaceInvites.email,member.email)));
      if(!invite) throw new HttpError(404,'Invitation not found.');
      const data=memberInput.parse(JSON.parse(invite.data));
      await db.batch([db.update(workspaceMembers).set({...data,workspace:invite.workspace,functions:JSON.stringify(data.functions),customers:JSON.stringify(data.customers)}).where(eq(workspaceMembers.email,member.email)),db.delete(workspaceInvites).where(eq(workspaceInvites.id,invite.id)),db.insert(audit).values({id:crypto.randomUUID(),workspace:invite.workspace,actor:member.email,recordId:member.email,operation:'membership-accepted',details:invite.data,at:new Date().toISOString()})]);
    } else {
      if(member.role!=='admin') throw new HttpError(403,'Administrator access required.');
      const data=memberInput.parse(body.data);
      if(data.email===member.email) throw new HttpError(400,'You cannot change your own administrator membership.');
      const [existing]=await db.select().from(workspaceMembers).where(eq(workspaceMembers.email,data.email));
      if(existing?.workspace===workspace) {
        await db.batch([db.update(workspaceMembers).set({...data,functions:JSON.stringify(data.functions),customers:JSON.stringify(data.customers)}).where(eq(workspaceMembers.email,data.email)),db.insert(audit).values({id:crypto.randomUUID(),workspace,actor:member.email,recordId:data.email,operation:'membership-updated',details:JSON.stringify({before:existing,after:data}),at:new Date().toISOString()})]);
      } else {
        const id=`${workspace}:${data.email}`;
        await db.batch([db.insert(workspaceInvites).values({id,email:data.email,workspace,data:JSON.stringify(data)}).onConflictDoUpdate({target:workspaceInvites.id,set:{data:JSON.stringify(data)}}),db.insert(audit).values({id:crypto.randomUUID(),workspace,actor:member.email,recordId:data.email,operation:'membership-invited',details:JSON.stringify(data),at:new Date().toISOString()})]);
      }
    }
    return Response.json({ok:true});
  }catch(e){if(e instanceof z.ZodError)return Response.json({error:'Invalid workspace settings.'},{status:400});return failure(e);}
}
