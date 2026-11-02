import { z } from 'zod';
export const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, 'Enter a valid calendar date.');
const text = z.string().max(10000);
const optionalText = text.optional();
export const kindSchema = z.enum(['customer','feedback','action','meeting','escalation']);
export const recordSchema = z.object({
  title: z.string().trim().min(1).max(4000), customerId: z.string().max(100).optional(),
  owner: z.string().max(200).optional(), ownerEmail: z.string().email().optional(),
  date: date.optional(), due: date.optional(), status: z.string().max(40).optional(),
  sentiment: z.enum(['Positive','Neutral','Concerned','Critical']).optional(),
  priority: z.enum(['Low','Medium','High','Critical']).optional(),
  confirmationRequired: z.boolean().optional(), confirmed: z.boolean().optional(), closure: optionalText,
  sensitive: z.boolean().optional(), allowedEmails: z.array(z.string().email().transform(v=>v.toLowerCase())).max(100).optional(),
  description: optionalText, summary: optionalText, function: z.string().max(100).optional(), location: optionalText,
  feedbackId: z.string().max(100).optional(), meetingId: z.string().max(100).optional(),
  participants: z.array(z.string().max(200)).max(100).optional(),
  attachments: z.array(z.object({id:z.string().uuid(),name:z.string().max(255),type:z.string().max(100),size:z.number().max(5*1024*1024)})).max(10).optional(),
}).passthrough();
export function validateRecord(kind: string, value: unknown) {
  const data = recordSchema.parse(value);
  // Authoritative envelope fields are never accepted from callers.
  for (const key of ['id','kind','workspace','createdBy','createdAt','updatedAt','version']) delete data[key];
  if (kind !== 'customer' && !data.customerId) throw new Error('Select a customer.');
  if (kind === 'action') {
    date.parse(data.due);
    if (!data.owner?.trim() || !data.ownerEmail) throw new Error('Select an authorized action owner.');
    z.enum(['Open','In Progress','Delayed','Closed']).parse(data.status);
  }
  if (kind === 'meeting') { date.parse(data.date); z.enum(['Scheduled','Completed','Cancelled','Rescheduled']).parse(data.status); }
  if (kind === 'feedback' || kind === 'escalation') date.parse(data.date);
  if (kind === 'escalation') z.enum(['Open','Under Review','In Progress','Resolved','Closed']).parse(data.status);
  return data;
}
