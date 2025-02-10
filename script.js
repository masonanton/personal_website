// Import three.js as an ES module from unpkg
import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  /* --- Carousel Navigation --- */
  const carousel = document.querySelector('.carousel');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevArrow = document.getElementById('prevArrow');
  const nextArrow = document.getElementById('nextArrow');
  let currentSlide = 0;
  const totalSlides = slides.length;

  function scrollToSlide(index) {
    const slideWidth = window.innerWidth;
    carousel.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth'
    });
    currentSlide = index;
  }

  prevArrow.addEventListener('click', () => {
    let nextIndex = currentSlide - 1;
    if (nextIndex < 0) nextIndex = totalSlides - 1;
    scrollToSlide(nextIndex);
  });

  nextArrow.addEventListener('click', () => {
    let nextIndex = currentSlide + 1;
    if (nextIndex >= totalSlides) nextIndex = 0;
    scrollToSlide(nextIndex);
  });

  carousel.addEventListener('scroll', () => {
    const index = Math.round(carousel.scrollLeft / window.innerWidth);
    currentSlide = index;
  });

  /* --- Resume Tabs Functionality --- */
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  tabLinks.forEach(tab => {
    tab.addEventListener('click', () => {
      tabLinks.forEach(link => link.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  /* --- Contact Form Handling (Demo) --- */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = {};
    formData.forEach((value, key) => { data[key] = value; });
    console.log('Contact Form Data:', data);
    alert('Thank you for your message.');
    contactForm.reset();
  });

  /* --- Custom Cursor (Crescent Moon) --- */
  const customCursor = document.getElementById('customCursor');
  document.addEventListener('mousemove', (e) => {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
  });

  /* --- Initialize Global Starfield --- */
  initGlobalStarfield();

  /* --- Start Burst Particle Spawner (every 2 seconds) --- */
  setInterval(spawnBurstParticle, 2000);
});

/* --- Global Starfield with Interactive Parallax, Swell, and Repulsion --- */
function initGlobalStarfield() {
  const container = document.getElementById('starCanvasContainer');
  const width = window.innerWidth;
  const height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Store globally for burst particles
  window._globalStarfield = { scene, camera, renderer };

  // Create the main starfield
  const starsCount = 5000;
  const starsGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const baseSize = 1.2;
  let swellFactor = 0;
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: baseSize,
    sizeAttenuation: true
  });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  camera.position.z = 1;

  let mouseX = 0, mouseY = 0;
  let prevMouseX = window.innerWidth / 2, prevMouseY = window.innerHeight / 2;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
    const dx = Math.abs(e.clientX - prevMouseX);
    const dy = Math.abs(e.clientY - prevMouseY);
    swellFactor = Math.min(5, swellFactor + (dx + dy) * 0.01);
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  function animate() {
    requestAnimationFrame(animate);
    // Slowly rotate the starfield
    starField.rotation.x += 0.0001;
    starField.rotation.y += 0.0001;
    // Parallax effect: adjust camera position
    camera.position.x += ((mouseX * 0.0005) - camera.position.x) * 0.05;
    camera.position.y += ((-mouseY * 0.0005) - camera.position.y) * 0.05;
    // Repulsion effect: shift the starfield further away from the mouse pointer
    starField.position.x = -mouseX * 0.001;
    starField.position.y = mouseY * 0.001;
    // Swell effect: update star size
    starsMaterial.size = baseSize + swellFactor;
    swellFactor *= 0.95;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });
}

/* --- Burst Particle Spawner --- */
function spawnBurstParticle() {
  if (!window._globalStarfield) return;
  const { scene } = window._globalStarfield;

  // Create a larger burst particle (a sphere) with purple color
  const geometry = new THREE.SphereGeometry(8, 16, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0x9b59b6,
    transparent: true,
    opacity: 1
  });
  const burst = new THREE.Mesh(geometry, material);
  // Spawn at a random position within a defined range
  burst.position.set(
    (Math.random() - 0.5) * 800,
    (Math.random() - 0.5) * 800,
    (Math.random() - 0.5) * 800
  );
  // Give it a random velocity vector
  burst.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6
  );
  // Set lifetime in milliseconds
  burst.userData.lifetime = 2000;
  burst.userData.age = 0;
  scene.add(burst);

  const startTime = performance.now();
  function updateBurst() {
    const now = performance.now();
    const delta = now - startTime;
    burst.userData.age = delta;
    // Move burst particle according to its velocity
    burst.position.add(burst.userData.velocity);
    // Fade out over its lifetime
    const t = delta / burst.userData.lifetime;
    burst.material.opacity = Math.max(0, 1 - t);
    if (delta < burst.userData.lifetime) {
      requestAnimationFrame(updateBurst);
    } else {
      scene.remove(burst);
      burst.geometry.dispose();
      burst.material.dispose();
    }
  }
  updateBurst();
}
