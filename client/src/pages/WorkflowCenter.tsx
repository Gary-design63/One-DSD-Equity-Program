import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Initiative } from "@shared/schema";

const columns = ["Submitted", "Under Review", "In Progress", "Completed"] as const;

const priorityColor: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Critical: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function WorkflowCenter() {
  const { data: initiatives = [], isLoading } = useQuery<Initiative[]>({ queryKey: ["/api/initiatives"] });

  const getByStatus = (status: string) => initiatives.filter(i => i.status === status);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">Workflow Center</h2>
        <p className="text-sm text-muted-foreground mt-1">Track equity initiatives through their review lifecycle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const items = getByStatus(col);
          return (
            <div key={col} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{col}</h3>
                <span className="text-xs tabular-nums text-muted-foreground bg-muted px-2 py-0.5 rounded-full" data-testid={`count-${col.replace(/\s/g, "-").toLowerCase()}`}>
                  {items.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {isLoading ? (
                  <Card className="animate-pulse h-20 bg-muted" />
                ) : items.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                    No items
                  </div>
                ) : (
                  items.map((item) => (
                    <Card key={item.id} className="bg-card hover:border-primary/20 transition-colors" data-testid={`workflow-card-${item.id}`}>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium mb-2 leading-snug">{item.title}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.domain}</Badge>
                          <span className={`text-[10px] px-1.5 py-0 rounded-full ${priorityColor[item.priority] || ""}`}>
                            {item.priority}
                          </span>
                        </div>
                        {item.assignedTo && (
                          <p className="text-[11px] text-muted-foreground mt-2">Assigned: {item.assignedTo}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
