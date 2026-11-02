import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { context, checkOrigin, HttpError, failure } from '../../../lib/server-workspace';
import { deviceSessions, audit } from '../../../db/schema';
import { tokenHash, newDeviceToken } from '../../../lib/device-auth';
export async function GET(){try{const {db,member,workspace}=await context();const rows=await db.select({id:deviceSessions.id,name:deviceSessions.name,expiresAt:deviceSessions.expiresAt,revoked:deviceSessions.revoked}).from(deviceSessions).where(and(eq(deviceSessions.email,member.email),eq(deviceSessions.workspace,workspace)));return Response.json(rows,{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
export async function POST(req:Request){try{
  checkOrigin(req);const input=await req.json();const {db,member,workspace,isDevice}=await context();
  if(isDevice)throw new HttpError(403,'Use the signed-in web app to manage device access.');
  const body=z.object({name:z.string().trim().min(1).max(80).optional(),revoke:z.string().optional()}).parse(input);
  if(body.revoke){await db.batch([db.update(deviceSessions).set({revoked:true}).where(and(eq(deviceSessions.id,body.revoke),eq(deviceSessions.email,member.email),eq(deviceSessions.workspace,workspace))),db.insert(audit).values({id:crypto.randomUUID(),workspace,actor:member.email,recordId:body.revoke,operation:'device-revoked',details:'Device access revoked',at:new Date().toISOString()})]);return Response.json({ok:true});}
  if(!body.name)throw new HttpError(400,'Enter a device name.');
  const token=newDeviceToken(),id=crypto.randomUUID(),now=new Date().toISOString(),expiresAt=new Date(Date.now()+30*86400000).toISOString();
  await db.batch([db.insert(deviceSessions).values({id,workspace,email:member.email,name:body.name,tokenHash:await tokenHash(token),expiresAt,createdAt:now}),db.insert(audit).values({id:crypto.randomUUID(),workspace,actor:member.email,recordId:id,operation:'device-created',details:body.name,at:now})]);
  return Response.json({id,token,expiresAt},{headers:{'Cache-Control':'no-store'}});
}catch(e){if(e instanceof z.ZodError)return Response.json({error:'Invalid device details.'},{status:400});return failure(e);}}
