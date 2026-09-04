import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function StarRating({ rating, count, size = 'md', showCount = false, className }: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    const filled = rating >= starValue;
    const partial = rating > i && rating < starValue;
    const fillPercentage = partial ? ((rating - i) * 100) : 0;

    return (
      <div key={i} className="relative">
        <Star
          className={cn(sizeClasses[size], 'text-muted-foreground/30')}
          fill="currentColor"
        />
        {(filled || partial) && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: filled ? '100%' : `${fillPercentage}%` }}
          >
            <Star
              className={cn(sizeClasses[size], 'text-primary')}
              fill="currentColor"
            />
          </div>
        )}
      </div>
    );
  });

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showCount && count !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">({count})</span>
      )}
    </div>
  );
}
