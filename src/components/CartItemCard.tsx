import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CartItem } from '@/hooks/useCart';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const { product, quantity } = item;
  const subtotal = product.price * quantity;

  return (
    <Card className="flex gap-3 p-3 bg-card shadow-sm hover:shadow-md transition-all rounded-lg border-0 ring-1 ring-border/50">
      <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-secondary/30 overflow-hidden ring-1 ring-border/30">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground line-clamp-1 text-sm mb-1">{product.name}</h3>
        {product.weight && (
          <p className="text-xs text-muted-foreground">{product.weight}</p>
        )}
        <p className="text-primary font-bold mt-1 text-sm">₹{product.price}</p>
      </div>
      <div className="flex flex-col items-end justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id)}
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQuantity(item.id, quantity - 1)}
            className="h-7 w-7 border rounded-lg"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <span className="w-7 text-center font-semibold text-sm">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQuantity(item.id, quantity + 1)}
            className="h-7 w-7 border rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="font-bold text-foreground text-sm">₹{subtotal.toFixed(2)}</p>
      </div>
    </Card>
  );
}
