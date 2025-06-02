import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSession, isAuthenticated, hashPassword, verifyPassword } from "./auth";
import { registerSchema, loginSchema } from "@shared/schema";
import { insertOrderSchema, insertDriverSchema, insertDriverRatingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByIdentifier(
        validatedData.email || validatedData.phoneNumber || ""
      );
      
      if (existingUser) {
        return res.status(409).json({ message: "Utilisateur déjà existant" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      res.status(201).json({ message: "Compte créé avec succès", userId: user.id });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email or phone
      const user = await storage.getUserByIdentifier(validatedData.identifier);
      
      if (!user || !(await verifyPassword(validatedData.password, user.password))) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      // Set session
      (req.session as any).userId = user.id;
      
      res.json({ 
        message: "Connexion réussie", 
        user: { 
          id: user.id, 
          firstName: user.firstName, 
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role 
        } 
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Erreur lors de la connexion" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Déconnexion réussie" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        customerId: userId,
      });

      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getOrdersByCustomer(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/track/:trackingNumber', async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const order = await storage.getOrderByTrackingNumber(trackingNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const statusHistory = await storage.getOrderStatusHistory(order.id);
      res.json({ ...order, statusHistory });
    } catch (error) {
      console.error("Error tracking order:", error);
      res.status(500).json({ message: "Failed to track order" });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.claims.sub;

      const order = await storage.updateOrderStatus(Number(id), status, userId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Driver routes
  app.post('/api/drivers/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user already has a driver profile
      const existingDriver = await storage.getDriverByUserId(userId);
      if (existingDriver) {
        return res.status(400).json({ message: "Driver profile already exists" });
      }

      const driverData = insertDriverSchema.parse({
        ...req.body,
        userId,
      });

      const driver = await storage.createDriver(driverData);
      res.json(driver);
    } catch (error) {
      console.error("Error registering driver:", error);
      res.status(400).json({ message: "Failed to register driver" });
    }
  });

  app.get('/api/drivers/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const driver = await storage.getDriverByUserId(userId);
      res.json(driver);
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      res.status(500).json({ message: "Failed to fetch driver profile" });
    }
  });

  app.get('/api/drivers/orders/available', isAuthenticated, async (req: any, res) => {
    try {
      const orders = await storage.getAvailableOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching available orders:", error);
      res.status(500).json({ message: "Failed to fetch available orders" });
    }
  });

  app.get('/api/drivers/orders/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getOrdersByDriver(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching driver orders:", error);
      res.status(500).json({ message: "Failed to fetch driver orders" });
    }
  });

  app.post('/api/drivers/orders/:id/accept', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await storage.updateOrderDriverId(Number(id), userId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error accepting order:", error);
      res.status(500).json({ message: "Failed to accept order" });
    }
  });

  app.patch('/api/drivers/online-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { isOnline } = req.body;

      await storage.updateDriverOnlineStatus(userId, isOnline);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating online status:", error);
      res.status(500).json({ message: "Failed to update online status" });
    }
  });

  app.get('/api/drivers/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDriverStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching driver stats:", error);
      res.status(500).json({ message: "Failed to fetch driver stats" });
    }
  });

  // Rating routes
  app.post('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ratingData = insertDriverRatingSchema.parse({
        ...req.body,
        customerId: userId,
      });

      const rating = await storage.createDriverRating(ratingData);
      res.json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(400).json({ message: "Failed to create rating" });
    }
  });

  // Admin routes
  app.get('/api/admin/drivers/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const drivers = await storage.getPendingDrivers();
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching pending drivers:", error);
      res.status(500).json({ message: "Failed to fetch pending drivers" });
    }
  });

  app.patch('/api/admin/drivers/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      const { status } = req.body;

      const driver = await storage.updateDriverStatus(Number(id), status);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      res.json(driver);
    } catch (error) {
      console.error("Error updating driver status:", error);
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Weather API route
  app.get("/api/weather", async (req, res) => {
    try {
      const location = req.query.location as string || "Bamako";
      const apiKey = process.env.OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Clé API météo non configurée" 
        });
      }

      // Mali cities coordinates
      const maliCities: Record<string, { lat: number; lon: number }> = {
        "bamako": { lat: 12.6392, lon: -8.0029 },
        "sikasso": { lat: 11.3176, lon: -5.6747 },
        "ségou": { lat: 13.4317, lon: -6.2158 },
        "segou": { lat: 13.4317, lon: -6.2158 },
        "mopti": { lat: 14.4843, lon: -4.1960 },
        "koutiala": { lat: 12.3911, lon: -5.4658 },
        "kayes": { lat: 14.4469, lon: -11.4456 },
        "gao": { lat: 16.2719, lon: -0.0447 },
        "tombouctou": { lat: 16.7666, lon: -3.0026 },
        "timbuktu": { lat: 16.7666, lon: -3.0026 }
      };

      const cityKey = location.toLowerCase();
      const coords = maliCities[cityKey] || maliCities["bamako"];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric&lang=fr`;
      
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error("Impossible de récupérer les données météo");
      }
      
      const weatherData = await weatherResponse.json();
      
      // Format response for our widget
      const formattedWeather = {
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind?.speed * 3.6) || 0, // Convert m/s to km/h
        icon: weatherData.weather[0].icon,
        location: location.charAt(0).toUpperCase() + location.slice(1)
      };
      
      res.json(formattedWeather);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ 
        error: "Erreur lors de la récupération des données météo" 
      });
    }
  });

  // Route tracking API endpoint
  app.get("/api/orders/:id/route", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(Number(id));
      
      if (!order) {
        return res.status(404).json({ error: "Commande introuvable" });
      }

      // Mali cities coordinates for authentic routing
      const maliCoordinates: Record<string, { lat: number; lng: number }> = {
        "bamako": { lat: 12.6392, lng: -8.0029 },
        "sikasso": { lat: 11.3176, lng: -5.6747 },
        "ségou": { lat: 13.4317, lng: -6.2158 },
        "segou": { lat: 13.4317, lng: -6.2158 },
        "mopti": { lat: 14.4843, lng: -4.1960 },
        "koutiala": { lat: 12.3911, lng: -5.4658 },
        "kayes": { lat: 14.4469, lng: -11.4456 },
        "gao": { lat: 16.2719, lng: -0.0447 },
        "tombouctou": { lat: 16.7666, lng: -3.0026 }
      };

      // Extract city names from addresses
      const pickupCity = extractCityFromAddress(order.pickupAddress);
      const deliveryCity = extractCityFromAddress(order.deliveryAddress);
      
      const pickupCoords = maliCoordinates[pickupCity.toLowerCase()] || maliCoordinates["bamako"];
      const deliveryCoords = maliCoordinates[deliveryCity.toLowerCase()] || maliCoordinates["bamako"];

      // Calculate authentic route data
      const distance = calculateDistance(
        pickupCoords.lat, pickupCoords.lng,
        deliveryCoords.lat, deliveryCoords.lng
      );

      // Estimate delivery time based on real Mali transportation conditions
      const estimatedMinutes = calculateDeliveryTime(distance, order.packageType);
      
      // Get route status history
      const statusHistory = await storage.getOrderStatusHistory(order.id);
      
      // Format route data
      const routeData = {
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimals
        estimatedTime: formatEstimatedTime(estimatedMinutes),
        currentStatus: order.status,
        pickupLocation: {
          id: "pickup",
          name: pickupCity,
          address: order.pickupAddress,
          lat: pickupCoords.lat,
          lng: pickupCoords.lng,
          type: "pickup",
          status: getLocationStatus("pickup", order.status)
        },
        deliveryLocation: {
          id: "delivery", 
          name: deliveryCity,
          address: order.deliveryAddress,
          lat: deliveryCoords.lat,
          lng: deliveryCoords.lng,
          type: "delivery",
          status: getLocationStatus("delivery", order.status)
        },
        routePoints: generateRouteWaypoints(pickupCoords, deliveryCoords),
        statusHistory: statusHistory.map(status => ({
          id: status.id,
          status: status.status,
          location: status.location,
          notes: status.notes,
          timestamp: status.timestamp
        })),
        progress: calculateProgressPercentage(order.status, statusHistory)
      };

      res.json(routeData);
    } catch (error) {
      console.error("Route tracking error:", error);
      res.status(500).json({ 
        error: "Erreur lors de la récupération des données de route" 
      });
    }
  });

  // Helper functions for route calculations
  function extractCityFromAddress(address: string): string {
    const maliCities = ["Bamako", "Sikasso", "Ségou", "Segou", "Mopti", "Koutiala", "Kayes", "Gao", "Tombouctou"];
    
    for (const city of maliCities) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    return "Bamako"; // Default to Bamako
  }

  function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function calculateDeliveryTime(distance: number, packageType: string): number {
    // Mali transportation speeds (km/h)
    const speeds = {
      "express": 40, // Motorcycle in city
      "standard": 25  // Mixed transportation
    };
    
    const speed = packageType === "express" ? speeds.express : speeds.standard;
    const baseTime = (distance / speed) * 60; // Convert to minutes
    
    // Add buffer time for Mali road conditions
    const bufferMultiplier = 1.3;
    return Math.round(baseTime * bufferMultiplier);
  }

  function formatEstimatedTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }

  function getLocationStatus(locationType: string, orderStatus: string): string {
    if (orderStatus === "pending") return "pending";
    if (orderStatus === "accepted" && locationType === "pickup") return "current";
    if (orderStatus === "picked_up" && locationType === "pickup") return "completed";
    if (orderStatus === "picked_up" && locationType === "delivery") return "current";
    if (orderStatus === "in_transit" && locationType === "delivery") return "current";
    if (orderStatus === "delivered") return "completed";
    return "pending";
  }

  function generateRouteWaypoints(pickup: any, delivery: any): any[] {
    // Generate intermediate waypoints for route visualization
    const waypoints = [];
    const steps = 3;
    
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      waypoints.push({
        id: `waypoint_${i}`,
        name: `Point ${i}`,
        lat: pickup.lat + (delivery.lat - pickup.lat) * progress,
        lng: pickup.lng + (delivery.lng - pickup.lng) * progress,
        type: "waypoint"
      });
    }
    
    return waypoints;
  }

  function calculateProgressPercentage(status: string, history: any[]): number {
    const statusOrder = ["pending", "accepted", "picked_up", "in_transit", "delivered"];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? (currentIndex / (statusOrder.length - 1)) * 100 : 0;
  }

  // Test tracking endpoint with authentic Mali data
  app.get("/api/test-tracking/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      
      const testOrder = {
        id: 1,
        trackingNumber: trackingNumber,
        pickupAddress: "Marché de Medina, Bamako, Mali",
        deliveryAddress: "ACI 2000, Bamako, Mali",
        packageType: "express",
        weight: "0.5kg",
        price: "2000 FCFA",
        status: "in_transit",
        customerPhone: "+223 70 12 34 56",
        driverId: "driver123",
        paymentStatus: "paid",
        paymentMethod: "cash",
        estimatedDeliveryTime: "45 minutes",
        statusHistory: [
          {
            id: 1,
            status: "pending",
            location: "Marché de Medina",
            notes: "Commande créée",
            timestamp: "2025-06-02T06:00:00Z"
          },
          {
            id: 2, 
            status: "accepted",
            location: "Marché de Medina",
            notes: "Livreur assigné",
            timestamp: "2025-06-02T06:15:00Z"
          },
          {
            id: 3,
            status: "picked_up", 
            location: "Marché de Medina",
            notes: "Colis collecté",
            timestamp: "2025-06-02T06:30:00Z"
          },
          {
            id: 4,
            status: "in_transit",
            location: "En route vers ACI 2000",
            notes: "Livraison en cours",
            timestamp: "2025-06-02T06:45:00Z"
          }
        ]
      };
      
      res.json(testOrder);
    } catch (error) {
      console.error("Test tracking error:", error);
      res.status(500).json({ error: "Erreur lors du test de suivi" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
