// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new PrismaClient();
prisma.$connect().then(() => {
  console.log("\u2705 Database connected successfully");
}).catch((error) => {
  console.error("\u274C Database connection failed:", error);
  process.exit(1);
});
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// server/storage.ts
var DatabaseStorage = class {
  // --------------------------
  // USER
  // --------------------------
  async getUser(id) {
    return prisma.user.findUnique({ where: { id } });
  }
  async upsertUser(data) {
    return prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl,
        updatedAt: /* @__PURE__ */ new Date()
      },
      create: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl
      }
    });
  }
  // --------------------------
  // AI PROFILES
  // --------------------------
  async getAiProfiles(userId) {
    return prisma.aiProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }
  async createAiProfile(data) {
    return prisma.aiProfile.create({ data });
  }
  // --------------------------
  // DATA CONSENT
  // --------------------------
  async getDataConsent(userId) {
    return prisma.dataConsent.findUnique({ where: { userId } });
  }
  async upsertDataConsent(data) {
    return prisma.dataConsent.upsert({
      where: { userId: data.userId },
      update: {
        fraudDetection: data.fraudDetection,
        marketingOffers: data.marketingOffers,
        financialAdvice: data.financialAdvice,
        updatedAt: /* @__PURE__ */ new Date()
      },
      create: {
        userId: data.userId,
        fraudDetection: data.fraudDetection,
        marketingOffers: data.marketingOffers,
        financialAdvice: data.financialAdvice
      }
    });
  }
  // --------------------------
  // AI DECISIONS
  // --------------------------
  async getAiDecisions(userId) {
    return prisma.aiDecision.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" }
    });
  }
  async createAiDecision(data) {
    return prisma.aiDecision.create({ data });
  }
  // --------------------------
  // AUDIT LOGS
  // --------------------------
  async getAllAuditLogs() {
    return prisma.decisionAuditLog.findMany({
      orderBy: { createdAt: "desc" }
    });
  }
  async createAuditLog(data) {
    return prisma.decisionAuditLog.create({ data });
  }
  // --------------------------
  // CORRECTION REQUESTS
  // --------------------------
  async getCorrectionRequests() {
    return prisma.correctionRequest.findMany({
      orderBy: { createdAt: "desc" }
    });
  }
  async createCorrectionRequest(data) {
    return prisma.correctionRequest.create({ data });
  }
  async updateCorrectionRequestStatus(id, status, adminNotes) {
    return prisma.correctionRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
        processedAt: /* @__PURE__ */ new Date()
      }
    });
  }
};
var storage = new DatabaseStorage();

