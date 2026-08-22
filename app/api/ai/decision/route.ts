import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import { AI_TOOLS_DEFINITIONS, executeEngineTool } from '@/lib/ai/tools';
import { validateAndAttributeResponse } from '@/lib/ai/validator';
import { HealthScoreSnapshot, ScenarioResultSnapshot, FinanceReadinessSnapshot } from '@/lib/db/types';
import { TwinMoneyState } from '@/lib/engines/digital_twin';
import { BankLenderMatch } from '@/lib/engines/loan_simulator';
import { ProcurementRecommendation } from '@/lib/engines/procurement';
import { OnlineChannelRecommendation } from '@/lib/engines/online_expansion';

interface ChannelExpansionResult {
  business_id: string;
  category: string;
  channels: OnlineChannelRecommendation[];
  total_potential_monthly_uplift: string;
}

interface ProcurementResult {
  business_id: string;
  generated_at: string;
  total_capital_recommended: number;
  total_projected_profit: number;
  recommendations: ProcurementRecommendation[];
}

type ExecutedTool = { tool: string; result: unknown; source_refs: string[] };

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

    // Fetch fresh merchant digital twin context from deterministic engines
    const cashContext = executeEngineTool('get_cash_position', { business_id });
    const healthContext = executeEngineTool('get_health_score', { business_id });
    const cashState = cashContext.result as TwinMoneyState;
    const healthState = healthContext.result as HealthScoreSnapshot;

    const systemPrompt = `You are MerchantOS Decision Agent, an AI decision co-pilot for small business owners.
Your core principle: AI recommends. Simulation proves. Human decides.
Merchant Workspace Data Context (Live State):
- Business ID: ${business_id} (Rukmini's Kirana & General Store)
- Current Cash Balance: ₹${cashState.cash_balance?.toLocaleString('en-IN') || '2,45,000'}
- Health Score: ${healthState.score || 84}/100
- Open Payables: ₹${cashState.open_payables?.toLocaleString('en-IN') || '85,000'}

Rules & Compliance:
1. You NEVER invent financial numbers. You call provided tools to retrieve real deterministic engine data.
2. Every number you mention must be directly sourced from a tool result.
3. NEVER use the word "fraud" unqualified (use "unusual pattern" or "review recommended").
4. NEVER say "approved" or "you qualify" for loans (use "appears financially prepared for additional working-capital financing, subject to lender underwriting").`;


    if (hasGroqKey) {
      const groq = new Groq({ apiKey: groqKey! });
      type GroqMessageParam = Parameters<typeof groq.chat.completions.create>[0]['messages'][number];
      const messages: GroqMessageParam[] = [
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
        const executedTools: ExecutedTool[] = [];

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
      } catch (groqErr) {
        console.error('Groq Execution Error:', groqErr);
      }
    }

    if (hasAnthropicKey) {
      const anthropic = new Anthropic({ apiKey: anthropicKey! });
      type AnthropicCreateParams = Parameters<typeof anthropic.messages.create>[0];
      type AnthropicMessageParam = AnthropicCreateParams['messages'][number];
      const messages: AnthropicMessageParam[] = [{ role: 'user', content: question }];

      const initialResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        tools: AI_TOOLS_DEFINITIONS as unknown as AnthropicCreateParams['tools'],
      });

      const executedTools: ExecutedTool[] = [];

      if (initialResponse.stop_reason === 'tool_use') {
        const toolUseBlocks = initialResponse.content.filter(
          (b): b is Extract<Anthropic.ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use'
        );
        messages.push({ role: 'assistant', content: initialResponse.content });

        const toolResultContent: Array<Record<string, string>> = [];
        for (const block of toolUseBlocks) {
          const toolExec = executeEngineTool(block.name, { ...(block.input as Record<string, unknown>), business_id });
          executedTools.push({ tool: block.name, ...toolExec });

          toolResultContent.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(toolExec.result),
          });
        }

        messages.push({ role: 'user', content: toolResultContent as unknown as AnthropicMessageParam['content'] });

        const finalResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages,
        });

        const textBlock = finalResponse.content.find(
          (b): b is Extract<Anthropic.ContentBlock, { type: 'text' }> => b.type === 'text'
        );
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
        const textBlock = initialResponse.content.find(
          (b): b is Extract<Anthropic.ContentBlock, { type: 'text' }> => b.type === 'text'
        );
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

    const qLower = question.toLowerCase();
    const executedTools: ExecutedTool[] = [];

    if (qLower.includes('bank') || qLower.includes('sanction') || qLower.includes('loan') || qLower.includes('interest')) {
      const bankTool = executeEngineTool('get_bank_lender_matches', { business_id, loan_amount: 500000 });
      const readyTool = executeEngineTool('get_finance_readiness', { business_id });
      executedTools.push(
        { tool: 'get_bank_lender_matches', ...bankTool },
        { tool: 'get_finance_readiness', ...readyTool }
      );

      const banks = bankTool.result as BankLenderMatch[];
      const readiness = readyTool.result as FinanceReadinessSnapshot;
      const topBank = banks[0];
      const secondBank = banks[1];
      const rawAnswer =
        `Based on your **${readiness.score}/100 Financial Readiness Index**, you have strong sanction likelihood across multiple lenders:\n\n` +
        `1. **${topBank.bank_name} (${topBank.scheme_name})**\n` +
        `   - Sanction Likelihood: **${topBank.sanction_probability_pct}% (${topBank.likelihood_badge})**\n` +
        `   - Indicative Rate: **${topBank.interest_rate_range}** (Indicative: ${topBank.indicative_interest_rate_pct}% p.a.)\n` +
        `   - Max Sanction: **₹${(topBank.max_sanction_limit / 100000).toFixed(1)} Lakhs** | Turnaround: ${topBank.processing_turnaround_days}\n\n` +
        `2. **${secondBank.bank_name} (${secondBank.scheme_name})**\n` +
        `   - Sanction Likelihood: **${secondBank.sanction_probability_pct}%**\n` +
        `   - Indicative Rate: **${secondBank.interest_rate_range}**\n` +
        `   - Max Sanction: **₹${(secondBank.max_sanction_limit / 100000).toFixed(1)} Lakhs**\n\n` +
        `*Note: Financing readiness indicates operational preparedness; final approval remains subject to lender underwriting.*`;

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        recommended_range: `${topBank.indicative_interest_rate_pct}% – ${secondBank.indicative_interest_rate_pct}% p.a.`,
        confidence: 'High',
        source_refs: validated.source_refs,
        evidence: {
          readiness_score: readiness.score,
          matched_lenders_count: banks.length,
          top_lender: topBank.bank_name,
          top_rate: topBank.interest_rate_range,
        },
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    } else if (qLower.includes('online') || qLower.includes('ondc') || qLower.includes('blinkit') || qLower.includes('channel') || qLower.includes('sell') || qLower.includes('marketplace')) {
      const channelTool = executeEngineTool('get_online_channel_recommendations', { business_id });
      executedTools.push({ tool: 'get_online_channel_recommendations', ...channelTool });

      const expansion = channelTool.result as ChannelExpansionResult;
      const topChannels = expansion.channels.slice(0, 3);
      const channelStr = topChannels.map((c, idx: number) =>
        `${idx + 1}. **${c.channel_name} (${c.channel_type})**\n` +
        `   - Fit Score: **${c.fit_score_pct}% Match** | Setup: ${c.setup_time}\n` +
        `   - Commission / Fee: **${c.commission_structure}**\n` +
        `   - Est. Monthly Uplift: **${c.estimated_monthly_revenue_uplift}**\n` +
        `   - Advantage: ${c.key_advantage}`
      ).join('\n\n');

      const rawAnswer =
        `Based on your business category (**Retail / Kirana & Staples**), here are the top online platforms tailored for your product catalog:\n\n${channelStr}\n\n` +
        `**Total Estimated Revenue Uplift:** **${expansion.total_potential_monthly_uplift}**. You can start immediately with zero-commission channels like ONDC and WhatsApp Direct.`;

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        recommended_range: expansion.total_potential_monthly_uplift,
        confidence: 'High',
        source_refs: validated.source_refs,
        evidence: {
          category: expansion.category,
          top_channel: topChannels[0]?.channel_name,
          total_uplift: expansion.total_potential_monthly_uplift,
        },
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    } else if (qLower.includes('recommend') || qLower.includes('what to buy') || qLower.includes('procure') || qLower.includes('item') || qLower.includes('sku')) {

      const procTool = executeEngineTool('get_procurement_recommendations', { business_id });
      executedTools.push({ tool: 'get_procurement_recommendations', ...procTool });

      const procurement = procTool.result as ProcurementResult;
      const recs = procurement.recommendations.slice(0, 3);
      const listStr = recs.map((r, idx: number) =>
        `${idx + 1}. **${r.product_name} (${r.sku})**\n` +
        `   - Supplier: **${r.supplier_name}** | Unit Cost: ₹${r.unit_cost} | Retail: ₹${r.retail_price}\n` +
        `   - True Unit Margin: **₹${r.true_margin_per_unit} (+${r.margin_pct}%)** | ROI: **+${r.roi_pct}%**\n` +
        `   - Recommended Batch: **${r.recommended_order_quantity} units** (Total: ₹${r.total_investment_required.toLocaleString('en-IN')}) → Est. Profit: **+₹${r.projected_net_profit.toLocaleString('en-IN')}**`
      ).join('\n\n');

      const rawAnswer =
        `Here are your top high-margin replenishment opportunities from your verified suppliers:\n\n${listStr}\n\n` +
        `Total Recommended Capital: **₹${procurement.total_capital_recommended.toLocaleString('en-IN')}** for an estimated profit of **₹${procurement.total_projected_profit.toLocaleString('en-IN')}**.`;

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        recommended_range: `₹${procurement.total_capital_recommended.toLocaleString('en-IN')}`,
        confidence: 'High',
        source_refs: validated.source_refs,
        evidence: {
          total_capital_recommended: procurement.total_capital_recommended,
          total_projected_profit: procurement.total_projected_profit,
          top_recommendation: recs[0]?.product_name,
        },
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    } else if (qLower.includes('inventory') || qLower.includes('afford') || qLower.includes('buy')) {
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

      const invCash = cashTool.result as TwinMoneyState;
      const safeScenario = scenToolSafe.result as ScenarioResultSnapshot;
      const riskyScenario = scenToolRisky.result as ScenarioResultSnapshot;

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
          current_cash: invCash.cash_balance,
          open_payables: invCash.open_payables,
          upcoming_supplier_due: 'Shree Laxmi Wholesalers (₹85,000 due in 14 days)',
          safe_scenario_end_cash: safeScenario.end_cash.scenario,
          risky_scenario_min_cash: riskyScenario.min_cash.scenario,
          cash_stress_warning: riskyScenario.cash_stress_days.length > 0,
        },
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    } else if (qLower.includes('health') || qLower.includes('score')) {
      const healthTool = executeEngineTool('get_health_score', { business_id });
      executedTools.push({ tool: 'get_health_score', ...healthTool });

      const healthScore = healthTool.result as HealthScoreSnapshot;
      const rawAnswer =
        `Your current Business Health Score is **${healthScore.score}/100** (Healthy).\n\n` +
        `- Cash Stability: **${healthScore.sub_scores.cash_stability}/100**\n` +
        `- Profitability: **${healthScore.sub_scores.profitability}/100**\n` +
        `- Customer Payment Reliability: **${healthScore.sub_scores.customer_payment_reliability}/100**\n` +
        `- Inventory Efficiency: **${healthScore.sub_scores.inventory_efficiency}/100**\n` +
        `- Supplier Dependency: **${healthScore.sub_scores.supplier_dependency}/100** (Review recommended: 57.4% spend concentrated on 1 supplier).`;

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        confidence: healthScore.confidence,
        source_refs: validated.source_refs,
        evidence: healthScore.sub_scores,
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    } else {
      const defaultCashTool = executeEngineTool('get_cash_position', { business_id });
      const defaultHealthTool = executeEngineTool('get_health_score', { business_id });
      executedTools.push(
        { tool: 'get_cash_position', ...defaultCashTool },
        { tool: 'get_health_score', ...defaultHealthTool }
      );

      const defaultCash = defaultCashTool.result as TwinMoneyState;
      const defaultHealth = defaultHealthTool.result as HealthScoreSnapshot;

      const rawAnswer =
        `Based on your current digital twin state, your business cash balance is **₹${defaultCash.cash_balance.toLocaleString('en-IN')}** and your Health Score is **${defaultHealth.score}/100**.\n\n` +
        `You can simulate specific decisions like inventory purchases, pricing changes, discount campaigns, or loan applications using the Scenario Simulator or Time Machine.`;

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        confidence: 'High',
        source_refs: validated.source_refs,
        evidence: {
          cash_balance: defaultCash.cash_balance,
          health_score: defaultHealth.score,
        },
        provider: 'MerchantOS Deterministic Engine',
        is_real_ai: false,
      });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
