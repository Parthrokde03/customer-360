import {env} from 'cloudflare:workers';
import {context,checkOrigin,failure,HttpError} from '../../../lib/server-workspace';
import {domainWrites} from '../../../lib/domain-storage';
export async function POST(req:Request){try{
  checkOrigin(req);await req.text();const {member,workspace}=await context();if(member.role!=='admin')throw new HttpError(403,'Administrator access required.');
  const db=env.DB!;const result=await db.prepare('SELECT * FROM records WHERE workspace=? ORDER BY CASE kind WHEN ? THEN 0 ELSE 1 END,id').bind(workspace,'customer').all<{id:string;workspace:string;kind:string;data:string;created_at:string;updated_at:string}>();
  const known=new Set(result.results.map(r=>r.id));const members=await db.prepare('SELECT email FROM workspace_members WHERE workspace=?').bind(workspace).all<{email:string}>();const emails=new Set(members.results.map(m=>m.email));
  let migrated=0;const warnings:string[]=[];
  for(const row of result.results){const r={...JSON.parse(row.data),id:row.id,kind:row.kind};
    if(r.kind!=='customer'&&!known.has(r.customerId)){warnings.push(`${r.id}: missing customer`);continue;}
    // Keep the original legacy envelope intact. Missing historical owner identities
    // remain null in the relational index instead of inventing an assignment.
    if(r.ownerEmail&&!emails.has(r.ownerEmail)){warnings.push(`${r.id}: legacy owner identity requires reassignment`);delete r.ownerEmail;}
    for(const source of ['meetingId','feedbackId'])if(r[source]&&!known.has(r[source])){warnings.push(`${r.id}: missing ${source}`);delete r[source];}
    const statements=domainWrites(db,r,workspace,row.updated_at,row.created_at);if(statements.length)await db.batch(statements);migrated++;
  }
  await db.prepare('INSERT INTO audit (id,workspace,actor,record_id,operation,details,at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),workspace,member.email,workspace,'domain-backfill',JSON.stringify({migrated,warnings}),new Date().toISOString()).run();
  return Response.json({migrated,warnings});
}catch(e){return failure(e);}}
