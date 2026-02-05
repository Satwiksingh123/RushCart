import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';
import { Camera, X, Zap, CheckCircle, Flashlight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

// Configuration for stable scanning - optimized for faster detection
const SCAN_CONFIG = {
  requiredStableFrames: 1,      // Single detection is enough (zyada tez detection)
  minConfidence: 0.3,           // Lower threshold for better detection (especially in low light)
  scanCooldown: 500,            // Cooldown after successful scan (ms)
  minBarcodeLength: 5,          // Accept smaller barcodes too
};

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'detected' | 'confirming'>('scanning');
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  
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
    
    // Haptic feedback (vibration)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // Pattern: vibrate-pause-vibrate
    }
    
    // Stop Quagga immediately
    Quagga.stop();
    
    // Small delay for visual feedback then callback
    setTimeout(() => {
      onDetected(code);
    }, 300);
  }, [onDetected]);

  // Toggle flashlight/torch
  const toggleTorch = useCallback(async () => {
    if (!videoTrackRef.current) return;
    
    const track = videoTrackRef.current;
    const capabilities = track.getCapabilities() as any;
    
    if (!capabilities.torch) {
      console.log('Torch not supported on this device');
      return;
    }
    
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchEnabled } as any]
      });
      setTorchEnabled(!torchEnabled);
    } catch (err) {
      console.error('Failed to toggle torch:', err);
    }
  }, [torchEnabled]);

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
      
      // Validation 2: Basic sanity check - numeric or alphanumeric only
      if (!/^[0-9A-Z\-]+$/i.test(code)) {
        console.log('Rejected: Invalid characters', code);
        return;
      }
      
      // Validation 3: Frame consistency check (simplified for speed)
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
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          },
          area: { // ROI - focus on center for better accuracy
            top: '25%',
            right: '10%',
            left: '10%',
            bottom: '25%',
          },
        },
        decoder: {
          readers: [
            'ean_reader',        // EAN-13 (sabse common)
            'ean_8_reader',      // EAN-8
            'code_128_reader',   // Code 128
            'code_39_reader',    // Code 39 (bahut common missing tha)
            'upc_reader',        // UPC-A
            'upc_e_reader',      // UPC-E
            'codabar_reader',    // Codabar
          ],
          multiple: false, // Only detect one barcode at a time
        },
        locate: true,
        locator: {
          patchSize: 'large',      // Larger patch size for better detection
          halfSample: false,       // Full sampling for accuracy
        },
        frequency: 30, // 30 FPS - double speed for instant detection
      },
      (err) => {
        if (err) {
          console.error('Quagga init error:', err);
          setError('Camera access denied. Please allow camera permissions.');
          return;
        }
        Quagga.start();
        setIsInitialized(true);
        
        // Get video track for torch control
        const video = scannerRef.current?.querySelector('video');
        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream;
          const tracks = stream.getVideoTracks();
          if (tracks.length > 0) {
            videoTrackRef.current = tracks[0];
          }
        }
      }
    );

    Quagga.onDetected(handleDetected);

    return () => {
      Quagga.offDetected(handleDetected);
      Quagga.stop();
      isLockedRef.current = false;
      videoTrackRef.current = null;
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
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTorch}
            className={cn(
              "text-white hover:bg-white/20",
              torchEnabled && "bg-yellow-500/30"
            )}
          >
            <Flashlight className={cn("w-6 h-6", torchEnabled && "fill-yellow-400")} />
          </Button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-24 left-0 right-0 text-center text-white px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-warning" />
            <span className="font-semibold">
              {scanStatus === 'detected' ? 'Barcode scanned!' : 
               scanStatus === 'confirming' ? 'Hold steady...' : 'Point at barcode'}
            </span>
          </div>
          <p className="text-sm text-white/80 mb-3">
            {scanStatus === 'detected' ? detectedCode : 
             scanStatus === 'confirming' ? 'Keep the barcode in frame' : 
             'Center the complete barcode in the frame'}
          </p>
          {scanStatus === 'scanning' && (
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 inline-block">
              <p className="text-xs text-white/70">
                💡 Tips: Use flashlight in low light • Hold phone steady • Clean camera lens
              </p>
            </div>
          )}
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
