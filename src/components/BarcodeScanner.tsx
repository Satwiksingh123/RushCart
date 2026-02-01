import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';
import { Camera, X, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

// Configuration for stable scanning - balanced for accuracy + speed
const SCAN_CONFIG = {
  requiredStableFrames: 2,      // Need 2 consecutive same detections (reduced from 4)
  minConfidence: 0.5,           // Minimum confidence threshold (reduced from 0.85)
  scanCooldown: 500,            // Cooldown after successful scan (ms)
  minBarcodeLength: 6,          // Minimum barcode length to accept (reduced from 8)
};

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'detected' | 'confirming'>('scanning');
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  
  // Refs for stable detection tracking
  const lastCodeRef = useRef<string | null>(null);
  const stableCountRef = useRef<number>(0);
  const isLockedRef = useRef<boolean>(false);
  const scanBoxRef = useRef<{ width: number; height: number }>({ width: 288, height: 160 }); // w-72 h-40

  const handleFinalScan = useCallback((code: string) => {
    // Lock scanner to prevent duplicate scans
    isLockedRef.current = true;
    setScanStatus('detected');
    setDetectedCode(code);
    
    // Stop Quagga immediately
    Quagga.stop();
    
    // Small delay for visual feedback then callback
    setTimeout(() => {
      onDetected(code);
    }, 300);
  }, [onDetected]);

  const handleDetected = useCallback(
    (result: any) => {
      // Skip if scanner is locked
      if (isLockedRef.current) return;
      
      const codeResult = result?.codeResult;
      if (!codeResult?.code) return;
      
      const code = codeResult.code;
      const confidence = codeResult.decodedCodes?.reduce((acc: number, dc: any) => {
        return dc.error !== undefined ? acc + (1 - dc.error) : acc;
      }, 0) / (codeResult.decodedCodes?.length || 1) || 0;
      
      // Validation 1: Check minimum barcode length
      if (code.length < SCAN_CONFIG.minBarcodeLength) {
        console.log('Rejected: Barcode too short', code);
        return;
      }
      
      // Validation 2: Check confidence level (skip this check - Quagga confidence is unreliable)
      // if (confidence < SCAN_CONFIG.minConfidence) {
      //   console.log('Rejected: Low confidence', confidence);
      //   return;
      // }
      
      // Validation 3: Skip bounding box check - was too strict
      // Just do frame consistency check
      
      // Validation 4: Frame consistency check (most important!)
      if (code === lastCodeRef.current) {
        stableCountRef.current++;
        setScanStatus('confirming');
      } else {
        lastCodeRef.current = code;
        stableCountRef.current = 1;
        setScanStatus('scanning');
      }
      
      console.log(`Barcode detected: ${code}, stable count: ${stableCountRef.current}/${SCAN_CONFIG.requiredStableFrames}`);
      
      // Only accept after required stable frames
      if (stableCountRef.current >= SCAN_CONFIG.requiredStableFrames) {
        handleFinalScan(code);
        // Reset for next scan
        stableCountRef.current = 0;
        lastCodeRef.current = null;
      }
    },
    [handleFinalScan]
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
          // Removed ROI area restriction - scan full frame for better detection
        },
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader', 'upc_e_reader'],
          multiple: false, // Only detect one barcode at a time
        },
        locate: true,
        locator: {
          patchSize: 'medium',
          halfSample: true, // Faster processing
        },
        frequency: 15, // Scan 15 times per second for faster detection
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
      isLockedRef.current = false;
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
          <div 
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 bg-transparent border-2 rounded-xl shadow-lg transition-all duration-300",
              scanStatus === 'detected' ? 'border-green-500 scale-105' : 
              scanStatus === 'confirming' ? 'border-yellow-500' : 'border-primary'
            )} 
            style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
          >
            {/* Scanning line animation */}
            {scanStatus === 'scanning' && (
              <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
              </div>
            )}
            
            {/* Success indicator */}
            {scanStatus === 'detected' && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl">
                <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
              </div>
            )}
            
            {/* Confirming indicator */}
            {scanStatus === 'confirming' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1">
                  {[...Array(SCAN_CONFIG.requiredStableFrames)].map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-200",
                        i < stableCountRef.current ? 'bg-yellow-500' : 'bg-white/30'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Corner markers */}
            <div className={cn("absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 rounded-tl-lg transition-colors", 
              scanStatus === 'detected' ? 'border-green-500' : scanStatus === 'confirming' ? 'border-yellow-500' : 'border-primary')} />
            <div className={cn("absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 rounded-tr-lg transition-colors",
              scanStatus === 'detected' ? 'border-green-500' : scanStatus === 'confirming' ? 'border-yellow-500' : 'border-primary')} />
            <div className={cn("absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 rounded-bl-lg transition-colors",
              scanStatus === 'detected' ? 'border-green-500' : scanStatus === 'confirming' ? 'border-yellow-500' : 'border-primary')} />
            <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 rounded-br-lg transition-colors",
              scanStatus === 'detected' ? 'border-green-500' : scanStatus === 'confirming' ? 'border-yellow-500' : 'border-primary')} />
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
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
            scanStatus === 'detected' ? 'bg-green-500/20 text-green-400' :
            scanStatus === 'confirming' ? 'bg-yellow-500/20 text-yellow-400' : 'text-white'
          )}>
            {scanStatus === 'detected' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Detected!</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span className="font-medium">
                  {scanStatus === 'confirming' ? 'Confirming...' : 'Scanning...'}
                </span>
              </>
            )}
          </div>
          <div className="w-10" />
        </div>

        {/* Instructions */}
        <div className="absolute bottom-24 left-0 right-0 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-warning" />
            <span className="font-semibold">
              {scanStatus === 'detected' ? 'Barcode scanned!' : 
               scanStatus === 'confirming' ? 'Hold steady...' : 'Point at barcode'}
            </span>
          </div>
          <p className="text-sm text-white/80">
            {scanStatus === 'detected' ? detectedCode : 
             scanStatus === 'confirming' ? 'Keep the barcode in frame' : 
             'Center the complete barcode in the frame'}
          </p>
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
