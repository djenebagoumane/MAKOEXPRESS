import {
  users,
  drivers,
  orders,
  orderStatusHistory,
  driverRatings,
  type User,
  type UpsertUser,
  type Driver,
  type InsertDriver,
  type Order,
  type InsertOrder,
  type OrderStatusHistory,
  type InsertOrderStatusHistory,
  type DriverRating,
  type InsertDriverRating,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - email/phone auth
  getUser(id: number): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Driver operations
  createDriver(driver: InsertDriver): Promise<Driver>;
  getDriverByUserId(userId: string): Promise<Driver | undefined>;
  getDrivers(): Promise<Driver[]>;
  getPendingDrivers(): Promise<Driver[]>;
  updateDriverStatus(id: number, status: string): Promise<Driver | undefined>;
  updateDriverProfile(id: number, updateData: any): Promise<Driver | undefined>;
  updateDriverOnlineStatus(userId: number, isOnline: boolean): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByTrackingNumber(trackingNumber: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  getOrdersByDriver(driverId: number): Promise<Order[]>;
  getAvailableOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string, driverId?: number): Promise<Order | undefined>;
  updateOrderDriverId(id: number, driverId: number): Promise<Order | undefined>;
  
  // Order status history operations
  addOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;
  
  // Rating operations
  createDriverRating(rating: InsertDriverRating): Promise<DriverRating>;
  getDriverRatings(driverId: string): Promise<DriverRating[]>;
  
  // Dashboard operations
  getDriverStats(driverId: string): Promise<{
    totalDeliveries: number;
    averageRating: number;
    todayEarnings: number;
  }>;
  
  getAdminStats(): Promise<{
    totalOrders: number;
    activeDrivers: number;
    pendingOrders: number;
    completedToday: number;
  }>;
  
  // User account operations
  updateUserProfile(id: string, updateData: any): Promise<User | undefined>;
  getUserTransactions(userId: string): Promise<any[]>;
  updateUserPreferences(userId: string, preferences: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations - simple auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      sql`${users.email} = ${identifier} OR ${users.phoneNumber} = ${identifier}`
    );
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Driver operations
  async createDriver(driver: InsertDriver): Promise<Driver> {
    const [newDriver] = await db
      .insert(drivers)
      .values(driver)
      .returning();
    return newDriver;
  }

  async getDriverByUserId(userId: string): Promise<Driver | undefined> {
    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, parseInt(userId)));
    return driver;
  }

  async updateDriverProfile(id: number, updateData: any): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async getDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).orderBy(desc(drivers.createdAt));
  }

  async getPendingDrivers(): Promise<Driver[]> {
    return await db
      .select()
      .from(drivers)
      .where(eq(drivers.status, "pending"))
      .orderBy(desc(drivers.createdAt));
  }

  async updateDriverStatus(id: number, status: string): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ status, updatedAt: new Date() })
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async updateDriverOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await db
      .update(drivers)
      .set({ isOnline, updatedAt: new Date() })
      .where(eq(drivers.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const trackingNumber = `MAKO${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        trackingNumber,
      })
      .returning();
    
    // Add initial status history
    await this.addOrderStatusHistory({
      orderId: newOrder.id,
      status: "pending",
      notes: "Commande créée",
    });
    
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByTrackingNumber(trackingNumber: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.trackingNumber, trackingNumber));
    return order;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByDriver(driverId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.driverId, driverId))
      .orderBy(desc(orders.createdAt));
  }

  async getAvailableOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.status, "pending"),
        sql`${orders.driverId} IS NULL`
      ))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string, driverId?: string): Promise<Order | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (driverId) {
      updateData.driverId = driverId;
    }
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    if (order) {
      await this.addOrderStatusHistory({
        orderId: id,
        status,
        notes: `Statut mis à jour: ${status}`,
      });
    }

    return order;
  }

  async updateOrderDriverId(id: number, driverId: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ 
        driverId, 
        status: "accepted",
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id))
      .returning();

    if (order) {
      await this.addOrderStatusHistory({
        orderId: id,
        status: "accepted",
        notes: "Commande acceptée par le livreur",
      });
    }

    return order;
  }

  // Order status history operations
  async addOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const [statusHistory] = await db
      .insert(orderStatusHistory)
      .values(history)
      .returning();
    return statusHistory;
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.timestamp));
  }

  // Rating operations
  async createDriverRating(rating: InsertDriverRating): Promise<DriverRating> {
    const [newRating] = await db
      .insert(driverRatings)
      .values(rating)
      .returning();

    // Update driver's average rating
    const avgRating = await db
      .select({
        avg: sql<number>`AVG(${driverRatings.rating})`,
        count: sql<number>`COUNT(${driverRatings.rating})`
      })
      .from(driverRatings)
      .where(eq(driverRatings.driverId, rating.driverId));

    if (avgRating[0]) {
      await db
        .update(drivers)
        .set({ 
          rating: avgRating[0].avg.toFixed(2),
          totalDeliveries: Number(avgRating[0].count),
          updatedAt: new Date() 
        })
        .where(eq(drivers.userId, rating.driverId));
    }

    return newRating;
  }

  async getDriverRatings(driverId: string): Promise<DriverRating[]> {
    return await db
      .select()
      .from(driverRatings)
      .where(eq(driverRatings.driverId, driverId))
      .orderBy(desc(driverRatings.createdAt));
  }

  // Dashboard operations
  async getDriverStats(driverId: string): Promise<{
    totalDeliveries: number;
    averageRating: number;
    todayEarnings: number;
  }> {
    const driver = await this.getDriverByUserId(driverId);
    
    // Get today's completed orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await db
      .select({ price: orders.price })
      .from(orders)
      .where(
        and(
          eq(orders.driverId, driverId),
          eq(orders.status, "delivered"),
          sql`${orders.deliveredAt} >= ${today}`
        )
      );

    const todayEarnings = todayOrders.reduce((sum, order) => 
      sum + Number(order.price), 0
    );

    return {
      totalDeliveries: driver?.totalDeliveries || 0,
      averageRating: Number(driver?.rating) || 0,
      todayEarnings,
    };
  }

  async getAdminStats(): Promise<{
    totalOrders: number;
    activeDrivers: number;
    pendingOrders: number;
    completedToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrdersResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders);

    const [activeDriversResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(drivers)
      .where(and(
        eq(drivers.status, "approved"),
        eq(drivers.isOnline, true)
      ));

    const [pendingOrdersResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const [completedTodayResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(and(
        eq(orders.status, "delivered"),
        sql`${orders.deliveredAt} >= ${today}`
      ));

    return {
      totalOrders: Number(totalOrdersResult.count),
      activeDrivers: Number(activeDriversResult.count),
      pendingOrders: Number(pendingOrdersResult.count),
      completedToday: Number(completedTodayResult.count),
    };
  }

  // User account operations
  async updateUserProfile(id: string, updateData: any): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return undefined;
    }
  }

  async getUserTransactions(userId: string): Promise<any[]> {
    try {
      const userTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt));
      
      return userTransactions;
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      return [];
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<any> {
    try {
      const [updatedPrefs] = await db
        .insert(userPreferences)
        .values({
          userId,
          ...preferences,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: {
            ...preferences,
            updatedAt: new Date(),
          },
        })
        .returning();
      
      return updatedPrefs;
    } catch (error) {
      console.error("Error updating user preferences:", error);
      return null;
    }
  }
}

export const storage = new DatabaseStorage();
