import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base='https://daichunghy-ben.github.io/portfolio/';
const names=['index','about','projects','research-hotel','research-ev','research-virtual-influencers','research-nutrition','research-motorbike-ban','research-hotel-prca','research-hotel-value','research-leveraging-influencer','research-buffet','research-psych-ownership','research-arts-workshop'];
const files=new Set(names.map(n=>n+'.html'));
const norm=s=>s.replace(/\s+/g,' ').trim();
const decode=s=>s.replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pieces=/(<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<(?:[^>"']|"[^"]*"|'[^']*')+>)/gi;
const viFile=f=>f.replace(/\.html$/,'.vi.html');
function clean(html){return html.replace(/<nav\b[^>]*data-locale-switcher[^>]*>[\s\S]*?<\/nav>/g,'').replace(/<(?:link|script)\b[^>]*data-bilingual[^>]*>(?:<\/script>)?/g,'').replace(/\n+(?=<\/head>)/,'\n');}
function controls(file,locale){return `<nav class="locale-switcher" data-locale-switcher aria-label="${locale==='vi'?'Ngôn ngữ':'Language'}"><a data-locale-link href="${viFile(file)}?lang=vi" lang="vi" hreflang="vi" aria-label="Tiếng Việt"${locale==='vi'?' aria-current="page"':''}>VI</a><a data-locale-link href="${file}?lang=en" lang="en" hreflang="en" aria-label="English"${locale==='en'?' aria-current="page"':''}>EN</a></nav>`;}
function decorate(html,file,locale){
 const canonical=base+(locale==='vi'?viFile(file):file==='index.html'?'':file);
 html=html.replace(/<html\b[^>]*>/,tag=>tag.replace(/lang="[^"]*"/,'lang="'+locale+'"'));
 html=html.replace(/<link\b[^>]*rel="canonical"[^>]*>/,`<link rel="canonical" href="${canonical}"/>`);
 html=html.replace(/<meta\b[^>]*property="og:url"[^>]*>/,`<meta property="og:url" content="${canonical}"/>`);
 html=html.replace('</head>',`<link data-bilingual rel="alternate" hreflang="en" href="${base+file}"/>\n<link data-bilingual rel="alternate" hreflang="vi" href="${base+viFile(file)}"/>\n<link data-bilingual rel="alternate" hreflang="x-default" href="${base+file}"/>\n<link data-bilingual rel="stylesheet" href="styles/bilingual.css?v=bilingual1"/>\n<script data-bilingual type="module" src="js/language-switch.js?v=bilingual1"></script>\n</head>`);
 html=html.replace('</header>',controls(file,locale)+'</header>');
 return html;
}
export async function buildLocales(){
 const dictionary=JSON.parse(await fs.readFile(path.join(root,'portfolio/assets/data/translations-vi.json'),'utf8'));
 const missing=new Set();
 const translate=raw=>{
  const value=norm(decode(raw));if(!value)return raw;
  const text=dictionary[value];
  if(text!==undefined)return raw.replace(/\S[\s\S]*\S|\S/,esc(text));
  if(/[A-Za-z]{2}/.test(value))missing.add(value);
  return raw;
 };
 for(const name of names){
  const file=name+'.html',source=clean(await fs.readFile(path.join(root,'portfolio',file),'utf8'));
  let vi=source.split(pieces).map(part=>{
   if(!part)return '';
   if(/^<!--|^<!|^<script|^<style/i.test(part))return part;
   if(part.startsWith('<')){
    let tag=part.replace(/\b(alt|aria-label|title)="([^"]*)"/g,(_,attr,value)=>`${attr}="${translate(value)}"`);
    if(/^<meta\b/i.test(tag)&&/(?:name="description"|property="og:(?:title|description)")/.test(tag))tag=tag.replace(/content="([^"]*)"/,(_,v)=>`content="${translate(v)}"`);
    if(/^<a\b/i.test(tag))tag=tag.replace(/href="([^"#?]+)([^\"]*)"/,(match,prefix,suffix)=>files.has(prefix)?`href="${viFile(prefix)}${suffix}"`:match);
    return tag;
   }
   return translate(part);
  }).join('');
  // The home page's legacy profile-anchor redirects stay in the chosen locale.
  vi=vi.replace("new URL('about.html#'","new URL('about.vi.html#'");
  await fs.writeFile(path.join(root,'portfolio',file),decorate(source,file,'en'));
  await fs.writeFile(path.join(root,'portfolio',viFile(file)),decorate(vi,file,'vi'));
 }
 if(missing.size)throw new Error('Missing Vietnamese translations:\n'+[...missing].join('\n'));
 console.log(`Built ${names.length} English/Vietnamese page pairs.`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildLocales();
