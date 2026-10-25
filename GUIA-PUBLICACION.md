# Guía de publicación — Moto Partes y Accesorios Serpico S.A.S

Todo lo que sigue se hace **una sola vez**. Al final tendrás:

- Tienda publicada en: `https://estebancefit1500-lab.github.io/MOTO-PARTES-Y-ACESORIOS-SERPICO-S.A.S/`
- Panel admin en: `https://estebancefit1500-lab.github.io/MOTO-PARTES-Y-ACESORIOS-SERPICO-S.A.S/admin.html`
- Base de datos en Supabase con productos, banner e imágenes.

---

## 1. Subir el proyecto a GitHub

El repositorio ya existe y está vacío:
`https://github.com/estebancefit1500-lab/MOTO-PARTES-Y-ACESORIOS-SERPICO-S.A.S`

**Opción A — desde este equipo (Git ya está instalado)**
Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd "C:\Users\Usuario\.gemini\antigravity\scratch\moto-partes-serpico"
git init
git branch -M main
git remote add origin https://github.com/estebancefit1500-lab/MOTO-PARTES-Y-ACESORIOS-SERPICO-S.A.S.git
git add .
git commit -m "Tienda Moto Partes Serpico"
git push -u origin main
```

La primera vez se abrirá una ventana del navegador para iniciar sesión con GitHub
(Credential Manager). Autoriza y la subida termina sola.

**Opción B — sin consola**
En la página del repositorio: *Add file → Upload files*, arrastra **el contenido**
de la carpeta (no la carpeta), y confirma con *Commit changes*.

> ⚠️ Sube el contenido de `moto-partes-serpico`, no la carpeta completa:
> `index.html` debe quedar en la raíz del repositorio.

---

## 2. Activar GitHub Pages

1. Entra al repositorio → **Settings** (arriba).
2. Menú izquierdo → **Pages**.
3. En *Build and deployment*:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` · carpeta `/ (root)`
4. Pulsa **Save**.
5. Espera 1–2 minutos y recarga: aparecerá el enlace publicado.

El archivo `.nojekyll` ya está incluido, así que GitHub no procesa el sitio con Jekyll.

**Cada vez que subas cambios** (git push o subir archivos), Pages se actualiza solo
en 1–2 minutos.

---

## 3. Crear el proyecto en Supabase

1. Entra a <https://supabase.com> → **Start your project** (o inicia sesión).
2. **New project**:
   - **Name**: `serpico-motos`
   - **Database Password**: crea una contraseña fuerte y **guárdala**.
   - **Region**: `South America (São Paulo)` (la más cercana a Colombia).
3. Espera ~2 minutos a que termine de crearse.

---

## 4. Crear la base de datos (código SQL)

1. En el panel del proyecto: **SQL Editor** → **New query**.
2. Abre el archivo `supabase-setup.sql` del proyecto, copia **todo** su contenido y pégalo.
3. Pulsa **Run** (o `Ctrl + Enter`).
4. Debe responder `Success` y mostrar la verificación:

   | tabla | registros |
   |---|---|
   | products | 4 |
   | banners | 1 |
   | bucket product-images | 1 |

Ese script crea:

- Tabla `products` (título, descripción, categoría, precio en COP, imagen).
- Tabla `banners` (aviso de bienvenida).
- Seguridad RLS: todos leen, **solo el admin logueado** crea/edita/borra.
- Bucket `product-images` para las fotos de los repuestos.
- 4 productos de ejemplo (los puedes borrar desde el panel).

> Se puede ejecutar varias veces sin romper nada ni duplicar datos.

---

## 5. Conectar la página con Supabase

1. En Supabase: **Settings** (engranaje) → **API**.
2. Copia estos dos datos:
   - **Project URL** → algo como `https://abcdefgh.supabase.co`
   - **anon public** (Project API keys) → una clave larga que empieza por `eyJ...`
3. Abre `js/config.js` y reemplaza las dos primeras líneas:

```js
const SUPABASE_URL      = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOi...tu_clave_anon...';
```

4. Guarda y vuelve a subir el cambio a GitHub.

> 🔒 La clave **anon** es pública y está diseñada para ir en el navegador (RLS la protege).
> **Nunca** pongas la clave `service_role` en el código: esa sí es secreta.

Cuando pongas las credenciales reales, los 2 productos de demostración
desaparecen solos y se ven los de Supabase.

---

## 6. Crear el usuario y la clave del admin

El panel **no tiene contraseña escrita en el código**: usa el login de Supabase Auth.
Por eso el usuario se crea una vez en Supabase:

1. Supabase → **Authentication** → **Users** → **Add user** → *Create new user*.
2. Llena:
   - **Email**: `admin@serpico.com`
   - **Password**: `Serpico2026*`
   - ✅ Marca **Auto Confirm User** (si no, el correo debe confirmarse).
3. **Create user**.

Con eso ya puedes entrar en:

```
https://estebancefit1500-lab.github.io/MOTO-PARTES-Y-ACESORIOS-SERPICO-S.A.S/admin.html
```

| Campo | Valor sugerido |
|---|---|
| Usuario (correo) | `admin@serpico.com` |
| Clave | `Serpico2026*` |

Recomendaciones:

- Cambia la clave por una tuya y guárdala en un lugar seguro.
- Puedes crear más usuarios admin repitiendo el paso 1.
- Para cerrar sesión: botón **Salir** dentro del panel.
- Si olvidas la clave: Authentication → Users → menú `⋮` → *Reset password*.

---

## 7. Mantener Supabase activo (opcional)

El plan gratuito pausa el proyecto tras ~7 días sin uso. Ya existe el workflow
`.github/workflows/keep-alive.yml`, que hace un ping cada 3 días.

1. GitHub → repositorio → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret**, dos veces:
   - `SUPABASE_URL` → `https://abcdefgh.supabase.co`
   - `SUPABASE_ANON_KEY` → tu clave anon
3. Ve a la pestaña **Actions** → *Supabase Keep-Alive* → **Run workflow** para probar.

---

## 8. Checklist final

- [ ] Repositorio con todos los archivos (`index.html` en la raíz).
- [ ] Pages activo en `main` / root.
- [ ] SQL ejecutado en Supabase sin errores.
- [ ] `SUPABASE_URL` y `SUPABASE_ANON_KEY` reales en `js/config.js`.
- [ ] Usuario admin creado y login funcionando.
- [ ] Productos cargados desde el panel (con precio en COP e imagen).
- [ ] Secreto del keep-alive agregado.

---

## Notas útiles

- **Precios**: se escriben sin puntos ni signos, ej. `145000` → se muestra `$ 145.000`.
- **Categorías**: solo existen *Repuestos Kawasaki Victor* y *Repuestos Kawasaki KLX 150*.
- **WhatsApp**: los pedidos llegan a ASESOR ESTEBAN (+57 311 304 6428) y
  ASESORA CAROLINA (+57 300 810 8915).
- **Caché**: el sitio usa service worker. Si tras publicar un cambio no lo ves,
  recarga con `Ctrl + F5`. Al modificar archivos conviene subir el número de
  `CACHE_VERSION` en `sw.js`.
