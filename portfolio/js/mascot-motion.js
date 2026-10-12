export class GreetingScene {
  constructor(image){
    this.image=image;this.canvas=document.createElement('canvas');
    this.canvas.width=image.naturalWidth||image.width;this.canvas.height=image.naturalHeight||image.height;
    const gl=this.canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
    this.gl=gl;if(!gl)return;
    const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,`
      attribute vec2 uv; varying vec2 tex; uniform float time; uniform float aspect;
      void main(){
        tex=uv;vec2 p=uv;
        // Wave the raised hand around its elbow; keep glasses and face still.
        float hand=smoothstep(.57,.77,p.x)*(1.-smoothstep(.39,.56,p.y));
        vec2 q=(p-vec2(.72,.41))*vec2(aspect,1.);
        float angle=sin(time*3.8)*.085*hand;
        q=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*q;
        p=vec2(.72,.41)+q/vec2(aspect,1.);
        float chest=smoothstep(.40,.54,p.y)*(1.-smoothstep(.72,.88,p.y));
        p.y-=sin(time*1.6)*.0025*chest;
        gl_Position=vec4(p.x*2.-1.,1.-p.y*2.,0.,1.);
      }`));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 tex;uniform sampler2D image;void main(){vec4 c=texture2D(image,tex);gl_FragColor=vec4(c.rgb*c.a,c.a);}`));
    gl.linkProgram(program);gl.useProgram(program);
    const points=[],cols=40,rows=60;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=[x/cols,y/rows],b=[(x+1)/cols,y/rows],c=[x/cols,(y+1)/rows],d=[(x+1)/cols,(y+1)/rows];points.push(...a,...b,...c,...b,...d,...c);}
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
    const uv=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
    gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    this.count=points.length/2;this.time=gl.getUniformLocation(program,'time');gl.uniform1f(gl.getUniformLocation(program,'aspect'),this.canvas.width/this.canvas.height);
  }
  render(ms){
    if(!this.gl)return this.image;
    const gl=this.gl;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(this.time,ms/1000);gl.drawArrays(gl.TRIANGLES,0,this.count);return this.canvas;
  }
}

export async function mountGreeting(){
  const image=document.querySelector('.intro-mascot'),canvas=document.querySelector('.profile-mascot-motion'),button=document.getElementById('profile-motion-toggle');
  if(!image||!canvas||!button)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduced.matches){button.hidden=true;return;}
  try{
    await image.decode();const scene=new GreetingScene(image);if(!scene.gl){button.hidden=true;return;}
    canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d');
    let paused=false,visible=false,frame=0,last=0,elapsed=0;
    const paint=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(scene.render(elapsed),0,0);};
    const tick=now=>{if(paused||!visible||document.hidden)return;elapsed+=last?Math.min(now-last,80):0;last=now;paint();frame=requestAnimationFrame(tick);};
    const resume=()=>{cancelAnimationFrame(frame);last=0;if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick);};
    paint();image.closest('.mascot-frame').classList.add('has-motion');
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();},{threshold:.1}).observe(canvas);
    document.addEventListener('visibilitychange',resume);
    button.addEventListener('click',()=>{paused=!paused;button.setAttribute('aria-pressed',String(paused));button.classList.toggle('is-paused',paused);button.textContent=paused?'▷':'Ⅱ';resume();});
    reduced.addEventListener('change',()=>{paused=reduced.matches;button.hidden=paused;resume();});
  }catch{button.hidden=true;}
}
