import {translations} from './translations.js';
export const supportedLanguages=['ru','en','es'];
export const languageKey='ration-language';
let language='ru';
try{const saved=localStorage.getItem(languageKey);if(supportedLanguages.includes(saved))language=saved;}catch{}
export const getLanguage=()=>language;
export const locale=()=>({ru:'ru-RU',en:'en-GB',es:'es-ES'}[language]);
const escapePattern=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const translationPattern=new RegExp('(?<![\\p{L}\\p{N}_-])(?:'+Object.keys(translations).sort((a,b)=>b.length-a.length).map(escapePattern).join('|')+')(?![\\p{L}\\p{N}_-])','gu');
export function translateText(text,lang=language){
 const value=String(text);if(lang==='ru'||!supportedLanguages.includes(lang)||!/[А-Яа-яЁё]/u.test(value))return value;
 const index=lang==='en'?0:1;
 if(Object.hasOwn(translations,value))return translations[value][index];
 return value.replace(translationPattern,key=>translations[key][index]);
}
export const t=text=>translateText(text);
// Translate only literal template segments. Interpolated user data and HTML stay untouched.
export function html(strings,...values){return strings.reduce((out,part,i)=>out+t(part)+(i<values.length?values[i]:''),'');}
export function languageSelect(className=''){return `<label class="language-picker ${className}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z"/></svg><select data-language aria-label="${t('Язык')}"><option value="ru" lang="ru">Русский</option><option value="en" lang="en">English</option><option value="es" lang="es">Español</option></select></label>`;}
export function syncLanguageControls(){if(typeof document==='undefined')return;document.documentElement.lang=language;for(const select of document.querySelectorAll('[data-language]')){select.value=language;select.setAttribute('aria-label',t('Язык'));}}
export function setLanguage(next,{notify=true}={}){
 if(!supportedLanguages.includes(next))return false;
 const changed=language!==next;language=next;try{localStorage.setItem(languageKey,next);}catch{}
 if(changed&&notify&&typeof document!=='undefined')document.dispatchEvent(new CustomEvent('ration:language',{detail:{language:next}}));
 return changed;
}
export function captureStaticCopy(){
 if(typeof document?.createTreeWalker!=='function')return ()=>{};
 const text=[],attrs=[],walker=document.createTreeWalker(document.documentElement,4);
 while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement?.closest('script,style,textarea,input'))continue;if(/[А-Яа-яЁё]/u.test(node.nodeValue))text.push([node,node.nodeValue]);}
 for(const el of document.querySelectorAll('[aria-label],[title],[placeholder],meta[name="description"]'))for(const name of ['aria-label','title','placeholder','content']){const value=el.getAttribute(name);if(value&&/[А-Яа-яЁё]/u.test(value))attrs.push([el,name,value]);}
 return ()=>{for(const [node,copy]of text)if(node.isConnected)node.nodeValue=t(copy);for(const [node,name,copy]of attrs)if(node.isConnected)node.setAttribute(name,t(copy));syncLanguageControls();};
}
export function recipeSearchText(recipe,state){
 const productNames=Object.entries(recipe.ingredients).flatMap(([id])=>{const custom=state?.customFoods?.[id];return custom?[custom.food[0],custom.spanish]:[];});
 return [recipe.title,recipe.subtitle,...(recipe.custom?[]:['en','es'].flatMap(lang=>[translateText(recipe.title,lang),translateText(recipe.subtitle,lang)])),...productNames].join(' ');
}
export const normalizeSearch=text=>String(text).toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replaceAll('ё','е').trim();
