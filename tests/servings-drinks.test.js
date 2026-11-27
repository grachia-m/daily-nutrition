import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultState,planDay,allDayMeals,dailyDrinks,drinkSettings,basket,setMeal,portionForRecipe,householdRecipe,dayTarget,sumNutrition,migrateState,validateState} from '../dist/engine.js';
import {createCustomRecipe,recipeMacros,validateCustomCatalog} from '../dist/custom-recipes.js';
const day='2026-11-27';
function batch(state,servings=4){return createCustomRecipe({title:'Курица на несколько порций',slot:1,servings,rows:[{id:'chicken',grams:800},{id:'rice',grams:320}]},state,'recipe-batch0001');}
test('a four-portion recipe stores the whole batch and gives each person exactly one quarter',()=>{
 let s=defaultState(),r=batch(s);s.customRecipes.push(r);s=setMeal(s,day,1,r.id);
 assert.equal(r.ingredients.chicken,800);assert.equal(r.servings,4);assert.deepEqual(r.steps,[]);assert.equal(r.time,null);
 const total=recipeMacros(r.ingredients,s);
 for(const p of s.profiles){const meal=planDay(day,s,p)[1];assert.deepEqual(meal.ingredients,{chicken:200,rice:80});assert.deepEqual(meal.macros,total.map(v=>v/4));assert.ok(Math.abs(sumNutrition(allDayMeals(day,s,p).map(m=>m.macros))[0]-dayTarget(day,s,p))<3);}
 const house=householdRecipe(r.id,day,s);assert.deepEqual(house.ingredients,{chicken:400,rice:160});
 s.profiles[0].kcal=4000;assert.deepEqual(planDay(day,s)[1].ingredients,{chicken:200,rice:80});
 assert.deepEqual(migrateState(JSON.parse(JSON.stringify(s))),s);
});
test('editing an existing recipe changes its yield without duplicating it or changing historical diary values',()=>{
 let s=defaultState(),r=batch(s);s.customRecipes.push(r);s=setMeal(s,day,1,r.id);const eaten=portionForRecipe(r.id,day,s);s.profiles[0].logged[`${day}:1`]={id:r.id,macros:eaten.macros,ingredients:eaten.ingredients};
 const revised=createCustomRecipe({title:r.title,slot:r.slot,servings:8,rows:Object.entries(r.ingredients).map(([id,grams])=>({id,grams}))},s,r.id);s.customRecipes=[revised];assert.equal(s.customRecipes.length,1);assert.deepEqual(planDay(day,s)[1].ingredients,{chicken:100,rice:40});assert.deepEqual(s.profiles[0].logged[`${day}:1`].ingredients,{chicken:200,rice:80});assert.equal(validateState(s),true);
});
test('only title, yield and weighed ingredients are required; invalid counts or incomplete nutrition are refused',()=>{
 const s=defaultState();assert.doesNotThrow(()=>batch(s));
 for(const servings of [0,-1,1.5,101,NaN])assert.throws(()=>batch(s,servings));
 assert.throws(()=>createCustomRecipe({title:'',servings:4,slot:1,rows:[{id:'rice',grams:400}]},s,'recipe-batch0001'));
 assert.throws(()=>createCustomRecipe({title:'Рис',servings:4,slot:1,rows:[]},s,'recipe-batch0001'));
 const r=batch(s);r.time=0;assert.throws(()=>validateCustomCatalog({...s,customRecipes:[r]}));
});
test('older recipe amounts remain unchanged until the person supplies its missing yield',()=>{
 const s=defaultState(),r=batch(s);delete r.servings;r.time=20;r.steps=['Приготовить.'];s.customRecipes=[r];assert.equal(migrateState(s).customRecipes[0].servings,undefined);assert.equal(migrateState(s).customRecipes[0].ingredients.chicken,800);
});
test('two daily milk coffees per person use 300 g milk daily for two and 2.1 kg weekly',()=>{
 const s=defaultState();for(const p of s.profiles){const drinks=dailyDrinks(day,s,p);assert.equal(drinks.length,2);assert.ok(drinks.every(m=>m.ingredients.lactoseFreeMilk2===75));assert.ok(Math.abs(sumNutrition(drinks.map(m=>m.macros))[0]-76.2)<1e-9);}
 const dates=Array.from({length:7},(_,i)=>`2026-11-${String(23+i).padStart(2,'0')}`),rows=basket(dates,s);
 const milk=rows.find(r=>r.id==='lactoseFreeMilk2');assert.equal(milk.grams,2100);assert.deepEqual(milk.byPerson,{me:1050,wife:1050});assert.equal(rows.find(r=>r.id==='coffee').grams,196);
 s.profiles[1].inShopping=false;assert.equal(basket(dates,s).find(r=>r.id==='lactoseFreeMilk2').grams,1050);
});
test('coffee quantities stay fixed as calories change, can be disabled or switched to black for one person',()=>{
 const s=defaultState(),p=s.profiles[0],before=dailyDrinks(day,s,p);p.kcal=4000;assert.deepEqual(dailyDrinks(day,s,p),before);
 p.drinks={...drinkSettings(p),kind:'coffee-black'};assert.ok(dailyDrinks(day,s,p).every(d=>!d.ingredients.lactoseFreeMilk2));assert.ok(dailyDrinks(day,s,s.profiles[1]).every(d=>d.ingredients.lactoseFreeMilk2===75));
 p.drinks.cups=0;assert.deepEqual(dailyDrinks(day,s,p),[]);assert.ok(Math.abs(sumNutrition(allDayMeals(day,s,p).map(m=>m.macros))[0]-dayTarget(day,s,p))<3);
 p.drinks.cups=7;assert.throws(()=>validateState(s));
});
test('a large fixed portion never crashes the menu or silently reduces the declared portion',()=>{
 let s=defaultState();s.profiles[0].kcal=1200;const r=createCustomRecipe({title:'Большая порция',slot:1,servings:1,rows:[{id:'rice',grams:500}]},s,'recipe-batch0001');s.customRecipes.push(r);s=setMeal(s,day,1,r.id);
 assert.equal(planDay(day,s)[1].ingredients.rice,500);assert.ok(sumNutrition(allDayMeals(day,s).map(m=>m.macros))[0]>1200);assert.equal(validateState(s),true);
});
