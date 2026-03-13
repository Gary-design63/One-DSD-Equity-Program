/**
 * One DSD Equity Program — Agent Tool Implementations
 * These are the callable tools available to all agents.
 * Each tool returns structured JSON the agent can reason about.
 */

import { getAllEntities, searchEntityCache, queries, audit, getAgentMemory, setAgentMemory } from '../db/index.js';

// ── Tool Definitions (for Anthropic tool_use) ────────────────────────────────

export const TOOL_DEFINITIONS = [
  {
    name: 'search_knowledge_base',
    description: 'Search the equity program knowledge base for documents, policies, laws, and frameworks. Use this to answer policy questions, find compliance guidance, or retrieve relevant documents.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search terms or question to find relevant documents' },
        authority_rank: { type: 'number', description: 'Filter by authority rank 1-8 (1=Law/Regulation, 8=Archived). Optional.' },
        batch: { type: 'string', description: 'Filter by document batch category. Optional.' },
        source_type: { type: 'string', enum: ['Public', 'Internal'], description: 'Filter by source type. Optional.' },
        limit: { type: 'number', description: 'Max documents to return (default 5)' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_workflow_guidance',
    description: 'Get detailed guidance for a specific equity analysis workflow, including all stages, required documents, templates, and decision criteria at each stage.',
    input_schema: {
      type: 'object',
      properties: {
        workflow_id: { type: 'string', description: 'Workflow ID (e.g. WF-001) or workflow name' },
        current_stage: { type: 'string', description: 'Current stage name if in-progress. Optional.' }
      },
      required: ['workflow_id']
    }
  },
  {
    name: 'get_metrics_summary',
    description: 'Retrieve current KPI data and performance metrics for the equity program. Returns values, targets, trends, and achievement percentages.',
    input_schema: {
      type: 'object',
      properties: {
        group: { type: 'string', description: 'KPI group to filter by (e.g. "Demand & Throughput", "Timeliness", "Quality & Follow-Through", "Learning & Capacity", "Accountability & Progress"). Optional.' },
        below_target_only: { type: 'boolean', description: 'If true, only return KPIs below their target. Optional.' }
      },
      required: []
    }
  },
  {
    name: 'get_learning_recommendations',
    description: 'Get learning asset recommendations based on topic, audience, or format. Use to recommend training, courses, or job aids for staff development.',
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Topic or skill area to find learning assets for' },
        audience: { type: 'string', description: 'Target audience (e.g. "All Staff", "Leadership", "Program Managers"). Optional.' },
        format: { type: 'string', description: 'Format preference (e.g. "Course", "Microlearning", "Job Aid"). Optional.' },
        required_only: { type: 'boolean', description: 'If true, only return required training. Optional.' }
      },
      required: ['topic']
    }
  },
  {
    name: 'get_actions_status',
    description: 'Get the current status of action items in the equity program. Use to check progress, identify overdue items, or surface items needing attention.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['Open', 'In Progress', 'Completed', 'Blocked', 'Cancelled'], description: 'Filter by status. Optional.' },
        priority: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'], description: 'Filter by priority. Optional.' },
        owner: { type: 'string', description: 'Filter by owner name or role. Optional.' }
      },
      required: []
    }
  },
  {
    name: 'get_risks_summary',
    description: 'Get the equity program risk registry. Use to identify current risks, assess severity, review mitigation plans, or flag escalations.',
    input_schema: {
      type: 'object',
      properties: {
        severity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'], description: 'Filter by severity. Optional.' },
        status: { type: 'string', enum: ['Open', 'Monitoring', 'Mitigated', 'Escalated', 'Closed'], description: 'Filter by status. Optional.' }
      },
      required: []
    }
  },
  {
    name: 'get_active_workflows',
    description: 'Get all currently active workflow runs, their stages, assignees, and progress. Use to understand current operational workload.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by run status. Optional.' }
      },
      required: []
    }
  },
  {
    name: 'get_roles_overview',
    description: 'Get an overview of roles in the equity program, their responsibilities, decision authority, and owned entities.',
    input_schema: {
      type: 'object',
      properties: {
        role_name: { type: 'string', description: 'Specific role to get details for. Optional — if omitted returns all roles.' }
      },
      required: []
    }
  },
  {
    name: 'store_insight',
    description: 'Store an insight, recommendation, or alert generated by your analysis. This persists the insight for the consultant to review and for other agents to reference.',
    input_schema: {
      type: 'object',
      properties: {
        insight_type: {
          type: 'string',
          enum: ['risk_flag', 'pattern', 'recommendation', 'briefing', 'alert'],
          description: 'Category of the insight'
        },
        title: { type: 'string', description: 'Short descriptive title for the insight' },
        content: { type: 'string', description: 'Full content of the insight' },
        related_entities: {
          type: 'array',
          description: 'Entities this insight relates to',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              id: { type: 'string' },
              name: { type: 'string' }
            }
          }
        },
        confidence: { type: 'number', description: 'Confidence level 0.0-1.0' },
        expires_in_days: { type: 'number', description: 'Days until this insight expires. Omit for permanent.' }
      },
      required: ['insight_type', 'title', 'content']
    }
  },
  {
    name: 'get_recent_insights',
    description: 'Retrieve recently stored insights from any agent. Use to build context or avoid duplicating work.',
    input_schema: {
      type: 'object',
      properties: {
        insight_type: { type: 'string', description: 'Filter by insight type. Optional.' },
        limit: { type: 'number', description: 'Max insights to return (default 10)' }
      },
      required: []
    }
  },
  {
    name: 'delegate_task',
    description: 'Delegate a specific sub-task to another specialized agent. Use when a task requires expertise outside your domain.',
    input_schema: {
      type: 'object',
      properties: {
        to_agent: {
          type: 'string',
          enum: ['policy_navigator', 'workflow_architect', 'metrics_intelligence', 'learning_curator', 'risk_action_monitor', 'community_intelligence'],
          description: 'The specialized agent to delegate to'
        },
        task_summary: { type: 'string', description: 'Clear description of what you need from that agent' },
        context: { type: 'object', description: 'Relevant context data to pass to the agent' }
      },
      required: ['to_agent', 'task_summary']
    }
  },
  {
    name: 'cross_reference_entities',
    description: 'Find relationships between entities (documents, workflows, KPIs, learning assets). Use to surface connections that inform equity analysis.',
    input_schema: {
      type: 'object',
      properties: {
        entity_type: { type: 'string', description: 'Type of entity (document, workflow, kpi, etc.)' },
        entity_id: { type: 'string', description: 'ID of the entity to cross-reference' }
      },
      required: ['entity_type', 'entity_id']
    }
  },
  {
    name: 'read_agent_memory',
    description: 'Read your long-term memory to recall program context, consultant preferences, recurring patterns, and key facts you have accumulated across past sessions. Call this at the start of complex requests.',
    input_schema: {
      type: 'object',
      properties: {
        memory_type: {
          type: 'string',
          enum: ['program_context', 'preferences', 'patterns', 'key_facts', 'all'],
          description: 'Which memory category to retrieve. Use "all" to get everything.'
        }
      },
      required: ['memory_type']
    }
  },
  {
    name: 'write_agent_memory',
    description: 'Store something important in your long-term memory for future sessions. Use this to remember consultant preferences, patterns you have identified, key facts about the program, or context that will be useful later.',
    input_schema: {
      type: 'object',
      properties: {
        memory_type: {
          type: 'string',
          enum: ['program_context', 'preferences', 'patterns', 'key_facts'],
          description: 'Category for this memory'
        },
        content: { type: 'string', description: 'What to remember. This REPLACES the current memory for this type — include all important items, not just the new one.' }
      },
      required: ['memory_type', 'content']
    }
  },
  {
    name: 'advance_workflow_stage',
    description: 'Advance a workflow run to the next stage or a specified stage. Use this when the consultant confirms stage completion and wants to move forward. Records the advancement with justification.',
    input_schema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'The workflow run ID to advance' },
        justification: { type: 'string', description: 'Brief explanation of why this stage is complete and what was accomplished' },
        next_stage: { type: 'string', description: 'Explicit next stage name to advance to. If omitted, advances to the next sequential stage.' }
      },
      required: ['run_id', 'justification']
    }
  },
  {
    name: 'generate_report_section',
    description: 'Generate a formatted report section using current program data. Use this to build quarterly reports, executive summaries, or accountability reports.',
    input_schema: {
      type: 'object',
      properties: {
        section_type: {
          type: 'string',
          enum: ['executive_summary', 'metrics_performance', 'workflow_status', 'risk_actions', 'learning_progress', 'recommendations'],
          description: 'Which report section to generate'
        },
        period: { type: 'string', description: 'Reporting period (e.g. "Q1 FY2026"). Optional.' },
        audience: {
          type: 'string',
          enum: ['leadership', 'consultant', 'staff'],
          description: 'Intended audience — adjusts tone and detail level'
        }
      },
      required: ['section_type', 'audience']
    }
  }
];

