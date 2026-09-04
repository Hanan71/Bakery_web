import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetOrder } from '@workspace/api-client-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Mail, Phone, CreditCard, Banknote, Clock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrderConfirmation() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const orderId = params.get('id') ? Number(params.get('id')) : 0;
  const sessionId = params.get('session_id');
  const cancelled = params.get('cancelled') === 'true';

  const { data: order, isLoading, refetch } = useGetOrder(orderId);
  const [verifying, setVerifying] = useState(false);

  // After Stripe redirect, verify payment and update status
  useEffect(() => {
    if (!sessionId || !orderId) return;

    const verify = async () => {
      setVerifying(true);
      try {
        const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
        await fetch(`${BASE}/api/orders/stripe-payment-success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        await refetch();
      } catch {
        // silent — order will still show as pending
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [sessionId, orderId]);

  if (cancelled) {
    return (
      <div className="min-h-screen grain-texture">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-3">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-8">Your order wasn't completed. No charges were made.</p>
          <Link href="/order">
            <Button size="lg">Try Again</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading || verifying) {
    return (
      <div className="min-h-screen grain-texture">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{verifying ? 'Verifying payment…' : 'Loading your order…'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen grain-texture">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Order not found</h1>
          <Link href="/order"><Button>Place a New Order</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'paid';
  const isCOD = order.paymentMethod === 'cash_on_delivery';
  const isCard = order.paymentMethod === 'card';

  return (
    <div className="min-h-screen grain-texture">
      <Navbar />

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className={cn(
              'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
              isPaid ? 'bg-green-100' : 'bg-primary/10'
            )}>
              <CheckCircle className={cn('h-12 w-12', isPaid ? 'text-green-600' : 'text-primary')} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
              {isPaid ? 'Payment Confirmed!' : 'Order Received!'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isPaid
                ? 'Your payment was successful. We\'ll start preparing your order.'
                : 'Thank you for choosing Kanz Bakery. We\'ve received your order.'}
            </p>
          </div>

          {/* Payment status banner */}
          <div className={cn(
            'rounded-xl p-4 flex items-center gap-4 mb-6 border',
            isPaid
              ? 'bg-green-50 border-green-200'
              : isCOD
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
          )}>
            {isCard
              ? <CreditCard className={cn('h-6 w-6 flex-shrink-0', isPaid ? 'text-green-600' : 'text-blue-600')} />
              : <Banknote className="h-6 w-6 flex-shrink-0 text-amber-600" />}
            <div className="flex-1">
              <div className="font-semibold text-sm">
                {isCOD ? 'Cash on Delivery' : 'Paid by Card'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isCOD
                  ? 'Please have the exact amount ready when your order arrives.'
                  : isPaid
                    ? 'Payment received — your order is being confirmed.'
                    : 'Payment pending confirmation.'}
              </div>
            </div>
            <Badge className={cn(
              'text-xs',
              isPaid ? 'bg-green-100 text-green-700 border-green-300' :
                isCOD ? 'bg-amber-100 text-amber-700 border-amber-300' :
                  'bg-blue-100 text-blue-700 border-blue-300'
            )}>
              {isPaid ? 'Paid' : isCOD ? 'Pay on Delivery' : 'Pending'}
            </Badge>
          </div>

          {/* Order card */}
          <div className="bg-card rounded-xl p-6 border border-card-border mb-6">
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-border/40">
              <div>
                <h2 className="text-xl font-serif font-bold">Order #{order.id}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">{order.status.replace('_', ' ')}</Badge>
            </div>

            {/* Customer info */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Customer</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{order.customerName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{order.customerEmail}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{order.customerPhone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(order.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {order.deliveryAddress && (
                  <div className="flex justify-between sm:col-span-2"><span className="text-muted-foreground">Delivery to</span><span className="font-medium text-right max-w-[60%]">{order.deliveryAddress}</span></div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg text-sm">
                    <div>
                      <div className="font-medium">{item.menuItemName}</div>
                      <div className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} × {item.quantity}</div>
                      {item.notes && <div className="text-xs text-muted-foreground mt-0.5">Note: {item.notes}</div>}
                    </div>
                    <div className="font-semibold">${item.subtotal.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {order.specialRequests && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Special Requests</h3>
                <p className="text-sm text-muted-foreground">{order.specialRequests}</p>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-border/40 flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Next steps */}
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-8">
            <h3 className="font-serif font-semibold text-lg mb-4">What happens next?</h3>
            <ul className="space-y-3">
              {isCOD ? (
                <>
                  <li className="flex gap-3 text-sm">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Our team will call <strong>{order.customerPhone}</strong> within 24 hours to confirm your order details.</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Your order will be freshly prepared for your scheduled date.</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <Banknote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Payment of <strong>${order.totalAmount.toFixed(2)}</strong> is due upon delivery or pickup.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex gap-3 text-sm">
                    <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Payment of <strong>${order.totalAmount.toFixed(2)}</strong> has been {isPaid ? 'received' : 'initiated'}.</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>A confirmation will be sent to <strong>{order.customerEmail}</strong>.</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Your order will be prepared fresh for your scheduled date.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
            <Link href="/menu" className="flex-1">
              <Button className="w-full">Browse Menu</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
