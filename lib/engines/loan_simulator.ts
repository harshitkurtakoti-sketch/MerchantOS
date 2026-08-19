import { runDeterministicScenario } from './scenario';
import { ScenarioResultSnapshot } from '../db/types';

export interface LoanScenarioResult {
  scenario_name: string;
  description: string;
  monthly_emi: number;
  repayment_pressure_pct: number;
  break_even_month: number;
  base_case: ScenarioResultSnapshot;
  best_case: ScenarioResultSnapshot;
  worst_case: ScenarioResultSnapshot;
  warning_flag?: string;
}

export function runReverseLoanSimulation(
  businessId: string,
  loanAmount: number = 500000,
  interestRatePct: number = 14.0,
  tenureMonths: number = 12
): {
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  total_interest_payable: number;
  scenarios: LoanScenarioResult[];
} {
  const monthlyRate = interestRatePct / 100 / 12;
  const monthlyEmi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );
  const totalRepayment = monthlyEmi * tenureMonths;
  const totalInterest = totalRepayment - loanAmount;

  const invBase = runDeterministicScenario(businessId, {
    loan_amount: loanAmount,
    interest_rate_pct: interestRatePct,
    repayment_months: tenureMonths,
    inventory_purchase_amount: loanAmount,
    sales_change_pct: 12,
  });
  const invBest = runDeterministicScenario(businessId, {
    loan_amount: loanAmount,
    interest_rate_pct: interestRatePct,
    repayment_months: tenureMonths,
    inventory_purchase_amount: loanAmount,
    sales_change_pct: 22,
  });
  const invWorst = runDeterministicScenario(businessId, {
    loan_amount: loanAmount,
    interest_rate_pct: interestRatePct,
    repayment_months: tenureMonths,
    inventory_purchase_amount: loanAmount,
    sales_change_pct: -5,
  });

  const mktgBase = runDeterministicScenario(businessId, {
    loan_amount: loanAmount,
    interest_rate_pct: interestRatePct,
    repayment_months: tenureMonths,
    marketing_spend: loanAmount / 3,
    demand_change_pct: 18,
  });
  const mktgBest = runDeterministicScenario(businessId, {
    loan_amount: loanAmount,
    interest_rate_pct: interestRatePct,
    repayment_months: tenureMonths,
    marketing_spend: loanAmount / 3,
    demand_change_pct: 32,
  });
  const mktgWorst = runDeterministicScenario(businessId, {
    loan_amount: loanAmount,
    interest_rate_pct: interestRatePct,
    repayment_months: tenureMonths,
    marketing_spend: loanAmount / 3,
    demand_change_pct: 2,
  });

  const emergBase = runDeterministicScenario(businessId, {
    loan_amount: loanAmount,
    interest_rate_pct: interestRatePct,
    repayment_months: tenureMonths,
  });

  const monthlyFreeCash = Math.max(1, invBase.net_profit.scenario / 3 + monthlyEmi);
  const repPressure = Math.round((monthlyEmi / monthlyFreeCash) * 100);

  let invWarning: string | undefined;
  if (repPressure > 40) {
    invWarning = `Repayment EMI (₹${monthlyEmi.toLocaleString('en-IN')}) requires ${repPressure}% of your projected monthly net cash flow.`;
  }

  const scenarios: LoanScenarioResult[] = [
    {
      scenario_name: 'Inventory Expansion',
      description: 'Use loan proceeds to purchase high-margin fast-moving inventory before seasonal peak.',
      monthly_emi: monthlyEmi,
      repayment_pressure_pct: Math.min(100, repPressure),
      break_even_month: 4,
      base_case: invBase,
      best_case: invBest,
      worst_case: invWorst,
      warning_flag: invWarning,
    },
    {
      scenario_name: 'Marketing Push',
      description: 'Deploy capital into hyper-local ad campaigns and promotional discounts to boost demand.',
      monthly_emi: monthlyEmi,
      repayment_pressure_pct: Math.min(100, Math.round(repPressure * 0.9)),
      break_even_month: 3,
      base_case: mktgBase,
      best_case: mktgBest,
      worst_case: mktgWorst,
    },
    {
      scenario_name: 'Emergency Working Capital',
      description: 'Hold capital in reserve to smooth upcoming supplier payments and receivables gaps.',
      monthly_emi: monthlyEmi,
      repayment_pressure_pct: Math.min(100, Math.round(repPressure * 1.1)),
      break_even_month: 6,
      base_case: emergBase,
      best_case: emergBase,
      worst_case: emergBase,
    },
  ];

  return {
    loan_amount: loanAmount,
    interest_rate: interestRatePct,
    tenure_months: tenureMonths,
    monthly_emi: monthlyEmi,
    total_interest_payable: totalInterest,
    scenarios,
  };
}

