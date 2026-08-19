import { computeFinancialHealth } from '../engines/health';
import { getDigitalTwinState } from '../engines/digital_twin';
import { computeCommerceIntelligence } from '../engines/commerce';
import { runDeterministicScenario } from '../engines/scenario';
import { computeTimeMachineForecast } from '../engines/time_machine';
import { evaluateRiskGraph } from '../engines/risk';
import { computeFinanceReadiness } from '../engines/finance_readiness';
import { store } from '../db/mock_store';

export const AI_TOOLS_DEFINITIONS = [
  {
    name: 'get_health_score',
    description: 'Returns the deterministic Business Health Score (0-100) and its 5 sub-scores (Cash Stability, Profitability, Customer Payment Reliability, Inventory Efficiency, Supplier Dependency).',
    input_schema: {
      type: 'object',
      properties: {
        business_id: { type: 'string', description: 'Business tenant UUID' },
      },
      required: ['business_id'],
    },
  },
  {
    name: 'get_cash_position',
    description: 'Returns current cash balance, revenue YTD, expenses YTD, open receivables, and open payables.',
    input_schema: {
      type: 'object',
      properties: {
        business_id: { type: 'string' },
      },
      required: ['business_id'],
    },
  },
  {
    name: 'get_product_profitability',
    description: 'Returns true contribution margins per product, ranking products by profit/loss, and highlighting loss-making items.',
    input_schema: {
      type: 'object',
      properties: {
        business_id: { type: 'string' },
      },
      required: ['business_id'],
    },
  },
  {
    name: 'get_time_machine_forecast',
    description: 'Returns the forward cash trajectory forecast with scheduled payables/receivables and cash stress warning dates.',
    input_schema: {
      type: 'object',
      properties: {
        business_id: { type: 'string' },
        horizon_days: { type: 'number', description: 'Forecast horizon in days (30, 60, 90, 180)' },
      },
      required: ['business_id'],
    },
  },
  {
    name: 'run_scenario',
    description: 'Simulates a proposed decision (inventory purchase, price change, sales drop, marketing spend, loan) and returns propagated cash, profit, and risk outputs.',
    input_schema: {
      type: 'object',
      properties: {
        business_id: { type: 'string' },
        inventory_purchase_amount: { type: 'number' },
        sales_change_pct: { type: 'number' },
        price_change_pct: { type: 'number' },
        discount_depth_pct: { type: 'number' },
        marketing_spend: { type: 'number' },
        loan_amount: { type: 'number' },
      },
      required: ['business_id'],
    },
  },
  {
    name: 'get_risk_flags',
    description: 'Returns flagged supplier/customer concentration risks and anomalous transactions with evidence.',
    input_schema: {
      type: 'object',
      properties: {
        business_id: { type: 'string' },
      },
      required: ['business_id'],
    },
  },
  {
    name: 'get_finance_readiness',
    description: 'Returns the deterministic Finance Readiness score (0-100) and qualification statement.',
    input_schema: {
      type: 'object',
      properties: {
        business_id: { type: 'string' },
      },
      required: ['business_id'],
    },
  },
];

export function executeEngineTool(name: string, args: any): { result: any; source_refs: string[] } {
  const bId = args.business_id || 'biz_rukmini_store';

  switch (name) {
    case 'get_health_score': {
      const res = computeFinancialHealth(bId);
      return {
        result: res,
        source_refs: [`engine:health_score:${res.score}`, `engine:health:cash:${res.sub_scores.cash_stability}`],
      };
    }
    case 'get_cash_position': {
      const twin = getDigitalTwinState(bId);
      return {
        result: twin.money,
        source_refs: [`engine:cash_balance:${twin.money.cash_balance}`, `engine:net_working_capital:${twin.money.net_working_capital}`],
      };
    }
    case 'get_product_profitability': {
      const res = computeCommerceIntelligence(bId);
      return {
        result: res,
        source_refs: res.map(p => `engine:product:${p.sku}:margin:${p.true_contribution_margin}`),
      };
    }
    case 'get_time_machine_forecast': {
      const res = computeTimeMachineForecast(bId, args.horizon_days || 90);
      return {
        result: res,
        source_refs: [`engine:forecast:horizon:${res.horizon_days}`, `engine:forecast:stress_count:${res.cash_stress_dates.length}`],
      };
    }
    case 'run_scenario': {
      const res = runDeterministicScenario(bId, args);
      return {
        result: res,
        source_refs: [
          `engine:scenario:end_cash:${res.end_cash.scenario}`,
          `engine:scenario:min_cash:${res.min_cash.scenario}`,
          `engine:scenario:net_profit:${res.net_profit.scenario}`,
        ],
      };
    }
    case 'get_risk_flags': {
      const res = evaluateRiskGraph(bId);
      return {
        result: res,
        source_refs: res.map(r => `engine:risk:${r.id}`),
      };
    }
    case 'get_finance_readiness': {
      const res = computeFinanceReadiness(bId);
      return {
        result: res,
        source_refs: [`engine:readiness_score:${res.score}`],
      };
    }
    default:
      return { result: { error: 'Unknown tool' }, source_refs: [] };
  }
}
