"use client";
import { useEffect, useRef } from "react";

interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}

export default function Lightning({
  hue = 185,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
}: LightningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vsSource = `
      attribute vec2 aPosition;
      void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2  iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      #define OCTAVE_COUNT 10

      vec3 hsv2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
        return c.z*mix(vec3(1.0),rgb,c.y);
      }
      float hash11(float p) { p=fract(p*.1031); p*=p+33.33; p*=p+p; return fract(p); }
      float hash12(vec2 p) {
        vec3 p3=fract(vec3(p.xyx)*.1031);
        p3+=dot(p3,p3.yzx+33.33);
        return fract((p3.x+p3.y)*p3.z);
      }
      mat2 rotate2d(float theta) { float c=cos(theta),s=sin(theta); return mat2(c,-s,s,c); }
      float noise(vec2 p) {
        vec2 ip=floor(p),fp=fract(p);
        float a=hash12(ip),b=hash12(ip+vec2(1.0,0.0)),c2=hash12(ip+vec2(0.0,1.0)),d=hash12(ip+vec2(1.0,1.0));
        vec2 t=smoothstep(0.0,1.0,fp);
        return mix(mix(a,b,t.x),mix(c2,d,t.x),t.y);
      }
      float fbm(vec2 p) {
        float value=0.0,amplitude=0.5;
        for(int i=0;i<OCTAVE_COUNT;++i){
          value+=amplitude*noise(p);
          p*=rotate2d(0.45); p*=2.0; amplitude*=0.5;
        }
        return value;
      }
      void main() {
        vec2 uv=gl_FragCoord.xy/iResolution.xy;
        uv=2.0*uv-1.0;
        uv.x*=iResolution.x/iResolution.y;
        uv.x+=uXOffset;
        uv+=2.0*fbm(uv*uSize+0.8*iTime*uSpeed)-1.0;
        float dist=abs(uv.x);
        vec3 base=hsv2rgb(vec3(uHue/360.0,0.7,0.8));
        vec3 col=base*pow(mix(0.0,0.07,hash11(iTime*uSpeed))/dist,1.0)*uIntensity;
        gl_FragColor=vec4(col,1.0);
      }
    `;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Lightning shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = compile(vsSource, gl.VERTEX_SHADER);
    const fs = compile(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Lightning link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, "iResolution");
    const uTime = gl.getUniformLocation(prog, "iTime");
    const uH    = gl.getUniformLocation(prog, "uHue");
    const uX    = gl.getUniformLocation(prog, "uXOffset");
    const uSp   = gl.getUniformLocation(prog, "uSpeed");
    const uIn   = gl.getUniformLocation(prog, "uIntensity");
    const uSz   = gl.getUniformLocation(prog, "uSize");

    const t0 = performance.now();
    let raf: number;
    const loop = () => {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes,  canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform1f(uH,  hue);
      gl.uniform1f(uX,  xOffset);
      gl.uniform1f(uSp, speed);
      gl.uniform1f(uIn, intensity);
      gl.uniform1f(uSz, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
