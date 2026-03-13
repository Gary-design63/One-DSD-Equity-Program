import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Intake from "@/pages/Intake";
import WorkflowCenter from "@/pages/WorkflowCenter";
import KpiTracker from "@/pages/KpiTracker";
import PolicyReview from "@/pages/PolicyReview";
import EquityMemory from "@/pages/EquityMemory";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Assistant from "@/pages/Assistant";
import Admin from "@/pages/Admin";

function AppRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/intake" component={Intake} />
        <Route path="/workflow-center" component={WorkflowCenter} />
        <Route path="/kpis" component={KpiTracker} />
        <Route path="/policy-review" component={PolicyReview} />
        <Route path="/equity-memory" component={EquityMemory} />
        <Route path="/knowledge-base" component={KnowledgeBase} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
