import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ArrowRight,
  FilePlus,
  Plus,
  Upload,
  MessageCircle,
  BarChart3,
  Wifi,
  Download,
} from "lucide-react";
import type { Kpi, Initiative } from "@shared/schema";

const topKpiIds = [1, 2, 3, 4];

const domainCounts = [
  { label: "Training", count: 1 },
  { label: "Workforce", count: 1 },
  { label: "Policy", count: 1 },
  { label: "Community", count: 1 },
  { label: "Operations", count: 1 },
];

const quickActions = [
  { label: "Submit equity review request", icon: FilePlus, href: "/intake" },
  { label: "Add initiative", icon: Plus, href: "/intake" },
  { label: "Upload KB document", icon: Upload, href: "/knowledge-base" },
  { label: "Ask the AI assistant", icon: MessageCircle, href: "/assistant" },
  { label: "View KPI tracker", icon: BarChart3, href: "/kpis" },
];

function KpiCard({ kpi }: { kpi: Kpi }) {
  const pct = kpi.unit === "%" ? (kpi.currentValue / kpi.targetValue) * 100 : (kpi.currentValue / kpi.targetValue) * 100;
  return (
    <Card className="bg-card" data-testid={`kpi-card-${kpi.id}`}>
      <CardContent className="pt-5 pb-4 px-5">
        <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">{kpi.name}</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {kpi.currentValue}{kpi.unit === "%" ? "%" : ""}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            target {kpi.targetValue}{kpi.unit === "%" ? "%" : kpi.unit === "days" ? " days" : ""}
          </span>
        </div>
        <Progress value={Math.min(pct, 100)} className="h-2 [&>div]:bg-[hsl(174,100%,29%)]" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = useQuery<Kpi[]>({ queryKey: ["/api/kpis"] });
  const { data: initiatives, isLoading: initLoading } = useQuery<Initiative[]>({ queryKey: ["/api/initiatives"] });

  const topKpis = kpis?.filter(k => topKpiIds.includes(k.id)) || [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Thursday, March 12, 2026 · One DSD Equity Program
          </p>
          <p className="text-xs text-muted-foreground mt-1 italic">
            DEIA operations · probabilistic review · organizational learning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wifi className="w-3.5 h-3.5 text-green-500" />
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Agents online
            </span>
          </div>
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
          <Link href="/intake">
            <Button size="sm" data-testid="button-new-review">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New equity review
            </Button>
          </Link>
        </div>
      </div>

      {/* Equity KPIs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Equity KPIs — Top 4</h2>
          <Link href="/kpis">
            <span className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1" data-testid="link-view-all-kpis">
              View all KPIs <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        {kpisLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <Card key={i} className="h-28 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topKpis.map(kpi => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        )}
      </section>

      {/* Active Initiatives */}
      <section>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Active Initiatives</h2>
        <Card>
          <CardContent className="py-8 text-center">
            {initLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : !initiatives || initiatives.length === 0 ? (
              <div>
                <p className="text-muted-foreground text-sm mb-2">No active initiatives yet.</p>
                <Link href="/intake">
                  <span className="text-sm text-primary hover:underline cursor-pointer" data-testid="link-submit-first">
                    Submit the first one →
                  </span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 text-left">
                {initiatives.map(init => (
                  <div key={init.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="text-sm font-medium" data-testid={`text-initiative-title-${init.id}`}>{init.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[11px]">{init.domain}</Badge>
                        <Badge variant={init.priority === "Critical" ? "destructive" : "outline"} className="text-[11px]">{init.priority}</Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[11px]">{init.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Program Scope */}
      <section>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Program Scope</h2>
        <div className="flex flex-wrap gap-3">
          {domainCounts.map(d => (
            <Badge key={d.label} variant="secondary" className="px-3 py-1.5 text-sm font-medium" data-testid={`badge-scope-${d.label.toLowerCase()}`}>
              {d.label} <span className="ml-1.5 tabular-nums text-muted-foreground">({d.count})</span>
            </Badge>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Card className="cursor-pointer hover:border-primary/30 transition-colors h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium leading-tight" data-testid={`action-${action.label.slice(0, 15).replace(/\s/g, "-").toLowerCase()}`}>
                      {action.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
