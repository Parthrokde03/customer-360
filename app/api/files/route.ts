import { env } from 'cloudflare:workers';
import { eq, and } from 'drizzle-orm';
import { context, authorizedRecords, checkOrigin, failure, HttpError } from '../../../lib/server-workspace';
import { canRead, canWrite } from '../../../lib/policy';
import { secureFiles, audit } from '../../../db/schema';
export async function POST(req:Request) {
  try {
    checkOrigin(req);const ctx=await context();
    if(!env.BUCKET) throw new HttpError(503,'Secure file storage is not configured.');
    if(Number(req.headers.get('content-length'))>5*1024*1024+10000)throw new HttpError(413,'Maximum file size is 5 MB.');
    const fd=await req.formData();const file=fd.get('file');const recordId=String(fd.get('recordId')||'');
    if(!(file instanceof File)||file.size>5*1024*1024||!file.size)throw new HttpError(400,'Choose a file up to 5 MB.');
    const {all}=await authorizedRecords(ctx);const record=all.find(r=>r.id===recordId);
    if(!record||!canWrite(ctx.member,record,all.find(r=>r.id===record.customerId)))throw new HttpError(403,'Save an authorized record before attaching evidence.');
    const bytes=new Uint8Array(await file.arrayBuffer());
    const valid=(file.type==='application/pdf'&&new TextDecoder().decode(bytes.slice(0,5))==='%PDF-') || (file.type==='image/png'&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)) || (file.type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255);
    if(!valid)throw new HttpError(400,'Only verified PDF, PNG and JPEG files are supported.');
    const id=crypto.randomUUID(); const name=file.name.replace(/[\r\n"\\/]/g,'_').slice(0,255);
    await env.BUCKET.put(`${ctx.workspace}/${id}`,bytes,{httpMetadata:{contentType:file.type}});
    try {await ctx.db.batch([ctx.db.insert(secureFiles).values({id,workspace:ctx.workspace,recordId,name,type:file.type,size:file.size,createdBy:ctx.member.email}),ctx.db.insert(audit).values({id:crypto.randomUUID(),workspace:ctx.workspace,actor:ctx.member.email,recordId,operation:'attachment-upload',details:JSON.stringify({id,name}),at:new Date().toISOString()})]);}
    catch(e){await env.BUCKET.delete(`${ctx.workspace}/${id}`);throw e;}
    return Response.json({id,name,type:file.type,size:file.size});
  }catch(e){return failure(e);}
}
export async function GET(req:Request) {
  try {
    const ctx=await context();const id=new URL(req.url).searchParams.get('id')||'';
    const [file]=await ctx.db.select().from(secureFiles).where(and(eq(secureFiles.id,id),eq(secureFiles.workspace,ctx.workspace)));
    const {all}=await authorizedRecords(ctx);const record=all.find(r=>r.id===file?.recordId);
    if(!file||!record||!canRead(ctx.member,record,all.find(r=>r.id===record.customerId)))throw new HttpError(404,'File not found.');
    const object=await env.BUCKET?.get(`${ctx.workspace}/${id}`);if(!object)throw new HttpError(404,'File not found.');
    return new Response(object.body,{headers:{'Content-Type':file.type,'Content-Disposition':`attachment; filename="${file.name}"`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}});
  }catch(e){return failure(e);}
}
