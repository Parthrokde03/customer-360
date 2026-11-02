import { getChatGPTUser } from '../app/chatgpt-auth';
import { getDb } from '../db';
import { workspaceMembers, records, deviceSessions } from '../db/schema';
import { headers } from 'next/headers';
import { tokenHash } from './device-auth';
import { eq } from 'drizzle-orm';
import { canRead, type Membership } from './policy';
import type { RecordItem } from '../db/schema';
export class HttpError extends Error { constructor(public status:number, message:string) { super(message); } }
export async function context() {
  let user = await getChatGPTUser();
  let deviceWorkspace:string|undefined;
  const authorization=(await headers()).get('authorization');
  if(authorization) {
    const token=authorization.startsWith('Bearer ')?authorization.slice(7):'';
    if(!/^[a-f0-9]{64}$/.test(token)) throw new HttpError(401,'Invalid device session.');
    const [session]=await getDb().select().from(deviceSessions).where(eq(deviceSessions.tokenHash,await tokenHash(token)));
    if(!session||session.revoked||session.expiresAt<=new Date().toISOString()) throw new HttpError(401,'Device session expired or revoked.');
    deviceWorkspace=session.workspace;
    user={userId:session.email,email:session.email,displayName:session.name,fullName:session.name};
  }
  if (!user) throw new HttpError(401,'Sign in required.');
  const db = getDb(); const email = user.email.toLowerCase();
  // No implicit company-wide access: an admin must explicitly grant membership.
  if(!deviceWorkspace) await db.insert(workspaceMembers).values({email,workspace:user.userId,name:user.displayName,role:'admin'}).onConflictDoNothing();
  const [row] = await db.select().from(workspaceMembers).where(eq(workspaceMembers.email,email));
  if (!row?.active) throw new HttpError(403,'Workspace membership is disabled.');
  if(deviceWorkspace&&deviceWorkspace!==row.workspace) throw new HttpError(401,'Workspace changed. Connect this device again.');
  const member:Membership = {...row,role:row.role as Membership['role'],functions:JSON.parse(row.functions),customers:JSON.parse(row.customers)};
  return {db,user,member,workspace:row.workspace,isDevice:!!deviceWorkspace};
}
export async function authorizedRecords(ctx:Awaited<ReturnType<typeof context>>) {
  const raw = await ctx.db.select().from(records).where(eq(records.workspace,ctx.workspace));
  const all:RecordItem[] = raw.map(r=>({...JSON.parse(r.data),id:r.id,kind:r.kind,version:r.updatedAt}));
  const visible = all.filter(r=>canRead(ctx.member,r,all.find(c=>c.id===r.customerId)));
  if(ctx.member.role==='action_owner') {
    for(const id of new Set(visible.map(r=>r.customerId))) {
      const c=all.find(r=>r.id===id && r.kind==='customer');
      if(c && !c.sensitive) visible.push({id:c.id,kind:'customer',title:c.title,function:c.function});
    }
  }
  return {all,visible};
}
export function checkOrigin(req:Request) {
  if(req.headers.get('origin') && req.headers.get('origin')!==new URL(req.url).origin) throw new HttpError(403,'Invalid origin.');
}
export function failure(e:unknown) {
  if(e instanceof HttpError) return Response.json({error:e.message},{status:e.status});
  console.error('Workspace request failed',e instanceof Error ? e.name : 'Unknown error');
  return Response.json({error:'Unable to complete request. Please try again.'},{status:500});
}
