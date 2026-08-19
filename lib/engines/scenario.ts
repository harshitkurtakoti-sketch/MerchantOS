import { store } from '../db/mock_store';
import { getDigitalTwinState } from './digital_twin';
import { ScenarioAssumptions, ScenarioResultSnapshot } from '../db/types';

export function runDeterministicScenario(
  businessId: string,
  assumptions: ScenarioAssumptions
): ScenarioResultSnapshot {
  const twin = getDigitalTwinState(businessId);
  const currentMoney = twin.money;
  const currentCommerce = twin.commerce;

  // Extract base current values
  const baseRevenue = currentMoney.total_revenue_ytd / 6; // monthly average
  const baseExpenses = currentMoney.total_expenses_ytd / 6; // monthly average
  const baseCash = currentMoney.cash_balance;
  const baseReceivables = currentMoney.open_receivables;
  const basePayables = currentMoney.open_payables;
  const baseInventory = currentCommerce.total_inventory_value;

  // 1. Calculate Assumption Deltas
  const salesChangePct = assumptions.sales_change_pct || 0;
  const priceChangePct = assumptions.price_change_pct || 0;
  const invPurchaseAmt = assumptions.inventory_purchase_amount || 0;
  const discountPct = assumptions.discount_depth_pct || 0;
  const mktgSpend = assumptions.marketing_spend || 0;
  const opexChangePct = assumptions.opex_change_pct || 0;
  const loanAmt = assumptions.loan_amount || 0;
  const interestRate = assumptions.interest_rate_pct || 14; // 14% p.a default
  const loanTenureMonths = assumptions.repayment_months || 12;

  // Demand Uplift from Marketing Spend (conservative 1% sales increase per ₹15,000 marketing spend)
  const mktgDemandUplift = mktgSpend > 0 ? (mktgSpend / 15000) * 1.5 : 0;
  const netSalesPctDelta = salesChangePct + (assumptions.demand_change_pct || 0) + mktgDemandUplift;

  // Price Elasticity effect: if price goes up 10%, demand drops ~5% unless specified
  const elasticityVolumeDelta = priceChangePct > 0 ? -0.5 * priceChangePct : 0;
  const effectiveVolumeMultiplier = 1 + (netSalesPctDelta + elasticityVolumeDelta) / 100;
  const effectivePriceMultiplier = (1 + priceChangePct / 100) * (1 - discountPct / 100);

  // 2. Projected Monthly Revenue & Profit
  const scenarioMonthlyRevenue = Math.max(0, baseRevenue * effectiveVolumeMultiplier * effectivePriceMultiplier);
  const baseCogs = baseRevenue * 0.72; // ~72% COGS in retail staples
  const scenarioCogs = baseCogs * effectiveVolumeMultiplier;

  const scenarioGrossProfit = scenarioMonthlyRevenue - scenarioCogs;

  const scenarioBaseOpex = baseExpenses * 0.28 * (1 + opexChangePct / 100) + mktgSpend;
  
  // Loan EMI calculation (P * r * (1+r)^n / ((1+r)^n - 1))
  let monthlyLoanEmi = 0;
  if (loanAmt > 0 && loanTenureMonths > 0) {
    const monthlyRate = interestRate / 100 / 12;
    monthlyLoanEmi = (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, loanTenureMonths)) / (Math.pow(1 + monthlyRate, loanTenureMonths) - 1);
  }

  const scenarioNetProfit = scenarioGrossProfit - scenarioBaseOpex - monthlyLoanEmi;
  const scenarioMarginPct = scenarioMonthlyRevenue > 0 ? (scenarioNetProfit / scenarioMonthlyRevenue) * 100 : 0;

  // 3. 90-Day Cash Trajectory Simulation
  const horizonDays = 90;
  const dailyOrganicNetCash = (scenarioNetProfit * 3) / horizonDays;
  const safetyThresholdCash = Math.max(50000, scenarioBaseOpex * 0.5); // 15 days opex safety buffer

  let currentSimCash = baseCash + loanAmt - invPurchaseAmt;
  let minSimCash = currentSimCash;
  const cashStressDays: number[] = [];

  for (let day = 1; day <= horizonDays; day++) {
    currentSimCash += dailyOrganicNetCash;

    // Simulate scheduled payables / receivables spikes
    if (day === 14) currentSimCash -= basePayables * 0.6; // major supplier payment due
    if (day === 25) currentSimCash += baseReceivables * 0.7; // major customer payment collected

    if (currentSimCash < minSimCash) {
      minSimCash = currentSimCash;
    }

    if (currentSimCash < safetyThresholdCash) {
      cashStressDays.push(day);
    }
  }

  const endSimCash = currentSimCash;
  const scenarioInventory = baseInventory + invPurchaseAmt - (scenarioCogs * 3);
  const scenarioReceivables = baseReceivables * (assumptions.customer_credit_days ? assumptions.customer_credit_days / 30 : 1);
  const scenarioPayables = basePayables * (assumptions.supplier_terms_days ? assumptions.supplier_terms_days / 30 : 1);

  // 4. Determine Risk Level
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  const warningNotes: string[] = [];

  if (minSimCash < 0) {
    riskLevel = 'High';
    warningNotes.push(`Scenario causes a critical cash shortfall of ₹${Math.abs(Math.round(minSimCash)).toLocaleString('en-IN')} during the 90-day period.`);
  } else if (cashStressDays.length > 0) {
    riskLevel = 'Medium';
    warningNotes.push(`Projected cash drops below your safety buffer (₹${Math.round(safetyThresholdCash).toLocaleString('en-IN')}) for ${cashStressDays.length} days.`);
  }

  if (invPurchaseAmt > baseCash) {
    warningNotes.push(`Inventory purchase (₹${invPurchaseAmt.toLocaleString('en-IN')}) exceeds your current cash balance (₹${baseCash.toLocaleString('en-IN')}).`);
  }

  const currentMarginPct = baseRevenue > 0 ? ((baseRevenue - baseExpenses) / baseRevenue) * 100 : 0;

  return {
    revenue: formatDiff(baseRevenue * 3, scenarioMonthlyRevenue * 3),
    gross_profit: formatDiff((baseRevenue - baseCogs) * 3, scenarioGrossProfit * 3),
    net_profit: formatDiff((baseRevenue - baseExpenses) * 3, scenarioNetProfit * 3),
    end_cash: formatDiff(baseCash, endSimCash),
    min_cash: formatDiff(baseCash, minSimCash),
    inventory_val: formatDiff(baseInventory, scenarioInventory),
    receivables: formatDiff(baseReceivables, scenarioReceivables),
    payables: formatDiff(basePayables, scenarioPayables),
    margin_pct: formatDiff(currentMarginPct, scenarioMarginPct),
    risk_level: riskLevel,
    cash_stress_days: cashStressDays,
    warning_notes: warningNotes,
  };
}

function formatDiff(current: number, scenario: number) {
  const c = Math.round(current);
  const s = Math.round(scenario);
  const diff = s - c;
  const pct_change = c !== 0 ? Math.round((diff / Math.abs(c)) * 1000) / 10 : 0;
  return { current: c, scenario: s, diff, pct_change };
}