// server/aiEngine.ts
import crypto from "crypto";
var profileLabels = [
  "Frequent Traveler",
  "Saving for Car",
  "Investment Enthusiast",
  "Budget Conscious",
  "Early Adopter",
  "High Spender"
];
var decisionTypes = [
  {
    type: "loan_denied",
    text: "Your loan application for $15,000 has been declined at this time.",
    explanation: "Based on our AI analysis, your current debt-to-income ratio of 47% exceeds our threshold of 40%. Additionally, recent credit inquiries and fluctuating monthly income patterns suggest higher risk. To improve approval chances, consider reducing existing debt or increasing income stability over the next 6 months."
  },
  {
    type: "fraud_alert",
    text: "Suspicious transaction detected and temporarily blocked.",
    explanation: "Our fraud detection system identified an unusual transaction of $2,450 from a location 500 miles from your typical spending area, occurring at 3:15 AM - outside your normal transaction hours. The merchant category (electronics) also differs from your usual spending patterns. This triggered our fraud prevention protocol."
  },
  {
    type: "card_pre_approval",
    text: "You're pre-approved for our Premium Rewards Credit Card.",
    explanation: "Based on your excellent credit score of 780+, consistent on-time payment history over 3 years, and average monthly spending of $3,200, our AI system has pre-approved you for our premium card. Your spending patterns in dining and travel categories also align well with this card's reward structure."
  }
];
function generateAiProfiles(userId, count = 3) {
  const profiles = [];
  const usedLabels = /* @__PURE__ */ new Set();
  for (let i = 0; i < Math.min(count, profileLabels.length); i++) {
    let label;
    do {
      label = profileLabels[Math.floor(Math.random() * profileLabels.length)];
    } while (usedLabels.has(label));
    usedLabels.add(label);
    const confidence = Math.floor(Math.random() * 30) + 65;
    profiles.push({
      userId,
      label,
      confidence
    });
  }
  return profiles;
}
function generateAiDecisions(userId, count = 3) {
  const decisions = [];
  for (let i = 0; i < Math.min(count, decisionTypes.length); i++) {
    const decision = decisionTypes[i];
    decisions.push({
      userId,
      decisionType: decision.type,
      decisionText: decision.text,
      explanation: decision.explanation,
      modelVersion: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}`
    });
  }
  return decisions;
}
function generateFeaturesHash(userId, decisionType) {
  const data = `${userId}-${decisionType}-${Date.now()}`;
  return crypto.createHash("sha256").update(data).digest("hex").substring(0, 32);
}
function generateRawXai(decisionType) {
  if (decisionType === "loan_denied") {
    return {
      features: {
        debt_to_income_ratio: -0.35,
        credit_score: 0.12,
        income_stability: -0.18,
        recent_inquiries: -0.22,
        payment_history: 0.08
      },
      threshold: 0.5,
      prediction: 0.32
    };
  } else if (decisionType === "fraud_alert") {
    return {
      features: {
        location_anomaly: 0.45,
        time_anomaly: 0.38,
        amount_deviation: 0.28,
        merchant_category_mismatch: 0.25,
        velocity_check: 0.15
      },
      threshold: 0.7,
      prediction: 0.89
    };
  } else {
    return {
      features: {
        credit_score: 0.42,
        payment_history: 0.38,
        spending_patterns: 0.25,
        account_age: 0.18,
        income_level: 0.22
      },
      threshold: 0.6,
      prediction: 0.85
    };
  }
}

// server/auth.ts
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var router = Router();
function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}
function sanitizeUser(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
router.post("/signup", async (req, res) => {
  try {
    console.log("=== SIGNUP REQUEST ===");
    console.log("Body received:", req.body);
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({
        error: "Email and password are required",
        details: "Please provide both email and password"
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        details: "Please provide a valid email address"
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password too short",
        details: "Password must be at least 6 characters long"
      });
    }
    console.log("Checking for existing user...");
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("User already exists with email:", email);
      return res.status(409).json({
        error: "User already exists",
        details: "An account with this email already exists. Please login instead."
      });
    }
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("Creating user in database...");
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        // Normalize email
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        password: hashedPassword
      }
    });
    console.log("User created successfully:", user.id);
    const token = generateToken(user.id);
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
    if (err instanceof Error) {
      if (err.message.includes("Unique constraint")) {
        return res.status(409).json({
          error: "User already exists",
          details: "An account with this email already exists"
        });
      }
      if (err.message.includes("Database") || err.message.includes("prisma")) {
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
router.post("/login", async (req, res) => {
  try {
    console.log("=== LOGIN REQUEST ===");
    console.log("Body received:", {
      email: req.body.email,
      hasPassword: !!req.body.password
    });
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Missing credentials:", { hasEmail: !!email, hasPassword: !!password });
      return res.status(400).json({
        error: "Email and password required",
        details: "Please provide both email and password"
      });
    }
    console.log("Looking up user...");
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
    const token = generateToken(user.id);
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
    if (err instanceof Error) {
      if (err.message.includes("JWT_SECRET")) {
        return res.status(500).json({
          error: "Server configuration error",
          details: "Authentication service is unavailable"
        });
      }
      if (err.message.includes("Database") || err.message.includes("prisma")) {
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
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        details: "Authentication required"
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
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
function requireAuth(req, res, next) {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
var auth_default = router;

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      let profiles = await storage.getAiProfiles(userId);
      if (profiles.length === 0) {
        const generated = generateAiProfiles(userId, 3);
        for (const p of generated) {
          await storage.createAiProfile(p);
        }
        profiles = await storage.getAiProfiles(userId);
      }
      res.json(profiles);
    } catch (err) {
      console.error("Error fetching AI profiles:", err);
      res.status(500).json({ message: "Failed to fetch AI profiles" });
    }
  });
  app2.post("/api/profile/correct", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const { profileId, requestedLabel } = req.body;
      if (!profileId) {
        return res.status(400).json({ message: "Profile ID is required" });
      }
      const profiles = await storage.getAiProfiles(userId);
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      await storage.createCorrectionRequest({
        userId,
        aiProfileId: profileId,
        incorrectLabel: profile.label,
        requestedLabel: requestedLabel || null,
        status: "pending"
      });
      res.json({ message: "Correction request submitted" });
    } catch (err) {
      console.error("Error submitting correction request:", err);
      res.status(500).json({ message: "Failed to submit correction request" });
    }
  });
  app2.get("/api/consent", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      let consent = await storage.getDataConsent(userId);
      if (!consent) {
        consent = await storage.upsertDataConsent({
          userId,
          fraudDetection: true,
          marketingOffers: true,
          financialAdvice: true
        });
      }
      res.json(consent);
    } catch (err) {
      console.error("Error fetching consent:", err);
      res.status(500).json({ message: "Failed to fetch consent" });
    }
  });
  app2.post("/api/consent/update", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const updates = req.body;
      const existing = await storage.getDataConsent(userId);
      if (!existing) {
        return res.status(404).json({ message: "Consent settings not found" });
      }
      const updated = await storage.upsertDataConsent({
        userId,
        fraudDetection: existing.fraudDetection,
        marketingOffers: updates.marketingOffers ?? existing.marketingOffers,
        financialAdvice: updates.financialAdvice ?? existing.financialAdvice
      });
      res.json(updated);
    } catch (err) {
      console.error("Error updating consent:", err);
      res.status(500).json({ message: "Failed to update consent" });
    }
  });
  app2.get("/api/decisions", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      let decisions = await storage.getAiDecisions(userId);
      if (decisions.length === 0) {
        const generated = generateAiDecisions(userId, 3);
        for (const decision of generated) {
          const created = await storage.createAiDecision(decision);
          await storage.createAuditLog({
            aiDecisionId: created.id,
            userId,
            modelVersion: created.modelVersion,
            featuresHash: generateFeaturesHash(userId, created.decisionType),
            rawXai: generateRawXai(created.decisionType),
            customerAppealed: false
          });
        }
        decisions = await storage.getAiDecisions(userId);
      }
      res.json(decisions);
    } catch (err) {
      console.error("Error fetching decisions:", err);
      res.status(500).json({ message: "Failed to fetch decisions" });
    }
  });
  app2.get("/api/admin/audit-log", requireAuth, async (req, res) => {
    try {
      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  app2.get("/api/admin/corrections", requireAuth, async (req, res) => {
    try {
      const corrections = await storage.getCorrectionRequests();
      res.json(corrections);
    } catch (err) {
      console.error("Error fetching corrections:", err);
      res.status(500).json({ message: "Failed to fetch correction requests" });
    }
  });
  app2.post("/api/admin/corrections/:id/approve", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updateCorrectionRequestStatus(
        req.params.id,
        "approved",
        "Correction approved"
      );
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error approving correction:", err);
      res.status(500).json({ message: "Failed to approve correction request" });
    }
  });
  app2.post("/api/admin/corrections/:id/reject", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updateCorrectionRequestStatus(
        req.params.id,
        "rejected",
        "Correction rejected"
      );
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error rejecting correction:", err);
      res.status(500).json({ message: "Failed to reject correction request" });
    }
  });
  return createServer(app2);
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import cors from "cors";
var app = express2();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  // All your Vite ports
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());
app.use(
  express2.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api") || path3.startsWith("/auth")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.use("/auth", auth_default);
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, () => {
    log(`\u{1F680} Server running on port ${port}`);
    log(`\u{1F4CA} Environment: ${process.env.NODE_ENV || "development"}`);
    log(`\u{1F517} Health check: http://localhost:${port}/health`);
    log(`\u{1F310} CORS enabled for: http://localhost:5173, http://localhost:5174, http://localhost:5175`);
  });
})();
