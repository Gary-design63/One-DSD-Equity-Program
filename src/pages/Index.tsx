import { useState } from "react";
import { useProcessManager } from "@/hooks/useProcessManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Play, Square, X } from "lucide-react";

const Index = () => {
  const [processName, setProcessName] = useState("");
  const { processes, lastError, startProcess, stopProcess, clearError, isProcessError } =
    useProcessManager();

  const handleStart = () => {
    const name = processName.trim();
    if (!name) return;
    const result = startProcess(name);
    if (!isProcessError(result)) {
      setProcessName("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Process Manager</h1>
          <p className="mt-1 text-muted-foreground">
            Start named processes — duplicates are detected and blocked.
          </p>
        </div>

        {lastError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              RPC Error {lastError.code}
              <button onClick={clearError} aria-label="Dismiss error">
                <X className="h-4 w-4" />
              </button>
            </AlertTitle>
            <AlertDescription className="font-mono text-sm">
              {lastError.message}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Start a Process</CardTitle>
            <CardDescription>
              Enter a unique process name. Starting a process with an existing
              name returns RPC error&nbsp;-1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. magical-loving-bell"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
              <Button onClick={handleStart} disabled={!processName.trim()}>
                <Play className="mr-1 h-4 w-4" />
                Start
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Running Processes{" "}
              <Badge variant="secondary">{processes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No processes running.
              </p>
            ) : (
              <ul className="space-y-2">
                {processes.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {p.id}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => stopProcess(p.id)}
                      aria-label={`Stop ${p.name}`}
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
