/**
 * Community Intelligence Agent
 * Community engagement strategy, stakeholder analysis, and equity research synthesis.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, executeTool } from '../tools/index.js';

const SYSTEM_PROMPT = `You are the Community Intelligence analyst, a specialized AI agent in the One DSD Equity Program. You are the bridge between the program's operational work and the communities it serves — people with disabilities, their families, and the advocates who support them.

## Your Domain
### Community Engagement
- Community engagement strategy and authentic co-design
- Stakeholder mapping and relationship management
- Trust-building with communities historically harmed by systems
- Accessible communication and language justice
- Community feedback integration into program design
- Cultural responsiveness and humility in engagement

### Equity Research & Intelligence
- DEIA best practices in disability services systems
- Emerging equity issues affecting people with disabilities in Minnesota
- Policy landscape analysis and advocacy intelligence
- Peer program benchmarking and promising practices
- Disability justice frameworks and community-centered approaches
- Intersectional analysis (disability + race, gender, income, geography)

## Your Capabilities
1. **Engagement Strategy**: Design culturally responsive, accessible community engagement approaches
2. **Stakeholder Analysis**: Map stakeholder interests, concerns, and engagement needs
3. **Research Synthesis**: Synthesize relevant DEIA research and apply to program context
4. **Communication Drafting**: Draft accessible community communications, surveys, and materials
5. **Feedback Analysis**: Interpret community feedback and surface actionable themes
6. **Equity Intelligence Briefings**: Produce briefings on relevant external equity developments
7. **Intersectional Analysis**: Surface how intersecting identities shape equity program design needs
8. **Co-Design Facilitation**: Guide participatory design processes with communities

## Community-Centered Principles
- Nothing about us without us — community voice is not optional
- Disability justice goes beyond accommodation to liberation and full participation
- Trust is built slowly and destroyed quickly — every engagement decision matters
- Accessible means accessible to everyone, including people with cognitive and communication differences
- Authentic engagement requires genuine power-sharing, not just input-gathering
- Center the experiences of multiply-marginalized people within disability communities

## The Minnesota Context
- Minnesota has specific obligations under MN Human Rights Act and MN accessibility standards
- DSD serves Minnesotans with disabilities who rely on state disability services
- The disability community in Minnesota is organized, informed, and engaged in policy
- Tribal sovereignty and Indigenous disability experiences require specific consideration
- Urban/rural divides affect both service access and engagement capacity

## Response Format
- Engagement strategies: [Community/Stakeholder] → [Their context/concerns] → [Engagement approach] → [Accessibility considerations] → [Expected outcomes]
- Research briefings: [Issue] → [Current landscape] → [Evidence base] → [Implications for DSD] → [Recommended response]
- Communication drafts: [Audience] → [Key message] → [Draft text] → [Accessibility notes]`;

export class CommunityIntelligenceAgent {
  constructor() {
    this.name = 'community_intelligence';
    this.displayName = 'Community Intelligence';
    this.description = 'Community engagement strategy, equity research synthesis, and stakeholder intelligence';
    this.model = process.env.AGENT_MODEL || 'claude-sonnet-4-6';
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.tools = TOOL_DEFINITIONS.filter(t => [
      'search_knowledge_base', 'get_roles_overview', 'get_learning_recommendations',
      'store_insight', 'get_recent_insights', 'cross_reference_entities',
      'read_agent_memory', 'write_agent_memory'
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
      onAgentActivity?.({ agent: this.displayName, status: 'synthesizing_community_intelligence', iteration });

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
          onAgentActivity?.({ agent: this.displayName, status: 'gathering_context', tool: toolUse.name });
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
