import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AiProfileCard } from "@/components/customer/ai-profile-card";
import { CorrectionRequestModal } from "@/components/customer/correction-request-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AiProfile } from "@shared/schema";
import { Link } from "wouter"; // Add this import
import { ArrowLeft } from "lucide-react"; // Add this import

export default function AiProfilePage() {
  const [selectedProfile, setSelectedProfile] = useState<AiProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const { 
    data: profiles, 
    isLoading, 
    error,
    refetch 
  } = useQuery<AiProfile[]>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.status}`);
      return res.json();
    },
  });

  const correctionMutation = useMutation({
    mutationFn: async (data: { profileId: string; requestedLabel: string }) => {
      await apiRequest("POST", "/api/profile/correct", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Correction Requested",
        description: "Your correction request has been submitted for review.",
      });
      setModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit correction request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRequestCorrection = (profile: AiProfile) => {
    setSelectedProfile(profile);
    setModalOpen(true);
  };

  const handleSubmitCorrection = (requestedLabel: string) => {
    if (selectedProfile) {
      correctionMutation.mutate({
        profileId: selectedProfile.id,
        requestedLabel,
      });
    }
  };

  // Debug and error handling
  console.log("🔍 AI Profile Debug:", { profiles, isLoading, error });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="text-center text-destructive">
          <h2 className="text-xl font-semibold mb-2">Failed to load AI profiles</h2>
          <p className="mb-4">Error: {error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Back Button Section */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Your AI Profile</h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          These are AI-generated inferences about your financial behavior. If any of these
          don't seem accurate, you can request a correction for our team to review.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[140px] w-full" />
            <Skeleton className="h-[140px] w-full" />
            <Skeleton className="h-[140px] w-full" />
          </>
        ) : profiles && profiles.length > 0 ? (
          profiles.map((profile) => (
            <AiProfileCard
              key={profile.id}
              profile={profile}
              onRequestCorrection={handleRequestCorrection}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No AI profile data available yet.
          </div>
        )}
      </div>

      <CorrectionRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        profile={selectedProfile}
        onSubmit={handleSubmitCorrection}
        isPending={correctionMutation.isPending}
      />
    </div>
  );
}