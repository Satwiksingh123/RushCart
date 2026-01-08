import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';
import { Camera, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleDetected = useCallback(
    (result: any) => {
      if (result?.codeResult?.code) {
        const code = result.codeResult.code;
        Quagga.stop();
        onDetected(code);
      }
    },
    [onDetected]
  );

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader', 'upc_e_reader'],
        },
        locate: true,
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
      },
      (err) => {
        if (err) {
          console.error('Quagga init error:', err);
          setError('Camera access denied. Please allow camera permissions.');
          return;
        }
        Quagga.start();
        setIsInitialized(true);
      }
    );

    Quagga.onDetected(handleDetected);

    return () => {
      Quagga.offDetected(handleDetected);
      Quagga.stop();
    };
  }, [handleDetected]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        {/* Scanner viewport */}
        <div ref={scannerRef} className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>canvas]:hidden" />

        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dark overlay with cutout */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 bg-transparent border-2 border-primary rounded-xl shadow-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}>
            {/* Scanning line animation */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            
            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br-lg" />
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5" />
            <span className="font-medium">Scanning...</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Instructions */}
        <div className="absolute bottom-24 left-0 right-0 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-warning" />
            <span className="font-semibold">Point at barcode</span>
          </div>
          <p className="text-sm text-white/80">Position barcode within the frame</p>
        </div>

        {/* Error display */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-6">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-4">{error}</p>
              <Button onClick={onClose} variant="secondary">
                Go Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
