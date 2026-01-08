import { useState } from 'react';
import { Search, Barcode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ManualBarcodeInputProps {
  onSubmit: (barcode: string) => void;
  loading?: boolean;
}

export function ManualBarcodeInput({ onSubmit, loading }: ManualBarcodeInputProps) {
  const [barcode, setBarcode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim() && !loading) {
      onSubmit(barcode.trim());
    }
  };

  const isValidBarcode = barcode.trim().length >= 8 && barcode.trim().length <= 14;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-primary/10">
            <Barcode className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Enter Product Barcode</CardTitle>
            <CardDescription className="text-sm">
              Enter the 12–13 digit barcode printed on the product
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                Checking product...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Find Product
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
