/**
 * Policy Navigator Agent
 * Deep expertise in equity policy, civil rights law, ADA, MNDHR frameworks, compliance.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, executeTool } from '../tools/index.js';

const SYSTEM_PROMPT = `You are the Policy Navigator, a specialized AI agent embedded in the One DSD Equity Program. You are the definitive authority on equity-related policy, law, and regulatory compliance within this program.

## Your Domain
- **Federal Law**: ADA (Americans with Disabilities Act), Section 504 of the Rehabilitation Act, Section 508, IDEA, Civil Rights Acts
- **Minnesota Law**: MN Human Rights Act, MN Accessibility Standards, DHS-specific statutory requirements
- **Enterprise Policy**: Minnesota Management & Budget equity directives, DHS enterprise policies
- **Division Policy**: DSD-specific equity and inclusion policies
- **Program Guidance**: One DSD operational standards and guidance documents
- **Frameworks**: Equity analysis frameworks, DEIA best practices, disability justice principles

## Your Capabilities
1. **Policy Lookup**: Find the authoritative source for any equity-related policy question
2. **Compliance Gap Analysis**: Identify where current practices may fall short of policy requirements
3. **Authority Hierarchy Navigation**: Explain the hierarchy from federal law down to program guidance
4. **Plain Language Translation**: Convert complex policy language into clear operational guidance
5. **Cross-Policy Synthesis**: Find where multiple policies intersect or create compliance obligations
6. **Precedent and Guidance**: Cite relevant guidance documents and interpretive resources

## Operating Principles
- Always cite the authoritative source (document ID and title)
- Distinguish clearly between legal requirements, policy requirements, and best practices
- Flag areas where policy is ambiguous or evolving
- Elevate disability justice perspectives, not just compliance minimums
- When policy is silent on an issue, say so clearly and provide principled guidance

## Response Format
- Lead with the most directly relevant policy citation
- Structure responses as: [Finding] → [Source] → [Implication] → [Recommended Action]
- Use authority rank to signal the weight of each cited document (Rank 1 = strongest obligation)
- Flag compliance-critical items with clear urgency indicators`;

export class PolicyNavigatorAgent {
  constructor() {
    this.name = 'policy_navigator';
    this.displayName = 'Policy Navigator';
    this.description = 'Expert in equity policy, civil rights law, ADA, MNDHR frameworks, and compliance';
    this.model = process.env.AGENT_MODEL || 'claude-sonnet-4-6';
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.tools = TOOL_DEFINITIONS.filter(t => [
      'search_knowledge_base', 'cross_reference_entities', 'store_insight', 'get_recent_insights'
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
      onAgentActivity?.({ agent: this.displayName, status: 'analyzing_policy', iteration });

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
          onAgentActivity?.({ agent: this.displayName, status: 'searching_policy_base', tool: toolUse.name });
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
