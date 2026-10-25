/**
 * demo-products.js — Productos de ejemplo para la vista previa del catálogo
 * Se muestran SOLO en local y mientras Supabase no esté configurado
 * (ver STORE_PREVIEW en js/config.js). No se guardan en ninguna base de datos.
 */

const STORE_DEMO_PRODUCTS = [
  {
    id: 'demo-victor-1',
    title: 'Kit de arrastre Kawasaki Victor',
    description: 'Kit completo: piñón, catalina y cadena reforzada 428H. Acero de alta resistencia con relación original de fábrica. Incluye seguro de cadena.',
    category: 'kawasaki-victor',
    price: 145000,
    image_url: 'assets/demo/kit-arrastre.svg',
    created_at: '2026-10-18T15:20:00Z',
  },
  {
    id: 'demo-klx-1',
    title: 'Pastillas de freno delanteras KLX 150',
    description: '',
    category: 'kawasaki-klx150',
    price: 68000,
    image_url: 'assets/demo/pastillas-freno.svg',
    created_at: '2026-10-15T10:05:00Z',
  },
];
