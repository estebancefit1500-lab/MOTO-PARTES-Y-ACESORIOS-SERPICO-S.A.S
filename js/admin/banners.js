/**
 * banners.js — Gestión del Banner de Anuncios en el Panel de Administración
 * Moto Partes y Accesorios Serpico S.A.S
 */

const AdminBanners = (function () {
  /* ---- DOM ---- */
  const form            = document.getElementById('banner-form');
  const contentField    = document.getElementById('banner-content');
  const activeCheck     = document.getElementById('banner-active');
  const bannerIdField   = document.getElementById('banner-id');
  const previewText     = document.getElementById('banner-preview-text');
  const charCount       = document.getElementById('banner-chars');
  const submitBtn       = document.getElementById('banner-submit');
  const submitText      = document.getElementById('banner-submit-text');
  const submitSpinner   = document.getElementById('banner-spinner');

  let initialized = false;

  /* ---- Init ---- */
  function init() {
    if (initialized) return;
    initialized = true;
    bindEvents();
    loadBanner();
  }

  /* ---- Refresh ---- */
  function refresh() { loadBanner(); }

  /* ---- Bind Events ---- */
  function bindEvents() {
    // Live preview
    contentField?.addEventListener('input', () => {
      const val = contentField.value;
      if (charCount) charCount.textContent = val.length;
      if (previewText) previewText.textContent = val || 'Vista previa del banner aparecerá aquí...';
    });

    form?.addEventListener('submit', handleSubmit);
  }

  /* ---- Load existing banner from Supabase ---- */
  async function loadBanner() {
    // Modo vista previa local (sin Supabase)
    if (typeof ADMIN_PREVIEW !== 'undefined' && ADMIN_PREVIEW) {
      const data = typeof ADMIN_DEMO_BANNER !== 'undefined' ? ADMIN_DEMO_BANNER : null;
      if (data) {
        if (bannerIdField)   bannerIdField.value   = data.id;
        if (contentField)    contentField.value    = data.content;
        if (activeCheck)     activeCheck.checked   = data.is_active;
        if (charCount)       charCount.textContent = (data.content || '').length;
        if (previewText)     previewText.textContent = data.content || '';
      }
      return;
    }

    try {
      const { data, error } = await db
        .from('banners')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.warn('No se pudo cargar el banner:', error.message);
        return;
      }

      if (data) {
        if (bannerIdField)   bannerIdField.value   = data.id;
        if (contentField)    contentField.value    = data.content;
        if (activeCheck)     activeCheck.checked   = data.is_active;
        if (charCount)       charCount.textContent = (data.content || '').length;
        if (previewText)     previewText.textContent = data.content || '';
      }
    } catch (err) {
      console.warn('Error cargando banner:', err.message);
    }
  }

  /* ---- Handle form submit ---- */
  async function handleSubmit(e) {
    e.preventDefault();

    if (typeof ADMIN_PREVIEW !== 'undefined' && ADMIN_PREVIEW) {
      showToast('Vista previa: los cambios no se guardan', 'info');
      return;
    }

    const content  = contentField?.value.trim();
    const isActive = activeCheck?.checked ?? true;
    const existId  = bannerIdField?.value;

    if (!content) {
      showToast('El texto del banner no puede estar vacío', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        content,
        is_active:  isActive,
        updated_at: new Date().toISOString(),
      };

      let error;

      if (existId) {
        // UPDATE existing banner
        ({ error } = await db
          .from('banners')
          .update(payload)
          .eq('id', existId));
      } else {
        // CREATE new banner
        const { data, error: insertError } = await db
          .from('banners')
          .insert([payload])
          .select('id')
          .single();

        error = insertError;
        if (data && bannerIdField) bannerIdField.value = data.id;
      }

      if (error) throw error;

      showToast('✅ Banner guardado exitosamente');
    } catch (err) {
      showToast(`Error al guardar banner: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  /* ---- Loading state ---- */
  function setLoading(loading) {
    if (submitBtn) submitBtn.disabled = loading;
    if (submitText)    submitText.style.display    = loading ? 'none'         : 'inline';
    if (submitSpinner) submitSpinner.style.display = loading ? 'inline-block' : 'none';
  }

  return { init, refresh };
})();
