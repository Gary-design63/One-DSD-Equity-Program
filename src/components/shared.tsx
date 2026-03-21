import React from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, AUTHORITY_LABELS, AUTHORITY_COLORS, formatDate } from "../data";
import { X, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── Badge ───────────────────────────────────────────────────────────────────

export function Badge({ text, className }: { text: string; className?: string }) {
  const color = STATUS_COLORS[text] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-medium", color, className)}>
      {text}
    </span>
  );
}

export function AuthorityBadge({ rank }: { rank: number }) {
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-medium", AUTHORITY_COLORS[rank] ?? "bg-gray-100 text-gray-700")}>
      {rank}. {AUTHORITY_LABELS[rank] ?? "Unknown"}
    </span>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={cn("bg-white rounded-lg border border-gray-200 p-5 shadow-sm", onClick && "cursor-pointer hover:shadow-md transition-shadow", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {action}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function Modal({ title, onClose, children, size = "md" }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn("relative bg-white rounded-xl shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto", widths[size])}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ────────────────────────────────────────────────────

export function ConfirmDelete({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel} size="sm">
      <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete <strong>{label}</strong>? This cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
      </div>
    </Modal>
  );
}

// ─── Stage Pipeline ──────────────────────────────────────────────────────────

export function StagePipeline({ stages, currentStage }: { stages: { name: string; order: number }[]; currentStage?: string }) {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  const activeIdx = sorted.findIndex((s) => s.name === currentStage);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {sorted.map((stage, i) => {
        const done = activeIdx >= 0 && i < activeIdx;
        const active = i === activeIdx;
        return (
          <React.Fragment key={stage.name}>
            <div className={cn(
              "px-3 py-1.5 rounded text-xs font-medium",
              active ? "bg-blue-600 text-white" : done ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
            )}>
              {stage.order}. {stage.name}
            </div>
            {i < sorted.length - 1 && <ChevronRight size={14} className="text-gray-400 shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Trend Icon ──────────────────────────────────────────────────────────────

export function TrendIcon({ trend, goodDirection = "up" }: { trend: string; goodDirection?: "up" | "down" }) {
  const isGood = (trend === "up" && goodDirection === "up") || (trend === "down" && goodDirection === "down");
  const isBad = (trend === "up" && goodDirection === "down") || (trend === "down" && goodDirection === "up");
  if (trend === "up") return <TrendingUp size={14} className={isGood ? "text-green-600" : "text-red-600"} />;
  if (trend === "down") return <TrendingDown size={14} className={isBad ? "text-red-600" : "text-green-600"} />;
  return <Minus size={14} className="text-gray-400" />;
}

// ─── Form helpers ────────────────────────────────────────────────────────────

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
export const selectCls = inputCls;
export const textareaCls = inputCls + " resize-none";

export function FormButtons({ onCancel, submitLabel = "Save" }: { onCancel: () => void; submitLabel?: string }) {
  return (
    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-4">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
      <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{submitLabel}</button>
    </div>
  );
}

// ─── Detail Panel Layout ─────────────────────────────────────────────────────

export function DetailPanel({ title, onBack, badge, meta, children }: {
  title: string;
  onBack: () => void;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        ← Back
      </button>
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-xl font-bold text-gray-900 flex-1">{title}</h1>
          {badge}
        </div>
        {meta && <div className="flex flex-wrap gap-4 text-sm text-gray-500">{meta}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-gray-400 text-sm">{message}</div>
  );
}

// ─── Search + Filter Bar ─────────────────────────────────────────────────────

export function SearchBar({ value, onChange, placeholder = "Search…" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

export function FilterSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── Data Table ──────────────────────────────────────────────────────────────

export function Table({ headers, children, className }: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((h) => (
              <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={cn("border-b border-gray-100 last:border-0", onClick && "cursor-pointer hover:bg-gray-50", className)}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-2.5 px-3 text-gray-700", className)}>{children}</td>;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

export function KPICard({ label, value, unit, target, trend, goodDirection = "up", onClick }: {
  label: string;
  value: number;
  unit: string;
  target: number;
  trend: string;
  goodDirection?: "up" | "down";
  onClick?: () => void;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const atTarget = value >= target;
  return (
    <Card onClick={onClick} className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500 leading-tight flex-1 pr-2">{label}</p>
        <TrendIcon trend={trend} goodDirection={goodDirection} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", atTarget ? "bg-green-500" : "bg-blue-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">Target: {target} {unit}</p>
    </Card>
  );
}

// ─── Stat ────────────────────────────────────────────────────────────────────

export function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-xs text-gray-800 flex-1">{value}</span>
    </div>
  );
}
