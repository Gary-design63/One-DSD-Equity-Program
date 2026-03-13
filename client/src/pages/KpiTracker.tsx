import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Kpi } from "@shared/schema";

export default function KpiTracker() {
  const { data: kpis = [], isLoading } = useQuery<Kpi[]>({ queryKey: ["/api/kpis"] });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">KPI Tracker</h2>
        <p className="text-sm text-muted-foreground mt-1">Monitor key equity performance indicators across all program domains.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Card key={i} className="h-36 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const isInverse = kpi.name.includes("Response Time");
            const pctRaw = isInverse
              ? ((kpi.targetValue / kpi.currentValue) * 100)
              : ((kpi.currentValue / kpi.targetValue) * 100);
            const pct = Math.min(pctRaw, 100);
            const isGood = isInverse ? kpi.currentValue <= kpi.targetValue : kpi.currentValue >= kpi.targetValue;

            return (
              <Card key={kpi.id} className="bg-card" data-testid={`kpi-full-card-${kpi.id}`}>
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-tight pr-2">
                      {kpi.name}
                    </p>
                    <div className={`shrink-0 ${isGood ? "text-green-600" : "text-amber-500"}`}>
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold tabular-nums text-foreground">
                      {kpi.currentValue}
                      {kpi.unit === "%" && "%"}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      / {kpi.targetValue}{kpi.unit === "%" ? "%" : kpi.unit === "days" ? " days" : ""}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-2 [&>div]:bg-[hsl(174,100%,29%)]"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {pct.toFixed(0)}% of target
                    </span>
                    <span className="text-[11px] text-muted-foreground">{kpi.category}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
