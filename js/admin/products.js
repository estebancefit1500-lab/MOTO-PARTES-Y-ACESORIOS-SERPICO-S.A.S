/**
 * products.js — CRUD de productos en el Panel de Administración
 * Moto Partes y Accesorios Serpico S.A.S
 */

const AdminProducts = (function () {
  /* ---- DOM ---- */
  const list          = document.getElementById('products-list');
  const shownCount    = document.getElementById('products-shown-count');
  const searchInput   = document.getElementById('admin-product-search');
  const btnNew        = document.getElementById('btn-new-product');
  const formCard      = document.getElementById('product-form-card');
  const formCardTitle = document.getElementById('form-card-title');
  const form          = document.getElementById('product-form');
  const btnCancelForm  = document.getElementById('btn-cancel-form');
  const btnCancelForm2 = document.getElementById('btn-cancel-form-2');

  // Form fields
  const fieldId      = document.getElementById('product-id');
  const fieldTitle   = document.getElementById('product-title');
  const fieldCat     = document.getElementById('product-category');
  const fieldPrice   = document.getElementById('product-price');
  const pricePreview = document.getElementById('price-preview');
  const fieldDesc    = document.getElementById('product-description');
  const fieldImgUrl  = document.getElementById('product-image-url');
  const fieldImgFile = document.getElementById('product-image-file');
  const imgPreview   = document.getElementById('img-preview');
  const uploadArea   = document.getElementById('img-upload-area');
  const uploadIcon   = document.getElementById('upload-icon');
  const uploadText   = document.getElementById('upload-text');
  const uploadProgress    = document.getElementById('upload-progress');
  const uploadProgressBar = document.getElementById('upload-progress-bar');
  const descChars         = document.getElementById('desc-chars');
  const submitBtn         = document.getElementById('product-submit-btn');
  const submitText        = document.getElementById('submit-btn-text');
  const submitSpinner     = document.getElementById('submit-spinner');

  /* ---- State ---- */
  let products    = [];
  let editingId   = null;
  let initialized = false;

  /* ---- Init ---- */
  function init() {
    if (initialized) return;
    initialized = true;
    bindEvents();
    loadProducts();
  }

  /* ---- Refresh ---- */
  function refresh() { loadProducts(); }

  /* ---- Bind Events ---- */
  function bindEvents() {
    btnNew?.addEventListener('click', openCreateForm);
    btnCancelForm?.addEventListener('click', closeForm);
    btnCancelForm2?.addEventListener('click', closeForm);
    form?.addEventListener('submit', handleSubmit);

    // Real-time search
    const doSearch = debounce((val) => renderList(val.trim().toLowerCase()), 250);
    searchInput?.addEventListener('input', e => doSearch(e.target.value));

    // Image file preview
    fieldImgFile?.addEventListener('change', handleFileSelect);

    // Drag & drop
    uploadArea?.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        previewFile(file);
        // Assign to file input (approximate)
        const dt = new DataTransfer();
        dt.items.add(file);
        fieldImgFile.files = dt.files;
      }
    });

    // Image URL input preview
    fieldImgUrl?.addEventListener('input', debounce(() => {
      const url = fieldImgUrl.value.trim();
      if (url) previewUrl(url);
    }, 500));

    // Char counter for description
    fieldDesc?.addEventListener('input', () => {
      if (descChars) descChars.textContent = fieldDesc.value.length;
    });

    // Price preview in COP
    fieldPrice?.addEventListener('input', updatePricePreview);
  }

  /* ---- Load products from Supabase ---- */
  async function loadProducts() {
    if (!list) return;

    // Modo vista previa local (sin Supabase)
    if (typeof ADMIN_PREVIEW !== 'undefined' && ADMIN_PREVIEW) {
      products = typeof ADMIN_DEMO_PRODUCTS !== 'undefined'
        ? ADMIN_DEMO_PRODUCTS.slice()
        : [];
      renderList('');
      return;
    }

    list.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span>Cargando productos...</span>
      </div>
    `;

    try {
      const { data, error } = await db
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      products = data || [];
      renderList('');
    } catch (err) {
      list.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">⚠️</div>
          <p>Error al cargar productos: ${err.message}</p>
        </div>
      `;
    }
  }

  /* ---- Render products list ---- */
  function renderList(query = '') {
    if (!list) return;

    const filtered = query
      ? products.filter(p => `${p.title} ${p.description || ''}`.toLowerCase().includes(query))
      : products;

    if (shownCount) shownCount.textContent = filtered.length;
    list.innerHTML = '';

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">${query ? '🔍' : '📦'}</div>
          <p>${query ? `Sin resultados para "${escHtml(query)}"` : 'No hay productos aún. ¡Crea el primero!'}</p>
        </div>
      `;
      return;
    }

    filtered.forEach(product => {
      const catInfo = getCategoryInfo(product.category);
      const imgSrc  = getImageUrl(product.image_url);
      const price   = formatCOP(product.price);

      const row = document.createElement('div');
      row.className = 'product-row';
      row.setAttribute('role', 'listitem');
      row.innerHTML = `
        <img
          class="product-row-img"
          src="${imgSrc}"
          alt="${escHtml(product.title)}"
          loading="lazy"
          onerror="this.src='${PLACEHOLDER_IMG}'"
        />
        <div class="product-row-info">
          <div class="product-row-title">${escHtml(product.title)}</div>
          <div class="product-row-price${price ? '' : ' pending'}">${price || 'Precio a confirmar'}</div>
          <div class="product-row-meta">
            <span class="cat-badge ${catInfo.badge}">
              ${catIcon(product.category)} ${catInfo.label}
            </span>
            <span class="product-row-date">${formatDate(product.created_at)}</span>
          </div>
        </div>
        <div class="product-row-actions">
          <button
            class="btn-icon btn-edit"
            data-id="${product.id}"
            aria-label="Editar ${escHtml(product.title)}"
            title="Editar"
          >✏️</button>
          <button
            class="btn-icon btn-del"
            data-id="${product.id}"
            data-title="${escHtml(product.title)}"
            aria-label="Eliminar ${escHtml(product.title)}"
            title="Eliminar"
          >🗑️</button>
        </div>
      `;

      // Edit button
      row.querySelector('.btn-edit').addEventListener('click', () => openEditForm(product));
      // Delete button
      row.querySelector('.btn-del').addEventListener('click', () => handleDelete(product));

      list.appendChild(row);
    });
  }

  /* ---- Open Create Form ---- */
  function openCreateForm() {
    editingId = null;
    form?.reset();
    resetImagePreview();
    if (fieldId)   fieldId.value   = '';
    if (descChars) descChars.textContent = '0';
    updatePricePreview();
    if (formCardTitle) formCardTitle.textContent = 'Nuevo Producto';
    if (submitText)    submitText.textContent    = '💾 Guardar Producto';
    formCard?.classList.add('visible');
    formCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fieldTitle?.focus();
  }

  /* ---- Open Edit Form ---- */
  function openEditForm(product) {
    editingId = product.id;
    if (fieldId)    fieldId.value    = product.id;
    if (fieldTitle) fieldTitle.value = product.title;
    if (fieldCat)   fieldCat.value   = product.category;
    if (fieldPrice) {
      fieldPrice.value = product.price !== null && product.price !== undefined ? product.price : '';
      updatePricePreview();
    }
    if (fieldDesc) {
      fieldDesc.value = product.description || '';
      if (descChars) descChars.textContent = fieldDesc.value.length;
    }
    if (fieldImgUrl) fieldImgUrl.value = product.image_url || '';

    // Preview current image
    if (product.image_url) {
      previewUrl(getImageUrl(product.image_url));
    } else {
      resetImagePreview();
    }

    if (formCardTitle) formCardTitle.textContent = 'Editar Producto';
    if (submitText)    submitText.textContent    = '💾 Actualizar Producto';
    formCard?.classList.add('visible');
    formCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fieldTitle?.focus();
  }

  /* ---- Close Form ---- */
  function closeForm() {
    formCard?.classList.remove('visible');
    editingId = null;
    form?.reset();
    resetImagePreview();
    if (descChars) descChars.textContent = '0';
    updatePricePreview();
  }

  /* ---- Price preview (COP) ---- */
  function updatePricePreview() {
    if (!pricePreview) return;
    const formatted = formatCOP(fieldPrice?.value);
    pricePreview.textContent = formatted ? `Se verá: ${formatted}` : 'Se verá: —';
  }

  /* ---- Handle Form Submit (Create / Update) ---- */
  async function handleSubmit(e) {
    e.preventDefault();

    if (typeof ADMIN_PREVIEW !== 'undefined' && ADMIN_PREVIEW) {
      updatePricePreview();
      showToast('Vista previa: los cambios no se guardan', 'info');
      return;
    }

    const title    = fieldTitle?.value.trim();
    const category = fieldCat?.value;
    const priceRaw = fieldPrice?.value.trim();
    const desc     = fieldDesc?.value.trim();
    const imgUrl   = fieldImgUrl?.value.trim();

    if (!title || !category) {
      showToast('Completa el título y la categoría (*)', 'error');
      return;
    }

    const price = priceRaw === '' || priceRaw === null
      ? null
      : Number(priceRaw);

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      showToast('El precio debe ser un número válido en pesos', 'error');
      return;
    }

    setSubmitLoading(true);

    try {
      let finalImageUrl = imgUrl;

      // Upload file if selected
      if (fieldImgFile?.files.length > 0) {
        finalImageUrl = await uploadImage(fieldImgFile.files[0]);
      }

      const payload = {
        title,
        category,
        description: desc || null,
        price:       price,
        image_url:   finalImageUrl || null,
        updated_at:  new Date().toISOString(),
      };

      let error;

      if (editingId) {
        // UPDATE
        ({ error } = await db
          .from('products')
          .update(payload)
          .eq('id', editingId));
      } else {
        // CREATE
        ({ error } = await db
          .from('products')
          .insert([payload]));
      }

      if (error) throw error;

      showToast(editingId ? '✅ Producto actualizado' : '✅ Producto creado exitosamente');
      closeForm();
      await loadProducts();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmitLoading(false);
    }
  }

  /* ---- Handle Delete ---- */
  async function handleDelete(product) {
    if (typeof ADMIN_PREVIEW !== 'undefined' && ADMIN_PREVIEW) {
      showToast('Vista previa: los cambios no se guardan', 'info');
      return;
    }

    const confirmed = await showConfirm(
      '¿Eliminar producto?',
      `"${product.title}" será eliminado del catálogo. Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      const { error } = await db
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      // Also delete image from storage if it's a storage path
      if (product.image_url && !product.image_url.startsWith('http')) {
        await db.storage.from(STORAGE_BUCKET).remove([product.image_url]);
      }

      showToast('Producto eliminado correctamente', 'info');
      products = products.filter(p => p.id !== product.id);
      renderList(searchInput?.value.trim().toLowerCase() || '');
    } catch (err) {
      showToast(`Error al eliminar: ${err.message}`, 'error');
    }
  }

  /* ---- Upload Image to Supabase Storage ---- */
  async function uploadImage(file) {
    const ext  = file.name.split('.').pop();
    const name = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `products/${name}`;

    // Show progress
    if (uploadProgress) uploadProgress.classList.add('visible');
    if (uploadProgressBar) uploadProgressBar.style.width = '30%';

    const { error } = await db.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadProgressBar) uploadProgressBar.style.width = '100%';
    setTimeout(() => {
      if (uploadProgress) uploadProgress.classList.remove('visible');
      if (uploadProgressBar) uploadProgressBar.style.width = '0%';
    }, 600);

    if (error) throw new Error(`Error al subir imagen: ${error.message}`);
    return path;
  }

  /* ---- Image Preview Helpers ---- */
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen supera los 5MB permitidos', 'error');
      fieldImgFile.value = '';
      return;
    }
    previewFile(file);
  }

  function previewFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => previewUrl(e.target.result);
    reader.readAsDataURL(file);
    if (uploadIcon) uploadIcon.style.display = 'none';
    if (uploadText) uploadText.style.display = 'none';
  }

  function previewUrl(url) {
    if (!imgPreview) return;
    imgPreview.src = url;
    imgPreview.classList.add('visible');
    if (uploadIcon) uploadIcon.style.display = 'none';
    if (uploadText) uploadText.style.display = 'none';
  }

  function resetImagePreview() {
    if (imgPreview) {
      imgPreview.src = '';
      imgPreview.classList.remove('visible');
    }
    if (uploadIcon) uploadIcon.style.display = '';
    if (uploadText) uploadText.style.display = '';
    if (fieldImgFile) fieldImgFile.value = '';
  }

  /* ---- Submit Loading ---- */
  function setSubmitLoading(loading) {
    if (submitBtn) submitBtn.disabled = loading;
    if (submitText)    submitText.style.display    = loading ? 'none'         : 'inline';
    if (submitSpinner) submitSpinner.style.display = loading ? 'inline-block' : 'none';
  }

  /* ---- Utility ---- */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { init, refresh };
})();
