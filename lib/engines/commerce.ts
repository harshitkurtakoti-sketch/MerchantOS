import { store } from '../db/mock_store';

export interface ProductMarginSummary {
  product_id: string;
  name: string;
  sku: string;
  category: string;
  selling_price: number;
  cost_price: number;
  payment_fee_avg: number;
  delivery_cost_avg: number;
  return_cost_avg: number;
  discount_avg: number;
  packaging_cost: number;
  true_contribution_margin: number;
  contribution_margin_pct: number;
  total_units_sold: number;
  total_revenue: number;
  total_actual_contribution: number;
  is_losing_money: boolean;
  primary_loss_driver?: string;
}

export function computeCommerceIntelligence(businessId: string): ProductMarginSummary[] {
  store.ensureInitialized();
  const products = store.products.filter(p => p.business_id === businessId);
  const sales = store.sales.filter(s => s.business_id === businessId);

  const summaries: ProductMarginSummary[] = products.map(product => {
    const productSales = sales.filter(s => s.product_id === product.id);
    const totalUnits = productSales.reduce((acc, s) => acc + s.quantity, 0);

    const paymentFeePctMap: Record<string, number> = {
      upi: 0.0,
      cash: 0.0,
      card: 0.018,
      bank_transfer: 0.0,
      cod: 0.025,
      wallet: 0.015,
    };

    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalPaymentFees = 0;

    productSales.forEach(s => {
      const discount = (s.unit_price * s.discount_pct) / 100;
      const effectivePrice = s.unit_price - discount;
      const fee = effectivePrice * (paymentFeePctMap[s.payment_method] || 0);

      totalRevenue += effectivePrice * s.quantity;
      totalDiscount += discount * s.quantity;
      totalPaymentFees += fee * s.quantity;
    });

    const avgSellingPrice = product.selling_price;
    const avgDiscount = totalUnits > 0 ? totalDiscount / totalUnits : 0;
    const avgPaymentFee = totalUnits > 0 ? totalPaymentFees / totalUnits : avgSellingPrice * 0.01;
    const packagingCost = 8.0;

    const returnRatePct = product.sku.includes('ROYAL') || product.sku.includes('OLIVE') ? 0.08 : 0.02;
    const avgReturnCost = returnRatePct * (product.cost_price + 40);
    const avgDeliveryCost = product.sku.includes('ROYAL') ? 65 : 25;

    const trueMargin = avgSellingPrice - product.cost_price - avgPaymentFee - avgDeliveryCost - avgReturnCost - avgDiscount - packagingCost;
    const marginPct = avgSellingPrice > 0 ? (trueMargin / avgSellingPrice) * 100 : 0;

    const totalContribution = trueMargin * totalUnits;
    const isLosingMoney = trueMargin < 0;

    let primaryLossDriver: string | undefined;
    if (isLosingMoney) {
      if (avgDeliveryCost > (avgSellingPrice - product.cost_price)) {
        primaryLossDriver = 'High Shipping / Heavy Logistics Cost';
      } else if (avgDiscount > 0) {
        primaryLossDriver = 'Excessive Promotional Discount';
      } else {
        primaryLossDriver = 'High Base Product Cost vs Retail Price';
      }
    }

    return {
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      selling_price: avgSellingPrice,
      cost_price: product.cost_price,
      payment_fee_avg: Math.round(avgPaymentFee * 100) / 100,
      delivery_cost_avg: avgDeliveryCost,
      return_cost_avg: Math.round(avgReturnCost * 100) / 100,
      discount_avg: Math.round(avgDiscount * 100) / 100,
      packaging_cost: packagingCost,
      true_contribution_margin: Math.round(trueMargin * 100) / 100,
      contribution_margin_pct: Math.round(marginPct * 10) / 10,
      total_units_sold: totalUnits,
      total_revenue: Math.round(totalRevenue),
      total_actual_contribution: Math.round(totalContribution),
      is_losing_money: isLosingMoney,
      primary_loss_driver: primaryLossDriver,
    };
  });

  return summaries.sort((a, b) => b.total_actual_contribution - a.total_actual_contribution);
}

