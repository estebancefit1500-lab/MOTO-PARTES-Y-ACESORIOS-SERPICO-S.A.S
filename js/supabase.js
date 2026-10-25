/**
 * supabase.js — Cliente Supabase + utilidades compartidas
 * Moto Partes y Accesorios Serpico S.A.S
 */

// Inicializar cliente Supabase (CDN: window.supabase)
const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   TOAST NOTIFICATIONS — compartidas entre index y admin
   ============================================================ */
function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', wa: '📱', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span>${icons[type] || '✅'}</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeInUp 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================================================
   CONFIRM DIALOG — admin only
   ============================================================ */
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirm-overlay');
    if (!overlay) { resolve(false); return; }

    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent   = message;
    overlay.classList.add('open');

    const ok     = document.getElementById('confirm-ok');
    const cancel = document.getElementById('confirm-cancel');

    function cleanup(result) {
      overlay.classList.remove('open');
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      resolve(result);
    }

    function onOk()     { cleanup(true); }
    function onCancel() { cleanup(false); }

    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    }, { once: true });
  });
}

/* ============================================================
   UTILITY — Format date
   ============================================================ */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ============================================================
   UTILITY — Debounce
   ============================================================ */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ============================================================
   UTILITY — Get public image URL from Supabase Storage
   ============================================================ */
function getImageUrl(path) {
  if (!path) return PLACEHOLDER_IMG;
  if (path.startsWith('http')) return path; // URL directa
  if (path.startsWith('assets/')) return path; // recurso local del proyecto
  const { data } = db.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || PLACEHOLDER_IMG;
}

/* ============================================================
   UTILITY — Category label helper
   ============================================================ */
function getCategoryInfo(key) {
  return CATEGORIES[key] || { label: key, emoji: '📦', badge: '' };
}
