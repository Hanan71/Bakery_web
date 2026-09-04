import { Link } from 'wouter';
import { useListMenuItems, useGetMenuStats } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from '@/components/menu-item-card';
import { StarRating } from '@/components/star-rating';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ArrowRight, Award, Heart, Users, Clock } from 'lucide-react';

export default function Home() {
  const { data: featuredItems, isLoading: loadingFeatured } = useListMenuItems({ featured: true });
  const { data: stats, isLoading: loadingStats } = useGetMenuStats();

  return (
    <div className="min-h-screen grain-texture">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/hero-bg.jpg)',
            filter: 'brightness(0.4)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 lg:px-8 py-20 text-center">
          <ScrollReveal>
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary">Handcrafted Since 2010</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight">
              A Treasure of<br />
              <span className="text-primary">Artisan Baking</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              كنز — Every pastry, bread, and cake crafted with love, tradition, and the finest ingredients
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button size="lg" className="text-lg px-8 gap-2" data-testid="button-browse-menu">
                  Browse Menu
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/order">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20" data-testid="button-order-now">
                  Order Now
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section */}
      {!loadingStats && stats && (
        <section className="py-16 bg-card/50 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ScrollReveal delay={0}>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold text-primary mb-2">
                    {stats.totalItems}+
                  </div>
                  <div className="text-sm text-muted-foreground">Menu Items</div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={100}>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold text-primary mb-2">
                    {stats.totalCategories}
                  </div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold text-primary mb-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={300}>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold text-primary mb-2">
                    13+
                  </div>
                  <div className="text-sm text-muted-foreground">Years Baking</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                  The Art of<br />Traditional Baking
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Kanz means "treasure" in Arabic, and that's exactly what we offer — a treasure chest of flavors passed down through generations. From the buttery layers of our croissants to the honey-soaked perfection of traditional baklava, every creation honors the craft.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Our bakers start before dawn, kneading dough by hand, watching the oven with care, and infusing each bite with warmth. This is more than baking — it's a love letter to tradition.
                </p>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="gap-2" data-testid="button-our-story">
                    Our Story
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img src="/croissant.jpg" alt="Fresh croissants" className="w-full aspect-square object-cover rounded-lg shadow-md" />
                  <img src="/kunafa.jpg" alt="Kunafa dessert" className="w-full aspect-square object-cover rounded-lg shadow-md" />
                </div>
                <div className="space-y-4 pt-8">
                  <img src="/baklava.jpg" alt="Baklava pastry" className="w-full aspect-square object-cover rounded-lg shadow-md" />
                  <img src="/maamoul.jpg" alt="Maamoul cookies" className="w-full aspect-square object-cover rounded-lg shadow-md" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {!loadingFeatured && featuredItems && featuredItems.length > 0 && (
        <section className="py-24 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                  Featured Treasures
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Handpicked favorites that showcase our mastery of traditional and contemporary baking
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.slice(0, 6).map((item, index) => (
                <ScrollReveal key={item.id} delay={index * 100}>
                  <MenuItemCard item={item} />
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={300}>
              <div className="text-center mt-12">
                <Link href="/menu">
                  <Button size="lg" variant="outline" className="gap-2" data-testid="button-view-full-menu">
                    View Full Menu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Why Choose Kanz
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our commitment to excellence in every layer, every crumb, every moment
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScrollReveal delay={0}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-2">Quality First</h3>
                <p className="text-sm text-muted-foreground">
                  Only the finest ingredients, sourced with care and used with precision
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-2">Made with Love</h3>
                <p className="text-sm text-muted-foreground">
                  Every item crafted by hand with passion and attention to detail
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-2">Community Focus</h3>
                <p className="text-sm text-muted-foreground">
                  A neighborhood gem where everyone is welcomed like family
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-2">Fresh Daily</h3>
                <p className="text-sm text-muted-foreground">
                  Baked fresh every morning, never from yesterday's batch
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      {!loadingStats && stats && stats.topRatedItems.length > 0 && (
        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                  Customer Favorites
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our most loved creations, rated by those who know best
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {stats.topRatedItems.slice(0, 3).map((item, index) => (
                <ScrollReveal key={item.id} delay={index * 100}>
                  <div className="bg-card rounded-lg p-6 border border-card-border">
                    <StarRating rating={item.averageRating} size="lg" className="mb-3" />
                    <h3 className="font-serif font-semibold text-xl mb-2">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.ratingCount} reviews
                    </p>
                    <Link href={`/menu/${item.id}`} className="text-sm text-primary hover:underline">
                      View details →
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Ready to Experience the Magic?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether it's a special celebration or your daily bread, let us be part of your moments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order">
                <Button size="lg" className="text-lg px-8 gap-2" data-testid="button-place-order">
                  Place an Order
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/menu">
                <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-explore-menu">
                  Explore Menu
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
