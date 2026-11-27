import {cpSync,mkdirSync,writeFileSync,readdirSync,rmSync} from 'node:fs';
mkdirSync('docs',{recursive:true});
for(const name of readdirSync('docs'))rmSync(`docs/${name}`,{recursive:true,force:true});
cpSync('dist','docs',{recursive:true});
writeFileSync('docs/.nojekyll','');
console.log('GitHub Pages output ready in docs/');
