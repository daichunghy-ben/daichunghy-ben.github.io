import { PROFILE_COPY } from './profile-copy.js';
import { GreetingScene, mountGreeting } from './mascot-motion.js';

/* One clock drives the wall, contact point, effort and profile reveal. */
export const NAME_READABLE_AT = 6000;
export const PROFILE_REVEAL_AT = NAME_READABLE_AT + 1500;
export const PROFILE_REVEAL_DURATION = 1200;
export const OPENING_DURATION = PROFILE_REVEAL_AT + PROFILE_REVEAL_DURATION;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };

class PuppetRig {
  constructor(image) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1152; this.canvas.height = 1664;
    const gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
    if (!gl) return;
    this.gl = gl;
    const shader = (type, source) => {
      const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, `
      attribute vec2 uv; varying vec2 tex; uniform float phase; uniform float effort; uniform float press;
      void main(){
        vec2 p=uv*vec2(1024.,1536.); tex=uv;
        // Soft weights preserve the face, glasses and hands without scaling them.
        float legs=smoothstep(1000.,1380.,p.y);
        float side=smoothstep(300.,520.,p.x);
        float stride=sin(phase+side*3.14159265);
        float lift=max(0.,cos(phase+side*3.14159265));
        p.x+=legs*stride*100.*effort;
        p.y+=legs*side*45.;
        p.y-=legs*lift*57.*effort;
        // The chest compresses toward the hands while their contact stays fixed.
        float torso=(1.-smoothstep(840.,990.,p.x))*(1.-legs);
        p.x+=torso*sin(phase*2.)*5.*effort;
        p.y+=torso*sin(phase*2.)*3.*effort;
        p.x+=torso*press*16.;
        p.y+=torso*press*9.;
        p+=vec2(64.,64.);
        gl_Position=vec4(p.x/1152.*2.-1.,1.-p.y/1664.*2.,0.,1.);
      }`));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
      precision mediump float; varying vec2 tex; uniform sampler2D image;
      void main(){vec4 color=texture2D(image,tex);gl_FragColor=vec4(color.rgb*color.a,color.a);}`));
    gl.linkProgram(program); gl.useProgram(program);
    const points=[]; const cols=48, rows=72;
    for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
      const a=[x/cols,y/rows], b=[(x+1)/cols,y/rows], c=[x/cols,(y+1)/rows], d=[(x+1)/cols,(y+1)/rows];
      points.push(...a,...b,...c,...b,...d,...c);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
    const uv=gl.getAttribLocation(program,'uv'); gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    this.count=points.length/2; this.phase=gl.getUniformLocation(program,'phase'); this.effort=gl.getUniformLocation(program,'effort'); this.press=gl.getUniformLocation(program,'press');
  }
  draw(phase, effort, press=0){
    if(!this.gl) return null;
    const gl=this.gl; gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(this.phase,phase); gl.uniform1f(this.effort,effort); gl.uniform1f(this.press,press); gl.drawArrays(gl.TRIANGLES,0,this.count);
    return this.canvas;
  }
}

export class OpeningScene {
  constructor(canvas, image, greeting) { this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.image=image; this.rig=new PuppetRig(image); this.greeting=greeting; }
  render(ms, options={}){
    const c=this.canvas, ctx=this.ctx, box=c.getBoundingClientRect();
    const w=options.width||box.width||c.width, h=options.height||box.height||c.height, dpr=options.dpr||Math.min(window.devicePixelRatio||1,2);
    if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
    // The name exists from frame zero. Only the moving wall hides it.
    const font=Math.min(w*.125,h*.18);
    ctx.save();ctx.fillStyle='#ed524a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${font}px Calibri, "Segoe UI", Arial, sans-serif`;
    ctx.fillText('CHUNG HY',w/2,h/2);ctx.restore();
    const height=Math.min(h*.48,w*.92), scale=height/1536;
    const startProgress=clamp((ms-80)/2300);
    const first=.65*startProgress+.35*smooth(startProgress), second=smooth((ms-3280)/3500);
    const resting=ms>=2380&&ms<3280;
    const restTime=clamp((ms-2380)/900);
    const initial=0, middle=w*.52, end=w+height*.82;
    const tremble=resting?Math.sin(restTime*Math.PI*6)*Math.sin(restTime*Math.PI)*height*.003:0;
    const coverX=ms<3280?initial+(middle-initial)*first+tremble:middle+(end-middle)*second;
    const progress=ms<3280?first*.5:.5+second*.5;
    const x=coverX-1018*scale, y=h*.74-height;
    const phase=ms<3280?first*Math.PI*3.5:Math.PI*3.5+second*Math.PI*6.5;
    const effort=resting?1:smooth(progress/.06)*(1-smooth((progress-.96)/.04));
    const press=resting?Math.sin(restTime*Math.PI)*(.75+.25*Math.sin(restTime*Math.PI*6)):0;
    if(progress>0 && progress<1){
      ctx.save();ctx.fillStyle='rgba(35,28,22,.10)';ctx.beginPath();ctx.ellipse(x+480*scale,y+1508*scale,350*scale,15*scale,0,0,Math.PI*2);ctx.fill();ctx.restore();
      const puppet=this.rig.draw(phase,effort,press);
      if(puppet) ctx.drawImage(puppet,x-64*scale,y-64*scale,1152*scale,1664*scale);
      else ctx.drawImage(this.image,x,y,1024*scale,height);
      // Two modest beads during the pause make the effort readable.
      const sweat=smooth((ms-2380)/160)*(1-smooth((ms-3340)/420));
      if(sweat>0){
        for(let i=0;i<2;i++){
          const fall=((ms-2380+i*260)%700)/700;
          const sx=x+(735+i*58)*scale, sy=y+(205+i*75+fall*48)*scale, r=(27-i*5)*scale;
          ctx.save();ctx.translate(sx,sy);ctx.rotate(-.25);ctx.globalAlpha=sweat*(1-fall*.45);
          ctx.fillStyle='#59b7d1';ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,scale*4);
          ctx.beginPath();ctx.moveTo(0,-r);ctx.bezierCurveTo(r*.85,0,r*.8,r*.85,0,r);ctx.bezierCurveTo(-r*.8,r*.85,-r*.85,0,0,-r);ctx.fill();ctx.stroke();ctx.restore();
        }
      }
    }
    const wallLeft=Math.max(0,coverX);
    if(wallLeft<w){
      // The black wall starts closed and reveals the white room as it moves.
      const edge=ctx.createLinearGradient(wallLeft-12,0,wallLeft,0);
      edge.addColorStop(0,'rgba(30,30,30,0)');edge.addColorStop(1,'rgba(30,30,30,.12)');
      if(coverX>0){ctx.fillStyle=edge;ctx.fillRect(wallLeft-12,0,12,h);}
      ctx.fillStyle='#171719';ctx.fillRect(wallLeft,0,w+height,h);
    }
    const profileProgress=smooth((ms-PROFILE_REVEAL_AT)/PROFILE_REVEAL_DURATION);
    if(options.includeProfile!==false&&profileProgress>0&&this.greeting){
      this.drawProfile(ms,w,h,profileProgress,options.locale||'vi');
    }
    this.contact={coverX,handX:x+1018*scale,progress,profileProgress};
    return this.contact;
  }
  drawProfile(ms,w,h,alpha,locale){
    const ctx=this.ctx, copy=PROFILE_COPY[locale]||PROFILE_COPY.vi, mobile=w<700;
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
    const artHeight=mobile?h*.33:h*.68, artWidth=artHeight*this.greeting.image.width/this.greeting.image.height;
    const artX=mobile?(w-artWidth)/2:w*.055, artY=mobile?h*.035:(h-artHeight)/2;
    const illustration=this.greeting.render(ms-PROFILE_REVEAL_AT);
    ctx.drawImage(illustration,artX,artY,artWidth,artHeight);
    const left=mobile?w*.07:w*.39, available=mobile?w*.86:w*.56;
    let top=mobile?h*.4:h*.19;
    ctx.textAlign='left';ctx.textBaseline='top';ctx.fillStyle='#171719';
    const size=mobile?w*.069:Math.min(w*.044,h*.09);
    ctx.font=`400 ${size*.36}px Calibri, "Segoe UI", Arial, sans-serif`;ctx.fillText(copy.greeting,left,top);top+=size*.75;
    ctx.font=`700 ${size}px Calibri, "Segoe UI", Arial, sans-serif`;
    for(const line of copy.title){ctx.fillText(line,left,top,available);top+=size*1.05;}
    top+=size*.34;ctx.font=`400 ${size*.31}px Calibri, "Segoe UI", Arial, sans-serif`;ctx.fillStyle='#53535a';
    let line='';for(const word of copy.summary.split(' ')){const next=line+word+' ';if(ctx.measureText(next).width>available){ctx.fillText(line.trim(),left,top);top+=size*.47;line=word+' ';}else line=next;}ctx.fillText(line.trim(),left,top);
    top+=size*.78;ctx.fillStyle='#171719';ctx.font=`700 ${size*.27}px Calibri, "Segoe UI", Arial, sans-serif`;ctx.fillText(copy.role,left,top);top+=size*.45;
    ctx.font=`400 ${size*.27}px Calibri, "Segoe UI", Arial, sans-serif`;ctx.fillStyle='#53535a';ctx.fillText(copy.education+' · Swinburne',left,top);
    top+=size*.8;ctx.fillStyle='#ed524a';ctx.fillText(copy.action+' ↗',left,top);ctx.restore();
  }
}

