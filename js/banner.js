/**
 * banner.js — Carga dinámica del banner de anuncios desde Supabase
 * Moto Partes y Accesorios Serpico S.A.S
 */

(async function initBanner() {
  const bannerEl   = document.getElementById('announcement-banner');
  const bannerText = document.getElementById('banner-text');
  const closeBtn   = document.getElementById('banner-close');

  if (!bannerEl) return;

  /** Tiempo visible del aviso de bienvenida: 2 minutos */
  const BANNER_DURATION_MS = 2 * 60 * 1000;
  let autoHideTimer = null;

  function hideBanner() {
    bannerEl.classList.add('hidden');
    sessionStorage.setItem('banner_dismissed', 'true');
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
  }

  // Check if user already dismissed the banner this session
  if (sessionStorage.getItem('banner_dismissed') === 'true') {
    bannerEl.classList.add('hidden');
    return;
  }

  // Close button
  closeBtn?.addEventListener('click', hideBanner);

  // Auto-hide after 2 minutes
  autoHideTimer = setTimeout(hideBanner, BANNER_DURATION_MS);

  // Fetch active banner from Supabase
  try {
    const { data, error } = await db
      .from('banners')
      .select('content, is_active')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return; // Keep default text

    if (data.content && bannerText) {
      bannerText.textContent = data.content;
    }
  } catch (_) {
    // Silently fail — default text stays visible
  }
})();
