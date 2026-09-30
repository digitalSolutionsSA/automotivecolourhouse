import * as THREE from 'three';
import gsap from 'gsap';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform vec2 uRes1;
  uniform vec2 uRes2;
  uniform vec2 uView;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uZoom;
  uniform float uFocusX;
  uniform float uFrame; // fraction of the width the photo occupies (anchored right)

  // simplex-ish value noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  // object-fit: cover, anchored to the right so the car always stays in frame
  vec2 coverUv(vec2 uv, vec2 texRes) {
    float viewAspect = (uView.x * uFrame) / uView.y;
    float texAspect = texRes.x / texRes.y;
    vec2 scale = vec2(1.0);
    if (viewAspect > texAspect) scale.y = texAspect / viewAspect;
    else scale.x = viewAspect / texAspect;
    vec2 offset = vec2((1.0 - scale.x) * uFocusX, (1.0 - scale.y) * 0.5);
    return uv * scale + offset;
  }

  vec3 sampleImg(sampler2D tex, vec2 res, vec2 uv, vec2 distort) {
    uv.x = (uv.x - (1.0 - uFrame)) / uFrame;
    float fade = mix(1.0, smoothstep(-0.02, 0.38, uv.x), step(uFrame, 0.99));
    vec2 c = uv - 0.5;
    c /= uZoom;
    c += uMouse * 0.012;
    vec2 u = coverUv(c + 0.5 + distort, res);
    u = clamp(u, 0.001, 0.999);
    return texture2D(tex, u).rgb * fade;
  }

  void main() {
    vec2 uv = vUv;
    float n = fbm(uv * 3.0 + uTime * 0.05);

    // liquid paint wipe from right to left
    float edge = uProgress * 1.6 - 0.25;
    float field = (1.0 - uv.x) * 0.75 + n * 0.45;
    float mask = smoothstep(edge - 0.08, edge + 0.08, field);
    float band = smoothstep(0.12, 0.0, abs(field - edge)) * step(0.001, uProgress) * step(uProgress, 0.999);

    vec2 d1 = vec2(n - 0.5, 0.0) * 0.08 * uProgress;
    vec2 d2 = vec2(n - 0.5, 0.0) * 0.08 * (1.0 - uProgress);
    vec3 a = sampleImg(uTex1, uRes1, uv, d1);
    vec3 b = sampleImg(uTex2, uRes2, uv, d2);
    vec3 col = mix(b, a, mask);

    // wet sheen at the wipe edge
    col += band * vec3(0.18, 0.16, 0.14);

    // slow specular light sweep that only catches bright body panels
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float sweepPos = fract(uTime * 0.045) * 2.2 - 0.6;
    float diag = uv.x * 0.85 + uv.y * 0.35;
    float sweep = smoothstep(0.18, 0.0, abs(diag - sweepPos));
    col += sweep * smoothstep(0.18, 0.7, lum) * 0.22 * vec3(1.0, 0.95, 0.88);

    // film grain
    float g = hash(uv * uView + fract(uTime) * 100.0) - 0.5;
    col += g * 0.035;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const dustVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.12 + aSeed * 6.28) * 0.06 + uMouse.x * 0.02 * aSize;
    p.y += mod(uTime * 0.018 * (0.4 + aSeed) + aSeed * 2.0, 2.2) - 1.1;
    p.y += uMouse.y * 0.02 * aSize;
    vAlpha = 0.25 + 0.75 * abs(sin(uTime * 0.6 + aSeed * 20.0));
    // particles only glow inside the light shaft on the left
    vAlpha *= smoothstep(0.9, -0.4, p.x) * smoothstep(-1.1, -0.2, p.y + 0.3);
    gl_Position = vec4(p.xy, 0.0, 1.0);
    gl_PointSize = aSize;
  }
`;

const dustFragment = /* glsl */ `
  precision highp float;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(1.0, 0.9, 0.78, a * vAlpha * 0.55);
  }
