import test from 'node:test';
import assert from 'node:assert/strict';
import {translations} from '../dist/translations.js';
import {translateText,html,setLanguage,getLanguage,locale,normalizeSearch} from '../dist/i18n.js';
import {recipes,foods,shoppingHints,portionGroups,productSources} from '../dist/data.js';
import {parseIngredientText} from '../dist/custom-recipes.js';
import {defaultState,searchReplacements,migrateState} from '../dist/engine.js';

test('every built-in recipe and food has English and Spanish copy, including methods and hints',()=>{
 const fields=[...recipes.flatMap(r=>[r.title,r.subtitle,...r.steps]),...Object.values(foods).flatMap(f=>f.slice(0,2)),...Object.values(shoppingHints),...Object.values(portionGroups).map(g=>g.label),...Object.values(productSources).flatMap(s=>[s.label,s.note])];
 for(const text of fields)for(const lang of ['en','es'])assert.ok(!/[А-Яа-яЁё]/u.test(translateText(text,lang)),`${lang}: ${text}`);
 for(const values of Object.values(translations)){assert.equal(values.length,2);assert.ok(values.every(s=>typeof s==='string'&&s.length));}
});
test('literal templates translate without changing interpolated user content',()=>{
 setLanguage('es',{notify:false});const name='Мой рецепт с сыром <script>not interpreted</script>';
 assert.equal(html`<p>Состав для ${name}</p>`,`<p>Ingredientes para ${name}</p>`);
 assert.equal(translateText('180 кг','en'),'180 kg');assert.equal(translateText('неизвестное слово','en'),'неизвестное слово');
 setLanguage('ru',{notify:false});
});
test('only supported languages can be selected and stored in snapshots',()=>{
 setLanguage('en',{notify:false});assert.equal(locale(),'en-GB');assert.equal(setLanguage('fr'),false);assert.equal(getLanguage(),'en');
 for(const language of ['ru','en','es'])assert.equal(migrateState({...defaultState(),language}).language,language);
 assert.throws(()=>migrateState({...defaultState(),language:'xx'}));setLanguage('ru',{notify:false});
});
test('English and Spanish ingredient entry and replacement search use the same canonical foods',()=>{
 const s=defaultState();
 for(const text of ['Chicken breast 200 g\nRice 80 g\nTomatoes 100 g','Pechuga de pollo 200 g\nArroz 80 g\nTomates 100 g'])assert.deepEqual(parseIngredientText(text,s),{rows:[{id:'chicken',grams:200},{id:'rice',grams:80},{id:'tomato',grams:100}],unresolved:[]});
 for(const query of ['omelet','tortilla','huevos','egg']){const results=searchReplacements(s,'2026-11-27',0,query);assert.ok(results.length);assert.ok(results.every(r=>r.slot===0));}
 assert.equal(normalizeSearch('  BRÓCOLI  '),'brocoli');
});
