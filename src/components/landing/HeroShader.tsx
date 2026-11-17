"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
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
  float ridge = smoothstep(0.35, 0.95, f) * (0.55 + 0.45*sin(f*12.0 + t*6.0));
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

function cssColor(name: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || "#000");
}

export function HeroShader({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the CSS background behind still looks fine.
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uBg: { value: cssColor("--bg") },
      uAccent: { value: cssColor("--accent") },
      uInk: { value: cssColor("--ink") },
      uDark: { value: document.documentElement.dataset.theme === "dark" ? 1 : 0 },
    };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms }));
    scene.add(mesh);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height, false);
      uniforms.uRes.value.set(width, height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const target = new THREE.Vector2(0.5, 0.5);
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const mo = new MutationObserver(() => {
      uniforms.uBg.value = cssColor("--bg");
      uniforms.uAccent.value = cssColor("--accent");
      uniforms.uInk.value = cssColor("--ink");
      uniforms.uDark.value = document.documentElement.dataset.theme === "dark" ? 1 : 0;
      if (reduced) renderer.render(scene, camera);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);

    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      uniforms.uTime.value = 20 + (performance.now() - t0) / 1000;
      uniforms.uMouse.value.lerp(target, 0.03);
      renderer.render(scene, camera);
    };
    if (reduced) renderer.render(scene, camera);
    else loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={ref} aria-hidden className={className} />;
}
