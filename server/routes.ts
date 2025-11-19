import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAiProfiles, generateAiDecisions, generateFeaturesHash, generateRawXai } from "./aiEngine";
import { requireAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {

  // -----------------------------
  // AUTH ROUTES ARE IN auth.ts
  // -----------------------------
  // /auth/signup
  // /auth/login

  // Get currently logged in user
  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // -----------------------------
  // AI PROFILES
  // -----------------------------
  app.get("/api/profile", requireAuth, async (req: any, res) => {
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

  app.post("/api/profile/correct", requireAuth, async (req: any, res) => {
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
        status: "pending",
      });

      res.json({ message: "Correction request submitted" });
    } catch (err) {
      console.error("Error submitting correction request:", err);
      res.status(500).json({ message: "Failed to submit correction request" });
    }
  });

  // -----------------------------
  // DATA CONSENT
  // -----------------------------
  app.get("/api/consent", requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      let consent = await storage.getDataConsent(userId);

      if (!consent) {
        consent = await storage.upsertDataConsent({
          userId,
          fraudDetection: true,
          marketingOffers: true,
          financialAdvice: true,
        });
      }

      res.json(consent);
    } catch (err) {
      console.error("Error fetching consent:", err);
      res.status(500).json({ message: "Failed to fetch consent" });
    }
  });

  app.post("/api/consent/update", requireAuth, async (req: any, res) => {
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
        financialAdvice: updates.financialAdvice ?? existing.financialAdvice,
      });

      res.json(updated);
    } catch (err) {
      console.error("Error updating consent:", err);
      res.status(500).json({ message: "Failed to update consent" });
    }
  });

  // -----------------------------
  // AI DECISIONS
  // -----------------------------
  app.get("/api/decisions", requireAuth, async (req: any, res) => {
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
            customerAppealed: false,
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

  // -----------------------------
  // ADMIN — AUDIT LOG (MVP: open to all)
  // -----------------------------
  app.get("/api/admin/audit-log", requireAuth, async (req: any, res) => {
    try {
      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // ADMIN — CORRECTIONS
  app.get("/api/admin/corrections", requireAuth, async (req: any, res) => {
    try {
      const corrections = await storage.getCorrectionRequests();
      res.json(corrections);
    } catch (err) {
      console.error("Error fetching corrections:", err);
      res.status(500).json({ message: "Failed to fetch correction requests" });
    }
  });

  app.post("/api/admin/corrections/:id/approve", requireAuth, async (req: any, res) => {
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

  app.post("/api/admin/corrections/:id/reject", requireAuth, async (req: any, res) => {
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

  return createServer(app);
}
