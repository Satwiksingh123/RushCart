import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, ChevronRight, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  total_amount: number;
  payment_status: string;
  qr_used: boolean;
  created_at: string;
  order_items: { id: string }[];
}

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            payment_status,
            qr_used,
            created_at,
            order_items (id)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-card/95">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="RushCart" className="h-8 w-auto" />
              <div>
                <h1 className="font-bold text-foreground text-base">Your Orders</h1>
                <p className="text-xs text-muted-foreground">{orders.length > 0 ? `${orders.length} order${orders.length > 1 ? 's' : ''}` : 'No orders'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 space-y-3 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-28 animate-pulse bg-gradient-to-r from-muted to-muted/50 rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="pt-12">
            <Card className="p-12 text-center bg-gradient-to-br from-secondary/50 to-secondary/30 border-dashed border-2 rounded-2xl">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Receipt className="w-12 h-12 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-xl mb-3">No orders yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your completed orders will appear here. Start shopping to create your first order!
              </p>
            </Card>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const date = new Date(order.created_at);
              const itemCount = order.order_items.length;
              return (
                <Card
                  key={order.id}
                  onClick={() => navigate(`/bill/${order.id}`)}
                  className="p-5 cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary/30 rounded-xl group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={cn(
                            'text-xs px-3 py-1 rounded-full font-semibold',
                            order.payment_status === 'paid'
                              ? 'bg-success/20 text-success border border-success/30'
                              : 'bg-warning/20 text-warning border border-warning/30'
                          )}
                        >
                          {order.payment_status.toUpperCase()}
                        </span>
                        {order.qr_used && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {itemCount} item{itemCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-foreground">₹{Number(order.total_amount).toFixed(2)}</p>
                      <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto mt-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
