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
    updateIndicators(currentSlide);
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
    updateIndicators(currentSlide);
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
  setInterval(spawnBurstParticle, 1250);

  /* --- New Feature: Carousel Slide Indicators --- */
  const carouselIndicatorsContainer = document.createElement('div');
  carouselIndicatorsContainer.classList.add('carousel-indicators');
  for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement('span');
    indicator.classList.add('indicator');
    if (i === currentSlide) {
      indicator.classList.add('active');
    }
    indicator.dataset.slide = i;
    indicator.addEventListener('click', () => {
      scrollToSlide(i);
    });
    carouselIndicatorsContainer.appendChild(indicator);
  }
  document.body.appendChild(carouselIndicatorsContainer);

  function updateIndicators(activeIndex) {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((ind, idx) => {
      if(idx === activeIndex) {
        ind.classList.add('active');
      } else {
        ind.classList.remove('active');
      }
    });
  }

  /* --- New Feature: Ripple Effect on Click --- */
  document.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 600); // Duration should match the animation duration in CSS
  });

  /* --- Initialize Pong Game --- */
  initPongGame();
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

/* --- New Feature: Pong Game --- */
function initPongGame() {
  const canvas = document.getElementById('pongCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Game settings
  const paddleWidth = 10;
  const paddleHeight = 100;
  const ballRadius = 8;
  const ballSpeed = 5;

  // Scores
  let playerScore = 0;
  let aiScore = 0;

  // Game control flags
  let paused = false;
  let waiting = false;

  // Player's paddle (left)
  let playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight
  };

  // AI paddle (right)
  let aiPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight
  };

  // Ball
  let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: ballSpeed,
    dx: ballSpeed,
    dy: 3
  };

  // Key controls
  let keys = {};
  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });
  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  // Track player's previous paddle position for movement effect
  let prevPlayerPaddleY = playerPaddle.y;

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Randomize starting direction
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() * 4 - 2);
  }

  function update() {
    // If paused or waiting, skip updating game state
    if (paused || waiting) return;

    // Update player's paddle and record movement
    let oldPlayerY = playerPaddle.y;
    if (keys['ArrowUp']) {
      playerPaddle.y -= 7;
    }
    if (keys['ArrowDown']) {
      playerPaddle.y += 7;
    }
    // Keep player paddle in bounds
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + playerPaddle.height > canvas.height)
      playerPaddle.y = canvas.height - playerPaddle.height;
    let paddleMovement = playerPaddle.y - oldPlayerY;
    prevPlayerPaddleY = playerPaddle.y;

    // Simple AI for right paddle with reduced speed for easier gameplay
    let targetY = ball.y - aiPaddle.height / 2;
    let aiSpeed = 2; // Reduced speed
    if (targetY > aiPaddle.y) {
      aiPaddle.y += Math.min(aiSpeed, targetY - aiPaddle.y);
    } else {
      aiPaddle.y -= Math.min(aiSpeed, aiPaddle.y - targetY);
    }
    if (aiPaddle.y < 0) aiPaddle.y = 0;
    if (aiPaddle.y + aiPaddle.height > canvas.height)
      aiPaddle.y = canvas.height - aiPaddle.height;

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.dy = -ball.dy;
    }

    // Collision with player's paddle
    if (
      ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
      ball.x - ball.radius > playerPaddle.x &&
      ball.y > playerPaddle.y &&
      ball.y < playerPaddle.y + playerPaddle.height
    ) {
      // Calculate collision point (normalized)
      let collidePoint = ball.y - (playerPaddle.y + playerPaddle.height / 2);
      collidePoint = collidePoint / (playerPaddle.height / 2);
      // Calculate reflection angle (max 45°)
      let angleRad = collidePoint * (Math.PI / 4);
      // Set ball velocity and add paddle movement effect
      ball.dx = ball.speed * Math.cos(angleRad);
      ball.dy = ball.speed * Math.sin(angleRad) + paddleMovement * 0.3;
      if (ball.dx < 0) ball.dx = -ball.dx;
      ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
    }

    // Collision with AI paddle
    if (
      ball.x + ball.radius > aiPaddle.x &&
      ball.x + ball.radius < aiPaddle.x + aiPaddle.width &&
      ball.y > aiPaddle.y &&
      ball.y < aiPaddle.y + aiPaddle.height
    ) {
      let collidePoint = ball.y - (aiPaddle.y + aiPaddle.height / 2);
      collidePoint = collidePoint / (aiPaddle.height / 2);
      let angleRad = collidePoint * (Math.PI / 4);
      ball.dx = -ball.speed * Math.cos(angleRad);
      ball.dy = ball.speed * Math.sin(angleRad);
      ball.x = aiPaddle.x - ball.radius;
    }

    // Scoring and waiting period
    if (ball.x - ball.radius < 0) {
      // AI scores
      aiScore++;
      waiting = true;
      setTimeout(() => {
        resetBall();
        waiting = false;
      }, 2000); // 2 second delay
    } else if (ball.x + ball.radius > canvas.width) {
      // Player scores
      playerScore++;
      waiting = true;
      setTimeout(() => {
        resetBall();
        waiting = false;
      }, 2000); // 2 second delay
    }
  }

  function draw() {
    // Clear the canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player paddle
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);

    // Draw AI paddle
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Draw futuristic scoreboard
    ctx.font = "bold 36px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#9b59b6";
    ctx.shadowColor = "#9b59b6";
    ctx.shadowBlur = 20;
    ctx.fillText(playerScore + "   :   " + aiScore, canvas.width / 2, 50);
    ctx.shadowBlur = 0;

    // If paused, overlay a "PAUSED" message
    if (paused) {
      ctx.font = "bold 48px Orbitron, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // Reset Score Button functionality
  const resetScoreButton = document.getElementById('resetScore');
  if (resetScoreButton) {
    resetScoreButton.addEventListener('click', () => {
      playerScore = 0;
      aiScore = 0;
      resetBall();
    });
  }

  // Pause/Resume Button functionality
  const pauseButton = document.getElementById('pauseGame');
  if (pauseButton) {
    pauseButton.addEventListener('click', () => {
      paused = !paused;
      pauseButton.textContent = paused ? "Resume" : "Pause";
    });
  }

  resetBall();
  gameLoop();
}
