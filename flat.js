/* ============ Сутки.НН — flat.js (страница квартиры) ============ */

const fmt = n => n.toLocaleString('ru-RU');
const $ = s => document.querySelector(s);
const NIGHT_WORDS =  ['ночь', 'ночи', 'ночей'];
const nightWord = n => n === 1 ? NIGHT_WORDS[0] : n < 5 ? NIGHT_WORDS[1] : NIGHT_WORDS[2];

const id = new URLSearchParams(location.search).get('id');
const flat = FLATS.find(f => f.id === id) || FLATS[0];
if (flat.id !== id) history.replaceState(null, '', `flat.html?id=${flat.id}`);

document.title = `${flat.title} посуточно — ${fmt(flat.price)} ₽ · Сутки.НН`;

/* ---------- Шапка ---------- */
$('#crumbType').textContent = flat.type;

/* ---------- Галерея ---------- */
const PHOTOS = flat.photos.length ? flat.photos : [flat.img];
$('#gallery').innerHTML = `
  <div class="s-track">${PHOTOS.map((p, i) => `<img src="${p}" alt="${flat.title} — фото ${i + 1}" data-i="${i}">`).join('')}</div>
  ${PHOTOS.length > 1 ? `
  <button class="s-arrow s-prev" data-dir="-1" aria-label="Предыдущее фото">‹</button>
  <button class="s-arrow s-next" data-dir="1" aria-label="Следующее фото">›</button>` : ''}
  <div class="s-dots">${PHOTOS.map((_, i) => `<button class="s-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Фото ${i + 1}"></button>`).join('')}</div>
  <span class="s-count" data-count>1 / ${PHOTOS.length}</span>`;
$('#gThumbs').innerHTML = PHOTOS.map((p, i) =>
  `<img src="${p}" alt="" data-photo="${i}" class="${i === 0 ? 'active' : ''}" loading="lazy">`).join('');

initSlider($('#gallery'));

$('#gThumbs').addEventListener('click', e => {
  const t = e.target.closest('[data-photo]');
  if (!t) return;
  const track = $('#gallery .s-track');
  track.style.transform = `translateX(-${t.dataset.photo * 100}%)`;
  $('#gallery').querySelectorAll('.s-dot').forEach(d => d.classList.toggle('active', d.dataset.i === t.dataset.photo));
  $('#gallery [data-count]').textContent = `${+t.dataset.photo + 1} / ${PHOTOS.length}`;
  $('#gThumbs').querySelectorAll('img').forEach(x => x.classList.toggle('active', x === t));
});

/* ---------- Описание и удобства ---------- */
$('#fTitle').textContent = flat.title;
$('#fLocLine').textContent = `📍 ${flat.loc}`;
$('#fDesc').textContent = flat.desc;
$('#fFeats').innerHTML = flat.feats.map(x => `<span class="feat">✓ ${x}</span>`).join('');

/* ---------- Условия ---------- */
$('#fArea').textContent = `${flat.area} м² площадь`;
$('#fBeds').textContent = flat.beds;
$('#fMetro').textContent = flat.metro;

/* ---------- Цена и калькулятор ---------- */
$('#fPrice').textContent = `${fmt(flat.price)} ₽`;
$('#fRating').innerHTML = `<span class="stars-inline">★ ${flat.rating.toFixed(1)}</span> · ${flat.reviews} отзывов`;

function updateTotal() {
  const nights = +$('#bNights').value;
  let total = flat.price * nights, disc = 0;
  if (nights >= 30) disc = 0.25;
  else if (nights >= 7) disc = 0.10;
  if (disc) total = Math.round(total * (1 - disc));
  $('#bTotal').innerHTML = disc
    ? `<s>${fmt(flat.price * nights)} ₽</s> − ${Math.round(disc * 100)}% = <b>${fmt(total)} ₽</b> за ${nights} ${nightWord(nights)}`
    : `<b>${fmt(total)} ₽</b> за ${nights} ${nightWord(nights)}`;
}
$('#bNights').addEventListener('change', updateTotal);
updateTotal();

$('#bookForm').addEventListener('submit', e => {
  e.preventDefault();
  /* Окно связи: позвонить / Telegram / WhatsApp / ВКонтакте (contact.js) */
  openContactPopup(flat.title);
});

/* ---------- Похожие квартиры ---------- */
const similar = FLATS.filter(f => f.id !== flat.id).slice(0, 3);
$('#similarCards').innerHTML = similar.map(f => `
  <article class="card">
    <a class="card-media" href="flat.html?id=${f.id}" style="display:block;position:relative">
      <img src="${f.img}" alt="${f.title}" loading="lazy">
      <div class="card-badges">${f.badges.map(b => `<span class="badge ${b === 'Хит' ? 'hot' : ''}">${b}</span>`).join('')}</div>
    </a>
    <div class="card-body">
      <a class="card-link" href="flat.html?id=${f.id}"><h3 class="card-title">${f.title}</h3></a>
      <p class="card-loc">📍 ${f.loc}</p>
      <div class="card-foot">
        <div class="price"><b>${fmt(f.price)} ₽</b> <span>/ сутки</span></div>
        <div class="rating">★ ${f.rating.toFixed(1)}</div>
      </div>
    </div>
  </article>`).join('');
