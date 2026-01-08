import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CartItemCard } from '@/components/CartItemCard';
import { BottomNav } from '@/components/BottomNav';
import { useCart } from '@/hooks/useCart';

export default function Cart() {
  const { items, loading, updateQuantity, removeItem, getTotal, getTotalItems } = useCart();
  const navigate = useNavigate();
  const total = getTotal();
  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen bg-background pb-[220px]">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-card/95">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="RushCart" className="h-8 w-auto" />
              <div>
                <h1 className="font-bold text-foreground text-base">Your Cart</h1>
                <p className="text-xs text-muted-foreground">
                  {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? 's' : ''}` : 'Empty cart'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-foreground text-lg">₹{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 space-y-3 max-w-2xl mx-auto pb-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-32 animate-pulse bg-gradient-to-r from-muted to-muted/50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="pt-12">
            <Card className="p-12 text-center bg-gradient-to-br from-secondary/50 to-secondary/30 border-dashed border-2 rounded-2xl">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-xl mb-3">Your cart is empty</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                Start scanning products to add them to your cart and enjoy a seamless checkout experience
              </p>
              <Button 
                onClick={() => navigate('/scan')} 
                className="gradient-primary h-12 px-8 text-base font-semibold shadow-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Scanning
              </Button>
            </Card>
          </div>
        ) : (
          <>
            {/* Cart Summary Card */}
            <Card className="p-3 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-0 ring-1 ring-primary/20 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cart Summary</p>
                  <p className="text-2xl font-bold text-foreground">₹{total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total Items</p>
                  <p className="text-xl font-bold text-primary">{totalItems}</p>
                </div>
              </div>
            </Card>

            {/* Cart Items */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5 mb-2">
                <h2 className="font-semibold text-foreground text-sm">Your Items</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => items.forEach(item => removeItem(item.id))}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Checkout Footer */}
      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-lg">
          <div className="max-w-2xl mx-auto p-3">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Subtotal ({totalItems} items)</span>
                <span className="text-lg font-semibold text-foreground">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Taxes & fees</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <Button
              onClick={() => navigate('/checkout')}
              className="w-full h-14 gradient-accent text-lg font-bold shadow-fab hover:scale-[1.02] transition-transform"
            >
              Proceed to Checkout
              <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
