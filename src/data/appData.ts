import type { AppData } from '../types';

/**
 * Returns the global APP_DATA object injected by public/data.js via index.html script tag.
 * This is mutable — CRUD operations mutate it directly (same as the vanilla JS version).
 */
export function getAppData(): AppData {
  return window.APP_DATA;
}

export const D = window.APP_DATA;
