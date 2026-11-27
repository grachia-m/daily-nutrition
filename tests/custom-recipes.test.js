import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultState,setMeal,planDay,basket,nutrition,dayTarget,sumNutrition,migrateState,allDayMeals} from '../dist/engine.js';
import {parseIngredientText,createCustomRecipe,recipeMacros,parseModelSteps,validateCustomCatalog} from '../dist/custom-recipes.js';
const state=()=>defaultState(),date='2026-11-27';
test('ingredient parser converts grams/kg, matches aliases and refuses guessed amounts',()=>{
 const result=parseIngredientText('куриное филе 200 г\nрис 0,08 кг\nпомидоры 100 g',state());assert.deepEqual(result.rows,[{id:'chicken',grams:200},{id:'rice',grams:80},{id:'tomato',grams:100}]);assert.deepEqual(result.unresolved,[]);
 assert.equal(parseIngredientText('яйца 3 штуки\nнеизвестная еда 50 г',state()).unresolved.length,2);
});
test('custom recipe uses ingredient nutrition, can join shared menus and shopping, and survives import',()=>{
 let s=state();const r=createCustomRecipe({title:'Моя курица',slot:1,time:30,rows:[{id:'chicken',grams:200},{id:'rice',grams:80}],steps:'Отварить рис.\nПриготовить курицу до полной готовности.'},s,'recipe-12345678');s.customRecipes.push(r);s=setMeal(s,date,1,r.id);
 assert.deepEqual(recipeMacros(r.ingredients,s),nutrition(r.ingredients));assert.ok(Math.abs(sumNutrition(allDayMeals(date,s).map(r=>r.macros))[0]-dayTarget(date,s))<3);assert.ok(basket([date],s).some(r=>r.id==='rice'));assert.deepEqual(migrateState(JSON.parse(JSON.stringify(s))),s);
});
test('own food uses its label and cannot override a built-in or use inherited object keys',()=>{
 const s=state();s.customFoods['food-12345678']={food:['Мой йогурт','Свои продукты',65,8,2,4],spanish:'Mi yogur'};
 assert.deepEqual(parseIngredientText('Мой йогурт 150 г',s).rows,[{id:'food-12345678',grams:150}]);assert.deepEqual(recipeMacros({'food-12345678':150},s),[97.5,12,3,6]);
 s.customFoods.oats={food:['Подмена','Свои продукты',1,1,1,1],spanish:'x'};assert.throws(()=>validateCustomCatalog(s));
});
test('custom recipe validation refuses arbitrary URLs, images, invalid nutrition and unrelated fields',()=>{
 const s=state(),r=createCustomRecipe({title:'Тест',slot:0,time:10,rows:[{id:'oats',grams:50}],steps:'Сварить.'},s,'recipe-12345678');
 for(const mutate of [r=>r.video='javascript:alert(1)',r=>r.servingTime='<img>',r=>r.image='constructor',r=>r.ingredients=JSON.parse('{"__proto__":50,"oats":50}')]){const bad=structuredClone(r);mutate(bad);assert.throws(()=>validateCustomCatalog({...s,customRecipes:[bad]}));}
});
test('model output supplies only validated steps and time; nutrition is never taken from a model',()=>{
 assert.deepEqual(parseModelSteps('<think>private draft</think>{"steps":["Смешать ингредиенты."],"time":12,"kcal":99999}'),{steps:['Смешать ингредиенты.'],time:12});assert.throws(()=>parseModelSteps('Калорийность 500'));assert.throws(()=>parseModelSteps('{"steps":[],"time":1}'));
});
