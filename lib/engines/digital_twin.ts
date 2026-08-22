import { store } from '../db/mock_store';

export interface TwinMoneyState {
  cash_balance: number;
  total_revenue_ytd: number;
  total_expenses_ytd: number;
  open_receivables: number;
  open_payables: number;
  net_working_capital: number;
}

export interface TwinCommerceState {
  active_skus_count: number;
  total_inventory_value: number;
  overstocked_skus_count: number;
  top_supplier_name: string;
  top_supplier_spend_pct: number;
}

export interface TwinBehaviorState {
  average_customer_payment_delay_days: number;
  average_supplier_payment_terms_days: number;
  order_return_rate_pct: number;
}

export interface DigitalTwinSnapshot {
  business_id: string;
  version: number;
  timestamp: string;
  money: TwinMoneyState;
  commerce: TwinCommerceState;
  behavior: TwinBehaviorState;
}

// Calibration overrides map for interactive tuning
const twinCalibrationStore: Record<string, {
  cash_adjustment?: number;
  customer_delay_days?: number;
  supplier_terms_days?: number;
  version?: number;
}> = {};

export function updateDigitalTwinParameters(
  businessId: string,
  params: { cash_adjustment?: number; customer_delay_days?: number; supplier_terms_days?: number }
): DigitalTwinSnapshot {
  store.ensureInitialized();
  const current = twinCalibrationStore[businessId] || { version: 1 };
  twinCalibrationStore[businessId] = {
    ...current,
    ...params,
    version: (current.version || 1) + 1,
  };
  return getDigitalTwinState(businessId);
}

export function getDigitalTwinState(businessId: string): DigitalTwinSnapshot {
  store.ensureInitialized();
  const transactions = store.transactions.filter(t => t.business_id === businessId);
  const products = store.products.filter(p => p.business_id === businessId);
  const receivables = store.receivables.filter(r => r.business_id === businessId && r.status !== 'paid');
  const payables = store.payables.filter(p => p.business_id === businessId && p.status !== 'paid');

  const calibration = twinCalibrationStore[businessId] || { version: 1 };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const baseCash = Math.max(0, totalIncome - totalExpenses);
  const cashBalance = Math.max(0, baseCash + (calibration.cash_adjustment || 0));

  const openRecVal = receivables.reduce((acc, r) => acc + r.amount, 0);
  const openPayVal = payables.reduce((acc, p) => acc + p.amount, 0);

  const inventoryVal = products.reduce((acc, p) => acc + p.cost_price * 45, 0);

  const overstockedCount = products.filter(p => p.sku.includes('BRASS') || p.sku.includes('GIFT')).length;

  return {
    business_id: businessId,
    version: calibration.version || 1,
    timestamp: new Date().toISOString(),
    money: {
      cash_balance: Math.round(cashBalance),
      total_revenue_ytd: Math.round(totalIncome),
      total_expenses_ytd: Math.round(totalExpenses),
      open_receivables: Math.round(openRecVal),
      open_payables: Math.round(openPayVal),
      net_working_capital: Math.round(cashBalance + openRecVal - openPayVal),
    },
    commerce: {
      active_skus_count: products.length,
      total_inventory_value: Math.round(inventoryVal),
      overstocked_skus_count: overstockedCount,
      top_supplier_name: 'Shree Laxmi Wholesalers Pvt Ltd',
      top_supplier_spend_pct: 57.4,
    },
    behavior: {
      average_customer_payment_delay_days: calibration.customer_delay_days ?? 14,
      average_supplier_payment_terms_days: calibration.supplier_terms_days ?? 30,
      order_return_rate_pct: 2.4,
    },
  };
}

