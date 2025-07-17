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

// карточка товара
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.product-card').forEach(function (card) {
    const volumeBtns = card.querySelectorAll('.btn-volume')
    const colorBtns = card.querySelectorAll('.btn-color')
    const images = card.querySelectorAll('.gallery-img')
    const priceElem = card.querySelector('.price')
    const skuElem = card.querySelector('.sku')
    const packElem = card.querySelector('.pack')
    const dotsContainer = card.querySelector('.dots-container')
    let currentSlide = 0

    function getColorMatchedImages() {
      return Array.from(images).filter(imgDiv => imgDiv.classList.contains('color-match'))
    }

    function showSlide(index) {
      const visibleImgs = getColorMatchedImages()
      if (visibleImgs.length === 0) return
      currentSlide = (index + visibleImgs.length) % visibleImgs.length
      visibleImgs.forEach((imgDiv, i) => {
        imgDiv.classList.toggle('visible', i === currentSlide)
      })
      updateDots(visibleImgs.length, currentSlide)
    }

    function updateDots(count, activeIndex) {
      if (!dotsContainer) return
      dotsContainer.innerHTML = ''
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span')
        dot.className = 'dot' + (i === activeIndex ? ' active' : '')
        dot.addEventListener('click', () => showSlide(i))
        dotsContainer.appendChild(dot)
      }
    }

    function updateGallery(selectedColor) {
      images.forEach((imgDiv) => {
        const img = imgDiv.querySelector('img')
        const isMatch = img?.getAttribute('img-color') === selectedColor
        imgDiv.classList.toggle('color-match', isMatch)
        imgDiv.classList.remove('visible')
      })
      currentSlide = 0
      showSlide(currentSlide)
    }

    function updateInfo(btn) {
      skuElem.textContent = `Артикул: ${btn.dataset.art}`
      packElem.textContent = `Упаковка: ${btn.dataset.pack} шт.`
      priceElem.textContent = `${btn.dataset.price} ₽`
    }

    volumeBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        volumeBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        updateInfo(btn)
      })
    })

    colorBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        colorBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        updateGallery(btn.dataset.color)
      })
    })

    const activeVolume = Array.from(volumeBtns).find(b => b.classList.contains('active')) || volumeBtns[0]
    if (activeVolume) updateInfo(activeVolume)

    const activeColor = Array.from(colorBtns).find(b => b.classList.contains('active')) || colorBtns[0]
    if (activeColor) updateGallery(activeColor.dataset.color)

    const prevBtn = card.querySelector('.prev')
    const nextBtn = card.querySelector('.next')
    if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1))
    if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1))
  })
})

// логика кнопки "В избранное"
function setupFavoriteButtons() {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  document.querySelectorAll('.btn-fav').forEach(btn => {
    const card = btn.closest('.product-card');
    if (!card) return;

    const title = card.dataset.title;
    if (!title) {
      console.error('Missing dataset title on product card');
      return;
    }

    function getSelectedData() {
      const selectedVolume = card.querySelector('.btn-volume.active');
      const selectedColor = card.querySelector('.btn-color.active');
      if (!selectedVolume || !selectedColor) return null;
      return {
        art: selectedVolume.dataset.art,
        color: selectedColor.dataset.color,
        pack: parseFloat(selectedVolume.dataset.pack?.replace(',', '.') || '0'),
        price: parseFloat(selectedVolume.dataset.price?.replace(',', '.') || '0')
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
        alert('Пожалуйста, выберите объем и цвет товара.');
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

// переключение изображений и модальное окно
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = modal.querySelector(".close");
  const prevBtn = modal.querySelector(".modal-prev");
  const nextBtn = modal.querySelector(".modal-next");

  let currentImages = [];
  let currentIndex = 0;

  function openModal(imagesArray, index, color) {
    currentImages = imagesArray.filter(img => {
      const imgElement = Array.from(document.querySelectorAll('.gallery-img img')).find(el => el.src.endsWith(img));
      return imgElement?.getAttribute('img-color') === color;
    });
    if (currentImages.length === 0) {
      alert(`Изображения для цвета "${color}" отсутствуют.`);
      return;
    }
    currentIndex = index % currentImages.length;
    modalImg.src = currentImages[currentIndex];
    modal.style.display = "flex";
    if (currentImages.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = window.innerWidth > 767 ? 'block' : 'none';
      nextBtn.style.display = window.innerWidth > 767 ? 'block' : 'none';
    }
  }

  function closeModal() {
    modal.style.display = "none";
    currentImages = [];
    currentIndex = 0;
  }

  function showNext() {
    if (currentImages.length === 0) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    modalImg.classList.remove('fade-in');
    modalImg.src = currentImages[currentIndex];
    requestAnimationFrame(() => modalImg.classList.add('fade-in'));
  }

  function showPrev() {
    if (currentImages.length === 0) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    modalImg.classList.remove('fade-in');
    modalImg.src = currentImages[currentIndex];
    requestAnimationFrame(() => modalImg.classList.add('fade-in'));
  }

  // Свайпы для модального окна
  let touchStartX = 0;
  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });
  modal.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (deltaX > 50) showPrev();
    if (deltaX < -50) showNext();
  });

  closeBtn.addEventListener("click", closeModal);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  document.querySelectorAll('.product-card').forEach(card => {
    let imgs;
    try {
      imgs = JSON.parse(card.dataset.img);
    } catch (e) {
      console.error(`Ошибка парсинга data-img для карточки с data-art="${card.dataset.art}":`, e);
      return;
    }
    if (imgs.length === 0) {
      console.warn(`Пустой массив изображений для карточки с data-art="${card.dataset.art}"`);
      return;
    }

    let currentSlide = 0;
    const galleryImgs = card.querySelectorAll('.gallery-img');
    const dots = card.querySelectorAll('.dot');
    const prev = card.querySelector('.prev');
    const next = card.querySelector('.next');

    if (imgs.length <= 1) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
    }

    function showSlide(index) {
      if (index >= galleryImgs.length) {
        currentSlide = 0;
      } else if (index < 0) {
        currentSlide = galleryImgs.length - 1;
      } else {
        currentSlide = index;
      }

      galleryImgs.forEach((div, i) => {
        div.classList.toggle('visible', i === currentSlide);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    // Инициализация слайда
    showSlide(currentSlide);

    // Обработчики для точек
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
      });
    });

    // Обработчики для стрелок
    if (prev && imgs.length > 1) {
      prev.addEventListener('click', () => {
        showSlide(currentSlide - 1);
      });
    }

    if (next && imgs.length > 1) {
      next.addEventListener('click', () => {
        showSlide(currentSlide + 1);
      });
    }

    // Свайпы для галереи
    let touchStartXGallery = 0;
    card.querySelector('.gallery-container').addEventListener('touchstart', (e) => {
      touchStartXGallery = e.touches[0].clientX;
    });
    card.querySelector('.gallery-container').addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartXGallery;
      if (deltaX > 50) showSlide(currentSlide - 1);
      if (deltaX < -50) showSlide(currentSlide + 1);
    });

    // Открытие модального окна
    card.querySelectorAll('.gallery-img img').forEach((img, i) => {
      img.addEventListener('click', () => {
        const selectedColor = card.querySelector('.btn-color.active')?.dataset.color || 'фиолетовый';
        openModal(imgs, i, selectedColor);
      });
    });
  });
});