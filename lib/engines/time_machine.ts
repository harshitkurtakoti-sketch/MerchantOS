import { store } from '../db/mock_store';
import { runDeterministicScenario } from './scenario';
import { ForecastPoint, ScenarioAssumptions } from '../db/types';

export function computeTimeMachineForecast(
  businessId: string,
  horizonDays: number = 90,
  assumptions: ScenarioAssumptions = {}
): {
  horizon_days: number;
  safety_threshold: number;
  has_cash_stress: boolean;
  cash_stress_dates: string[];
  points: ForecastPoint[];
} {
  const transactions = store.transactions.filter(t => t.business_id === businessId);
  const receivables = store.receivables.filter(r => r.business_id === businessId && r.status !== 'paid');
  const payables = store.payables.filter(p => p.business_id === businessId && p.status !== 'paid');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const startCash = Math.max(0, totalIncome - totalExpenses);

  const scenarioResult = runDeterministicScenario(businessId, assumptions);
  const initialPurchaseOutflow = assumptions.inventory_purchase_amount || 0;
  const loanInflow = assumptions.loan_amount || 0;

  // Baseline daily organic flow from scenario net profit
  const dailyOrganicRevenue = (scenarioResult.revenue.scenario / 90);
  const dailyOrganicExpense = ((scenarioResult.revenue.scenario - scenarioResult.net_profit.scenario) / 90);

  const safetyThreshold = 65000; // ₹65,000 safety threshold
  let runningCash = startCash + loanInflow - initialPurchaseOutflow;
  const points: ForecastPoint[] = [];
  const cashStressDates: string[] = [];

  const startDate = new Date();

  for (let day = 1; day <= horizonDays; day++) {
    const currentDate = new Date(startDate.getTime() + day * 86400000);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Scheduled payables / receivables on specific future days
    let dayPayables = 0;
    let dayReceivables = 0;
    let note: string | undefined;

    if (day === 14) {
      dayPayables = payables.reduce((acc, p) => acc + p.amount, 0);
      note = 'Major supplier payment due (Shree Laxmi Wholesalers)';
    }

    if (day === 28) {
      dayReceivables = receivables.reduce((acc, r) => acc + r.amount, 0);
      note = 'Expected customer receivables collection (Hotel & Caterers)';
    }

    if (day === 60) {
      dayPayables += 45000;
      note = 'Quarterly tax & bulk restocking payables';
    }

    // Weekly seasonality variance (spikes on weekend)
    const dayOfWeek = currentDate.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.35 : 0.88;
    const dayOrganicRev = Math.round(dailyOrganicRevenue * weekendMultiplier);
    const dayOrganicExp = Math.round(dailyOrganicExpense);

    runningCash += (dayOrganicRev - dayOrganicExp + dayReceivables - dayPayables);

    // Confidence band widens as horizon extends
    const uncertaintyMargin = 0.03 + (day / horizonDays) * 0.12; // 3% -> 15%
    const lowerBound = Math.round(runningCash * (1 - uncertaintyMargin));
    const upperBound = Math.round(runningCash * (1 + uncertaintyMargin));

    const isStress = runningCash < safetyThreshold;
    if (isStress) {
      cashStressDates.push(dateStr);
    }

    points.push({
      date: dateStr,
      projected_cash: Math.round(runningCash),
      lower_bound: lowerBound,
      upper_bound: upperBound,
      scheduled_payables: dayPayables,
      scheduled_receivables: dayReceivables,
      organic_revenue: dayOrganicRev,
      organic_expense: dayOrganicExp,
      cash_stress_warning: isStress,
      notes: note,
    });
  }

  return {
    horizon_days: horizonDays,
    safety_threshold: safetyThreshold,
    has_cash_stress: cashStressDates.length > 0,
    cash_stress_dates: cashStressDates,
    points,
  };
}
