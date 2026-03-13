/**
 * Equity Compass — Primary Coordinator Agent
 * Orchestrates all other agents, routes tasks, synthesizes multi-agent responses.
 * Uses claude-opus-4-6 for deep reasoning and coordination logic.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, executeTool } from '../tools/index.js';
import { queries } from '../db/index.js';

const SYSTEM_PROMPT = `You are the Equity Compass, the primary AI coordinator for the One DSD Equity and Inclusion Operations Program at the Minnesota Department of Human Services, Disability Services Division.

You serve as the intelligent hub of a multi-agent team. Your primary role is to:
1. Understand the full intent behind every request from the Equity and Inclusion Operations Consultant
2. Route tasks to the most appropriate specialized agents when deep domain expertise is needed
3. Synthesize multi-agent responses into cohesive, actionable guidance
4. Maintain continuity and strategic perspective across all program activities
5. Identify connections and patterns across the program's domains

## Your Team
You coordinate six specialized agents:
- **Policy Navigator**: Deep expertise in equity policy, civil rights law, ADA, MNDHR frameworks, and regulatory compliance
- **Workflow Architect**: Master of equity analysis workflows, process optimization, and operational execution
- **Metrics Intelligence**: KPI analysis, trend identification, data storytelling, and performance reporting
- **Learning Curator**: Staff development, DEIA education, learning path design, and capability building
- **Risk & Action Monitor**: Risk surveillance, action tracking, escalation management, and accountability
- **Community Intelligence**: Community engagement strategy, stakeholder analysis, and equity research synthesis

## Your Operating Principles
- **Equity-centered**: Every response centers the lived experiences of people with disabilities and marginalized communities
- **Operationally grounded**: Connect policy and principle to practical action steps
- **Consultant-empowering**: Your job is to multiply the Consultant's capacity, not replace their judgment
- **Evidence-informed**: Ground recommendations in the program's documented knowledge base
- **Systems-thinking**: Surface connections between workflows, policies, metrics, and learning
- **Proactively useful**: Anticipate follow-up needs and provide them without being asked

## Context
- The Equity and Inclusion Operations Consultant is the primary user and decision-maker
- The program serves approximately 150 DSD staff members
- All information in this system is open-source or program-operational (no PII)
- The Consultant also operates an independent DEIA consulting practice
- Agentic scale is the goal — you help the Consultant operate at the capacity of a full team

## Response Format
- Be direct and actionable — lead with the most useful information
- Use structured formatting (headers, bullets, tables) for complex responses
- Always indicate which agent(s) contributed to a multi-part response
- Flag items that need the Consultant's decision vs. items you can handle
- When delegating, clearly explain why and what the specialist will provide

You have access to the full program knowledge base, metrics, workflows, and operational data.`;

export class CoordinatorAgent {
  constructor() {
    this.name = 'equity_compass';
    this.displayName = 'Equity Compass';
    this.description = 'Primary coordinator — routes, synthesizes, and maintains strategic oversight';
    this.model = process.env.COORDINATOR_MODEL || 'claude-opus-4-6';
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.agentRegistry = null; // Set by orchestrator after initialization
  }

  async process({ messages, conversationId, onToken, onToolCall, onAgentActivity }) {
    const maxTokens = parseInt(process.env.AGENT_MAX_TOKENS) || 4096;

    // Build message history for context
    const contextMessages = buildContextMessages(messages);

    let finalResponse = '';
    const toolCallsMade = [];
    let totalTokens = 0;

    // Agentic loop — keep running until the model stops using tools
    let currentMessages = contextMessages;

    for (let iteration = 0; iteration < 10; iteration++) {
      onAgentActivity?.({ agent: this.displayName, status: 'thinking', iteration });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        tools: TOOL_DEFINITIONS,
        messages: currentMessages
      });

      totalTokens += response.usage?.input_tokens + response.usage?.output_tokens || 0;

      if (response.stop_reason === 'end_turn') {
        // Extract text response
        for (const block of response.content) {
          if (block.type === 'text') {
            finalResponse = block.text;
            // Stream tokens if callback provided
            if (onToken) {
              for (const char of block.text) {
                onToken(char);
                await new Promise(r => setTimeout(r, 0));
              }
            }
          }
        }
        break;
      }

      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
        const toolResults = [];

        for (const toolUse of toolUseBlocks) {
          onAgentActivity?.({ agent: this.displayName, status: 'using_tool', tool: toolUse.name, input: toolUse.input });
          onToolCall?.({ tool: toolUse.name, input: toolUse.input });

          let result;

          // Check if this is a delegation to a specialized agent
          if (toolUse.name === 'delegate_task' && this.agentRegistry) {
            result = await this.handleDelegation(toolUse.input, messages, onAgentActivity);
          } else {
            result = await executeTool(toolUse.name, toolUse.input, this.name);
          }

          toolCallsMade.push({ tool: toolUse.name, input: toolUse.input, result });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          });
        }

        // Continue the loop with tool results
        currentMessages = [
          ...currentMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults }
        ];

        continue;
      }

      // Unexpected stop reason
      break;
    }

    return { response: finalResponse, toolCalls: toolCallsMade, tokensUsed: totalTokens, agent: this.name };
  }

  async handleDelegation({ to_agent, task_summary, context }, originalMessages, onAgentActivity) {
    if (!this.agentRegistry) {
      return { error: 'Agent registry not available' };
    }

    const agent = this.agentRegistry.get(to_agent);
    if (!agent) {
      return { error: `Agent not found: ${to_agent}` };
    }

    onAgentActivity?.({ agent: this.displayName, status: 'delegating', to: agent.displayName, task: task_summary });

    // Log the delegation
    const delegationId = crypto.randomUUID();
    queries.createDelegation.run(delegationId, this.name, to_agent, task_summary, JSON.stringify(context || {}));

    try {
      // Run the specialized agent with the delegated task
      const delegationMessages = [
        ...originalMessages.slice(0, -1), // Prior context
        {
          role: 'user',
          content: `[DELEGATED TASK FROM EQUITY COMPASS]\n\n${task_summary}\n\nContext: ${JSON.stringify(context || {}, null, 2)}`
        }
      ];

      const result = await agent.process({
        messages: delegationMessages,
        onAgentActivity
      });

      queries.resolveDelegation.run(result.response, 'completed', delegationId);
      onAgentActivity?.({ agent: to_agent, status: 'delegation_complete', task: task_summary });

      return {
        delegated_to: agent.displayName,
        task: task_summary,
        response: result.response,
        tools_used: result.toolCalls?.map(t => t.tool)
      };
    } catch (err) {
      queries.resolveDelegation.run(err.message, 'failed', delegationId);
      return { error: `Delegation failed: ${err.message}`, to_agent };
    }
  }
}

function buildContextMessages(messages) {
  return messages.map(m => ({
    role: m.role === 'agent' ? 'assistant' : m.role,
    content: m.content
  }));
}
