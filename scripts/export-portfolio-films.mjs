const {chromium}=await import(process.env.PORTFOLIO_PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
const root=process.cwd(),out=path.join(root,'portfolio/assets/video');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PORTFOLIO_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--enable-webgl','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
 await page.goto((process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4173/portfolio/')+'motion-review.html');
 await page.waitForFunction(()=>window.portfolioFilms);
 await page.evaluate(()=>document.fonts.ready);
 for(const kind of ['opening','closing']){
  const dir=path.join(root,'.audit/film-frames-'+kind);await fs.mkdir(dir,{recursive:true});
  const duration=await page.evaluate(k=>window.portfolioFilms[k].duration,kind),fps=30,total=Math.ceil(duration/1000*fps);
  for(let i=0;i<total;i++){
   const data=await page.evaluate(({kind,ms})=>{
    const film=window.portfolioFilms[kind];film.scene.render(ms,{...film.options,width:1280,height:720,dpr:1});
    return film.scene.canvas.toDataURL('image/png').split(',')[1];
   },{kind,ms:i*1000/fps});
   await fs.writeFile(path.join(dir,String(i).padStart(4,'0')+'.png'),Buffer.from(data,'base64'));
  }
  await new Promise((resolve,reject)=>{const child=spawn(process.env.PORTFOLIO_FFMPEG || 'ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',dir+'/%04d.png','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',out+'/chung-hy-'+kind+'-v2.mp4'],{stdio:'inherit'});child.on('exit',c=>c===0?resolve():reject(Error('ffmpeg '+c)));});
  console.log(JSON.stringify({kind,fps,total,duration,path:out+'/chung-hy-'+kind+'-v2.mp4'}));
 }
}finally{await browser.close();}
