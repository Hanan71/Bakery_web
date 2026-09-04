import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ScrollReveal } from '@/components/scroll-reveal';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen grain-texture">
      <Navbar />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <ScrollReveal>
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From a small family kitchen to a beloved neighborhood bakery, Kanz has been baking memories for over a decade
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* History */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <ScrollReveal>
              <div>
                <h2 className="text-4xl font-serif font-bold mb-6">
                  A Family Tradition
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Kanz Bakery was born in 2010 from a simple dream: to share the authentic flavors of Middle Eastern baking with our community. What started as Grandmother Layla's recipes, passed down through three generations, has grown into a treasure trove of both traditional and contemporary creations.
                  </p>
                  <p>
                    The name "Kanz" — meaning treasure in Arabic — reflects our belief that every pastry, every loaf of bread, every celebration cake is a precious gift. We treat each item with the reverence it deserves, using only the finest ingredients and time-honored techniques.
                  </p>
                  <p>
                    Today, our bakery stands as a bridge between cultures, where classic Arabic pastries like kunafa and maamoul sit alongside French-inspired croissants and rustic sourdough. Every morning before sunrise, our bakers arrive to begin the sacred ritual of mixing, kneading, and baking fresh.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="relative">
                <img
                  src="/sourdough.jpg"
                  alt="Fresh bread"
                  className="w-full rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
                  <div className="text-3xl font-serif font-bold">13+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Our Baking Philosophy
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three principles guide everything we create
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ScrollReveal delay={0}>
              <div className="bg-card rounded-lg p-8 border border-card-border">
                <div className="text-4xl font-serif text-primary mb-4">01</div>
                <h3 className="text-xl font-serif font-semibold mb-3">Quality Ingredients</h3>
                <p className="text-muted-foreground">
                  We source premium flour, real butter, organic eggs, and authentic spices. No shortcuts, no substitutes. Every ingredient earns its place.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="bg-card rounded-lg p-8 border border-card-border">
                <div className="text-4xl font-serif text-primary mb-4">02</div>
                <h3 className="text-xl font-serif font-semibold mb-3">Traditional Methods</h3>
                <p className="text-muted-foreground">
                  Hand-kneaded dough, slow fermentation, careful temperature control. The old ways produce flavors machines cannot replicate.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-card rounded-lg p-8 border border-card-border">
                <div className="text-4xl font-serif text-primary mb-4">03</div>
                <h3 className="text-xl font-serif font-semibold mb-3">Baked Fresh Daily</h3>
                <p className="text-muted-foreground">
                  Every item is baked fresh each morning. When we sell out, we sell out. Never yesterday's batch, always today's treasure.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Meet Our Bakers
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The skilled hands behind every creation
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ScrollReveal delay={0}>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-4xl font-serif font-bold text-primary">LM</div>
                </div>
                <h3 className="text-xl font-serif font-semibold mb-1">Layla Mansour</h3>
                <p className="text-sm text-primary mb-2">Master Baker & Founder</p>
                <p className="text-sm text-muted-foreground">
                  Three generations of recipes and 40 years of baking expertise
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                  <div className="text-4xl font-serif font-bold text-secondary">AK</div>
                </div>
                <h3 className="text-xl font-serif font-semibold mb-1">Ahmed Khalil</h3>
                <p className="text-sm text-primary mb-2">Head Pastry Chef</p>
                <p className="text-sm text-muted-foreground">
                  Specializes in French pastries and Arabic desserts
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-4xl font-serif font-bold text-accent">SF</div>
                </div>
                <h3 className="text-xl font-serif font-semibold mb-1">Sara Farah</h3>
                <p className="text-sm text-primary mb-2">Bread Specialist</p>
                <p className="text-sm text-muted-foreground">
                  Expert in sourdough and traditional Middle Eastern breads
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Visit Us
              </h2>
              <p className="text-lg text-muted-foreground">
                Our doors are always open, our ovens always warm
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ScrollReveal delay={100}>
              <div className="bg-card rounded-lg p-8 border border-card-border">
                <h3 className="text-xl font-serif font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium mb-1">Location</div>
                      <div className="text-sm text-muted-foreground">
                        Al Wasl Road, Jumeirah<br />
                        Dubai, United Arab Emirates
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium mb-1">Phone</div>
                      <div className="text-sm text-muted-foreground">+971 4 123 4567</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium mb-1">Email</div>
                      <div className="text-sm text-muted-foreground">hello@kanzbakery.ae</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-card rounded-lg p-8 border border-card-border">
                <h3 className="text-xl font-serif font-semibold mb-6">Opening Hours</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Sunday - Thursday</span>
                        <span className="text-sm text-muted-foreground">6:00 AM - 9:00 PM</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Friday - Saturday</span>
                        <span className="text-sm text-muted-foreground">6:00 AM - 10:00 PM</span>
                      </div>
                      <div className="mt-4 p-3 bg-primary/10 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Fresh batches come out of the oven between 7-8 AM daily. Arrive early for the warmest treats!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
