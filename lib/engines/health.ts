import { store } from '../db/mock_store';
import { HealthScoreSnapshot, HealthSubScores, ConfidenceLevel } from '../db/types';

export function computeFinancialHealth(businessId: string): HealthScoreSnapshot {
  store.ensureInitialized();
  const transactions = store.transactions.filter(t => t.business_id === businessId);
  const sales = store.sales.filter(s => s.business_id === businessId);
  const receivables = store.receivables.filter(r => r.business_id === businessId);
  const products = store.products.filter(p => p.business_id === businessId);


  if (transactions.length === 0 && sales.length === 0) {
    return {
      business_id: businessId,
      score: 0,
      sub_scores: {
        cash_stability: 0,
        profitability: 0,
        customer_payment_reliability: 0,
        inventory_efficiency: 0,
        supplier_dependency: 0,
      },
      confidence: 'Low',
      history_days: 0,
      computed_at: new Date().toISOString(),
    };
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netCash = Math.max(0, totalIncome - totalExpense);
  const dailyOpex = Math.max(1, totalExpense / 180);
  const cashBufferDays = netCash / dailyOpex;
  const cash_stability = Math.min(100, Math.max(0, Math.round((cashBufferDays / 30) * 100)));

  const marginPct = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const profitability = Math.min(100, Math.max(0, Math.round((marginPct / 15) * 100)));

  const totalRec = receivables.length;
  const overdueRec = receivables.filter(r => r.status === 'overdue').length;
  const reliabilityPct = totalRec > 0 ? ((totalRec - overdueRec) / totalRec) * 100 : 85;
  const customer_payment_reliability = Math.min(100, Math.max(0, Math.round(reliabilityPct)));

  const overstockedItems = products.filter(p => p.sku.includes('BRASS') || p.sku.includes('GIFT')).length;
  const inventory_efficiency = Math.max(40, 90 - overstockedItems * 15);

  const supplierSpendMap: Record<string, number> = {};
  let totalSupplierSpend = 0;
  transactions.filter(t => t.type === 'expense' && t.category.includes('Inventory')).forEach(t => {
    const key = t.counterparty || 'Unknown';
    supplierSpendMap[key] = (supplierSpendMap[key] || 0) + t.amount;
    totalSupplierSpend += t.amount;
  });
  let maxConcentration = 0;
  Object.values(supplierSpendMap).forEach(amt => {
    const pct = (amt / Math.max(1, totalSupplierSpend)) * 100;
    if (pct > maxConcentration) maxConcentration = pct;
  });
  const supplier_dependency = Math.min(100, Math.max(20, Math.round(120 - maxConcentration)));

  const sub_scores: HealthSubScores = {
    cash_stability,
    profitability,
    customer_payment_reliability,
    inventory_efficiency,
    supplier_dependency,
  };

  const finalScore = Math.round(
    0.25 * sub_scores.cash_stability +
    0.20 * sub_scores.profitability +
    0.20 * sub_scores.customer_payment_reliability +
    0.20 * sub_scores.inventory_efficiency +
    0.15 * sub_scores.supplier_dependency
  );

  const confidence: ConfidenceLevel = transactions.length > 50 ? 'High' : transactions.length > 15 ? 'Medium' : 'Low';

  const snapshot: HealthScoreSnapshot = {
    business_id: businessId,
    score: finalScore,
    sub_scores,
    confidence,
    history_days: 180,
    computed_at: new Date().toISOString(),
  };

  store.health_scores.push(snapshot);
  return snapshot;
}

