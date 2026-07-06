import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Package, ShoppingBag, ArrowLeft, IndianRupee, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ImageBarcodeScanner } from '@/components/ImageBarcodeScanner';
import { ManualBarcodeInput } from '@/components/ManualBarcodeInput';
import { ProductCard } from '@/components/ProductCard';
import { BottomNav } from '@/components/BottomNav';
import { useCart, Product } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchFromOpenFoodFacts, ExternalProductInfo } from '@/lib/openFoodFacts';

// Persist a product discovered via Open Food Facts into our own products table
// (cart_items has an FK to products, so it must exist there before we can add
// it to the cart). Returns the stored product, or null if it couldn't be saved.
async function saveExternalProduct(
  info: ExternalProductInfo,
  price: number
): Promise<Product | null> {
  const mapRow = (row: any): Product => ({
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    weight: row.weight,
    price: Number(row.price),
    image_url: row.image_url,
    description: row.description ?? null,
  });

  const { data, error } = await supabase
    .from('products')
    .insert({
      barcode: info.barcode,
      name: info.name,
      weight: info.weight,
      image_url: info.image_url,
      price, // price entered by the user (Open Food Facts has no price data)
    })
    .select()
    .maybeSingle();

  if (!error && data) return mapRow(data);

  // Insert failed (likely a concurrent insert hit the unique barcode) —
  // fall back to reading whatever row now exists for this barcode.
  const { data: existing } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', info.barcode)
    .maybeSingle();

  return existing ? mapRow(existing) : null;
}

export default function Scan() {
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  // A product found online (Open Food Facts) that needs a price before it can
  // be added — drives the "set price" dialog.
  const [priceProduct, setPriceProduct] = useState<ExternalProductInfo | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
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
            description: data.description,
          };
          setLastScannedProduct(product);
          await addToCart(product);
        } else {
          // Not in our catalog — look the barcode up in Open Food Facts so that
          // any packaged product can still be scanned.
          const external = await fetchFromOpenFoodFacts(barcode);

          if (external) {
            // Found online, but Open Food Facts has no price — ask the user for
            // it. Once saved, future scans of this barcode load the price
            // automatically from our own DB.
            setPriceProduct(external);
            setPriceInput('');
            setLastScannedProduct(null);
          } else {
            toast({
              title: 'Product Not Found',
              description: `No product found with barcode: ${barcode}`,
              variant: 'destructive',
            });
            setLastScannedProduct(null);
          }
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

  // Save the price the user entered for a newly discovered product, then add it
  // to the cart.
  const confirmPrice = useCallback(async () => {
    if (!priceProduct) return;

    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price.',
        variant: 'destructive',
      });
      return;
    }

    setSavingPrice(true);
    try {
      const product = await saveExternalProduct(priceProduct, price);
      if (product) {
        setLastScannedProduct(product);
        await addToCart(product);
      } else {
        toast({
          title: 'Could Not Save Product',
          description: 'Failed to add. Check product write permissions in Supabase.',
          variant: 'destructive',
        });
      }
    } finally {
      setSavingPrice(false);
      setPriceProduct(null);
      setPriceInput('');
    }
  }, [priceProduct, priceInput, addToCart, toast]);

  const cartItem = lastScannedProduct
    ? items.find((item) => item.product_id === lastScannedProduct.id)
    : undefined;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-card/95">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-9 w-9 rounded-lg hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="RushCart" className="h-8 w-auto" />
                <div>
                  <h1 className="font-bold text-foreground text-base">Scan Products</h1>
                  <p className="text-xs text-muted-foreground">Quick checkout</p>
                </div>
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

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Quick Stats Banner */}
        {items.length > 0 && (
          <Card className="p-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items in Cart</p>
                  <p className="font-bold text-base text-foreground">{items.length}</p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/cart'}
                variant="outline" 
                size="sm"
                className="border-primary/30 hover:bg-primary/10 h-8 text-xs"
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
            className="w-full h-24 gradient-primary text-base font-semibold shadow-fab scan-pulse rounded-2xl hover:scale-[1.02] transition-transform"
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-8 h-8" />
              <span>Scan with Camera</span>
            </div>
          </Button>
        </div>

        {/* Alternative Scan Methods */}
        <div className="grid grid-cols-2 gap-3">
          {/* Image Upload */}
          <Card 
            className="p-4 shadow-card hover:shadow-lg transition-shadow border-2 hover:border-primary/30 flex flex-col items-center justify-center min-h-[120px] cursor-pointer active:scale-95"
          >
            <ImageBarcodeScanner onDetected={lookupProduct} />
          </Card>

          {/* Manual Input Card */}
          <Card 
            onClick={() => setShowManualInput(true)}
            className="p-4 shadow-card hover:shadow-lg transition-shadow border-2 hover:border-primary/30 flex flex-col items-center justify-center min-h-[120px] cursor-pointer active:scale-95"
          >
            <ManualBarcodeInput onSubmit={lookupProduct} loading={loading} compact />
          </Card>
        </div>

        {/* Last Scanned Product */}
        {lastScannedProduct && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Last Scanned</span>
              </div>
              {cartItem && (
                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
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
          <Card className="p-8 text-center bg-gradient-to-br from-secondary/50 to-secondary/30 border-dashed border-2">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-base mb-2">Ready to Scan</h3>
            <p className="text-muted-foreground text-xs max-w-xs mx-auto leading-relaxed">
              Scan barcode with camera, upload image, or enter manually
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

      {/* Manual Input Dialog */}
      <Dialog open={showManualInput} onOpenChange={setShowManualInput}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Barcode Entry</DialogTitle>
          </DialogHeader>
          <ManualBarcodeInput 
            onSubmit={(barcode) => {
              lookupProduct(barcode);
              setShowManualInput(false);
            }} 
            loading={loading} 
          />
        </DialogContent>
      </Dialog>

      {/* Set Price Dialog - shown for products discovered online */}
      <Dialog
        open={!!priceProduct}
        onOpenChange={(open) => {
          if (!open && !savingPrice) {
            setPriceProduct(null);
            setPriceInput('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Product Price</DialogTitle>
            <DialogDescription>
              Found online — enter its price once. Next time this barcode scans,
              the price loads automatically.
            </DialogDescription>
          </DialogHeader>

          {priceProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                {priceProduct.image_url ? (
                  <img
                    src={priceProduct.image_url}
                    alt={priceProduct.name}
                    className="w-14 h-14 rounded-md object-contain bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground line-clamp-2">
                    {priceProduct.name}
                  </p>
                  {priceProduct.weight && (
                    <p className="text-xs text-muted-foreground">{priceProduct.weight}</p>
                  )}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  confirmPrice();
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="h-12 text-lg font-mono pl-10 bg-background"
                    autoFocus
                    disabled={savingPrice}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold gradient-primary"
                  disabled={savingPrice || !priceInput.trim()}
                >
                  {savingPrice ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
