import { prisma } from "./db";

export class DatabaseStorage {

  // --------------------------
  // USER
  // --------------------------
  async getUser(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async upsertUser(data: any) {
    return prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl,
        updatedAt: new Date()
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
  async getAiProfiles(userId: string) {
    return prisma.aiProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async createAiProfile(data: any) {
    return prisma.aiProfile.create({ data });
  }

  // --------------------------
  // DATA CONSENT
  // --------------------------
  async getDataConsent(userId: string) {
    return prisma.dataConsent.findUnique({ where: { userId } });
  }

  async upsertDataConsent(data: any) {
    return prisma.dataConsent.upsert({
      where: { userId: data.userId },
      update: {
        fraudDetection: data.fraudDetection,
        marketingOffers: data.marketingOffers,
        financialAdvice: data.financialAdvice,
        updatedAt: new Date()
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
  async getAiDecisions(userId: string) {
    return prisma.aiDecision.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" }
    });
  }

  async createAiDecision(data: any) {
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

  async createAuditLog(data: any) {
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

  async createCorrectionRequest(data: any) {
    return prisma.correctionRequest.create({ data });
  }

  async updateCorrectionRequestStatus(id: string, status: string, adminNotes?: string) {
    return prisma.correctionRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
        processedAt: new Date()
      }
    });
  }
}

export const storage = new DatabaseStorage();
