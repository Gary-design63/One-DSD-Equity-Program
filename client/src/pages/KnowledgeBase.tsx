import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, File, FileSpreadsheet } from "lucide-react";
import type { KnowledgeDoc } from "@shared/schema";

const fileIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  docx: File,
  xlsx: FileSpreadsheet,
};

const categoryColors: Record<string, string> = {
  Policies: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Training: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Research: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  Templates: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

export default function KnowledgeBase() {
  const { data: docs = [], isLoading } = useQuery<KnowledgeDoc[]>({ queryKey: ["/api/knowledge-docs"] });
  const [tab, setTab] = useState("All");

  const categories = ["All", "Policies", "Training", "Research", "Templates"];
  const filtered = tab === "All" ? docs : docs.filter(d => d.category === tab);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground mt-1">Document library for equity program resources.</p>
        </div>
        <Button size="sm" data-testid="button-upload-doc">
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Upload
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          {categories.map(c => (
            <TabsTrigger key={c} value={c} data-testid={`tab-kb-${c.toLowerCase()}`}>
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Card key={i} className="h-36 animate-pulse bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No documents in this category.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const IconComp = fileIcons[doc.fileType] || FileText;
            return (
              <Card key={doc.id} className="bg-card hover:border-primary/20 transition-colors" data-testid={`kb-doc-${doc.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 truncate">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{doc.description}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${categoryColors[doc.category] || "bg-muted text-muted-foreground"}`}>
                          {doc.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground tabular-nums">{doc.dateAdded}</span>
                        <span className="text-[11px] text-muted-foreground uppercase">.{doc.fileType}</span>
                      </div>
                    </div>
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
