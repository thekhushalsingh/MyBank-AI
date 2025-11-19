import { useQuery } from "@tanstack/react-query";
import { DecisionCard } from "@/components/customer/decision-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react"; // Add this import
import { Link } from "wouter"; // Add this import
import type { AiDecision } from "@shared/schema";

export default function RecentDecisionsPage() {
  const { 
    data: decisions, 
    isLoading, 
    error,
    refetch 
  } = useQuery<AiDecision[]>({
    queryKey: ["/api/decisions"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/decisions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch decisions: ${res.status}`);
      return res.json();
    },
  });

  // Debug logging
  console.log("🔍 Decisions Data:", { decisions, isLoading, error });

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="text-center text-destructive">
          <h2 className="text-xl font-semibold mb-2">Failed to load recent decisions</h2>
          <p className="mb-4">Error: {error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      {/* Back Button Section */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Recent AI Decisions
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          View all AI-powered decisions made about your account. Click "Why?" on any
          decision to see a detailed explanation of how the decision was made.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[160px] w-full" />
            <Skeleton className="h-[160px] w-full" />
            <Skeleton className="h-[160px] w-full" />
          </>
        ) : decisions && decisions.length > 0 ? (
          decisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No recent decisions to display.
          </div>
        )}
      </div>
    </div>
  );
}