import { useState, useCallback } from "react";

export interface ProcessEntry {
  id: string;
  name: string;
  startedAt: Date;
}

export interface ProcessError {
  code: number;
  message: string;
  processId: string;
}

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useProcessManager() {
  const [processes, setProcesses] = useState<Map<string, ProcessEntry>>(
    new Map()
  );
  const [lastError, setLastError] = useState<ProcessError | null>(null);

  const startProcess = useCallback(
    (name: string): ProcessEntry | ProcessError => {
      const existing = Array.from(processes.values()).find(
        (p) => p.name === name
      );

      if (existing) {
        const error: ProcessError = {
          code: -1,
          message: `process with name "${name}" already running (id: ${existing.id})`,
          processId: existing.id,
        };
        setLastError(error);
        return error;
      }

      const entry: ProcessEntry = {
        id: generateId(),
        name,
        startedAt: new Date(),
      };

      setProcesses((prev) => {
        const next = new Map(prev);
        next.set(entry.id, entry);
        return next;
      });

      setLastError(null);
      return entry;
    },
    [processes]
  );

  const stopProcess = useCallback((id: string) => {
    setProcesses((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearError = useCallback(() => setLastError(null), []);

  const isProcessError = (
    result: ProcessEntry | ProcessError
  ): result is ProcessError => {
    return "code" in result;
  };

  return {
    processes: Array.from(processes.values()),
    lastError,
    startProcess,
    stopProcess,
    clearError,
    isProcessError,
  };
}
