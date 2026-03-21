import React, { useState } from "react";
import { useData } from "../store";
import { KPI, KPI_GROUPS, formatDate } from "../data";
import {
  Card, SectionHeader, Badge, Table, Tr, Td, KPICard, TrendIcon,
  Modal, FieldRow, inputCls, selectCls, FormButtons, StatRow,
} from "../components/shared";
import { Edit2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function KPIForm({ kpi, onSave, onCancel }: { kpi: KPI; onSave: (k: KPI) => void; onCancel: () => void }) {
  const [form, setForm] = useState<KPI>(kpi);
  const set = (k: keyof KPI, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <FieldRow label="Current Value">
        <input type="number" step="0.1" className={inputCls} value={form.currentValue} onChange={(e) => set("currentValue", parseFloat(e.target.value))} required />
      </FieldRow>
      <FieldRow label="Target">
        <input type="number" step="0.1" className={inputCls} value={form.target} onChange={(e) => set("target", parseFloat(e.target.value))} required />
      </FieldRow>
      <FieldRow label="Trend">
        <select className={selectCls} value={form.trend} onChange={(e) => set("trend", e.target.value)}>
          <option value="up">Up</option>
          <option value="down">Down</option>
          <option value="flat">Flat</option>
        </select>
      </FieldRow>
      <FieldRow label="Data Quality">
        <select className={selectCls} value={form.dataQuality} onChange={(e) => set("dataQuality", e.target.value)}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </FieldRow>
      <FieldRow label="Status">
        <select className={selectCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
          <option>Active</option><option>Archived</option>
        </select>
      </FieldRow>
      <FormButtons onCancel={onCancel} submitLabel="Save KPI" />
    </form>
  );
}

// Build chart data for all KPIs grouped by dashboardGroup
function buildChartData(kpis: KPI[]) {
  return kpis.map((k) => ({
    name: k.name.length > 22 ? k.name.slice(0, 22) + "…" : k.name,
    current: k.currentValue,
    target: k.target,
    previous: k.previousValue,
  }));
}

export default function Metrics() {
  const { data, updateKPI } = useData();
  const [tab, setTab] = useState<"ops" | "leadership">("ops");
  const [editKPI, setEditKPI] = useState<KPI | null>(null);

  // Operations tab: all KPI groups with KPI cards
  // Leadership tab: summary table + actions + risks

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {([["ops", "Operations"], ["leadership", "Leadership"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${tab === key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "ops" && (
        <div className="space-y-8">
          {KPI_GROUPS.map((group) => {
            const kpis = data.kpis.filter((k) => k.dashboardGroup === group);
            const chartData = buildChartData(kpis);
            return (
              <section key={group}>
                <SectionHeader title={group} />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-5">
                  {kpis.map((k) => (
                    <KPICard
                      key={k.id}
                      label={k.name}
                      value={k.currentValue}
                      unit={k.unit}
                      target={k.target}
                      trend={k.trend}
                      goodDirection={k.name.toLowerCase().includes("time") ? "down" : "up"}
                      onClick={() => setEditKPI(k)}
                    />
                  ))}
                </div>
                {kpis.length > 1 && (
                  <Card>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="current" stroke="#2563eb" fill="#dbeafe" name="Current" />
                          <Area type="monotone" dataKey="target" stroke="#10b981" fill="#d1fae5" name="Target" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </section>
            );
          })}
        </div>
      )}

      {tab === "leadership" && (
        <div className="space-y-8">
          {/* Full KPI Table */}
          <section>
            <SectionHeader title="All KPIs" />
            <Card className="p-0 overflow-hidden">
              <Table headers={["KPI", "Group", "Current", "Target", "Unit", "Trend", "Quality", ""]}>
                {data.kpis.map((k) => {
                  const pct = k.target > 0 ? Math.round((k.currentValue / k.target) * 100) : 0;
                  const atTarget = k.currentValue >= k.target;
                  return (
                    <Tr key={k.id}>
                      <Td>
                        <div className="font-medium">{k.name}</div>
                        <div className="text-xs text-gray-400">{k.id}</div>
                      </Td>
                      <Td className="text-xs text-gray-500">{k.dashboardGroup}</Td>
                      <Td className="font-semibold">{k.currentValue}</Td>
                      <Td className="text-gray-500">{k.target}</Td>
                      <Td className="text-xs text-gray-400">{k.unit}</Td>
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <TrendIcon trend={k.trend} goodDirection={k.name.toLowerCase().includes("time") ? "down" : "up"} />
                          <span className={`text-xs ${atTarget ? "text-green-600" : "text-orange-500"}`}>{pct}%</span>
                        </div>
                      </Td>
                      <Td><Badge text={k.dataQuality} /></Td>
                      <Td>
                        <button onClick={() => setEditKPI(k)} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={14} /></button>
                      </Td>
                    </Tr>
                  );
                })}
              </Table>
            </Card>
          </section>

          {/* Actions Summary */}
          <section>
            <SectionHeader title="Quarterly Actions" />
            <Card className="p-0 overflow-hidden">
              <Table headers={["Action", "Owner", "Priority", "Due Date", "Status"]}>
                {data.actions.map((a) => {
                  const owner = data.roles.find((r) => r.id === a.owner);
                  return (
                    <Tr key={a.id}>
                      <Td className="font-medium">{a.title}</Td>
                      <Td className="text-xs text-gray-500">{owner?.name ?? a.owner}</Td>
                      <Td><Badge text={a.priority} /></Td>
                      <Td>{formatDate(a.dueDate)}</Td>
                      <Td><Badge text={a.status} /></Td>
                    </Tr>
                  );
                })}
              </Table>
            </Card>
          </section>

          {/* Risks Summary */}
          <section>
            <SectionHeader title="Program Risks" />
            <Card className="p-0 overflow-hidden">
              <Table headers={["Risk", "Severity", "Likelihood", "Status", "Owner"]}>
                {data.risks.map((r) => {
                  const owner = data.roles.find((ro) => ro.id === r.owner);
                  return (
                    <Tr key={r.id}>
                      <Td className="font-medium">{r.title}</Td>
                      <Td><Badge text={r.severity} /></Td>
                      <Td><Badge text={r.likelihood} /></Td>
                      <Td><Badge text={r.status} /></Td>
                      <Td className="text-xs text-gray-500">{owner?.name ?? r.owner}</Td>
                    </Tr>
                  );
                })}
              </Table>
            </Card>
          </section>
        </div>
      )}

      {editKPI && (
        <Modal title={`Edit KPI: ${editKPI.name}`} onClose={() => setEditKPI(null)} size="md">
          <KPIForm
            kpi={editKPI}
            onSave={(k) => { updateKPI(k); setEditKPI(null); }}
            onCancel={() => setEditKPI(null)}
          />
        </Modal>
      )}
    </div>
  );
}
