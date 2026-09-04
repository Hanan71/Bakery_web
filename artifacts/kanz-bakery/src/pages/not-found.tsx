import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen grain-texture flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-8xl font-serif font-bold text-primary mb-4">404</div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            This treasure seems to have been misplaced. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="gap-2" data-testid="button-home">
                <Home className="h-5 w-5" />
                Go Home
              </Button>
            </Link>
            <Link href="/menu">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-menu">
                <ArrowLeft className="h-5 w-5" />
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
