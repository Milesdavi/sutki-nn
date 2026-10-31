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
  /* Telegram заблокирован/замедлен в РФ → свежий MTProto-прокси берём из нашего канала.
     tg://resolve открывает канал прямо в приложении, не заходя на t.me. */
  tgProxy: {
    app: 'tg://resolve?domain=NetGhostMTP',
    web: 'https://t.me/s/NetGhostMTP'
  },
  vkHandle:  'id317914778',
  vkLink:    'https://vk.me/id317914778'
};

/* --- Telegram в РФ: в момент клика берём живой MTProto-прокси из GitHub-репо (обновляется ежедневно),
       открываем tg://proxy — приложение сразу предлагает «Подключить прокси», затем открываем диалог владельца.
       Каналы-источники обновлены 2026-10-30; при недоступности сработает вшитый запасной прокси. */
const TG_PROXY_LISTS = [
  'https://cdn.jsdelivr.net/gh/tgmtproxy/telegram-mtproto-proxy-list@main/proxies.txt',
  'https://raw.githubusercontent.com/tgmtproxy/telegram-mtproto-proxy-list/main/proxies.txt'
];
const TG_PROXY_FALLBACK =
  'tg://proxy?server=stone.velvetoak.work&port=443&secret=ee2b6eb790d613a1725557ce33b9a87b307777772e676f6f676c652e636f6d';

async function tgProxyLink() {
  for (const u of TG_PROXY_LISTS) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const txt = await r.text();
      const links = txt.match(/tg:\/\/proxy\?[^ \r\n]+|https:\/\/t\.me\/proxy\?[^ \r\n]+/g);
      if (links && links.length) {
        /* предпочитаем секреты вида ee… — замаскированы под HTTPS-TLS, проходят блокировки */
        const good = links.find(x => /secret=ee[0-9a-f]{16,}/i.test(x)) || links[0];
        return good.replace(/^https:\/\/t\.me\/proxy\?/, 'tg://proxy?');
      }
    } catch (e) { /* пробуем следующий список */ }
  }
  return TG_PROXY_FALLBACK;
}

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
        <span class="cp-info"><b>Написать в Telegram</b><small>${CP.tgHandle} · прокси подключится сам</small></span>
        <span class="cp-go">›</span>
      </a>
      <button class="cp-copy" type="button" data-cp-copy="${CP.tgHandle}">Скопировать</button>
    </div>
    <p class="cp-proxy" id="cpTgChat" hidden><b>Прокси подключили?</b> <a href="${CP_MESSENGERS.tg.app}" style="white-space:nowrap">Открыть чат с @Natali101219 →</a></p>
    <p class="cp-proxy" id="cpTgMiss" hidden>Telegram не открылся? Проверьте, что приложение установлено — а пока можно <a href="tel:${CP.phoneRaw}">позвонить</a> или <a href="#" data-cp-msg="wa">написать в WhatsApp</a> 🙂</p>
    <p class="cp-proxy">Telegram замедлен/заблокирован? <a href="${CP.tgProxy.web}" data-cp-proxy target="_blank" rel="noopener">Подключить свежий прокси →</a></p>

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

/* Открыть Telegram: сначала подключаем свежий прокси (приложение предложит «Включить?»),
   затем открываем диалог с владельцем. Работает для кнопки в попапе и в шапке.
   Надёжный финал: окно связи остаётся открытым с кнопкой «Открыть чат →» —
   после включения прокси гость тапает её и попадает в диалог с @Natali101219.
   (Telegram сам не хранит «куда идти после включения прокси», авто-переход капризный.) */
function openTelegramWithProxy() {
  openContactPopup();                           /* подсказка и кнопка чата — на экране, когда гость вернётся */
  tgProxyLink().then(link => {
    location.href = link;                       /* ① приложение спросит «Включить прокси?» */
    const chat = document.getElementById('cpTgChat');
    if (chat) chat.hidden = false;              /* ② кнопка «Открыть чат →» */
    /* ③ авто-попытка открыть диалог — иногда успевает сработать сама */
    setTimeout(() => { location.href = CP_MESSENGERS.tg.app; }, 3500);
  });
}

document.addEventListener('click', e => {
  const copy = e.target.closest('[data-cp-copy]');
  if (copy) { cpCopy(copy); return; }
  if (e.target.closest('[data-cp-close]')) { closeContactPopup(); return; }
  /* Кнопка Telegram в шапке страницы — тоже через прокси */
  if (e.target.closest('.js-tg-link')) { e.preventDefault(); openTelegramWithProxy(); return; }
  const msg = e.target.closest('[data-cp-msg]');
  if (msg) {
    e.preventDefault();
    const m = CP_MESSENGERS[msg.dataset.cpMsg];
    if (msg.dataset.cpMsg === 'tg') {
      openTelegramWithProxy();
      return;
    }
    if (cpIsMobile && m.app) cpOpenApp(m.app, m.web);
    else window.open(m.web, '_blank', 'noopener');
  }
  /* «Подключить свежий прокси»: сначала пробуем открыть канал в приложении Telegram,
     если приложения нет — веб-версию канала. */
  const proxy = e.target.closest('[data-cp-proxy]');
  if (proxy) {
    e.preventDefault();
    cpOpenApp(CP.tgProxy.app, CP.tgProxy.web);
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeContactPopup(); });

/* --- Диплинк-режим: открыть окно ссылкой /#contact (пригодится в бросках) --- */
window.addEventListener('hashchange', () => { if (location.hash === '#contact') openContactPopup(); });
if (location.hash === '#contact') openContactPopup();
