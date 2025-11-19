import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { DecisionAuditLog } from "@shared/schema";

interface AuditLogTableProps {
  logs: DecisionAuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Timestamp</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Decision ID</TableHead>
            <TableHead>Model Version</TableHead>
            <TableHead>Features Hash</TableHead>
            <TableHead>Appealed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No audit logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} data-testid={`row-audit-log-${log.id}`}>
                <TableCell className="text-sm">
                  {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell className="font-mono text-xs" data-testid={`text-user-id-${log.id}`}>
                  {log.userId.substring(0, 8)}...
                </TableCell>
                <TableCell className="font-mono text-xs" data-testid={`text-decision-id-${log.id}`}>
                  {log.aiDecisionId.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {log.modelVersion}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.featuresHash.substring(0, 12)}...
                </TableCell>
                <TableCell>
                  {log.customerAppealed ? (
                    <Badge className="bg-status-away/20 text-status-away border-status-away/30">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      No
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
