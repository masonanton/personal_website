// script.js
import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  initGlobalStarfield();
  // Spawn a "shooting star" burst every 2 seconds
  setInterval(spawnBurstParticle, 2000);
});

// --- Global Starfield (Black Stars) ---
function initGlobalStarfield() {
  const container = document.getElementById('starCanvasContainer');
  const scene = new THREE.Scene();
  
  // Camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 1000; // Moved back slightly for parallax depth

  // Renderer (Alpha true allows CSS background to show through)
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  
  // Store globally if needed for debugging
  window._globalStarfield = { scene, camera, renderer };

  // --- Create Stars ---
  const count = 3000;
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 2000;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 2000;
  }
  
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  
  // Material: Black color (0x000000) for Brutalist look
  const mat = new THREE.PointsMaterial({ 
    color: 0x000000, 
    size: 2.5, 
    sizeAttenuation: true 
  });
  
  const stars = new THREE.Points(geom, mat);
  scene.add(stars);

  // --- Interaction ---
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    
    // Slow rotation
    stars.rotation.x += 0.0002;
    stars.rotation.y += 0.0002;
    
    // Parallax based on mouse
    camera.position.x += ((mouseX * 0.1) - camera.position.x) * 0.05;
    camera.position.y += ((-mouseY * 0.1) - camera.position.y) * 0.05;
    
    renderer.render(scene, camera);
  }
  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

// --- Burst Particle (Shooting Star Logic) ---
function spawnBurstParticle() {
  const gb = window._globalStarfield;
  if (!gb) return;
  const { scene } = gb;
  
  // Create a small black sphere
  const geom = new THREE.SphereGeometry(6, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true });
  const burst = new THREE.Mesh(geom, mat);
  
  // Random position in view
  burst.position.set(
    (Math.random() - 0.5) * 1000, 
    (Math.random() - 0.5) * 1000, 
    (Math.random() - 0.5) * 500
  );
  
  // Fast velocity
  burst.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 15, 
    (Math.random() - 0.5) * 15, 
    (Math.random() - 0.5) * 15
  );
  burst.userData.start = performance.now();
  
  scene.add(burst);

  function update() {
    const t = performance.now() - burst.userData.start;
    burst.position.add(burst.userData.velocity);
    
    // Fade out over 1.5 seconds
    burst.material.opacity = Math.max(0, 1 - t / 1500);
    
    if (t < 1500) {
      requestAnimationFrame(update);
    } else {
      scene.remove(burst);
      burst.geometry.dispose();
      burst.material.dispose();
    }
  }
  update();
}