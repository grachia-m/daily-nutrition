import {t,html,getLanguage} from './i18n.js?v=2ef6e8d60c2d';
import {parseModelSteps} from './custom-recipes.js?v=2ef6e8d60c2d';
let generatorPromise;
export async function draftRecipeWithAI({title,ingredients,onProgress=()=>{}}){
 if(!navigator.gpu)throw Error(t('Локальной модели нужен браузер с WebGPU. Добавь шаги вручную или открой поддерживаемый браузер.'));
 if(!generatorPromise){generatorPromise=(async()=>{
  onProgress(t('Загружаю библиотеку и модель. При первом запуске потребуется скачивание весов.'));
  const {pipeline}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
  return pipeline('text-generation','onnx-community/Qwen3-0.6B-ONNX',{device:'webgpu',dtype:'q4f16',progress_callback:progress=>{if(progress.status==='progress'&&progress.progress)onProgress(html`Загрузка файла модели: ${Math.round(progress.progress)}%`);}});
 })().catch(error=>{generatorPromise=null;throw error;});}
 const generator=await generatorPromise;onProgress(t('Готовлю черновик шагов. Проверь его перед сохранением.'));
 const output=await generator([{role:'system',content:'You are a recipe drafting assistant. Return only a JSON object with keys steps (an array of short cooking instructions in LANGUAGE) and time (integer minutes). Use only the supplied ingredients. Do not estimate calories or nutrition. Do not add medical claims. No markdown. /no_think'.replace('LANGUAGE',({ru:'Russian',en:'English',es:'Spanish'})[getLanguage()])},{role:'user',content:JSON.stringify({title,ingredients})}],{max_new_tokens:512,do_sample:false});
 return parseModelSteps(output?.[0]?.generated_text?.at(-1)?.content||'');
}
