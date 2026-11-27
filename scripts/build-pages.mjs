import {cpSync,mkdirSync,writeFileSync,readdirSync,rmSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('docs',{recursive:true});
for(const name of readdirSync('docs'))rmSync(`docs/${name}`,{recursive:true,force:true});
cpSync('dist','docs',{recursive:true});
// One content-derived version for the full module graph prevents mixed cached releases.
const files=readdirSync('dist').filter(name=>/\.(js|css|html)$/.test(name)).sort();
const hash=createHash('sha256');for(const name of files)hash.update(name).update(readFileSync(`dist/${name}`));
const version=hash.digest('hex').slice(0,12);
for(const name of files){let source=readFileSync(`dist/${name}`,'utf8');
 if(name.endsWith('.js'))source=source.replace(/(from\s+['"]\.\/[^'"?]+\.js)(['"])/g,`$1?v=${version}$2`);
 if(name==='index.html')source=source.replace('src="app.js"',`src="app.js?v=${version}"`).replace('href="style.css"',`href="style.css?v=${version}"`);
 writeFileSync(`docs/${name}`,source);
}
writeFileSync('docs/.nojekyll','');
console.log(`GitHub Pages output ready in docs/ (${version})`);
