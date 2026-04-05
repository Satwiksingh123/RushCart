-- Allow Guard app to read orders for verification (public SELECT)
-- This allows anyone with orderId to verify the order status

CREATE POLICY "Orders are publicly readable for verification"
ON public.orders FOR SELECT
USING (true);

-- Also allow public read on order_items for displaying order details
CREATE POLICY "Order items are publicly readable"
ON public.order_items FOR SELECT
USING (true);

-- Allow Guard app to update qr_used status
CREATE POLICY "Orders can be updated by anyone for QR verification"
ON public.orders FOR UPDATE
USING (true)
WITH CHECK (true);
