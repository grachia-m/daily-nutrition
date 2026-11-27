import test from 'node:test';
import assert from 'node:assert/strict';
import {createSyncQueue,userCacheKey,authErrorMessage} from '../dist/cloud.js';
const fakeTimer=()=>0,clear=()=>{};
test('cloud queue serializes saves, keeps the latest change and advances revision',async()=>{
 const writes=[],statuses=[];let release;const q=createSyncQueue({save:(value,rev)=>{writes.push({value,rev});return writes.length===1?new Promise(r=>release=r):Promise.resolve(rev+1)},onStatus:s=>statuses.push(s),setTimer:fakeTimer,clearTimer:clear});q.reset(4);q.enqueue({value:1});const pending=q.flush();q.enqueue({value:2});q.enqueue({value:3});release(5);await pending;await q.flush();assert.deepEqual(writes,[{value:{value:1},rev:4},{value:{value:3},rev:5}]);assert.equal(q.revision,6);assert.equal(statuses.at(-1),'saved');
});
test('cloud conflict pauses writes and does not silently overwrite a newer device',async()=>{
 let writes=0;const statuses=[];const q=createSyncQueue({save:async()=>{writes++;throw {code:'40001'}},onStatus:s=>statuses.push(s),setTimer:fakeTimer,clearTimer:clear});q.enqueue({x:1});await q.flush();q.enqueue({x:2});await q.flush();assert.equal(writes,1);assert.equal(statuses.at(-1),'conflict');q.reset(10);assert.equal(q.revision,10);
});
test('network save failure retains pending changes for explicit retry',async()=>{
 let fail=true,result;const q=createSyncQueue({save:async value=>{if(fail)throw Error('network');result=value;return 1},onStatus:()=>{},setTimer:fakeTimer,clearTimer:clear});q.enqueue({data:'retained'});await q.flush();fail=false;await q.retry();assert.deepEqual(result,{data:'retained'});assert.equal(q.revision,1);
});
test('switching accounts invalidates completion of a previous in-flight save',async()=>{
 let release;const q=createSyncQueue({save:()=>new Promise(r=>release=r),onStatus:()=>{},setTimer:fakeTimer,clearTimer:clear});q.enqueue({a:1});const old=q.flush();q.reset(8);release(1);await old;assert.equal(q.revision,8);
});
test('account caches are scoped by user and errors avoid exposing auth detail',()=>{
 const one=userCacheKey('11111111-1111-1111-1111-111111111111'),two=userCacheKey('22222222-2222-2222-2222-222222222222');assert.notEqual(one,two);assert.throws(()=>userCacheKey('../other'));assert.equal(authErrorMessage({message:'Invalid login credentials'}),'Неверный email или пароль.');
});
