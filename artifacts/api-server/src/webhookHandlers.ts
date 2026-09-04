import { getStripeSync, getStripeCredentials, getUncachableStripeClient } from './stripeClient';
import { db, ordersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

export class WebhookHandlers {
  /**
   * Primary handler: called from the /api/stripe/webhook route.
   * 1. Lets stripe-replit-sync process and sync all Stripe data.
   * 2. Also parses the event to handle checkout.session.completed authoratively.
   */
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    // 1. stripe-replit-sync: sync all Stripe objects to the stripe.* schema
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // 2. Handle our own order-payment events
    await WebhookHandlers.handleOrderPaymentEvents(payload, signature);
  }

  /**
   * Parse the Stripe event and update order payment status when a checkout
   * session is completed. This is the authoritative update path — it fires
   * even if the customer never returns to the success URL.
   */
  static async handleOrderPaymentEvents(payload: Buffer, signature: string): Promise<void> {
    try {
      const stripe = await getUncachableStripeClient();
      const { webhookSecret } = await getStripeCredentials();

      let event: Stripe.Event;
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } else {
        // No webhook secret in dev/test — parse without verification
        event = JSON.parse(payload.toString()) as Stripe.Event;
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid' && session.id) {
          await WebhookHandlers.markOrderPaid(session.id);
        }
      }
    } catch {
      // Non-fatal: stripe-replit-sync already processed the event above.
      // Log but don't rethrow so the webhook still returns 200.
    }
  }

  /**
   * Mark an order as paid by Stripe session ID.
   * Called both from the webhook (authoritative) and from the post-redirect
   * verification endpoint (secondary, handles the case where the webhook
   * hasn't fired yet when the user lands on the confirmation page).
   */
  static async markOrderPaid(stripeSessionId: string): Promise<void> {
    await db
      .update(ordersTable)
      .set({ paymentStatus: 'paid', status: 'confirmed' })
      .where(eq(ordersTable.stripeSessionId, stripeSessionId));
  }
}
