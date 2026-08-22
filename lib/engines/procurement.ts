import { store } from '../db/mock_store';
import { computeCommerceIntelligence, ProductMarginSummary } from './commerce';

export interface ProcurementRecommendation {
  product_id: string;
  product_name: string;
  sku: string;
  category: string;
  supplier_name: string;
  unit_cost: number;
  retail_price: number;
  true_margin_per_unit: number;
  margin_pct: number;
  current_stock_units: number;
  monthly_sales_velocity: number;
  stockout_risk_days: number;
  recommended_order_quantity: number;
  total_investment_required: number;
  projected_net_profit: number;
  roi_pct: number;
  priority_score: 'HIGH_PRIORITY' | 'OPPORTUNITY' | 'LOW_PRIORITY' | 'AVOID_RESTOCKING';
  buying_rationale: string;
  evidence_references: {
    past_units_sold: number;
    true_contribution_margin: number;
    supplier_terms: string;
    velocity_rating: string;
  };
}

export function getSmartProcurementRecommendations(businessId: string): {
  business_id: string;
  generated_at: string;
  total_capital_recommended: number;
  total_projected_profit: number;
  recommendations: ProcurementRecommendation[];
} {
  store.ensureInitialized();
  const products = store.products.filter(p => p.business_id === businessId);
  const commerceData = computeCommerceIntelligence(businessId);
  const commerceMap = new Map<string, ProductMarginSummary>(commerceData.map(c => [c.product_id, c]));

  const recommendations: ProcurementRecommendation[] = products.map((product) => {
    const cInfo = commerceMap.get(product.id);
    const unitsSold = cInfo?.total_units_sold || 30;
    const trueMargin = cInfo?.true_contribution_margin || (product.selling_price - product.cost_price);
    const marginPct = cInfo?.contribution_margin_pct || 15;
    const currentStock = 12;

    const monthlySalesVelocity = Math.max(5, unitsSold);
    const stockoutRiskDays = Math.round((currentStock / (monthlySalesVelocity / 30)));

    let recommendedQty = 0;
    let priority: 'HIGH_PRIORITY' | 'OPPORTUNITY' | 'LOW_PRIORITY' | 'AVOID_RESTOCKING' = 'LOW_PRIORITY';
    let rationale = '';

    if (cInfo?.is_losing_money || trueMargin <= 0) {
      recommendedQty = 0;
      priority = 'AVOID_RESTOCKING';
      rationale = `Negative unit contribution (-₹${Math.abs(trueMargin)}). Review packaging or price before buying more.`;
    } else if (trueMargin > 30 && stockoutRiskDays < 15) {
      recommendedQty = Math.round(monthlySalesVelocity * 1.5);
      priority = 'HIGH_PRIORITY';
      rationale = `High true contribution (+₹${trueMargin}/unit) with critical stock-out in ~${stockoutRiskDays} days.`;
    } else if (trueMargin > 15) {
      recommendedQty = Math.round(monthlySalesVelocity * 1.2);
      priority = 'OPPORTUNITY';
      rationale = `Solid profitable margin (+${marginPct}%). Recommended for steady demand replenishment.`;
    } else {
      recommendedQty = Math.round(monthlySalesVelocity * 0.8);
      priority = 'LOW_PRIORITY';
      rationale = `Moderate turnover. Order small batches to avoid tying up working capital.`;
    }

    const totalInvestment = recommendedQty * product.cost_price;
    const projectedProfit = Math.round(recommendedQty * trueMargin);
    const roiPct = totalInvestment > 0 ? Math.round((projectedProfit / totalInvestment) * 100) : 0;

    return {
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      category: product.category,
      supplier_name: 'Shree Laxmi Wholesalers Pvt Ltd',
      unit_cost: product.cost_price,
      retail_price: product.selling_price,
      true_margin_per_unit: trueMargin,
      margin_pct: marginPct,
      current_stock_units: currentStock,
      monthly_sales_velocity: monthlySalesVelocity,
      stockout_risk_days: stockoutRiskDays,
      recommended_order_quantity: recommendedQty,
      total_investment_required: totalInvestment,
      projected_net_profit: projectedProfit,
      roi_pct: roiPct,
      priority_score: priority,
      buying_rationale: rationale,
      evidence_references: {
        past_units_sold: unitsSold,
        true_contribution_margin: trueMargin,
        supplier_terms: 'Net-30 days billing',
        velocity_rating: monthlySalesVelocity > 40 ? 'Fast Moving' : 'Steady Moving',
      },
    };
  });

  const priorityOrder = { HIGH_PRIORITY: 1, OPPORTUNITY: 2, LOW_PRIORITY: 3, AVOID_RESTOCKING: 4 };
  const sorted = recommendations.sort((a, b) => priorityOrder[a.priority_score] - priorityOrder[b.priority_score] || b.projected_net_profit - a.projected_net_profit);

  const totalCapital = sorted
    .filter(r => r.priority_score !== 'AVOID_RESTOCKING')
    .reduce((acc, r) => acc + r.total_investment_required, 0);

  const totalProfit = sorted
    .filter(r => r.priority_score !== 'AVOID_RESTOCKING')
    .reduce((acc, r) => acc + r.projected_net_profit, 0);

  return {
    business_id: businessId,
    generated_at: new Date().toISOString(),
    total_capital_recommended: totalCapital,
    total_projected_profit: totalProfit,
    recommendations: sorted,
  };
}
