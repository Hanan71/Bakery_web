import { pgTable, text, serial, integer, timestamp, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { menuItemsTable } from "./menu-items";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'bulk' | 'catering'
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  scheduledDate: date("scheduled_date", { mode: "string" }).notNull(),
  eventDescription: text("event_description"),
  guestCount: integer("guest_count"),
  deliveryAddress: text("delivery_address"),
  status: text("status").notNull().default("pending"), // pending | confirmed | in_progress | completed | cancelled
  paymentMethod: text("payment_method").notNull().default("cash_on_delivery"), // 'card' | 'cash_on_delivery'
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending' | 'paid' | 'failed'
  stripeSessionId: text("stripe_session_id"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItemsTable.id),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({ id: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
