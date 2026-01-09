import { useNavigate } from 'react-router-dom';
import { ArrowRight, Smartphone, ShoppingCart, QrCode, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Animation state management
  const [animationStep, setAnimationStep] = useState<'scanning' | 'detected' | 'paying' | 'success'>('scanning');
  
  useEffect(() => {
    const animationCycle = () => {
      setAnimationStep('scanning');
      
      setTimeout(() => setAnimationStep('detected'), 3000);
      setTimeout(() => setAnimationStep('paying'), 5000);
      setTimeout(() => setAnimationStep('success'), 7000);
      setTimeout(() => setAnimationStep('scanning'), 9500);
    };
    
    animationCycle();
    const interval = setInterval(animationCycle, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30 pt-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Floating Icons */}
        <div className="absolute top-32 right-20 animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 backdrop-blur flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
          <div className="w-14 h-14 rounded-2xl bg-accent/10 backdrop-blur flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-accent" />
          </div>
        </div>
        <div className="absolute top-1/3 left-32 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
          <div className="w-12 h-12 rounded-xl bg-success/10 backdrop-blur flex items-center justify-center">
            <QrCode className="w-6 h-6 text-success" />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Future of Mall Shopping</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            RushCart
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Skip Billing Lines
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Experience the future of shopping at malls and festivals. 
            Scan product barcodes, pay digitally, and walk out with your purchases. 
            No more waiting in long billing queues.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={() => navigate(user ? '/scan' : '/auth')}
              size="lg"
              className="gradient-primary text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all group"
            >
              Start Scanning
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg h-14 px-8"
            >
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">5min</div>
              <div className="text-sm text-muted-foreground mt-1">Average Checkout</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Secure Payments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">0</div>
              <div className="text-sm text-muted-foreground mt-1">Queue Time</div>
            </div>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="mt-20 flex justify-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[3rem] blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-72 h-[580px] bg-foreground/5 rounded-[2.5rem] border-4 border-foreground/10 shadow-2xl overflow-hidden">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-foreground/10 rounded-b-2xl z-10" />
              
              {/* Phone Screen Content */}
              <div className="absolute inset-4 top-10 bg-background rounded-2xl overflow-hidden shadow-inner">
                {/* Header */}
                <div className={`p-4 transition-all duration-500 ${
                  animationStep === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'gradient-primary text-primary-foreground'
                }`}>
                  <div className="text-center">
                    <div className="text-sm opacity-90">
                      {animationStep === 'scanning' && 'Ready to Scan'}
                      {animationStep === 'detected' && 'Product Detected!'}
                      {animationStep === 'paying' && 'Processing Payment...'}
                      {animationStep === 'success' && 'Payment Complete!'}
                    </div>
                    <div className="text-xl font-bold">
                      {animationStep === 'scanning' && 'Point at Barcode'}
                      {animationStep === 'detected' && 'Added to Cart'}
                      {animationStep === 'paying' && 'Please Wait'}
                      {animationStep === 'success' && 'Thank You!'}
                    </div>
                  </div>
                </div>
                
                {/* Scanning Area */}
                <div className="relative p-4 flex items-center justify-center h-48 bg-gradient-to-b from-foreground/5 to-transparent">
                  {/* Barcode Frame */}
                  <div className={`relative w-48 h-32 border-2 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    animationStep === 'scanning' 
                      ? 'border-dashed border-primary/50' 
                      : animationStep === 'detected'
                      ? 'border-solid border-green-500 bg-green-500/10'
                      : 'border-solid border-primary/30'
                  }`}>
                    {/* Barcode Illustration */}
                    <div className={`flex gap-1 transition-all duration-500 ${
                      animationStep === 'detected' ? 'scale-110' : 'scale-100'
                    }`}>
                      <div className="w-1 h-16 bg-foreground/80 rounded" />
                      <div className="w-0.5 h-16 bg-foreground/60 rounded" />
                      <div className="w-1.5 h-16 bg-foreground/80 rounded" />
                      <div className="w-0.5 h-16 bg-foreground/60 rounded" />
                      <div className="w-1 h-16 bg-foreground/80 rounded" />
                      <div className="w-2 h-16 bg-foreground/80 rounded" />
                      <div className="w-0.5 h-16 bg-foreground/60 rounded" />
                      <div className="w-1 h-16 bg-foreground/80 rounded" />
                    </div>
                    
                    {/* Scanning Laser Line */}
                    {animationStep === 'scanning' && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-scan" />
                      </div>
                    )}
                    
                    {/* Detection Pulse */}
                    {animationStep === 'detected' && (
                      <div className="absolute inset-0 rounded-xl">
                        <div className="absolute inset-0 bg-green-500/20 rounded-xl animate-ping" />
                        <div className="absolute top-2 right-2">
                          <Check className="w-6 h-6 text-green-500 animate-bounce" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Corner Brackets */}
                  <div className="absolute w-48 h-32 pointer-events-none">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                  </div>
                </div>
                
                {/* Product Card */}
                <div className="p-4">
                  <div className={`bg-secondary/50 rounded-xl p-4 transition-all duration-500 ${
                    animationStep === 'detected' ? 'scale-105 bg-secondary shadow-lg' : 
                    animationStep === 'paying' || animationStep === 'success' ? 'opacity-100' : 'opacity-70'
                  }`}>
                    <div className="flex items-center gap-3">
                      {/* Product Image Placeholder */}
                      <div className={`w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center transition-all duration-500 ${
                        animationStep === 'detected' ? 'animate-bounce' : ''
                      }`}>
                        <ShoppingCart className="w-8 h-8 text-primary" />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/10 rounded w-3/4 mb-2 overflow-hidden relative">
                          {animationStep === 'detected' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" />
                          )}
                        </div>
                        <div className="h-2 bg-foreground/5 rounded w-1/2 mb-2" />
                        <div className="h-4 bg-primary/20 rounded w-1/3 font-bold flex items-center justify-center text-xs text-primary">
                          ₹299
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Processing Indicator */}
                  {(animationStep === 'paying' || animationStep === 'success') && (
                    <div className={`mt-4 p-4 rounded-xl transition-all duration-500 ${
                      animationStep === 'success' 
                        ? 'bg-green-500/10 border-2 border-green-500' 
                        : 'bg-primary/10 border-2 border-primary'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {animationStep === 'paying' && (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                          {animationStep === 'success' && (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <span className={`text-sm font-medium ${
                            animationStep === 'success' ? 'text-green-600 dark:text-green-400' : 'text-primary'
                          }`}>
                            {animationStep === 'paying' ? 'Processing...' : 'Payment Successful!'}
                          </span>
                        </div>
                        <span className="text-lg font-bold">₹299</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Phone Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
