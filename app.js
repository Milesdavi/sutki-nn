/* ============ Сутки.НН — app.js ============
   Данные квартир (FLATS) — в data.js,
   слайдер фото (mediaHTML, initSlider) — в slider.js */

const fmt = n => n.toLocaleString('ru-RU');
const $ = s => document.querySelector(s);

/* Русские склонения: plural(3, ['квартира','квартиры','квартир']) -> 'квартиры' */
const plural = (n, forms) => {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b === 1) return forms[0];
  if (b >= 2 && b <= 4) return forms[1];
  return forms[2];
};
const FLAT_WORD = ['квартира', 'квартиры', 'квартир'];
const GUEST_WORD = ['гостя', 'гостей', 'гостей'];
const NIGHT_WORD = ['ночь', 'ночи', 'ночей'];
const flatWord = n => plural(n, FLAT_WORD);
const guestWord = n => plural(n, GUEST_WORD);
const nightWord = n => plural(n, NIGHT_WORD);

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

/* Фильтры каталога: одна точка правды для чипов и поиска */
const FILTERS = {
  all: () => true,
  /* rooms в data.js хранится строкой ('2'), поэтому сравниваем через Number */
  '1': f => Number(f.rooms) === 1,
  '2': f => Number(f.rooms) === 2,
  '3': f => Number(f.rooms) === 3,
  family: f => f.tags.includes('family'),
  kreml: f => f.tags.includes('kreml'),
  budget: f => f.price < 4000
};

function paintCards(list) {
  $('#cards').innerHTML = list.map(cardHTML).join('');
  $('#empty').hidden = list.length > 0;
  document.querySelectorAll('#cards [data-slider]').forEach(initSlider);
  observeReveals();
}

function renderCards(filter = 'all') {
  const test = FILTERS[filter] || FILTERS.all;
  paintCards(FLATS.filter(test));
}

/* ---------- Фильтры ---------- */
$('#filters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderCards(chip.dataset.filter);
});

/* ---------- Модальное окно (быстрый просмотр с фото) ---------- */
const modal = $('#modal');
let currentFlat = null;
let lastFocus = null;

function openModal(id) {
  const f = FLATS.find(x => x.id === id);
  if (!f) return;
  lastFocus = document.activeElement;
  currentFlat = f;
  const photos = f.photos && f.photos.length ? f.photos : [f.img];
  $('#mImg').src = photos[0];
  $('#mImg').alt = f.title;
  $('#mThumbs').innerHTML = photos.map((p, i) =>
    `<img src="${p}" alt="${f.title} — фото ${i + 1} из ${photos.length}" data-photo="${i}" class="${i === 0 ? 'active' : ''}" loading="lazy" decoding="async" width="64" height="48">`
  ).join('');
  $('#mTitle').textContent = f.title;
  $('#mLoc').textContent = '📍 ' + f.loc;
  $('#mFeats').innerHTML = f.feats.map(x => `<span class="feat">${x}</span>`).join('');
  $('#mDesc').textContent = f.desc;
  updateTotal();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const close = modal.querySelector('.modal-close');
  if (close) close.focus();
}
function closeModal() {
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
}

function updateTotal() {
  if (!currentFlat) return;
  const nights = +$('#mNights').value;
  let total = currentFlat.price * nights;
  let disc = 0;
  if (nights >= 30) disc = 0.25;
  else if (nights >= 7) disc = 0.10;
  if (disc) total = Math.round(total * (1 - disc));
  $('#mTotal').innerHTML =
    (disc ? `<s>${fmt(currentFlat.price * nights)} ₽</s> − ${Math.round(disc * 100)}% = ` : '') +
    `<b>${fmt(total)} ₽</b> за ${nights} ${nightWord(nights)}`;
}
$('#mNights').addEventListener('change', updateTotal);
$('#mThumbs').addEventListener('click', e => {
  const t = e.target.closest('[data-photo]');
  if (!t) return;
  $('#mImg').src = t.src;
  $('#mImg').alt = t.alt;
  $('#mThumbs').querySelectorAll('img').forEach(x => x.classList.toggle('active', x === t));
});

document.addEventListener('click', e => {
  /* клик по фото в карточке — быстрый просмотр; стрелки и точки слайдера не считаем */
  const media = e.target.closest('#cards .card-media[data-id]');
  if (media && !e.target.closest('.s-arrow, .s-dot') && Date.now() - (media._dragEnd || 0) > 350) {
    openModal(media.dataset.id);
    return;
  }
  const open = e.target.closest('[data-open]');
  if (open) { openModal(open.dataset.open); return; }
  if (e.target.closest('[data-close]')) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); return; }
  const active = document.activeElement;
  if ((e.key === 'Enter' || e.key === ' ') && active && active.classList &&
      active.classList.contains('card-media') && active.dataset.id) {
    e.preventDefault();
    openModal(active.dataset.id);
  }
});
$('#mBook').addEventListener('click', () => {
  closeModal();
  /* Окно связи: позвонить / Telegram / WhatsApp / ВКонтакте (contact.js) */
  openContactPopup(currentFlat ? currentFlat.title : undefined);
});

