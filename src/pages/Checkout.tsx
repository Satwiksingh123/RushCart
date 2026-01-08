import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', name: 'Card', icon: CreditCard, description: 'Credit or Debit Card' },
  { id: 'cash', name: 'Cash', icon: Banknote, description: 'Pay at exit counter' },
];

export default function Checkout() {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const total = getTotal();

  const handlePayment = async () => {
    if (!user) return;

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Create order
      const qrCodeData = {
        orderId: '',
        userId: user.id,
        paymentStatus: 'paid',
        timestamp: new Date().toISOString(),
        used: false,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          payment_status: 'paid',
          qr_code_data: qrCodeData,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Update QR code data with order ID
      qrCodeData.orderId = order.id;
      await supabase
        .from('orders')
        .update({ qr_code_data: qrCodeData })
        .eq('id', order.id);

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      setSuccess(true);

      // Navigate to bill after a short delay
      setTimeout(() => {
        navigate(`/bill/${order.id}`);
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-success flex items-center justify-center animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-success-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">Generating your bill...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-card/95">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="RushCart" className="h-8 w-auto" />
              <div>
                <h1 className="font-bold text-foreground text-base">Checkout</h1>
                <p className="text-xs text-muted-foreground">{items.length} items</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-foreground text-lg">₹{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 space-y-4 max-w-2xl mx-auto">
        {/* Order Summary */}
        <Card className="p-5 shadow-lg rounded-2xl border-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground text-lg">Order Summary</h2>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
              {items.length} items
            </span>
          </div>
          <div className="space-y-2.5 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start py-2 border-b border-dashed last:border-0">
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground block mb-1">
                    {item.product.name.slice(0, 35)}{item.product.name.length > 35 ? '...' : ''}
                  </span>
                  <span className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.product.price.toFixed(2)}</span>
                </div>
                <span className="font-semibold text-foreground ml-3">₹{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-foreground text-lg">Payment Method</h2>
            <span className="text-xs text-muted-foreground">Select one</span>
          </div>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            return (
              <Card
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  'p-5 cursor-pointer transition-all rounded-xl border-2',
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary shadow-lg scale-[1.02]'
                    : 'hover:bg-muted/50 hover:border-primary/30 hover:shadow-md'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center transition-all',
                      isSelected ? 'gradient-primary shadow-md' : 'bg-secondary'
                    )}
                  >
                    <Icon
                      className={cn('w-7 h-7', isSelected ? 'text-primary-foreground' : 'text-muted-foreground')}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-base">{method.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{method.description}</p>
                  </div>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    )}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paying with {paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
              <span className="font-bold text-foreground text-lg">₹{total.toFixed(2)}</span>
            </div>
          </div>
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full h-14 gradient-success text-lg font-bold shadow-fab hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Pay Now
                <span className="ml-2">→</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
