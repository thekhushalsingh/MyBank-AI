import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CorrectionQueueCard } from "@/components/admin/correction-queue-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CorrectionRequest } from "@shared/schema";
import { ArrowLeft } from "lucide-react"; // Add this import
import { Link } from "wouter"; // Add this import

export default function CorrectionQueuePage() {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  const { 
    data: corrections, 
    isLoading, 
    error,
    refetch 
  } = useQuery<CorrectionRequest[]>({
    queryKey: ["/api/admin/corrections"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/admin/corrections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch corrections: ${res.status}`);
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/admin/corrections/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to approve request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/corrections"] });
      toast({
        title: "Request Approved",
        description: "The correction request has been approved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/admin/corrections/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to reject request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/corrections"] });
      toast({
        title: "Request Rejected",
        description: "The correction request has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filterByStatus = (status: string) => {
    return corrections?.filter((c) => c.status === status) || [];
  };

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  // Debug logging
  console.log("🔍 Correction Queue Data:", { corrections, isLoading, error });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="text-center text-destructive">
          <h2 className="text-xl font-semibold mb-2">Failed to load correction requests</h2>
          <p className="mb-4">Error: {error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Back Button and Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Customer Correction Queue
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Review and process customer requests to correct AI-generated profile inferences.
          Actions taken here are logged for audit purposes.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({filterByStatus("pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            Approved ({filterByStatus("approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({filterByStatus("rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {isLoading ? (
            <>
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </>
          ) : filterByStatus("pending").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterByStatus("pending").map((request) => (
                <CorrectionQueueCard
                  key={request.id}
                  request={request}
                  onApprove={(id) => approveMutation.mutate(id)}
                  onReject={(id) => rejectMutation.mutate(id)}
                  isPending={isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-md">
              No pending correction requests.
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : filterByStatus("approved").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterByStatus("approved").map((request) => (
                <CorrectionQueueCard
                  key={request.id}
                  request={request}
                  onApprove={() => {}}
                  onReject={() => {}}
                  isPending={false}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-md">
              No approved correction requests.
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : filterByStatus("rejected").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterByStatus("rejected").map((request) => (
                <CorrectionQueueCard
                  key={request.id}
                  request={request}
                  onApprove={() => {}}
                  onReject={() => {}}
                  isPending={false}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-md">
              No rejected correction requests.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}