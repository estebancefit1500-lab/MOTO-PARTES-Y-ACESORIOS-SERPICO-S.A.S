/**
 * catalog.js — Catálogo de productos: carga, filtros por categoría, búsqueda en tiempo real
 * Moto Partes y Accesorios Serpico S.A.S
 */

(function initCatalog() {
  /* ---- DOM ---- */
  const grid        = document.getElementById('products-grid');
  const tabs        = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('product-search');
  const resultsInfo = document.getElementById('results-info');
  const header      = document.getElementById('main-header');

  /* ---- State ---- */
  let allProducts    = [];
  let activeCategory = 'kawasaki-victor'; // Default tab
  let searchQuery    = '';

  /* ---- Init ---- */
  async function init() {
    bindHeader();
    bindTabs();
    bindSearch();
    await fetchProducts();
  }

  /* ---- Sticky header shadow ---- */
  function bindHeader() {
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ---- Tab navigation ---- */
  function bindTabs() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeCategory = tab.dataset.cat;
        searchInput.value = '';
        searchQuery = '';
        renderProducts();
      });
    });
  }

  /* ---- Real-time search ---- */
  function bindSearch() {
    if (!searchInput) return;
    const doSearch = debounce((val) => {
      searchQuery = val.trim().toLowerCase();
      renderProducts();
    }, 250);
    searchInput.addEventListener('input', e => doSearch(e.target.value));
    searchInput.addEventListener('search', e => doSearch(e.target.value)); // clear button
  }

  /* ---- Fetch all products from Supabase ---- */
  async function fetchProducts() {
    // Modo demostración local (Supabase sin configurar)
    if (typeof STORE_PREVIEW !== 'undefined' && STORE_PREVIEW) {
      allProducts = typeof STORE_DEMO_PRODUCTS !== 'undefined' ? STORE_DEMO_PRODUCTS : [];
      renderProducts();
      return;
    }

    showSkeletons(6);

    try {
      const { data, error } = await db
        .from('products')
        .select('id, title, description, category, price, image_url, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      allProducts = data || [];
      renderProducts();
    } catch (err) {
      console.error('Error cargando productos:', err);
      showError();
    }
  }

  /* ---- Filter + Render products ---- */
  function renderProducts() {
    if (!grid) return;

    // Filter by category
    let filtered = allProducts.filter(p => p.category === activeCategory);

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => {
        const haystack = `${p.title} ${p.description || ''}`.toLowerCase();
        return haystack.includes(searchQuery);
      });
    }

    // Update results info
    updateResultsInfo(filtered.length, searchQuery);

    // Clear grid
    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-products" role="status">
          <div class="no-products-icon">${searchQuery ? '🔍' : '📦'}</div>
          <p>${searchQuery
            ? `Sin resultados para "<strong>${escHtml(searchQuery)}</strong>"`
            : 'No hay productos en esta categoría aún'
          }</p>
          <small>${searchQuery
            ? 'Intenta con otras palabras clave'
            : 'El administrador agregará productos próximamente'
          }</small>
        </div>
      `;
      return;
    }

    filtered.forEach((product, idx) => {
      const card = buildCard(product, idx);
      grid.appendChild(card);
    });

    // Sync cart button states after render
    Cart.updateButtonStates();
  }

  /* ---- Build product card DOM element ---- */
  function buildCard(product, idx) {
    const catInfo = getCategoryInfo(product.category);
    const imgSrc  = getImageUrl(product.image_url);
    const inCart  = Cart.isInCart(product.id);
    const price   = formatCOP(product.price);

    const div = document.createElement('article');
    div.className = 'product-card';
    div.style.animationDelay = `${idx * 0.05}s`;
    div.setAttribute('role', 'listitem');

    div.innerHTML = `
      <div class="card-img-wrap" title="Ver imagen ampliada">
        <img
          src="${imgSrc}"
          alt="${escHtml(product.title)}"
          loading="lazy"
          onerror="this.src='${PLACEHOLDER_IMG}'"
        />
        <span class="card-category-badge">${catIcon(product.category)} ${catInfo.label}</span>
        <div class="card-zoom-hint" aria-hidden="true">🔍</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escHtml(product.title)}</h3>
        <div class="card-price-row">
          ${price
            ? `<span class="card-price">${price}</span><span class="card-price-cur">COP</span>`
            : `<span class="card-price-empty">Precio a confirmar</span>`}
        </div>
        <button
          class="btn-add-cart${inCart ? ' in-cart' : ''}"
          data-id="${product.id}"
          aria-label="${inCart ? 'Quitar del pedido: ' : 'Añadir al pedido: '}${escHtml(product.title)}"
        >
          ${inCart ? '✓ En el pedido' : '🛒 Añadir al pedido'}
        </button>
      </div>
    `;

    // Lightbox on image click
    const imgWrap = div.querySelector('.card-img-wrap');
    imgWrap.addEventListener('click', () => {
      Lightbox.open(imgSrc, product.title);
    });

    // Add to cart button
    const cartBtn = div.querySelector('.btn-add-cart');
    cartBtn.addEventListener('click', () => {
      const added = Cart.addItem(product);
      cartBtn.classList.toggle('in-cart', !added ? false : true);
      // Re-check actual state
      const nowInCart = Cart.isInCart(product.id);
      cartBtn.classList.toggle('in-cart', nowInCart);
      cartBtn.textContent = nowInCart ? '✓ En el pedido' : '🛒 Añadir al pedido';
      cartBtn.setAttribute('aria-label',
        (nowInCart ? 'Quitar del pedido: ' : 'Añadir al pedido: ') + product.title
      );
    });

    return div;
  }

  /* ---- Results info text ---- */
  function updateResultsInfo(count, query) {
    if (!resultsInfo) return;
    if (!query) {
      const catInfo = getCategoryInfo(activeCategory);
      resultsInfo.innerHTML = `${catIcon(activeCategory)} <span>${count}</span> producto${count !== 1 ? 's' : ''} en ${catInfo.label}`;
    } else {
      resultsInfo.innerHTML = `🔍 <span>${count}</span> resultado${count !== 1 ? 's' : ''} para "<strong>${escHtml(query)}</strong>"`;
    }
  }

  /* ---- Skeleton loaders ---- */
  function showSkeletons(n) {
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < n; i++) {
      grid.innerHTML += `
        <div class="skeleton-card" aria-hidden="true">
          <div class="skel-img"></div>
          <div class="skel-body">
            <div class="skel-line w75"></div>
            <div class="skel-line w50"></div>
            <div class="skel-line" style="height:32px;border-radius:8px;margin-top:8px;"></div>
          </div>
        </div>
      `;
    }
  }

  /* ---- Error state ---- */
  function showError() {
    if (!grid) return;
    grid.innerHTML = `
      <div class="no-products" role="alert" style="grid-column:1/-1;">
        <div class="no-products-icon">⚠️</div>
        <p>No se pudieron cargar los productos</p>
        <small>Verifica tu conexión a internet</small>
      </div>
    `;
  }

  /* ---- Utility ---- */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Start
  init();
})();
