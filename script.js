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

// Selected-builds carousel
const track = document.getElementById('carousel-track');
if (track) {
  const cards = Array.from(track.querySelectorAll('.build'));
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  const dots = cards.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to build ${i + 1} of ${cards.length}`);
    dot.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsContainer.appendChild(dot);
    return dot;
  });
  if (dots.length) dots[0].classList.add('is-active');

  const setActive = (index) => {
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - trackCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActive(closest);
    }, 100);
  });

  const scrollByCard = (dir) => {
    const card = cards[0];
    const gap = parseFloat(getComputedStyle(track).gap || '0');
    track.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: 'smooth' });
  };
  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));
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
