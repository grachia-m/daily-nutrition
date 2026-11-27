import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const read=name=>readFileSync(`dist/${name}`,'utf8');
const script=['translations.js','i18n.js','data.js','custom-recipes.js','engine.js','config.js','cloud.js','session.js','recipe-ai.js','app.js'].map(file=>read(file).replace(/^import .*?;\n/gm,'').replace(/^export /gm,'')).join('\n');
const css=read('style.css');
const html=read('index.html').replace('<link rel="stylesheet" href="style.css">',`<style>${css}</style>`).replace('href="assets/favicon.svg"',`href="data:image/svg+xml,${encodeURIComponent(read('assets/favicon.svg'))}"`).replace('<script type="module" src="app.js"></script>',`<script type="module">${script}</script>`);
mkdirSync('../outputs',{recursive:true});writeFileSync('../outputs/ration.html',html);
console.log('Standalone app: ../outputs/ration.html');
