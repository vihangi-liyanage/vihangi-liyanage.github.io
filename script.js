const loadingScreen = document.querySelector('.loading-screen');
const cursorGlow = document.querySelector('.cursor-glow');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const typingText = document.getElementById('typing-text');
const backToTop = document.querySelector('.back-to-top');

const heroWords = [
  'Computer Science Undergraduate',
  'Full-Stack Developer',
  'AI Enthusiast',
  'Problem Solver'
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
  const currentWord = heroWords[wordIndex];
  typingText.textContent = currentWord.substring(0, charIndex);

  if (!isDeleting && charIndex < currentWord.length) {
    charIndex += 1;
  } else if (isDeleting && charIndex > 0) {
    charIndex -= 1;
  } else {
    isDeleting = !isDeleting;
    if (!isDeleting) {
      wordIndex = (wordIndex + 1) % heroWords.length;
    }
  }

  const speed = isDeleting ? 60 : 90;
  setTimeout(typeLoop, speed);
}

function initReveal() {
  const sections = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = Number(entry.target.dataset.target);
        const duration = 1200;
        const start = performance.now();

        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.floor(progress * target);
          entry.target.textContent = `${value}${target > 3 ? '+' : ''}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.8 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

function initNav() {
  navToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  const sections = document.querySelectorAll('main section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navItems.forEach((item) => item.classList.toggle('active', item.getAttribute('href') === `#${entry.target.id}`));
      });
    },
    { threshold: 0.55 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let mouse = { x: 0, y: 0, active: false };

  const resize = () => {
    width = canvas.width = canvas.clientWidth * window.devicePixelRatio;
    height = canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    particles = Array.from({ length: Math.min(90, Math.floor(canvas.clientWidth / 14)) }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.clientWidth) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.clientHeight) particle.vy *= -1;

      if (mouse.active) {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          particle.x -= dx * 0.002;
          particle.y -= dy * 0.002;
        }
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();

      for (let i = index + 1; i < particles.length; i += 1) {
        const next = particles[i];
        const dx = particle.x - next.x;
        const dy = particle.y - next.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.14 * (1 - dist / 90)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (event) => {
    mouse.active = true;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  resize();
  draw();
}

function initBackToTop() {
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('is-visible', window.scrollY > 600);
  });
}

function initMailtoFallback() {
  const mailLink = document.querySelector('.mailto-link');
  const toast = document.getElementById('copy-toast');

  if (!mailLink || !toast) return;

  mailLink.addEventListener('click', async (event) => {
    const email = mailLink.getAttribute('data-email');
    event.preventDefault();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      }
    } catch (error) {
      console.warn('Clipboard unavailable', error);
    }

    toast.textContent = 'Email copied — open your mail app to send it.';
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2200);
    window.location.href = `mailto:${email}`;
  });
}

function initPortraitAnimation() {
  const portrait = document.getElementById('hero-portrait');
  if (!portrait) return;

  let frame = 0;
  let direction = 1;
  let colorPhase = 0;

  const animate = () => {
    frame += 0.025;
    colorPhase += 0.025;

    const rotate = Math.sin(frame) * 2.4;
    const grayscale = (Math.sin(colorPhase) + 1) / 2;
    const brightness = 0.78 + (1 - grayscale) * 0.18;
    const saturation = 0.9 + (1 - grayscale) * 0.16;

    portrait.style.transform = `rotate(${rotate}deg) scale(${0.99 + Math.sin(frame * 0.6) * 0.008})`;
    portrait.style.filter = `grayscale(${grayscale}) brightness(${brightness}) saturate(${saturation}) contrast(0.97)`;

    if (frame > 3.2 || frame < -0.2) {
      direction *= -1;
    }

    frame += direction * 0.002;
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

window.addEventListener('load', () => {
  setTimeout(() => loadingScreen?.classList.add('is-hidden'), 450);
  typeLoop();
  initReveal();
  initCounters();
  initNav();
  initParticleCanvas();
  initBackToTop();
  initMailtoFallback();
  initPortraitAnimation();
});
