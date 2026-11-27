// Unit-level rendering/event smoke tests using a small DOM adapter, without a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {randomUUID} from 'node:crypto';
function app(initial=null){
 const nodes=new Map(),events={},selections=new Map();
 const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{id:selector.replace('#',''),innerHTML:'',outerHTML:'',value:'',checked:false,open:false,listeners:{},classList:{toggle(){},add(){}},addEventListener(type,handler){this.listeners[type]=handler},focus(){},replaceWith(){},closest(){return this},showModal(){this.open=true},close(){this.open=false}});return nodes.get(selector)};
 const storage=new Map(initial?[['teply-ration-v1',JSON.stringify(initial)]]:[]);
 const sandbox={structuredClone,crypto:{randomUUID},console,Date,URL,Blob,HTMLImageElement:class {},navigator:{},location:{hash:''},window:{addEventListener(){},scrollTo(){}},setTimeout:()=>0,clearTimeout(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},sessionStorage:{setItem(){}},document:{querySelector:node,getElementById:id=>node('#'+id),querySelectorAll:selector=>selections.get(selector)||[],addEventListener(type,fn){(events[type]||=[]).push(fn)},createElement:()=>({innerHTML:'',content:{firstElementChild:node('template')}})}};
 const source=['data','custom-recipes','engine','config','cloud','session','recipe-ai','app'].map(n=>readFileSync(new URL(`../dist/${n}.js`,import.meta.url),'utf8').replace(/^import .*?;\n/gm,'').replace(/^export /gm,'')).join('\n');
 runInNewContext(source+`\nglobalThis.testApi={state:()=>state,person,renderDay,renderPlan,renderRecipes,renderBasket,renderSettings,openRecipe,basketText,navigate,day:()=>date,render,calculator,profileBar,openReplacement,openRecipeEditor};`,sandbox);
 const dispatch=async(type,target)=>{target.dataset??={};target.hasAttribute??=(attr)=>Object.hasOwn(target.dataset,attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase()));target.closest??=()=>target;for(const handler of events[type]||[])await handler({target,preventDefault(){}})};
 return {api:sandbox.testApi,nodes,node,dispatch,storage,selections};
}
test('all five views render with separate profiles and bilingual basket',()=>{
 const a=app();for(const view of ['renderDay','renderPlan','renderRecipes','renderBasket','renderSettings']){const html=a.api[view]();assert.ok(html.length>2000);assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));}
 assert.match(a.api.renderBasket(),/pechuga de pollo/);assert.match(a.api.renderBasket(),/arroz integral/);assert.match(a.api.calculator(),/Жена/);
});
test('recipe dialog renders per-person ingredients and shared totals for every recipe',()=>{
 const a=app();for(const id of ['oats','toast','pancakes','chicken-potato','turkey-rice','chicken-brown-rice','fish-potato','salmon-rice','turkey-pasta','yogurt','cottage']){a.api.openRecipe(id,a.api.day());const html=a.node('#recipeDialog').innerHTML;assert.match(html,/portion-table/);assert.match(html,/Готовим вместе/);assert.match(html,/>Я<\/th>/);assert.match(html,/>Жена<\/th>/);assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));}
});
test('real calorie input handler changes only the selected profile and keeps calculator element intact',async()=>{
 const a=app(),calculator=a.node('.calculator'),me=a.api.state().profiles[0].kcal;
 await a.dispatch('change',{id:'calculatorPerson',value:'wife'});
 const range=a.node('#kcalRange');range.listeners.input({target:{value:'2200'}});
 assert.equal(a.api.state().profiles[0].kcal,me);assert.equal(a.api.person().kcal,2200);assert.equal(a.api.person().demo,false);assert.equal(a.node('.calculator'),calculator);assert.match(a.api.basketText(),/Жена/);
});
test('diary and water clicks stay with their profile when switching',async()=>{
 const a=app();await a.dispatch('click',{dataset:{log:'0'}});await a.dispatch('click',{dataset:{water:'250'}});
 await a.dispatch('click',{dataset:{person:'wife'}});assert.equal(Object.keys(a.api.person().logged).length,0);assert.equal(Object.keys(a.api.person().water).length,0);
 await a.dispatch('click',{dataset:{person:'me'}});assert.equal(Object.keys(a.api.person().logged).length,1);assert.equal(a.api.person().water[a.api.day()],250);
});
test('adding a third person and deselecting them updates shopping without deleting personal data',async()=>{
 const a=app();await a.dispatch('click',{id:'addPerson'});assert.equal(a.api.state().profiles.length,3);const id=a.api.person().id;
 await a.dispatch('change',{dataset:{shoppingPerson:id},checked:false});assert.equal(a.api.person().inShopping,false);assert.equal(a.api.state().profiles.length,3);
});
test('applying estimate changes the active target and avoids double counting training',async()=>{
 const a=app();const p=a.api.person();p.age=30;p.height=180;p.weight=80;p.activity=1.2;
 await a.dispatch('click',{id:'applyEstimate'});assert.equal(p.kcal,2140);assert.equal(p.bonus,0);assert.equal(p.linkWeight,false);assert.equal(p.demo,false);
});
test('Spanish names survive text copying for day, week and month shopping views',()=>{
 const a=app();const text=a.api.basketText();assert.match(text,/Куриное филе \(pechuga de pollo\)/);assert.match(text,/Для: Я, Жена/);assert.match(text,/Бурый рис \(сухой\) \(arroz integral\)/);
});
test('participant deletion asks first, cancellation is harmless, confirmation archives and recovery restores',async()=>{
 const a=app();a.api.state().profiles[1].water[a.api.day()]=500;
 assert.match(a.api.profileBar(),/data-remove-person="wife"/);assert.match(a.api.renderSettings(),/Удалить участника/);
 await a.dispatch('click',{dataset:{removePerson:'wife'}});assert.equal(a.api.state().profiles.length,2);assert.equal(a.node('#removePersonDialog').open,true);assert.match(a.node('#removePersonDialog').innerHTML,/Вы уверены/);
 await a.dispatch('click',{dataset:{close:'removePersonDialog'}});assert.equal(a.api.state().profiles.length,2);
 await a.dispatch('click',{dataset:{removePerson:'wife'}});await a.dispatch('click',{id:'confirmRemovePerson'});assert.equal(a.api.state().profiles.length,1);assert.equal(a.node('#removePersonDialog').open,false);assert.equal(a.api.state().archivedProfiles.length,1);
 await a.dispatch('click',{dataset:{removePerson:'me'}});assert.equal(a.api.state().profiles.length,1);assert.equal(a.node('#removePersonDialog').open,false);
 await a.dispatch('click',{dataset:{restorePerson:'wife'}});assert.equal(a.api.state().profiles.length,2);assert.equal(a.api.person().water[a.api.day()],500);
});
test('replacement picker searches only the selected category and commits only a valid choice',async()=>{
 const a=app(),before=a.api.state().overrides;await a.dispatch('click',{dataset:{swap:'0'}});assert.equal(a.node('#replacementDialog').open,true);assert.equal(a.api.state().overrides,before);
 await a.dispatch('input',{id:'replacementSearch',value:'мюсли'});const result=a.node('#replacementResults').innerHTML;assert.match(result,/Ночные мюсли/);assert.ok(!result.includes('Курица с'));
 await a.dispatch('click',{dataset:{replaceChoice:'fish-potato'}});assert.equal(a.node('#replacementDialog').open,true);assert.equal(Object.keys(a.api.state().overrides).length,0);
 await a.dispatch('click',{dataset:{replaceChoice:'overnight-nut-muesli'}});assert.equal(a.node('#replacementDialog').open,false);assert.equal(a.api.state().overrides[a.api.day()][0],'overnight-nut-muesli');
});
test('all added recipes render a working family dialog without missing data',()=>{
 const a=app();for(const id of ['omelet-protein','omelet-cheese','scrambled-toast','sandwich-sausage','overnight-oats','overnight-fruit-muesli','overnight-nut-muesli','overnight-banana','snack-omelet','snack-sandwich','evening-cottage-berries','evening-cottage-cocoa','evening-cottage-apple','chia-yogurt']){a.api.openRecipe(id,a.api.day());const html=a.node('#recipeDialog').innerHTML;assert.match(html,/portion-table/);assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));}
});
test('personal portion editor commits milk and powder separately from partner and recomputes recipe',async()=>{
 const a=app();await a.dispatch('click',{dataset:{person:'wife'}});a.api.openRecipe('overnight-nut-muesli',a.api.day());assert.match(a.node('#recipeDialog').innerHTML,/data-portion-food="milk"/);
 a.selections.set('#recipeDialog [data-portion-food]',[{dataset:{portionFood:'milk',portionEggs:'false'},value:'180'},{dataset:{portionFood:'whey',portionEggs:'false'},value:'18'}]);
 await a.dispatch('click',{dataset:{savePortion:'overnight',portionRecipe:'overnight-nut-muesli',portionDate:a.api.day()}});assert.equal(a.api.person().recipeAmounts.overnight.milk,180);assert.equal(a.api.person().recipeAmounts.overnight.whey,18);assert.equal(Object.keys(a.api.state().profiles[0].recipeAmounts).length,0);
});
test('whole egg input converts egg count to grams and omlet explains total whites',async()=>{
 const a=app();a.api.openRecipe('omelet-protein',a.api.day());assert.match(a.node('#recipeDialog').innerHTML,/Всего около 9 белков/);
 a.selections.set('#recipeDialog [data-portion-food]',[{dataset:{portionFood:'egg',portionEggs:'true'},value:'2'},{dataset:{portionFood:'eggwhite',portionEggs:'false'},value:'165'}]);
 await a.dispatch('click',{dataset:{savePortion:'omelet',portionRecipe:'omelet-protein',portionDate:a.api.day()}});assert.equal(a.api.person().recipeAmounts.omelet.egg,100);assert.equal(a.api.person().recipeAmounts.omelet.eggwhite,165);
});

test('custom titles, product names and preparation instructions render as text',()=>{
 const a=app();a.api.state().customRecipes.push({id:'recipe-12345678',title:'<img src=x onerror=alert(1)>',slot:0,time:10,subtitle:'<script>x</script>',image:'oats',ingredients:{oats:50},steps:['<svg onload=alert(1)>'],custom:true});
 assert.ok(!a.api.renderRecipes().includes('<img src=x'));a.api.openRecipe('recipe-12345678',a.api.day());const html=a.node('#recipeDialog').innerHTML;assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<svg onload'));
});
