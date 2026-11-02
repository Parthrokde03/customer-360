'use client';
import { useEffect, useState } from 'react';
import type { Membership } from '../lib/policy';
export function WorkspaceAccess({signedIn,onChange}:{signedIn:boolean;onChange:()=>Promise<void>}) {
  const [state,setState]=useState<{member:Membership;members:Membership[];invitations:{id:string;name:string;role:string}[]}|null>(null);
  const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const load=async()=>{const r=await fetch('/api/workspace');const d=await r.json() as {error?:string;member:Membership;members:Membership[];invitations:{id:string;name:string;role:string}[]};if(!r.ok)throw Error(d.error);setState(d);};
  useEffect(()=>{if(signedIn)load().catch(e=>setMessage(e.message));},[signedIn]);
  const post=async(body:unknown)=>{setBusy(true);try{const r=await fetch('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json() as {error?:string};if(!r.ok)throw Error(d.error);await load();await onChange();setMessage('Access settings saved. New members must accept their invitation after signing in.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}};
  if(!signedIn)return <p>Sign in to manage workspace access.</p>;
  return <section className="admin-section"><h3>Workspace members</h3><p role="status">{message}</p>
    {state?.invitations.map(i=><p key={i.id}>Workspace invitation: {i.role} <button className="btn-secondary" disabled={busy} onClick={async()=>{await post({operation:'accept',id:i.id});window.location.reload();}}>Accept invitation</button></p>)}
    <ul>{state?.members.map(m=><li key={m.email}>{m.name} · {m.email} · {m.role}{!m.active?' (disabled)':''}
      {state.member.role==='admin'&&m.email!==state.member.email&&<button className="btn-secondary" disabled={busy} onClick={()=>post({operation:'member',data:{...m,active:!m.active}})}>{m.active?'Disable':'Enable'}</button>}</li>)}</ul>
    {state?.member.role==='admin'&&<form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);void post({operation:'member',data:{email:fd.get('email'),name:fd.get('name'),role:fd.get('role'),functions:String(fd.get('functions')).split(',').map(s=>s.trim()).filter(Boolean),customers:String(fd.get('customers')).split(',').map(s=>s.trim()).filter(Boolean),active:true}});}}>
      <p>Invite a colleague or update an existing member. The colleague also needs access to this private Site.</p>
      <label className="form-label">Name<input name="name" required className="form-input" /></label>
      <label className="form-label">Email<input name="email" type="email" required className="form-input" /></label>
      <label className="form-label">Role<select name="role" className="form-select"><option value="relationship_owner">Relationship owner</option><option value="function_head">Function head</option><option value="action_owner">Action owner</option><option value="ceo">GCC leadership</option><option value="admin">Administrator</option></select></label>
      <label className="form-label">Functions (comma separated)<input name="functions" placeholder="IT, Finance" className="form-input" /></label>
      <label className="form-label">Customer IDs (optional; owners also see customers assigned to them)<input name="customers" className="form-input" /></label>
      <button className="btn-primary" disabled={busy}>Save membership</button>
    </form>}
  </section>;
}
