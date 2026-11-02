import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
const config=JSON.parse(readFileSync('dist/server/wrangler.json','utf8'));
const token=randomBytes(32).toString('hex');config.vars={...config.vars,LOCAL_REMINDER_TOKEN:token};config.main=resolve('dist/server/index.js');
config.assets={...config.assets,directory:resolve('dist/client'),run_worker_first:['/__local-reminders']};
mkdirSync('.sites-runtime',{recursive:true});writeFileSync('.sites-runtime/reminder-worker.json',JSON.stringify(config));
const child=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','.sites-runtime/reminder-worker.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','5175','--inspector-port','0','--test-scheduled'],{stdio:'inherit',env:{...process.env,WRANGLER_LOG:'error'}});
let stopped=false;let lastError='';const controller=new AbortController();
const stop=()=>{stopped=true;controller.abort();child.kill('SIGTERM');};process.on('SIGINT',stop);process.on('SIGTERM',stop);child.on('exit',()=>{stopped=true;controller.abort();});
while(!stopped){try{const response=await fetch('http://127.0.0.1:5175/__local-reminders',{method:'POST',headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.any([controller.signal,AbortSignal.timeout(30000)])});if(!response.ok)throw Error('Reminder worker returned '+response.status);await response.text();if(lastError)console.log('Reminder worker recovered.');lastError='';await sleep(300000,undefined,{signal:controller.signal});}catch(e){if(stopped)break;if(e.message!==lastError){console.error(e.message);lastError=e.message;}await sleep(5000,undefined,{signal:controller.signal}).catch(()=>{});}}

