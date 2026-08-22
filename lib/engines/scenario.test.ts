import { seedSyntheticDemoBusiness } from '../demo/synthetic_generator';
import { runDeterministicScenario } from './scenario';

describe('Scenario Engine Deterministic Tests', () => {
  const { businessId } = seedSyntheticDemoBusiness();

  test('Base scenario produces 0 diff for 0 assumption deltas', () => {
    const result = runDeterministicScenario(businessId, {});
    expect(result.revenue.diff).toBe(0);
    expect(result.revenue.pct_change).toBe(0);
    expect(result.risk_level).toBe('Low');
  });

  test('20% sales drop triggers medium/high risk and decreases revenue', () => {
    const result = runDeterministicScenario(businessId, { sales_change_pct: -20 });
    expect(result.revenue.pct_change).toBe(-20);
    expect(result.revenue.scenario).toBeLessThan(result.revenue.current);
  });

  test('Inventory purchase of ₹3,000,000 when cash is lower triggers warning notes', () => {
    const result = runDeterministicScenario(businessId, { inventory_purchase_amount: 3000000 });
    expect(result.warning_notes.length).toBeGreaterThan(0);
    expect(result.end_cash.scenario).toBeLessThan(result.end_cash.current);
  });
});
