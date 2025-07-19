// Устанавливает текущий год в футере
function setCurrentYear() {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
setCurrentYear();

// Меню "Бургер"
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');

  if (toggleBtn && menu) {
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

    toggleBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', e => {
      if (
        menu.classList.contains('active') &&
        !menu.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 992) closeMenu();
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });
  }
});

// Рассчитывает и вставляет цену упаковки в карточки
// function calculateTotalPrices() {
//   const cards = document.querySelectorAll('.product-card');
//   if (cards.length > 0) {
//     cards.forEach(card => {
//       const pack = parseFloat(card.dataset.pack?.replace(',', '.'));
//       const price = parseFloat(card.dataset.price?.replace(',', '.'));
//       if (isNaN(pack) || isNaN(price)) return;

//       const totalCost = Math.round(pack * price);
//       const priceEl = card.querySelector('.price');
//       if (priceEl) {
//         priceEl.textContent = `${totalCost.toLocaleString()} ₽`;
//       }
//     });
//   }
// }
// calculateTotalPrices();

// фильтрует карточки товаров по категории и ключевому слову
function filterCards() {
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');
  const cards = document.querySelectorAll('.product-card');

  if (searchInput && categorySelect && cards.length > 0) {
    const text = searchInput.value.trim().toLowerCase();
    const cat = categorySelect.value;

    cards.forEach(card => {
      const title = card.dataset.title?.toLowerCase() || "";
      const art = card.dataset.art?.toLowerCase() || "";
      const category = card.dataset.category;
      const matchesText = title.includes(text) || art.includes(text);
      const matchesCat = (cat === 'all') || (category === cat);
      card.style.display = (matchesText && matchesCat) ? '' : 'none';
    });
  }
}
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
if (searchInput) searchInput.addEventListener('input', filterCards);
if (categorySelect) categorySelect.addEventListener('change', filterCards);
filterCards();

document.addEventListener('DOMContentLoaded', () => {
  // модальное окно
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = modal.querySelector(".close");
  const prevBtn = modal.querySelector(".modal-prev");
  const nextBtn = modal.querySelector(".modal-next");

  let currentImages = [];
  let currentIndex = 0;

  // открыть модальное изображение
  function openModal(imagesArray, index) {
    currentImages = imagesArray;
    currentIndex = index % currentImages.length;
    modalImg.src = currentImages[currentIndex];
    modal.style.display = "flex";
    const showControls = currentImages.length > 1 && window.innerWidth > 767;
    prevBtn.style.display = showControls ? 'block' : 'none';
    nextBtn.style.display = showControls ? 'block' : 'none';
  }

  // закрыть модалку
  function closeModal() {
    modal.style.display = "none";
    currentImages = [];
    currentIndex = 0;
  }

  // следующий слайд модалки
  function showNext() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    modalImg.classList.remove('fade-in');
    modalImg.src = currentImages[currentIndex];
    requestAnimationFrame(() => modalImg.classList.add('fade-in'));
  }

  // предыдущий слайд модалки
  function showPrev() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    modalImg.classList.remove('fade-in');
    modalImg.src = currentImages[currentIndex];
    requestAnimationFrame(() => modalImg.classList.add('fade-in'));
  }

  closeBtn.addEventListener("click", closeModal);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  // свайпы для модалки
  let touchStartX = 0;
  modal.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
  modal.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX > 50) showPrev();
    if (deltaX < -50) showNext();
  });

  document.querySelectorAll('.product-card').forEach(card => {
    const volumeBtns = card.querySelectorAll('.btn-volume');
    const colorBtns = card.querySelectorAll('.btn-color');
    const priceElem = card.querySelector('.price');
    const skuElem = card.querySelector('.sku');
    const packElem = card.querySelector('.pack');
    const dotsContainer = card.querySelector('.dots-container');
    const galleryImgs = card.querySelectorAll('.gallery-img');
    let currentSlide = 0;
    let selectedVolumeArt = null;
    let selectedColor = null;

    // обновить цену, артикул, упаковку
    function updateInfo(btn) {
      skuElem.textContent = `Артикул: ${btn.dataset.art}`;
      packElem.textContent = `Упаковка: ${btn.dataset.pack} шт.`;
      priceElem.textContent = `${btn.dataset.price} ₽`;
    }

    // получить отфильтрованные изображения
    function getFilteredImages() {
      return Array.from(galleryImgs).filter(div => div.classList.contains('color-match'));
    }

    // фильтровать и отобразить галерею
    function updateGallery() {
      const mode = card.dataset.galleryMode || 'both';

      const pool = Array.from(galleryImgs).filter(div => {
        const img = div.querySelector('img');
        const matchColor = selectedColor ? img.getAttribute('img-color') === selectedColor : true;
        const matchArt = selectedVolumeArt ? div.dataset.art === selectedVolumeArt : true;
        if (mode === 'both') return matchColor && matchArt;
        if (mode === 'color') return matchColor;
        return matchArt;
      });

      galleryImgs.forEach(div => {
        div.classList.remove('color-match', 'visible');
        div.style.display = 'none';
      });

      pool.forEach(div => {
        div.classList.add('color-match');
        div.style.display = 'none';
      });

      currentSlide = 0;
      showSlide(currentSlide);
    }

    // показать конкретный слайд
    function showSlide(index) {
      const filteredImages = getFilteredImages();
      if (!filteredImages.length) return;

      currentSlide = (index + filteredImages.length) % filteredImages.length;

      filteredImages.forEach((div, i) => {
        div.classList.toggle('visible', i === currentSlide);
        div.style.display = i === currentSlide ? '' : 'none';
      });

      updateDots(filteredImages.length, currentSlide);
    }

    // отрисовать точки
    function updateDots(count, activeIndex) {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === activeIndex ? ' active' : '');
        dot.addEventListener('click', () => showSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    // выбор объёма
    volumeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        volumeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedVolumeArt = btn.dataset.art;
        updateInfo(btn);
        updateGallery();
      });
    });

    // выбор цвета
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedColor = btn.dataset.color;
        updateGallery();
      });
    });

    // начальные значения
    const initVol = card.querySelector('.btn-volume.active') || volumeBtns[0];
    const initCol = card.querySelector('.btn-color.active') || colorBtns[0];

    if (initVol) {
      selectedVolumeArt = initVol.dataset.art;
      updateInfo(initVol);
    }
    if (initCol) {
      selectedColor = initCol.dataset.color;
    }
    updateGallery();

    // стрелки галереи
    card.querySelector('.prev')?.addEventListener('click', () => showSlide(currentSlide - 1));
    card.querySelector('.next')?.addEventListener('click', () => showSlide(currentSlide + 1));

    // свайпы для галереи
    let touchStartXGallery = 0;
    card.querySelector('.gallery-container').addEventListener('touchstart', e => touchStartXGallery = e.touches[0].clientX);
    card.querySelector('.gallery-container').addEventListener('touchend', e => {
      const deltaX = e.changedTouches[0].clientX - touchStartXGallery;
      if (deltaX > 50) showSlide(currentSlide - 1);
      if (deltaX < -50) showSlide(currentSlide + 1);
    });

    // клик по картинке → открыть модалку
    galleryImgs.forEach((div, i) => {
      div.querySelector('img').addEventListener('click', () => {
        const filteredImages = getFilteredImages();
        const index = filteredImages.indexOf(div);
        if (index !== -1) {
          const imagesArray = filteredImages.map(d => d.querySelector('img').src);
          openModal(imagesArray, index);
        }
      });
    });
  });
});

