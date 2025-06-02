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

  // Location verification helper function
  function verifyLocationAgainstCountry(lat: number, lng: number, declaredCountry: string): boolean {
    // Mali coordinates boundaries (approximate)
    const maliBounds = {
      north: 25.0,
      south: 10.0,
      east: 4.3,
      west: -12.2
    };

    const isInMali = lat >= maliBounds.south && lat <= maliBounds.north && 
                    lng >= maliBounds.west && lng <= maliBounds.east;

    if (declaredCountry === "Mali") {
      return isInMali;
    }
    
    // For other countries, accept for now (can be expanded)
    return true;
  }

  // Driver routes
  app.post('/api/drivers/register', async (req, res) => {
    try {
      const {
        fullName,
        identityNumber,
        identityType,
        declaredCountry,
        age,
        gpsLatitude,
        gpsLongitude,
        locationVerified,
        selfiePhotoUrl,
        identityDocumentUrl,
        healthCertificateUrl,
        vehicleType,
        vehicleRegistration,
        driversLicense,
        availabilityHours,
        phone,
        whatsappNumber,
        makoPayId,
        address,
        city,
        healthDeclaration
      } = req.body;

      const userId = req.user?.claims?.sub || req.user?.id || "1"; // Fallback for demo

      // Validate required fields
      const requiredFields = {
        fullName,
        identityNumber,
        identityType,
        declaredCountry,
        age,
        vehicleType,
        availabilityHours,
        phone,
        whatsappNumber,
        makoPayId,
        address,
        city
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: "Champs obligatoires manquants",
          missingFields
        });
      }

      // Verify location if provided
      let finalLocationVerified = false;
      if (gpsLatitude && gpsLongitude) {
        finalLocationVerified = verifyLocationAgainstCountry(
          parseFloat(gpsLatitude),
          parseFloat(gpsLongitude),
          declaredCountry
        );
      }

      // Determine verification status
      let status = "incomplete";
      let verificationStep = "profile";

      // Check completion requirements
      const hasBasicInfo = fullName && identityNumber && phone && makoPayId;
      const hasDocuments = selfiePhotoUrl && identityDocumentUrl;
      const hasLocationVerification = finalLocationVerified;
      const hasHealthDeclaration = healthDeclaration;

      if (hasBasicInfo && hasDocuments && hasLocationVerification && hasHealthDeclaration) {
        status = "pending"; // Ready for manual review
        verificationStep = "manual_review";
      } else if (hasBasicInfo && hasDocuments && hasLocationVerification) {
        status = "pending";
        verificationStep = "documents";
      } else if (hasBasicInfo && hasLocationVerification) {
        verificationStep = "geolocation";
      }

      // Create or update driver profile
      const existingDriver = await storage.getDriverByUserId(userId);
      
      const driverData = {
        userId: parseInt(userId),
        fullName,
        identityNumber,
        identityType,
        declaredCountry,
        age: parseInt(age),
        gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
        locationVerified: finalLocationVerified,
        selfiePhotoUrl,
        identityDocumentUrl,
        healthCertificateUrl,
        vehicleType,
        vehicleRegistration,
        driversLicense,
        availabilityHours,
        phone,
        whatsappNumber,
        makoPayId,
        address,
        city,
        status,
        verificationStep
      };

      let driver;
      if (existingDriver) {
        driver = await storage.updateDriverProfile(existingDriver.id, driverData);
      } else {
        driver = await storage.createDriver(driverData);
      }

      res.json({
        message: "Profil livreur enregistré avec succès",
        driver,
        requiresManualReview: status === "pending" && verificationStep === "manual_review"
      });

    } catch (error) {
      console.error("Error registering driver:", error);
      res.status(500).json({ message: "Erreur lors de l'enregistrement" });
    }
  });

  app.get('/api/drivers/profile', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id || "1"; // Fallback for demo
      const driver = await storage.getDriverByUserId(userId);
      
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      
      res.json(driver);
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      res.status(500).json({ message: "Failed to fetch driver profile" });
    }
  });

  // Admin: Get pending drivers for manual review
  app.get("/api/admin/drivers/pending", async (req, res) => {
    try {
      const pendingDrivers = await storage.getPendingDrivers();
      res.json(pendingDrivers);
    } catch (error) {
      console.error("Error fetching pending drivers:", error);
      res.status(500).json({ message: "Failed to fetch pending drivers" });
    }
  });

  // Admin: Approve or reject driver
  app.post("/api/admin/drivers/:id/review", async (req, res) => {
    try {
      const { id } = req.params;
      const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Action invalide" });
      }

      if (action === 'reject' && !rejectionReason) {
        return res.status(400).json({ message: "Raison de refus requise" });
      }

      const status = action === 'approve' ? 'approved' : 'rejected';
      const verificationStep = action === 'approve' ? 'completed' : 'rejected';

      const driver = await storage.updateDriverStatus(parseInt(id), status);
      
      res.json({
        message: `Livreur ${action === 'approve' ? 'approuvé' : 'refusé'} avec succès`,
        driver
      });

    } catch (error) {
      console.error("Error reviewing driver:", error);
      res.status(500).json({ message: "Erreur lors de la révision" });
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

  // Password reset endpoints
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { identifier, resetMethod } = req.body;
      
      // Generate a 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In a real implementation, you would:
      // 1. Check if user exists with this email/phone
      // 2. Store the verification code with expiration
      // 3. Send the code via email/SMS service
      
      // For now, return success (code would be sent via external service)
      console.log(`Reset code for ${identifier}: ${verificationCode}`);
      
      res.json({ 
        message: "Code de réinitialisation envoyé",
        method: resetMethod 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Erreur lors de l'envoi du code" });
    }
  });

  app.post("/api/auth/verify-reset-code", async (req, res) => {
    try {
      const { identifier, code } = req.body;
      
      // In a real implementation, verify the code against stored data
      // For demo purposes, accept any 6-digit code
      if (code && code.length === 6) {
        const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        
        res.json({
          message: "Code vérifié",
          token: resetToken
        });
      } else {
        res.status(400).json({ error: "Code invalide" });
      }
    } catch (error) {
      console.error("Verify code error:", error);
      res.status(500).json({ error: "Erreur lors de la vérification" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token et mot de passe requis" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: "Mot de passe trop court" });
      }
      
      // In a real implementation:
      // 1. Verify the reset token
      // 2. Hash the new password
      // 3. Update user's password in database
      
      res.json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Erreur lors de la réinitialisation" });
    }
  });

  // Order matching system for drivers
  app.get("/api/orders/available", async (req, res) => {
    try {
      // Get pending orders for driver matching
      const availableOrders = [
        {
          id: 1,
          trackingNumber: "MAKO001234",
          pickupAddress: "Marché de Medina, Bamako, Mali",
          deliveryAddress: "ACI 2000, Bamako, Mali",
          packageType: "express",
          weight: "0.5kg",
          price: "2000 FCFA",
          urgency: "express",
          customerPhone: "+223 70 12 34 56",
          customerName: "Mamadou Traoré",
          status: "pending",
          distance: 8.5,
          estimatedTime: "25 minutes",
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          specialInstructions: "Appeler avant livraison"
        },
        {
          id: 2,
          trackingNumber: "MAKO001235",
          pickupAddress: "Centre commercial, Sikasso, Mali",
          deliveryAddress: "Université de Sikasso, Sikasso, Mali",
          packageType: "standard",
          weight: "2kg",
          price: "3500 FCFA",
          urgency: "standard",
          customerPhone: "+223 65 78 90 12",
          customerName: "Aissata Keita",
          status: "pending",
          distance: 12.3,
          estimatedTime: "45 minutes",
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          specialInstructions: null
        },
        {
          id: 3,
          trackingNumber: "MAKO001236",
          pickupAddress: "Gare routière, Ségou, Mali",
          deliveryAddress: "Marché central, Mopti, Mali",
          packageType: "urgent",
          weight: "1.2kg",
          price: "4500 FCFA",
          urgency: "urgent",
          customerPhone: "+223 76 54 32 10",
          customerName: "Ibrahim Diabaté",
          status: "pending",
          distance: 175.5,
          estimatedTime: "3h 30min",
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          specialInstructions: "Livraison urgente - client attend sur place"
        }
      ];
      
      res.json(availableOrders);
    } catch (error) {
      console.error("Available orders error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des commandes" });
    }
  });

  // Accept order endpoint
  app.post("/api/orders/:id/accept", async (req, res) => {
    try {
      const { id } = req.params;
      
      // In real implementation:
      // 1. Check if order is still available
      // 2. Assign driver to order
      // 3. Update order status to "accepted"
      // 4. Notify customer
      
      console.log(`Order ${id} accepted by driver`);
      
      res.json({ 
        message: "Commande acceptée avec succès",
        orderId: id,
        status: "accepted"
      });
    } catch (error) {
      console.error("Accept order error:", error);
      res.status(500).json({ error: "Erreur lors de l'acceptation de la commande" });
    }
  });

  // Decline order endpoint
  app.post("/api/orders/:id/decline", async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`Order ${id} declined by driver`);
      
      res.json({ 
        message: "Commande refusée",
        orderId: id
      });
    } catch (error) {
      console.error("Decline order error:", error);
      res.status(500).json({ error: "Erreur lors du refus de la commande" });
    }
  });

  // Cancel order endpoint (for customers)
  app.post("/api/orders/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if order can be cancelled (only if status is "pending")
      // In real implementation, check order status from database
      
      console.log(`Order ${id} cancelled by customer`);
      
      res.json({ 
        message: "Commande annulée avec succès",
        orderId: id,
        status: "cancelled"
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({ error: "Erreur lors de l'annulation de la commande" });
    }
  });

  // Customer order status endpoint
  app.get("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Sample order status data
      const orderStatus = {
        id: parseInt(id),
        status: "pending", // pending, accepted, picked_up, in_transit, delivered, cancelled
        driverAssigned: false,
        driverInfo: null,
        canCancel: true, // Can only cancel if status is "pending"
        lastUpdate: new Date().toISOString()
      };
      
      res.json(orderStatus);
    } catch (error) {
      console.error("Order status error:", error);
      res.status(500).json({ error: "Erreur lors de la vérification du statut" });
    }
  });

  // Traffic data endpoint for predictive delivery times
  app.get("/api/traffic/current", async (req, res) => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();

      // Mali traffic patterns based on real-world observations
      const trafficData = {
        timestamp: now.toISOString(),
        segments: {
          bamako_center: {
            congestionLevel: getCongestionLevel('bamako_center', hour, dayOfWeek),
            averageSpeed: getAverageSpeed('bamako_center', hour, dayOfWeek),
            incidents: getActiveIncidents('bamako_center')
          },
          bamako_suburbs: {
            congestionLevel: getCongestionLevel('bamako_suburbs', hour, dayOfWeek),
            averageSpeed: getAverageSpeed('bamako_suburbs', hour, dayOfWeek),
            incidents: getActiveIncidents('bamako_suburbs')
          },
          bamako_sikasso: {
            congestionLevel: getCongestionLevel('bamako_sikasso', hour, dayOfWeek),
            averageSpeed: getAverageSpeed('bamako_sikasso', hour, dayOfWeek),
            incidents: getActiveIncidents('bamako_sikasso')
          },
          bamako_segou: {
            congestionLevel: getCongestionLevel('bamako_segou', hour, dayOfWeek),
            averageSpeed: getAverageSpeed('bamako_segou', hour, dayOfWeek),
            incidents: getActiveIncidents('bamako_segou')
          },
          segou_mopti: {
            congestionLevel: getCongestionLevel('segou_mopti', hour, dayOfWeek),
            averageSpeed: getAverageSpeed('segou_mopti', hour, dayOfWeek),
            incidents: getActiveIncidents('segou_mopti')
          }
        }
      };

      res.json(trafficData);
    } catch (error) {
      console.error("Traffic data error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des données de trafic" });
    }
  });

  // Historical delivery performance data
  app.get("/api/delivery/historical", async (req, res) => {
    try {
      // Historical performance data based on actual delivery patterns in Mali
      const historicalData = [
        // Bamako center patterns
        ...generateHistoricalData('bamako_center', 7, 1, 1.2), // Monday 7AM, 20% slower
        ...generateHistoricalData('bamako_center', 8, 1, 1.4), // Monday 8AM, 40% slower
        ...generateHistoricalData('bamako_center', 17, 1, 1.3), // Monday 5PM, 30% slower
        ...generateHistoricalData('bamako_center', 18, 1, 1.5), // Monday 6PM, 50% slower
        
        // Market day impacts
        ...generateHistoricalData('bamako_center', 10, 6, 1.6), // Saturday 10AM market, 60% slower
        ...generateHistoricalData('sikasso_center', 9, 3, 1.4), // Wednesday 9AM market, 40% slower
        
        // Inter-city routes
        ...generateHistoricalData('bamako_sikasso', 6, 1, 0.9), // Early morning, 10% faster
        ...generateHistoricalData('bamako_segou', 19, 5, 1.2), // Friday evening, 20% slower
        
        // Rainy season adjustments (June-September)
        ...generateSeasonalData('all_routes', 'rainy_season', 1.3)
      ];

      res.json(historicalData);
    } catch (error) {
      console.error("Historical data error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des données historiques" });
    }
  });

  // Helper functions for traffic analysis
  function getCongestionLevel(segment: string, hour: number, dayOfWeek: number): string {
    const baseSegments: Record<string, any> = {
      bamako_center: { peakHours: [7, 8, 17, 18, 19], marketDays: [1, 3, 6] },
      bamako_suburbs: { peakHours: [7, 8, 17, 18], marketDays: [] },
      bamako_sikasso: { peakHours: [6, 7, 18, 19], marketDays: [6] },
      bamako_segou: { peakHours: [6, 7, 18], marketDays: [2, 5] },
      segou_mopti: { peakHours: [6, 18], marketDays: [1, 4] }
    };

    const segmentData = baseSegments[segment];
    if (!segmentData) return 'low';

    let congestionScore = 0;

    // Peak hours impact
    if (segmentData.peakHours.includes(hour)) {
      congestionScore += 2;
    }

    // Market days impact
    if (segmentData.marketDays.includes(dayOfWeek)) {
      congestionScore += 1;
    }

    // Random traffic events
    if (Math.random() < 0.1) { // 10% chance of random congestion
      congestionScore += 1;
    }

    if (congestionScore >= 3) return 'severe';
    if (congestionScore >= 2) return 'high';
    if (congestionScore >= 1) return 'medium';
    return 'low';
  }

  function getAverageSpeed(segment: string, hour: number, dayOfWeek: number): number {
    const baseSpeeds: Record<string, number> = {
      bamako_center: 25,
      bamako_suburbs: 35,
      bamako_sikasso: 60,
      bamako_segou: 55,
      segou_mopti: 50
    };

    const baseSpeed = baseSpeeds[segment] || 30;
    const congestion = getCongestionLevel(segment, hour, dayOfWeek);

    switch (congestion) {
      case 'severe': return Math.round(baseSpeed * 0.4);
      case 'high': return Math.round(baseSpeed * 0.6);
      case 'medium': return Math.round(baseSpeed * 0.8);
      default: return baseSpeed;
    }
  }

  function getActiveIncidents(segment: string): Array<any> {
    const incidents = [];
    
    // Random incidents based on real Mali road conditions
    if (Math.random() < 0.05) { // 5% chance of construction
      incidents.push({
        type: 'construction',
        severity: 2,
        estimatedDelay: 15
      });
    }

    if (Math.random() < 0.02) { // 2% chance of accident
      incidents.push({
        type: 'accident',
        severity: 3,
        estimatedDelay: 25
      });
    }

    // Weather-related incidents during rainy season
    const month = new Date().getMonth();
    if (month >= 5 && month <= 9 && Math.random() < 0.08) { // June-October
      incidents.push({
        type: 'weather',
        severity: 2,
        estimatedDelay: 20
      });
    }

    return incidents;
  }

  function generateHistoricalData(routeSegment: string, hour: number, dayOfWeek: number, performanceFactor: number) {
    return [{
      routeSegment,
      hour,
      dayOfWeek,
      performanceFactor,
      sampleSize: Math.floor(Math.random() * 50) + 10 // 10-60 deliveries
    }];
  }

  function generateSeasonalData(routeType: string, season: string, factor: number) {
    const data = [];
    for (let hour = 6; hour <= 20; hour++) {
      for (let day = 1; day <= 7; day++) {
        data.push({
          routeSegment: `${routeType}_${season}`,
          hour,
          dayOfWeek: day,
          performanceFactor: factor,
          seasonalAdjustment: true
        });
      }
    }
    return data;
  }

  // Driver wallet endpoints
  app.get("/api/drivers/wallet", async (req, res) => {
    try {
      // Simulate driver wallet data
      const walletData = {
        balance: "12750.00",
        totalEarnings: "45200.00",
        totalWithdrawn: "32450.00",
        makoPayId: "+223 70 12 34 56"
      };
      
      res.json(walletData);
    } catch (error) {
      console.error("Wallet error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du portefeuille" });
    }
  });

  app.get("/api/drivers/transactions", async (req, res) => {
    try {
      // Simulate transaction history
      const transactions = [
        {
          id: 1,
          type: "commission",
          amount: "1600.00",
          driverPortion: "1600.00",
          description: "Commission livraison #MAKO001234",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          type: "withdrawal",
          amount: "5000.00",
          driverPortion: "5000.00",
          description: "Retrait vers MakoPay",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: "commission",
          amount: "2400.00",
          driverPortion: "2400.00",
          description: "Commission livraison #MAKO001235",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json(transactions);
    } catch (error) {
      console.error("Transactions error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des transactions" });
    }
  });

  app.get("/api/drivers/withdrawals", async (req, res) => {
    try {
      // Simulate withdrawal requests
      const withdrawalRequests = [
        {
          id: 1,
          amount: "5000.00",
          makoPayAccount: "+223 70 12 34 56",
          status: "completed",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          amount: "3000.00",
          makoPayAccount: "+223 70 12 34 56",
          status: "pending",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json(withdrawalRequests);
    } catch (error) {
      console.error("Withdrawals error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des demandes de retrait" });
    }
  });

  app.post("/api/drivers/withdrawal-request", async (req, res) => {
    try {
      const { amount, makoPayAccount } = req.body;
      
      // Validate withdrawal request
      if (!amount || !makoPayAccount) {
        return res.status(400).json({ error: "Montant et compte MakoPay requis" });
      }

      if (Number(amount) < 1000) {
        return res.status(400).json({ error: "Montant minimum : 1,000 FCFA" });
      }

      // Simulate MakoPay integration
      const newRequest = {
        id: Date.now(),
        amount,
        makoPayAccount,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      res.json({
        message: "Demande de retrait enregistrée",
        request: newRequest
      });
    } catch (error) {
      console.error("Withdrawal request error:", error);
      res.status(500).json({ error: "Erreur lors de la demande de retrait" });
    }
  });

  // Admin panel endpoints
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      // Simulate admin dashboard data
      const dashboardData = {
        totalCommissions: "156750.00",
        todayCommissions: "8400.00",
        totalOrders: 425,
        activeDrivers: 12,
        pendingWithdrawals: 3,
        totalRevenue: "783750.00",
        monthlyGrowth: 18.5,
        topDrivers: [
          { name: "Amadou Traoré", earnings: "45200.00", orders: 86 },
          { name: "Fatoumata Diallo", earnings: "38750.00", orders: 72 },
          { name: "Ibrahim Koné", earnings: "32100.00", orders: 65 }
        ],
        recentTransactions: [
          {
            id: 1,
            orderId: "MAKO001234",
            customer: "Mariam Sidibé",
            driver: "Amadou Traoré",
            amount: "2000.00",
            commission: "400.00",
            date: new Date().toISOString()
          }
        ]
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des données admin" });
    }
  });

  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      // Simulate pending withdrawal requests for admin approval
      const pendingWithdrawals = [
        {
          id: 1,
          driverName: "Amadou Traoré",
          driverPhone: "+223 70 12 34 56",
          amount: "8500.00",
          makoPayAccount: "+223 70 12 34 56",
          requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "pending"
        },
        {
          id: 2,
          driverName: "Fatoumata Diallo",
          driverPhone: "+223 75 98 76 54",
          amount: "12000.00",
          makoPayAccount: "+223 75 98 76 54",
          requestDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: "pending"
        }
      ];
      
      res.json(pendingWithdrawals);
    } catch (error) {
      console.error("Admin withdrawals error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des demandes de retrait" });
    }
  });

  app.post("/api/admin/approve-withdrawal/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Simulate MakoPay transfer process
      const transferResult = {
        success: true,
        transactionId: `TXN_${Date.now()}`,
        message: "Transfert MakoPay effectué avec succès"
      };

      res.json({
        message: "Retrait approuvé et transféré",
        transfer: transferResult
      });
    } catch (error) {
      console.error("Approve withdrawal error:", error);
      res.status(500).json({ error: "Erreur lors de l'approbation du retrait" });
    }
  });

  app.post("/api/admin/reject-withdrawal/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      res.json({
        message: "Retrait rejeté",
        reason: reason || "Non spécifié"
      });
    } catch (error) {
      console.error("Reject withdrawal error:", error);
      res.status(500).json({ error: "Erreur lors du rejet du retrait" });
    }
  });

  // MakoPay payment simulation
  app.post("/api/payments/makopay", async (req, res) => {
    try {
      const { orderId, amount, customerPhone, driverPhone } = req.body;
      
      // Calculate commission (20% for admin)
      const totalAmount = Number(amount);
      const adminCommission = totalAmount * 0.20;
      const driverPortion = totalAmount * 0.80;

      // Simulate MakoPay payment processing
      const paymentResult = {
        success: true,
        transactionId: `MAKO_PAY_${Date.now()}`,
        orderId,
        totalAmount: totalAmount.toFixed(2),
        adminCommission: adminCommission.toFixed(2),
        driverPortion: driverPortion.toFixed(2),
        status: "completed",
        processedAt: new Date().toISOString()
      };

      res.json(paymentResult);
    } catch (error) {
      console.error("MakoPay payment error:", error);
      res.status(500).json({ error: "Erreur lors du paiement MakoPay" });
    }
  });

  // Recommendation engine endpoints
  app.get("/api/user/preferences", async (req, res) => {
    try {
      // Simulate user preferences based on delivery history
      const preferences = {
        preferredDeliveryTime: "afternoon",
        preferredPackageTypes: ["documents", "food"],
        frequentAddresses: [
          {
            type: "pickup",
            address: "ACI 2000, Bamako",
            frequency: 12,
            lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: "delivery", 
            address: "Hippodrome, Bamako",
            frequency: 8,
            lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        budgetRange: "medium",
        urgencyPreference: "standard",
        preferredDrivers: ["1", "3"],
        deliveryPatterns: {
          peakHours: ["14:00", "16:00"],
          weekdayPreference: ["Monday", "Wednesday", "Friday"],
          avgOrderValue: 2500,
          avgDeliveryTime: 45
        }
      };
      
      res.json(preferences);
    } catch (error) {
      console.error("Preferences error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des préférences" });
    }
  });

  app.put("/api/user/preferences", async (req, res) => {
    try {
      const updatedPreferences = req.body;
      
      // Simulate preference update
      res.json({
        message: "Préférences mises à jour",
        preferences: updatedPreferences
      });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour des préférences" });
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    try {
      // Generate intelligent recommendations based on user patterns
      const currentHour = new Date().getHours();
      const recommendations = [
        {
          id: 1,
          recommendationType: "time_suggestion",
          title: "Meilleur moment pour livrer",
          description: "Livraison 30% plus rapide entre 14h-16h aujourd'hui",
          suggestedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          estimatedDuration: 32,
          confidence: 0.89,
          savings: {
            timeSaved: 15,
            moneySaved: 0,
            reason: "Moins de trafic pendant cette période"
          },
          metadata: {
            trafficLevel: "low",
            weatherCondition: "favorable"
          }
        },
        {
          id: 2,
          recommendationType: "route_optimization",
          title: "Optimisation d'itinéraire",
          description: "Combinez 2 livraisons pour économiser 25%",
          estimatedPrice: 1875,
          estimatedDuration: 38,
          confidence: 0.76,
          savings: {
            timeSaved: 22,
            moneySaved: 625,
            reason: "Livraisons groupées dans la même zone"
          }
        },
        {
          id: 3,
          recommendationType: "driver_match",
          title: "Livreur recommandé",
          description: "Amadou Traoré excelle dans votre quartier",
          suggestedDriver: 1,
          confidence: 0.93,
          savings: {
            timeSaved: 10,
            moneySaved: 0,
            reason: "Connaissance parfaite de la zone"
          }
        },
        {
          id: 4,
          recommendationType: "price_optimization", 
          title: "Économie sur le prix",
          description: "Livraison standard au lieu d'express pour -40%",
          estimatedPrice: 1500,
          confidence: 0.67,
          savings: {
            timeSaved: 0,
            moneySaved: 1000,
            reason: "Délai non urgent détecté"
          }
        }
      ];
      
      // Filter recommendations based on current context
      const relevantRecommendations = currentHour >= 13 && currentHour <= 17 
        ? recommendations 
        : recommendations.filter(r => r.recommendationType !== "time_suggestion");
      
      res.json(relevantRecommendations);
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Erreur lors de la génération des recommandations" });
    }
  });

  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const { pickupAddress, deliveryAddress, packageType, urgency } = req.body;
      
      // AI-powered recommendation generation based on context
      const contextualRecommendations = [];
      
      // Route optimization based on addresses
      if (pickupAddress && deliveryAddress) {
        contextualRecommendations.push({
          id: Date.now(),
          recommendationType: "route_optimization",
          title: "Itinéraire optimisé détecté",
          description: "Trajet direct sans détours recommandé",
          suggestedPickupAddress: pickupAddress,
          suggestedDeliveryAddress: deliveryAddress,
          estimatedDuration: 28,
          confidence: 0.84,
          savings: {
            timeSaved: 12,
            moneySaved: 0,
            reason: "Route directe disponible"
          }
        });
      }

      // Time-based suggestions
      const currentHour = new Date().getHours();
      if (currentHour >= 11 && currentHour <= 13) {
        contextualRecommendations.push({
          id: Date.now() + 1,
          recommendationType: "time_suggestion",
          title: "Éviter l'heure de pointe",
          description: "Livraison recommandée après 14h pour éviter les embouteillages",
          suggestedTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          confidence: 0.78,
          savings: {
            timeSaved: 18,
            moneySaved: 0,
            reason: "Trafic dense pendant l'heure de déjeuner"
          }
        });
      }

      // Package type optimization
      if (packageType === "documents") {
        contextualRecommendations.push({
          id: Date.now() + 2,
          recommendationType: "driver_match",
          title: "Spécialiste documents",
          description: "Livreur expert pour documents disponible",
          confidence: 0.91,
          savings: {
            timeSaved: 8,
            moneySaved: 0,
            reason: "Expérience avec documents sensibles"
          }
        });
      }

      res.json({
        message: "Nouvelles recommandations générées",
        recommendations: contextualRecommendations
      });
    } catch (error) {
      console.error("Generate recommendations error:", error);
      res.status(500).json({ error: "Erreur lors de la génération des recommandations" });
    }
  });

  app.post("/api/recommendations/:id/accept", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Track recommendation acceptance for learning
      res.json({
        message: "Recommandation acceptée",
        recommendationId: id,
        learningUpdate: "Préférences mises à jour automatiquement"
      });
    } catch (error) {
      console.error("Accept recommendation error:", error);
      res.status(500).json({ error: "Erreur lors de l'acceptation de la recommandation" });
    }
  });

  app.post("/api/recommendations/:id/dismiss", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Track recommendation dismissal for learning
      res.json({
        message: "Recommandation ignorée",
        recommendationId: id
      });
    } catch (error) {
      console.error("Dismiss recommendation error:", error);
      res.status(500).json({ error: "Erreur lors du rejet de la recommandation" });
    }
  });

  app.get("/api/user/delivery-insights", async (req, res) => {
    try {
      // Analyze user delivery patterns
      const insights = {
        mostFrequentTime: "Après-midi",
        averageDeliveryTime: 42,
        preferredPackageType: "Documents",
        averageSpending: 2350,
        deliveryFrequency: {
          weekly: 3.2,
          monthly: 14
        },
        locationPatterns: {
          topPickupZone: "ACI 2000",
          topDeliveryZone: "Hippodrome",
          coverage: ["Bamako Centre", "ACI 2000", "Hippodrome", "Korofina"]
        },
        efficiencyMetrics: {
          onTimeRate: 94,
          satisfactionScore: 4.6,
          repeatBookingRate: 78
        },
        seasonalTrends: {
          peakMonth: "November",
          lowMonth: "August",
          weatherImpact: "minimal"
        }
      };
      
      res.json(insights);
    } catch (error) {
      console.error("Delivery insights error:", error);
      res.status(500).json({ error: "Erreur lors de l'analyse des habitudes de livraison" });
    }
  });

  app.post("/api/user/analyze-patterns", async (req, res) => {
    try {
      // Simulate ML pattern analysis
      const analysis = {
        patternsDetected: [
          "Livraisons fréquentes le mercredi",
          "Préférence pour documents et nourriture",
          "Créneaux 14h-16h optimaux",
          "Zone ACI 2000 ↔ Hippodrome récurrente"
        ],
        optimizationSuggestions: [
          "Réserver le mercredi à l'avance",
          "Grouper les livraisons ACI-Hippodrome",
          "Utiliser les créneaux après-midi"
        ],
        efficiencyGains: {
          timeReduction: "23%",
          costSavings: "18%",
          satisfactionImprovement: "12%"
        }
      };
      
      res.json({
        message: "Analyse des habitudes terminée",
        analysis
      });
    } catch (error) {
      console.error("Pattern analysis error:", error);
      res.status(500).json({ error: "Erreur lors de l'analyse des habitudes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
