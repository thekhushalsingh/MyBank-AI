import { useQuery } from "@tanstack/react-query";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import type { DecisionAuditLog } from "@shared/schema";

export default function AuditLogPage() {
  const { 
    data: logs, 
    isLoading, 
    error,
    refetch 
  } = useQuery<DecisionAuditLog[]>({
    queryKey: ["/api/admin/audit-log"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/admin/audit-log`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch audit logs: ${res.status}`);
      return res.json();
    },
  });

  // Debug logging
  console.log("🔍 Audit Logs Data:", { logs, isLoading, error });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            Immutable Decision Log
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Complete audit trail of all AI decisions for regulatory compliance and governance.
            This log is immutable and cannot be modified after creation.
          </p>
        </div>
        
        <div className="text-center text-destructive border border-destructive rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-2">Failed to load audit logs</h2>
          <p className="mb-4">Error: {error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Immutable Decision Log
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Complete audit trail of all AI decisions for regulatory compliance and governance.
          This log is immutable and cannot be modified after creation.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : logs && logs.length > 0 ? (
          <AuditLogTable logs={logs} />
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-md">
            No audit logs available.
          </div>
        )}
      </div>
    </div>
  );
}