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
  
  // Basic Information
  fullName: varchar("full_name").notNull(),
  identityNumber: varchar("identity_number").notNull(),
  identityType: varchar("identity_type").notNull(), // cni, passport, carte_consulaire
  declaredCountry: varchar("declared_country").notNull(),
  age: integer("age").notNull(),
  
  // Geolocation Verification
  gpsLatitude: varchar("gps_latitude"),
  gpsLongitude: varchar("gps_longitude"),
  locationVerified: boolean("location_verified").default(false),
  
  // Documents & Photos
  selfiePhotoUrl: varchar("selfie_photo_url"),
  identityDocumentUrl: varchar("identity_document_url"),
  healthCertificateUrl: varchar("health_certificate_url"),
  driversLicenseUrl: varchar("drivers_license_url"),
  vehicleRegistrationUrl: varchar("vehicle_registration_url"),
  insuranceCertificateUrl: varchar("insurance_certificate_url"),
  medicalCertificateUrl: varchar("medical_certificate_url"),
  
  // Transport & Availability
  vehicleType: varchar("vehicle_type").notNull(), // moto, velo, voiture, van
  vehicleRegistration: varchar("vehicle_registration"),
  driversLicense: varchar("drivers_license"),
  availabilityHours: varchar("availability_hours").notNull(), // "08:00-18:00"
  
  // Contact & Payment
  phone: varchar("phone").notNull(),
  whatsappNumber: varchar("whatsapp_number").notNull(),
  makoPayId: varchar("makopay_id").notNull(),
  
  // Location
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  
  // Verification Status
  profileImageUrl: varchar("profile_image_url"),
  status: varchar("status").notNull().default("incomplete"), // incomplete, pending, approved, rejected, suspended
  verificationStep: varchar("verification_step").default("profile"), // profile, documents, geolocation, manual_review, completed
  rejectionReason: text("rejection_reason"),
  
  // Equipment & Commission Tier
  equipmentTier: varchar("equipment_tier").default("standard"), // "standard" or "premium"
  hasGpsEquipment: boolean("has_gps_equipment").default(false),
  hasInsurance: boolean("has_insurance").default(false),
  hasUniform: boolean("has_uniform").default(false),
  commissionRate: decimal("commission_rate", { precision: 3, scale: 2 }).default("0.20"), // 20% for standard, 30% for premium
  
  // Performance
  isOnline: boolean("is_online").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalDeliveries: integer("total_deliveries").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
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

// Driver wallet for earnings management
export const driverWallets = pgTable("driver_wallets", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  makoPayId: varchar("makopay_id"), // MakoPay account for transfers
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table for MakoPay payments and transfers
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  fromUserId: integer("from_user_id").references(() => users.id),
  toUserId: integer("to_user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  adminCommission: decimal("admin_commission", { precision: 10, scale: 2 }).notNull().default("0.00"),
  driverPortion: decimal("driver_portion", { precision: 10, scale: 2 }).notNull().default("0.00"),
  type: varchar("type").notNull(), // payment, transfer, commission, withdrawal
  status: varchar("status").notNull().default("pending"), // pending, completed, failed
  makoPayTransactionId: varchar("makopay_transaction_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawal requests from drivers
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  makoPayAccount: varchar("makopay_account").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected, completed
  approvedBy: integer("approved_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin commission tracking
export const adminCommissions = pgTable("admin_commissions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull().default("20.00"),
  transactionId: integer("transaction_id").references(() => transactions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User delivery preferences for personalized recommendations
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  preferredDeliveryTime: varchar("preferred_delivery_time"), // morning, afternoon, evening
  preferredPackageTypes: text("preferred_package_types").array(), // documents, food, electronics, etc.
  frequentAddresses: jsonb("frequent_addresses"), // array of frequent pickup/delivery addresses
  budgetRange: varchar("budget_range"), // low, medium, high
  urgencyPreference: varchar("urgency_preference"), // standard, express
  preferredDrivers: text("preferred_drivers").array(), // list of preferred driver IDs
  deliveryPatterns: jsonb("delivery_patterns"), // analysis of delivery frequency and patterns
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery recommendations generated by the AI engine
export const deliveryRecommendations = pgTable("delivery_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recommendationType: varchar("recommendation_type").notNull(), // route_optimization, time_suggestion, driver_match, price_optimization
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  suggestedPickupAddress: text("suggested_pickup_address"),
  suggestedDeliveryAddress: text("suggested_delivery_address"),
  suggestedTime: timestamp("suggested_time"),
  suggestedDriver: integer("suggested_driver").references(() => drivers.id),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // in minutes
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  metadata: jsonb("metadata"), // additional data like weather impact, traffic conditions
  isActive: boolean("is_active").default(true),
  wasAccepted: boolean("was_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
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
