// Shared keyframes for the portrait film. Raster poses are identity references;
// the mesh moves the hand, neck and shoulders independently of the camera.
export const PROFILE_FILM_DURATION = 9e3;

const ease = value => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
};

class ProfilePuppet {
    constructor(image, pointing = false) {
        this.image = image;
        this.pointing = pointing;
        this.canvas = document.createElement("canvas");
        this.canvas.width = 1152;
        this.canvas.height = 1664;
        const gl = this.canvas.getContext("webgl", {
            alpha: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: true
        });
        this.gl = gl;
        if (!gl) return;
        const shader = (type, source) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, source);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s));
            return s;
        };
        const program = gl.createProgram();
        gl.attachShader(program, shader(gl.VERTEX_SHADER, `\n      attribute vec2 uv; varying vec2 tex; uniform float phase; uniform float pointing;\n      vec2 rotate(vec2 p,vec2 pivot,float a){vec2 q=(p-pivot)*vec2(.666667,1.);q=mat2(cos(a),sin(a),-sin(a),cos(a))*q;return pivot+q/vec2(.666667,1.);}\n      void main(){\n        tex=uv;vec2 p=uv;\n        float head=1.-smoothstep(.28,.40,p.y);\n        p=rotate(p,vec2(.50,.35),sin(phase)*.045*head);\n        float hand=smoothstep(.68,.79,p.x)*(1.-smoothstep(.42,.56,p.y));\n        float wave=sin(phase*3.)*.22*(1.-pointing);\n        float point=sin(phase*2.)*.065*pointing;\n        p=rotate(p,vec2(.75,.43),(wave+point)*hand);\n        float chest=smoothstep(.34,.48,p.y)*(1.-smoothstep(.68,.84,p.y));\n        p.x+=sin(phase)*.008*chest;p.y-=sin(phase*2.)*.005*chest;\n        vec2 pixels=p*vec2(1024.,1536.)+vec2(64.,64.);\n        gl_Position=vec4(pixels.x/1152.*2.-1.,1.-pixels.y/1664.*2.,0.,1.);\n      }`));
        gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `precision mediump float;varying vec2 tex;uniform sampler2D image;void main(){vec4 c=texture2D(image,tex);gl_FragColor=vec4(c.rgb*c.a,c.a);}`));
        gl.linkProgram(program);
        gl.useProgram(program);
        const points = [], cols = 48, rows = 72;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
            const a = [ x / cols, y / rows ], b = [ (x + 1) / cols, y / rows ], c = [ x / cols, (y + 1) / rows ], d = [ (x + 1) / cols, (y + 1) / rows ];
            points.push(...a, ...b, ...c, ...b, ...d, ...c);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        const uv = gl.getAttribLocation(program, "uv");
        gl.enableVertexAttribArray(uv);
        gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        this.count = points.length / 2;
        this.phase = gl.getUniformLocation(program, "phase");
        gl.uniform1f(gl.getUniformLocation(program, "pointing"), pointing ? 1 : 0);
    }
    render(phase) {
        if (!this.gl) return this.image;
        const gl = this.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(this.phase, phase);
        gl.drawArrays(gl.TRIANGLES, 0, this.count);
        return this.canvas;
    }
}

export class ProfileFilm {
    constructor(canvas, wave, point) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.wave = new ProfilePuppet(wave);
        this.point = new ProfilePuppet(point, true);
    }
    render(ms, options = {}) {
        const c = this.canvas, ctx = this.ctx, box = c.getBoundingClientRect(), w = options.width || box.width || 720, h = options.height || box.height || 900, dpr = options.dpr || 1;
        if (c.width !== w * dpr || c.height !== h * dpr) {
            c.width = w * dpr;
            c.height = h * dpr;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#ece8df";
        ctx.fillRect(0, 0, w, h);
        const t = (ms % PROFILE_FILM_DURATION + PROFILE_FILM_DURATION) % PROFILE_FILM_DURATION, phase = t / PROFILE_FILM_DURATION * Math.PI * 2;
        // Each pose changes behind a moving paper mask, avoiding a face crossfade.
                const pointing = t >= 3400 && t < 6900, puppet = pointing ? this.point : this.wave;
        const ih = h * 1.18, iw = ih * 1152 / 1664, x = (w - iw) / 2, y = h * .075;
        ctx.drawImage(puppet.render(phase), x, y, iw, ih);
        ctx.fillStyle = "#d64336";
        ctx.beginPath();
        ctx.arc(w * .09, h * .075, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#62676b";
        ctx.font = `400 ${w * .023}px Calibri, 'Segoe UI', Arial, sans-serif`;
        ctx.fillText("CHUNG HY", w * .12, h * .082);
        ctx.save();
        ctx.translate(w * .1, h * .77 + Math.sin(phase) * h * .015);
        ctx.rotate(-.045 + Math.sin(phase) * .012);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#2024270c";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(0, 0, w * .58, h * .13, 12);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#253d55";
        ctx.font = `700 ${w * .035}px Calibri, 'Segoe UI', Arial, sans-serif`;
        ctx.fillText(pointing ? "QUY TRÌNH DOANH NGHIỆP" : "TƯ VẤN · NGHIÊN CỨU", w * .03, h * .051);
        ctx.fillStyle = "#62676b";
        ctx.font = `400 ${w * .025}px Calibri, 'Segoe UI', Arial, sans-serif`;
        ctx.fillText(pointing ? "1Office / Phương án vận hành" : "Chung Hy Dai / Portfolio", w * .03, h * .088);
        ctx.restore();
        for (const [start, end] of [ [ 3050, 3750 ], [ 6550, 7250 ] ]) if (t >= start && t <= end) {
            const progress = ease((t - start) / (end - start));
            ctx.save();
            ctx.translate(-w * 1.15 + progress * w * 2.3, 0);
            ctx.rotate(.1);
            ctx.fillStyle = "#f5f3ed";
            ctx.fillRect(0, -h * .1, w * 1.05, h * 1.3);
            ctx.restore();
        }
    }
}

export async function createProfileFilm(canvas) {
    const load = async file => {
        const image = new Image;
        image.src = new URL("../assets/" + file, import.meta.url).href;
        await image.decode();
        return image;
    };
    const [wave, point] = await Promise.all([ load("chung-hy-mascot-greeting-v1.webp"), load("chung-hy-mascot-profile-point-v3.webp") ]);
    return new ProfileFilm(canvas, wave, point);
}