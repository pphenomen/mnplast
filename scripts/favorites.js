document.addEventListener('DOMContentLoaded', () => {
  const list         = document.getElementById('favoritesList');
  const totalCountEl = document.getElementById('totalCount');
  const totalPriceEl = document.getElementById('totalPrice');
  const messageField = document.querySelector('#orderForm textarea');

  // инициализация: рендер и бейдж
  updateFavCount();
  renderFavorites();
  fillMessageFromFavorites();

  if (messageField) {
    messageField.addEventListener('input', () => {
      clearTimeout(window._debounce);
      window._debounce = setTimeout(updateMessageFromTextarea, 300);
    });
  }

  // увеличение или уменьшение количества упаковок
  window.changeQty = (index, delta) => {
    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    favs[index].qty = Math.max(1, Number(favs[index].qty) + delta);
    localStorage.setItem('favorites', JSON.stringify(favs));
    renderFavorites();
    updateFavCount();
    fillMessageFromFavorites();
  };

  // удаление товара из избранного
  window.removeItem = (index) => {
    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    favs.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favs));
    renderFavorites();
    updateFavCount();
    fillMessageFromFavorites();
  };

  // рендер карточек товаров + расчёт итогов
  function renderFavorites() {
    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    list.innerHTML = '';

    if (favs.length === 0) {
      list.innerHTML           = '<p class="text-muted">Нет товаров в избранном.</p>';
      totalCountEl.textContent = '0';
      totalPriceEl.textContent = '0 ₽';
      fillMessageFromFavorites();
      return;
    }

    let totalUnits = 0;
    let totalSum   = 0;
    let totalQty   = 0;

    favs.forEach((item, i) => {
      const price      = Number(item.price);
      const pack       = Number(item.pack);
      const qty        = Number(item.qty) || 1;
      const color      = item.color;
      const totalItems = pack * qty;
      const totalCost  = price * totalItems;
      const dotsHTML = item.img.map((_, index) => `<span class="dot" onclick="showImage(${i}, ${index})"></span>`).join('');


      totalUnits += totalItems;
      totalSum   += totalCost;
      totalQty   += qty;

      const card = document.createElement('div');
      card.className = 'card mb-3 shadow-sm';
      card.innerHTML = `
        <div class="row g-0 align-items-center">
          <div class="col-5">
            <div class="fav-gallery">
              <img src="${item.img[0]}" class="fav-img p-2" alt="${item.title}">
              <button class="fav-prev">&#10094;</button>
              <button class="fav-next">&#10095;</button>
            </div>
            <div class="dots-container">${dotsHTML}</div>
          </div>
          <div class="col-5">
            <div class="card-body py-2">
              <h6 class="fs-5"><strong>${item.title}<small class="text-muted">  (арт. ${item.art})</small><br></strong></h6>
              
              <small class="text-muted">Упаковка: ${pack}</small><br>
              <small class="text-muted">Цена за шт.: ${price} ₽</small><br>
              <small class="text-muted">Цвет: ${color}</small><br>
              <small class="text-dark fs-4"><strong>${totalCost.toLocaleString()} ₽</strong></small>
              <button class="btn-close" aria-label="Удалить" onclick="removeItem(${i})"></button>
              <div class="qty-controls">
                <button class="qty-btn" onclick="changeQty(${i}, -1)">–</button>
                <span class="qty-number">${qty}</span>
                <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
      list.appendChild(card);

      totalCountEl.textContent = totalQty;
      totalPriceEl.textContent = `${totalSum.toLocaleString()} ₽`;

      const galleryWrapper = document.createElement('div');
      galleryWrapper.className = 'fav-img-list';
      item.img.forEach(imgURL => {
        const imgTag = document.createElement('img');
        imgTag.src = imgURL;
        galleryWrapper.appendChild(imgTag);
      });
      card.querySelector('.fav-gallery').appendChild(galleryWrapper);

      let favImgIndex = 0;
      showFavoriteSlide(card, favImgIndex);

      card.querySelector('.fav-prev').addEventListener('click', () => {
        favImgIndex = (favImgIndex - 1 + item.img.length) % item.img.length;
        showFavoriteSlide(card, favImgIndex);
      });

      card.querySelector('.fav-next').addEventListener('click', () => {
        favImgIndex = (favImgIndex + 1) % item.img.length;
        showFavoriteSlide(card, favImgIndex);
      });

      let imgIndex = 0;
      const imgEl   = card.querySelector('img');
      const prevBtn = card.querySelector('.fav-prev');
      const nextBtn = card.querySelector('.fav-next');

      prevBtn.addEventListener('click', () => {
        imgIndex = (imgIndex - 1 + item.img.length) % item.img.length;
        imgEl.src = item.img[imgIndex];
      });

      nextBtn.addEventListener('click', () => {
        imgIndex = (imgIndex + 1) % item.img.length;
        imgEl.src = item.img[imgIndex];
      });
    });

    fillMessageFromFavorites();
    totalCountEl.textContent = totalQty;
    totalPriceEl.textContent = `${totalSum.toLocaleString()} ₽`;
  }

  // управление галерей
  function getMatchedImages(container) {
    return Array.from(container.querySelectorAll('.fav-img-list img'));
  }

  function showFavoriteSlide(cardEl, index) {
    const images = getMatchedImages(cardEl);
    const imageEl = cardEl.querySelector('.fav-img');
    if (!images.length || !imageEl) return;

    const currentImage = images[index % images.length];
    imageEl.src = currentImage.src;
    updateFavoriteDots(cardEl, images.length, index);
  }

  function updateFavoriteDots(cardEl, count, activeIndex) {
    const dotsContainer = cardEl.querySelector('.dots-container');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === activeIndex ? ' active' : '');
      dot.addEventListener('click', () => showFavoriteSlide(cardEl, i));
      dotsContainer.appendChild(dot);
    }
  }

  // заполнение поля "Хочу заказать" из избранного
  function fillMessageFromFavorites() {
    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!messageField) return;
    if (favs.length === 0) {
      messageField.value = '';
      return;
    }
    let totalSum = 0;
    const lines = favs.map(item => {
      const price = Number(item.price);
      const pack = Number(item.pack);
      const qty = Number(item.qty) || 1;
      const cost = qty * pack * price;
      totalSum += cost;
      return `• ${item.title} ${item.color} (арт. ${item.art}) — ${qty} уп. × ${pack} шт. = ${cost.toLocaleString()} ₽`;
    });
    messageField.value = `Хочу заказать:\n${lines.join('\n')}\n\nИтого: ${totalSum.toLocaleString()} ₽`;
  }

  // обновление текста в комментарии заказа
  function updateMessageFromTextarea() {
    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!messageField || favs.length === 0) return;
    const rawLines = messageField.value.split('\n');
    let totalSum = 0;
    let favIndex = 0;
    const out = [];
    const rx = /•\s*(.+?)\s*(?:—|-)\s*(\d+)\s*уп\..*?×\s*(\d+)\s*шт\./;
    for (let line of rawLines) {
      if (line.trim().startsWith('•') && favIndex < favs.length) {
        const m = rx.exec(line);
        if (m) {
          const title = m[1];
          const qty = +m[2];
          const packCnt = +m[3];
          const price = +favs[favIndex].price;
          const cost = qty * packCnt * price;
          totalSum += cost;
          line = `• ${title} — ${qty} уп. × ${packCnt} шт. = ${cost.toLocaleString()} ₽`;
        }
        favIndex++;
      }
      if (!line.startsWith('Итого:')) out.push(line);
    }
    out.push(`Итого: ${totalSum.toLocaleString()} ₽`);
    messageField.value = out.join('\n');
  }

  // обновление количества товаров в бейдже шапки
  function updateFavCount() {
    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    const badges = document.querySelectorAll('.favCount');
    badges.forEach(badge => {
      badge.textContent = favs.length;
    });
  }
  updateFavCount();

  // обработка отправки формы "Оформить заявку"
  const form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('Заявка успешно отправлена!');
      localStorage.removeItem('favorites');
      renderFavorites();
      updateFavCount();
      fillMessageFromFavorites();
    });
  }
});

// Меню "Бургер"
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.menu-toggle');
  const menu      = document.querySelector('.mobile-menu');

  function openMenu() {
    menu.classList.add('active');
    document.body.style.overflow = 'hidden';
    menu.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    menu.classList.remove('active');
    document.body.style.overflow = '';
    menu.setAttribute('aria-hidden', 'true');
  }

  function toggleMenu() {
    menu.classList.contains('active') ? closeMenu() : openMenu();
  }

  // Открытие/закрытие по бургеру
  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu();
  });

  // Закрытие при клике вне меню
  document.addEventListener('click', e => {
    if (
      menu.classList.contains('active') &&
      !menu.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Закрытие при ресайзе на десктоп
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) closeMenu();
  });

  // Закрытие при клике на любую ссылку внутри меню
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
});