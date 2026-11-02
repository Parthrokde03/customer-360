'use client';
import {useEffect,useState} from 'react';
type Device={id:string;name:string;expiresAt:string;revoked:boolean};
export function DeviceAccess(){
  const [devices,setDevices]=useState<Device[]>([]),[token,setToken]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const load=async()=>{const r=await fetch('/api/devices');if(r.ok)setDevices(await r.json() as Device[]);};
  useEffect(()=>{void load();},[]);
  const post=async(data:unknown)=>{setBusy(true);setError('');try{const r=await fetch('/api/devices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json() as {token?:string;error?:string};if(!r.ok)throw Error(d.error);setToken(d.token||'');await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
  return <section className="admin-section"><h3>Mobile device access</h3><p>Connect the native app with a revocable, 30-day device key. It inherits your current role and never bypasses record restrictions.</p>
    <form onSubmit={e=>{e.preventDefault();void post({name:new FormData(e.currentTarget).get('name')});}}><label className="form-label">Device name<input name="name" required maxLength={80} placeholder="My work phone" className="form-input" /></label><button className="btn-secondary" disabled={busy}>Create device key</button></form>
    {token&&<div role="status"><p>Copy this key to your native app. It is shown once. Keep it private.</p><input aria-label="Device key" readOnly value={token} className="form-input" onFocus={e=>e.target.select()} /><button onClick={()=>setToken('')}>Hide key</button></div>}
    {error&&<p role="alert">{error}</p>}
    <ul>{devices.map(d=><li key={d.id}>{d.name} · {d.revoked?'Revoked':`Expires ${new Date(d.expiresAt).toLocaleDateString()}`} {!d.revoked&&<button disabled={busy} onClick={()=>void post({revoke:d.id})}>Revoke access</button>}</li>)}</ul>
  </section>;
}
