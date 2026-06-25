// ═══════════════════════════════════════════
// PORTFOLIO — main.js
// Handles: project fetch, contact form, nav, animations
// ═══════════════════════════════════════════

const API_BASE = '/api';

// ── NAV ─────────────────────────────────────
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Active nav link highlight
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
  });
});

// ── REVEAL ANIMATIONS ────────────────────────
const revealElements = document.querySelectorAll('.section, .about-grid, .skills-grid, .projects-grid, .contact-grid');
revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── LOAD PROJECTS ─────────────────────────────
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const data = await res.json();

    if (!data.success || !data.data.length) {
      grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1">No projects found.</p>';
      return;
    }

    grid.innerHTML = data.data.map(project => createProjectCard(project)).join('');

    // Stagger card animations
    grid.querySelectorAll('.project-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.3s ease, box-shadow 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 100);
    });

  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">
        <p style="font-size:1.5rem;margin-bottom:0.5rem">⚠️</p>
        <p>Could not load projects. Make sure the server is running.</p>
        <code style="font-size:0.8rem;opacity:0.6">${err.message}</code>
      </div>`;
  }
}

function createProjectCard(project) {
  const stackHTML = project.techStack.map(t => `<span class="stack-tag">${t}</span>`).join('');
  const linksHTML = [
    project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="project-link">GitHub ↗</a>` : '',
    project.liveUrl   ? `<a href="${project.liveUrl}" target="_blank" class="project-link">Live ↗</a>` : ''
  ].join('');

  return `
    <div class="project-card${project.featured ? ' featured' : ''}">
      ${project.featured ? '<span class="project-badge">Featured</span>' : ''}
      <h3 class="project-title">${project.title}</h3>
      <p class="project-desc">${project.description}</p>
      <div class="project-stack">${stackHTML}</div>
      <div class="project-links">${linksHTML}</div>
    </div>`;
}

// ── CONTACT FORM ───────────────────────────────
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearStatus();

  const data = {
    name:    form.name.value.trim(),
    email:   form.email.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim()
  };

  // Client-side validation
  if (!data.name || !data.email || !data.subject || !data.message) {
    showStatus('Please fill in all fields.', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    showStatus('Please enter a valid email address.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.success) {
      showStatus('✓ Message sent! I\'ll get back to you soon.', 'success');
      form.reset();
    } else {
      showStatus(result.message || 'Something went wrong. Please try again.', 'error');
    }
  } catch (err) {
    showStatus('Could not connect to server. Please try again later.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

function showStatus(msg, type) {
  statusDiv.textContent = msg;
  statusDiv.className = `form-status ${type}`;
}
function clearStatus() {
  statusDiv.textContent = '';
  statusDiv.className = 'form-status';
}

// ── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadProjects);
