/* ============ Сутки.НН — data.js ============
   Данные квартир используются и на главной (index.html),
   и на странице квартиры (flat.html). */

/* Если PHOTOS_DIRS определён (файл photos-list.js, генерируется add-photos.bat),
   фото из папок img\<id> заменяют фотографию по умолчанию. */
/* Псевдонимы: у квартиры id=X фото могут лежать в папке с другим именем */
const PHOTOS_ALIASES = {
};

function flatPhotos(base, id, extra) {
  const dirs = typeof PHOTOS_DIRS === 'undefined' ? null : PHOTOS_DIRS;
  const key = (PHOTOS_ALIASES && PHOTOS_ALIASES[id]) || id;
  if (dirs && dirs[key]) return dirs[key];
  return extra || [base];
}

const FLATS = [
  {
    id: 'gorkogo-1-3rooms',
    title: '3-комнатная в центре',
    type: '3-комнатная', rooms: '3', tags: ['center', 'family'],
    loc: 'пл. Максима Горького, 1 · 4 этаж · центр города',
    price: 5200, rating: 9.9, reviews: 87, guests: 6, area: 88, floor: '4 из 6',
    beds: '4 спальных места', metro: 'Московская — 15 мин пешком',
    badges: ['Хит'],
    feats: ['3 спальни', 'Wi-Fi 100 Мбит', 'Кондиционер', 'Стиралка', 'Санузел'],
    desc: 'Просторная трёшка в самом центре: площадь Горького, Большая Покровская и Кремль — всё в пешей доступности. Идеальна для большой семьи или двух пар. Огромная кухня-гостиная и окна во двор.',
    img: 'img/gorkogo-1-3rooms/01-зал.jpg',
    photos: [
      'img/two-room.svg',
      'img/bedroom.svg',
      'img/living.svg',
      'img/kids.svg',
      'img/kitchen.svg',
      'img/bathroom.svg'
    ]
  },
  {
    id: 'gorkogo-1-2rooms',
    title: '2-комнатная у Покровки',
    type: '2-комнатная', rooms: '2', tags: ['center', 'family'],
    loc: 'пл. Максима Горького, 1 · 5 этаж · центр города',
    price: 3900, rating: 9.8, reviews: 45, guests: 4, area: 62, floor: '5 из 6',
    beds: '4 спальных места', metro: 'Московская — 15 мин пешком',
    badges: ['Семейная'],
    feats: ['2 спальни', 'Wi-Fi 100 Мбит', 'Кондиционер', 'Стиралка', 'Умный ТВ'],
    desc: 'Уютная двушка в том же доме, что и наша трёшка: площадь Горького, начало Большой Покровской, до Кремля 10 минут пешком. Заезд и выезд — как у соседей, без суеты. Реальные фото квартиры.',
    img: 'img/gorkogo-1-2rooms/01-комната.jpg',
  },
  {
    id: 'belinskogo-47-2rooms',
    title: '2-комнатная на Белинского',
    type: '2-комнатная', rooms: '2', tags: ['center'],
    loc: 'ул. Белинского, 47 · центр',
    price: 3600, rating: 9.7, reviews: 52, guests: 4, area: 55, floor: '2 из 5',
    beds: '4 спальных места', metro: 'Горьковская — 12 мин пешком',
    badges: [],
    feats: ['Wi-Fi 100 Мбит', 'Кухня-гостиная', 'Кондиционер', 'Стиралка', 'Умный ТВ'],
    desc: 'Ровная двушка рядом с Верхневолжской набережной: утром прогулка вдоль Волги, вечером — подсветка Стрелки. Удобно для командировки и отпуска.',
    img: 'img/belinskogo-47-2rooms/01-гостиная.jpg',
    photos: [
      'img/one-room.svg',
      'img/living.svg',
      'img/bedroom.svg',
      'img/kitchen.svg',
      'img/bathroom.svg'
    ]
  },
  {
    id: 'svobody-4-kreml',
    title: '2-комнатная с видом на Кремль',
    type: '2-комнатная', rooms: '2', tags: ['center', 'kreml'],
    loc: 'пл. Свободы, 4 · вид на Кремль',
    price: 4400, rating: 10.0, reviews: 41, guests: 4, area: 64, floor: '7 из 9',
    beds: '4 спальных места', metro: 'Горьковская — 8 мин пешком',
    badges: ['Хит', 'Вид'],
    feats: ['Вид на Кремль', 'Панорамные окна', 'Wi-Fi 100 Мбит', 'Кофемашина', 'Умный ТВ'],
    desc: 'Из окон видно стены Кремля и купола Михайло-Архангельского собора. Площадь Свободы, театр драмы и начало Большой Покровской — в двух шагах. Самая «фотографируемая» квартира.',
    img: 'img/svobody-4-kreml/01-вид-на-кремль.jpg',
    photos: [
      'img/panorama.svg',
      'img/view.svg',
      'img/living.svg',
      'img/bedroom.svg',
      'img/kitchen.svg'
    ]
  },
  {
    id: 'gorkogo-153-1room',
    title: '1-комнатная у пл. Свободы',
    type: '1-комнатная', rooms: '1', tags: ['center'],
    loc: 'ул. Максима Горького, 153 · у пл. Свободы',
    price: 2700, rating: 9.8, reviews: 119, guests: 3, area: 38, floor: '5 из 9',
    beds: '3 спальных места', metro: 'Горьковская — 10 мин пешком',
    badges: [],
    feats: ['Wi-Fi 100 Мбит', 'Кухня-гостиная', 'Диван 2 сп.', 'Стиралка', 'Балкон'],
    desc: 'Светлая однушка в двух минутах от площади Свободы: тихий двор, балкон и полноценная кухня. Отличный вариант для пары или командировки.',
    img: 'img/gorkogo-153-1room/01-спальня.jpg',
    photos: [
      'img/studio.svg',
      'img/living.svg',
      'img/kitchen.svg',
      'img/bathroom.svg'
    ]
  },
  {
    id: 'bolshaya-pokrovskaya-75',
    title: '2-комнатная на Большой Покровской, 75',
    type: '2-комнатная', rooms: '2', tags: ['center'],
    loc: 'ул. Большая Покровская, 75 · 3 этаж',
    price: 3500, rating: 9.7, reviews: 38, guests: 4, area: 52, floor: '3 из 5',
    beds: '4 спальных места', metro: 'Горьковская — 7 мин пешком',
    badges: ['Новинка'],
    feats: ['Wi-Fi 100 Мбит', 'Кухня-гостиная', 'Кондиционер', 'Стиралка', 'Умный ТВ'],
    desc: 'Самая пешеходная квартира: улица Покровка начинается прямо от подъезда. Рядом кафе, театры и Нижегородский Государственный Университет. Идеальна для командировки и уикенда.',
    img: 'img/bolshaya-pokrovskaya-75/01-зал.jpg',
    photos: [
      'img/living.svg',
      'img/bedroom.svg',
      'img/kitchen.svg',
      'img/bathroom.svg'
    ]
  }
];

/* Подключаем сгенерированный список фото из папок img\<id> (add-photos.bat) */
FLATS.forEach(f => { f.photos = flatPhotos(f.img, f.id, f.photos); });
