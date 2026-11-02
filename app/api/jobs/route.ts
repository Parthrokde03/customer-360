import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { context, checkOrigin, failure, HttpError } from '../../../lib/server-workspace';
import { workspaceJobs,deliveryOutbox } from '../../../db/schema';
import { runReminderJob } from '../../../lib/reminder-job';
export async function GET(){try{const {db,member,workspace}=await context();if(member.role!=='admin')throw new HttpError(403,'Administrator access required.');return Response.json({runs:await db.select().from(workspaceJobs).where(eq(workspaceJobs.workspace,workspace)),delivery:await db.select().from(deliveryOutbox).where(eq(deliveryOutbox.workspace,workspace)),configured:{email:!!env.EMAIL_API_KEY&&!!env.EMAIL_FROM,push:!!env.EXPO_ACCESS_TOKEN}});}catch(e){return failure(e);}}
export async function POST(req:Request){try{checkOrigin(req);await req.text();const {member,workspace}=await context();if(member.role!=='admin')throw new HttpError(403,'Administrator access required.');return Response.json(await runReminderJob(env.DB!,env,workspace));}catch(e){return failure(e);}}
