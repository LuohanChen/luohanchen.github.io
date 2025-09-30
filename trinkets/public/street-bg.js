// street-bg.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader }   from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader }   from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js';
// If your GLB was Draco-compressed in Blender, uncomment:
// import { DRACOLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';

const canvas   = document.getElementById('bg3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0, 1.6, 4); // tweak for your scene scale

// Resize handling
function resize(){
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
resize();
window.addEventListener('resize', resize);

// Soft lights in case your GLB has no lights (PBR prefers environment)
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemi.position.set(0, 1, 0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(4, 10, 8);
scene.add(dir);

// Optional: environment HDR (uncomment and set path if you have one)
// new RGBELoader().load('/assets/studio.hdr', (hdr) => {
//   hdr.mapping = THREE.EquirectangularReflectionMapping;
//   scene.environment = hdr;
//   // scene.background = hdr; // if you prefer HDR as background (opaque), leave canvas alpha:false
// });

// Load your GLB
const gltfLoader = new GLTFLoader();
// If Draco compressed:
// const draco = new DRACOLoader();
// draco.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
// gltfLoader.setDRACOLoader(draco);

gltfLoader.load(
  '/assets/street.glb',           // <-- put your path here
  (gltf) => {
    const root = gltf.scene;
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = false;
        // Ensure correct colorspace on any baked textures (usually sRGB)
        if (o.material && o.material.map) {
          o.material.map.colorSpace = THREE.SRGBColorSpace;
          o.material.needsUpdate = true;
        }
      }
    });

    // Auto-fit scene to camera nicely
    fitToView(root, camera);
    scene.add(root);
  },
  undefined,
  (err) => console.error('GLB load error:', err)
);

// Fit model into view
function fitToView(object3D, cam){
  const box = new THREE.Box3().setFromObject(object3D);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // frame the largest dimension
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = cam.fov * (Math.PI / 180);
  let dist = (maxDim / 2) / Math.tan(fov / 2);

  // pad out a bit
  dist *= 1.2;

  const dir = new THREE.Vector3(0, 0, 1);
  cam.position.copy(center.clone().add(dir.multiplyScalar(dist)));
  cam.near = Math.max(0.1, dist - maxDim * 2);
  cam.far  = dist + maxDim * 2.5;
  cam.updateProjectionMatrix();
  cam.lookAt(center);
}

// Subtle idle motion so it feels alive but not distracting
let t = 0;
function animate(){
  requestAnimationFrame(animate);
  t += 0.003;
  camera.position.x += Math.sin(t) * 0.0008;  // tiny drift
  camera.position.y += Math.cos(t*0.7) * 0.0006;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
animate();

// Pause when tab not visible (saves battery)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) renderer.setAnimationLoop(null);
  else animate();
});