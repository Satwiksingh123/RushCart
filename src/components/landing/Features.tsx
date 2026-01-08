import { 
  Clock, 
  Shield, 
  Smartphone, 
  Receipt, 
  Barcode, 
  Zap,
  Lock,
  Wallet
} from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Zero Wait Time',
    description: 'Skip the billing queue entirely. Walk in, shop, and walk out in minutes.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Secure QR Exit',
    description: 'One-time unique QR code ensures secure verification at the exit gate.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Smartphone,
    title: 'Real-time Cart',
    description: 'See your cart update instantly as you scan. Track spending as you shop.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Receipt,
    title: 'Digital Bills',
    description: 'Get instant digital receipts. No paper, no clutter, always accessible.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Barcode,
    title: 'Universal Barcodes',
    description: 'Works with existing product barcodes. No special tags or labels required.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Zap,
    title: 'Instant Checkout',
    description: 'Complete your purchase in under 30 seconds. Faster than any billing counter.',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Lock,
    title: 'Fraud Prevention',
    description: 'QR codes are single-use and expire after verification. Full security.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Wallet,
    title: 'Multiple Payments',
    description: 'Pay with UPI, cards, or digital wallets. Your choice, your convenience.',
    gradient: 'from-teal-500 to-green-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Packed with Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need for
            <span className="block text-primary">Seamless Shopping</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built for modern shoppers who value their time. Every feature designed 
            to make your mall experience faster and better.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="relative text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="relative text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Highlight Banner */}
        <div className="mt-20 relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
                Ready to Transform Your Shopping Experience?
              </h3>
              <p className="text-primary-foreground/80 max-w-xl">
                Join thousands of smart shoppers who have already ditched the billing queues.
              </p>
            </div>
            <a
              href="/auth"
              className="flex-shrink-0 px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Start Free Today
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
