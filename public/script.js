document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------
       Smooth Scrolling
    ------------------------- */
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetID = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetID);
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - 80, // Adjust for fixed header
            behavior: 'smooth'
          });
        }
      });
    });
  
    /* -------------------------
       Dynamic Navigation Highlighting
    ------------------------- */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const observerOptions = {
      threshold: 0.6
    };
  
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').substring(1) === entry.target.id);
          });
        }
      });
    }, observerOptions);
  
    sections.forEach(section => observer.observe(section));
  
    /* -------------------------
       Scroll To Top Button
    ------------------------- */
    const scrollBtn = document.getElementById('scrollToTop');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollBtn.style.display = 'block';
      } else {
        scrollBtn.style.display = 'none';
      }
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  
    /* -------------------------
       Resume Tabs Functionality
    ------------------------- */
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
  
    tabLinks.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active classes
        tabLinks.forEach(link => link.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        // Activate clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  
    /* -------------------------
       Contact Form Handling
    ------------------------- */
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach((value, key) => { data[key] = value; });
      console.log('Contact Form Data:', data);
      alert('Thank you for reaching out! (This is a demo form.)');
      contactForm.reset();
    });
  
    /* -------------------------
       Initialize Hero Three.js Simulation
       (A cosmic particle starfield)
    ------------------------- */
    initHeroThreeJS();
  
    /* -------------------------
       Initialize Fusion Reactor Simulation (Three.js)
    ------------------------- */
    initFusionSimulation();
  
    /* -------------------------
       Initialize Particle Playground (2D Canvas)
    ------------------------- */
    initParticlePlayground();
  });
  
  /* =====================================================
     Hero Three.js Simulation – Cosmic Starfield
  ===================================================== */
  function initHeroThreeJS() {
    const container = document.getElementById('heroCanvasContainer');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
  
    // Create a particle geometry
    const particlesCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
  
    camera.position.z = 50;
  
    function animate() {
      requestAnimationFrame(animate);
      // Slowly rotate the particle field
      particles.rotation.y += 0.0005;
      renderer.render(scene, camera);
    }
    animate();
  
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }
  
  /* =====================================================
     Fusion Reactor Simulation – Three.js (Rotating Torus)
  ===================================================== */
  function initFusionSimulation() {
    const container = document.getElementById('fusionSimulation');
    if (!container) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
  
    // Create a torus geometry to simulate a fusion reactor core
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff2200,
      metalness: 0.7,
      roughness: 0.3
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
  
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffaa33, 1);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);
  
    camera.position.z = 30;
  
    function animate() {
      requestAnimationFrame(animate);
      torus.rotation.x += 0.005;
      torus.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();
  
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }
  
  /* =====================================================
     Particle Playground – 2D Canvas Interactive Simulation
  ===================================================== */
  function initParticlePlayground() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  
    window.addEventListener('resize', () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    });
    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
  
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }
      update() {
        // Simple motion with slight attraction to mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.x += dx * 0.01;
          this.y += dy * 0.01;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        this.draw();
      }
    }
  
    const particlesArray = [];
    for (let i = 0; i < 150; i++) {
      particlesArray.push(new Particle());
    }
  
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(particle => particle.update());
      requestAnimationFrame(animate);
    }
    animate();
  }
  