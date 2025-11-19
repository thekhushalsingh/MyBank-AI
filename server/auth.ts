import { Router } from "express";
import { prisma } from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// -------------------------
// Helper: Generate JWT Token
// -------------------------
function generateToken(userId: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// -------------------------
// Helper: Sanitize User Object (remove password)
// -------------------------
function sanitizeUser(user: any) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// -------------------------
// SIGNUP
// -------------------------
router.post("/signup", async (req, res) => {
  try {
    console.log("=== SIGNUP REQUEST ===");
    console.log("Body received:", req.body);

    const { email, password, firstName, lastName } = req.body;

    // Input validation
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ 
        error: "Email and password are required",
        details: "Please provide both email and password"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        details: "Please provide a valid email address"
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password too short",
        details: "Password must be at least 6 characters long"
      });
    }

    console.log("Checking for existing user...");
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("User already exists with email:", email);
      return res.status(409).json({ 
        error: "User already exists",
        details: "An account with this email already exists. Please login instead."
      });
    }

    console.log("Hashing password...");
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds

    console.log("Creating user in database...");
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(), // Normalize email
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        password: hashedPassword,
      },
    });

    console.log("User created successfully:", user.id);
    
    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const sanitizedUser = sanitizeUser(user);

    console.log("Signup completed successfully");
    
    res.status(201).json({ 
      success: true,
      message: "Account created successfully",
      user: sanitizedUser, 
      token 
    });

  } catch (err) {
    console.error("!!! SIGNUP ERROR !!!");
    console.error("Error details:", err);
    
    // Handle Prisma errors
    if (err instanceof Error) {
      if (err.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          error: "User already exists",
          details: "An account with this email already exists"
        });
      }
      
      if (err.message.includes('Database') || err.message.includes('prisma')) {
        return res.status(503).json({ 
          error: "Database error",
          details: "Unable to create account. Please try again."
        });
      }
    }

    res.status(500).json({ 
      error: "Internal server error",
      details: "Unable to create account. Please try again later."
    });
  }
});

// -------------------------
// LOGIN
// -------------------------
router.post("/login", async (req, res) => {
  try {
    console.log("=== LOGIN REQUEST ===");
    console.log("Body received:", { 
      email: req.body.email, 
      hasPassword: !!req.body.password 
    });

    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log("Missing credentials:", { hasEmail: !!email, hasPassword: !!password });
      return res.status(400).json({ 
        error: "Email and password required",
        details: "Please provide both email and password"
      });
    }

    console.log("Looking up user...");
    
    // Find user (case-insensitive)
    const user = await prisma.user.findUnique({ 
      where: { 
        email: email.toLowerCase().trim() 
      } 
    });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ 
        error: "Invalid credentials",
        details: "No account found with this email"
      });
    }

    console.log("User found:", user.id);
    
    if (!user.password) {
      console.log("User has no password set - account issue");
      return res.status(500).json({ 
        error: "Account error",
        details: "Your account has an issue. Please contact support."
      });
    }

    console.log("Comparing passwords...");
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password incorrect for user:", user.id);
      return res.status(401).json({ 
        error: "Invalid credentials",
        details: "Incorrect password"
      });
    }

    console.log("Generating JWT token...");
    
    // Generate token
    const token = generateToken(user.id);

    // Sanitize user object
    const sanitizedUser = sanitizeUser(user);

    console.log("Login successful for user:", user.id);
    
    res.json({ 
      success: true,
      message: "Login successful",
      user: sanitizedUser, 
      token 
    });

  } catch (err) {
    console.error("!!! LOGIN ERROR !!!");
    console.error("Error details:", err);
    
    // Handle specific errors
    if (err instanceof Error) {
      if (err.message.includes('JWT_SECRET')) {
        return res.status(500).json({ 
          error: "Server configuration error",
          details: "Authentication service is unavailable"
        });
      }
      
      if (err.message.includes('Database') || err.message.includes('prisma')) {
        return res.status(503).json({ 
          error: "Database error",
          details: "Unable to login. Please try again."
        });
      }
    }

    res.status(500).json({ 
      error: "Internal server error",
      details: "Unable to login. Please try again later."
    });
  }
});

// -------------------------
// GET CURRENT USER (Verify token)
// -------------------------
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        error: "No token provided",
        details: "Authentication required"
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ 
        error: "User not found",
        details: "The user associated with this token no longer exists"
      });
    }

    const sanitizedUser = sanitizeUser(user);
    
    res.json({ 
      success: true,
      user: sanitizedUser 
    });

  } catch (err) {
    console.error("Auth verification error:", err);
    
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: "Invalid token",
        details: "Your session has expired. Please login again."
      });
    }
    
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: "Token expired",
        details: "Your session has expired. Please login again."
      });
    }

    res.status(500).json({ 
      error: "Authentication error",
      details: "Unable to verify authentication"
    });
  }
});

// -------------------------
// Middleware: Auth Check
// -------------------------
export function requireAuth(req: any, res: any, next: any) {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ 
        error: "Authentication required",
        details: "Please provide an authorization token"
      });
    }

    const token = header.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        error: "Invalid token format",
        details: "Authorization header should be 'Bearer <token>'"
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.userId;
    
    console.log("Auth successful for user:", decoded.userId);
    next();
    
  } catch (err) {
    console.error("Auth middleware error:", err);
    
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: "Invalid token",
        details: "Your session is invalid. Please login again."
      });
    }
    
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: "Session expired",
        details: "Your session has expired. Please login again."
      });
    }

    return res.status(401).json({ 
      error: "Authentication failed",
      details: "Unable to verify your identity"
    });
  }
}

export default router;