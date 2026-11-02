import { env } from 'cloudflare:workers';
import { context, failure } from '../../../lib/server-workspace';
export async function GET(req:Request) {
  try {
    const {member,workspace}=await context();const params=new URL(req.url).searchParams;
    const page=Math.max(1,Math.min(100000,Number(params.get('page'))||1));const limit=25;
    const args:unknown[]=[workspace];const where=['r.workspace = ?'];
    // Same role scopes as the record API, applied before search pagination/counts.
    if(member.role==='function_head'){where.push("COALESCE(json_extract(c.data,'$.function'),json_extract(r.data,'$.function')) IN (SELECT value FROM json_each(?))");args.push(JSON.stringify(member.functions));}
    if(member.role==='relationship_owner'){where.push("(COALESCE(json_extract(c.data,'$.ownerEmail'),json_extract(r.data,'$.ownerEmail'))=? OR COALESCE(c.id,r.id) IN (SELECT value FROM json_each(?)))");args.push(member.email,JSON.stringify(member.customers));}
    if(member.role==='action_owner'){where.push("r.kind='action' AND json_extract(r.data,'$.ownerEmail')=?");args.push(member.email);}
    where.push("(COALESCE(json_extract(r.data,'$.sensitive'),0)=0 OR json_extract(r.data,'$.createdBy')=? OR ? IN (SELECT value FROM json_each(r.data,'$.allowedEmails')))");args.push(member.email,member.email);
    where.push("(c.id IS NULL OR COALESCE(json_extract(c.data,'$.sensitive'),0)=0 OR json_extract(c.data,'$.createdBy')=? OR ? IN (SELECT value FROM json_each(c.data,'$.allowedEmails')))");args.push(member.email,member.email);
    const q=(params.get('q')||'').slice(0,200).toLowerCase();
    if(q){where.push("(instr(lower(r.data),?)>0 OR instr(lower(COALESCE(c.data,'')),?)>0)");args.push(q,q);}
    for(const key of ['sentiment','status','priority','category','ownerEmail']) {const value=params.get(key);if(value&&value!=='All'){where.push(`json_extract(r.data,'$.${key}')=?`);args.push(value);}}
    if(params.get('function')&&params.get('function')!=='All'){where.push("COALESCE(json_extract(c.data,'$.function'),json_extract(r.data,'$.function'))=?");args.push(params.get('function'));}
    for(const [key,op] of [['from','>='],['to','<=']]) {const value=params.get(key);if(value){where.push(`COALESCE(json_extract(r.data,'$.date'),json_extract(r.data,'$.due')) ${op} ?`);args.push(value);}}
    const from=`FROM records r LEFT JOIN records c ON c.id=r.customer_id AND c.workspace=r.workspace WHERE ${where.join(' AND ')}`;
    const [rows,count]=await env.DB!.batch([env.DB!.prepare(`SELECT r.* ${from} ORDER BY r.updated_at DESC,r.id LIMIT ? OFFSET ?`).bind(...args,limit,(page-1)*limit),env.DB!.prepare(`SELECT count(*) total ${from}`).bind(...args)]);
    return Response.json({rows:rows.results.map((r:any)=>({...JSON.parse(r.data),id:r.id,kind:r.kind,version:r.updated_at})),total:Number((count.results[0] as {total:number}).total),page,pageSize:limit},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return failure(e);}
}
