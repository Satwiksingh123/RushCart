import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Regular Shopper',
    location: 'Mumbai',
    image: null,
    rating: 5,
    text: 'Saved me 20 minutes during Diwali shopping at Phoenix Mall. The QR exit was so smooth, the guards were impressed!',
  },
  {
    name: 'Rahul Verma',
    role: 'Tech Professional',
    location: 'Bangalore',
    image: null,
    rating: 5,
    text: 'Finally, someone solved the biggest pain point of mall shopping. No more standing in those endless billing queues.',
  },
  {
    name: 'Anita Desai',
    role: 'Working Mom',
    location: 'Delhi',
    image: null,
    rating: 5,
    text: 'With two kids, standing in queues was impossible. Now I scan, pay, and leave. This app is a lifesaver!',
  },
  {
    name: 'Vikram Singh',
    role: 'Business Owner',
    location: 'Jaipur',
    image: null,
    rating: 5,
    text: 'Used this at a trade fair. The real-time cart helped me track my spending. Brilliant concept, flawless execution.',
  },
  {
    name: 'Sneha Patel',
    role: 'College Student',
    location: 'Ahmedabad',
    image: null,
    rating: 5,
    text: 'My friends thought I was joking when I said I checked out in 2 minutes. Now they all use RushCart!',
  },
  {
    name: 'Arjun Reddy',
    role: 'Festival Organizer',
    location: 'Hyderabad',
    image: null,
    rating: 5,
    text: 'We integrated this at our food festival. Customer satisfaction went through the roof. Zero queue complaints!',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
            <Star className="w-4 h-4 text-success fill-success" />
            <span className="text-sm font-medium text-success">Loved by Shoppers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Real stories from real shoppers who transformed their mall experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-lg transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-10 h-10 text-primary/20" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground mb-8">Trusted by shoppers at leading malls</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {['Phoenix Mall', 'Inorbit', 'VR Mall', 'Forum Mall', 'Nexus Mall'].map((mall) => (
              <div key={mall} className="text-lg font-bold text-muted-foreground">
                {mall}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