`;

export interface HeroSlideImage {
  src: string;
  focusX: number;
}

export class HeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private material: THREE.ShaderMaterial;
  private dust: THREE.ShaderMaterial;
  private textures: THREE.Texture[] = [];
  private sizes: THREE.Vector2[] = [];
  private images: HeroSlideImage[];
  private current = 0;
  private raf = 0;
  private clock = new THREE.Clock();
  private mouseTarget = new THREE.Vector2();
  private visible = true;
  private observer: IntersectionObserver;

  constructor(private canvas: HTMLCanvasElement, images: HeroSlideImage[], onReady?: () => void) {
    this.images = images;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a0a);

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTex1: { value: null },
        uTex2: { value: null },
        uRes1: { value: new THREE.Vector2(1, 1) },
        uRes2: { value: new THREE.Vector2(1, 1) },
        uView: { value: new THREE.Vector2(1, 1) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
        uZoom: { value: 1.03 },
        uFocusX: { value: images[0].focusX },
        uFrame: { value: 1 },
      },
      depthTest: false,
    });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));

    // floating dust in the light
    const count = 140;
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 2 - 1;
      pos[i * 3 + 1] = Math.random() * 2 - 1;
      size[i] = (Math.random() * 2.5 + 0.8) * Math.min(window.devicePixelRatio, 2);
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.dust = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() } },
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.scene.add(new THREE.Points(geo, this.dust));

    const loader = new THREE.TextureLoader();
    let loaded = 0;
    images.forEach((img, i) => {
      loader.load(img.src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        this.textures[i] = tex;
        const el = tex.image as HTMLImageElement;
        this.sizes[i] = new THREE.Vector2(el.width, el.height);
        if (i === 0) {
          this.material.uniforms.uTex1.value = tex;
          this.material.uniforms.uTex2.value = tex;
          this.material.uniforms.uRes1.value = this.sizes[0];
          this.material.uniforms.uRes2.value = this.sizes[0];
        }
        loaded++;
        if (loaded === images.length) onReady?.();
      });
    });

    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', this.onPointer);
    this.observer = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    this.observer.observe(canvas);
    this.tick();
  }

  /** Liquid-wipe to another slide. */
  goTo(index: number, duration = 1.8) {
    if (index === this.current || !this.textures[index]) return;
    const u = this.material.uniforms;
    u.uTex1.value = this.textures[this.current];
    u.uRes1.value = this.sizes[this.current];
    u.uTex2.value = this.textures[index];
    u.uRes2.value = this.sizes[index];
    u.uProgress.value = 0;
    gsap.killTweensOf(u.uProgress);
    gsap.to(u.uProgress, { value: 1, duration, ease: 'power3.inOut' });
    gsap.to(u.uFocusX, { value: this.images[index].focusX, duration, ease: 'power3.inOut' });
    gsap.fromTo(u.uZoom, { value: 1.12 }, { value: 1.03, duration: 7, ease: 'power2.out' });
    this.current = index;
  }

  intro() {
    gsap.fromTo(this.material.uniforms.uZoom, { value: 1.3 }, { value: 1.03, duration: 3.2, ease: 'expo.out' });
  }

  private onPointer = (e: PointerEvent) => {
    this.mouseTarget.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  };

  private resize = () => {
    const parent = this.canvas.parentElement!;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.renderer.setSize(w, h, false);
    this.material.uniforms.uView.value.set(w, h);
    // on wide screens the car sits in the right portion and melts into black, as in the concepts
    this.material.uniforms.uFrame.value = w / h > 1.2 ? 0.86 : 1;
  };

  private tick = () => {
    this.raf = requestAnimationFrame(this.tick);
    if (!this.visible) return;
    const t = this.clock.getElapsedTime();
    const u = this.material.uniforms;
    u.uTime.value = t;
    (u.uMouse.value as THREE.Vector2).lerp(this.mouseTarget, 0.04);
    this.dust.uniforms.uTime.value = t;
    this.dust.uniforms.uMouse.value.copy(u.uMouse.value);
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointer);
    this.observer.disconnect();
    this.textures.forEach((t) => t.dispose());
    this.renderer.dispose();
  }
}
