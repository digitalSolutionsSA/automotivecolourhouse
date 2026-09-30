import * as THREE from 'three';
import gsap from 'gsap';

export interface Finish {
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

export const FINISHES: Record<string, Finish> = {
  Gloss: { roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02 },
  Satin: { roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.35 },
  Matte: { roughness: 0.72, clearcoat: 0, clearcoatRoughness: 1 },
};

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// ---- panel design (units ≈ metres / 1.1) ----
const ARCH = { x: -0.35, r: 0.86 }; // wheel-arch cut-out, centred on the sill line
const THICK = 0.035; // sheet thickness
const GU = 260; // grid resolution along the length
const GV = 130; // grid resolution up the height
const CREASE = 1.18; // shoulder crease height
const JC = 84; // grid row that runs exactly along the crease, so it stays crisp

/** Sill / arch line: the bottom edge of the panel. */
function bottomAt(x: number) {
  const dx = x - ARCH.x;
  const arch = Math.abs(dx) < ARCH.r ? Math.sqrt(ARCH.r * ARCH.r - dx * dx) : 0;
  return Math.max(arch, 0.32 * smooth(1.55, 2.05, x)); // rear edge sweeps up into the bumper line
}

/** Top edge: rises toward the rear haunch, then drops into the tail. */
function topAt(x: number) {
  return 1.62 + 0.08 * smooth(-2, 0.4, x) - 0.34 * smooth(0.9, 2.1, x);
}

/** Outward offset of the surface: haunch, crown, crease and arch flare. */
function surfaceZ(x: number, y: number) {
  let z = 0;
  z -= 0.42 * Math.pow(smooth(0.9, 2.15, x), 2); // wraps around the rear corner
  z -= 0.1 * Math.pow(smooth(-1.4, -2.15, x), 2); // gentle curve into the door shut line
  z -= 0.34 * Math.pow(Math.max(0, y - CREASE), 1.6); // tumblehome above the shoulder
  z += 0.13 * Math.exp(-Math.pow((x - ARCH.x - 0.1) / 1.0, 2)) * Math.exp(-Math.pow((y - 0.95) / 0.42, 2)); // haunch
  // sharp shoulder crease that catches a highlight
  const c = y - CREASE;
  z += 0.035 * (c < 0 ? Math.exp(-Math.pow(c / 0.08, 2)) : Math.exp(-Math.pow(c / 0.03, 2)));
  // flared wheel-arch lip
  const d = Math.hypot(x - ARCH.x, y) - ARCH.r;
  if (d > -0.02) z += 0.075 * Math.exp(-Math.pow(d / 0.1, 2));
  return z;
}

/** Builds the panel: painted outer skin, bare-steel inner skin and rolled edges. */
function buildPanel() {
  const X0 = -2.15;
  const X1 = 2.12;
  const front: THREE.Vector3[] = [];
  for (let j = 0; j <= GV; j++) {
    const v = j / GV;
    for (let i = 0; i <= GU; i++) {
      const u = i / GU;
      // door edge is upright, the rear edge leans back like a C-pillar
      const x = THREE.MathUtils.lerp(X0 + 0.04 * v, X1 - 0.3 * v * v, u);
      // rows below JC span sill→crease, rows above span crease→top
      const y = j <= JC
        ? THREE.MathUtils.lerp(bottomAt(x), CREASE, j / JC)
        : THREE.MathUtils.lerp(CREASE, topAt(x), (j - JC) / (GV - JC));
      front.push(new THREE.Vector3(x, y, surfaceZ(x, y)));
    }
  }
  const idx = (i: number, j: number) => j * (GU + 1) + i;

  const grid = (pts: THREE.Vector3[], flip: boolean) => {
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const index: number[] = [];
    for (let j = 0; j < GV; j++) {
      for (let i = 0; i < GU; i++) {
        const a = idx(i, j), b = idx(i + 1, j), c = idx(i + 1, j + 1), d = idx(i, j + 1);
        if (flip) index.push(a, d, b, b, d, c);
        else index.push(a, b, d, b, c, d);
      }
    }
    g.setIndex(index);
    g.computeVertexNormals();
    return g;
  };

  const outer = grid(front, false);
  // inner skin: offset along the outer normals
  const n = outer.attributes.normal as THREE.BufferAttribute;
  const back = front.map((p, k) => p.clone().addScaledVector(new THREE.Vector3(n.getX(k), n.getY(k), n.getZ(k)), -THICK));
  const inner = grid(back, true);

  // rolled edge: a tube around the panel perimeter, halfway through the sheet
  const loop: THREE.Vector3[] = [];
  const mid = (i: number, j: number) => front[idx(i, j)].clone().lerp(back[idx(i, j)], 0.5);
  for (let i = 0; i < GU; i += 2) loop.push(mid(i, 0));
  for (let j = 0; j < GV; j += 2) loop.push(mid(GU, j));
  for (let i = GU; i > 0; i -= 2) loop.push(mid(i, GV));
  for (let j = GV; j > 0; j -= 2) loop.push(mid(0, j));
  const edge = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop, true, 'catmullrom', 0.1), 900, THICK * 0.62, 10, true);

  return { outer, inner, edge };
}

