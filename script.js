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

  // Update currentSlide on manual scroll (if the user swipes)
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

  /* --- Initialize Hero Three.js Starfield --- */
  initHeroThreeJS();
});

/* --- Three.js Starfield with Interactive Parallax --- */
function initHeroThreeJS() {
  const container = document.getElementById('heroCanvasContainer');
  // Use full viewport dimensions
  const width = window.innerWidth;
  const height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Create a starfield
  const starsCount = 5000;
  const starsGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: true
  });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  camera.position.z = 1;

  // Interactive parallax variables
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
  });

  function animate() {
    requestAnimationFrame(animate);
    // Slowly rotate the starfield
    starField.rotation.x += 0.0001;
    starField.rotation.y += 0.0001;
    // Apply a subtle parallax effect based on mouse movement
    camera.position.x += ((mouseX * 0.0005) - camera.position.x) * 0.05;
    camera.position.y += ((-mouseY * 0.0005) - camera.position.y) * 0.05;
    renderer.render(scene, camera);
  }
  animate();

  // Update renderer and camera on window resize
  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });
}
