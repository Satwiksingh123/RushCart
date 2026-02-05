-- Add description column to products table if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- Add 3 demo products with barcodes for testing
-- Run this in Supabase SQL Editor

-- Insert Frooti
INSERT INTO products (barcode, name, price, weight, image_url, description)
VALUES (
  '8902579000370',
  'Frooti Mango Drink',
  10,
  '200ml',
  '/products/frootie.png',
  'Refreshing mango-flavoured drink made with real mango pulp.'
)
ON CONFLICT (barcode) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  weight = EXCLUDED.weight,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- Insert Oreo
INSERT INTO products (barcode, name, price, weight, image_url, description)
VALUES (
  '7622202225512',
  'Cadbury Oreo Original',
  10,
  '46.3g',
  '/products/oreodemo.png',
  'Chocolate-flavoured sandwich biscuits filled with smooth vanilla cream.'
)
ON CONFLICT (barcode) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  weight = EXCLUDED.weight,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- Insert TakaTak
INSERT INTO products (barcode, name, price, weight, image_url, description)
VALUES (
  '8904063220431',
  'Haldiram''s TakaTak Chatpata Masala',
  10,
  '40g',
  '/products/takatak.png',
  'Crispy and spicy Indian masala snack with bold flavours.'
)
ON CONFLICT (barcode) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  weight = EXCLUDED.weight,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- Verify products were added
SELECT * FROM products WHERE barcode IN ('8902579000370', '7622202225512', '8904063220431');
