import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, menuItemsTable } from "@workspace/db";
import {
  CreateOrderBody,
  CreateOrderResponse,
  CreateCheckoutSessionBody,
  CreateCheckoutSessionResponse,
  GetOrderParams,
  GetOrderResponse,
  ListOrdersResponse,
} from "@workspace/api-zod";
import { getUncachableStripeClient } from "../stripeClient";
import { WebhookHandlers } from "../webhookHandlers";

const router: IRouter = Router();

async function fetchOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;

  const items = await db
    .select({
      id: orderItemsTable.id,
      menuItemId: orderItemsTable.menuItemId,
      menuItemName: menuItemsTable.name,
      quantity: orderItemsTable.quantity,
      unitPrice: orderItemsTable.unitPrice,
      subtotal: orderItemsTable.unitPrice,
      notes: orderItemsTable.notes,
    })
    .from(orderItemsTable)
    .leftJoin(menuItemsTable, eq(orderItemsTable.menuItemId, menuItemsTable.id))
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    ...order,
    totalAmount: parseFloat(order.totalAmount as unknown as string),
    paymentMethod: order.paymentMethod ?? 'cash_on_delivery',
    paymentStatus: order.paymentStatus ?? 'pending',
    stripeSessionId: order.stripeSessionId ?? null,
    items: items.map(i => ({
      ...i,
      menuItemName: i.menuItemName ?? "Unknown",
      unitPrice: parseFloat(i.unitPrice as unknown as string),
      subtotal: parseFloat(i.unitPrice as unknown as string) * i.quantity,
    })),
    createdAt: order.createdAt.toISOString(),
  };
}

/** Resolve items from DB and calculate total */
async function resolveItems(items: Array<{ menuItemId: number; quantity: number; notes?: string | null }>) {
  let totalAmount = 0;
  const resolved: Array<{ menuItemId: number; quantity: number; notes: string | null; unitPrice: number }> = [];

  for (const item of items) {
    const [menuItem] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, item.menuItemId));
    if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
    const unitPrice = parseFloat(menuItem.price as unknown as string);
    totalAmount += unitPrice * item.quantity;
    resolved.push({ menuItemId: item.menuItemId, quantity: item.quantity, notes: item.notes ?? null, unitPrice });
  }

  return { totalAmount, resolved };
}

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  const result = [];
  for (const order of orders) {
    const full = await fetchOrderWithItems(order.id);
    if (full) result.push(full);
  }
  res.json(ListOrdersResponse.parse(result));
});

router.post("/orders", async (req, res): Promise<void> => {
  const bodyResult = CreateOrderBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.message });
    return;
  }

  const { items, ...orderData } = bodyResult.data;

  let totalAmount: number;
  let resolvedItems: Array<{ menuItemId: number; quantity: number; notes: string | null; unitPrice: number }>;

  try {
    const r = await resolveItems(items);
    totalAmount = r.totalAmount;
    resolvedItems = r.resolved;
  } catch (err: any) {
    res.status(400).json({ error: err.message });
    return;
  }

  const [order] = await db.insert(ordersTable).values({
    ...orderData,
    totalAmount: String(totalAmount),
    paymentMethod: orderData.paymentMethod ?? 'cash_on_delivery',
    paymentStatus: 'pending',
  }).returning();

  for (const item of resolvedItems) {
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      notes: item.notes,
    });
  }

  const full = await fetchOrderWithItems(order.id);
  res.status(201).json(CreateOrderResponse.parse(full));
});

/** POST /orders/checkout-session — creates a Stripe Checkout Session and returns the URL */
router.post("/orders/checkout-session", async (req, res): Promise<void> => {
  const bodyResult = CreateCheckoutSessionBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.message });
    return;
  }

  const { orderData, successUrl, cancelUrl } = bodyResult.data;
  const { items, ...restOrderData } = orderData;

  let totalAmount: number;
  let resolvedItems: Array<{ menuItemId: number; quantity: number; notes: string | null; unitPrice: number }>;

  try {
    const r = await resolveItems(items);
    totalAmount = r.totalAmount;
    resolvedItems = r.resolved;
  } catch (err: any) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Create the order first (paymentStatus = pending, will update to paid via webhook)
  const [order] = await db.insert(ordersTable).values({
    ...restOrderData,
    totalAmount: String(totalAmount),
    paymentMethod: 'card',
    paymentStatus: 'pending',
  }).returning();

  for (const item of resolvedItems) {
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      notes: item.notes,
    });
  }

  // Build Stripe line items from menu items
  const menuItemIds = resolvedItems.map(i => i.menuItemId);
  const menuItemDetails = await Promise.all(
    menuItemIds.map(id => db.select().from(menuItemsTable).where(eq(menuItemsTable.id, id)))
  );

  const lineItems = resolvedItems.map((item, idx) => {
    const menuItem = menuItemDetails[idx][0];
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: menuItem?.name ?? `Item #${item.menuItemId}`,
          description: menuItem?.description ?? undefined,
          images: menuItem?.imageUrl ? [`https://${process.env.REPLIT_DOMAINS?.split(',')[0]}${menuItem.imageUrl}`] : undefined,
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    };
  });

  const stripe = await getUncachableStripeClient();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${successUrl}?id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${cancelUrl}?cancelled=true`,
    metadata: { orderId: String(order.id) },
  });

  // Store the Stripe session ID on the order
  await db.update(ordersTable)
    .set({ stripeSessionId: session.id })
    .where(eq(ordersTable.id, order.id));

  res.status(201).json(CreateCheckoutSessionResponse.parse({
    sessionUrl: session.url!,
    orderId: order.id,
  }));
});

/** POST /orders/stripe-payment-success — called after Stripe redirect to verify and mark paid */
router.post("/orders/stripe-payment-success", async (req, res): Promise<void> => {
  const { sessionId } = req.body;
  if (!sessionId) {
    res.status(400).json({ error: 'sessionId required' });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      await WebhookHandlers.markOrderPaid(sessionId);
    }

    res.json({ paymentStatus: session.payment_status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const paramsResult = GetOrderParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.message });
    return;
  }

  const order = await fetchOrderWithItems(paramsResult.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(order));
});

export default router;
