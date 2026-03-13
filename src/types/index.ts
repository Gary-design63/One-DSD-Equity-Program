// ── Core Entity Types ──────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  type: string;
  purpose: string;
  responsibilities: string[];
  decisionAuthority: string[];
  reviewScope: string[];
  active: boolean;
}

export interface Document {
  id: string;
  title: string;
  shortTitle?: string;
  batch: string;
  secondaryBatch?: string;
  authorityType: string;
  authorityRank: number;
  sourceType: string;
  sourceOrg?: string;
  documentType?: string;
  format?: string;
  audience?: string;
  owner: string;
  effectiveDate?: string;
  reviewDate?: string;
  processingStatus?: string;
  sourceOfTruth?: boolean;
  requiredForCompliance?: boolean;
  programRelevance?: string;
  educationalRelevance?: string;
  equityMethod?: string;
  institutionalScope?: string;
  geographicScope?: string;
  status: string;
  purpose: string;
  notes?: string;
  relatedWorkflow?: string;
  relatedMetric?: string;
  relatedEducation?: string;
}

export interface WorkflowStage {
  name: string;
  order: number;
  description?: string;
  responsible?: string;
  estimatedDuration?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  owner: string;
  trigger?: string;
  reviewFrequency?: string;
  stages: WorkflowStage[];
  requiredDocs?: string[];
  outputTemplates?: string[];
  relatedMetrics?: string[];
}

export interface WorkflowRun {
  id: string;
  title: string;
  description: string;
  workflowId: string;
  currentStage: string;
  status: string;
  priority: string;
  requestedBy: string;
  assignedTo: string;
  startDate?: string;
  targetDate?: string;
  notes?: string;
  linkedDocs?: string[];
  linkedTemplates?: string[];
}

export interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  owner: string;
  audience?: string;
  status: string;
  version?: string;
  linkedWorkflows?: string[];
  linkedDocs?: string[];
}

export interface KPI {
  id: string;
  name: string;
  unit: string;
  currentValue: number;
  previousValue?: number;
  target?: number;
  trend: 'up' | 'down' | 'flat';
  dashboardGroup: string;
  dataQuality?: string;
  owner: string;
  formula?: string;
  reportingFrequency?: string;
}

export interface LearningAsset {
  id: string;
  title: string;
  type: string;
  description: string;
  requiredOrOptional: string;
  estimatedDuration?: string;
  owner: string;
  status: string;
  audience?: string[];
  sourceDocs?: string[];
  linkedWorkflows?: string[];
  linkedTemplates?: string[];
}

export interface Action {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: string;
  priority: string;
  dueDate?: string;
  linkedKPIs?: string[];
  linkedWorkflows?: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: string;
  likelihood: string;
  status: string;
  owner: string;
  mitigationPlan: string;
  linkedKPIs?: string[];
  linkedWorkflows?: string[];
  linkedActions?: string[];
}

export interface Relationship {
  id: string;
  fromId: string;
  fromType: string;
  toId: string;
  toType: string;
  relationshipType: string;
  strength?: string;
}

export interface ReportingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface AppData {
  roles: Role[];
  documents: Document[];
  workflows: Workflow[];
  workflowRuns: WorkflowRun[];
  templates: Template[];
  kpis: KPI[];
  learningAssets: LearningAsset[];
  actions: Action[];
  risks: Risk[];
  relationships: Relationship[];
  reportingPeriods: ReportingPeriod[];
}

// ── Auth Types ─────────────────────────────────────────────────────────────────

export interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

// ── Agent Types ────────────────────────────────────────────────────────────────

export interface AgentMeta {
  emoji: string;
  color: string;
  label: string;
}

export interface AgentMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentName?: string;
  toolsUsed?: string[];
  timestamp?: Date;
}

export interface Conversation {
  id: string;
  title?: string;
  last_message_at?: string;
}

export interface Insight {
  id: string;
  title: string;
  content: string;
  insight_type: string;
  agent_name: string;
  created_at: string;
}

export interface WsMessage {
  type: string;
  char?: string;
  agent?: string;
  status?: string;
  tool?: string;
  error?: string;
  agents?: AgentInfo[];
  conversationId?: string;
}

export interface AgentInfo {
  name: string;
  description?: string;
}

// ── Window Globals ─────────────────────────────────────────────────────────────

declare global {
  interface Window {
    APP_DATA: AppData;
    AGENT_API_URL?: string;
    AUTH?: {
      init: () => Promise<void>;
      login: () => void;
      logout: () => void;
      getUser: () => User | null;
      isAdmin: () => boolean;
    };
    AGENT?: {
      submitMessage: (msg?: string) => void;
    };
    msal?: unknown;
  }
}
