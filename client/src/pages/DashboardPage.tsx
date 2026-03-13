import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";

type User = { id: number; username: string; displayName: string | null; role: string };
type NavPage = "dashboard" | "knowledge-base" | "workflows" | "templates" | "actions" | "risks" | "metrics";

const navItems: { id: NavPage; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "knowledge-base", label: "Knowledge Base" },
  { id: "workflows", label: "Workflows" },
  { id: "templates", label: "Templates" },
  { id: "actions", label: "Actions" },
  { id: "risks", label: "Risks" },
  { id: "metrics", label: "Metrics" },
];

function useApiData<T>(path: string) {
  return useQuery<T[]>({
    queryKey: [path],
    queryFn: async () => {
      const res = await fetch(path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

function SummaryCard({ title, count, description }: { title: string; count?: number; description: string }) {
  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm space-y-1">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold">{count ?? "—"}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function DataTable<T extends Record<string, unknown>>({ data, columns }: { data: T[]; columns: { key: string; label: string }[] }) {
  if (!data.length) return <p className="text-muted-foreground text-sm py-4">No items found.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th key={col.key} className="text-left py-2 px-3 font-medium text-muted-foreground">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-2 px-3 text-foreground">
                  {String(row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardPage({ user }: { user: User }) {
  const [page, setPage] = useState<NavPage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const { data: kbItems } = useApiData<Record<string, unknown>>("/api/knowledge-base");
  const { data: workflowItems } = useApiData<Record<string, unknown>>("/api/workflows");
  const { data: actionItems } = useApiData<Record<string, unknown>>("/api/actions");
  const { data: riskItems } = useApiData<Record<string, unknown>>("/api/risks");
  const { data: metricItems } = useApiData<Record<string, unknown>>("/api/metrics");
  const { data: templateItems } = useApiData<Record<string, unknown>>("/api/templates");

  const pageLabels: Record<NavPage, string> = {
    dashboard: "Dashboard",
    "knowledge-base": "Knowledge Base",
    workflows: "Workflows",
    templates: "Templates",
    actions: "Actions",
    risks: "Risks",
    metrics: "Metrics",
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-sm flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}>
        <div className="p-4 border-b">
          <h1 className="font-bold text-base leading-tight">One DSD</h1>
          <p className="text-xs text-muted-foreground">Equity Program</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                page === item.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{user.displayName ?? user.username}</p>
          <p className="capitalize">{user.role}</p>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-4 gap-3 bg-card">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-sm">{pageLabels[page]}</span>
          <div className="ml-auto">
            <button
              onClick={() => logout()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {page === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <SummaryCard title="Knowledge Base" count={kbItems?.length} description="Articles & resources" />
                <SummaryCard title="Workflows" count={workflowItems?.length} description="Active processes" />
                <SummaryCard title="Actions" count={actionItems?.length} description="Tracked tasks" />
                <SummaryCard title="Risks" count={riskItems?.length} description="Identified risks" />
                <SummaryCard title="Metrics" count={metricItems?.length} description="Performance indicators" />
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h2 className="font-semibold mb-3">Welcome, {user.displayName ?? user.username}</h2>
                <p className="text-sm text-muted-foreground">
                  This is the One DSD Equity Program dashboard for the Minnesota Department of Human Services,
                  Disability Services Division. Use the sidebar to navigate between sections.
                </p>
              </div>
            </div>
          )}

          {page === "knowledge-base" && (
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Knowledge Base</h2>
              <DataTable
                data={kbItems ?? []}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "title", label: "Title" },
                  { key: "category", label: "Category" },
                  { key: "createdAt", label: "Created" },
                ]}
              />
            </div>
          )}

          {page === "workflows" && (
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Workflows</h2>
              <DataTable
                data={workflowItems ?? []}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "title", label: "Title" },
                  { key: "status", label: "Status" },
                  { key: "createdAt", label: "Created" },
                ]}
              />
            </div>
          )}

          {page === "templates" && (
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Templates</h2>
              <DataTable
                data={templateItems ?? []}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "title", label: "Title" },
                  { key: "category", label: "Category" },
                  { key: "createdAt", label: "Created" },
                ]}
              />
            </div>
          )}

          {page === "actions" && (
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Actions</h2>
              <DataTable
                data={actionItems ?? []}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "title", label: "Title" },
                  { key: "status", label: "Status" },
                  { key: "priority", label: "Priority" },
                  { key: "createdAt", label: "Created" },
                ]}
              />
            </div>
          )}

          {page === "risks" && (
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Risks</h2>
              <DataTable
                data={riskItems ?? []}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "title", label: "Title" },
                  { key: "severity", label: "Severity" },
                  { key: "status", label: "Status" },
                  { key: "createdAt", label: "Created" },
                ]}
              />
            </div>
          )}

          {page === "metrics" && (
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Metrics</h2>
              <DataTable
                data={metricItems ?? []}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "name", label: "Name" },
                  { key: "value", label: "Value" },
                  { key: "target", label: "Target" },
                  { key: "category", label: "Category" },
                  { key: "period", label: "Period" },
                ]}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
