import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { EquityMemory } from "@shared/schema";

const categoryColors: Record<string, string> = {
  Community: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  Workforce: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Training: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Policy: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Operations: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export default function EquityMemoryPage() {
  const { data: memories = [], isLoading } = useQuery<EquityMemory[]>({ queryKey: ["/api/equity-memories"] });
  const [search, setSearch] = useState("");

  const filtered = memories.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.summary.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">Equity Memory</h2>
        <p className="text-sm text-muted-foreground mt-1">Searchable log of past equity decisions, precedents, and organizational learning.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search equity memory entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-equity-memory-search"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Card key={i} className="h-28 animate-pulse bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No entries match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <Card key={entry.id} className="bg-card" data-testid={`memory-entry-${entry.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{entry.title}</h3>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${categoryColors[entry.category] || "bg-muted text-muted-foreground"}`}>
                    {entry.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground tabular-nums mb-2">{entry.date}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{entry.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