/* ---------- Поиск в герое ---------- */
let toastTimer = null;
$('#searchForm').addEventListener('submit', e => {
  e.preventDefault();
  const g = +$('#guests').value;
  const fits = FLATS.filter(f => f.guests >= g);
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.chip[data-filter="all"]').classList.add('active');
  paintCards(fits);
  const t = $('#toast');
  t.textContent = fits.length
    ? `Найдено ${fits.length} ${flatWord(fits.length)} для ${g} ${guestWord(g)}`
    : `Для ${g} ${guestWord(g)} пока нет квартир — позвоните, подберём!`;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.hidden = true, 3500);
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
});

/* ---------- Форма брони ---------- */
function notify(text) {
  const t = $('#toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.hidden = true, 4000);
}

const bPhone = $('#bPhone');
if (bPhone) {
  bPhone.addEventListener('input', () => bPhone.classList.remove('is-invalid'));
}

$('#bookForm').addEventListener('submit', e => {
  e.preventDefault();
  const digits = bPhone ? bPhone.value.replace(/\D/g, '') : '';
  if (bPhone && digits.length < 10) {
    bPhone.classList.add('is-invalid');
    bPhone.focus();
    notify('Укажите телефон — перезвоним и подтвердим бронь');
    return;
  }
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
const closeNav = () => { $('#nav').classList.remove('open'); $('#burger').classList.remove('open'); };
$('#burger').addEventListener('click', () => {
  $('#nav').classList.toggle('open');
  $('#burger').classList.toggle('open');
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', closeNav));
/* меню-шторка закрывается по Esc и по клику мимо неё */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
document.addEventListener('click', e => {
  if (!$('#nav').classList.contains('open')) return;
  if (e.target.closest('#nav, #burger')) return;
  closeNav();
});

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

/* Ссылка на Яндекс.Карты: rtext — точки маршрута через «~»,
   пустая первая точка = «моё местоположение», rtt=pd — пешком, rtt=auto — на машине.
   Второй аргумент — куда едем, первый (необязательный) — откуда. */
function routeUrl(to, from, mode) {
  const p = c => `${c[0]}%2C${c[1]}`;
  return `https://yandex.ru/maps/?rtext=${from ? p(from) : ''}~${p(to)}&rtt=${mode === 'auto' ? 'auto' : 'pd'}`;
}

/* Баллун не должен вылезать за рамку карты:
   по вертикали — раскрываем вверх, если снизу не помещается;
   по горизонтали — подталкиваем внутрь. */
function fitBalloon(el, balloon) {
  const mapEl = document.getElementById('flatMap');
  if (!mapEl) return;
  const pad = 10;
  balloon.style.transform = '';
  balloon.style.maxHeight = '';
  balloon.style.overflowY = '';
  balloon.classList.remove('ym-balloon-up');

  const mr = mapEl.getBoundingClientRect();
  const pr = el.getBoundingClientRect();
  let br = balloon.getBoundingClientRect();

  /* сравниваем, где больше места, и раскрываем в ту сторону */
  const roomBelow = (mr.bottom - pr.bottom) - 14;
  const roomAbove = (pr.top - mr.top) - 14;
  if (roomBelow < br.height && roomAbove > roomBelow) {
    balloon.classList.add('ym-balloon-up');
    br = balloon.getBoundingClientRect();
  }

  /* баллун выше самой карты — ограничиваем высоту и включаем прокрутку */
  const room = Math.max(roomBelow, roomAbove) - pad;
  if (br.height > room && room > 150) {
    balloon.style.maxHeight = `${Math.round(room)}px`;
    balloon.style.overflowY = 'auto';
    br = balloon.getBoundingClientRect();
  }

  const dl = (mr.left + pad) - br.left;
  const dr = br.right - (mr.right - pad);
  if (dl > 0) balloon.style.transform = `translateX(calc(-50% + ${Math.round(dl)}px))`;
  else if (dr > 0) balloon.style.transform = `translateX(calc(-50% - ${Math.round(dr)}px))`;
}

/* Клик по метке: закрыть остальные баллуны, показать свой, поднять метку наверх */
function markerElementClick(el, markers, balloon, marker, trigger) {
  const close = () => {
    balloon.hidden = true;
    balloon.style.transform = '';
    balloon.style.maxHeight = '';
    balloon.style.overflowY = '';
    balloon.classList.remove('ym-balloon-up');
    marker.update({ zIndex: 0 });
  };
  const open = () => {
    markers.forEach(m => m.close());
    balloon.hidden = false;
    marker.update({ zIndex: 1000 });
    fitBalloon(el, balloon);
  };

  (trigger || el.querySelector('.pin-price')).addEventListener('click', e => {
    e.stopPropagation();
    balloon.hidden ? open() : close();
  });
  el.querySelector('.ym-balloon-close').addEventListener('click', e => {
    e.stopPropagation();
    close();
  });
  /* клики внутри окна не должны доходить до карты и закрывать его */
  el.addEventListener('click', e => e.stopPropagation());

  return { el, marker, balloon, close };
}

/* ---------- Карта квартир (Яндекс.Карты, JS API 3.0) ---------- */
const FLAT_COORDS = {
  'gorkogo-1-3rooms':    [56.31573, 43.99219],
  'gorkogo-1-2rooms':    [56.31573, 43.99219], /* тот же дом бд. Горького, 1 */
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

/* «Как дойти до работы» — офис гостей (АО «Транснефть – Подводсервис»), ул. Решетниковская, 4 */
const WALK_TARGET = {
  name: 'Решетниковская, 4',
  coords: [56.314707, 44.001881]
};
function walkInfo(c) {
  const R = 6371000, toRad = d => d * Math.PI / 180;
  const dLat = toRad(WALK_TARGET.coords[0] - c[0]);
  const dLng = toRad(WALK_TARGET.coords[1] - c[1]);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(c[0])) * Math.cos(toRad(WALK_TARGET.coords[0])) * Math.sin(dLng/2)**2;
  const d = 2 * R * Math.asin(Math.sqrt(a));
  const m = Math.round(d * 1.3 / 10) * 10;          /* прямой знак × 1.3 = реальный маршрут по улицам */
  const min = Math.max(3, Math.round(m / 75));      /* 4.5 км/ч */
  return { m, min };
}

function buildFlatMap(container) {
  const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker} = ymaps3;

  const map = new YMap(container, {
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
      const w = walkInfo(c);
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
            <div class="popup-loc" style="margin-bottom:0">Две квартиры в одном доме</div>
            <div class="ym-routes">
              <a class="ym-route" href="${routeUrl(WALK_TARGET.coords, c)}" target="_blank" rel="noopener">🚶 До офиса · ${w.min} мин</a>
              <a class="ym-route" href="${routeUrl(c)}" target="_blank" rel="noopener">📍 От вашего положения</a>
            </div>
            <div class="ym-flats">
              ${group.map(x => `
              <div class="ym-flat-row">
                <div class="ym-flat-head"><b>${x.title}</b><span class="ym-flat-price">${fmt(x.price)} ₽</span></div>
                <a class="ym-flat-open" href="flat.html?id=${x.id}">Открыть квартиру →</a>
              </div>`).join('')}
            </div>
          </div>`;
      } else {
        const f = group[0];
        el.innerHTML = `
          <div class="pin-price">${fmt(f.price)} ₽</div>
          <div class="ym-balloon" hidden>
            <button class="ym-balloon-close" type="button" aria-label="Закрыть">✕</button>
            <div class="popup-title">${f.title}</div>
            <div class="popup-loc">📍 ${f.loc}</div>
            <b class="ym-price">${fmt(f.price)} ₽ <span>/ сутки</span></b>
            <div class="ym-routes">
              <a class="ym-route" href="${routeUrl(WALK_TARGET.coords, c)}" target="_blank" rel="noopener">🚶 До офиса · ${w.min} мин</a>
              <a class="ym-route" href="${routeUrl(c)}" target="_blank" rel="noopener">📍 От вашего положения</a>
            </div>
            <a class="ym-balloon-go ym-go-wide" href="flat.html?id=${f.id}">Открыть квартиру →</a>
          </div>`;
      }

      const balloon = el.querySelector('.ym-balloon');
      const marker = new YMapMarker({ coordinates: [c[1], c[0]], zIndex: 0 }, el);
      map.addChild(marker);
      markers.push(markerElementClick(el, markers, balloon, marker));
    });

    /* Офис гостей — метка-адрес без цены: видно, куда идти пешком от квартир */
    const officeEl = document.createElement('div');
    officeEl.className = 'ym-pin ym-pin-office';
    const mins = FLATS.map(f => FLAT_COORDS[f.id]).filter(Boolean).map(cc => walkInfo(cc).min);
    const range = mins.length ? `Пешком от наших квартир — ${Math.min(...mins)}–${Math.max(...mins)} мин` : '';
    officeEl.innerHTML = `
      <button class="pin-office" type="button"><span class="pin-office-dot"></span>${WALK_TARGET.name}</button>
      <div class="ym-balloon ym-balloon-office" hidden>
        <button class="ym-balloon-close" type="button" aria-label="Закрыть">✕</button>
        <div class="popup-title">${WALK_TARGET.name}</div>
        <div class="popup-loc">Офис приёма гостей</div>
        ${range ? `<div class="ym-office-hint">${range}</div>` : ''}
        <a class="ym-route ym-route-main" href="${routeUrl(WALK_TARGET.coords)}" target="_blank" rel="noopener">📍 Маршрут от вашего положения</a>
      </div>`;
    const officeBalloon = officeEl.querySelector('.ym-balloon');
    /* координаты в API 3.0 — [долгота, широта] */
    const officeMarker = new YMapMarker({ coordinates: [WALK_TARGET.coords[1], WALK_TARGET.coords[0]], zIndex: 1 }, officeEl);
    map.addChild(officeMarker);
    markers.push(markerElementClick(officeEl, markers, officeBalloon, officeMarker, officeEl.querySelector('.pin-office')));

    /* клик по пустому месту карты закрывает открытое окно */
    try {
      map.addChild(new ymaps3.YMapListener({ onClick: () => markers.forEach(m => m.close()) }));
    } catch (err) { /* в старых сборках API слушателя нет — не критично */ }

    /* кнопки масштаба */
    try {
      const {YMapControls, YMapZoomControl} = ymaps3;
      if (YMapControls && YMapZoomControl) {
        map.addChild(new YMapControls({position: 'right'}).addChild(new YMapZoomControl({})));
      }
    } catch (err) { /* без кнопок карта тоже работает: колесо и пинч */ }
}

/* ---------- Инициализация карты + запасной вариант ----------
   JS API Яндекса может быть недоступен (блокировщики, ключ, сеть).
   Тогда вместо пустого прямоугольника показываем список адресов с ценами. */
function mapFallbackHTML() {
  const groups = flatGroups();
  const rows = groups.map(group => {
    const lo = Math.min(...group.map(x => x.price));
    const hi = Math.max(...group.map(x => x.price));
    const price = lo === hi ? `${fmt(lo)} ₽` : `${fmt(lo)}–${fmt(hi)} ₽`;
    const loc = group[0].loc.split('·')[0].trim();
    const more = group.length > 1 ? ` · ${group.length} ${flatWord(group.length)}` : '';
    return `<li>
      <a href="flat.html?id=${group[0].id}">
        <b>${loc}</b>${more}
        <span>${price} / сутки</span>
      </a>
    </li>`;
  }).join('');
  return `
    <div class="map-fallback-inner">
      <div class="map-fallback-head">
        <b>${FLATS.length} ${flatWord(FLATS.length)} в центре Нижнего Новгорода</b>
        <span>Все адреса и цены — нажмите на адрес, чтобы открыть квартиру</span>
      </div>
      <ul class="map-fallback-list">${rows}</ul>
      <a class="btn btn-ghost btn-sm" href="https://yandex.ru/maps/?text=${encodeURIComponent('Нижний Новгород, Большая Покровская, 75')}" target="_blank" rel="noopener">Открыть район на Яндекс.Картах →</a>
    </div>`;
}

function initFlatMap() {
  const el = document.getElementById('flatMap');
  if (!el) return;

  /* сразу рисуем запасной список: пустой блок карты выглядит как поломка */
  el.classList.add('map-fallback');
  el.innerHTML = mapFallbackHTML();

  let done = false;
  const tryInit = () => {
    if (done) return true;
    if (!window.ymaps3 || !window.ymaps3.ready) return false;
    done = true;
    window.ymaps3.ready.then(() => {
      try {
        el.classList.remove('map-fallback');
        el.innerHTML = '';
        buildFlatMap(el);
      } catch (err) {
        console.warn('Не удалось построить карту:', err);
        el.classList.add('map-fallback');
        el.innerHTML = mapFallbackHTML();
      }
    }).catch(() => {
      el.classList.add('map-fallback');
      el.innerHTML = mapFallbackHTML();
    });
    return true;
  };

  if (tryInit()) return;
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (tryInit() || tries >= 25) clearInterval(timer); /* ~10 c ожидания */
  }, 400);
}
initFlatMap();

const statObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { animateCount(en.target); statObs.unobserve(en.target); }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stat [data-count]').forEach(el => statObs.observe(el));
