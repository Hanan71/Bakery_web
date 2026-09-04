import { useState } from 'react';
import { useListCategories, useListMenuItems } from '@workspace/api-client-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MenuItemCard } from '@/components/menu-item-card';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: menuItems, isLoading: loadingItems } = useListMenuItems(
    selectedCategory ? { categoryId: selectedCategory } : undefined
  );

  return (
    <div className="min-h-screen grain-texture">
      <Navbar />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <ScrollReveal>
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
              Our Menu
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our treasure chest of handcrafted breads, pastries, cakes, and seasonal specialties
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border/40 bg-card/30 sticky top-16 z-40 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              disabled={loadingCategories}
              data-testid="button-category-all"
            >
              All Items
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`button-category-${category.id}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {loadingItems ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !menuItems || menuItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No items found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems.map((item, index) => (
                <ScrollReveal key={item.id} delay={Math.min(index * 50, 400)}>
                  <MenuItemCard item={item} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
