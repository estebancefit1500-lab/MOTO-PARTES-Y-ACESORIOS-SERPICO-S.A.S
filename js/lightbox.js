/**
 * lightbox.js — Modal de zoom de imágenes de productos
 * Moto Partes y Accesorios Serpico S.A.S
 */

const Lightbox = (function () {
  const lb        = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose   = document.getElementById('lightbox-close');

  if (!lb) return { open: () => {}, close: () => {} };

  /** Open the lightbox with a given image src and caption text */
  function open(src, caption = '') {
    lbImg.src = src;
    lbImg.alt = caption;
    lbCaption.textContent = caption;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  /** Close the lightbox */
  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Clear src after transition
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  // Close button
  lbClose.addEventListener('click', close);

  // Click on backdrop
  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });

  // Keyboard Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('open')) close();
  });

  return { open, close };
})();
