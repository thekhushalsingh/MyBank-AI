import type { InsertAiProfile, InsertAiDecision } from "@shared/schema";
import crypto from "crypto";

// Rule-based AI inference engine 
// This simulates AI-generated inferences and decisions

const profileLabels = [
  "Frequent Traveler",
  "Saving for Car",
  "Investment Enthusiast",
  "Budget Conscious",
  "Early Adopter",
  "High Spender",
];

const decisionTypes = [
  {
    type: "loan_denied",
    text: "Your loan application for $15,000 has been declined at this time.",
    explanation:
      "Based on our AI analysis, your current debt-to-income ratio of 47% exceeds our threshold of 40%. Additionally, recent credit inquiries and fluctuating monthly income patterns suggest higher risk. To improve approval chances, consider reducing existing debt or increasing income stability over the next 6 months.",
  },
  {
    type: "fraud_alert",
    text: "Suspicious transaction detected and temporarily blocked.",
    explanation:
      "Our fraud detection system identified an unusual transaction of $2,450 from a location 500 miles from your typical spending area, occurring at 3:15 AM - outside your normal transaction hours. The merchant category (electronics) also differs from your usual spending patterns. This triggered our fraud prevention protocol.",
  },
  {
    type: "card_pre_approval",
    text: "You're pre-approved for our Premium Rewards Credit Card.",
    explanation:
      "Based on your excellent credit score of 780+, consistent on-time payment history over 3 years, and average monthly spending of $3,200, our AI system has pre-approved you for our premium card. Your spending patterns in dining and travel categories also align well with this card's reward structure.",
  },
];

export function generateAiProfiles(userId: string, count: number = 3): InsertAiProfile[] {
  const profiles: InsertAiProfile[] = [];
  const usedLabels = new Set<string>();

  for (let i = 0; i < Math.min(count, profileLabels.length); i++) {
    let label: string;
    do {
      label = profileLabels[Math.floor(Math.random() * profileLabels.length)];
    } while (usedLabels.has(label));

    usedLabels.add(label);
    const confidence = Math.floor(Math.random() * 30) + 65; // 65-95%

    profiles.push({
      userId,
      label,
      confidence,
    });
  }

  return profiles;
}

export function generateAiDecisions(userId: string, count: number = 3): InsertAiDecision[] {
  const decisions: InsertAiDecision[] = [];

  for (let i = 0; i < Math.min(count, decisionTypes.length); i++) {
    const decision = decisionTypes[i];
    decisions.push({
      userId,
      decisionType: decision.type,
      decisionText: decision.text,
      explanation: decision.explanation,
      modelVersion: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}`,
    });
  }

  return decisions;
}

export function generateFeaturesHash(userId: string, decisionType: string): string {
  const data = `${userId}-${decisionType}-${Date.now()}`;
  return crypto.createHash("sha256").update(data).digest("hex").substring(0, 32);
}

export function generateRawXai(decisionType: string): Record<string, any> {
  // Simulated SHAP-like explanation values
  if (decisionType === "loan_denied") {
    return {
      features: {
        debt_to_income_ratio: -0.35,
        credit_score: 0.12,
        income_stability: -0.18,
        recent_inquiries: -0.22,
        payment_history: 0.08,
      },
      threshold: 0.5,
      prediction: 0.32,
    };
  } else if (decisionType === "fraud_alert") {
    return {
      features: {
        location_anomaly: 0.45,
        time_anomaly: 0.38,
        amount_deviation: 0.28,
        merchant_category_mismatch: 0.25,
        velocity_check: 0.15,
      },
      threshold: 0.7,
      prediction: 0.89,
    };
  } else {
    return {
      features: {
        credit_score: 0.42,
        payment_history: 0.38,
        spending_patterns: 0.25,
        account_age: 0.18,
        income_level: 0.22,
      },
      threshold: 0.6,
      prediction: 0.85,
    };
  }
}
