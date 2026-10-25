/**
 * cart.js — Carrito de compras con persistencia localStorage + checkout WhatsApp
 * Moto Partes y Accesorios Serpico S.A.S
 */

const Cart = (function () {
  /* ---- DOM ---- */
  const overlay     = document.getElementById('cart-overlay');
  const drawer      = document.getElementById('cart-drawer');
  const cartToggle  = document.getElementById('cart-toggle');
  const cartClose   = document.getElementById('cart-close');
  const cartCount   = document.getElementById('cart-count');
  const headerCount = document.getElementById('cart-header-count');
  const totalCount  = document.getElementById('cart-total-count');
  const itemsList   = document.getElementById('cart-items-list');
  const emptyEl     = document.getElementById('cart-empty');
  const totalAmount = document.getElementById('cart-total-amount');
  const checkoutBtns = document.querySelectorAll('.btn-wa-option');
  const clearBtn    = document.getElementById('btn-clear-cart');

  /* ---- State ---- */
  let items = [];

  /* ---- Init ---- */
  function init() {
    load();
    render();
    bindEvents();
  }

  /* ---- Persistence ---- */
  function load() {
    try {
      const saved = localStorage.getItem('serpico_cart');
      items = saved ? JSON.parse(saved) : [];
    } catch (_) {
      items = [];
    }
  }

  function save() {
    localStorage.setItem('serpico_cart', JSON.stringify(items));
  }

  /* ---- Open / Close Drawer ---- */
  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    cartClose.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ---- Add / Remove ---- */
  function addItem(product) {
    const exists = items.find(i => i.id === product.id);
    if (exists) {
      // Already in cart — remove it (toggle)
      removeItem(product.id);
      return false;
    }
    items.push({
      id:          product.id,
      title:       product.title,
      description: product.description || '',
      category:    product.category,
      price:       Number(product.price) > 0 ? Number(product.price) : null,
      image_url:   product.image_url || '',
    });
    save();
    render();
    updateButtonStates();
    showToast(`"${product.title}" añadido al pedido 🛒`);
    return true;
  }

  function removeItem(id) {
    items = items.filter(i => i.id !== id);
    save();
    render();
    updateButtonStates();
    showToast('Producto eliminado del pedido', 'info');
  }

  function clearAll() {
    items = [];
    save();
    render();
    updateButtonStates();
  }

  function isInCart(id) {
    return items.some(i => i.id === id);
  }

  /* ---- Render ---- */
  function render() {
    const count = items.length;

    // Update badge
    cartCount.textContent = count;
    cartCount.classList.toggle('visible', count > 0);
    if (headerCount) headerCount.textContent = count;
    if (totalCount) totalCount.textContent = `${count} ítem${count !== 1 ? 's' : ''}`;

    // Amount total (COP)
    if (totalAmount) {
      const total = getTotal();
      const pending = items.filter(i => !hasPrice(i)).length;
      if (count === 0) {
        totalAmount.textContent = '—';
        totalAmount.classList.remove('pending');
      } else if (total > 0) {
        totalAmount.textContent = pending
          ? `${formatCOP(total)} + ${pending} por confirmar`
          : formatCOP(total);
        totalAmount.classList.remove('pending');
      } else {
        totalAmount.textContent = 'Por confirmar';
        totalAmount.classList.add('pending');
      }
    }

    // Checkout buttons
    checkoutBtns.forEach(btn => { btn.disabled = count === 0; });

    // Floating WhatsApp buttons: prefill the order message
    updateFloatingLinks();

    // Items list
    if (!itemsList) return;

    // Remove old item rows (keep empty state)
    const existingRows = itemsList.querySelectorAll('.cart-item');
    existingRows.forEach(r => r.remove());

    if (count === 0) {
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.setAttribute('role', 'listitem');
      div.dataset.id = item.id;

      const catInfo = getCategoryInfo(item.category);
      const price   = hasPrice(item) ? formatCOP(item.price) : '';

      div.innerHTML = `
        <img
          class="cart-item-img"
          src="${item.image_url || PLACEHOLDER_IMG}"
          alt="${escHtml(item.title)}"
          loading="lazy"
          onerror="this.src='${PLACEHOLDER_IMG}'"
        />
        <div class="cart-item-body">
          <div class="cart-item-title">${escHtml(item.title)}</div>
          <div class="cart-item-cat">${catIcon(item.category)} ${catInfo.label}</div>
          <div class="cart-item-price${price ? '' : ' pending'}">
            ${price || 'Precio a confirmar'}
          </div>
        </div>
        <button
          class="cart-item-remove"
          data-id="${item.id}"
          aria-label="Eliminar ${escHtml(item.title)} del pedido"
          title="Eliminar"
        >✕</button>
      `;

      itemsList.insertBefore(div, emptyEl);
    });
  }

  /* ---- WhatsApp Checkout ---- */
  function buildWhatsAppMessage() {
    // Agrupa los productos por categoría, numerados de forma continua
    const groups = [];
    items.forEach((item, i) => {
      let group = groups.find(g => g.key === item.category);
      if (!group) {
        group = { key: item.category, label: getCategoryInfo(item.category).label, rows: [] };
        groups.push(group);
      }
      const price = hasPrice(item) ? formatCOP(item.price) : 'Precio a confirmar';
      group.rows.push(`${i + 1}. ${item.title} - ${price}`);
    });

    const blocks = groups.map(g => [`* ${g.label}`, '', ...g.rows].join('\n'));

    const total     = getTotal();
    const pending   = items.filter(i => !hasPrice(i)).length;
    const totalLine = total > 0
      ? `Total: ${formatCOP(total)}${pending ? ` (+ ${pending} ítem${pending !== 1 ? 's' : ''} por confirmar)` : ''}`
      : 'Total: por confirmar';

    const msg = [
      `Pedido - ${STORE_NAME}`,
      '',
      blocks.join('\n\n'),
      '',
      `* Total de ítems: ${items.length}`,
      '',
      totalLine,
    ].join('\n');

    return encodeURIComponent(msg);
  }

  /* ---- Mensaje automático en los botones flotantes de WhatsApp ---- */
  function updateFloatingLinks() {
    document.querySelectorAll('.wa-fab-btn').forEach(link => {
      const match = (link.getAttribute('href') || '').match(/wa\.me\/(\d+)/);
      if (!match) return;
      const number = match[1];
      link.href = items.length > 0
        ? `https://wa.me/${number}?text=${buildWhatsAppMessage()}`
        : `https://wa.me/${number}`;
    });
  }

  function checkout(number) {
    if (items.length === 0) return;
    const target = number || WHATSAPP_NUMBER;
    const url = `https://wa.me/${target}?text=${buildWhatsAppMessage()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`Redirigiendo a WhatsApp ${waLabel(target)}... 📱`, 'wa');
  }

  function waLabel(number) {
    const found = (typeof WHATSAPP_NUMBERS !== 'undefined' ? WHATSAPP_NUMBERS : [])
      .find(w => w.number === number);
    return found ? found.label : '';
  }

  /* ---- Update product card buttons on page ---- */
  function updateButtonStates() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      const id = btn.dataset.id;
      if (!id) return;
      const inCart = isInCart(id);
      btn.classList.toggle('in-cart', inCart);
      btn.textContent = inCart ? '✓ En el pedido' : '🛒 Añadir al pedido';
    });
  }

  /* ---- Bind Events ---- */
  function bindEvents() {
    cartToggle?.addEventListener('click', openDrawer);
    cartClose?.addEventListener('click', closeDrawer);
    overlay?.addEventListener('click', closeDrawer);

    checkoutBtns.forEach(btn => {
      btn.addEventListener('click', () => checkout(btn.dataset.wa));
    });

    clearBtn?.addEventListener('click', () => {
      if (items.length === 0) return;
      clearAll();
    });

    // Delegated remove buttons inside drawer
    itemsList?.addEventListener('click', (e) => {
      const btn = e.target.closest('.cart-item-remove');
      if (btn) removeItem(btn.dataset.id);
    });

    // Keyboard escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer();
    });
  }

  /* ---- Helpers ---- */
  function hasPrice(item) {
    return item && Number(item.price) > 0;
  }

  function getTotal() {
    return items.reduce((sum, item) => sum + (hasPrice(item) ? Number(item.price) : 0), 0);
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  init();

  return { addItem, removeItem, isInCart, updateButtonStates };
})();
