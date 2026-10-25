-- ============================================================
-- supabase-setup.sql
-- Moto Partes y Accesorios Serpico S.A.S
--
-- CÓMO USARLO:
--   1. Entra a https://supabase.com/dashboard
--   2. Abre tu proyecto → SQL Editor → New query
--   3. Pega TODO este archivo y pulsa "Run"
--
-- Es seguro ejecutarlo varias veces (no duplica datos ni falla).
-- ============================================================


-- ============================================================
-- 1. TABLA: products (repuestos)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL
                CHECK (category IN (
                  'kawasaki-victor',
                  'kawasaki-klx150'
                )),
  price       NUMERIC(12,2)
                CHECK (price IS NULL OR price >= 0),
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si ya tenías la tabla creada antes, agrega la columna de precio:
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(12,2)
  CHECK (price IS NULL OR price >= 0);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products (category);

CREATE INDEX IF NOT EXISTS idx_products_search
  ON products USING gin(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 2. TABLA: banners (aviso de bienvenida)
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT NOT NULL,
  image_url  TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_banners_updated_at ON banners;
CREATE TRIGGER trg_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Banner por defecto (solo si la tabla está vacía)
INSERT INTO banners (content, is_active)
SELECT
  '🏍️ ¡Bienvenido a Kawasaki Serpico Motos! Repuestos originales Kawasaki en Itagüí, Antioquia. ¡Escríbenos por WhatsApp!',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM banners);


-- ============================================================
-- 3. SEGURIDAD (RLS)
--    Lectura pública · escritura solo para el admin logueado
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON products;
CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "products_insert_auth" ON products;
CREATE POLICY "products_insert_auth"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "products_update_auth" ON products;
CREATE POLICY "products_update_auth"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "products_delete_auth" ON products;
CREATE POLICY "products_delete_auth"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "banners_select_public" ON banners;
CREATE POLICY "banners_select_public"
  ON banners FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "banners_insert_auth" ON banners;
CREATE POLICY "banners_insert_auth"
  ON banners FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "banners_update_auth" ON banners;
CREATE POLICY "banners_update_auth"
  ON banners FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "banners_delete_auth" ON banners;
CREATE POLICY "banners_delete_auth"
  ON banners FOR DELETE
  USING (auth.role() = 'authenticated');


-- ============================================================
-- 4. IMÁGENES (bucket "product-images")
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_product_images_select" ON storage.objects;
CREATE POLICY "storage_product_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "storage_product_images_insert" ON storage.objects;
CREATE POLICY "storage_product_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "storage_product_images_update" ON storage.objects;
CREATE POLICY "storage_product_images_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "storage_product_images_delete" ON storage.objects;
CREATE POLICY "storage_product_images_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );


-- ============================================================
-- 5. PRODUCTOS DE EJEMPLO (opcional)
--    Se insertan solo si la tabla está vacía.
--    Puedes borrarlos desde el panel admin.
-- ============================================================
INSERT INTO products (title, description, category, price, image_url)
SELECT * FROM (VALUES
  (
    'Kit de arrastre Kawasaki Victor',
    'Kit completo: piñón, catalina y cadena reforzada 428H. Acero de alta resistencia con relación original de fábrica. Incluye tornillería.',
    'kawasaki-victor',
    145000::NUMERIC,
    NULL::TEXT
  ),
  (
    'Pastillas de freno delanteras KLX 150',
    '',
    'kawasaki-klx150',
    68000::NUMERIC,
    NULL::TEXT
  ),
  (
    'Filtro de aire Kawasaki Victor',
    'Filtro de aire de alto flujo, lavable y reutilizable. Mejora el rendimiento y protege el motor.',
    'kawasaki-victor',
    89000::NUMERIC,
    NULL::TEXT
  ),
  (
    'Bujía NGK Iridium KLX 150',
    'Bujía NGK Iridium IX referencia CR8EIX. Arranque más fácil y mayor duración.',
    'kawasaki-klx150',
    42000::NUMERIC,
    NULL::TEXT
  )
) AS seed(title, description, category, price, image_url)
WHERE NOT EXISTS (SELECT 1 FROM products);


-- ============================================================
-- 6. VERIFICACIÓN
-- ============================================================
SELECT 'products' AS tabla, COUNT(*) AS registros FROM products
UNION ALL
SELECT 'banners'  AS tabla, COUNT(*) AS registros FROM banners
UNION ALL
SELECT 'bucket product-images' AS tabla,
       COUNT(*) AS registros FROM storage.buckets WHERE id = 'product-images';

-- Resultado esperado:
--   products             → 4
--   banners              → 1
--   bucket product-images → 1
