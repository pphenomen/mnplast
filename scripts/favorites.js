document.addEventListener('DOMContentLoaded', () => {
  const list         = document.getElementById('favoritesList');
  const totalCountEl = document.getElementById('totalCount');
  const totalPriceEl = document.getElementById('totalPrice');

  // инициализация: рендер и бейдж
  updateFavCount();
  renderFavorites();

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

      totalUnits += totalItems;
      totalSum   += totalCost;
      totalQty   += qty;

      const card = document.createElement('div');
      card.className = 'card mb-3 shadow-sm';
      card.innerHTML = `
        <div class="row g-0 align-items-center">
          <div class="col-3">
            <div class="fav-gallery position-relative">
              <img src="${item.img[0]}" class="fav-img p-2" alt="${item.title}">
              <button class="fav-prev">&#10094;</button>
              <button class="fav-next">&#10095;</button>
            </div>
          </div>
          <div class="col-5">
            <div class="card-body py-2">
              <h6 class="mb-1">${item.title}</h6>
              <small class="text-muted">Артикул ${item.art}</small><br>
              <small class="text-muted">Штук в упаковке: ${pack}</small><br>
              <small class="text-muted">Цена за шт.: ${price} ₽</small><br>
              <small class="text-muted">Цвет: ${color}</small><br>
              <small class="text-dark fs-4"><strong>${totalCost.toLocaleString()} ₽</strong></small>
            </div>
          </div>
          <div class="col-2 d-flex align-items-center justify-content-center">
            <div class="qty-controls d-flex align-items-center gap-2">
              <button class="btn btn-close position-absolute top: 8px; right: 10px;"
                      aria-label="Удалить"
                      onclick="removeItem(${i})"></button>
              <div class="qty-controls d-flex align-items-center">
                <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
                <span class="qty-number">${qty}</span>
                <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
      list.appendChild(card);

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

  // заполнение поля “Хочу заказать…” из избранного
  function fillMessageFromFavorites() {
    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    const messageField = document.querySelector('#orderForm textarea');
    if (!messageField) return;

    if (favs.length === 0) {
      messageField.value = '';
      return;
    }

    let totalSum = 0;
    const lines = favs.map(item => {
      const { title, color, art, qty, pack, price } = item;
      const cost = qty * pack * price;
      totalSum += cost;
      return `• ${title} ${color} (арт. ${art}) — ${qty} уп. × ${pack} шт. = ${cost.toLocaleString()} ₽`;
    });

    messageField.value = `Хочу заказать:\n${lines.join('\n')}\n\nИтого: ${totalSum.toLocaleString()} ₽`;
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

  // обработка отправки формы “Оформить заявку”
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
