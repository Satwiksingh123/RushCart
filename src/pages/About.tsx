import { Target, Eye, Users, Zap, Award, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const values = [
  {
    icon: Zap,
    title: 'Speed First',
    description: 'We believe your time is precious. Every feature is designed to save you minutes.',
  },
  {
    icon: Users,
    title: 'User Centric',
    description: 'Built by shoppers, for shoppers. We understand the pain of long queues.',
  },
  {
    icon: Award,
    title: 'Quality Experience',
    description: 'No compromises on security or reliability. Your trust is our priority.',
  },
  {
    icon: Heart,
    title: 'Community Driven',
    description: 'We listen to our users and continuously improve based on feedback.',
  },
];

const team = [
  { name: 'Aditya Kumar', role: 'Founder & CEO', initial: 'A' },
  { name: 'Meera Joshi', role: 'Head of Product', initial: 'M' },
  { name: 'Karthik Rajan', role: 'Tech Lead', initial: 'K' },
  { name: 'Divya Sharma', role: 'Design Lead', initial: 'D' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Story</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              Making Shopping
              <span className="block text-primary">Effortless</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're on a mission to eliminate billing queues from every mall and festival in India.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                The Problem We're Solving
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Every weekend, millions of Indians spend hours standing in billing queues at malls. 
                  During festivals like Diwali and Christmas, wait times can exceed 30-40 minutes.
                </p>
                <p>
                  Parents with kids, elderly shoppers, busy professionals – everyone suffers. 
                  The joy of shopping gets overshadowed by the frustration of waiting.
                </p>
                <p>
                  We asked ourselves: Why can't checkout be as simple as scanning and walking out?
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-2xl" />
              <div className="relative bg-card rounded-3xl p-8 border border-border shadow-xl">
                <div className="text-6xl font-bold text-primary mb-4">40+</div>
                <div className="text-xl font-semibold text-foreground mb-2">Minutes Wasted</div>
                <p className="text-muted-foreground">
                  Average time spent in billing queues during peak shopping hours
                </p>
                <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">85%</div>
                    <div className="text-sm text-muted-foreground">Shoppers frustrated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">₹500Cr</div>
                    <div className="text-sm text-muted-foreground">Lost to queue abandonment</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 gradient-accent rounded-3xl opacity-10 blur-2xl" />
                <div className="relative bg-card rounded-3xl p-8 border border-border shadow-xl">
                  <div className="text-6xl font-bold text-accent mb-4">2</div>
                  <div className="text-xl font-semibold text-foreground mb-2">Minutes to Checkout</div>
                  <p className="text-muted-foreground">
                    Average checkout time with RushCart
                  </p>
                  <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-foreground">98%</div>
                      <div className="text-sm text-muted-foreground">User satisfaction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">10K+</div>
                      <div className="text-sm text-muted-foreground">Happy shoppers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Our Solution
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  RushCart turns your smartphone into a personal checkout counter. 
                  Scan product barcodes as you shop, pay digitally, and exit with a QR code.
                </p>
                <p>
                  Our secure one-time QR system ensures complete verification at exit gates. 
                  Mall guards can verify payments instantly – no confusion, no delays.
                </p>
                <p>
                  The result? A shopping experience that respects your time while maintaining 
                  complete security and transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Our Vision</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              A Queue-Free India
            </h2>
            <p className="text-lg text-muted-foreground">
              We envision a future where every mall, festival, and retail space in India 
              offers seamless self-checkout. Where shopping is pure joy, without the wait.
            </p>
          </div>

          {/* Values */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-card rounded-2xl p-6 border border-border shadow-card text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-muted-foreground">
              Passionate individuals working to transform retail experiences
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-foreground shadow-lg">
                  {member.initial}
                </div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Skip the Queue?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of smart shoppers who have already embraced the future of retail.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Get Started Free
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
