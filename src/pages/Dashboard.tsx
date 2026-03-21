import React from "react";
import { useData } from "../store";
import { KPI_GROUPS, formatDate } from "../data";
import {
  Card, SectionHeader, Badge, KPICard, Table, Tr, Td, TrendIcon, StagePipeline, StatRow,
} from "../components/shared";

export default function Dashboard() {
  const { data } = useData();
  const rp = data.reportingPeriods[0];
  const activeRuns = data.workflowRuns.filter((r) => r.status !== "Completed");
  const openActions = data.actions.filter((a) => a.status !== "Completed");
  const activeRisks = data.risks.filter((r) => r.status === "Active");

  return (
    <div className="space-y-8">
      {/* Reporting Period Banner */}
      {rp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-blue-800">{rp.name}</span>
            <span className="text-sm text-blue-600 ml-3">{formatDate(rp.startDate)} – {formatDate(rp.endDate)}</span>
          </div>
          <Badge text={rp.status} />
        </div>
      )}

      {/* KPI Groups */}
      {KPI_GROUPS.map((group) => {
        const kpis = data.kpis.filter((k) => k.dashboardGroup === group);
        return (
          <section key={group}>
            <SectionHeader title={group} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {kpis.map((k) => (
                <KPICard
                  key={k.id}
                  label={k.name}
                  value={k.currentValue}
                  unit={k.unit}
                  target={k.target}
                  trend={k.trend}
                  goodDirection={k.name.toLowerCase().includes("time") ? "down" : "up"}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Active Workflow Runs */}
      <section>
        <SectionHeader title="Active Workflow Runs" />
        <Card className="p-0 overflow-hidden">
          <Table headers={["Run", "Workflow", "Stage", "Priority", "Target Date", "Status"]}>
            {activeRuns.map((run) => {
              const wf = data.workflows.find((w) => w.id === run.workflowId);
              return (
                <Tr key={run.id}>
                  <Td className="font-medium">{run.title}</Td>
                  <Td className="text-gray-500">{wf?.name ?? run.workflowId}</Td>
                  <Td>{run.currentStage}</Td>
                  <Td><Badge text={run.priority} /></Td>
                  <Td>{formatDate(run.targetDate)}</Td>
                  <Td><Badge text={run.status} /></Td>
                </Tr>
              );
            })}
          </Table>
        </Card>
      </section>

      {/* Open Actions */}
      <section>
        <SectionHeader title="Open Actions" />
        <Card className="p-0 overflow-hidden">
          <Table headers={["Action", "Owner", "Priority", "Due Date", "Status"]}>
            {openActions.map((a) => {
              const owner = data.roles.find((r) => r.id === a.owner);
              return (
                <Tr key={a.id}>
                  <Td className="font-medium">{a.title}</Td>
                  <Td className="text-gray-500 text-xs">{owner?.name ?? a.owner}</Td>
                  <Td><Badge text={a.priority} /></Td>
                  <Td>{formatDate(a.dueDate)}</Td>
                  <Td><Badge text={a.status} /></Td>
                </Tr>
              );
            })}
          </Table>
        </Card>
      </section>

      {/* Active Risks */}
      <section>
        <SectionHeader title="Active Risks" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRisks.map((r) => (
            <Card key={r.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 flex-1">{r.title}</p>
                <Badge text={r.severity} />
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{r.description}</p>
              <div className="flex gap-2 flex-wrap mt-auto pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">Likelihood: <span className="font-medium text-gray-600">{r.likelihood}</span></span>
                <Badge text={r.status} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Program Snapshot */}
      <section>
        <SectionHeader title="Program Snapshot" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Documents", value: data.documents.length },
            { label: "Workflows", value: data.workflows.length },
            { label: "Templates", value: data.templates.length },
            { label: "Learning Assets", value: data.learningAssets.length },
            { label: "Roles", value: data.roles.length },
            { label: "Active Runs", value: activeRuns.length },
          ].map((s) => (
            <Card key={s.label} className="text-center py-4">
              <div className="text-2xl font-bold text-blue-700">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
