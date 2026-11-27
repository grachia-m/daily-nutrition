import {foods,recipes,spanishFoods,mealPhotos} from './data.js';
export const foodsFor=state=>({...foods,...Object.fromEntries(Object.entries(state?.customFoods||{}).map(([id,v])=>[id,v.food]))});
export const spanishFor=(state,id)=>state?.customFoods?.[id]?.spanish||spanishFoods[id]||'';
export const recipesFor=state=>[...recipes,...(state?.customRecipes||[])];
export function validateCustomCatalog(state){
 const custom=state.customFoods,list=state.customRecipes;
 if(!custom||typeof custom!=='object'||Array.isArray(custom)||Object.keys(custom).length>500||!Array.isArray(list)||list.length>500)throw Error('Invalid custom catalog');
 for(const [id,value] of Object.entries(custom)){
  const f=value?.food;if(!/^food-[a-z0-9-]{8,50}$/.test(id)||foods[id]||!Array.isArray(f)||f.length!==6||typeof f[0]!=='string'||!f[0].trim()||f[0].length>120||typeof f[1]!=='string'||f[1].length>80||!f.slice(2).every((n,i)=>Number.isFinite(n)&&n>=0&&n<=(i===0?1000:100))||typeof value.spanish!=='string'||!value.spanish.trim()||value.spanish.length>160)throw Error('Invalid custom food');
 }
 const knownFoods=foodsFor(state),ids=new Set();
 for(const r of list){
  if(!r||Object.keys(r).some(k=>!['id','title','slot','time','subtitle','image','ingredients','steps','custom'].includes(k))||!/^recipe-[a-z0-9-]{8,50}$/.test(r.id)||ids.has(r.id)||typeof r.title!=='string'||r.title.trim().length<2||r.title.length>120||!Number.isInteger(r.slot)||r.slot<0||r.slot>3||!Number.isInteger(r.time)||r.time<1||r.time>240||!Object.hasOwn(mealPhotos,r.image)||typeof r.subtitle!=='string'||r.subtitle.length>200||!r.ingredients||Array.isArray(r.ingredients)||typeof r.ingredients!=='object'||Object.keys(r.ingredients).length<1||Object.keys(r.ingredients).length>30||!Object.entries(r.ingredients).every(([id,g])=>Object.hasOwn(knownFoods,id)&&Number.isFinite(g)&&g>0&&g<=5000)||!Array.isArray(r.steps)||r.steps.length<1||r.steps.length>15||!r.steps.every(s=>typeof s==='string'&&s.trim()&&s.length<=1500)||r.portionGroup||r.video||r.search)throw Error('Invalid custom recipe');
  if(!Object.entries(r.ingredients).some(([id,g])=>knownFoods[id][2]*g>0))throw Error('Recipe needs calories');ids.add(r.id);
 }
 return true;
}
export function matchIngredient(text,state){
 const norm=s=>s.toLocaleLowerCase('ru').replaceAll('ё','е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const q=norm(text),catalog=foodsFor(state),exact=Object.entries(catalog).filter(([id,f])=>norm(f[0])===q||norm(spanishFor(state,id))===q||id===q);
 if(exact.length===1)return exact[0][0];
 const aliases={'курица':'chicken','куриное филе':'chicken','куриная грудка':'chicken','индейка':'turkey','рис':'rice','овсянка':'oats','овсяные хлопья':'oats','молоко':'milk','яйцо':'egg','яйца':'egg','белок':'eggwhite','жидкий белок':'eggwhite','йогурт':'yogurt','творог':'cottage','cottage':'cottage','сыр':'cheese','протеин':'whey','ягоды':'berries','масло оливковое':'oil'};
 if(Object.hasOwn(aliases,q))return aliases[q];
 const matches=Object.entries(catalog).filter(([id,f])=>norm(f[0]).includes(q)||norm(spanishFor(state,id)).includes(q));return matches.length===1?matches[0][0]:null;
}
export function parseIngredientText(text,state){
 const rows=[],unresolved=[];
 for(const line of text.split(/[\n;]+/).map(s=>s.trim()).filter(Boolean)){
  const match=line.match(/^(.+?)\s*[-–—:]?\s*(\d+(?:[.,]\d+)?)\s*(кг|kg|г|g|гр|gramos?)\.?\s*$/iu);
  if(!match){unresolved.push(line);continue;}
  const id=matchIngredient(match[1].trim().replace(/[-–—:]$/,''),state),grams=Number(match[2].replace(',','.'))*(/^(кг|kg)$/i.test(match[3])?1000:1);
  if(!id||!Number.isFinite(grams)||grams<=0||grams>5000)unresolved.push(line);else rows.push({id,grams});
 }
 return {rows,unresolved};
}
export function recipeMacros(ingredients,state){const f=foodsFor(state);return Object.entries(ingredients).reduce((out,[id,g])=>out.map((v,i)=>v+f[id][i+2]*g/100),[0,0,0,0]);}
export function createCustomRecipe(draft,state,id){
 const ingredients={};for(const row of draft.rows||[])ingredients[row.id]=(ingredients[row.id]||0)+Number(row.grams);
 const recipe={id,title:String(draft.title||'').trim(),slot:Number(draft.slot),time:Number(draft.time),subtitle:'Мой рецепт · КБЖУ по составу',image:['oats','chicken','pasta','yogurt'][Number(draft.slot)],ingredients,steps:String(draft.steps||'').split('\n').map(s=>s.trim()).filter(Boolean),custom:true};
 validateCustomCatalog({...state,customRecipes:[...(state.customRecipes||[]),recipe]});return recipe;
}
export function parseModelSteps(text){
 const clean=String(text).replace(/<think>[\s\S]*?<\/think>/g,'').replace(/^```(?:json)?\s*|```$/g,'').trim(),start=clean.indexOf('{'),end=clean.lastIndexOf('}');
 if(start<0||end<start)throw Error('Model did not return a recipe structure');
 const value=JSON.parse(clean.slice(start,end+1));
 if(!Array.isArray(value.steps)||value.steps.length<1||value.steps.length>15||!value.steps.every(s=>typeof s==='string'&&s.trim()&&s.length<=1500))throw Error('Invalid preparation steps');
 return {steps:value.steps,time:Number.isInteger(value.time)&&value.time>=1&&value.time<=240?value.time:20};
}
