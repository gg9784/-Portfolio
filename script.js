/* ===========================
   GOVIND GEHLOT – PORTFOLIO
   script.js
   =========================== */

'use strict';

// ===== RESUME UPLOAD & PERSISTENT DOWNLOAD =====
(function initResumeUpload() {
  const fileInput        = document.getElementById('resume-file-input');
  const uploadBtn        = document.getElementById('upload-resume-btn');
  const mobileUploadBtn  = document.getElementById('mobile-upload-btn');

  // All download anchors
  const downloadBtns = () => [
    document.getElementById('nav-download-btn'),
    document.getElementById('hero-download-btn'),
    document.getElementById('mobile-download-btn'),
  ].filter(Boolean);

  // ── Toast helper ──
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.upload-toast');
    if (existing) existing.remove();

    const icon = type === 'success'
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

    const toast = document.createElement('div');
    toast.className = `upload-toast ${type}`;
    toast.innerHTML = `${icon}<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3800);
  }

  // ── Apply a blob URL to all download anchors ──
  function applyResumeUrl(url, filename) {
    downloadBtns().forEach(btn => {
      btn.href = url;
      btn.setAttribute('download', filename || 'Govind_Gehlot_Resume.pdf');
    });
    if (uploadBtn) {
      uploadBtn.classList.add('has-resume');
      uploadBtn.title = 'Resume uploaded ✓ – click to replace';
    }
  }

  // ── Load from localStorage on page load ──
  try {
    const stored = localStorage.getItem('portfolio_resume_b64');
    const fname  = localStorage.getItem('portfolio_resume_name') || 'Govind_Gehlot_Resume.pdf';
    if (stored) {
      const byteString = atob(stored);
      const bytes = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      applyResumeUrl(blobUrl, fname);
    }
  } catch (e) {
    // localStorage unavailable or quota exceeded — silently skip
  }

  // ── Handle file selection ──
  function handleFile(file) {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10 MB guard
      showToast('File too large. Please use a PDF under 10 MB.', 'error');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];

      // Create a fresh blob URL for immediate use
      const byteString = atob(base64);
      const bytes = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      applyResumeUrl(blobUrl, file.name);

      // Persist to localStorage
      try {
        localStorage.setItem('portfolio_resume_b64', base64);
        localStorage.setItem('portfolio_resume_name', file.name);
      } catch (storageErr) {
        // Quota exceeded — still works this session, just won't persist
        console.warn('Resume could not be saved to localStorage (quota exceeded).');
      }

      showToast(`✓ Resume "${file.name}" uploaded successfully!`, 'success');
    };

    reader.onerror = () => showToast('Failed to read file. Please try again.', 'error');
    reader.readAsDataURL(file);
  }

  // ── Wire up buttons ──
  [uploadBtn, mobileUploadBtn].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput && fileInput.click();
    });
  });

  fileInput && fileInput.addEventListener('change', () => {
    handleFile(fileInput.files[0]);
    fileInput.value = ''; // reset so same file can be re-selected
  });
})();


// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const onScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  highlightNav();
};
window.addEventListener('scroll', onScroll, { passive: true });

// ===== HAMBURGER / MOBILE MENU =====
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

function highlightNav() {
  let currentId = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) currentId = sec.id;
  });
  navItems.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
  });
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${(i % 4) * 60}ms`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== HERO CANVAS (PARTICLE GRID) =====
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, particles;
  const PARTICLE_COUNT = 60;
  const MAX_DIST = 130;

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.18 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,102,241,0.5)';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

// ===== TYPING LOOP IN TERMINAL =====
(function typingLoop() {
  const el = document.querySelector('.term-text');
  if (!el) return;
  const commands = [
    'node server.js',
    'docker compose up -d',
    'git push origin main',
    'npm run dev',
    'kafka-topics --list',
  ];
  let cmdIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const cmd = commands[cmdIdx];
    if (!deleting) {
      el.textContent = cmd.slice(0, ++charIdx);
      if (charIdx === cmd.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      el.textContent = cmd.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        cmdIdx = (cmdIdx + 1) % commands.length;
        setTimeout(type, 300);
        return;
      }
    }
    setTimeout(type, deleting ? 45 : 80);
  }
  setTimeout(type, 1200);
})();

// ===== SMOOTH ANCHOR SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});
