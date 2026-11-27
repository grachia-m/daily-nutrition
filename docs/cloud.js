import {t,html,getLanguage} from './i18n.js?v=275e6c727d94';
import {supabaseConfig} from './config.js?v=275e6c727d94';
export function authErrorMessage(error){
 const text=String(error?.message||'');
 if(/invalid login credentials/i.test(text))return t('Неверный email или пароль.');
 if(/email not confirmed/i.test(text))return t('Подтверди email по письму, затем войди.');
 if(/rate|too many|after.*seconds/i.test(text))return t('Слишком много попыток. Подожди немного и повтори.');
 if(/email address.*invalid|invalid email/i.test(text))return t('Проверь адрес электронной почты.');
 if(/password/i.test(text))return t('Пароль не соответствует требованиям. Используй не менее 8 символов.');
 if(/email.*(not authorized|restricted)|smtp/i.test(text))return t('Не удалось отправить письмо. Для регистрации может потребоваться настройка почты в Supabase.');
 if(/network|fetch|load/i.test(text))return t('Нет соединения с сервером. Проверь интернет и повтори.');
 return t('Не удалось выполнить запрос. Попробуй ещё раз.');
}
export function userCacheKey(userId){if(!/^[a-f0-9-]{36}$/.test(userId))throw Error('Invalid account');return html`ration-account-${userId}-v4`;}
export function createSyncQueue({save,onStatus,delay=800,setTimer=setTimeout,clearTimer=clearTimeout}){
 let timer=null,latest=null,running=false,paused=false,revision=0,generation=0;
 async function flush(){
  if(running||paused||!latest)return;
  const value=latest;latest=null;running=true;onStatus('saving');
  const mine=generation;
  try{const next=await save(value,revision);if(mine!==generation)return;revision=next;onStatus(latest?'saving':'saved');}
  catch(error){if(mine!==generation)return;latest=latest||value;if(error?.code==='40001'){paused=true;onStatus('conflict');}else{paused=true;onStatus('offline');}}
  finally{if(mine===generation){running=false;if(latest&&!paused)timer=setTimer(flush,delay);}}
 }
 return {
  reset(nextRevision=0){generation++;clearTimer(timer);latest=null;paused=false;running=false;revision=nextRevision;},
  enqueue(state){latest=structuredClone(state);if(!paused){clearTimer(timer);timer=setTimer(flush,delay);}},
  flush,
  pause(status='conflict'){paused=true;onStatus(status);},
  retry(){if(!paused)return;paused=false;return flush();},
  get revision(){return revision;}
 };
}
export async function openCloud(){
 const {createClient}=await import(supabaseConfig.sdkUrl);
 const client=createClient(supabaseConfig.url,supabaseConfig.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return {
  auth:client.auth,
  async load(){const {data,error}=await client.rpc('load_nutrition_state');if(error)throw error;return data;},
  async save(state,revision,displayName){const {data,error}=await client.rpc('save_nutrition_state',{p_state:state,p_expected_revision:revision,p_display_name:displayName||null});if(error)throw error;return Number(data);}
 };
}
