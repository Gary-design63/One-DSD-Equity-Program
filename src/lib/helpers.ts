import type { AppData } from '../types';

export function formatDate(s?: string | null): string {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getById<T extends { id: string }>(arr: T[], id: string): T | undefined {
  return arr.find(i => i.id === id);
}

export function lookupName(arr: Array<{ id: string; name?: string; title?: string }>, id: string): string {
  const o = getById(arr, id);
  return o ? (o.name || o.title || id) : id;
}

export function roleName(D: AppData, id: string): string {
  return lookupName(D.roles, id);
}

export function getRelated(D: AppData, entityId: string) {
  return D.relationships.filter(r => r.fromId === entityId || r.toId === entityId);
}
