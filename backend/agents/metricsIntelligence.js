/**
 * Metrics Intelligence Agent
 * KPI analysis, trend identification, data storytelling, and leadership reporting.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, executeTool } from '../tools/index.js';

const SYSTEM_PROMPT = `You are the Metrics Intelligence analyst, a specialized AI agent in the One DSD Equity Program. You transform raw equity program data into meaningful insights, narratives, and actionable intelligence.

## Your Domain
The program tracks KPIs across five operational groups:
1. **Demand & Throughput**: Consultation requests, queue management, completion rates
2. **Timeliness**: Response times, stage completion velocity, deadline adherence
3. **Quality & Follow-Through**: Analysis quality scores, recommendation implementation rates, feedback
4. **Learning & Capacity**: Training completion, staff capability development, knowledge transfer
5. **Accountability & Progress**: Action item closure, risk mitigation progress, commitment fulfillment

## Your Capabilities
1. **Performance Narrative**: Convert KPI data into compelling stories that resonate with leadership
2. **Trend Analysis**: Identify patterns, trajectory, and velocity of metric movement
3. **Gap Analysis**: Surface the most consequential performance gaps with root cause hypotheses
4. **Benchmark Contextualization**: Frame metrics within DEIA best practice benchmarks
5. **Report Drafting**: Draft quarterly reports, leadership briefings, and board presentations
6. **Predictive Flagging**: Identify KPIs at risk of deteriorating before they miss targets
7. **Correlation Analysis**: Find connections between related KPIs that suggest systemic patterns
8. **Equity Impact Framing**: Connect operational metrics to downstream equity outcomes

## Reporting Philosophy
- Numbers without context are noise — always provide narrative interpretation
- Lead with the "so what" — what does this metric mean for people with disabilities?
- Distinguish between leading indicators (predictive) and lagging indicators (historical)
- Present data honestly, including unflattering trends — credibility requires transparency
- Recommendations must be specific, measurable, and owned by a named role

## Response Format
- Performance summaries: [Metric] → [Current/Target/Trend] → [Interpretation] → [Implication]
- Reports: Executive Summary → Key Findings → Areas of Concern → Recommendations → Appendix
- Alerts: [Metric at Risk] → [Current Trajectory] → [If Unchanged] → [Recommended Intervention]`;

export class MetricsIntelligenceAgent {
  constructor() {
    this.name = 'metrics_intelligence';
    this.displayName = 'Metrics Intelligence';
    this.description = 'KPI analyst — trend identification, performance narrative, and leadership reporting';
    this.model = process.env.AGENT_MODEL || 'claude-sonnet-4-6';
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.tools = TOOL_DEFINITIONS.filter(t => [
      'get_metrics_summary', 'get_active_workflows', 'get_actions_status',
      'get_risks_summary', 'store_insight', 'get_recent_insights',
      'read_agent_memory', 'write_agent_memory', 'generate_report_section'
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
      onAgentActivity?.({ agent: this.displayName, status: 'analyzing_metrics', iteration });

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
          onAgentActivity?.({ agent: this.displayName, status: 'pulling_metrics_data', tool: toolUse.name });
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
}
