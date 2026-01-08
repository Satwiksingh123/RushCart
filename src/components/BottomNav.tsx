import { Link, useLocation } from 'react-router-dom';
import { ScanLine, ShoppingCart, Receipt, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/scan', icon: ScanLine, label: 'Scan' },
  { path: '/cart', icon: ShoppingCart, label: 'Cart', showBadge: true },
  { path: '/orders', icon: Receipt, label: 'Orders' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label, showBadge }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full relative transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-6 h-6', isActive && 'stroke-[2.5]')} />
                {showBadge && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs font-bold text-accent-foreground bg-accent rounded-full">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className={cn('text-xs mt-1', isActive && 'font-semibold')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
