import { store } from '../db/mock_store';
import {
  Business,
  Product,
  Supplier,
  Customer,
  Sale,
  Transaction,
  Expense,
  Receivable,
  Payable,
  InventoryEvent,
  RiskEvent
} from '../db/types';

export function seedSyntheticDemoBusiness(): { businessId: string; ownerId: string } {
  store.reset();

  const ownerId = 'usr_rukmini_01';
  const businessId = 'biz_rukmini_store';

  // 1. Create User
  store.users.push({
    id: ownerId,
    email: 'rukmini@kirana.store',
    name: 'Rukmini Devi',
    role: 'owner',
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 2. Create Business
  store.businesses.push({
    id: businessId,
    name: "Rukmini's Kirana & General Store",
    category: 'retail',
    owner_user_id: ownerId,
    currency: 'INR',
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
  });

  // 3. Create Suppliers (including high concentration Shree Laxmi Wholesalers = 55%)
  const suppliers: Supplier[] = [
    {
      id: 'sup_laxmi',
      business_id: businessId,
      name: 'Shree Laxmi Wholesalers Pvt Ltd',
      contact_info: '+91 98200 11223 (Distributor)',
      payment_terms_days: 30,
      created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    },
    {
      id: 'sup_apex',
      business_id: businessId,
      name: 'Apex FMCG Distributors',
      contact_info: '+91 98450 33445',
      payment_terms_days: 15,
      created_at: new Date(Date.now() - 150 * 86400000).toISOString(),
    },
    {
      id: 'sup_artisanal',
      business_id: businessId,
      name: 'Artisanal Home Crafts Co.',
      contact_info: '+91 97110 55667',
      payment_terms_days: 30,
      created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    },
  ];
  store.suppliers.push(...suppliers);

  // 4. Create Customers
  const customers: Customer[] = [
    { id: 'cust_01', business_id: businessId, name: 'Sharma Sweets & Caterers', contact_info: '+91 98111 00001', default_credit_terms_days: 30 },
    { id: 'cust_02', business_id: businessId, name: 'Green Valley Hotel', contact_info: '+91 98222 00002', default_credit_terms_days: 45 },
    { id: 'cust_03', business_id: businessId, name: 'Local Residential Association', contact_info: '+91 98333 00003', default_credit_terms_days: 15 },
    { id: 'cust_04', business_id: businessId, name: 'Ramesh Verma (Regular)', contact_info: '+91 98444 00004', default_credit_terms_days: 14 },
  ];
  store.customers.push(...customers);

  // 5. Products (15 SKUs, including 2 intentionally loss-making and 1 overstocked)
  const productsList: Array<{ id: string; name: string; sku: string; category: string; cost: number; price: number }> = [
    { id: 'prod_01', name: 'Fortune Sunflower Oil 5L', sku: 'OIL-5L-FORT', category: 'Staples', cost: 620, price: 710 },
    { id: 'prod_02', name: 'Aashirvaad Shuddh Chakki Atta 10kg', sku: 'ATTA-10K-AASH', category: 'Staples', cost: 380, price: 445 },
    { id: 'prod_03', name: 'Tata Salt Premium 1kg (Fast Mover)', sku: 'SALT-1K-TATA', category: 'Staples', cost: 21, price: 28 },
    { id: 'prod_04', name: 'Royal Heritage Extra Long Basmati 5kg (Loss Leader)', sku: 'RICE-5K-ROYAL', category: 'Premium Grain', cost: 890, price: 820 }, // LOSS MAKING!
    { id: 'prod_05', name: 'Organic Cold Pressed Olive Oil 1L (Loss Leader)', sku: 'OIL-1L-OLIVE', category: 'Gourmet', cost: 1150, price: 1050 }, // LOSS MAKING!
    { id: 'prod_06', name: 'Festive Decorative Brass Lamp Set (Overstocked)', sku: 'GIFT-BRASS-SET', category: 'Homeware', cost: 1400, price: 2100 }, // OVERSTOCKED!
    { id: 'prod_07', name: 'Surf Excel Easy Wash 3kg', sku: 'DETERGENT-3K', category: 'Household', cost: 390, price: 460 },
    { id: 'prod_08', name: 'Dabur Red Toothpaste 300g Combo', sku: 'PASTE-300G-DAB', category: 'Personal Care', cost: 135, price: 165 },
    { id: 'prod_09', name: 'Cadbury Celebrations Gift Pack 180g', sku: 'CHOC-180G-CAD', category: 'Confectionery', cost: 145, price: 190 },
    { id: 'prod_10', name: 'Amul Butter 500g Pack', sku: 'BUTTER-500G-AMUL', category: 'Dairy', cost: 245, price: 275 },
    { id: 'prod_11', name: 'Taj Mahal Tea 500g', sku: 'TEA-500G-TAJ', category: 'Beverages', cost: 290, price: 345 },
    { id: 'prod_12', name: 'Nescafé Classic Instant Coffee 200g', sku: 'COFFEE-200G-NESC', category: 'Beverages', cost: 520, price: 610 },
    { id: 'prod_13', name: 'Maggi 2-Minute Noodles Family Pack 560g', sku: 'NOODLE-MAGGI-FAM', category: 'Packaged Food', cost: 105, price: 128 },
    { id: 'prod_14', name: 'Haldiram Bhujia Sev 1kg', sku: 'SNACK-1K-HALD', category: 'Packaged Food', cost: 220, price: 260 },
    { id: 'prod_15', name: 'Lizol Disinfectant Floor Cleaner 2L', sku: 'CLEAN-2L-LIZ', category: 'Household', cost: 310, price: 375 },
  ];

  for (const p of productsList) {
    store.products.push({
      id: p.id,
      business_id: businessId,
      name: p.name,
      sku: p.sku,
      category: p.category,
      cost_price: p.cost,
      selling_price: p.price,
      active: true,
      created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    });
  }

  // 6. Generate 6 Months of Historical Sales & Transactions
  const now = new Date();
  let totalPurchasesFromLaxmi = 0;
  let totalPurchasesOverall = 0;

  for (let i = 180; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const dateStr = date.toISOString();
    const dayOfWeek = date.getDay();

    // Daily retail sales (higher on weekends)
    const salesCount = dayOfWeek === 0 || dayOfWeek === 6 ? 12 : 7;
    for (let s = 0; s < salesCount; s++) {
      const prodIndex = (i + s * 3) % productsList.length;
      const product = productsList[prodIndex];
      const qty = Math.floor(Math.random() * 4) + 1;
      const paymentMethod = s % 3 === 0 ? 'upi' : s % 3 === 1 ? 'cash' : 'card';
      const customer = s % 4 === 0 ? customers[s % customers.length] : undefined;

      store.sales.push({
        id: `sale_${i}_${s}`,
        business_id: businessId,
        product_id: product.id,
        customer_id: customer?.id,
        quantity: qty,
        unit_price: product.price,
        discount_pct: product.id === 'prod_04' || product.id === 'prod_05' ? 5 : 0,
        payment_method: paymentMethod as any,
        sale_date: dateStr,
        return_flag: false,
      });

      // Income transaction
      const saleAmount = qty * product.price * (1 - (product.id === 'prod_04' ? 0.05 : 0));
      store.transactions.push({
        id: `txn_inc_${i}_${s}`,
        business_id: businessId,
        type: 'income',
        category: 'Sales',
        amount: Math.round(saleAmount),
        counterparty: customer ? customer.name : 'Walk-in Retail Customer',
        payment_method: paymentMethod as any,
        transaction_date: dateStr,
        source: 'system_generated',
      });
    }

    // Weekly inventory purchase orders
    if (i % 7 === 0) {
      // 55% spend goes to Shree Laxmi Wholesalers
      const supplier = i % 14 === 0 ? suppliers[0] : suppliers[1];
      const purchaseAmount = supplier.id === 'sup_laxmi' ? 68000 : 32000;

      totalPurchasesOverall += purchaseAmount;
      if (supplier.id === 'sup_laxmi') totalPurchasesFromLaxmi += purchaseAmount;

      store.inventory_events.push({
        id: `inv_pur_${i}`,
        business_id: businessId,
        product_id: productsList[i % productsList.length].id,
        event_type: 'purchase',
        quantity: 50,
        unit_cost: productsList[i % productsList.length].cost,
        event_date: dateStr,
        supplier_id: supplier.id,
      });

      store.transactions.push({
        id: `txn_exp_inv_${i}`,
        business_id: businessId,
        type: 'expense',
        category: 'Inventory Purchase',
        amount: purchaseAmount,
        counterparty: supplier.name,
        payment_method: 'bank_transfer',
        transaction_date: dateStr,
        source: 'import',
      });
    }
  }

  // 7. Seed 1 High-Amount Anomalous Transaction for Risk Graph (4.5 stddev anomaly)
  const anomalyDate = new Date(now.getTime() - 12 * 86400000).toISOString();
  store.transactions.push({
    id: 'txn_anomaly_285k',
    business_id: businessId,
    type: 'expense',
    category: 'Inventory Purchase',
    amount: 285000,
    counterparty: 'Shree Laxmi Wholesalers Pvt Ltd',
    payment_method: 'bank_transfer',
    transaction_date: anomalyDate,
    source: 'import',
  });

  // 8. Recurring Expenses (Rent, Salaries, Utilities)
  store.expenses.push(
    { id: 'exp_rent', business_id: businessId, category: 'Rent', amount: 35000, recurring: true, recurrence_interval: 'monthly', expense_date: new Date(now.getTime() - 10 * 86400000).toISOString() },
    { id: 'exp_salaries', business_id: businessId, category: 'Salaries', amount: 48000, recurring: true, recurrence_interval: 'monthly', expense_date: new Date(now.getTime() - 5 * 86400000).toISOString() },
    { id: 'exp_electricity', business_id: businessId, category: 'Utilities', amount: 6200, recurring: true, recurrence_interval: 'monthly', expense_date: new Date(now.getTime() - 15 * 86400000).toISOString() }
  );

  // 9. Receivables & Payables
  store.receivables.push(
    { id: 'rec_01', business_id: businessId, customer_id: 'cust_01', invoice_ref: 'INV-2026-089', amount: 42000, due_date: new Date(now.getTime() + 12 * 86400000).toISOString(), status: 'open' },
    { id: 'rec_02', business_id: businessId, customer_id: 'cust_02', invoice_ref: 'INV-2026-074', amount: 68000, due_date: new Date(now.getTime() - 8 * 86400000).toISOString(), status: 'overdue' },
    { id: 'rec_03', business_id: businessId, customer_id: 'cust_03', invoice_ref: 'INV-2026-092', amount: 15500, due_date: new Date(now.getTime() + 20 * 86400000).toISOString(), status: 'open' }
  );

  store.payables.push(
    { id: 'pay_01', business_id: businessId, supplier_id: 'sup_laxmi', invoice_ref: 'PO-LAX-4421', amount: 85000, due_date: new Date(now.getTime() + 14 * 86400000).toISOString(), status: 'open' },
    { id: 'pay_02', business_id: businessId, supplier_id: 'sup_apex', invoice_ref: 'PO-APX-8802', amount: 24000, due_date: new Date(now.getTime() + 5 * 86400000).toISOString(), status: 'open' }
  );

  // 10. Seed Risk Graph Event
  store.risk_events.push({
    id: 'risk_laxmi_concentration',
    business_id: businessId,
    entity_type: 'supplier',
    entity_id: 'sup_laxmi',
    rule_triggered: 'Supplier Concentration Risk (>40% total purchase spend)',
    severity: 'high',
    evidence: {
      supplier_name: 'Shree Laxmi Wholesalers Pvt Ltd',
      concentration_pct: 57.4,
      threshold_pct: 40.0,
      total_spend: totalPurchasesOverall + 285000,
      supplier_spend: totalPurchasesFromLaxmi + 285000,
    },
    status: 'open',
    created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
  });

  store.risk_events.push({
    id: 'risk_anomaly_txn',
    business_id: businessId,
    entity_type: 'transaction',
    entity_id: 'txn_anomaly_285k',
    rule_triggered: 'Unusual Transaction Value (>4.0 Standard Deviations from Counterparty Average)',
    severity: 'critical',
    evidence: {
      amount: 285000,
      counterparty_average: 68000,
      std_deviations: 4.52,
      counterparty: 'Shree Laxmi Wholesalers Pvt Ltd',
    },
    status: 'open',
    created_at: anomalyDate,
  });

  return { businessId, ownerId };
}
