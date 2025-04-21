// script.js
import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initGlobalStarfield();
  setInterval(spawnBurstParticle, 1250);

  // Scroll‑arrows setup
  const down = document.getElementById('downArrow');
  const up   = document.getElementById('upArrow');
  if (down && up) {
    setupScrollArrows();

    // Nav‑link smooth scrolling
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Secret Pong redirect
    document.getElementById('secretBtn').addEventListener('click', () => {
      window.location.href = 'pong.html';
    });
  }

  // Pong page init
  const pongCanvas = document.getElementById('pongCanvas');
  if (pongCanvas) {
    document.documentElement.classList.add('no-scroll');
    initPongGame();
  }
});

// --- Custom Cursor ---
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  document.addEventListener('mousemove', e => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top  = `${e.clientY}px`;
  });
}

// --- Scroll Arrows Logic ---
function setupScrollArrows() {
  const sections = Array.from(document.querySelectorAll('section.section'));
  const up   = document.getElementById('upArrow');
  const down = document.getElementById('downArrow');

  up.addEventListener('click', () => {
    const idx = getCurrentSectionIndex(sections);
    if (idx > 0) sections[idx - 1].scrollIntoView({ behavior: 'smooth' });
  });
  down.addEventListener('click', () => {
    const idx = getCurrentSectionIndex(sections);
    if (idx < sections.length - 1) sections[idx + 1].scrollIntoView({ behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    const idx = getCurrentSectionIndex(sections);
    up.classList.toggle('hidden', idx === 0);
    down.classList.toggle('hidden', idx === sections.length - 1);
  });
}
function getCurrentSectionIndex(secs) {
  const pos = window.scrollY + window.innerHeight / 2;
  return secs.findIndex(sec => pos >= sec.offsetTop && pos < sec.offsetTop + sec.clientHeight);
}

// --- Global Starfield & Burst ---
function initGlobalStarfield() {
  const container = document.getElementById('starCanvasContainer');
  const scene     = new THREE.Scene();
  const camera    = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
  const renderer  = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  window._globalStarfield = { scene, camera, renderer };

  // Stars
  const count = 5000;
  const geom  = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]     = (Math.random()-0.5)*1000;
    pos[i*3 + 1] = (Math.random()-0.5)*1000;
    pos[i*3 + 2] = (Math.random()-0.5)*1000;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color:0xffffff, size:1.2, sizeAttenuation:true });
  const stars = new THREE.Points(geom, mat);
  scene.add(stars);
  camera.position.z = 1;

  let mouseX = 0, mouseY = 0, prevX = window.innerWidth/2, prevY = window.innerHeight/2, swell = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX - window.innerWidth/2;
    mouseY = e.clientY - window.innerHeight/2;
    const dx = Math.abs(e.clientX - prevX), dy = Math.abs(e.clientY - prevY);
    swell  = Math.min(5, swell + (dx+dy)*0.01);
    prevX = e.clientX; prevY = e.clientY;
  });

  function animate() {
    requestAnimationFrame(animate);
    stars.rotation.x += 0.0001;
    stars.rotation.y += 0.0001;
    camera.position.x += ((mouseX*0.0005)-camera.position.x)*0.05;
    camera.position.y += ((-mouseY*0.0005)-camera.position.y)*0.05;
    stars.position.x = -mouseX*0.001;
    stars.position.y = mouseY*0.001;
    mat.size = 1.2 + swell;
    swell *= 0.95;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

function spawnBurstParticle() {
  const gb = window._globalStarfield;
  if (!gb) return;
  const { scene } = gb;
  const geom = new THREE.SphereGeometry(8,16,16);
  const mat  = new THREE.MeshBasicMaterial({ color:0x9b59b6, transparent:true });
  const burst= new THREE.Mesh(geom, mat);
  burst.position.set((Math.random()-0.5)*800, (Math.random()-0.5)*800, (Math.random()-0.5)*800);
  burst.userData.velocity = new THREE.Vector3((Math.random()-0.5)*6, (Math.random()-0.5)*6, (Math.random()-0.5)*6);
  burst.userData.start = performance.now();
  scene.add(burst);

  function update() {
    const t = performance.now() - burst.userData.start;
    burst.position.add(burst.userData.velocity);
    burst.material.opacity = Math.max(0, 1 - t/2000);
    if (t < 2000) requestAnimationFrame(update);
    else {
      scene.remove(burst);
      burst.geometry.dispose();
      burst.material.dispose();
    }
  }
  update();
}

// --- Pong Game ---
function initPongGame() {
  const canvas = document.getElementById('pongCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const pw = 10, ph = 100, br = 8, bs = 5;
  let ps = 0, ai = 0, paused = false, waiting = false;
  const player = { x:10, y:canvas.height/2-ph/2, width:pw, height:ph };
  const enemy =  { x:canvas.width-pw-10, y:canvas.height/2-ph/2, width:pw, height:ph };
  const ball =   { x:canvas.width/2, y:canvas.height/2, radius:br, speed:bs, dx:bs, dy:3 };
  const keys = {};
  document.addEventListener('keydown', e=>keys[e.key]=true);
  document.addEventListener('keyup',   e=>keys[e.key]=false);

  function resetBall() {
    ball.x = canvas.width/2; ball.y = canvas.height/2;
    ball.dx = (Math.random()>0.5?1:-1)*ball.speed;
    ball.dy = (Math.random()*4-2);
  }
  resetBall();

  function update() {
    if(paused||waiting) return;
    if(keys['ArrowUp'])    player.y -=7;
    if(keys['ArrowDown'])  player.y +=7;
    player.y = Math.max(0, Math.min(canvas.height-ph, player.y));

    let target = ball.y - enemy.height/2;
    enemy.y += (target>enemy.y?2:-2);
    enemy.y = Math.max(0, Math.min(canvas.height-ph, enemy.y));

    ball.x += ball.dx; ball.y += ball.dy;
    if(ball.y-br<0||ball.y+br>canvas.height) ball.dy = -ball.dy;

    // Player collision
    if(ball.x-br<player.x+pw && ball.y>player.y && ball.y<player.y+ph){
      let cp = (ball.y-(player.y+ph/2))/(ph/2);
      let ang = cp*(Math.PI/4);
      ball.dx = Math.abs(ball.speed*Math.cos(ang));
      ball.dy = ball.speed*Math.sin(ang);
      ball.x = player.x+pw+br;
    }
    // AI collision
    if(ball.x+br>enemy.x && ball.y>enemy.y && ball.y<enemy.y+ph){
      let cp = (ball.y-(enemy.y+ph/2))/(ph/2);
      let ang = cp*(Math.PI/4);
      ball.dx = -ball.speed*Math.cos(ang);
      ball.dy = ball.speed*Math.sin(ang);
      ball.x = enemy.x-br;
    }

    // Score
    if(ball.x-br<0){ ai++; waiting=true; setTimeout(()=>{ resetBall(); waiting=false; },2000); }
    else if(ball.x+br>canvas.width){ ps++; waiting=true; setTimeout(()=>{ resetBall(); waiting=false; },2000); }
  }

  function draw() {
    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#9b59b6';
    ctx.fillRect(player.x,player.y,pw,ph);
    ctx.fillRect(enemy.x,enemy.y,pw,ph);
    ctx.beginPath(); ctx.arc(ball.x,ball.y,br,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); ctx.closePath();
    ctx.font="bold 36px Orbitron, sans-serif"; ctx.textAlign="center"; ctx.fillStyle="#9b59b6"; ctx.shadowColor="#9b59b6"; ctx.shadowBlur=20;
    ctx.fillText(`${ps}   :   ${ai}`,canvas.width/2,50); ctx.shadowBlur=0;
    if(paused){ ctx.font="bold 48px Orbitron, sans-serif"; ctx.fillStyle="rgba(255,255,255,0.7)"; ctx.fillText("PAUSED",canvas.width/2,canvas.height/2); }
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }
  loop();

  document.getElementById('resetScore').addEventListener('click', ()=>{ ps=0; ai=0; resetBall(); });
  document.getElementById('pauseGame').addEventListener('click', ()=>{ paused=!paused; document.getElementById('pauseGame').textContent = paused?"Resume":"Pause"; });
}
