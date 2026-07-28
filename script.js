// Scroll-triggered reveal for elements marked .reveal
const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealTargets.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

// Contact form -> POST to backend /leads endpoint
const API_BASE = window.FOUNDRY_API_BASE || 'http://localhost:8000';
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const payload = {
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    if (!payload.name || !payload.company || !payload.email) {
      status.textContent = 'Please fill in name, company, and email.';
      status.dataset.state = 'error';
      return;
    }

    submitBtn.disabled = true;
    status.textContent = 'Sending…';
    status.dataset.state = '';

    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      status.textContent = "Thanks — we'll follow up shortly to schedule a call.";
      status.dataset.state = 'ok';
      form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong sending that — email us directly instead.';
      status.dataset.state = 'error';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
