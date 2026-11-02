'use client';
import {useEffect,useState} from 'react';
type JobState={runs:{lastRunAt?:string;lastError?:string}[];delivery:{id:string;channel:string;status:string;lastError?:string}[];configured:{email:boolean;push:boolean};error?:string};
export function JobStatus(){const [data,setData]=useState<JobState|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const load=async()=>{const r=await fetch('/api/jobs');if(r.ok)setData(await r.json() as JobState);};useEffect(()=>{void load();},[]);
  return <section className="admin-section"><h3>Reminder worker</h3><p>Background checks run independently of the browser when the local worker service is running.</p><p>Last run: {data?.runs[0]?.lastRunAt?new Date(data.runs[0].lastRunAt).toLocaleString():'Not run yet'}</p><p>Email: {data?.configured.email?'Provider configured':'No provider configured'} · Push: {data?.configured.push?'Provider configured':'No provider configured'}</p><button className="btn-secondary" disabled={busy} onClick={async()=>{setBusy(true);try{const r=await fetch('/api/jobs',{method:'POST'});const result=await r.json() as {events:number;error?:string};if(!r.ok)throw Error(result.error);setMessage(`Checked workspace; ${result.events} current alerts.`);await load();}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}>Run reminder check now</button><p role="status">{message||data?.runs[0]?.lastError}</p>
    {data?.delivery.length? <table><thead><tr><th>Channel</th><th>State</th><th>Detail</th></tr></thead><tbody>{data.delivery.slice(-30).map(d=><tr key={d.id}><td>{d.channel}</td><td>{d.status}</td><td>{d.lastError||''}</td></tr>)}</tbody></table>:<p>No external deliveries queued. In-app reminders work without external credentials.</p>}
  </section>;
}
