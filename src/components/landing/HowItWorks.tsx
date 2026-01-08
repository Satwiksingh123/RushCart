import { ScanLine, ShoppingCart, CreditCard, QrCode, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: ScanLine,
    step: '01',
    title: 'Scan Products',
    description: 'Use your phone camera to scan product barcodes as you shop. Works with any standard barcode.',
    color: 'primary',
  },
  {
    icon: ShoppingCart,
    step: '02',
    title: 'Add to Cart',
    description: 'Products are instantly added to your digital cart. Adjust quantities or remove items anytime.',
    color: 'accent',
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Pay Digitally',
    description: 'Complete your purchase with secure digital payment. No cash, no waiting at billing counters.',
    color: 'success',
  },
  {
    icon: QrCode,
    step: '04',
    title: 'Exit with QR',
    description: 'Show your unique QR code at the exit gate. Guards verify and you walk out in seconds.',
    color: 'primary',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Shopping has never been easier. Complete your entire purchase journey 
            without standing in a single queue.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border via-primary/30 to-border z-0" />
              )}

              <div className="relative bg-card rounded-2xl p-6 shadow-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary text-sm shadow-md">
                  {item.step}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  item.color === 'primary' ? 'gradient-primary' :
                  item.color === 'accent' ? 'gradient-accent' :
                  'gradient-success'
                } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Ready to experience seamless shopping?</p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Free
            <CheckCircle2 className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
