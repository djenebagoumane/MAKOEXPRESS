import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { hashPassword, verifyPassword } from "./auth";
import { storage } from "./storage";
import { registerSchema, loginSchema } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      phoneNumber: string;
      firstName: string;
      lastName: string;
      role: string;
      country: string;
      countryCode: string;
    }
  }
}

export function getCustomSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "mako-express-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupCustomAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getCustomSession());

  // Registration endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByIdentifier(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
      }

      const existingPhone = await storage.getUserByIdentifier(validatedData.phoneNumber);
      if (existingPhone) {
        return res.status(400).json({ message: "Un compte avec ce numéro existe déjà" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Create session
      (req.session as any).userId = newUser.id;
      (req.session as any).user = {
        id: newUser.id,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        country: newUser.country,
        countryCode: newUser.countryCode,
      };

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        country: newUser.country,
        countryCode: newUser.countryCode,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ 
        message: error.issues?.[0]?.message || "Erreur lors de l'inscription"
      });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { identifier, password } = loginSchema.parse(req.body);
      
      // Find user by email or phone
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({ message: "Email/téléphone ou mot de passe incorrect" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email/téléphone ou mot de passe incorrect" });
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        country: user.country,
        countryCode: user.countryCode,
      };

      res.json({
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        country: user.country,
        countryCode: user.countryCode,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ 
        message: error.issues?.[0]?.message || "Erreur lors de la connexion"
      });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Déconnexion réussie" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req: Request, res: Response) => {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    res.json(sessionUser);
  });
}

export const isCustomAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const sessionUser = (req.session as any).user;
  if (!sessionUser) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  req.user = sessionUser;
  next();
};