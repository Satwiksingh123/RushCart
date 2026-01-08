import { useState, useCallback } from 'react';
import { Camera, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ImageBarcodeScanner } from '@/components/ImageBarcodeScanner';
import { ManualBarcodeInput } from '@/components/ManualBarcodeInput';
import { ProductCard } from '@/components/ProductCard';
import { BottomNav } from '@/components/BottomNav';
import { useCart, Product } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Scan() {
  const [showCamera, setShowCamera] = useState(false);
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToCart, items } = useCart();
  const { toast } = useToast();

  const lookupProduct = useCallback(
    async (barcode: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('barcode', barcode)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const product: Product = {
            id: data.id,
            barcode: data.barcode,
            name: data.name,
            weight: data.weight,
            price: Number(data.price),
            image_url: data.image_url,
          };
          setLastScannedProduct(product);
          await addToCart(product);
        } else {
          toast({
            title: 'Product Not Found',
            description: `No product found with barcode: ${barcode}`,
            variant: 'destructive',
          });
          setLastScannedProduct(null);
        }
      } catch (error) {
        console.error('Error looking up product:', error);
        toast({
          title: 'Error',
          description: 'Failed to lookup product',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setShowCamera(false);
      }
    },
    [addToCart, toast]
  );

  const cartItem = lastScannedProduct
    ? items.find((item) => item.product_id === lastScannedProduct.id)
    : undefined;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-card/95">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="RushCart" className="h-8 w-auto" />
              <div>
                <h1 className="font-bold text-foreground text-base">Scan Products</h1>
                <p className="text-xs text-muted-foreground">Quick checkout</p>
              </div>
            </div>
            {items.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cart</p>
                <p className="font-bold text-primary text-sm">{items.length} items</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-3 space-y-4 max-w-2xl mx-auto">
        {/* Quick Stats Banner */}
        {items.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items in Cart</p>
                  <p className="font-bold text-lg text-foreground">{items.length}</p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/cart'}
                variant="outline" 
                size="sm"
                className="border-primary/30 hover:bg-primary/10"
              >
                View Cart
              </Button>
            </div>
          </Card>
        )}

        {/* Camera Scan Button - Enhanced */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl -z-10 rounded-3xl"></div>
          <Button
            onClick={() => setShowCamera(true)}
            size="lg"
            className="w-full h-28 gradient-primary text-lg font-semibold shadow-fab scan-pulse rounded-2xl hover:scale-[1.02] transition-transform"
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-10 h-10" />
              <span>Scan with Camera</span>
            </div>
          </Button>
        </div>

        {/* Alternative Scan Methods */}
        <div className="grid grid-cols-2 gap-3">
          {/* Image Upload */}
          <div className="relative">
            <ImageBarcodeScanner onDetected={lookupProduct} />
          </div>

          {/* Manual Input Card */}
          <Card className="p-4 shadow-card hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
            <ManualBarcodeInput onSubmit={lookupProduct} loading={loading} />
          </Card>
        </div>

        {/* Last Scanned Product */}
        {lastScannedProduct && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Last Scanned Product</span>
              </div>
              {cartItem && (
                <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-medium">
                  In Cart
                </span>
              )}
            </div>
            <ProductCard
              product={lastScannedProduct}
              onAddToCart={addToCart}
              isInCart={!!cartItem}
              quantity={cartItem?.quantity}
            />
          </div>
        )}

        {/* Empty state - Enhanced */}
        {!lastScannedProduct && (
          <Card className="p-10 text-center bg-gradient-to-br from-secondary/50 to-secondary/30 border-dashed border-2">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">Ready to Scan</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
              Start by scanning a barcode with your camera, uploading an image, or entering it manually
            </p>
          </Card>
        )}
      </div>

      {/* Camera Scanner Modal */}
      {showCamera && (
        <BarcodeScanner
          onDetected={lookupProduct}
          onClose={() => setShowCamera(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}