// логика кнопки "В избранное"
function setupFavoriteButtons() {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  document.querySelectorAll('.btn-fav').forEach(btn => {
    const card = btn.closest('.product-card');
    const hasVolume = !!card.querySelector('.btn-volume');
    const hasColor = !!card.querySelector('.btn-color');

    if (!card) return;

    const title = card.dataset.title;
    if (!title) {
      console.error('Missing dataset title on product card');
      return;
    }

    function getSelectedData() {
      const selectedVolume = card.querySelector('.btn-volume.active');
      const selectedColor = card.querySelector('.btn-color.active');
      if ((hasVolume && !selectedVolume) || (hasColor && !selectedColor)) return null;
      return {
        art: selectedVolume?.dataset.art || card.dataset.art || '',
        color: selectedColor?.dataset.color || card.dataset.color || '',
        pack: parseFloat(selectedVolume?.dataset.pack?.replace(',', '.') || card.dataset.pack || '0'),
        price: parseFloat(selectedVolume?.dataset.price?.replace(',', '.') || card.dataset.price || '0'),
        volume: selectedVolume?.dataset.volume || card.dataset.volume || ''
      };
    }

    function getMatchedImages(color) {
      const imageDivs = card.querySelectorAll('.gallery-img');
      return Array.from(imageDivs)
        .map(div => div.querySelector('img'))
        .filter(img => img?.getAttribute('img-color') === color)
        .map(img => img?.src)
        .filter(src => src);
    }

    function isFavorite() {
      const data = getSelectedData();
      if (!data) return false;
      return favorites.some(x =>
        x.title === title &&
        x.art === data.art &&
        x.color === data.color &&
        x.pack === data.pack
      );
    }

    function updateFavButton() {
      const data = getSelectedData();
      if (!data) {
        btn.innerHTML = '<i class="bi bi-star"></i> В избранное';
        btn.classList.replace('btn-warning', 'btn-primary');
        return;
      }
      if (isFavorite()) {
        btn.innerHTML = '<i class="bi bi-star-fill"></i> В избранном';
        btn.classList.replace('btn-primary', 'btn-warning');
      } else {
        btn.innerHTML = '<i class="bi bi-star"></i> В избранное';
        btn.classList.replace('btn-warning', 'btn-primary');
      }
    }

    updateFavButton();
    
    btn.addEventListener('click', () => {
      const data = getSelectedData();
      if (!data) {
        const message =
          hasVolume && hasColor ? 'Пожалуйста, выберите объем и цвет товара.' :
          hasVolume ? 'Пожалуйста, выберите объем товара.' :
          hasColor ? 'Пожалуйста, выберите цвет товара.' :
          'Данные товара недоступны.';
        alert(message);
        return;
      }

      const matchedImages = getMatchedImages(data.color);
      if (!matchedImages.length) {
        alert(`Изображения для цвета "${data.color}" отсутствуют.`);
        return;
      }

      if (isFavorite()) {
        window.location.href = 'favorites.html';
      } else {
        favorites.push({
          title,
          art: data.art,
          img: matchedImages,
          pack: data.pack,
          price: data.price,
          color: data.color,
          volume: data.volume,
          qty: 1
        });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavButton();
        if (typeof updateFavCount === 'function') updateFavCount();
      }
    });

    card.querySelectorAll('.btn-volume, .btn-color').forEach(optionBtn => {
      optionBtn.addEventListener('click', () => {
        setTimeout(updateFavButton, 0);
      });
    });
  });
}

setupFavoriteButtons();

// обновление счётчика в шапке
function updateFavCount() {
  const favs  = JSON.parse(localStorage.getItem('favorites')) || [];
  document.querySelectorAll('.favCount')
    .forEach(b => b.textContent = favs.length);
  }
updateFavCount();

