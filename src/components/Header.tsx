import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ScanLine, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#features', label: 'Features' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { items } = useCart();
  const location = useLocation();

  const scrollToSection = (hash: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = hash;
      return;
    }
    const element = document.querySelector(hash.replace('/', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/images/logo.png" 
              alt="RushCart Logo" 
              className="h-10 w-auto transition-transform group-hover:scale-105"
            />
            <span className="font-bold text-xl text-foreground">RushCart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => link.href.includes('#') ? scrollToSection(link.href) : null}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.href.includes('#') ? (
                  link.label
                ) : (
                  <Link to={link.href}>{link.label}</Link>
                )}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/scan">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ScanLine className="w-4 h-4" />
                    Scan
                  </Button>
                </Link>
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                    {items.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                        {items.length}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button className="gradient-primary">Get Started</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => link.href.includes('#') ? scrollToSection(link.href) : setIsMenuOpen(false)}
                  className="text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  {link.href.includes('#') ? (
                    link.label
                  ) : (
                    <Link to={link.href} className="block w-full">{link.label}</Link>
                  )}
                </button>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                {user ? (
                  <div className="flex flex-col gap-2 px-4">
                    <Link to="/scan" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <ScanLine className="w-4 h-4" />
                        Start Scanning
                      </Button>
                    </Link>
                    <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        View Cart ({items.length})
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="px-4">
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full gradient-primary">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
