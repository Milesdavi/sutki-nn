/* ============ Сутки.НН — contact.js ============
   Окно связи после «Забронировать»: позвонить + копирование,
   ВКонтакте / Telegram / WhatsApp.
   На телефоне кнопки открывают приложение/диалог сразу,
   на ПК показывают номер и юзернейм с кнопкой «Скопировать».
   Подключается и на главной (index.html), и на странице квартиры (flat.html). */

/* --- Контакты: правится здесь, одна точка для всего сайта --- */
const CP = {
  phoneShow: '+7 905 669-85-80',
  phoneRaw:  '+79056698580',
  whatsapp:  'https://wa.me/79056698580',
  tgHandle:  '@Natali101219',
  tgLink:    'https://t.me/Natali101219',
  vkHandle:  'id317914778',
  vkLink:    'https://vk.me/id317914778'
};

/* --- Мессенджеры: app — открыть в приложение/диалог, web — открыть на ПК --- */
const CP_MESSENGERS = {
  tg: { app: 'tg://resolve?domain=Natali101219',        web: CP.tgLink },
  wa: { app: 'whatsapp://send?phone=79056698580',       web: CP.whatsapp },
  vk: { app: 'https://vk.me/id317914778',               web: CP.vkLink }
};

/* --- Контактная форма / диалог: vk.ru открывается в приложении мгновенно --- */

/* --- Мобилка или ПК --- */
const cpIsMobile = /Android|iPhone|iPad|iPod|Windows Phone|Opera Mini/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) < 820);

/* --- Разметка окна (один блок для всех страниц) --- */
document.body.insertAdjacentHTML('beforeend', `
<div class="cp-pop" id="cpPop" hidden>
  <div class="cp-backdrop" data-cp-close></div>
  <div class="cp-card" role="dialog" aria-modal="true">
    <button class="cp-close" data-cp-close aria-label="Закрыть">✕</button>
    <h3 class="cp-title">Как связаться 🤙</h3>
    <p class="cp-sub">${cpIsMobile ? 'Нажмите — сразу откроется приложение' : 'Номер и юзернейм можно скопировать'}</p>
    <p class="cp-flat" id="cpFlat" hidden></p>

    <div class="cp-row">
      <span class="cp-main">
        <span class="cp-ico call">📞</span>
        <span class="cp-info"><b>${CP.phoneShow}</b><small>без посредников · отвечаем сразу</small></span>
      </span>
      <span class="cp-actions">
        <a class="cp-call" href="tel:${CP.phoneRaw}">Позвонить</a>
        <button class="cp-copy" type="button" data-cp-copy="${CP.phoneShow}">Скопировать</button>
      </span>
    </div>

    <div class="cp-row">
      <a class="cp-main" data-cp-msg="vk" href="${CP_MESSENGERS.vk.web}" target="_blank" rel="noopener">
        <span class="cp-ico vk"><img src="img/ic-vk.svg" alt=""></span>
        <span class="cp-info"><b>Написать в ВКонтакте</b><small>${CP.vkHandle}</small></span>
        <span class="cp-go">›</span>
      </a>
      <button class="cp-copy" type="button" data-cp-copy="${CP.vkHandle}">Скопировать</button>
    </div>

    <div class="cp-row">
      <a class="cp-main" data-cp-msg="tg" href="${CP.tgLink}" target="_blank" rel="noopener">
        <span class="cp-ico tg"><img src="img/ic-tg.svg" alt="Telegram"></span>
        <span class="cp-info"><b>Написать в Telegram</b><small>${CP.tgHandle}</small></span>
        <span class="cp-go">›</span>
      </a>
      <button class="cp-copy" type="button" data-cp-copy="${CP.tgHandle}">Скопировать</button>
    </div>

    <div class="cp-row">
      <a class="cp-main" data-cp-msg="wa" href="${CP.whatsapp}" target="_blank" rel="noopener">
        <span class="cp-ico wa"><img src="img/ic-wa.svg" alt="WhatsApp"></span>
        <span class="cp-info"><b>Написать в WhatsApp</b><small>${CP.phoneShow}</small></span>
        <span class="cp-go">›</span>
      </a>
      <button class="cp-copy" type="button" data-cp-copy="${CP.phoneShow}">Скопировать</button>
    </div>

    <p class="cp-note">Пишите в мессенджер — ответим в течение пары минут 🙂</p>
  </div>
</div>`);

const cpPop = document.getElementById('cpPop');

/* --- Открытие / закрытие --- */
function openContactPopup(flatTitle) {
  const ft = document.getElementById('cpFlat');
  ft.hidden = !flatTitle;
  if (flatTitle) ft.textContent = `«${flatTitle}» — заявка принята!`;
  cpPop.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeContactPopup() {
  cpPop.hidden = true;
  document.body.style.overflow = '';
}
window.openContactPopup = openContactPopup;

/* --- Копирование (с fallback для старых браузеров) --- */
function cpCopy(btn) {
  const txt = btn.dataset.cpCopy;
  const done = () => {
    if (btn.dataset.cpBusy) return;
    btn.dataset.cpBusy = '1';
    const old = btn.textContent;
    btn.textContent = 'Скопировано ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = old; btn.classList.remove('copied'); delete btn.dataset.cpBusy; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done).catch(() => cpCopyFallback(txt, done));
  } else {
    cpCopyFallback(txt, done);
  }
}
function cpCopyFallback(txt, done) {
  const ta = document.createElement('textarea');
  ta.value = txt;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) { /* ignore */ }
  ta.remove();
  done();
}

/* --- Мессенджеры: мобилка → vk.me (открывает диалог в приложении), ПК → на сайт --- */
function cpOpenApp(scheme, fallback) {
  const t = Date.now();
  location.href = scheme;
  setTimeout(() => {
    if (!document.hidden && Date.now() - t < 2200) location.href = fallback;
  }, 900);
}

document.addEventListener('click', e => {
  const copy = e.target.closest('[data-cp-copy]');
  if (copy) { cpCopy(copy); return; }
  if (e.target.closest('[data-cp-close]')) { closeContactPopup(); return; }
  const msg = e.target.closest('[data-cp-msg]');
  if (msg) {
    e.preventDefault();
    const m = CP_MESSENGERS[msg.dataset.cpMsg];
    if (cpIsMobile && m.app) cpOpenApp(m.app, m.web);
    else window.open(m.web, '_blank', 'noopener');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeContactPopup(); });

/* --- Диплинк-режим: открыть окно ссылкой /#contact (пригодится в бросках) --- */
window.addEventListener('hashchange', () => { if (location.hash === '#contact') openContactPopup(); });
if (location.hash === '#contact') openContactPopup();
