import { store } from '../db/mock_store';
import { RiskEvent } from '../db/types';

export function evaluateRiskGraph(businessId: string): RiskEvent[] {
  store.ensureInitialized();
  const existingRisks = store.risk_events.filter(r => r.business_id === businessId);
  const transactions = store.transactions.filter(t => t.business_id === businessId);

  const supplierSpendMap: Record<string, { total: number; supplierName: string; supplierId?: string }> = {};
  let totalInventorySpend = 0;

  transactions.filter(t => t.type === 'expense' && t.category.includes('Inventory')).forEach(t => {
    const key = t.counterparty || 'Unknown Supplier';
    if (!supplierSpendMap[key]) {
      supplierSpendMap[key] = { total: 0, supplierName: key };
    }
    supplierSpendMap[key].total += t.amount;
    totalInventorySpend += t.amount;
  });

  const generatedEvents: RiskEvent[] = [...existingRisks];

  Object.entries(supplierSpendMap).forEach(([name, data]) => {
    const concentrationPct = totalInventorySpend > 0 ? (data.total / totalInventorySpend) * 100 : 0;
    if (concentrationPct > 40 && !generatedEvents.some(e => e.evidence?.supplier_name === name && e.rule_triggered.includes('Concentration'))) {
      generatedEvents.push({
        id: `risk_conc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        business_id: businessId,
        entity_type: 'supplier',
        rule_triggered: 'Supplier Concentration Risk (>40% of inventory spend)',
        severity: concentrationPct > 55 ? 'high' : 'medium',
        evidence: {
          supplier_name: name,
          concentration_pct: Math.round(concentrationPct * 10) / 10,
          threshold_pct: 40.0,
          total_spend: totalInventorySpend,
          supplier_spend: data.total,
          phrasing_template: 'This supplier represents a high concentration of your purchases. Review recommended.',
        },
        status: 'open',
        created_at: new Date().toISOString(),
      });
    }
  });

  return generatedEvents.map(event => {
    const cleanRule = sanitizeRiskText(event.rule_triggered);
    const rawPhrasing = event.evidence?.phrasing_template;
    const cleanPhrasing = typeof rawPhrasing === 'string'
      ? sanitizeRiskText(rawPhrasing)
      : 'Unusual pattern detected. Review recommended.';

    return {
      ...event,
      rule_triggered: cleanRule,
      evidence: {
        ...event.evidence,
        phrasing_template: cleanPhrasing,
      },
    };
  });
}

function sanitizeRiskText(text: string): string {
  return text.replace(/\bfraud\b/gi, 'unusual pattern');
}

