import { Link } from 'wouter';
import { MenuItem } from '@workspace/api-client-react';
import { StarRating } from './star-rating';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  className?: string;
}

export function MenuItemCard({ item, className }: MenuItemCardProps) {
  return (
    <Link href={`/menu/${item.id}`}>
      <div
        className={cn(
          'group relative bg-card rounded-lg overflow-hidden border border-card-border hover:shadow-lg transition-all duration-300 cursor-pointer',
          className
        )}
        data-testid={`card-menu-item-${item.id}`}
      >
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            {!item.available && (
              <Badge variant="secondary" className="text-xs">
                Sold Out
              </Badge>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-primary">
                ${item.price.toFixed(2)}
              </span>
              <StarRating
                rating={item.averageRating}
                count={item.ratingCount}
                size="sm"
                showCount
              />
            </div>
          </div>
        </div>

        {item.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-accent text-accent-foreground">Featured</Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
