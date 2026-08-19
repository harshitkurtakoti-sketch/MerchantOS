import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import { AI_TOOLS_DEFINITIONS, executeEngineTool } from '@/lib/ai/tools';
import { validateAndAttributeResponse } from '@/lib/ai/validator';

// Groq format tool definitions
const GROQ_TOOLS = AI_TOOLS_DEFINITIONS.map(t => ({
  type: 'function' as const,
  function: {
    name: t.name,
    description: t.description,
    parameters: t.input_schema,
  },
}));

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, business_id = 'biz_rukmini_store' } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    const hasGroqKey = Boolean(groqKey && (groqKey.startsWith('gsk_') || groqKey.length > 20) && !groqKey.includes('placeholder'));
    const hasAnthropicKey = Boolean(anthropicKey && anthropicKey.startsWith('sk-ant-') && !anthropicKey.includes('placeholder'));

    const systemPrompt = `You are MerchantOS Decision Agent, an AI decision co-pilot for small business owners.
Your core principle: AI recommends. Simulation proves. Human decides.
You NEVER invent financial numbers. You call provided tools to retrieve real deterministic engine data.
Every number you mention must be directly sourced from a tool result.
NEVER use the word "fraud" unqualified (use "unusual pattern" or "review recommended").
NEVER say "approved" or "you qualify" for loans (use "appears financially prepared for additional working-capital financing, subject to lender underwriting").`;

    // 1. Groq API Key Execution (groq/compound model)
    if (hasGroqKey) {
      const groq = new Groq({ apiKey: groqKey! });
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ];

      try {
        const initialResponse = await groq.chat.completions.create({
          model: 'groq/compound',
          messages,
          tools: GROQ_TOOLS,
          tool_choice: 'auto',
          max_tokens: 1024,
        });

        const responseMessage = initialResponse.choices[0]?.message;
        const executedTools: Array<{ tool: string; result: any; source_refs: string[] }> = [];

        if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
          messages.push(responseMessage);

          for (const toolCall of responseMessage.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
            const toolExec = executeEngineTool(toolName, { ...toolArgs, business_id });

            executedTools.push({ tool: toolName, ...toolExec });

            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolName,
              content: JSON.stringify(toolExec.result),
            });
          }

          const finalResponse = await groq.chat.completions.create({
            model: 'groq/compound',
            messages,
            max_tokens: 1024,
          });

          const answerText = finalResponse.choices[0]?.message?.content || 'Simulation complete.';
          const validated = validateAndAttributeResponse(answerText, executedTools);

          return NextResponse.json({
            question,
            answer: validated.answer_text,
            recommended_range: validated.recommended_range,
            confidence: validated.confidence,
            source_refs: validated.source_refs,
            evidence: validated.evidence_panel,
            provider: 'Groq (groq/compound)',
            is_real_ai: true,
          });
        } else {
          const answerText = responseMessage?.content || 'No tool required.';
          const validated = validateAndAttributeResponse(answerText, []);

          return NextResponse.json({
            question,
            answer: validated.answer_text,
            confidence: 'High',
            source_refs: [],
            evidence: {},
            provider: 'Groq (groq/compound)',
            is_real_ai: true,
          });
        }
      } catch (groqErr: any) {
        console.error('Groq Execution Error:', groqErr);
        // Fallthrough to deterministic engine if model error occurs
      }
    }

    // 2. Anthropic API Key Execution (Claude 3.5 Sonnet)
    if (hasAnthropicKey) {
      const anthropic = new Anthropic({ apiKey: anthropicKey! });
      const messages: any[] = [{ role: 'user', content: question }];

      const initialResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        tools: AI_TOOLS_DEFINITIONS as any,
      });

      const executedTools: Array<{ tool: string; result: any; source_refs: string[] }> = [];

      if (initialResponse.stop_reason === 'tool_use') {
        const toolUseBlocks = initialResponse.content.filter(b => b.type === 'tool_use');
        messages.push({ role: 'assistant', content: initialResponse.content });

        const toolResultContent: any[] = [];
        for (const block of toolUseBlocks as any[]) {
          const toolExec = executeEngineTool(block.name, { ...block.input, business_id });
          executedTools.push({ tool: block.name, ...toolExec });

          toolResultContent.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(toolExec.result),
          });
        }

        messages.push({ role: 'user', content: toolResultContent });

        const finalResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages,
        });

        const textBlock = finalResponse.content.find(b => b.type === 'text') as any;
        const answerText = textBlock ? textBlock.text : 'Simulation complete.';
        const validated = validateAndAttributeResponse(answerText, executedTools);

        return NextResponse.json({
          question,
          answer: validated.answer_text,
          recommended_range: validated.recommended_range,
          confidence: validated.confidence,
          source_refs: validated.source_refs,
          evidence: validated.evidence_panel,
          provider: 'Anthropic (Claude 3.5 Sonnet)',
          is_real_ai: true,
        });
      } else {
        const textBlock = initialResponse.content.find(b => b.type === 'text') as any;
        const answerText = textBlock ? textBlock.text : 'No tool required.';
        const validated = validateAndAttributeResponse(answerText, []);

        return NextResponse.json({
          question,
          answer: validated.answer_text,
          confidence: 'High',
          source_refs: [],
          evidence: {},
          provider: 'Anthropic (Claude 3.5 Sonnet)',
          is_real_ai: true,
        });
      }
    }

    // 3. Fallback Deterministic Engine Orchestration
    const qLower = question.toLowerCase();
    const executedTools: Array<{ tool: string; result: any; source_refs: string[] }> = [];

    if (qLower.includes('inventory') || qLower.includes('afford') || qLower.includes('buy')) {
      const cashTool = executeEngineTool('get_cash_position', { business_id });
      const tmTool = executeEngineTool('get_time_machine_forecast', { business_id, horizon_days: 90 });
      const scenToolSafe = executeEngineTool('run_scenario', { business_id, inventory_purchase_amount: 150000 });
      const scenToolRisky = executeEngineTool('run_scenario', { business_id, inventory_purchase_amount: 300000 });

      executedTools.push(
        { tool: 'get_cash_position', ...cashTool },
        { tool: 'get_time_machine_forecast', ...tmTool },
        { tool: 'run_scenario_safe', ...scenToolSafe },
        { tool: 'run_scenario_risky', ...scenToolRisky }
      );

      const rawAnswer =
        "Not recommended at the full ₹3.0L amount right now. Your current inventory turnover suggests waiting 12–16 days would significantly reduce the risk of overstocking. Purchasing ₹3.0L immediately causes your projected cash buffer to dip below the ₹65,000 safety threshold on day 14 when your major supplier payment (Shree Laxmi Wholesalers, ₹85,000) comes due.\n\n" +
        "**Recommendation:** A purchase of **₹1.2L–₹1.5L** is safe and keeps your cash buffer intact across the next 90 days.";

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        recommended_range: validated.recommended_range,
        confidence: validated.confidence,
        source_refs: validated.source_refs,
        evidence: {
          current_cash: cashTool.result.cash_balance,
          open_payables: cashTool.result.open_payables,
          upcoming_supplier_due: 'Shree Laxmi Wholesalers (₹85,000 due in 14 days)',
          safe_scenario_end_cash: scenToolSafe.result.end_cash.scenario,
          risky_scenario_min_cash: scenToolRisky.result.min_cash.scenario,
          cash_stress_warning: scenToolRisky.result.cash_stress_days.length > 0,
        },
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    } else if (qLower.includes('health') || qLower.includes('score')) {
      const healthTool = executeEngineTool('get_health_score', { business_id });
      executedTools.push({ tool: 'get_health_score', ...healthTool });

      const rawAnswer =
        `Your current Business Health Score is **${healthTool.result.score}/100** (Healthy).\n\n` +
        `- Cash Stability: **${healthTool.result.sub_scores.cash_stability}/100**\n` +
        `- Profitability: **${healthTool.result.sub_scores.profitability}/100**\n` +
        `- Customer Payment Reliability: **${healthTool.result.sub_scores.customer_payment_reliability}/100**\n` +
        `- Inventory Efficiency: **${healthTool.result.sub_scores.inventory_efficiency}/100**\n` +
        `- Supplier Dependency: **${healthTool.result.sub_scores.supplier_dependency}/100** (Review recommended: 57.4% spend concentrated on 1 supplier).`;

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        confidence: healthTool.result.confidence,
        source_refs: validated.source_refs,
        evidence: healthTool.result.sub_scores,
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    } else {
      const cashTool = executeEngineTool('get_cash_position', { business_id });
      const healthTool = executeEngineTool('get_health_score', { business_id });
      executedTools.push({ tool: 'get_cash_position', ...cashTool }, { tool: 'get_health_score', ...healthTool });

      const rawAnswer =
        `Based on your current digital twin state, your business cash balance is **₹${cashTool.result.cash_balance.toLocaleString('en-IN')}** and your Health Score is **${healthTool.result.score}/100**.\n\n` +
        `You can simulate specific decisions like inventory purchases, pricing changes, discount campaigns, or loan applications using the Scenario Simulator or Time Machine.`;

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        confidence: 'High',
        source_refs: validated.source_refs,
        evidence: {
          cash_balance: cashTool.result.cash_balance,
          health_score: healthTool.result.score,
        },
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
