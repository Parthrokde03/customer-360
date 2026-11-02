import type { RecordItem } from '../db/schema';

export type Role = 'admin' | 'ceo' | 'function_head' | 'relationship_owner' | 'action_owner';
export type Membership = { email: string; name: string; role: Role; functions: string[]; customers: string[]; active: boolean };
export const privileged = (m: Membership) => m.role === 'admin' || m.role === 'ceo';
export function canRead(m: Membership, r: RecordItem, customer?: RecordItem) {
  if (!m.active) return false;
  if (customer?.sensitive && customer.createdBy !== m.email && !(Array.isArray(customer.allowedEmails) && customer.allowedEmails.includes(m.email))) return false;
  if (r.sensitive && r.createdBy !== m.email && !(Array.isArray(r.allowedEmails) && r.allowedEmails.includes(m.email))) return false;
  if (privileged(m)) return true;
  const c = r.kind === 'customer' ? r : customer;
  if (m.role === 'function_head') return !!c && m.functions.includes(c.function || '');
  if (m.role === 'relationship_owner') return !!c && (c.ownerEmail === m.email || m.customers.includes(c.id));
  return r.kind === 'action' && r.ownerEmail === m.email;
}
export function canWrite(m: Membership, r: RecordItem, customer?: RecordItem) {
  return canRead(m, r, customer) && (m.role !== 'action_owner' || r.kind === 'action');
}
export function validateActionChange(before: RecordItem | undefined, after: RecordItem, member: Membership) {
  if (before?.confirmationRequired && !after.confirmationRequired) throw new Error('Required customer confirmation cannot be removed.');
  if (after.status === 'Closed' && (!after.closure?.trim() || (after.confirmationRequired && !after.confirmed))) throw new Error('Closure notes and required customer confirmation are required.');
  if (member.role === 'action_owner') {
    if (!before) throw new Error('Only leadership or relationship managers may assign actions.');
    for (const field of ['ownerEmail', 'owner', 'customerId', 'feedbackId', 'meetingId', 'due', 'priority', 'confirmationRequired', 'sensitive', 'allowedEmails']) {
      if (JSON.stringify(before[field] ?? (field==='allowedEmails'?[]:field==='sensitive'?false:undefined)) !== JSON.stringify(after[field] ?? (field==='allowedEmails'?[]:field==='sensitive'?false:undefined))) throw new Error('Action owners may update progress, evidence and closure only.');
    }
    if (before.status === 'Closed' && after.status !== 'Closed') throw new Error('A manager must reopen a closed action.');
  }
}
