import { useState, useRef, useEffect } from 'react';
import { Shield, Scan, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Html5Qrcode } from 'html5-qrcode';

interface BillData {
  orderId: string;
  userId: string;
  paymentStatus: string;
  timestamp: string;
  used: boolean;
}

interface OrderDetails {
  id: string;
  total_amount: number;
  payment_status: string;
  qr_used: boolean;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      name: string;
      weight: string | null;
    };
  }[];
}

type ScanState = 'idle' | 'scanning' | 'loading' | 'success' | 'already_used' | 'invalid' | 'error';

export default function Guard() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    setScanState('scanning');
    setOrderDetails(null);
    setErrorMessage('');

    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop scanning immediately
          await html5Qrcode.stop();
          scannerRef.current = null;
          handleQRData(decodedText);
        },
        () => {
          // QR code not detected - continue scanning
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setScanState('error');
      setErrorMessage('Camera access denied or not available');
    }
  };

  const handleQRData = async (data: string) => {
    setScanState('loading');

    try {
      const billData: BillData = JSON.parse(data);

      if (!billData.orderId) {
        setScanState('invalid');
        setErrorMessage('Invalid QR Code format');
        return;
      }

      // Fetch order details from database
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          payment_status,
          qr_used,
          created_at,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (
              name,
              weight
            )
          )
        `)
        .eq('id', billData.orderId)
        .single();

      if (error || !order) {
        setScanState('invalid');
        setErrorMessage('Order not found in database');
        return;
      }

      setOrderDetails(order as unknown as OrderDetails);

      if (order.qr_used) {
        setScanState('already_used');
      } else {
        setScanState('success');
      }
    } catch (err) {
      console.error('Parse error:', err);
      setScanState('invalid');
      setErrorMessage('Invalid QR Code data');
    }
  };

  const verifyAndDestroy = async () => {
    if (!orderDetails) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ qr_used: true })
        .eq('id', orderDetails.id);

      if (error) throw error;

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      setOrderDetails({ ...orderDetails, qr_used: true });
      setScanState('already_used');
    } catch (err) {
      console.error('Verify error:', err);
      setErrorMessage('Failed to verify. Try again.');
    }
  };

  const resetScanner = () => {
    setScanState('idle');
    setOrderDetails(null);
    setErrorMessage('');
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-xl">
              <Shield className="w-6 h-6 text-teal-400" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">RushCart Guard</h1>
              <p className="text-xs text-slate-400">Bill Verification System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Status Card */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <div className="text-center">
            {scanState === 'idle' && (
              <>
                <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan className="w-10 h-10 text-teal-400" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Ready to Scan</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Tap the button below to scan customer's bill QR code
                </p>
                <Button
                  onClick={startScanning}
                  className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-500 text-white"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>
              </>
            )}

            {scanState === 'scanning' && (
              <>
                <h2 className="text-lg font-semibold text-white mb-4">Scanning...</h2>
                <div
                  id="qr-reader"
                  ref={containerRef}
                  className="w-full aspect-square max-w-[300px] mx-auto rounded-xl overflow-hidden mb-4"
                ></div>
                <p className="text-slate-400 text-sm mb-4">
                  Point camera at the QR code on customer's bill
                </p>
                <Button
                  onClick={async () => {
                    if (scannerRef.current) {
                      await scannerRef.current.stop();
                      scannerRef.current = null;
                    }
                    setScanState('idle');
                  }}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
              </>
            )}

            {scanState === 'loading' && (
              <>
                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Verifying Bill...</h2>
                <p className="text-slate-400 text-sm">Please wait</p>
              </>
            )}

            {scanState === 'success' && orderDetails && (
              <>
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-green-400 mb-1">Valid Bill</h2>
                <p className="text-slate-400 text-sm">Payment Verified - Ready for exit</p>
              </>
            )}

            {scanState === 'already_used' && (
              <>
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-amber-400 mb-1">QR Already Scanned</h2>
                <p className="text-slate-400 text-sm">This bill has already been verified</p>
              </>
            )}

            {scanState === 'invalid' && (
              <>
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-red-400 mb-1">Invalid QR Code</h2>
                <p className="text-slate-400 text-sm">{errorMessage}</p>
              </>
            )}

            {scanState === 'error' && (
              <>
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-red-400 mb-1">Scanner Error</h2>
                <p className="text-slate-400 text-sm">{errorMessage}</p>
              </>
            )}
          </div>
        </Card>

        {/* Order Details Card */}
        {orderDetails && (scanState === 'success' || scanState === 'already_used') && (
          <Card className="bg-slate-800/50 border-slate-700 p-4 mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Details
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Order ID</span>
                <span className="text-white font-mono">#{orderDetails.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Date</span>
                <span className="text-white">{formatDate(orderDetails.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Payment Status</span>
                <span className="text-green-400 font-medium capitalize">{orderDetails.payment_status}</span>
              </div>

              <div className="border-t border-slate-700 pt-3 mt-3">
                <p className="text-xs text-slate-500 mb-2">Items ({orderDetails.order_items.length})</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {orderDetails.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-300 truncate max-w-[60%]">
                        {item.products.name}
                        {item.products.weight && (
                          <span className="text-slate-500 text-xs ml-1">({item.products.weight})</span>
                        )}
                      </span>
                      <span className="text-white">
                        {item.quantity} × ₹{Number(item.price_at_purchase).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-700 pt-3 flex justify-between">
                <span className="text-white font-semibold">Total Amount</span>
                <span className="text-teal-400 font-bold text-lg">
                  ₹{Number(orderDetails.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {scanState === 'success' && orderDetails && !orderDetails.qr_used && (
          <Button
            onClick={verifyAndDestroy}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-500 text-white mb-3"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Verify & Allow Exit
          </Button>
        )}

        {(scanState === 'already_used' || scanState === 'invalid' || scanState === 'error' || scanState === 'success') && (
          <Button
            onClick={resetScanner}
            variant="outline"
            className="w-full h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Scan Another Bill
          </Button>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-700 py-3">
        <p className="text-center text-xs text-slate-500">
          RushCart Guard v1.0 • For authorized personnel only
        </p>
      </footer>
    </div>
  );
}
