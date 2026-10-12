import { GreetingScene } from './mascot-motion.js';

// Closing film: arrive, settle, then wave. The contact copy stays in readable HTML.
export const CLOSING_DURATION = 6200;
export class ClosingScene {
  constructor(canvas,image) { this.canvas=canvas;this.ctx=canvas.getContext('2d');this.image=image;this.greeting=new GreetingScene(image); }
  render(ms,options={}) {
    const c=this.canvas,ctx=this.ctx,box=c.getBoundingClientRect();
    const w=options.width||box.width||c.width,h=options.height||box.height||c.height,dpr=options.dpr||Math.min(devicePixelRatio||1,2);
    if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    if(options.background){ctx.fillStyle=options.background;ctx.fillRect(0,0,w,h);}
    const enter=Math.min(1,Math.max(0,ms/1200)),ease=1-Math.pow(1-enter,3);
    const ih=h*(options.includeCopy?.76:.98),iw=ih*this.image.width/this.image.height,x=(options.includeCopy?w*.08:(w-iw)/2)-(1-ease)*w*.48,y=options.includeCopy?(h-ih)/2:h-ih;
    ctx.save();ctx.globalAlpha=options.static?1:ease;
    const bow=!options.static&&ms>1500&&ms<2600?Math.sin((ms-1500)/1100*Math.PI)*.025:0;
    ctx.translate(x+iw*.5,y+ih*.95);ctx.rotate(bow);ctx.translate(-iw*.5,-ih*.95);
    ctx.drawImage(options.static?this.image:this.greeting.render(Math.max(0,ms-2000)),0,0,iw,ih);ctx.restore();
    if(options.includeCopy){
      const fade=Math.min(1,Math.max(0,(ms-800)/900));ctx.save();ctx.globalAlpha=fade;ctx.textBaseline='top';ctx.textAlign='left';
      const left=w*.45,size=Math.min(w*.049,h*.085);ctx.fillStyle='#62676b';ctx.font=`400 ${size*.29}px Calibri, 'Segoe UI', Arial, sans-serif`;ctx.fillText('Cảm ơn bạn đã ghé xem.',left,h*.25);
      ctx.fillStyle='#202427';ctx.font=`700 ${size}px Calibri, 'Segoe UI', Arial, sans-serif`;ctx.fillText('Mình có thể',left,h*.34);ctx.fillText('trao đổi tiếp.',left,h*.34+size*1.13);
      ctx.font=`400 ${size*.3}px Calibri, 'Segoe UI', Arial, sans-serif`;ctx.fillStyle='#62676b';ctx.fillText('Tư vấn quy trình · Nghiên cứu ứng dụng',left,h*.59);
      ctx.font=`700 ${size*.42}px Calibri, 'Segoe UI', Arial, sans-serif`;ctx.fillStyle='#202427';ctx.fillText('daichunghy@gmail.com',left,h*.68);ctx.restore();
    }
  }
}
export async function createClosingScene(canvas) {
  const image=new Image();image.src=new URL('../assets/chung-hy-mascot-closing-v2.webp',import.meta.url).href;await image.decode();return new ClosingScene(canvas,image);
}
