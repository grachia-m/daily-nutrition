import test from 'node:test';
import assert from 'node:assert/strict';
import {foods,recipes,spanishFoods,mealPhotos,portionGroups} from '../dist/data.js';
import {dateRange,weekStart,planDay,basket,nutrition,sumNutrition,dayTarget,householdTarget,householdRecipe,portionForRecipe,defaultState,resizeWeight,basketKey,activeProfile,makeProfile,migrateState,validateState,estimateCalories,searchReplacements,setMeal,setRecipeAmounts,removeProfile,restoreProfile,allDayMeals,shoppingIngredientsFor,dailyDrinks} from '../dist/engine.js';
const date='2026-11-26';
test('calendar handles week boundaries, leap February, year boundary',()=>{
 assert.equal(weekStart(date),'2026-11-23');assert.equal(dateRange('2028-02-14','month').length,29);
 assert.deepEqual(dateRange('2026-12-31','week'),['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);
});
test('catalog uses known ingredients, all Spanish labels, and specific food photographs',()=>{
 assert.equal(foods.buckwheat,undefined);
 for(const r of recipes){assert.ok(!r.title.includes('греч'));assert.ok(Object.keys(r.ingredients).every(id=>foods[id]&&spanishFoods[id]));assert.ok(nutrition(r.ingredients).every(v=>v>0));assert.ok(mealPhotos[r.image]?.url.startsWith('https://'));}
 assert.notEqual(recipes.find(r=>r.id==='pancakes').image,recipes.find(r=>r.id==='oats').image);
});
test('brown rice replaces the old garnish at comparable calories',()=>{
 const r=recipes.find(r=>r.id==='chicken-brown-rice');assert.equal(r.ingredients.brownRice,88);assert.ok(Math.abs(88*foods.brownRice[2]/100-90*343/100)<2);
});
test('daily nutrition matches each individual target through a full month including swaps and training',()=>{
 const s=defaultState();s.overrides[date]=['pancakes','chicken-potato','turkey-pasta','cottage'];s.profiles[1].trainingOverrides[date]=true;s.profiles[1].bonus=100;
 for(const person of s.profiles)for(const kcal of [1200,1800,2400,5000])for(const day of dateRange(date,'month')){person.kcal=kcal;const total=sumNutrition(allDayMeals(day,s,person).map(m=>m.macros));assert.ok(Math.abs(total[0]-dayTarget(day,s,person))<3,`${day}: ${total[0]}`);}
});
test('family basket exactly sums individually rounded day, week, and month portions',()=>{
 const s=defaultState();
 for(const scope of ['day','week','month']){const dates=dateRange(date,scope),rows=basket(dates,s);for(const row of rows){const expected=s.profiles.flatMap(p=>dates.flatMap(d=>allDayMeals(d,s,p))).reduce((t,m)=>t+(shoppingIngredientsFor(m)[row.id]||0),0);assert.ok(Math.abs(expected-row.grams)<.06);assert.ok(Math.abs(Object.values(row.byPerson).reduce((a,b)=>a+b,0)-row.grams)<.06);}}
});
test('wife target changes only her portion and the family shopping total',()=>{
 const s=defaultState(),dates=dateRange(date),me=planDay(date,s,s.profiles[0]),wife=planDay(date,s,s.profiles[1]),before=basket(dates,s);s.profiles[1].kcal=2200;
 assert.deepEqual(planDay(date,s,s.profiles[0]),me);assert.ok(planDay(date,s,s.profiles[1])[0].macros[0]>wife[0].macros[0]);
 const after=basket(dates,s);assert.ok(after.every(r=>r.grams>=before.find(x=>x.id===r.id).grams));assert.ok(after.some(r=>r.grams>before.find(x=>x.id===r.id).grams));
});
test('basket can include one, two, three, or zero people without duplicating servings',()=>{
 const s=defaultState(),dates=dateRange(date);s.profiles.push(makeProfile('guest','Гость',{kcal:2000}));const three=basket(dates,s);s.profiles[2].inShopping=false;const two=basket(dates,s);s.profiles[1].inShopping=false;const one=basket(dates,s);
 for(const item of three){assert.ok(item.grams>two.find(x=>x.id===item.id).grams);assert.ok(two.find(x=>x.id===item.id).grams>one.find(x=>x.id===item.id).grams);}
 s.profiles[0].inShopping=false;assert.deepEqual(basket(dates,s),[]);assert.equal(householdTarget(date,s),0);
});
test('active profile changes presentation without changing shared basket quantities',()=>{
 const s=defaultState(),dates=dateRange(date),before=basket(dates,s);s.activeProfileId='wife';assert.equal(activeProfile(s).id,'wife');assert.equal(dayTarget(date,s),1800);assert.deepEqual(basket(dates,s),before);
});
test('family recipe total equals individual servings and calendar basket for that meal',()=>{
 const s=defaultState();const house=householdRecipe('chicken-brown-rice',date,s);assert.equal(house.portions.length,2);
 for(const [id,g]of Object.entries(house.ingredients))assert.equal(g,Math.round(house.portions.reduce((t,p)=>t+p.meal.ingredients[id],0)*10)/10);
 const ids=planDay(date,s).map(m=>m.id);ids[1]='chicken-brown-rice';s.overrides[date]=ids;
 for(const {person,meal}of house.portions)assert.deepEqual(meal,planDay(date,s,person)[1]);
});
test('alternate recipe preview matches its exact portion after applying shared replacement',()=>{
 const s=defaultState(),preview=portionForRecipe('pancakes',date,s),ids=planDay(date,s).map(m=>m.id);ids[0]='pancakes';s.overrides[date]=ids;assert.deepEqual(preview,planDay(date,s)[0]);
});
test('training overrides, logs, and water are independent for each person',()=>{
 const s=defaultState(),[me,wife]=s.profiles;me.trainingOverrides[date]=true;me.logged[date+':0']={id:'oats',macros:[1,2,3,4]};me.water[date]=250;
 assert.equal(dayTarget(date,s,me),2550);assert.equal(dayTarget(date,s,wife),1800);assert.deepEqual(wife.logged,{});assert.deepEqual(wife.water,{});
 const snapshot=structuredClone(me.logged);me.kcal=2800;planDay(date,s);assert.deepEqual(me.logged,snapshot);
});
test('continuous weight dragging does not compound rounding and leaves the other person untouched',()=>{
 const s=defaultState(),wife=structuredClone(s.profiles[1]);let p={...s.profiles[0],linkWeight:true};for(let w=75.5;w<=100;w+=.5)p=resizeWeight(p,w);assert.equal(p.kcal,3200);p=resizeWeight(p,75);assert.equal(p.kcal,2400);assert.deepEqual(s.profiles[1],wife);
 assert.equal(resizeWeight({...p,linkWeight:false},90).kcal,2400);assert.equal(resizeWeight({...p,kcal:5000,weightBase:undefined},180).kcal,5000);
});
test('Mifflin estimates distinguish sex and reject missing personal parameters',()=>{
 const p=makeProfile('test','Тест',{weight:80,height:180,age:30,sex:'male',activity:1.2});const male=estimateCalories(p),female=estimateCalories({...p,sex:'female'});
 assert.equal(male.resting,1780);assert.equal(male.maintenance,2136);assert.equal(male.target,2140);assert.equal(male.resting-female.resting,166);assert.equal(estimateCalories({...p,height:null}),null);assert.equal(estimateCalories({...p,age:17}),null);
 assert.equal(estimateCalories({...p,adjustment:-.15}).target,1820);
});
test('legacy backup migrates goals and diary without rewriting historical buckwheat meal',()=>{
 const old={version:1,kcal:2700,weight:83,linkWeight:true,bonus:100,trainingDays:[1,3],trainingOverrides:{},overrides:{[date]:['oats','chicken-buckwheat','fish-potato','yogurt']},logged:{[date+':1']:{id:'chicken-buckwheat',macros:[600,40,15,60],ingredients:{buckwheat:90}}},water:{[date]:500},bought:{},profileNote:'Моя программа'};
 const s=migrateState(old);assert.equal(s.version,4);assert.equal(s.profiles[0].kcal,2700);assert.equal(s.profiles[0].water[date],500);assert.deepEqual(s.profiles[0].logged,old.logged);assert.equal(s.overrides[date][1],'chicken-brown-rice');assert.equal(s.profiles[1].name,'Жена');assert.equal(s.profileNote,'Моя программа');assert.equal(validateState(s),true);
});
test('backup rejects malformed profiles, duplicate IDs, invalid recipes and non-finite goals',()=>{
 for(const mutate of [s=>s.profiles[0].kcal=NaN,s=>s.profiles[1].id='me',s=>s.profiles[1].height=900,s=>s.profiles[1].adjustment=-.9,s=>s.overrides[date]=['missing','missing','missing','missing'],s=>s.profiles[0].water['2026-02-31']=250]){const s=defaultState();mutate(s);assert.throws(()=>migrateState(s));}
});
test('new backup round-trip retains profiles and quantity-specific purchase marks',()=>{
 const s=defaultState(),dates=dateRange(date),before=basket(dates,s);s.bought[basketKey(dates,before[0])]=true;assert.deepEqual(migrateState(JSON.parse(JSON.stringify(s))),s);s.profiles[1].kcal=2000;assert.notEqual(basketKey(dates,before[0]),basketKey(dates,basket(dates,s)[0]));
});
test('search offers only matching meal slots, including ingredients and Spanish search',()=>{
 const s=defaultState();assert.ok(searchReplacements(s,date,0,'мюсли').length>=2);
 for(let slot=0;slot<4;slot++)assert.ok(searchReplacements(s,date,slot).every(r=>r.slot===slot));
 assert.ok(searchReplacements(s,date,0,'claras').some(r=>r.id==='omelet-protein'));
 assert.deepEqual(searchReplacements(s,date,1,'омлет'),[]);assert.deepEqual(searchReplacements(s,date,99),[]);
});
test('replacement changes only requested date and slot, rejects cross-category dishes',()=>{
 const s=defaultState(),before=planDay(date,s).map(m=>m.id),next=setMeal(s,date,0,'overnight-nut-muesli');
 assert.equal(next.overrides[date][0],'overnight-nut-muesli');assert.deepEqual(next.overrides[date].slice(1),before.slice(1));assert.deepEqual(s.overrides,{});assert.equal(next.overrides['2026-11-27'],undefined);
 assert.throws(()=>setMeal(s,date,0,'fish-potato'));assert.throws(()=>setMeal(s,date,3,'omelet-protein'));
});
test('overnight keeps 200/150g milk and 15g powder each while meeting personal calorie targets',()=>{
 const s=setMeal(defaultState(),date,0,'overnight-nut-muesli');
 for(const [i,p]of s.profiles.entries()){const plan=planDay(date,s,p);assert.equal(plan[0].ingredients.milk,i===0?200:150);assert.equal(plan[0].ingredients.whey,15);assert.ok(Math.abs(sumNutrition([...plan,...dailyDrinks(date,s,p)].map(m=>m.macros))[0]-dayTarget(date,s,p))<3);}
 const resized={...s,profiles:s.profiles.map(p=>({...p,kcal:3000}))};assert.equal(planDay(date,resized)[0].ingredients.whey,15);assert.equal(planDay(date,resized)[0].ingredients.milk,200);
});
test('evening bowl uses a shared 175g cottage pack for two and keeps dairy fixed',()=>{
 const s=setMeal(defaultState(),date,3,'evening-cottage-berries'),house=householdRecipe('evening-cottage-berries',date,s);
 assert.equal(house.ingredients.cottage,175);assert.equal(house.ingredients.yogurt,250);assert.equal(foods.cottage[2],96);assert.equal(foods.cottage[3],10);
});
test('personal recipe amounts affect only that person, carry across variants, and reach the shopping list',()=>{
 let s=setMeal(defaultState(),date,0,'overnight-oats');s=setRecipeAmounts(s,'wife','overnight',{milk:180,whey:20});
 assert.equal(planDay(date,s,s.profiles[1])[0].ingredients.milk,180);assert.equal(planDay(date,s,s.profiles[0])[0].ingredients.milk,200);
 s=setMeal(s,date,0,'overnight-fruit-muesli');assert.equal(planDay(date,s,s.profiles[1])[0].ingredients.whey,20);
 const row=basket([date],s).find(r=>r.id==='milk');assert.equal(row.byPerson.wife,180);assert.equal(row.byPerson.me,200);
 assert.throws(()=>setRecipeAmounts(s,'wife','overnight',{milk:-1}));assert.throws(()=>setRecipeAmounts(s,'wife','omelet',{egg:125}));
});
test('omelet distinguishes whole eggs from extra bottled whites in plan and basket',()=>{
 const s=setMeal(defaultState(),date,0,'omelet-protein'),meal=planDay(date,s)[0],rows=basket([date],s);
 assert.equal(meal.ingredients.egg,150);assert.equal(meal.ingredients.eggwhite,200);assert.ok(rows.some(r=>r.id==='egg'));assert.ok(rows.some(r=>r.id==='eggwhite'));assert.ok(Math.abs(meal.ingredients.egg/50+meal.ingredients.eggwhite/33-9)<.2);
});
test('every new breakfast/snack combination stays positive and meets target at maximum fixed portions',()=>{
 let s=defaultState();for(const p of s.profiles)for(const [id,group]of Object.entries(portionGroups))s=setRecipeAmounts(s,p.id,id,Object.fromEntries(Object.entries(group.fields).map(([food,rule])=>[food,rule.max])));
 for(const breakfast of recipes.filter(r=>r.slot===0))for(const snack of recipes.filter(r=>r.slot===3)){
  let next=setMeal(setMeal(s,date,0,breakfast.id),date,3,snack.id);
  for(const p of next.profiles){p.kcal=1200;const plan=planDay(date,next,p);assert.ok(plan.every(m=>Object.values(m.ingredients).every(g=>g>=0)));const total=sumNutrition([...plan,...dailyDrinks(date,next,p)].map(m=>m.macros))[0],fixed=plan.reduce((sum,m)=>sum+nutrition(Object.fromEntries(Object.entries(m.ingredients).filter(([id])=>m.fixedIngredients.includes(id))))[0],0)+sumNutrition(dailyDrinks(date,next,p).map(m=>m.macros))[0];if(fixed<dayTarget(date,next,p))assert.ok(Math.abs(total-dayTarget(date,next,p))<3);else assert.ok(total>=fixed);}
 }
});
test('removal and recovery preserve diary, custom portions and active selection without mutating prior state',()=>{
 const s=defaultState();s.activeProfileId='wife';s.profiles[1].logged[date+':0']={id:'oats',macros:[500,20,10,70]};s.profiles[1].recipeAmounts={overnight:{milk:175}};const before=structuredClone(s);
 const removed=removeProfile(s,'wife');assert.equal(removed.profiles.length,1);assert.equal(removed.activeProfileId,'me');assert.equal(removed.archivedProfiles[0].profile.logged[date+':0'].macros[0],500);assert.deepEqual(s,before);assert.ok(basket([date],removed).every(row=>Object.keys(row.byPerson).length===1));
 const restored=restoreProfile(removed,'wife');assert.equal(restored.profiles.length,2);assert.deepEqual(restored.profiles[1],s.profiles[1]);assert.equal(restored.archivedProfiles.length,0);assert.equal(restored.activeProfileId,'wife');assert.equal(validateState(restored),true);
 assert.throws(()=>removeProfile(removed,'me'));
});
test('version 2 migration retains all profiles and diary and initializes new recoverable deletion fields',()=>{
 const s=defaultState();s.version=2;delete s.archivedProfiles;for(const p of s.profiles)delete p.recipeAmounts;s.profiles[1].water[date]=300;
 const next=migrateState(s);assert.equal(next.version,4);assert.deepEqual(next.archivedProfiles,[]);assert.equal(next.profiles[1].water[date],300);assert.deepEqual(next.profiles[1].recipeAmounts,{});
});
test('archive and custom ingredient settings survive export/import with validation',()=>{
 let s=setRecipeAmounts(defaultState(),'wife','evening',{yogurt:150,cottage:100});s=removeProfile(s,'wife');const imported=migrateState(JSON.parse(JSON.stringify(s)));assert.deepEqual(restoreProfile(imported,'wife').profiles[1].recipeAmounts.evening,{yogurt:150,cottage:100});
 const invalid=structuredClone(s);invalid.archivedProfiles[0].profile.recipeAmounts.evening.cottage=-100;assert.throws(()=>migrateState(invalid));
});