interface Callbacks {
  onLoaded?: () => void;
}

/** A sculpted car body panel in a dark photo studio, painted live. */
export class PanelShowcase {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private paint: THREE.MeshPhysicalMaterial;
  private pivot = new THREE.Group();
  private raf = 0;
  private visible = false;
  private io: IntersectionObserver;
  private ro: ResizeObserver;
  private drag = { active: false, x: 0, y: 0, vel: 0 };
  private target = new THREE.Vector2(0.08, -0.55);
  private clockStart = performance.now();

  constructor(private canvas: HTMLCanvasElement, private host: HTMLElement, cb: Callbacks = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    this.scene.environment = this.makeStudio();

    this.paint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1a1a1c'),
      metalness: 0.45,
      ...FINISHES.Gloss,
      envMapIntensity: 1.5,
    });
    const steel = new THREE.MeshPhysicalMaterial({
      color: 0x8d9196,
      metalness: 1,
      roughness: 0.38,
      envMapIntensity: 1.1,
    });

    const { outer, inner, edge } = buildPanel();
    const panel = new THREE.Group();
    panel.add(new THREE.Mesh(outer, this.paint));
    panel.add(new THREE.Mesh(inner, steel));
    panel.add(new THREE.Mesh(edge, this.paint));
    // centre it on the pivot, standing just above the floor shadow
    const box = new THREE.Box3().setFromObject(panel);
    const c = box.getCenter(new THREE.Vector3());
    panel.position.set(-c.x, -box.min.y - 0.95, -c.z);
    this.pivot.add(panel);
    this.scene.add(this.pivot);
    this.makeShadow();

    const key = new THREE.DirectionalLight(0xfff1e0, 1.2);
    key.position.set(-4, 6, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.6);
    rim.position.set(5, 3, -5);
    this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 0.35));

    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    this.io.observe(host);
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(host);
    canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    this.resize();
    this.tick();
    cb.onLoaded?.();
  }

  /** Black room lit by softboxes and strip lights: crisp reflections along the body lines. */
  private makeStudio() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color(0x030303);
    const light = (w: number, h: number, i: number, pos: [number, number, number]) => {
      const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.97, 0.93).multiplyScalar(i), side: THREE.DoubleSide });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      p.position.set(...pos);
      p.lookAt(0, 0, 0);
      env.add(p);
    };
    light(12, 4, 3.5, [0, 8, 0]); // overhead softbox
    light(0.6, 10, 7, [-8, 2, 3]); // left strip
    light(0.6, 10, 6, [8, 2, -2]); // right strip
    light(14, 0.4, 7, [0, 2.2, -9]); // horizon line behind
    light(14, 0.4, 5, [0, 1.6, 9]); // horizon line in front
    light(5, 2.5, 1.2, [0, 1.5, 8]); // fill
    return pmrem.fromScene(env, 0.02).texture;
  }

  private makeShadow() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(256, 128, 10, 256, 128, 250);
    g.addColorStop(0, 'rgba(0,0,0,0.85)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 1.6),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1.12;
    this.scene.add(mesh);
  }

  setColor(hex: string, metalness = 0.45) {
    const c = new THREE.Color(hex);
    gsap.to(this.paint.color, { r: c.r, g: c.g, b: c.b, duration: 1, ease: 'power2.inOut' });
    gsap.to(this.paint, { metalness, duration: 1 });
    this.drag.vel += 0.03; // small flourish so the new paint catches the light
  }

  setFinish(name: string) {
    gsap.to(this.paint, { ...FINISHES[name], duration: 1, ease: 'power2.inOut' });
  }

  private onDown = (e: PointerEvent) => {
    this.drag.active = true;
    this.drag.x = e.clientX;
    this.drag.y = e.clientY;
    this.canvas.style.cursor = 'grabbing';
  };
  private onMove = (e: PointerEvent) => {
    if (!this.drag.active) return;
    const dx = e.clientX - this.drag.x;
    const dy = e.clientY - this.drag.y;
    this.drag.x = e.clientX;
    this.drag.y = e.clientY;
    this.drag.vel = dx * 0.005;
    this.target.x = THREE.MathUtils.clamp(this.target.x + dy * 0.003, -0.25, 0.45);
  };
  private onUp = () => {
    this.drag.active = false;
    this.canvas.style.cursor = 'grab';
  };

  private resize = () => {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const dist = w / h < 1.3 ? 12 : 8.4;
    this.camera.position.set(0, 0.7, dist);
    this.camera.lookAt(0, -0.2, 0);
    this.camera.updateProjectionMatrix();
  };

  private tick = () => {
    this.raf = requestAnimationFrame(this.tick);
    if (!this.visible) return;
    const t = (performance.now() - this.clockStart) / 1000;
    this.target.y += this.drag.vel + (this.drag.active ? 0 : 0.0028);
    this.drag.vel *= 0.94;
    this.pivot.rotation.y += (this.target.y - this.pivot.rotation.y) * 0.08;
    this.pivot.rotation.x += (this.target.x - this.pivot.rotation.x) * 0.06;
    this.pivot.position.y = Math.sin(t * 0.8) * 0.05; // gentle float, like a display piece
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    this.ro.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    this.renderer.dispose();
  }
}
