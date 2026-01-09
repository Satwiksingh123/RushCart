import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, CheckCircle2, ShieldCheck, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  products: {
    name: string;
    weight: string | null;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  total_amount: number;
  payment_status: string;
  qr_code_data: any;
  qr_used: boolean;
  created_at: string;
  order_items: OrderItem[];
}

export default function Bill() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            payment_status,
            qr_code_data,
            qr_used,
            created_at,
            order_items (
              id,
              quantity,
              price_at_purchase,
              products (
                name,
                weight,
                image_url
              )
            )
          `)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setOrder(data as unknown as Order);

        // Generate QR code
        if (data.qr_code_data) {
          const qrPayload = {
            orderId: data.id,
            userId: (data.qr_code_data as any)?.userId || '',
            paymentStatus: (data.qr_code_data as any)?.paymentStatus || 'paid',
            timestamp: (data.qr_code_data as any)?.timestamp || new Date().toISOString(),
            used: data.qr_used,
          };
          const qrData = JSON.stringify(qrPayload);
          const url = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
              dark: '#0d9488',
              light: '#ffffff',
            },
          });
          setQrCodeUrl(url);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading bill...</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const orderDate = new Date(order.created_at);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-success/10 border-b border-success/20 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/orders')}
                className="h-9 w-9 rounded-lg hover:bg-success/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="RushCart" className="h-8 w-auto" />
                <div>
                  <h1 className="font-bold text-success text-base flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Payment Success
                  </h1>
                  <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-success text-lg">₹{Number(order.total_amount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 space-y-3 max-w-2xl mx-auto">
        {/* Bill Card */}
        <Card className="p-6 shadow-2xl rounded-2xl border-2 bg-gradient-to-b from-card to-card/80">
          {/* Store Info */}
          <div className="text-center border-b-2 border-dashed pb-5 mb-5">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src="/images/logo.png" alt="RushCart" className="h-12 w-auto" />
              <span className="font-bold text-2xl text-foreground">RushCart</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Self Checkout Receipt</p>
          </div>

          {/* Order Details */}
          <div className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl p-4 mb-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1 text-xs">Order ID</span>
                <span className="font-mono font-bold bg-primary/10 text-primary px-2 py-1 rounded text-xs">#{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1 text-xs">Status</span>
                <span className="text-success font-bold uppercase text-xs bg-success/10 px-2 py-1 rounded">{order.payment_status}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1 text-xs">Date</span>
                <span className="font-semibold text-foreground">{orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1 text-xs">Time</span>
                <span className="font-semibold text-foreground">{orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-lg">Order Items</h3>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                {order.order_items.length} items
              </span>
            </div>
            <div className="space-y-3">
              {order.order_items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-14 h-14 rounded-lg bg-card border flex-shrink-0 overflow-hidden">
                    {item.products.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-secondary">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1 text-foreground">{item.products.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity} × ₹{item.price_at_purchase.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-foreground">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-dashed pt-4 mb-6">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total Amount</span>
                <span className="text-3xl font-bold text-primary">₹{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-5 bg-white rounded-2xl border-2 border-primary/20 shadow-lg">
              {qrCodeUrl && <img src={qrCodeUrl} alt="Exit QR Code" className="w-44 h-44" />}
            </div>
            <div className="mt-5 bg-gradient-to-r from-success/20 to-success/10 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-success mb-2">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-bold text-lg">Show QR at Exit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                One-time verification code • Scan at exit gate
              </p>
            </div>
            {order.qr_used && (
              <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-destructive font-semibold">
                  ⚠️ This QR code has already been used
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate('/scan')}
            variant="outline"
            className="h-12 border-2 hover:bg-primary/5 hover:border-primary/50 font-semibold"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => navigate('/orders')}
            className="h-12 gradient-primary font-bold shadow-lg"
          >
            View Orders
          </Button>
        </div>
      </div>
    </div>
  );
}