async function loadImage(src){const image=new Image();image.src=src;await image.decode();return image;}
export async function createOpeningScene(canvas){
  const [image,greeting]=await Promise.all([
    loadImage(new URL('../assets/chung-hy-mascot-chibi-v1.webp',import.meta.url).href),
    loadImage(new URL('../assets/chung-hy-mascot-greeting-v1.webp',import.meta.url).href).catch(()=>null)
  ]);
  return new OpeningScene(canvas,image,greeting?new GreetingScene(greeting):null);
}

let activeFinish = null;
export async function mountOpening(force = false){
  const screen=document.getElementById('opening-screen');if(!screen)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  // Deep links open their destination directly. The replay control is always available.
  if(reduced.matches || (!force && location.hash && location.hash !== '#top'))return;
  activeFinish?.();
  let stopped=false,frame=0;
  const previousFocus=document.activeElement;
  const finish=()=>{
    if(stopped)return;stopped=true;cancelAnimationFrame(frame);clearTimeout(failsafe);
    document.body.classList.remove('intro-gate-pending','intro-gate-revealing');
    screen.hidden=true;screen.setAttribute('aria-hidden','true');
    document.getElementById('main-content')?.removeAttribute('inert');
    document.querySelector('.site-header')?.removeAttribute('inert');
    document.removeEventListener('keydown',onKey);reduced.removeEventListener('change',onReduced);
    if(previousFocus && previousFocus !== document.body)previousFocus.focus({preventScroll:true});
    activeFinish=null;
  };
  const onKey=e=>{if(e.key==='Escape')finish();};
  const onReduced=()=>{if(reduced.matches)finish();};
  const failsafe=setTimeout(finish,15000);
  activeFinish=finish;screen.hidden=false;screen.style.opacity='1';screen.setAttribute('aria-hidden','false');
  document.body.classList.add('intro-gate-pending');
  document.getElementById('main-content')?.setAttribute('inert','');
  document.querySelector('.site-header')?.setAttribute('inert','');
  document.getElementById('opening-skip').onclick=finish;
  document.getElementById('opening-skip').focus({preventScroll:true});
  document.addEventListener('keydown',onKey);reduced.addEventListener('change',onReduced);
  try{
    const scene=await createOpeningScene(screen.querySelector('canvas'));if(stopped)return;
    const start=performance.now();
    const tick=now=>{
      if(stopped)return;const ms=now-start;
      const {profileProgress}=scene.render(ms,{includeProfile:false});
      if(ms>=PROFILE_REVEAL_AT){document.body.classList.remove('intro-gate-pending');document.body.classList.add('intro-gate-revealing');screen.style.opacity=String(1-profileProgress);}
      if(ms>=OPENING_DURATION){finish();return;}frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
  }catch{finish();}
}
document.getElementById('replay-opening')?.addEventListener('click',()=>mountOpening(true));
document.querySelector('.skip-link')?.addEventListener('click',()=>activeFinish?.());
if(matchMedia('(prefers-reduced-motion: reduce)').matches){const replay=document.getElementById('replay-opening');if(replay)replay.hidden=true;}
mountGreeting();
mountOpening();
