// street-bg.js (DEBUG)
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

function dbg(...args){ console.log('[bg3d]', ...args); }

// ===== Canvas / Renderer =====
let canvas = document.getElementById('bg3d');
if (!canvas) {
  dbg('No #bg3d found in DOM. Creating one and appending to <body> now.');
  canvas = document.createElement('canvas');
  canvas.id = 'bg3d';
  document.body.appendChild(canvas);
}
dbg('Canvas element:', canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

// Target the camera looks at
const target = new THREE.Vector3(0, 1.2, 0);

// Spherical params
let radius = 5.0;
let baseYaw = 0.2;
let basePitch = 0.15;

// Live values
let yaw = baseYaw;
let pitch = basePitch;

// Limits & sensitivity
const MIN_PITCH = -Math.PI / 3;
const MAX_PITCH =  Math.PI / 3;
const YAW_RANGE   = 0.7;
const PITCH_RANGE = 0.35;

let locked = false;

function applyCamera() {
  const cx = target.x + radius * Math.sin(yaw) * Math.cos(pitch);
  const cz = target.z + radius * Math.cos(yaw) * Math.cos(pitch);
  const cy = target.y + radius * Math.sin(pitch);
  camera.position.set(cx, cy, cz);
  camera.lookAt(target);
}

camera.position.set(2.5, 1.8, 5.0);
camera.lookAt(target);

// ===== Resize =====
function resize(){
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  dbg('resize()', { w, h, cw: canvas.clientWidth, ch: canvas.clientHeight, locked });

  // If CSS didn't size the canvas, force full screen
  if (!canvas.style.width)  canvas.style.width  = '100%';
  if (!canvas.style.height) canvas.style.height = '100%';
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
resize();
window.addEventListener('resize', resize);

// ===== Lights =====
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(4, 10, 8);
scene.add(dir);

// ===== Load GLB =====
const loader = new GLTFLoader();
dbg('Loading GLB: /assets/street.glb');
loader.load(
  '/assets/street.glb',
  (gltf) => {
    dbg('GLB onLoad() fired. Scene:', gltf.scene);
    const root = gltf.scene;
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = false;
        if (o.material?.map) {
          o.material.map.colorSpace = THREE.SRGBColorSpace;
          o.material.needsUpdate = true;
        }
      }
    });
    scene.add(root);

    // Initialize spherical params from current camera so motion starts from your view
    const v = new THREE.Vector3().copy(camera.position).sub(target);
    radius = Math.max(0.01, v.length());
    baseYaw = Math.atan2(v.x, v.z);
    basePitch = Math.asin(THREE.MathUtils.clamp(v.y / radius, -1, 1));
    yaw = baseYaw; pitch = basePitch;

    dbg('Initialized camera params from current view:', {
      radius, baseYaw, basePitch, pos: camera.position.clone(), target: target.clone()
    });

    applyCamera();
  },
  (ev) => {
    // progress callback
    if (ev.lengthComputable) {
      const pct = Math.round((ev.loaded / ev.total) * 100);
      if (pct % 25 === 0) dbg(`GLB loading: ${pct}%`);
    } else {
      dbg(`GLB loading: ${ev.loaded} bytes`);
    }
  },
  (err) => {
    console.error('[bg3d] GLB load error:', err);
  }
);

// ===== Mouse → Camera =====
function onMouseMove(e) {
  if (locked) return;
  const nx = (e.clientX / window.innerWidth)  * 2 - 1; // -1..1
  const ny = (e.clientY / window.innerHeight) * 2 - 1; // -1..1

  const prevYaw = yaw, prevPitch = pitch;

  yaw   = baseYaw   + nx * YAW_RANGE;
  pitch = basePitch - ny * PITCH_RANGE;
  pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));

  applyCamera();

  // Log occasionally to avoid spam: every ~12th event
  if ((e.timeStamp | 0) % 12 === 0) {
    dbg('mousemove', {
      nx: +nx.toFixed(3), ny: +ny.toFixed(3),
      yaw: +yaw.toFixed(3), pitch: +pitch.toFixed(3),
      changedYaw: +(yaw - prevYaw).toFixed(4),
      changedPitch: +(pitch - prevPitch).toFixed(4),
      camPos: { x:+camera.position.x.toFixed(3), y:+camera.position.y.toFixed(3), z:+camera.position.z.toFixed(3) }
    });
  }
}

function onMouseDown(e) {
  dbg('mousedown', { button: e.button, locked });
  if (locked) return;
  if (e.button !== 0) return; // only left click
  locked = true;
  baseYaw = yaw; basePitch = pitch;

  const p = camera.position;
  const t = target;
  console.log(`
/* Freeze this view in street-bg.js */
camera.position.set(${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)});
camera.lookAt(${t.x.toFixed(4)}, ${t.y.toFixed(4)}, ${t.z.toFixed(4)});
`);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mousedown', onMouseDown);
}

window.addEventListener('mousemove', onMouseMove, { passive: true });
window.addEventListener('mousedown', onMouseDown, { passive: true });
dbg('Mouse listeners attached to window.');

// ===== Render loop =====
let frames = 0;
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if ((frames++ % 180) === 0) {
    dbg('render tick', {
      size: { w: renderer.domElement.width, h: renderer.domElement.height },
      devicePixelRatio: window.devicePixelRatio,
      locked
    });
  }
}
applyCamera();
animate();

// ===== Visibility =====
document.addEventListener('visibilitychange', () => {
  dbg('visibilitychange', document.hidden ? 'hidden' : 'visible');
});
