export type DeliveryConfig={EMAIL_API_KEY?:string;EMAIL_FROM?:string;APP_URL?:string;EXPO_ACCESS_TOKEN?:string};
export async function deliver(channel:string,id:string,email:string,pushToken:string|undefined,config:DeliveryConfig,request:typeof fetch=fetch) {
  // Deliberately omit customer names, feedback and other confidential content from lock-screen/email previews.
  const title='Customer 360 reminder';const text='You have a customer commitment or meeting that needs attention. Open Customer 360 to review your authorized notifications.';
  if(channel==='email') {
    if(!config.EMAIL_API_KEY||!config.EMAIL_FROM) return {status:'unconfigured' as const};
    const r=await request('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.EMAIL_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({from:config.EMAIL_FROM,to:[email],subject:title,text}),signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw Error(`Email provider returned ${r.status}`);
    const result=await r.json() as {id?:string};if(!result.id)throw Error('Email provider did not acknowledge the request.');
    return {status:'accepted' as const,providerId:result.id};
  }
  if(!pushToken||!config.EXPO_ACCESS_TOKEN)return {status:'unconfigured' as const};
  const r=await request('https://exp.host/--/api/v2/push/send',{method:'POST',headers:{Authorization:`Bearer ${config.EXPO_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({to:pushToken,title,body:text,data:{screen:'notifications'},sound:'default'}),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error(`Push provider returned ${r.status}`);
  const result=await r.json() as {data?:{status:string;id?:string;message?:string}};
  if(result.data?.status!=='ok'||!result.data.id)throw Error('Push provider rejected the notification.');
  return {status:'accepted' as const,providerId:result.data.id};
}
