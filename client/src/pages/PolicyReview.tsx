import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Policy } from "@shared/schema";

const statusStyles: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Under Review": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "Needs Revision": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

function ScoreBadge({ score }: { score: number }) {
  let color = "text-red-600 bg-red-50 dark:bg-red-900/30";
  if (score >= 80) color = "text-green-600 bg-green-50 dark:bg-green-900/30";
  else if (score >= 60) color = "text-amber-600 bg-amber-50 dark:bg-amber-900/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${color}`}>
      {score}
    </span>
  );
}

export default function PolicyReview() {
  const { data: policies = [], isLoading } = useQuery<Policy[]>({ queryKey: ["/api/policies"] });
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? policies : policies.filter(p => p.status === filter);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Policy Review</h2>
          <p className="text-sm text-muted-foreground mt-1">Track equity reviews of disability services policies.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44" data-testid="select-policy-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Under Review">Under Review</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Needs Revision">Needs Revision</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Policy Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right pr-4">Equity Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No policies match this filter.</TableCell>
                </TableRow>
              ) : (
                filtered.map((policy) => (
                  <TableRow key={policy.id} data-testid={`policy-row-${policy.id}`}>
                    <TableCell className="pl-4 font-medium text-sm">{policy.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${statusStyles[policy.status] || ""}`}>
                        {policy.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{policy.reviewer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">{policy.lastUpdated}</TableCell>
                    <TableCell className="text-right pr-4">
                      <ScoreBadge score={policy.equityScore} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
