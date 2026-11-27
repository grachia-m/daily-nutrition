import {translateText,normalizeSearch,recipeSearchText,supportedLanguages} from './i18n.js?v=2ef6e8d60c2d';
import {foods,recipes,weekPattern,spanishFoods,portionGroups} from './data.js?v=2ef6e8d60c2d';
import {foodsFor,spanishFor,recipesFor,validateCustomCatalog} from './custom-recipes.js?v=2ef6e8d60c2d';
export const localDate = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const parseDate = key => new Date(`${key}T12:00:00`);
export const addDays=(key,n)=>{const d=parseDate(key);d.setDate(d.getDate()+n);return localDate(d)};
export const weekday=key=>(parseDate(key).getDay()+6)%7;
export const weekStart=key=>addDays(key,-weekday(key));
export function dateRange(key,scope='week') {
 if(scope==='day')return [key];
 if(scope==='week')return Array.from({length:7},(_,i)=>addDays(weekStart(key),i));
 const d=parseDate(key),start=localDate(new Date(d.getFullYear(),d.getMonth(),1)),count=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
 return Array.from({length:count},(_,i)=>addDays(start,i));
}
export const round=v=>Math.round(v*10)/10;
export function nutrition(ingredients,catalog=foods){return Object.entries(ingredients).reduce((t,[id,g])=>{const f=catalog[id];if(!f)throw Error('Unknown ingredient');return t.map((v,i)=>v+f[i+2]*g/100)},[0,0,0,0]);}
export const sumNutrition=rows=>rows.reduce((t,row)=>t.map((v,i)=>v+row[i]),[0,0,0,0]);
export const activeProfile=state=>state.profiles.find(p=>p.id===state.activeProfileId)||state.profiles[0];
export const shoppingProfiles=state=>state.profiles.filter(p=>p.inShopping);
export const isTraining=(key,state,person=activeProfile(state))=>person.trainingOverrides?.[key] ?? person.trainingDays.includes(weekday(key));
export const dayTarget=(key,state,person=activeProfile(state))=>person.kcal+(isTraining(key,state,person)?person.bonus:0);
export const householdTarget=(key,state)=>shoppingProfiles(state).reduce((t,p)=>t+dayTarget(key,state,p),0);
export function recipeAmounts(recipe,person){
 const group=portionGroups[recipe.portionGroup];if(!group)return {};
 return {...group.defaults,...(person.id==='wife'?group.wifeDefaults||{}:{}),...(person.recipeAmounts?.[recipe.portionGroup]||{})};
}
export function planDay(key,state,person=activeProfile(state)){
 const ids=state.overrides?.[key] || weekPattern[weekday(key)];
 const base=ids.map(id=>recipesFor(state).find(r=>r.id===id));
 const prepared=base.map(r=>({recipe:r,fixed:recipeAmounts(r,person)}));
 let fixedCalories=0,variableCalories=0;
 for(const {recipe:r,fixed} of prepared){const ingredients={...r.ingredients,...fixed};for(const [food,g]of Object.entries(ingredients)){const kcal=foodsFor(state)[food][2]*g/100;if(Object.hasOwn(fixed,food))fixedCalories+=kcal;else variableCalories+=kcal;}}
 const target=dayTarget(key,state,person),factor=(target-fixedCalories)/variableCalories;
 if(!Number.isFinite(factor)||factor<=0)throw Error('Fixed amounts exceed daily target');
 return prepared.map(({recipe:r,fixed},slot)=>{const ingredients=Object.fromEntries(Object.entries({...r.ingredients,...fixed}).map(([id,g])=>[id,Object.hasOwn(fixed,id)?g:round(g*factor)]));return {...r,slot,ingredients,macros:nutrition(ingredients,foodsFor(state)),factor,personId:person.id,fixedIngredients:Object.keys(fixed)}});
}
export function searchReplacements(state,key,slot,query=''){
 if(!Number.isInteger(slot)||slot<0||slot>3)return [];
 const q=normalizeSearch(query);
 return recipesFor(state).filter(r=>r.slot===slot&&normalizeSearch([recipeSearchText(r,state),...Object.keys(r.ingredients).flatMap(id=>[foodsFor(state)[id][0],spanishFor(state,id),...['en','es'].map(lang=>translateText(foodsFor(state)[id][0],lang))])].join(' ')).includes(q)).map(r=>portionForRecipe(r.id,key,state));
}
export function setMeal(state,key,slot,id){
 const recipe=recipesFor(state).find(r=>r.id===id);if(!recipe||recipe.slot!==slot)throw Error('Choose a recipe for the same meal type');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||localDate(parseDate(key))!==key)throw Error('Invalid date');
 const ids=[...(state.overrides[key]||weekPattern[weekday(key)])];ids[slot]=id;
 return {...state,overrides:{...state.overrides,[key]:ids}};
}
export function setRecipeAmounts(state,personId,groupId,values){
 const group=portionGroups[groupId],person=state.profiles.find(p=>p.id===personId);if(!group||!person)throw Error('Unknown portion settings');
 for(const [food,g]of Object.entries(values)){const rule=group.fields[food];if(!rule||!Number.isFinite(g)||g<rule.min||g>rule.max||(rule.wholeEggs&&g%50!==0))throw Error('Invalid ingredient amount');}
 const profiles=state.profiles.map(p=>p.id!==personId?p:{...p,recipeAmounts:{...p.recipeAmounts,[groupId]:{...p.recipeAmounts?.[groupId],...values}}});
 return {...state,profiles};
}
export function removeProfile(state,id,removedAt=new Date().toISOString()){
 if(state.profiles.length<=1)throw Error('At least one participant must remain');
 const index=state.profiles.findIndex(p=>p.id===id);if(index<0)throw Error('Participant not found');
 const profile=structuredClone(state.profiles[index]),profiles=state.profiles.filter(p=>p.id!==id);
 return {...state,profiles,activeProfileId:state.activeProfileId===id?profiles[0].id:state.activeProfileId,archivedProfiles:[...state.archivedProfiles,{profile,index,removedAt}]};
}
export function restoreProfile(state,id){
 if(state.profiles.length>=8)throw Error('Up to eight active participants');
 const entry=state.archivedProfiles.find(x=>x.profile.id===id);if(!entry)throw Error('Archived participant not found');
 const profiles=[...state.profiles];profiles.splice(Math.min(entry.index,profiles.length),0,structuredClone(entry.profile));
 return {...state,profiles,activeProfileId:id,archivedProfiles:state.archivedProfiles.filter(x=>x.profile.id!==id)};
}

