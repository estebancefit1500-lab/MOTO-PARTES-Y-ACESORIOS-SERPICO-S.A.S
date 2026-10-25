/**
 * auth.js — Autenticación de administrador con Supabase Auth
 * Moto Partes y Accesorios Serpico S.A.S
 */

(async function initAuth() {
  const authScreen = document.getElementById('auth-screen');
  const adminApp   = document.getElementById('admin-app');
  const loginForm  = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  const loginBtn   = document.getElementById('login-btn');
  const loginText  = document.getElementById('login-btn-text');
  const loginSpinner = document.getElementById('login-spinner');
  const loginError = document.getElementById('login-error');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const logoutBtn  = document.getElementById('logout-btn');

  /* ---- Vista previa local: entra sin Supabase (?preview=1 en localhost) ---- */
  if (typeof ADMIN_PREVIEW !== 'undefined' && ADMIN_PREVIEW) {
    const badge = document.querySelector('.admin-badge');
    if (badge) badge.textContent = 'Vista previa local';
    document.getElementById('logout-btn')?.remove();
    const authEl = document.getElementById('auth-screen');
    if (authEl) authEl.style.display = 'none';
    // Espera a que carguen products.js y banners.js antes de inicializar
    window.addEventListener('load', () => showAdminApp(), { once: true });
    return;
  }

  /* ---- Check existing session on page load ---- */
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    showAdminApp();
  } else {
    showAuthScreen();
  }

  /* ---- Listen for auth state changes ---- */
  db.auth.onAuthStateChange((_event, session) => {
    if (session) {
      showAdminApp();
    } else {
      showAuthScreen();
    }
  });

  /* ---- Login form submit ---- */
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    setLoading(true);

    const email    = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) {
      showError('Por favor completa todos los campos.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // onAuthStateChange will handle the redirect
    } catch (err) {
      showError(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : err.message || 'Error al iniciar sesión.'
      );
      setLoading(false);
    }
  });

  /* ---- Logout ---- */
  logoutBtn?.addEventListener('click', async () => {
    await db.auth.signOut();
    showToast('Sesión cerrada correctamente', 'info');
  });

  /* ---- UI helpers ---- */
  function showAdminApp() {
    if (authScreen) authScreen.style.display = 'none';
    if (adminApp)   adminApp.style.display   = 'flex';

    // Initialize admin modules (they check if their panel is active)
    if (typeof AdminProducts !== 'undefined') AdminProducts.init();
    if (typeof AdminBanners  !== 'undefined') AdminBanners.init();

    // Nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => switchPanel(tab.dataset.panel, tab));
    });
  }

  function showAuthScreen() {
    if (authScreen) authScreen.style.display = 'flex';
    if (adminApp)   adminApp.style.display   = 'none';
  }

  function setLoading(loading) {
    loginBtn.disabled = loading;
    loginText.style.display  = loading ? 'none' : 'inline';
    loginSpinner.style.display = loading ? 'inline-block' : 'none';
  }

  function showError(msg) {
    loginErrorMsg.textContent = msg;
    loginError.style.display = 'flex';
  }

  function hideError() {
    loginError.style.display = 'none';
  }

  /* ---- Panel switching ---- */
  function switchPanel(panelId, clickedTab) {
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    clickedTab.classList.add('active');

    // Update panels
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`panel-${panelId}`);
    if (panel) panel.classList.add('active');

    // Refresh data for the opened panel
    if (panelId === 'products' && typeof AdminProducts !== 'undefined') {
      AdminProducts.refresh();
    }
    if (panelId === 'banners' && typeof AdminBanners !== 'undefined') {
      AdminBanners.refresh();
    }
  }
})();
