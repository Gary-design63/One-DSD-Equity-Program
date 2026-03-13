import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import DocumentDetail from './pages/DocumentDetail';
import Workflows from './pages/Workflows';
import WorkflowDetail from './pages/WorkflowDetail';
import RunDetail from './pages/RunDetail';
import Templates from './pages/Templates';
import TemplateDetail from './pages/TemplateDetail';
import Metrics from './pages/Metrics';
import Learning from './pages/Learning';
import LearningDetail from './pages/LearningDetail';
import AIAgents from './pages/AIAgents';
import Roles from './pages/Roles';
import RoleDetail from './pages/RoleDetail';
import Actions from './pages/Actions';
import Risks from './pages/Risks';
import Deployment from './pages/Deployment';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/knowledge-base/:id" element={<DocumentDetail />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflows/run/:id" element={<RunDetail />} />
            <Route path="/workflows/:id" element={<WorkflowDetail />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<TemplateDetail />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/learning/:id" element={<LearningDetail />} />
            <Route path="/assistant" element={<AIAgents />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/roles/:id" element={<RoleDetail />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/deployment" element={<Deployment />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