// ── Tool Implementations ─────────────────────────────────────────────────────

export async function executeTool(toolName, toolInput, agentName) {
  try {
    switch (toolName) {
      case 'search_knowledge_base':       return searchKnowledgeBase(toolInput, agentName);
      case 'get_workflow_guidance':        return getWorkflowGuidance(toolInput, agentName);
      case 'get_metrics_summary':          return getMetricsSummary(toolInput, agentName);
      case 'get_learning_recommendations': return getLearningRecommendations(toolInput, agentName);
      case 'get_actions_status':           return getActionsStatus(toolInput, agentName);
      case 'get_risks_summary':            return getRisksSummary(toolInput, agentName);
      case 'get_active_workflows':         return getActiveWorkflows(toolInput, agentName);
      case 'get_roles_overview':           return getRolesOverview(toolInput, agentName);
      case 'store_insight':                return storeInsight(toolInput, agentName);
      case 'get_recent_insights':          return getRecentInsights(toolInput, agentName);
      case 'delegate_task':                return { delegated: true, to_agent: toolInput.to_agent, task: toolInput.task_summary };
      case 'cross_reference_entities':     return crossReferenceEntities(toolInput, agentName);
      case 'read_agent_memory':            return readAgentMemory(toolInput, agentName);
      case 'write_agent_memory':           return writeAgentMemory(toolInput, agentName);
      case 'advance_workflow_stage':       return advanceWorkflowStage(toolInput, agentName);
      case 'generate_report_section':      return generateReportSection(toolInput, agentName);
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    console.error(`[Tool Error] ${toolName}:`, err.message);
    return { error: err.message };
  }
}

// ── Individual Tool Functions ────────────────────────────────────────────────

function searchKnowledgeBase({ query, authority_rank, batch, source_type, limit = 5 }, agentName) {
  let docs = getAllEntities('document');

  // Text search across title, purpose, shortTitle
  const q = query.toLowerCase();
  docs = docs.filter(d => {
    const searchable = `${d.title || ''} ${d.shortTitle || ''} ${d.purpose || ''} ${d.batch || ''} ${d.authorityType || ''}`.toLowerCase();
    return searchable.includes(q);
  });

  if (authority_rank) docs = docs.filter(d => d.authorityRank === authority_rank);
  if (batch) docs = docs.filter(d => d.batch && d.batch.toLowerCase().includes(batch.toLowerCase()));
  if (source_type) docs = docs.filter(d => d.sourceType === source_type);

  docs = docs.slice(0, limit);

  audit(agentName, 'search_knowledge_base', 'document', null, { query, results: docs.length });

  return {
    query,
    total_found: docs.length,
    documents: docs.map(d => ({
      id: d.id,
      title: d.title,
      shortTitle: d.shortTitle,
      batch: d.batch,
      authorityType: d.authorityType,
      authorityRank: d.authorityRank,
      sourceType: d.sourceType,
      status: d.status,
      purpose: d.purpose,
      owner: d.owner
    }))
  };
}

function getWorkflowGuidance({ workflow_id, current_stage }, agentName) {
  const workflows = getAllEntities('workflow');
  const workflow = workflows.find(w =>
    w.id === workflow_id ||
    (w.title && w.title.toLowerCase().includes(workflow_id.toLowerCase()))
  );

  if (!workflow) {
    return { error: `Workflow not found: ${workflow_id}`, available_workflows: workflows.map(w => ({ id: w.id, title: w.title })) };
  }

  const stages = workflow.stages || [];
  const currentStageIndex = current_stage
    ? stages.findIndex(s => s.name && s.name.toLowerCase().includes(current_stage.toLowerCase()))
    : -1;

  const contextualStages = stages.map((stage, i) => ({
    ...stage,
    position: i + 1,
    is_current: i === currentStageIndex,
    is_completed: currentStageIndex >= 0 && i < currentStageIndex,
    is_upcoming: i > currentStageIndex
  }));

  audit(agentName, 'get_workflow_guidance', 'workflow', workflow.id, { current_stage });

  return {
    workflow: {
      id: workflow.id,
      title: workflow.title,
      description: workflow.description,
      purpose: workflow.purpose,
      typicalDuration: workflow.typicalDuration,
      totalStages: stages.length
    },
    current_stage_context: currentStageIndex >= 0 ? contextualStages[currentStageIndex] : null,
    next_stage: currentStageIndex >= 0 && currentStageIndex < stages.length - 1
      ? contextualStages[currentStageIndex + 1]
      : null,
    all_stages: contextualStages,
    guidance: generateWorkflowGuidance(workflow, currentStageIndex, contextualStages)
  };
}

function generateWorkflowGuidance(workflow, currentIndex, stages) {
  if (currentIndex < 0) {
    return `To initiate the "${workflow.title}" workflow: Begin with Stage 1 (${stages[0]?.name || 'Initiation'}). Ensure all prerequisites are documented and stakeholders are identified before proceeding.`;
  }

  const current = stages[currentIndex];
  const next = stages[currentIndex + 1];

  let guidance = `Currently at Stage ${current.position}: "${current.name}". `;
  if (current.description) guidance += `${current.description} `;
  if (current.deliverables?.length) guidance += `Required deliverables: ${current.deliverables.join(', ')}. `;
  if (next) guidance += `Next stage: "${next.name}" — ${next.description || ''}`;
  else guidance += 'This is the final stage. Ensure all deliverables are complete and the workflow run is closed.';

  return guidance;
}

function getMetricsSummary({ group, below_target_only = false }, agentName) {
  let kpis = getAllEntities('kpi');

  if (group) {
    kpis = kpis.filter(k => k.group && k.group.toLowerCase().includes(group.toLowerCase()));
  }

  if (below_target_only) {
    kpis = kpis.filter(k => {
      const current = parseFloat(k.currentValue);
      const target = parseFloat(k.target);
      return !isNaN(current) && !isNaN(target) && current < target;
    });
  }

  // Compute achievement % for each KPI
  const enriched = kpis.map(k => {
    const current = parseFloat(k.currentValue);
    const target = parseFloat(k.target);
    const achievement = (!isNaN(current) && !isNaN(target) && target > 0)
      ? Math.round((current / target) * 100)
      : null;
    return { ...k, achievement_pct: achievement };
  });

  const groups = [...new Set(enriched.map(k => k.group).filter(Boolean))];
  const summary = {
    total_kpis: enriched.length,
    groups_covered: groups,
    below_target: enriched.filter(k => k.achievement_pct !== null && k.achievement_pct < 100).length,
    on_target: enriched.filter(k => k.achievement_pct !== null && k.achievement_pct >= 100).length,
    trending_up: enriched.filter(k => k.trend === 'up').length,
    trending_down: enriched.filter(k => k.trend === 'down').length
  };

  audit(agentName, 'get_metrics_summary', 'kpi', null, { group, count: enriched.length });

  return { summary, kpis: enriched };
}

function getLearningRecommendations({ topic, audience, format, required_only = false }, agentName) {
  let assets = getAllEntities('learning');

  const t = topic.toLowerCase();
  assets = assets.filter(a => {
    const searchable = `${a.title || ''} ${a.description || ''} ${a.topics?.join(' ') || ''}`.toLowerCase();
    return searchable.includes(t);
  });

  if (audience) {
    assets = assets.filter(a =>
      !a.audience ||
      a.audience.toLowerCase().includes(audience.toLowerCase()) ||
      a.audience === 'All Staff'
    );
  }

  if (format) {
    assets = assets.filter(a => a.type && a.type.toLowerCase().includes(format.toLowerCase()));
  }

  if (required_only) {
    assets = assets.filter(a => a.required === true || a.required === 'Yes');
  }

  audit(agentName, 'get_learning_recommendations', 'learning', null, { topic, count: assets.length });

  return {
    topic,
    total_found: assets.length,
    assets: assets.map(a => ({
      id: a.id,
      title: a.title,
      type: a.type,
      description: a.description,
      audience: a.audience,
      duration: a.duration,
      required: a.required,
      status: a.status,
      owner: a.owner
    }))
  };
}

function getActionsStatus({ status, priority, owner }, agentName) {
  let actions = getAllEntities('action');

  if (status) actions = actions.filter(a => a.status === status);
  if (priority) actions = actions.filter(a => a.priority === priority);
  if (owner) {
    const o = owner.toLowerCase();
    actions = actions.filter(a => a.owner && a.owner.toLowerCase().includes(o));
  }

  // Flag overdue items
  const now = new Date();
  const enriched = actions.map(a => ({
    ...a,
    is_overdue: a.dueDate && new Date(a.dueDate) < now && a.status !== 'Completed'
  }));

  const overdue = enriched.filter(a => a.is_overdue);

  audit(agentName, 'get_actions_status', 'action', null, { filters: { status, priority, owner } });

  return {
    total: enriched.length,
    overdue_count: overdue.length,
    overdue_items: overdue.map(a => ({ id: a.id, title: a.title, dueDate: a.dueDate, owner: a.owner, priority: a.priority })),
    actions: enriched
  };
}

function getRisksSummary({ severity, status }, agentName) {
  let risks = getAllEntities('risk');

  if (severity) risks = risks.filter(r => r.severity === severity);
  if (status) risks = risks.filter(r => r.status === status);

  const critical = risks.filter(r => r.severity === 'Critical' || r.severity === 'High');

  audit(agentName, 'get_risks_summary', 'risk', null, { filters: { severity, status } });

  return {
    total: risks.length,
    critical_count: critical.length,
    by_severity: {
      Critical: risks.filter(r => r.severity === 'Critical').length,
      High: risks.filter(r => r.severity === 'High').length,
      Medium: risks.filter(r => r.severity === 'Medium').length,
      Low: risks.filter(r => r.severity === 'Low').length
    },
    critical_risks: critical.map(r => ({
      id: r.id, title: r.title, severity: r.severity, status: r.status,
      owner: r.owner, mitigationPlan: r.mitigationPlan
    })),
    all_risks: risks
  };
}

function getActiveWorkflows({ status }, agentName) {
  const workflowDefs = getAllEntities('workflow');
  const workflowRuns = getAllEntities('workflowRun');

  let runs = workflowRuns;
  if (status) runs = runs.filter(r => r.status === status);
  else runs = runs.filter(r => r.status && !['Completed', 'Cancelled'].includes(r.status));

  const enriched = runs.map(run => {
    const def = workflowDefs.find(w => w.id === run.workflowId);
    return { ...run, workflowTitle: def?.title, totalStages: def?.stages?.length };
  });

  audit(agentName, 'get_active_workflows', 'workflowRun', null, { count: enriched.length });

  return { total_active: enriched.length, runs: enriched };
}

function getRolesOverview({ role_name }, agentName) {
  let roles = getAllEntities('role');

  if (role_name) {
    const r = role_name.toLowerCase();
    roles = roles.filter(role => role.name && role.name.toLowerCase().includes(r));
  }

  audit(agentName, 'get_roles_overview', 'role', null, { count: roles.length });

  return { total: roles.length, roles };
}

function storeInsight({ insight_type, title, content, related_entities = [], confidence = 0.8, expires_in_days }, agentName) {
  const id = crypto.randomUUID();
  const expiresAt = expires_in_days
    ? new Date(Date.now() + expires_in_days * 86400000).toISOString()
    : null;

  queries.addInsight.run(
    id,
    agentName,
    insight_type,
    title,
    content,
    JSON.stringify(related_entities),
    confidence,
    expiresAt
  );

  audit(agentName, 'store_insight', 'insight', id, { insight_type, title });

  return { success: true, insight_id: id, message: `Insight "${title}" stored successfully.` };
}

function getRecentInsights({ insight_type, limit = 10 }, agentName) {
  const insights = insight_type
    ? queries.getInsightsByType.all(insight_type, limit)
    : queries.getActiveInsights.all(limit);

  return {
    total: insights.length,
    insights: insights.map(i => ({
      ...i,
      related_entities: JSON.parse(i.related_entities || '[]')
    }))
  };
}

function readAgentMemory({ memory_type }, agentName) {
  if (memory_type === 'all') {
    const memory = getAgentMemory(agentName);
    return {
      agent: agentName,
      memory,
      has_memory: Object.keys(memory).length > 0,
      types_stored: Object.keys(memory)
    };
  }

  const row = queries.getMemoryEntry.get(agentName, memory_type);
  return {
    agent: agentName,
    memory_type,
    content: row ? row.content : null,
    updated_at: row ? row.updated_at : null,
    found: !!row
  };
}

function writeAgentMemory({ memory_type, content }, agentName) {
  setAgentMemory(agentName, memory_type, content);
  audit(agentName, 'write_memory', 'agent_memory', agentName, { memory_type, length: content.length });
  return {
    success: true,
    message: `Memory updated for ${agentName} [${memory_type}]`,
    memory_type,
    content_length: content.length
  };
}

function advanceWorkflowStage({ run_id, justification, next_stage }, agentName) {
  const workflowRuns = getAllEntities('workflowRun');
  const run = workflowRuns.find(r => r.id === run_id);

  if (!run) {
    return { error: `Workflow run not found: ${run_id}` };
  }

  const workflowDefs = getAllEntities('workflow');
  const def = workflowDefs.find(w => w.id === run.workflowId);
  const stages = def?.stages || [];

  const currentIndex = stages.findIndex(s =>
    s.name && s.name.toLowerCase() === (run.currentStage || '').toLowerCase()
  );

  let targetStage;
  if (next_stage) {
    targetStage = stages.find(s => s.name && s.name.toLowerCase().includes(next_stage.toLowerCase()));
    if (!targetStage) {
      return { error: `Stage not found: ${next_stage}`, available_stages: stages.map(s => s.name) };
    }
  } else {
    if (currentIndex < 0 || currentIndex >= stages.length - 1) {
      return {
        error: currentIndex >= stages.length - 1
          ? `Run "${run.title}" is already at the final stage`
          : `Cannot determine current stage position for "${run.currentStage}"`
      };
    }
    targetStage = stages[currentIndex + 1];
  }

  // Record the advancement in audit log
  audit(agentName, 'advance_workflow_stage', 'workflowRun', run_id, {
    from_stage: run.currentStage,
    to_stage: targetStage.name,
    justification
  });

  return {
    success: true,
    run_id,
    run_title: run.title,
    advanced_from: run.currentStage,
    advanced_to: targetStage.name,
    justification,
    stage_details: targetStage,
    next_deliverables: targetStage.deliverables || [],
    message: `✓ Workflow run "${run.title}" advanced from "${run.currentStage}" to "${targetStage.name}". Note: update the run's currentStage field in the program interface to reflect this change.`
  };
}

function generateReportSection({ section_type, period, audience }, agentName) {
  const kpis = getAllEntities('kpi');
  const actions = getAllEntities('action');
  const risks = getAllEntities('risk');
  const workflowRuns = getAllEntities('workflowRun');
  const learningAssets = getAllEntities('learning');
  const now = new Date();
  const reportPeriod = period || `Q${Math.ceil((now.getMonth() + 1) / 3)} FY${now.getFullYear()}`;

  let data = {};

  switch (section_type) {
    case 'metrics_performance': {
      const enriched = kpis.map(k => {
        const current = parseFloat(k.currentValue);
        const target = parseFloat(k.target);
        const pct = (!isNaN(current) && !isNaN(target) && target > 0) ? Math.round((current / target) * 100) : null;
        return { ...k, achievement_pct: pct };
      });
      data = {
        total_kpis: enriched.length,
        on_target: enriched.filter(k => k.achievement_pct >= 100).length,
        below_target: enriched.filter(k => k.achievement_pct !== null && k.achievement_pct < 100).length,
        trending_up: enriched.filter(k => k.trend === 'up').length,
        by_group: [...new Set(kpis.map(k => k.group).filter(Boolean))].map(g => ({
          group: g,
          kpis: enriched.filter(k => k.group === g).map(k => ({
            name: k.name, current: k.currentValue, target: k.target,
            achievement: k.achievement_pct, trend: k.trend, unit: k.unit
          }))
        }))
      };
      break;
    }
    case 'workflow_status': {
      const active = workflowRuns.filter(r => !['Completed', 'Cancelled'].includes(r.status));
      const completed = workflowRuns.filter(r => r.status === 'Completed');
      data = { total_runs: workflowRuns.length, active_count: active.length, completed_count: completed.length, active_runs: active };
      break;
    }
    case 'risk_actions': {
      const overdueActions = actions.filter(a => a.dueDate && new Date(a.dueDate) < now && a.status !== 'Completed');
      const criticalRisks = risks.filter(r => r.severity === 'Critical' || r.severity === 'High');
      data = {
        total_actions: actions.length,
        overdue_count: overdueActions.length,
        overdue_actions: overdueActions,
        total_risks: risks.length,
        critical_risk_count: criticalRisks.length,
        critical_risks: criticalRisks
      };
      break;
    }
    case 'learning_progress': {
      const completionSummary = queries.getCompletionSummary.all();
      data = {
        total_assets: learningAssets.length,
        required_assets: learningAssets.filter(a => a.required === true || a.required === 'Yes').length,
        completions_recorded: completionSummary.reduce((sum, r) => sum + r.completion_count, 0),
        assets_with_completions: completionSummary.length
      };
      break;
    }
    default:
      data = { note: 'Use metrics, workflow, risk/action, and learning sections to assemble full report' };
  }

  audit(agentName, 'generate_report_section', null, null, { section_type, period: reportPeriod, audience });

  return {
    section_type,
    period: reportPeriod,
    audience,
    generated_at: now.toISOString(),
    data
  };
}

function crossReferenceEntities({ entity_type, entity_id }, agentName) {
  const row = queries.getEntity.get(entity_type, entity_id);
  if (!row) return { error: `Entity not found: ${entity_type}/${entity_id}` };

  const entity = JSON.parse(row.data);
  const relationships = entity.relationships || {};
  const related = {};

  // Resolve each relationship type
  for (const [relType, ids] of Object.entries(relationships)) {
    if (!Array.isArray(ids) || ids.length === 0) continue;
    const resolvedType = relType.replace(/^related-?/, '').replace(/-?s$/, '');
    related[relType] = ids.map(id => {
      const relRow = queries.getEntity.get(resolvedType, id) ||
                     queries.getEntity.get(relType.includes('doc') ? 'document' : resolvedType, id);
      return relRow ? { id, data: JSON.parse(relRow.data) } : { id, data: null };
    });
  }

  audit(agentName, 'cross_reference_entities', entity_type, entity_id, {});

  return { entity_type, entity_id, entity, related_count: Object.keys(related).length, relationships: related };
}