export function portionForRecipe(id,key,state,person=activeProfile(state)){
 const r=recipesFor(state).find(r=>r.id===id);if(!r)throw Error('Unknown recipe');
 const planned=planDay(key,state,person),current=planned.find(m=>m.id===id);if(current)return current;
 const ids=planned.map(m=>m.id);ids[r.slot]=id;
 const proposed={...state,overrides:{...state.overrides,[key]:ids}};
 return planDay(key,proposed,person)[r.slot];
}
export function householdRecipe(id,key,state){
 const people=shoppingProfiles(state),portions=people.map(p=>({person:p,meal:portionForRecipe(id,key,state,p)}));
 const ingredients={};for(const {meal} of portions)for(const [food,g]of Object.entries(meal.ingredients))ingredients[food]=round((ingredients[food]||0)+g);
 return {portions,ingredients,macros:sumNutrition(portions.map(p=>p.meal.macros))};
}
export function basket(dates,state,personIds=null){
 const people=personIds?state.profiles.filter(p=>personIds.includes(p.id)):shoppingProfiles(state),sums={},byPerson={};
 for(const person of people){byPerson[person.id]={};for(const key of dates)for(const meal of planDay(key,state,person))for(const [id,g]of Object.entries(meal.ingredients)){sums[id]=(sums[id]||0)+g;byPerson[person.id][id]=(byPerson[person.id][id]||0)+g;}}
 return Object.entries(sums).map(([id,g])=>({id,name:foodsFor(state)[id][0],spanish:spanishFor(state,id),category:foodsFor(state)[id][1],grams:round(g),byPerson:Object.fromEntries(people.map(p=>[p.id,round(byPerson[p.id][id]||0)]))})).sort((a,b)=>a.category.localeCompare(b.category,'ru')||a.name.localeCompare(b.name,'ru'));
}
export const basketKey=(dates,item)=>`${dates[0]}:${dates.at(-1)}:${item.id}:${item.grams}`;
export function resizeWeight(person,weight){
 const base=person.weightBase||{weight:person.weight,kcal:person.kcal};
 const kcal=person.linkWeight?Math.round(base.kcal*weight/base.weight/10)*10:person.kcal;
 return {...person,weight,weightBase:base,kcal:Math.max(1200,Math.min(5000,kcal))};
}
// Mifflin–St Jeor estimates resting expenditure, not daily calorie requirements.
// Activity multiplication and the user's chosen adjustment are a planning estimate.
export function estimateCalories(person){
 const {weight,height,age,sex,activity,adjustment}=person;
 if(!Number.isFinite(height)||height<130||height>220||!Number.isFinite(age)||age<18||age>100||!Number.isFinite(weight)||weight<40||weight>180||!['male','female'].includes(sex)||![1.2,1.375,1.55,1.725].includes(activity))return null;
 const resting=10*weight+6.25*height-5*age+(sex==='male'?5:-161),maintenance=resting*activity,target=Math.round(maintenance*(1+adjustment)/10)*10;
 return {resting:Math.round(resting),maintenance:Math.round(maintenance),target,inRange:target>=1200&&target<=5000};
}
export function makeProfile(id,name,options={}){return {id,name,kcal:1800,weight:60,height:null,age:null,sex:'female',activity:1.2,adjustment:0,linkWeight:false,bonus:0,trainingDays:[],trainingOverrides:{},logged:{},water:{},inShopping:true,demo:true,recipeAmounts:{},...options};}
export function defaultState(){return {version:4,customFoods:{},customRecipes:[],archivedProfiles:[],profiles:[makeProfile('me','Я',{kcal:2400,weight:75,sex:'male',trainingDays:[0,2,4],bonus:150}),makeProfile('wife','Жена')],activeProfileId:'me',overrides:{},bought:{},profileNote:''};}
const legacyRecipe=id=>id==='chicken-buckwheat'?'chicken-brown-rice':id;
export function migrateState(raw){
 if(!raw||typeof raw!=='object')throw Error('Invalid backup');
 let s=structuredClone(raw);
 if(s.version===1){
  const seed=defaultState(),me=seed.profiles[0];
  for(const key of ['kcal','weight','linkWeight','weightBase','bonus','trainingDays','trainingOverrides','logged','water'])if(Object.hasOwn(s,key))me[key]=s[key];
  seed.overrides=s.overrides||{};seed.bought=s.bought||{};seed.profileNote=s.profileNote||'';s=seed;
 }
 if(s.version===2){s.version=3;s.archivedProfiles=[];s.profiles?.forEach(p=>{p.recipeAmounts={};});}
 if(s.version===3){s.version=4;s.customFoods={};s.customRecipes=[];}
 if(s.version!==4)throw Error('Unsupported backup');
 if(s.overrides&&typeof s.overrides==='object')s.overrides=Object.fromEntries(Object.entries(s.overrides).map(([date,ids])=>[date,Array.isArray(ids)?ids.map(legacyRecipe):ids]));
 validateState(s);return s;
}
export function validateState(s){
 if(s.language!==undefined&&!supportedLanguages.includes(s.language))throw Error('Invalid language');
 const obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o),finite=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max,keyOk=k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&localDate(parseDate(k))===k;
 if(!s||s.version!==4||!Array.isArray(s.archivedProfiles)||!Array.isArray(s.profiles)||s.profiles.length<1||s.profiles.length>8||!s.profiles.some(p=>p.id===s.activeProfileId)||typeof s.profileNote!=='string'||s.profileNote.length>20000||!obj(s.overrides)||!obj(s.bought))throw Error('Invalid state');
 validateCustomCatalog(s);
 const ids=new Set();
 for(const entry of s.archivedProfiles)if(!obj(entry)||!obj(entry.profile)||!Number.isInteger(entry.index)||entry.index<0||entry.index>7||typeof entry.removedAt!=='string'||!Number.isFinite(Date.parse(entry.removedAt)))throw Error('Invalid archive');
 for(const p of [...s.profiles,...s.archivedProfiles.map(entry=>entry.profile)]){
  if(!obj(p)||typeof p.id!=='string'||!/^[a-z0-9-]{1,50}$/.test(p.id)||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>40||!finite(p.kcal,1200,5000)||!finite(p.weight,40,180)||!(p.height===null||finite(p.height,130,220))||!(p.age===null||finite(p.age,18,100))||!['male','female'].includes(p.sex)||![1.2,1.375,1.55,1.725].includes(p.activity)||![-.15,0,.1].includes(p.adjustment)||typeof p.inShopping!=='boolean'||typeof p.linkWeight!=='boolean'||typeof p.demo!=='boolean'||!finite(p.bonus,0,1000)||!Array.isArray(p.trainingDays)||!p.trainingDays.every(d=>Number.isInteger(d)&&d>=0&&d<=6)||!obj(p.trainingOverrides)||!obj(p.logged)||!obj(p.water))throw Error('Invalid profile');
  ids.add(p.id);
  if(!obj(p.recipeAmounts))throw Error('Invalid portion preferences');
  for(const [groupId,values]of Object.entries(p.recipeAmounts)){
   const group=portionGroups[groupId];if(!group||!obj(values))throw Error('Invalid recipe group');
   for(const [food,g]of Object.entries(values)){const rule=group.fields[food];if(!rule||!finite(g,rule.min,rule.max)||(rule.wholeEggs&&g%50!==0))throw Error('Invalid ingredient amounts');}
  }
  if(p.weightBase&&(!obj(p.weightBase)||!finite(p.weightBase.weight,40,180)||!finite(p.weightBase.kcal,1200,5000)))throw Error('Invalid baseline');
  if(!Object.entries(p.trainingOverrides).every(([k,v])=>keyOk(k)&&typeof v==='boolean'))throw Error('Invalid training');
  if(!Object.entries(p.water).every(([k,v])=>keyOk(k)&&finite(v,0,20000)))throw Error('Invalid water');
  if(!Object.entries(p.logged).every(([k,v])=>/^\d{4}-\d{2}-\d{2}:[0-3]$/.test(k)&&keyOk(k.slice(0,10))&&obj(v)&&Array.isArray(v.macros)&&v.macros.length===4&&v.macros.every(n=>finite(n,0,20000))&&recipesFor(s).some(r=>r.id===legacyRecipe(v.id))))throw Error('Invalid diary');
 }
 if(!Object.entries(s.overrides).every(([key,ids])=>keyOk(key)&&Array.isArray(ids)&&ids.length===4&&ids.every((id,i)=>recipesFor(s).some(r=>r.id===id&&r.slot===i))))throw Error('Invalid meals');
 if(!Object.entries(s.bought).every(([k,v])=>k.length<120&&typeof v==='boolean'))throw Error('Invalid purchases');
 return true;
}
