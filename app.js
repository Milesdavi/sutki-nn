/* ============ Сутки.НН — app.js ============
   Данные квартир (FLATS) — в data.js,
   слайдер фото (mediaHTML, initSlider) — в slider.js */

const fmt = n => n.toLocaleString('ru-RU');
const $ = s => document.querySelector(s);

/* ---------- Рендер карточек ---------- */
function cardHTML(f) {
  const feats = f.feats.slice(0, 4).map(x => `<span class="feat">${x}</span>`).join('');
  return `
  <article class="card reveal" data-id="${f.id}">
    ${mediaHTML(f)}
    <div class="card-body">
      <a class="card-link" href="flat.html?id=${f.id}"><h3 class="card-title">${f.title}</h3></a>
      <p class="card-loc">📍 ${f.loc}</p>
      <div class="card-feats">${feats}</div>
      <div class="card-foot">
        <div class="price"><b>${fmt(f.price)} ₽</b> <span>/ сутки</span></div>
        <div class="rating">★ ${f.rating.toFixed(1)} <small style="color:var(--muted)">(${f.reviews})</small></div>
      </div>
      <a class="btn btn-ghost btn-sm" href="flat.html?id=${f.id}">Подробнее и бронь →</a>
    </div>
  </article>`;
}

function renderCards(filter = 'all') {
  const list = FLATS.filter(f => filter === 'all' || f.tags.includes(filter) || String(f.rooms) === filter);
  $('#cards').innerHTML = list.map(cardHTML).join('');
  $('#empty').hidden = list.length > 0;
  document.querySelectorAll('[data-slider]').forEach(initSlider);
  observeReveals();
}

/* ---------- Фильтры ---------- */
$('#filters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderCards(chip.dataset.filter);
});

/* ---------- Модальное окно ---------- */
const modal = $('#modal');
let currentFlat = null;

