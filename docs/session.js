import {openCloud,authErrorMessage,userCacheKey,createSyncQueue} from './cloud.js';
import {defaultState,migrateState} from './engine.js';
const authEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function startAccountController({getState,applyState,onStatus,onUser,notify,legacyKey}){
 let cloud,user=null,queue=null,ready=false,mode='login',loadingUser=null,epoch=0;
 const root=document.getElementById('authRoot'),app=document.getElementById('appRoot');
 const msg=(text,error=false)=>{const node=document.getElementById('authMessage');if(node){node.textContent=text;node.classList.toggle('error',error);}};
 function authForm(next=mode){
  mode=next;root.hidden=false;app.hidden=true;
  root.innerHTML=`<div class="auth-layout"><section class="auth-story"><a class="auth-brand" href="#">рацион<span>.</span></a><div class="auth-story-copy"><div class="eyebrow">ПИТАНИЕ В ТВОЁМ РИТМЕ</div><h1>Меньше суеты.<br>Больше заботы о себе.</h1><p>Любимые блюда, личные порции и один список покупок для всей семьи.</p><div class="auth-benefits"><span>План на неделю</span><span>Свои рецепты</span><span>Общая корзина</span></div></div><p class="auth-story-foot">Маленькие привычки. Большие перемены.</p></section><section class="auth-form-side"><div class="auth-card"><div class="eyebrow">ТВОЁ ПРОСТРАНСТВО</div><h2>${mode==='login'?'С возвращением':'Создать аккаунт'}</h2><p class="auth-subtitle">${mode==='login'?'Войди, чтобы открыть свой рацион.':'Сохрани свой рацион и продолжай с любого устройства.'}</p><form id="accountForm">${mode==='register'?'<label for="authName">Как к тебе обращаться<input id="authName" name="displayName" maxlength="80" autocomplete="name" placeholder="Твоё имя"></label>':''}<label for="authEmail">Логин (email)<input id="authEmail" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label><label for="authPassword">Пароль<input id="authPassword" name="password" type="password" autocomplete="${mode==='login'?'current-password':'new-password'}" ${mode==='register'?'minlength="8"':''} required placeholder="${mode==='login'?'Твой пароль':'Не менее 8 символов'}"></label>${mode==='register'?'<label for="authConfirm">Повтори пароль<input id="authConfirm" type="password" autocomplete="new-password" minlength="8" required placeholder="Ещё раз"></label>':''}<button class="primary auth-submit" id="authSubmit" type="submit" ${ready?'':'disabled'}>${ready?(mode==='login'?'Войти':'Зарегистрироваться'):'Подключаемся…'}</button></form><p id="authMessage" role="status" aria-live="polite"></p><p class="auth-switch">${mode==='login'?'Нет аккаунта?':'Уже есть аккаунт?'} <button id="authToggle">${mode==='login'?'Зарегистрироваться':'Войти'}</button></p><button class="auth-retry" id="authRetry" ${ready?'hidden':''}>Повторить подключение</button><p class="auth-small">Планы и рецепты доступны только твоему аккаунту. Пароль обрабатывает Supabase Auth.</p></div></section></div>`;
  document.getElementById('authToggle').onclick=()=>authForm(mode==='login'?'register':'login');
  document.getElementById('authRetry').onclick=connect;
  document.getElementById('accountForm').onsubmit=submit;
 }
 async function submit(event){
  event.preventDefault();if(!ready)return;
  const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPassword').value;
  if(mode==='register'&&password!==document.getElementById('authConfirm').value){msg('Пароли не совпадают.',true);return;}
  const button=document.getElementById('authSubmit');button.disabled=true;msg('');
  try{
   const result=mode==='login'?await cloud.auth.signInWithPassword({email,password}):await cloud.auth.signUp({email,password,options:{data:{display_name:document.getElementById('authName').value.trim()},emailRedirectTo:location.origin+location.pathname}});
   if(result.error)throw result.error;
   document.getElementById('authPassword').value='';
   if(result.data.session)await acceptSession(result.data.session);
   else msg('Проверь письмо и подтверди email. Затем вернись сюда и войди. Если письмо не приходит, проверь спам или настройку почты проекта.');
  }catch(error){msg(authErrorMessage(error),true);}
  finally{if(button.isConnected)button.disabled=false;}
 }
 function cache(state,pending){if(!user)return true;try{localStorage.setItem(userCacheKey(user.id),JSON.stringify({state,revision:queue?.revision||0,pending}));return true;}catch{return false;}}
 async function acceptSession(session){
  if(!session){epoch++;user=null;loadingUser=null;queue?.reset();onUser(null);onStatus('signed-out');applyState(defaultState());authForm('login');return;}
  if(user?.id===session.user.id||loadingUser===session.user.id)return;
  loadingUser=session.user.id;const mine=++epoch;msg('Открываю твой рацион…');
  try{
   const remote=await cloud.load();if(mine!==epoch)return;
   user=session.user;onUser(user);const displayName=String(user.user_metadata?.display_name||'').slice(0,80);
   queue=createSyncQueue({save:(state,revision)=>cloud.save(state,revision,displayName),onStatus:status=>{onStatus(status);if(status==='saved')cache(getState(),false);else if(status==='saving')cache(getState(),true);}});
   queue.reset(Number(remote?.revision||0));
   let cached=null;try{cached=JSON.parse(localStorage.getItem(userCacheKey(user.id)));if(cached?.state)cached.state=migrateState(cached.state);}catch{cached=null;}
   let next=remote?.state?migrateState(remote.state):cached?.state||defaultState();
   let conflict=false,pending=false;
   if(cached?.pending){next=cached.state;pending=true;conflict=Number(cached.revision)!==Number(remote?.revision||0);}
   applyState(next);root.hidden=true;app.hidden=false;onStatus(conflict?'conflict':'saved');
   if(conflict)queue.pause('conflict');else if(!remote?.state||pending){cache(next,true);queue.enqueue(next);}
   else cache(next,false);
  }catch(error){user=null;onUser(null);msg('Не удалось загрузить аккаунт из базы. Проверь соединение и войди ещё раз.',true);onStatus('offline');}
  finally{loadingUser=null;}
 }
 async function connect(){
  ready=false;authForm();msg('Подключаюсь к аккаунтам…');
  try{cloud=await openCloud();ready=true;authForm();const {data,error}=await cloud.auth.getSession();if(error)throw error;await acceptSession(data.session);cloud.auth.onAuthStateChange((event,session)=>{if(event==='TOKEN_REFRESHED')return;queueMicrotask(()=>acceptSession(session));});}
  catch(error){ready=false;authForm();msg('Не удалось подключиться. Проверь интернет и повтори.',true);}
 }
 authForm('login');void connect();
 return {
  persist(state){const localOk=cache(state,true);if(user)queue?.enqueue(state);return localOk;},
  async logout(){await queue?.flush();const {error}=await cloud.auth.signOut();if(error){notify('Не удалось выйти. Проверь соединение.');return;}await acceptSession(null);},
  retry(){return queue?.retry();},
  async reload(){if(!user)return;try{sessionStorage.setItem('ration-recovery-'+user.id,JSON.stringify(getState()));const remote=await cloud.load();if(!remote?.state)return;applyState(migrateState(remote.state));queue.reset(Number(remote.revision));cache(getState(),false);onStatus('saved');notify('Загружена облачная версия');}catch{notify('Не удалось загрузить облачную версию');}},
  recover(){if(!user)return;try{const saved=sessionStorage.getItem('ration-recovery-'+user.id);if(!saved)throw Error();const next=migrateState(JSON.parse(saved));applyState(next);this.persist(next);notify('Локальная копия восстановлена');}catch{notify('Нет копии до загрузки облачной версии');}},
  importLegacy(){try{const raw=localStorage.getItem(legacyKey);if(!raw)throw Error();const next=migrateState(JSON.parse(raw));applyState(next);this.persist(next);notify('Прежний рацион перенесён в аккаунт');}catch{notify('На устройстве не найден прежний рацион');}},
  get user(){return user;}
 };
}
