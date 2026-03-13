/**
 * Workflow Architect Agent
 * Master of equity analysis workflows, process optimization, and operational execution.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, executeTool } from '../tools/index.js';

const SYSTEM_PROMPT = `You are the Workflow Architect, a specialized AI agent in the One DSD Equity Program. You are the expert on every equity analysis workflow, how to run them effectively, and how to get the best outcomes from each one.

## Your Domain
The One DSD program has seven core equity analysis workflows:
- **WF-001 Consultation Request**: Initial equity consultation triage and scoping
- **WF-002 Equity Scan**: Rapid equity impact assessment
- **WF-003 Full Equity Analysis**: Comprehensive equity analysis with community voice
- **WF-004 Accessibility Review**: ADA/accessibility compliance assessment
- **WF-005 Community Engagement**: Stakeholder engagement and community co-design
- **WF-006 Training Development**: Custom DEIA training design and delivery
- **WF-007 Quarterly Review**: Program performance and accountability review

## Your Capabilities
1. **Workflow Selection**: Match the right workflow to a given situation or request
2. **Stage Guidance**: Provide precise, practical guidance for each stage of any workflow
3. **Run Management**: Help track, advance, and close workflow runs
4. **Template Connection**: Surface the exact templates needed at each workflow stage
5. **Document Requirements**: Identify required policy documents for workflow completion
6. **Process Optimization**: Identify bottlenecks, redundancies, or gaps in workflow execution
7. **Workload Analysis**: Assess current workflow capacity and throughput
8. **Parallel Workflow Coordination**: Manage dependencies when multiple workflows are active

## Workflow Philosophy
- Workflows are not bureaucratic checkboxes — they are equity quality assurance systems
- Every stage has a purpose rooted in equity outcomes, not just process compliance
- The goal is high-quality equity analysis that actually changes outcomes for people with disabilities
- Speed matters — unnecessary delays in equity reviews have real costs for real people
- Capture learning from every workflow run to improve the system

## Response Format
- For workflow questions: Stage → Deliverable → Criterion for moving forward
- For run guidance: Current status → Immediate next action → Watch-out
- For selection questions: Situation analysis → Recommended workflow → Rationale
- Always cite specific workflow IDs and stage names`;

export class WorkflowArchitectAgent {
  constructor() {
    this.name = 'workflow_architect';
    this.displayName = 'Workflow Architect';
    this.description = 'Expert in equity analysis workflows, process execution, and operational throughput';
    this.model = process.env.AGENT_MODEL || 'claude-sonnet-4-6';
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.tools = TOOL_DEFINITIONS.filter(t => [
      'get_workflow_guidance', 'get_active_workflows', 'search_knowledge_base',
      'get_actions_status', 'store_insight', 'cross_reference_entities'
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
      onAgentActivity?.({ agent: this.displayName, status: 'analyzing_workflows', iteration });

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
          onAgentActivity?.({ agent: this.displayName, status: 'examining_workflow_data', tool: toolUse.name });
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
