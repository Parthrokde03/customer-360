import { env } from 'cloudflare:workers';
import { domainWrites } from '../../../lib/domain-storage';
import { sql } from 'drizzle-orm';
import { context, checkOrigin, failure, HttpError } from '../../../lib/server-workspace';
import { demo, stakeholders } from '../../../lib/data';
import { records, audit } from '../../../db/schema';
export async function POST(req:Request) {
  try {
    checkOrigin(req);
    // Drain the optional request body before returning a response. Leaving a POST
    // body unread can stall the next request on the local runtime's pooled connection.
    const body=await req.text();
    if(body.length>1024) throw new HttpError(413,'Import request is too large.');
    const {db,workspace,member}=await context();
    if(member.role!=='admin') throw new HttpError(403,'Administrator access required.');
    const ids=Object.fromEntries(demo.map(r=>[r.id,`${workspace}:demo:${r.id}`]));
    const now=new Date().toISOString();
    const values=demo.map(r=>{
      const data={...r,id:ids[r.id],fictional:true,owner:member.name,ownerEmail:member.email,createdBy:member.email,
        ...(r.customerId?{customerId:ids[r.customerId]}:{}),
        ...(r.feedbackId?{feedbackId:ids[String(r.feedbackId)]}:{}),
        ...(r.kind==='customer'?{additionalStakeholders:stakeholders.filter(s=>s.customerId===r.id&&!s.isPrimary)}:{})};
      return {id:ids[r.id],workspace,kind:r.kind,customerId:r.customerId?ids[r.customerId]:null,data:JSON.stringify(data),createdAt:now,updatedAt:now};
    });
    // Deterministic IDs make retries safe; never overwrite user edits to imported samples.
    const storage=env.DB!;
    await storage.batch([
      storage.prepare(`INSERT INTO records (id,workspace,kind,customer_id,data,created_at,updated_at) SELECT json_extract(value,'$.id'),json_extract(value,'$.workspace'),json_extract(value,'$.kind'),json_extract(value,'$.customerId'),json_extract(value,'$.data'),json_extract(value,'$.createdAt'),json_extract(value,'$.updatedAt') FROM json_each(?) WHERE true ON CONFLICT(id) DO NOTHING`).bind(JSON.stringify(values)),
      storage.prepare('INSERT INTO audit (id,workspace,actor,record_id,operation,details,at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),workspace,member.email,workspace,'seed','Fictional demonstration records imported',now),
      ...values.flatMap(v=>domainWrites(storage,JSON.parse(v.data),workspace,now)),
    ]);
    return Response.json({ok:true});
  }catch(e){return failure(e);}
}
