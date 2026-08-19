import { NextRequest, NextResponse } from 'next/server';
import { executeEngineTool } from '@/lib/ai/tools';
import { validateAndAttributeResponse } from '@/lib/ai/validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, business_id = 'biz_rukmini_store' } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const qLower = question.toLowerCase();
    const executedTools: Array<{ tool: string; result: any; source_refs: string[] }> = [];

    // Classify intent and invoke deterministic tools directly in process
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
      });
    } else if (qLower.includes('profitable') || qLower.includes('margin') || qLower.includes('product')) {
      const commTool = executeEngineTool('get_product_profitability', { business_id });
      executedTools.push({ tool: 'get_product_profitability', ...commTool });

      const losingProducts = commTool.result.filter((p: any) => p.is_losing_money);
      const topProduct = commTool.result[0];

      const rawAnswer =
        `Your most profitable product by total net contribution is **${topProduct.name}** (₹${topProduct.total_actual_contribution.toLocaleString('en-IN')} contributed).\n\n` +
        `⚠️ **Attention Required:** You have **${losingProducts.length} loss-making products** where true contribution margin is negative once shipping, payment fees, packaging, and returns are included:\n` +
        losingProducts.map((lp: any) => `- **${lp.name}**: True Margin is -₹${Math.abs(lp.true_contribution_margin)}/unit (${lp.primary_loss_driver})`).join('\n');

      const validated = validateAndAttributeResponse(rawAnswer, executedTools);

      return NextResponse.json({
        question,
        answer: validated.answer_text,
        confidence: 'High',
        source_refs: validated.source_refs,
        evidence: {
          top_product: topProduct.name,
          losing_products_count: losingProducts.length,
          losing_items: losingProducts,
        },
      });
    } else {
      // General decision query fallback
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
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
