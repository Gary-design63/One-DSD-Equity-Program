/**
 * Agent Registry & Orchestrator
 * Central registry for all agents. Manages initialization, routing, and inter-agent communication.
 */

import { CoordinatorAgent } from './coordinator.js';
import { PolicyNavigatorAgent } from './policyNavigator.js';
import { WorkflowArchitectAgent } from './workflowArchitect.js';
import { MetricsIntelligenceAgent } from './metricsIntelligence.js';
import { LearningCuratorAgent } from './learningCurator.js';
import { RiskActionMonitorAgent } from './riskActionMonitor.js';
import { CommunityIntelligenceAgent } from './communityIntelligence.js';

// ── Registry ─────────────────────────────────────────────────────────────────

const agents = new Map();
let coordinator;

export function initializeAgents() {
  // Instantiate all specialized agents
  const specialized = [
    new PolicyNavigatorAgent(),
    new WorkflowArchitectAgent(),
    new MetricsIntelligenceAgent(),
    new LearningCuratorAgent(),
    new RiskActionMonitorAgent(),
    new CommunityIntelligenceAgent()
  ];

  for (const agent of specialized) {
    agents.set(agent.name, agent);
  }

  // Instantiate coordinator and give it access to the agent registry
  coordinator = new CoordinatorAgent();
  coordinator.agentRegistry = agents;

  console.log(`[Agents] Initialized: ${[...agents.keys()].join(', ')}, equity_compass (coordinator)`);

  return { coordinator, agents };
}

export function getAgent(name) {
  return agents.get(name);
}

export function getCoordinator() {
  return coordinator;
}

export function getAgentManifest() {
  const manifest = [
    {
      name: coordinator?.name,
      displayName: coordinator?.displayName,
      description: coordinator?.description,
      role: 'coordinator'
    }
  ];

  for (const [, agent] of agents) {
    manifest.push({
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description,
      role: 'specialist'
    });
  }

  return manifest;
}

// ── Smart Routing ─────────────────────────────────────────────────────────────
// For requests that are clearly single-domain, route directly to the specialist.
// All other requests go through the coordinator for orchestration.

const ROUTING_PATTERNS = [
  {
    agent: 'policy_navigator',
    patterns: [/\blaw\b/i, /\bpolicy\b/i, /\bcompliance\b/i, /\bregulat/i, /\bada\b/i, /\baccessib/i, /\blegal\b/i, /\bmndhr\b/i, /\bstatut/i]
  },
  {
    agent: 'workflow_architect',
    patterns: [/\bworkflow\b/i, /\bprocess\b/i, /\bstage\b/i, /\bprocedure\b/i, /\bwf-\d/i, /\bhow to run\b/i, /\bnext step\b/i]
  },
  {
    agent: 'metrics_intelligence',
    patterns: [/\bkpi\b/i, /\bmetric\b/i, /\bperforman/i, /\bdata\b/i, /\breport\b/i, /\btrend\b/i, /\btarget\b/i, /\bquarterly\b/i]
  },
  {
    agent: 'learning_curator',
    patterns: [/\btraining\b/i, /\blearning\b/i, /\bcourse\b/i, /\beducation\b/i, /\bskill\b/i, /\bdevelopment\b/i, /\bmicrolearning\b/i]
  },
  {
    agent: 'risk_action_monitor',
    patterns: [/\brisk\b/i, /\baction item\b/i, /\boverdue\b/i, /\bescalat/i, /\bdeadline\b/i, /\baccountab/i, /\bmonitoring\b/i]
  },
  {
    agent: 'community_intelligence',
    patterns: [/\bcommunity\b/i, /\bstakeholder\b/i, /\bengagement\b/i, /\boutreach\b/i, /\bco-design\b/i, /\bfeedback\b/i, /\badvocate\b/i]
  }
];

export function suggestRoute(userMessage) {
  let scores = {};

  for (const route of ROUTING_PATTERNS) {
    const score = route.patterns.filter(p => p.test(userMessage)).length;
    if (score > 0) scores[route.agent] = score;
  }

  const topAgent = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];

  // Only direct-route if one agent clearly dominates (score >= 2, and no other agent within 1 point)
  if (topAgent) {
    const [agentName, topScore] = topAgent;
    const otherScores = Object.values(scores).filter(s => s !== topScore);
    const secondScore = otherScores.length > 0 ? Math.max(...otherScores) : 0;

    if (topScore >= 2 && topScore - secondScore >= 2) {
      return { route: 'direct', agent: agentName };
    }
  }

  return { route: 'coordinator' };
}