function openModal(id) {
  const f = FLATS.find(x => x.id === id);
  if (!f) return;
  currentFlat = f;
  const photos = f.photos && f.photos.length ? f.photos : [f.img];
  $('#mImg').src = photos[0];
  $('#mImg').alt = f.title;
  $('#mThumbs').innerHTML = photos.map((p, i) =>
    `<img src="${p}" alt="" data-photo="${i}" class="${i === 0 ? 'active' : ''}">`
  ).join('');
  $('#mTitle').textContent = f.title;
  $('#mLoc').textContent = '📍 ' + f.loc;
  $('#mFeats').innerHTML = f.feats.map(x => `<span class="feat">${x}</span>`).join('');
  $('#mDesc').textContent = f.desc;
  updateTotal();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

function updateTotal() {
  if (!currentFlat) return;
  const nights = +$('#mNights').value;
  let total = currentFlat.price * nights;
  let disc = 0;
  if (nights >= 30) disc = 0.25;
  else if (nights >= 7) disc = 0.10;
  if (disc) total = Math.round(total * (1 - disc));
  $('#mTotal').textContent =
    (disc ? `${fmt(currentFlat.price * nights)} ₽ − ${Math.round(disc * 100)}% = ` : '') + `${fmt(total)} ₽ за ${nights} ${nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей'}`;
}
$('#mNights').addEventListener('change', updateTotal);
$('#mThumbs').addEventListener('click', e => {
  const t = e.target.closest('[data-photo]');
  if (!t) return;
  $('#mImg').src = t.src;
  $('#mThumbs').querySelectorAll('img').forEach(x => x.classList.toggle('active', x === t));
});

document.addEventListener('click', e => {
  const open = e.target.closest('[data-open]');
  if (open) { openModal(open.dataset.open); return; }
  if (e.target.closest('[data-close]')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
$('#mBook').addEventListener('click', () => {
  closeModal();
  /* Окно связи: позвонить / Telegram / WhatsApp / ВКонтакте (contact.js) */
  openContactPopup();
});

/* ---------- Поиск в герое ---------- */
$('#searchForm').addEventListener('submit', e => {
  e.preventDefault();
  const g = +$('#guests').value;
  const fits = FLATS.filter(f => f.guests >= g);
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.chip[data-filter="all"]').classList.add('active');
  renderCards('all');
  const t = $('#toast');
  t.textContent = fits.length
    ? `Найдено ${fits.length} квартир для ${g} ${g === 1 ? 'гостя' : 'гостей'} — показываем все`
    : `Для ${g} гостей пока нет квартир — позвоните, подберём!`;
  t.hidden = false;
  setTimeout(() => t.hidden = true, 3500);
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
});

/* ---------- Форма брони ---------- */
$('#bookForm').addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  openContactPopup();
});

/* ---------- Плавный скролл по кнопкам ---------- */
document.querySelectorAll('[data-scroll]').forEach(b =>
  b.addEventListener('click', () =>
    document.querySelector(b.dataset.scroll).scrollIntoView({ behavior: 'smooth' })
  )
);

/* ---------- Бургер ---------- */
$('#burger').addEventListener('click', () => {
  $('#nav').classList.toggle('open');
  $('#burger').classList.toggle('open');
});
document.querySelectorAll('.nav a').forEach(a =>
  a.addEventListener('click', () => { $('#nav').classList.remove('open'); $('#burger').classList.remove('open'); })
);

/* ---------- Счётчики статистики ---------- */
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const dec = el.dataset.decimal ? 1 : 0;
  const suffix = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1200;
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(dec) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ---------- Reveal on scroll ---------- */
let io;
function observeReveals() {
  if (!io) {
    io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el));
}

/* ---------- Init ---------- */
renderCards();
observeReveals();

/* Клик по метке: закрыть все остальные баллуны, показать свой, поднять метку над остальными */
function markerElementClick(el, markers, balloon, marker) {
  /* если балун вылезает за край карты — подталкиваем его внутрь */
  const clampBalloon = () => {
    const mapEl = document.getElementById('flatMap');
    if (!mapEl) return;
    const mr = mapEl.getBoundingClientRect();
    const r = balloon.getBoundingClientRect();
    const pad = 8;
    const dl = (mr.left + pad) - r.left;
    const dr = r.right - (mr.right - pad);
    if (dl > 0) balloon.style.transform = `translateX(calc(-50% + ${Math.round(dl)}px))`;
    else if (dr > 0) balloon.style.transform = `translateX(calc(-50% - ${Math.round(dr)}px))`;
    else balloon.style.transform = '';
  };
  const open = () => {
    markers.forEach(m => { m.el.querySelector('.ym-balloon').hidden = true; if (m.marker !== marker) m.marker.update({ zIndex: 0 }); });
    balloon.hidden = false;
    marker.update({ zIndex: 1000 });
    clampBalloon();
  };
  const close = () => { balloon.hidden = true; balloon.style.transform = ''; marker.update({ zIndex: 0 }); };

  el.querySelector('.pin-price').addEventListener('click', e => {
    e.stopPropagation();
    balloon.hidden ? open() : close();
  });
  el.querySelector('.ym-balloon-close').addEventListener('click', e => {
    e.stopPropagation();
    close();
  });
}

/* ---------- Карта квартир (Яндекс.Карты, JS API 3.0) ---------- */
const FLAT_COORDS = {
  'gorkogo-1-3rooms':    [56.31573, 43.99219],
  'gorkogo-1-2rooms':    [56.31573, 43.99219], /* тот же дом бд. Горького, 1 */
  'zvezdinka-3-2rooms':  [56.31469, 43.99375],
  'belinskogo-47-2rooms':[56.31384, 44.01035],
  'svobody-4-kreml':     [56.317912, 44.015796],
  'gorkogo-153-1room':   [56.31868, 44.01943],
  'bolshaya-pokrovskaya-75': [56.31173, 43.98813]
};

/* Группа: квартиры в одном доме — общий маркер с общим окном */
function groupKey(f) { return f.loc.split('·')[0].trim(); }
function flatGroups() {
  const g = {};
  FLATS.forEach(f => {
    const c = FLAT_COORDS[f.id];
    if (!c) return;
    (g[groupKey(f)] = g[groupKey(f)] || []).push(f);
  });
  return Object.values(g);
}

if (document.getElementById('flatMap') && window.ymaps3) {
  ymaps3.ready.then(async () => {
    const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker} = ymaps3;

    const map = new YMap(document.getElementById('flatMap'), {
      location: { center: [44.0038, 56.3148], zoom: 15 },
      showScaleInCopyrights: true
    }, [
      new YMapDefaultSchemeLayer({}),
      new YMapDefaultFeaturesLayer({})
    ]);

    const markers = []; /* все метки — чтобы закрывать чужие баллуны при клике */

    flatGroups().forEach(group => {
      const c = FLAT_COORDS[group[0].id];
      const multi = group.length > 1;
      /* в API 3.0 координаты в порядке [долгота, широта] */
      const el = document.createElement('div');
      el.className = 'ym-pin';
      if (multi) {
        const price = `${fmt(Math.min(...group.map(x => x.price)))}–${fmt(Math.max(...group.map(x => x.price)))} ₽`;
        el.innerHTML = `
          <div class="pin-price">${price}</div>
          <div class="ym-balloon ym-balloon-multi" hidden>
            <button class="ym-balloon-close" type="button" aria-label="Закрыть">✕</button>
            <div class="popup-title">${group[0].loc.split('·')[0].trim()}</div>
            <div class="popup-loc">Две квартиры в одном доме</div>
            ${group.map(x => `
              <div class="ym-flat-row">
                <b>${x.title}</b><span class="ym-flat-price">${fmt(x.price)} ₽</span>
                <div class="ym-flat-buttons">
                  <a class="ym-balloon-go" href="flat.html?id=${x.id}">Открыть →</a>
                  <a class="ym-balloon-route" href="https://yandex.ru/maps/?rtext=~${c[0]}%2C${c[1]}&rtt=auto" target="_blank" rel="noopener">Маршрут →</a>
                </div>
              </div>`).join('')}
          </div>`;
      } else {
        const f = group[0];
        el.innerHTML = `
          <div class="pin-price">${fmt(f.price)} ₽</div>
          <div class="ym-balloon" hidden>
            <button class="ym-balloon-close" type="button" aria-label="Закрыть">✕</button>
            <div class="popup-title">${f.title}</div>
            <div class="popup-loc">📍 ${f.loc}</div>
            <b style="color:var(--brand)">${fmt(f.price)} ₽ / сутки</b>
            <div class="ym-balloon-actions">
              <a class="ym-balloon-go" href="flat.html?id=${f.id}">Открыть →</a>
              <a class="ym-balloon-route" href="https://yandex.ru/maps/?rtext=~${c[0]}%2C${c[1]}&rtt=auto" target="_blank" rel="noopener">Маршрут →</a>
            </div>
          </div>`;
      }

      const balloon = el.querySelector('.ym-balloon');
      const marker = new YMapMarker({ coordinates: [c[1], c[0]], zIndex: 0 }, el);
      map.addChild(marker);
      markers.push({ el, marker });

      markerElementClick(el, markers, balloon, marker);
    });
  });
}

const statObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { animateCount(en.target); statObs.unobserve(en.target); }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stat [data-count]').forEach(el => statObs.observe(el));
