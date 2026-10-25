/**
 * demo-data.js — Datos de ejemplo SOLO para la vista previa local del panel
 * Se carga únicamente en admin.html y se usa cuando ADMIN_PREVIEW es true.
 * No se guarda nada en Supabase.
 */

const ADMIN_DEMO_PRODUCTS = [
  {
    id: 'demo-1',
    title: 'Kit de arrastre Kawasaki Victor',
    description: 'Kit completo de arrastre (piñón, catalina y cadena reforzada) para Kawasaki Victor. Acero de alta resistencia y relación original de fábrica.',
    category: 'kawasaki-victor',
    price: 145000,
    image_url: null,
    created_at: '2026-10-18T15:20:00Z',
  },
  {
    id: 'demo-2',
    title: 'Pastillas de freno delanteras KLX 150',
    description: '',
    category: 'kawasaki-klx150',
    price: 68000,
    image_url: null,
    created_at: '2026-10-15T10:05:00Z',
  },
  {
    id: 'demo-3',
    title: 'Filtro de aire Kawasaki Victor',
    description: 'Filtro de alto flujo, lavable y reutilizable. Protege el motor y mejora la respiración sin modificaciones.',
    category: 'kawasaki-victor',
    price: 89000,
    image_url: null,
    created_at: '2026-10-11T08:40:00Z',
  },
  {
    id: 'demo-4',
    title: 'Bujía NGK Iridium KLX 150',
    description: 'Bujía NGK Iridium IX referencia CR8EIX. Arranque más fácil, mejor combustión y hasta 3 veces más duración.',
    category: 'kawasaki-klx150',
    price: 42000,
    image_url: null,
    created_at: '2026-10-06T17:10:00Z',
  },
  {
    id: 'demo-5',
    title: 'Manubrio deportivo aluminio 22mm',
    description: 'Manubrio en aluminio forjado, acabado anodizado negro. Reduce vibración y mejora el control. Compatible con Victor y KLX 150.',
    category: 'kawasaki-victor',
    price: 175000,
    image_url: null,
    created_at: '2026-09-28T12:00:00Z',
  },
];

const ADMIN_DEMO_BANNER = {
  id: 'demo-banner',
  content: '🏍️ ¡Bienvenido a Kawasaki Serpico Motos! Repuestos originales Kawasaki en Itagüí, Antioquia.',
  is_active: true,
  updated_at: '2026-10-20T09:00:00Z',
};
