/**
 * config.js — Configuración global
 * Moto Partes y Accesorios Serpico S.A.S
 *
 * ⚠️ REEMPLAZA los valores con los de tu proyecto Supabase:
 *    → https://supabase.com → Tu proyecto → Settings → API
 */

const SUPABASE_URL     = 'https://vunoffzisepkyxfoobed.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wCGXE0Ye4VRSW7L_rMQVeA_mVOsf4hn';

/** Números de WhatsApp de la tienda (formato internacional, sin + ni espacios) */
const WHATSAPP_NUMBERS = [
  { number: '573113046428', label: '+57 311 304 6428' },
  { number: '573008108915', label: '+57 300 810 8915' },
];

/** Número principal (se usa en el botón flotante) */
const WHATSAPP_NUMBER = WHATSAPP_NUMBERS[0].number;

/** Nombre del bucket en Supabase Storage para imágenes */
const STORAGE_BUCKET = 'product-images';

/** Nombre de la tienda */
const STORE_NAME = 'Moto Partes y Accesorios Serpico S.A.S';

/** Categorías del catálogo */
const CATEGORIES = {
  'kawasaki-victor': {
    label: 'Repuestos Kawasaki Victor',
    emoji: '🏍️',
    badge: 'victor',
  },
  'kawasaki-klx150': {
    label: 'Repuestos Kawasaki KLX 150',
    emoji: '🏍️',
    badge: 'klx150',
  },
};

/**
 * Íconos SVG de cada categoría (motivos de moto).
 * Heredan el color del texto (currentColor).
 */
const CATEGORY_ICONS = {
  // Moto de calle / sport (Kawasaki Victor)
  'kawasaki-victor': `
    <svg class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true" focusable="false">
      <circle cx="5.6" cy="17.2" r="3.3"/>
      <circle cx="18.4" cy="17.2" r="3.3"/>
      <path d="M8.6 15.4 11.4 12.8 12 10.6 14.6 10.6 16 13 14.6 14.4 10.8 14.4"/>
      <path d="M16 13 18.4 17.2"/>
      <path d="M12.8 8.6 15.6 9.4"/>
      <path d="M14.2 9.2 12.6 10.6"/>
      <path d="M17 13.3q2.3-1.1 3.9.5"/>
      <path d="M6.8 15.2 10.8 14.4"/>
      <path d="M7.2 13.4 10.2 13.4"/>
    </svg>`,
  // Moto de enduro / trail (Kawasaki KLX 150)
  'kawasaki-klx150': `
    <svg class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true" focusable="false">
      <circle cx="5.6" cy="17.6" r="3.1"/>
      <circle cx="18.4" cy="17.6" r="3.1"/>
      <path d="M6.8 15.8 10.2 14.2 13.4 14.2"/>
      <path d="M13.6 13.6 18.4 17.6"/>
      <path d="M6.2 12.6 10.6 12.6 11.4 10.8 14 11 13.6 13.6 11.2 13.4"/>
      <path d="M12.4 8.6 15.2 9"/>
      <path d="M14.2 8.9 13.4 11"/>
      <path d="M15.4 10.4q2.2-1.6 4.2.2"/>
      <path d="M4.6 12q1.8-1.4 3.6 0"/>
      <path d="M11 14.4 11 16.2 13.4 16.2"/>
    </svg>`,
};

/**
 * Devuelve el ícono SVG de una categoría.
 * @param {string} key  clave de categoría (ej. 'kawasaki-victor')
 */
function catIcon(key) {
  return CATEGORY_ICONS[key] || '';
}

/** Placeholder image cuando no hay imagen del producto */
const PLACEHOLDER_IMG = 'assets/placeholder.jpg';

/* ============================================================
   PRECIOS EN PESOS COLOMBIANOS (COP)
   ============================================================ */
const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/**
 * Formatea un precio en pesos colombianos.
 * Devuelve '' cuando el producto no tiene precio válido.
 * Ej: 145000 → "$ 145.000"
 */
function formatCOP(value) {
  const n = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(n) || n <= 0) {
    return '';
  }
  return COP_FORMATTER.format(n);
}

/**
 * Modo vista previa del panel admin (solo en tu equipo).
 * Se activa únicamente en localhost/127.0.0.1 con ?preview=1
 * Ej: http://localhost:5173/admin.html?preview=1
 * En el sitio publicado NUNCA se activa.
 */
const ADMIN_PREVIEW =
  ['localhost', '127.0.0.1'].includes(location.hostname) &&
  new URLSearchParams(location.search).has('preview');

/**
 * Modo demostración del catálogo: muestra 2 repuestos de ejemplo
 * mientras Supabase siga con las credenciales de ejemplo.
 * Solo funciona en localhost/127.0.0.1, nunca en el sitio publicado.
 */
const STORE_PREVIEW =
  ['localhost', '127.0.0.1'].includes(location.hostname) &&
  SUPABASE_URL.includes('TU_PROYECTO');
