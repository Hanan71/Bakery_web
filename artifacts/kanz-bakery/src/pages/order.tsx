import { useState } from 'react';
import { useLocation } from 'wouter';
import { useListMenuItems } from '@workspace/api-client-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Banknote, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItem {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

const STEPS = [
  { id: 1, label: 'Your Order', icon: ShoppingCart },
  { id: 2, label: 'Your Details', icon: User },
  { id: 3, label: 'Payment', icon: CreditCard },
];

export default function Order() {
  const [, setLocation] = useLocation();
  const { data: menuItems, isLoading: loadingMenu } = useListMenuItems();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 — Cart
  const [orderType, setOrderType] = useState<'bulk' | 'catering'>('bulk');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Step 2 — Guest info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  /* ─── Cart helpers ─── */
  const addItem = (itemId: number) => {
    const menuItem = menuItems?.find((i) => i.id === itemId);
    if (!menuItem) return;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === itemId);
      if (existing) return prev.map((i) => i.menuItemId === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItemId: menuItem.id, menuItemName: menuItem.name, quantity: 1, unitPrice: menuItem.price }];
    });
  };

  const updateQty = (itemId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => i.menuItemId === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (itemId: number) => setCartItems((prev) => prev.filter((i) => i.menuItemId !== itemId));

  const total = cartItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  /* ─── Navigation ─── */
  const goNext = () => {
    if (step === 1 && cartItems.length === 0) {
      toast({ title: 'Cart is empty', description: 'Add at least one item to continue.', variant: 'destructive' });
      return;
    }
    if (step === 2) {
      if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !scheduledDate) {
        toast({ title: 'Missing details', description: 'Please fill in all required fields.', variant: 'destructive' });
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const buildOrderPayload = (paymentMethod: 'card' | 'cash_on_delivery') => ({
    type: orderType,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    scheduledDate,
    eventDescription: eventDescription.trim() || null,
    guestCount: guestCount ? Number(guestCount) : null,
    deliveryAddress: deliveryAddress.trim() || null,
    specialRequests: specialRequests.trim() || null,
    items: cartItems.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: null })),
    paymentMethod,
  });

  /* ─── Payment handlers ─── */
  const handleCOD = async () => {
    setIsSubmitting(true);
    try {
      const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
      const res = await fetch(`${BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildOrderPayload('cash_on_delivery')),
      });
      if (!res.ok) throw new Error(await res.text());
      const order = await res.json();
      setLocation(`/order/confirmation?id=${order.id}`);
    } catch {
      toast({ title: 'Failed to place order', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardPayment = async () => {
    setIsSubmitting(true);
    try {
      const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
      const origin = window.location.origin;
      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      const res = await fetch(`${BASE}/api/orders/checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData: buildOrderPayload('card'),
          successUrl: `${origin}${base}/order/confirmation`,
          cancelUrl: `${origin}${base}/order/confirmation?cancelled=true`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { sessionUrl } = await res.json();
      window.location.href = sessionUrl;
    } catch {
      toast({ title: 'Payment setup failed', description: 'Please try again or choose cash on delivery.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grain-texture">
      <Navbar />

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2">Place an Order</h1>
            <p className="text-muted-foreground">Bulk orders &amp; catering — prepared fresh for your date.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-10">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      done ? 'bg-primary border-primary text-white' :
                        active ? 'border-primary text-primary bg-primary/10' :
                          'border-border text-muted-foreground bg-background'
                    )}>
                      {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      'mt-1.5 text-xs font-medium hidden sm:block',
                      active ? 'text-primary' : done ? 'text-primary/70' : 'text-muted-foreground'
                    )}>{s.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={cn('h-0.5 flex-1 mx-1 transition-colors duration-300', step > s.id ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Cart ── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Order type */}
              <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
                <h2 className="text-lg font-serif font-semibold mb-4">Order Type</h2>
                <RadioGroup value={orderType} onValueChange={(v) => setOrderType(v as 'bulk' | 'catering')} className="flex gap-4">
                  {[
                    { value: 'bulk', label: 'Bulk Order', sub: 'Large quantities for pickup' },
                    { value: 'catering', label: 'Catering Service', sub: 'Event catering with delivery' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex-1 flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                        orderType === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      )}
                    >
                      <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.sub}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Menu items */}
              <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
                <h2 className="text-lg font-serif font-semibold mb-4">Select Items</h2>
                {loadingMenu ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto space-y-1 pr-1">
                    {menuItems?.filter((i) => i.available).map((item) => {
                      const inCart = cartItems.find((c) => c.menuItemId === item.id);
                      return (
                        <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors group">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{item.name}</div>
                            <div className="text-xs text-muted-foreground">${item.price.toFixed(2)}</div>
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-primary transition-colors">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">{inCart.quantity}</span>
                              <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/80 transition-colors">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addItem(item.id)}
                              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary hover:text-white transition-all"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cart summary */}
              {cartItems.length > 0 && (
                <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
                  <h2 className="text-lg font-serif font-semibold mb-4">Your Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</h2>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.menuItemId} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.menuItemName}</div>
                          <div className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} × {item.quantity}</div>
                        </div>
                        <span className="font-semibold text-sm">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                        <button onClick={() => removeItem(item.menuItemId)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                      <span className="font-semibold">Order Total</span>
                      <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={goNext} size="lg" className="gap-2 px-8">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Guest details ── */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
                <h2 className="text-lg font-serif font-semibold mb-5">Contact Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ahmad Al-Rashid" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="ahmad@example.com" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                    <Input id="phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+971 50 123 4567" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date">Pickup / Delivery Date <span className="text-destructive">*</span></Label>
                    <Input id="date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input id="address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Street, district, city (leave blank for pickup)" />
                  </div>
                </div>
              </div>

              {orderType === 'catering' && (
                <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
                  <h2 className="text-lg font-serif font-semibold mb-5">Catering Details</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="guests">Number of Guests</Label>
                      <Input id="guests" type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="50" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <Label htmlFor="event">Event Description</Label>
                    <Textarea id="event" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} rows={3} placeholder="Wedding reception, corporate lunch, etc." />
                  </div>
                </div>
              )}

              <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
                <h2 className="text-lg font-serif font-semibold mb-3">Special Requests</h2>
                <Textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} placeholder="Dietary restrictions, packaging preferences, or any other notes…" />
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={goBack} className="gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={goNext} size="lg" className="gap-2 px-8">
                  Choose Payment <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Order summary */}
              <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
                <h2 className="text-lg font-serif font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  {cartItems.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between text-muted-foreground">
                      <span>{item.menuItemName} × {item.quantity}</span>
                      <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-border/50 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium">{customerName}</span> · {customerEmail} · {customerPhone}
                  {deliveryAddress && <span> · {deliveryAddress}</span>}
                </div>
              </div>

              {/* Payment options */}
              <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
                <h2 className="text-lg font-serif font-semibold mb-2">How would you like to pay?</h2>
                <p className="text-sm text-muted-foreground mb-6">Choose a payment method to complete your order.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Card */}
                  <button
                    onClick={handleCardPayment}
                    disabled={isSubmitting}
                    className="group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary bg-background hover:bg-primary/5 transition-all duration-200 disabled:opacity-60"
                  >
                    {isSubmitting && <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/70 backdrop-blur-sm"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <CreditCard className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm mb-0.5">Pay by Card</div>
                      <div className="text-xs text-muted-foreground">Secure checkout via Stripe</div>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {['VISA', 'MC', 'AMEX'].map((b) => (
                        <span key={b} className="px-1.5 py-0.5 text-[10px] font-bold bg-muted rounded border border-border/60">{b}</span>
                      ))}
                    </div>
                  </button>

                  {/* Cash */}
                  <button
                    onClick={handleCOD}
                    disabled={isSubmitting}
                    className="group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary bg-background hover:bg-primary/5 transition-all duration-200 disabled:opacity-60"
                  >
                    {isSubmitting && <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/70 backdrop-blur-sm"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <Banknote className="h-7 w-7 text-green-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm mb-0.5">Cash on Delivery</div>
                      <div className="text-xs text-muted-foreground">Pay when you receive your order</div>
                    </div>
                    <div className="mt-1">
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 rounded-full border border-green-200">No upfront payment</span>
                    </div>
                  </button>
                </div>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  🔒 Your information is kept private and secure.
                </p>
              </div>

              <div className="flex justify-start">
                <Button variant="outline" onClick={goBack} className="gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
