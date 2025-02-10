document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetID = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetID);
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - 80, // Adjust for fixed header height
            behavior: 'smooth'
          });
        }
      });
    });
  
    // Contact form submission (demo handling)
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      console.log('Contact Form Data:', data);
      alert('Thank you for reaching out! (This is a demo form.)');
      contactForm.reset();
    });
  
    // Canvas Background Animation: Starfield
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
  
    // Set canvas dimensions to match the window size
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
  
    // Update canvas dimensions on window resize
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  
    // Create stars
    const numStars = 150;
    const stars = [];
  
    function Star() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 1.5;
      this.speed = Math.random() * 0.5 + 0.2;
      this.alpha = Math.random();
    }
  
    Star.prototype.draw = function () {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255,' + this.alpha + ')';
      ctx.fill();
      ctx.restore();
    };
  
    Star.prototype.update = function () {
      this.y += this.speed;
      if (this.y > height) {
        this.y = 0;
        this.x = Math.random() * width;
      }
      this.draw();
    };
  
    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }
  
    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, width, height);
      stars.forEach(star => star.update());
      requestAnimationFrame(animate);
    }
    animate();
  });
  