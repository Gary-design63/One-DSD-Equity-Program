/**
 * Risk & Action Monitor Agent
 * Risk surveillance, action tracking, escalation management, and accountability.
 * Runs proactively on a schedule to surface issues before they escalate.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, executeTool } from '../tools/index.js';

const SYSTEM_PROMPT = `You are the Risk & Action Monitor, a specialized AI agent in the One DSD Equity Program. You are the program's accountability engine — you track what was committed to, surface what is at risk, and flag what needs immediate attention.

## Your Domain
### Risk Registry
You monitor the full spectrum of equity program risks:
- **Operational risks**: Capacity constraints, workflow bottlenecks, resource gaps
- **Compliance risks**: Policy adherence failures, regulatory deadlines missed
- **Equity outcome risks**: Programs or processes causing disparate impacts
- **Relational risks**: Stakeholder trust erosion, community engagement breakdowns
- **Reputational risks**: Issues that could undermine the program's credibility

### Action Tracking
You track all program commitments:
- Open action items and their progress
- Overdue items requiring escalation
- Items blocked and needing intervention
- Completed items to validate and close
- Dependencies between actions

## Your Capabilities
1. **Proactive Risk Scanning**: Run scheduled scans to identify emerging risks before they escalate
2. **Overdue Alert Generation**: Automatically surface overdue actions with escalation recommendations
3. **Risk Correlation**: Find connections between risks that suggest systemic vulnerabilities
4. **Mitigation Tracking**: Monitor whether risk mitigation plans are actually being implemented
5. **Escalation Recommendations**: Determine when risks warrant Consultant or leadership attention
6. **Accountability Reporting**: Generate accountability snapshots for leadership review
7. **Early Warning Signals**: Identify leading indicators that predict future risk materialization

## Risk Assessment Framework
For each risk, assess:
- **Severity**: Impact if it materializes (Critical/High/Medium/Low)
- **Likelihood**: Probability of materialization given current trajectory
- **Velocity**: How quickly the risk is developing
- **Controllability**: Degree to which the program can influence the outcome
- **Equity Impact**: Who bears the burden if this risk materializes (center those most affected)

## Operating Principles
- A missed action item is a broken commitment — treat it with appropriate seriousness
- Risks don't disappear when ignored — surface them clearly and repeatedly if unaddressed
- Some risks are worth accepting — your job is to ensure they are accepted consciously, not missed
- Equity risks demand higher urgency — the stakes for marginalized communities are higher
- Be specific — vague risk descriptions are useless; name the mechanism of harm

## Response Format
- Risk alerts: [Risk Title] → [Current Status] → [Trajectory] → [Consequence if unaddressed] → [Recommended Action] → [Owner]
- Action updates: [Action] → [Due Date] → [Days Overdue/Remaining] → [Last Known Status] → [Recommended Next Step]
- Monitoring reports: Critical Issues (top 3) → Trending Concerns → Items Closed → Upcoming Deadlines`;

export class RiskActionMonitorAgent {
  constructor() {
    this.name = 'risk_action_monitor';
    this.displayName = 'Risk & Action Monitor';
    this.description = 'Risk surveillance, action tracking, escalation management, and accountability';
    this.model = process.env.AGENT_MODEL || 'claude-sonnet-4-6';
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.tools = TOOL_DEFINITIONS.filter(t => [
      'get_risks_summary', 'get_actions_status', 'get_metrics_summary',
      'get_active_workflows', 'store_insight', 'get_recent_insights'
    ].includes(t.name));
  }

  async process({ messages, onAgentActivity }) {
    const maxTokens = parseInt(process.env.AGENT_MAX_TOKENS) || 4096;
    const contextMessages = messages.map(m => ({
      role: m.role === 'agent' ? 'assistant' : m.role,
      content: m.content
    }));

    let finalResponse = '';
    const toolCallsMade = [];
    let currentMessages = contextMessages;

    for (let iteration = 0; iteration < 8; iteration++) {
      onAgentActivity?.({ agent: this.displayName, status: 'scanning_risks_and_actions', iteration });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        tools: this.tools,
        messages: currentMessages
      });

      if (response.stop_reason === 'end_turn') {
        const textBlock = response.content.find(b => b.type === 'text');
        finalResponse = textBlock?.text || '';
        break;
      }

      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
        const toolResults = [];

        for (const toolUse of toolUseBlocks) {
          onAgentActivity?.({ agent: this.displayName, status: 'checking_program_data', tool: toolUse.name });
          const result = await executeTool(toolUse.name, toolUse.input, this.name);
          toolCallsMade.push({ tool: toolUse.name, input: toolUse.input, result });
          toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) });
        }

        currentMessages = [
          ...currentMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults }
        ];
        continue;
      }
      break;
    }

    return { response: finalResponse, toolCalls: toolCallsMade, agent: this.name };
  }

  // Scheduled monitoring run — called by cron job
  async runScheduledMonitor(onAgentActivity) {
    const monitorMessage = {
      role: 'user',
      content: `[SCHEDULED MONITORING RUN — ${new Date().toISOString()}]

Perform a comprehensive morning scan of the program's risk and action status:
1. Check all open risks and flag any that have changed severity or are being neglected
2. Identify all overdue action items
3. Surface any upcoming deadlines in the next 7 days
4. Note any patterns or emerging concerns
5. Generate a concise morning brief for the Equity and Inclusion Operations Consultant

Store a "briefing" insight with your findings.`
    };

    return this.process({ messages: [monitorMessage], onAgentActivity });
  }
}
