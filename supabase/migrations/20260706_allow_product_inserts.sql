-- Enable scanning of ANY product by letting the app auto-add products it
-- discovers via Open Food Facts. cart_items has an FK to products, so a scanned
-- product must exist in products before it can be added to the cart.
--
-- Run this in the Supabase SQL Editor.

-- Ensure the description column exists (idempotent; also added elsewhere)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;

-- Allow any authenticated user to insert a product.
-- (Products remain publicly viewable via the existing SELECT policy.)
DROP POLICY IF EXISTS "Authenticated users can add products" ON public.products;
CREATE POLICY "Authenticated users can add products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);
