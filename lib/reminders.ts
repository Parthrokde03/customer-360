import type { RecordItem } from '../db/schema';
export function reminders(rows:RecordItem[], today:string) {
  const alerts:{id:string;category:'overdue'|'meetings'|'critical'|'escalations';priority:'urgent'|'high'|'normal';title:string;message:string;record:RecordItem;kind:string}[]=[];
  for(const r of rows) {
    const add=(type:typeof alerts[number]['category'],event:string,title:string,priority:typeof alerts[number]['priority']='high')=>alerts.push({id:`n-${event}-${r.id}`,category:type,priority,title,message:r.title,record:r,kind:r.kind});
    if(r.kind==='action'&&r.status!=='Closed'&&r.status!=='Cancelled') {
      if(r.due&&r.due<today)add('overdue','overdue','Overdue commitment','urgent');
      else if(r.due&&r.due<=new Date(Date.parse(today)+3*86400000).toISOString().slice(0,10))add('overdue','due','Commitment due soon');
      if(r.confirmationRequired&&!r.confirmed&&r.closure)add('overdue','confirm','Customer confirmation pending');
    }
    if(r.kind==='meeting') {
      if(r.status==='Scheduled'&&r.date&&r.date>=today&&r.date<=new Date(Date.parse(today)+3*86400000).toISOString().slice(0,10))add('meetings','meeting','Upcoming customer meeting');
      if(r.status==='Completed'&&!rows.some(f=>f.kind==='feedback'&&f.meetingId===r.id))add('meetings','missing','Post-meeting feedback missing','normal');
    }
    if(r.kind==='feedback'&&r.sentiment==='Critical')add('critical','critical','Critical customer feedback','urgent');
    if(r.kind==='escalation'&&!['Resolved','Closed'].includes(r.status||''))add('escalations','escalation','Open escalation','urgent');
  }
  return alerts;
}
