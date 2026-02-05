import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
  quantity?: number;
}

export function ProductCard({ product, onAddToCart, isInCart, quantity }: ProductCardProps) {
  return (
    <Card className="product-card-enter overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 bg-card">
      <div className="relative">
        <div className="aspect-square bg-secondary/50 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="text-muted-foreground text-sm">No image</div>
          )}
        </div>
        {isInCart && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center text-success-foreground shadow-lg">
            <Check className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          {product.weight && (
            <p className="text-sm text-muted-foreground mt-1">{product.weight}</p>
          )}
          {product.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-foreground">₹{product.price}</span>
          </div>
          <Button
            onClick={() => onAddToCart(product)}
            size="sm"
            className={cn(
              'h-10 px-4 font-semibold transition-all',
              isInCart ? 'bg-success hover:bg-success/90' : 'gradient-primary'
            )}
          >
            <Plus className="w-4 h-4 mr-1" />
            {isInCart ? `Add (${quantity})` : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
