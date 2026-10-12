import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.PORTFOLIO_PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),version=process.env.PORTFOLIO_FILM_VERSION||'v4',dir=path.join(root,'.audit/film-profile-'+version),out=path.join(root,'portfolio/assets/video/chung-hy-profile-loop-'+version+'.mp4');await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PORTFOLIO_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--enable-webgl','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});await page.goto((process.env.PORTFOLIO_PREVIEW_URL||'http://127.0.0.1:4173/portfolio/')+'motion-review.html');await page.waitForFunction(()=>window.portfolioFilms?.profile);await page.evaluate(()=>document.fonts.ready);
 const fps=30,total=270;
 for(let i=0;i<total;i++){
  const png=await page.evaluate(ms=>{const scene=window.portfolioFilms.profile.scene;scene.render(ms,{width:720,height:900,dpr:1});return scene.canvas.toDataURL('image/png').split(',')[1];},i*1000/fps);
  await fs.writeFile(path.join(dir,String(i).padStart(4,'0')+'.png'),Buffer.from(png,'base64'));
 }
 await new Promise((resolve,reject)=>{const child=spawn(process.env.PORTFOLIO_FFMPEG||'ffmpeg',['-y','-loglevel','error','-framerate','30','-i',dir+'/%04d.png','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:'inherit'});child.on('exit',code=>code===0?resolve():reject(Error('Film export failed')));});
 const {default:sharp}=await import('sharp');await sharp(path.join(dir,'0000.png')).webp({quality:88}).toFile(path.join(root,'portfolio/assets/chung-hy-profile-film-'+version+'-poster.webp'));
 console.log(JSON.stringify({out,duration:9,fps,width:720,height:900}));
}finally{await browser.close();}
