"use client";

import { useEffect, useRef } from "react";

/**
 * Hero background: a single full-screen fragment shader on raw WebGL.
 * (Three.js cost ~130 KB gzipped for one quad; this is ~2 KB.)
 *  - starts only when scrolled into view, pauses when off-screen or the tab is hidden
 *  - renders at half resolution: the image is soft, so nobody can tell, and the GPU does 4× less work
 *  - re-reads theme colours when light/dark switches
 */

const vert = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/** Domain-warped fbm "silk": slow, warm, reacts softly to the pointer. */
const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec3 uBg;
uniform vec3 uAccent;
uniform vec3 uInk;
uniform float uDark;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<5;i++){ v += a*noise(p); p = r*p*2.02; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0) * 2.2;
  float t = uTime * 0.045;
  vec2 m = (uMouse - 0.5) * 0.6;
  vec2 q = vec2(fbm(p + t + m), fbm(p + vec2(5.2,1.3) - t));
  vec2 r = vec2(fbm(p + 3.0*q + vec2(1.7,9.2) + t*1.3), fbm(p + 3.0*q + vec2(8.3,2.8) - t));
  float f = fbm(p + 2.5*r);

  // Silk ridges
  // Broad, low-frequency bands: thin high-frequency ridges showed up as hairline "dotted" contours.
  float ridge = smoothstep(0.35, 0.95, f) * (0.72 + 0.28*sin(f*5.0 + t*3.0));
  vec3 warm = mix(uAccent, vec3(1.0,0.78,0.42), 0.35);
  vec3 col = mix(uBg, warm, ridge * (uDark > 0.5 ? 0.7 : 0.6));
  col = mix(col, uAccent, smoothstep(0.55, 0.95, f) * 0.5);
  col += (uInk - uBg) * 0.04 * q.x;

  // Fade into the page at the edges / bottom
  float vign = smoothstep(1.25, 0.25, length((uv - vec2(0.5, 0.62)) * vec2(1.0, 1.35)));
  col = mix(uBg, col, vign);
  col = mix(col, uBg, smoothstep(0.35, 0.0, uv.y));

  // Dither to kill banding
  col += (hash(uv*uRes + uTime) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

function cssColor(name: string): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((c) => c + c).join("") : v || "000000", 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const RES = 0.5;

export function HeroShader({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let cleanup = () => {};
    // Defer all GPU work until the section is actually on screen.
    const gate = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      gate.disconnect();
      cleanup = start(host);
    }, { rootMargin: "200px" });
    gate.observe(host);
    return () => {
      gate.disconnect();
      cleanup();
    };
  }, []);

  return <div ref={ref} aria-hidden className={className} />;
}

function start(host: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s ease";
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: false });
  if (!gl) return () => {}; // No WebGL: the page background still looks right.
  host.appendChild(canvas);

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.remove();
    return () => {};
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uTime = u("uTime"), uRes = u("uRes"), uMouse = u("uMouse"), uBg = u("uBg"), uAccent = u("uAccent"), uInk = u("uInk"), uDark = u("uDark");
  const setTheme = () => {
    gl.uniform3fv(uBg, cssColor("--bg"));
    gl.uniform3fv(uAccent, cssColor("--accent"));
    gl.uniform3fv(uInk, cssColor("--ink"));
    gl.uniform1f(uDark, document.documentElement.dataset.theme === "dark" ? 1 : 0);
  };
  setTheme();

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2) * RES;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = 1 - (e.clientY - r.top) / r.height;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const draw = (time: number) => {
    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;
    gl.uniform1f(uTime, 20 + time / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const mo = new MutationObserver(() => {
    setTheme();
    if (reduced) draw(0);
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(host);

  let raf = 0;
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop);
    if (visible && !document.hidden) draw(t);
  };
  if (reduced) draw(0);
  else raf = requestAnimationFrame(loop);
  requestAnimationFrame(() => (canvas.style.opacity = "1"));

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    mo.disconnect();
    window.removeEventListener("pointermove", onMove);
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
  };
}
