import { useCallback, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageBarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

export function ImageBarcodeScanner({ onDetected }: ImageBarcodeScannerProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Preprocess image: grayscale + contrast + threshold for better barcode detection
  const preprocessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Scale image for better processing
        const maxWidth = 1400;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const contrastFactor = 1.6;
          const adjusted = ((gray - 128) * contrastFactor) + 128;
          const finalValue = Math.min(255, Math.max(0, adjusted));
          const threshold = finalValue > 140 ? 255 : 0;
          
          data[i] = threshold;
          data[i + 1] = threshold;
          data[i + 2] = threshold;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageSrc;
    });
  };

  const decodeBarcode = (imageSrc: string, patchSize: string, halfSample: boolean): Promise<string | null> => {
    return new Promise((resolve) => {
      Quagga.decodeSingle(
        {
          src: imageSrc,
          numOfWorkers: 0,
          decoder: {
            readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader', 'upc_e_reader', 'code_39_reader'],
          },
          locate: true,
          locator: {
            patchSize: patchSize as 'x-small' | 'small' | 'medium' | 'large' | 'x-large',
            halfSample,
          },
        },
        (result) => resolve(result?.codeResult?.code || null)
      );
    });
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const originalImageSrc = e.target?.result as string;

        try {
          // Try multiple decode strategies
          let barcode = await decodeBarcode(originalImageSrc, 'large', false);
          
          if (!barcode) {
            const processed = await preprocessImage(originalImageSrc);
            barcode = await decodeBarcode(processed, 'large', false);
          }
          
          if (!barcode) {
            const processed = await preprocessImage(originalImageSrc);
            barcode = await decodeBarcode(processed, 'medium', true);
          }
          
          if (!barcode) {
            barcode = await decodeBarcode(originalImageSrc, 'medium', true);
          }

          if (barcode) {
            onDetected(barcode);
            toast({ title: "Barcode Found!", description: `Detected: ${barcode}` });
          } else {
            toast({
              title: "No barcode found",
              description: "Try a clearer, well-lit image with the barcode centered.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Barcode decoding error:', error);
          toast({ title: "Processing Error", description: "Failed to process image.", variant: "destructive" });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    },
    [onDetected, toast]
  );

  return (
    <div className="relative w-full h-full">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isProcessing}
      />
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 pointer-events-none">
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-xs font-medium">Processing...</span>
          </>
        ) : (
          <>
            <div className="p-2 rounded-full bg-primary/10">
              <ImagePlus className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm mb-1">Upload Barcode</p>
              <p className="text-xs text-muted-foreground">PNG, JPG</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
