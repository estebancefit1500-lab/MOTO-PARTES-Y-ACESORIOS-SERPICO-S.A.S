# 🏍️ Moto Partes y Accesorios Serpico S.A.S — Sitio Web

Plataforma web PWA para el catálogo de repuestos y accesorios Kawasaki. Desarrollada con HTML5, CSS3 Vanilla y JavaScript puro. Backend: Supabase.

---

## 📁 Estructura del Proyecto

```
moto-partes-serpico/
├── index.html              ← Página pública del catálogo
├── admin.html              ← Panel de administración
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker
├── supabase-setup.sql      ← Script SQL para configurar Supabase
│
├── css/
│   ├── main.css            ← Design system completo (theme Kawasaki)
│   └── admin.css           ← Estilos del panel admin
│
├── js/
│   ├── config.js           ← ⚠️ CONFIGURA AQUÍ tus credenciales
│   ├── supabase.js         ← Cliente Supabase + utilidades
│   ├── banner.js           ← Carga del banner desde DB
│   ├── lightbox.js         ← Modal de zoom de imágenes
│   ├── cart.js             ← Carrito + checkout WhatsApp
│   ├── catalog.js          ← Catálogo, tabs, búsqueda
│   └── admin/
│       ├── auth.js         ← Login/logout Supabase Auth
│       ├── products.js     ← CRUD de productos
│       └── banners.js      ← Gestión del banner
│
├── assets/
│   ├── logo.jpg            ← Logo de la tienda (reemplaza con el original)
│   └── icons/
│       ├── icon-192.jpg    ← Ícono PWA 192×192
│       └── icon-512.jpg    ← Ícono PWA 512×512
│
└── .github/
    └── workflows/
        └── keep-alive.yml  ← Ping automático Supabase cada 3 días
```

---

## 🚀 Guía de Configuración Paso a Paso

### Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Haz clic en **"New Project"**
3. Ponle nombre: `serpico-motos` y elige región `South America (São Paulo)`
4. Anota la **Project URL** y la **anon public key** (las encontrarás en Settings → API)

### Paso 2: Configurar la base de datos

1. En Supabase → **SQL Editor** → **New Query**
2. Copia y pega todo el contenido de `supabase-setup.sql`
3. Haz clic en **Run**
4. Verifica que el output muestre las tablas creadas exitosamente

### Paso 3: Crear usuario administrador

1. En Supabase → **Authentication** → **Users** → **Add User**
2. Ingresa tu email y contraseña de administrador
3. Confirma el usuario

### Paso 4: Configurar las credenciales en el código

Abre `js/config.js` y reemplaza los valores:

```javascript
const SUPABASE_URL      = 'https://TU_PROYECTO.supabase.co';  // ← Reemplaza
const SUPABASE_ANON_KEY = 'TU_ANON_PUBLIC_KEY_AQUI';           // ← Reemplaza
```

### Paso 5: Reemplazar el logo (opcional)

Reemplaza `assets/logo.jpg` con tu logo original en formato cuadrado.
También actualiza `assets/icons/icon-192.jpg` y `assets/icons/icon-512.jpg`.

### Paso 6: Desplegar en Netlify (recomendado — gratis)

1. Ve a [netlify.com](https://netlify.com) y crea cuenta
2. **"Add new site"** → **"Deploy manually"**
3. Arrastra la carpeta `moto-partes-serpico/` completa al área de deploy
4. ¡Tu sitio estará en línea en segundos!

**O con GitHub + Netlify (auto-deploy):**
1. Sube el proyecto a un repositorio GitHub
2. En Netlify: "Import from Git" → selecciona el repo
3. Build settings: dejar en blanco (sitio estático)
4. Cada `git push` desplegará automáticamente

---

## ⚙️ Configurar GitHub Actions Keep-Alive

1. Sube el proyecto a GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Añade estos dos secrets:
   - `SUPABASE_URL` → tu URL del proyecto (ej: `https://abc123.supabase.co`)
   - `SUPABASE_ANON_KEY` → tu clave anon pública
4. El workflow se ejecutará automáticamente cada 3 días

Para ejecutarlo manualmente: **Actions** → **Supabase Keep-Alive** → **Run workflow**

---

## 📱 Instalar como App (PWA)

**En Android (Chrome):**
1. Abre tu sitio en Chrome
2. Toca el menú (⋮) → **"Añadir a pantalla de inicio"**
3. Confirma la instalación

**En iPhone (Safari):**
1. Abre tu sitio en Safari
2. Toca el botón de compartir → **"Añadir a pantalla de inicio"**

---

## 🗄️ Estructura de las Tablas

### `products`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único (auto-generado) |
| title | TEXT | Nombre del repuesto |
| description | TEXT | Descripción detallada |
| category | TEXT | `kawasaki-victor` / `kawasaki-klx150` / `accesorios-lujo` |
| image_url | TEXT | URL o ruta en Supabase Storage |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Última actualización |

### `banners`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| content | TEXT | Texto del banner (soporta emojis) |
| image_url | TEXT | Imagen de fondo (opcional) |
| is_active | BOOLEAN | Si se muestra en la tienda |
| updated_at | TIMESTAMPTZ | Última actualización |

---

## 📞 Soporte

- WhatsApp pedidos: **+57 311 304 6428** · **+57 300 810 8915**
- Ubicación: Itagüí, Antioquia, Colombia

---

*Desarrollado para Moto Partes y Accesorios Serpico S.A.S © 2025*
