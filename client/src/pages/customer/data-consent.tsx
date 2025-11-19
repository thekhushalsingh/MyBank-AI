import { useQuery, useMutation } from "@tanstack/react-query";
import { ConsentToggleRow } from "@/components/customer/consent-toggle-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DataConsent } from "@shared/schema";
import { ArrowLeft } from "lucide-react"; // Add this import
import { Link } from "wouter"; // Add this import

export default function DataConsentPage() {
  const { toast } = useToast();

  const { 
    data: consent, 
    isLoading, 
    error,
    refetch 
  } = useQuery<DataConsent>({
    queryKey: ["/api/consent"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/consent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch consent: ${res.status}`);
      return res.json();
    },
  });

  const updateConsentMutation = useMutation({
    mutationFn: async (data: Partial<DataConsent>) => {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/consent/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update consent");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consent"] });
      toast({
        title: "Preferences Updated",
        description: "Your data consent preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleChange = (field: keyof DataConsent, value: boolean) => {
    updateConsentMutation.mutate({ [field]: value });
  };

  // Debug logging
  console.log("🔍 Consent Data:", { consent, isLoading, error });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center text-destructive">
          <h2 className="text-xl font-semibold mb-2">Failed to load consent settings</h2>
          <p className="mb-4">Error: {error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Back Button and Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Data & Personalization
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Control how your data is used for AI-powered features. You can update these
          settings at any time to match your privacy preferences.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </>
        ) : consent ? (
          <>
            <ConsentToggleRow
              id="fraud-detection"
              label="Fraud Detection"
              description="Monitor transactions for suspicious activity and prevent unauthorized access. This setting is required for account security."
              checked={consent.fraudDetection}
              onCheckedChange={(checked) => handleToggleChange("fraudDetection", checked)}
              locked={true}
            />
            <ConsentToggleRow
              id="marketing-offers"
              label="Personalized Offers"
              description="Receive tailored financial product recommendations based on your activity and preferences."
              checked={consent.marketingOffers}
              onCheckedChange={(checked) => handleToggleChange("marketingOffers", checked)}
            />
            <ConsentToggleRow
              id="financial-advice"
              label="Savings-Based Financial Advice"
              description="Get AI-powered insights and recommendations to help you save money and reach your financial goals."
              checked={consent.financialAdvice}
              onCheckedChange={(checked) => handleToggleChange("financialAdvice", checked)}
            />
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Unable to load consent preferences.
          </div>
        )}
      </div>
    </div>
  );
}