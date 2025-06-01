import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - simple auth with phone or email
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique(),
  phoneNumber: varchar("phone_number").unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  password: varchar("password").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  address: text("address"),
  role: varchar("role").notNull().default("customer"), // customer, driver, admin
  isVerified: boolean("is_verified").default(false),
  verificationCode: varchar("verification_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Driver profiles table
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  vehicleType: varchar("vehicle_type").notNull(), // moto, vélo, voiture, à pied
  age: integer("age").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  identityDocumentUrl: varchar("identity_document_url"),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected, suspended
  isOnline: boolean("is_online").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalDeliveries: integer("total_deliveries").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  trackingNumber: varchar("tracking_number").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  driverId: integer("driver_id").references(() => users.id),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  packageType: varchar("package_type").notNull(),
  weight: varchar("weight").notNull(),
  urgency: varchar("urgency").notNull(), // standard, express, urgent
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, accepted, picked_up, in_transit, delivered, cancelled
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, paid, failed
  paymentMethod: varchar("payment_method"), // makopay, cash, card
  notes: text("notes"),
  customerPhone: varchar("customer_phone"),
  deliveryInstructions: text("delivery_instructions"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order status history table
export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  status: varchar("status").notNull(),
  location: varchar("location"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Driver ratings table
export const driverRatings = pgTable("driver_ratings", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  driverId: integer("driver_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  driverProfile: many(drivers),
  ratingsGiven: many(driverRatings),
}));

export const driversRelations = relations(drivers, ({ one }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  driver: one(users, {
    fields: [orders.driverId],
    references: [users.id],
  }),
  statusHistory: many(orderStatusHistory),
  rating: many(driverRatings),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));

export const driverRatingsRelations = relations(driverRatings, ({ one }) => ({
  order: one(orders, {
    fields: [driverRatings.orderId],
    references: [orders.id],
  }),
  customer: one(users, {
    fields: [driverRatings.customerId],
    references: [users.id],
  }),
  driver: one(users, {
    fields: [driverRatings.driverId],
    references: [users.id],
  }),
}));

// Auth schemas
export const registerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional(),
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide").optional(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
}).refine(data => data.email || data.phoneNumber, {
  message: "Email ou numéro de téléphone requis",
  path: ["email"]
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email ou téléphone requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  trackingNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory).omit({
  id: true,
  timestamp: true,
});

export const insertDriverRatingSchema = createInsertSchema(driverRatings).omit({
  id: true,
  createdAt: true,
});

// Types
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertDriverRating = z.infer<typeof insertDriverRatingSchema>;
export type DriverRating = typeof driverRatings.$inferSelect;
