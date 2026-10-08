const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const files=['index.html','app.js','model.js','style.css','student-gallery.css','clean-dashboard.css'];
for(const file of files)if(!fs.statSync(path.join(root,file)).isFile())throw Error(`Missing asset: ${file}`);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(out,file));
const html=fs.readFileSync(path.join(out,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 if(!files.includes(match[1]))throw Error(`Unpackaged asset: ${match[1]}`);
}
console.log(`Built ${files.length} static files into dist/`);
