/* ============ Сутки.НН — slider.js ============
   Общий слайдер фото: стрелки, точки, счётчик, свайп, автолистание. */

const AUTO_SLIDE_MS = 5000;

function mediaHTML(f) {
  const badges = f.badges.map(b => `<span class="badge ${b === 'Хит' ? 'hot' : ''}">${b}</span>`).join('');
  const slides = f.photos.map((p, i) => `<img src="${p}" alt="${f.title} — фото ${i + 1}" loading="lazy" data-i="${i}">`).join('');
  const dots = f.photos.map((_, i) => `<button class="s-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Фото ${i + 1}"></button>`).join('');
  return `
  <div class="card-media slider" data-slider>
    <div class="s-track">${slides}</div>
    <button class="s-arrow s-prev" data-dir="-1" aria-label="Предыдущее фото">‹</button>
    <button class="s-arrow s-next" data-dir="1" aria-label="Следующее фото">›</button>
    <div class="card-badges">${badges}</div>
    <div class="s-dots">${dots}</div>
    <span class="s-count" data-count>1 / ${f.photos.length}</span>
  </div>`;
}

function initSlider(slider) {
  const track = slider.querySelector('.s-track');
  const n = track.children.length;
  if (n < 2) { slider.querySelectorAll('.s-arrow').forEach(a => a.style.display = 'none'); return; }
  let i = 0, timer = null;

  const go = k => {
    i = (k + n) % n;
    track.style.transform = `translateX(-${i * 100}%)`;
    slider.querySelectorAll('.s-dot').forEach(d => d.classList.toggle('active', +d.dataset.i === i));
    const c = slider.querySelector('[data-count]');
    if (c) c.textContent = `${i + 1} / ${n}`;
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const auto = () => { stop(); timer = setInterval(() => go(i + 1), AUTO_SLIDE_MS); };

  slider.addEventListener('click', e => {
    const arr = e.target.closest('.s-arrow');
    if (arr) { go(i + +arr.dataset.dir); stop(); auto(); return; }
    const dot = e.target.closest('.s-dot');
    if (dot) { go(+dot.dataset.i); stop(); auto(); }
  });

  /* свайп пальцем */
  let x0 = null;
  track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  track.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null; auto();
  }, { passive: true });

  /* перетаскивание мышью */
  track.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') x0 = e.clientX; });
  track.addEventListener('pointerup', e => {
    if (x0 === null || e.pointerType !== 'mouse') return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null; stop(); auto();
  });

  auto();
}
