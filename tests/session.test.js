import test from 'node:test';
import assert from 'node:assert/strict';
import {startAccountController} from '../dist/session.js';
import {defaultState} from '../dist/engine.js';
import {setLanguage} from '../dist/i18n.js';
function fixture({failLogout=false,loggedIn=true}={}){
 const nodes=new Map(),storage=new Map(),calls=[],statuses=[],notifications=[];let current=defaultState(),authListener;
 const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'',innerHTML:'',textContent:'',classList:{toggle(){}},isConnected:true});return nodes.get(id);};
 globalThis.document={documentElement:{lang:'ru'},getElementById:node,querySelectorAll:()=>[]};globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
 const session={user:{id:'00000000-0000-4000-a000-000000000001',email:'test@example.test',user_metadata:{}}};
 const cloud={load:async()=>({state:current,revision:2}),save:async(state,revision)=>{calls.push('save');current=state;return revision+1;},auth:{getSession:async()=>({data:{session:loggedIn?session:null}}),onAuthStateChange:listener=>{authListener=listener;},signOut:async()=>{calls.push('signOut');return {error:failLogout?new Error('network'):null};}}};
 const controller=startAccountController({getState:()=>current,applyState:state=>{current=state;},onStatus:s=>statuses.push(s),onUser:()=>{},notify:s=>notifications.push(s),legacyKey:'old',cloudFactory:async()=>cloud});
 return {controller,node,calls,statuses,notifications,get state(){return current;},ready:async()=>{for(let i=0;i<10&&!authListener;i++)await new Promise(resolve=>setImmediate(resolve));assert.ok(authListener);}};
}
test('sign out flushes pending data, removes the session and returns to the login form',async()=>{
 const f=fixture();await f.ready();assert.equal(f.node('appRoot').hidden,false);
 f.state.profileNote='Keep this note';f.controller.persist(f.state);await f.controller.logout();
 assert.deepEqual(f.calls,['save','signOut']);assert.equal(f.controller.user,null);assert.equal(f.node('appRoot').hidden,true);assert.equal(f.node('authRoot').hidden,false);assert.ok(f.statuses.includes('signed-out'));
});
test('failed sign out keeps the current account and reports the error',async()=>{
 const f=fixture({failLogout:true});await f.ready();await f.controller.logout();assert.ok(f.controller.user);assert.equal(f.node('appRoot').hidden,false);assert.match(f.notifications[0],/Не удалось выйти/);
});
test('language switching keeps partially entered auth fields',async()=>{
 const f=fixture({loggedIn:false});await f.ready();f.node('authEmail').value='person@example.test';f.node('authPassword').value='only-a-test-value';
 setLanguage('es',{notify:false});f.controller.refreshLanguage();assert.match(f.node('authRoot').innerHTML,/Entrar/);assert.equal(f.node('authEmail').value,'person@example.test');assert.equal(f.node('authPassword').value,'only-a-test-value');setLanguage('ru',{notify:false});
});
