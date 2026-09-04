import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useGetMenuItem, useListMenuItemRatings, useRateMenuItem, getGetMenuItemQueryKey, getListMenuItemRatingsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MenuItemDetail() {
  const params = useParams();
  const itemId = params.id ? Number(params.id) : 0;
  const { data: item, isLoading: loadingItem } = useGetMenuItem(itemId);
  const { data: ratings, isLoading: loadingRatings } = useListMenuItemRatings(itemId);
  const rateItem = useRateMenuItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');
  const [selectedStars, setSelectedStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStars === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating.',
        variant: 'destructive',
      });
      return;
    }

    if (!reviewerName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name.',
        variant: 'destructive',
      });
      return;
    }

    rateItem.mutate(
      {
        id: itemId,
        data: {
          stars: selectedStars,
          reviewerName: reviewerName.trim(),
          comment: comment.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Review submitted!',
            description: 'Thank you for your feedback.',
          });
          setReviewerName('');
          setComment('');
          setSelectedStars(0);
          queryClient.invalidateQueries({ queryKey: getListMenuItemRatingsQueryKey(itemId) });
          queryClient.invalidateQueries({ queryKey: getGetMenuItemQueryKey(itemId) });
        },
        onError: () => {
          toast({
            title: 'Failed to submit review',
            description: 'Please try again later.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (loadingItem) {
    return (
      <div className="min-h-screen grain-texture">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen grain-texture">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Item not found</h1>
          <Link href="/menu">
            <Button variant="outline" className="gap-2" data-testid="button-back-menu">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen grain-texture">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <Link href="/menu">
          <Button variant="ghost" className="gap-2 mb-8" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold flex-1">
                {item.name}
              </h1>
              {item.featured && (
                <Badge className="bg-accent text-accent-foreground">Featured</Badge>
              )}
              {!item.available && (
                <Badge variant="secondary">Sold Out</Badge>
              )}
            </div>

            <div className="mb-6">
              <StarRating
                rating={item.averageRating}
                count={item.ratingCount}
                size="lg"
                showCount
              />
            </div>

            <div className="text-3xl font-serif font-bold text-primary mb-6">
              ${item.price.toFixed(2)}
            </div>

            {item.description && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {item.description}
              </p>
            )}

            {item.categoryName && (
              <div className="mb-6">
                <span className="text-sm text-muted-foreground">Category: </span>
                <span className="text-sm font-medium">{item.categoryName}</span>
              </div>
            )}

            <Link href="/order">
              <Button size="lg" className="w-full md:w-auto" data-testid="button-order-item">
                Order This Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Submit Review */}
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Leave a Review</h2>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <Label htmlFor="rating">Rating *</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStars(star)}
                      onMouseEnter={() => setHoveredStars(star)}
                      onMouseLeave={() => setHoveredStars(0)}
                      className="transition-transform hover:scale-110"
                      data-testid={`button-star-${star}`}
                    >
                      <Star
                        className={cn(
                          'h-8 w-8',
                          (hoveredStars || selectedStars) >= star
                            ? 'text-primary fill-primary'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="reviewerName">Your Name *</Label>
                <Input
                  id="reviewerName"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  data-testid="input-reviewer-name"
                />
              </div>

              <div>
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this item..."
                  rows={4}
                  data-testid="input-comment"
                />
              </div>

              <Button
                type="submit"
                disabled={rateItem.isPending}
                className="w-full"
                data-testid="button-submit-review"
              >
                {rateItem.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </form>
          </div>

          {/* Reviews List */}
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">
              Customer Reviews ({ratings?.length || 0})
            </h2>
            
            {loadingRatings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !ratings || ratings.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-6">
                {ratings.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-border/40 pb-6 last:border-0"
                    data-testid={`review-${review.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{review.reviewerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <StarRating rating={review.stars} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
