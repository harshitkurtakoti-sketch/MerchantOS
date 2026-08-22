import { runDeterministicScenario } from './scenario';
import { computeFinanceReadiness } from './finance_readiness';
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

export interface BankLenderMatch {
  bank_name: string;
  scheme_name: string;
  sanction_probability_pct: number;
  likelihood_badge: 'High' | 'Medium' | 'Review Required';
  indicative_interest_rate_pct: number;
  interest_rate_range: string;
  max_sanction_limit: number;
  processing_turnaround_days: string;
  collateral_required: boolean;
  approval_drivers: string[];
  required_documents: string[];
  scheme_type: 'Government Subsidized' | 'Private MSME Line' | 'Public Sector Working Capital' | 'Instant Digital Line';
}

export function getBankLenderMatches(businessId: string, _loanAmount: number = 500000): BankLenderMatch[] {
  const readiness = computeFinanceReadiness(businessId);
  const score = readiness.score;

  const banks: BankLenderMatch[] = [
    {
      bank_name: 'HDFC Bank',
      scheme_name: 'SmartUp MSME Working Capital Line',
      sanction_probability_pct: score >= 75 ? 92 : score >= 60 ? 76 : 54,
      likelihood_badge: score >= 75 ? 'High' : score >= 60 ? 'Medium' : 'Review Required',
      indicative_interest_rate_pct: 10.75,
      interest_rate_range: '10.25% – 12.50% p.a.',
      max_sanction_limit: 1500000,
      processing_turnaround_days: '24–48 Hours',
      collateral_required: false,
      approval_drivers: [
        'Verified UPI & POS transaction consistency (>₹80k/mo)',
        'Positive operating margin (>12%)',
        'Strong cash flow buffer across 180 days',
      ],
      required_documents: ['6-Month Bank Statement', 'GST Returns (GSTR-3B)', 'KYC & Pan'],
      scheme_type: 'Private MSME Line',
    },
    {
      bank_name: 'State Bank of India (SBI)',
      scheme_name: 'SME e-Vikas Working Capital Scheme',
      sanction_probability_pct: score >= 75 ? 88 : score >= 60 ? 72 : 48,
      likelihood_badge: score >= 75 ? 'High' : score >= 60 ? 'Medium' : 'Review Required',
      indicative_interest_rate_pct: 9.85,
      interest_rate_range: '9.50% – 11.25% p.a.',
      max_sanction_limit: 2000000,
      processing_turnaround_days: '3–5 Business Days',
      collateral_required: false,
      approval_drivers: [
        'Government MSME priority lending bracket',
        'Healthy receivables collection ratio (>85%)',
        'Low existing leverage',
      ],
      required_documents: ['Udyam Registration Certificate', '12-Month Bank Statement', 'ITR 2 Years'],
      scheme_type: 'Public Sector Working Capital',
    },
    {
      bank_name: 'ICICI Bank',
      scheme_name: 'InstaBIZ Instant Overdraft',
      sanction_probability_pct: score >= 75 ? 85 : score >= 60 ? 70 : 50,
      likelihood_badge: score >= 75 ? 'High' : score >= 60 ? 'Medium' : 'Review Required',
      indicative_interest_rate_pct: 11.25,
      interest_rate_range: '11.00% – 13.50% p.a.',
      max_sanction_limit: 1000000,
      processing_turnaround_days: 'Instant (Under 4 Hours)',
      collateral_required: false,
      approval_drivers: [
        'Digital banking activity trail',
        'High inventory efficiency turnover',
        'No bounced check/NACH mandates',
      ],
      required_documents: ['Digital Bank Statement Upload', 'Aadhaar / PAN Authentication'],
      scheme_type: 'Instant Digital Line',
    },
    {
      bank_name: 'SIDBI',
      scheme_name: 'Direct MSME Growth Scheme',
      sanction_probability_pct: score >= 75 ? 80 : score >= 60 ? 65 : 45,
      likelihood_badge: score >= 75 ? 'High' : score >= 60 ? 'Medium' : 'Review Required',
      indicative_interest_rate_pct: 9.25,
      interest_rate_range: '8.95% – 10.50% p.a.',
      max_sanction_limit: 2500000,
      processing_turnaround_days: '5–7 Business Days',
      collateral_required: false,
      approval_drivers: [
        'Concessional MSME development rate',
        'Proven business operational vintage (>2 years)',
        'Audited digital twin health compliance',
      ],
      required_documents: ['Udyam Registration', 'Audited Financial Statements', 'Bank Statements'],
      scheme_type: 'Government Subsidized',
    },
    {
      bank_name: 'Kotak Mahindra Bank',
      scheme_name: 'Business Growth Loan',
      sanction_probability_pct: score >= 75 ? 82 : score >= 60 ? 68 : 46,
      likelihood_badge: score >= 75 ? 'High' : score >= 60 ? 'Medium' : 'Review Required',
      indicative_interest_rate_pct: 11.50,
      interest_rate_range: '11.25% – 13.75% p.a.',
      max_sanction_limit: 1200000,
      processing_turnaround_days: '48 Hours',
      collateral_required: false,
      approval_drivers: [
        'Clean trade payment history',
        'Diverse supplier base stability',
      ],
      required_documents: ['GST Invoices', 'Bank Statements', 'Business Proof'],
      scheme_type: 'Private MSME Line',
    },
  ];

  return banks.sort((a, b) => b.sanction_probability_pct - a.sanction_probability_pct);
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
  bank_matches: BankLenderMatch[];
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

  const bankMatches = getBankLenderMatches(businessId, loanAmount);

  return {
    loan_amount: loanAmount,
    interest_rate: interestRatePct,
    tenure_months: tenureMonths,
    monthly_emi: monthlyEmi,
    total_interest_payable: totalInterest,
    scenarios,
    bank_matches: bankMatches,
  };
}


