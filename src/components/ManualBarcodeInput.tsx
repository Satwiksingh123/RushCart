import { useState } from 'react';
import { Search, Barcode, Loader2, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ManualBarcodeInputProps {
  onSubmit: (barcode: string) => void;
  loading?: boolean;
  compact?: boolean;
}

export function ManualBarcodeInput({ onSubmit, loading, compact = false }: ManualBarcodeInputProps) {
  const [barcode, setBarcode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim() && !loading) {
      onSubmit(barcode.trim());
      setBarcode('');
    }
  };

  const isValidBarcode = barcode.trim().length >= 8 && barcode.trim().length <= 14;

  if (compact) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Keyboard className="w-5 h-5 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm mb-1">Enter Barcode</p>
          <p className="text-xs text-muted-foreground">Type manually</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-full bg-primary/10">
          <Barcode className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-base">Enter Product Barcode</h3>
          <p className="text-xs text-muted-foreground">
            Enter the 8-14 digit barcode
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g., 7622202253614"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))}
            className="h-12 text-lg font-mono tracking-wider pr-12 bg-background"
            maxLength={14}
            disabled={loading}
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        
        {barcode && !isValidBarcode && (
          <p className="text-xs text-muted-foreground">
            Barcode should be 8-14 digits
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold gradient-primary"
          disabled={!isValidBarcode || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Finding product...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Find Product
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
