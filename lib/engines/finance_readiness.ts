import { store } from '../db/mock_store';
import { computeFinancialHealth } from './health';
import { FinanceReadinessSnapshot, FinanceReadinessSubScores } from '../db/types';

export function computeFinanceReadiness(businessId: string): FinanceReadinessSnapshot {
  const health = computeFinancialHealth(businessId);
  const healthSub = health.sub_scores;

  const sub_scores: FinanceReadinessSubScores = {
    cash_flow_stability: healthSub.cash_stability,
    revenue_consistency: Math.min(100, Math.round(healthSub.cash_stability * 1.05)),
    profitability: healthSub.profitability,
    receivables_quality: healthSub.customer_payment_reliability,
    inventory_health: healthSub.inventory_efficiency,
    growth_trend: 82, // Stable MoM growth baseline
    debt_burden: 88, // Low existing debt leverage
    payment_behavior: healthSub.supplier_dependency,
  };

  const finalScore = Math.round(
    0.20 * sub_scores.cash_flow_stability +
    0.20 * sub_scores.revenue_consistency +
    0.15 * sub_scores.profitability +
    0.15 * sub_scores.receivables_quality +
    0.10 * sub_scores.inventory_health +
    0.10 * sub_scores.growth_trend +
    0.05 * sub_scores.debt_burden +
    0.05 * sub_scores.payment_behavior
  );

  // Mandatory Language Compliance per PRD Section 12.2
  const qualifying_statement =
    'The business appears financially prepared for additional working-capital financing, subject to lender-specific underwriting.';

  const snapshot: FinanceReadinessSnapshot = {
    business_id: businessId,
    score: finalScore,
    sub_scores,
    confidence: health.confidence,
    qualifying_statement: sanitizeApprovalText(qualifying_statement),
    computed_at: new Date().toISOString(),
  };

  store.readiness_scores.push(snapshot);
  return snapshot;
}

function sanitizeApprovalText(text: string): string {
  // Enforce rule PRD Section 12.2: Never say "approved" or "you qualify"
  return text
    .replace(/\bapproved\b/gi, 'appears prepared')
    .replace(/\byou qualify\b/gi, 'meets initial readiness indicators');
}
