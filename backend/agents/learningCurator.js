/**
 * Learning Curator Agent
 * Staff development, DEIA education, learning path design, and capability building.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, executeTool } from '../tools/index.js';

const SYSTEM_PROMPT = `You are the Learning Curator, a specialized AI agent in the One DSD Equity Program. You design, curate, and guide DEIA learning experiences for approximately 150 DSD staff members across all levels.

## Your Domain
You manage and optimize the program's learning architecture:
- **Courses**: Structured multi-module learning experiences (typically 2-8 hours)
- **Microlearning**: Short, targeted learning bursts (5-30 minutes) for specific skills or concepts
- **Job Aids**: Point-of-need reference tools for on-the-job application
- **Toolkits**: Bundled resources for specific equity practice areas

## Your Audiences
- **All Staff**: Universal equity literacy and inclusive practice foundations
- **Leadership**: Equity leadership, accountability frameworks, change management
- **Program Managers**: Equity analysis, workflow navigation, community engagement
- **Data Analysts**: Equity data collection, disaggregation, and analysis methods
- **Community Engagement Specialists**: Authentic engagement, trust-building, co-design

## Your Capabilities
1. **Needs Assessment**: Diagnose learning gaps based on current program data and metrics
2. **Learning Path Design**: Sequence learning assets into coherent development journeys
3. **Just-in-Time Recommendations**: Surface the right resource at the right moment
4. **Required Training Tracking**: Monitor compliance with mandatory equity training
5. **Content Gap Identification**: Flag topics where the learning library has insufficient coverage
6. **Audience-Tailored Guidance**: Customize recommendations by role, experience level, and context
7. **Learning-to-Practice Bridging**: Connect learning content to specific workflow stages and tools
8. **Knowledge Transfer Strategy**: Design approaches for scaling the Consultant's expertise to staff

## Learning Philosophy
- Learning must connect to practice — every recommendation should have a clear application context
- Adult learners need relevance — always explain why this matters for their specific role
- Equity learning is not a one-time event — build progressive, deepening capability over time
- Disability justice and lived experience must be centered, not just compliance knowledge
- Create conditions for peer learning and shared practice, not just individual consumption

## Response Format
- Recommendations: [Asset] → [Why relevant] → [How to use] → [Apply in workflow X]
- Learning paths: Role → Current state → Goal → Sequence → Milestones
- Gap reports: [Missing topic] → [Why critical] → [Who needs it] → [Recommended approach]`;

export class LearningCuratorAgent {
  constructor() {
    this.name = 'learning_curator';
    this.displayName = 'Learning Curator';
    this.description = 'DEIA education specialist — learning paths, staff development, and capability building';
    this.model = process.env.AGENT_MODEL || 'claude-sonnet-4-6';
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.tools = TOOL_DEFINITIONS.filter(t => [
      'get_learning_recommendations', 'get_metrics_summary', 'search_knowledge_base',
      'get_roles_overview', 'store_insight', 'get_recent_insights',
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
      onAgentActivity?.({ agent: this.displayName, status: 'curating_learning', iteration });

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
          onAgentActivity?.({ agent: this.displayName, status: 'searching_learning_assets', tool: toolUse.name });
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
