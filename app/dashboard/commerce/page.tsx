'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, AlertCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ProductMarginSummary } from '@/lib/engines/commerce';

export default function CommerceIntelligencePage() {
  const [products, setProducts] = useState<ProductMarginSummary[]>([]);

  useEffect(() => {
    fetch('/api/business/biz_rukmini_store/commerce/profitability')
      .then(r => r.json())
      .then(d => setProducts(d.products || []));
  }, []);

  const losingProducts = products.filter(p => p.is_losing_money);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-400" /> Commerce Intelligence & True Contribution Margin
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Expose true product profitability after payment fees, logistics, expected returns, discounts, and packaging.
        </p>
      </div>

      {/* Losing Money Warning Banner */}
      {losingProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-rose-300">
              {losingProducts.length} Product(s) Currently Losing Money Per Order
            </div>
            <div className="text-xs text-rose-200/80 mt-0.5">
              These SKUs appear profitable on gross price minus product cost, but produce negative net contribution when payment fees, shipping, and packaging are deducted.
            </div>
          </div>
        </div>
      )}

      {/* Product Profitability Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">SKU Net Contribution Ranking</span>
          <span className="text-xs text-slate-400">{products.length} Active SKUs Analyzed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Product Cost</th>
                <th className="py-3 px-4">Fees & Logistics</th>
                <th className="py-3 px-4">True Margin / Unit</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Total Net Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {products.map((p, idx) => (
                <tr key={idx} className={`hover:bg-slate-950/40 ${p.is_losing_money ? 'bg-rose-950/10' : ''}`}>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      {p.name}
                      {p.is_losing_money && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                          Losing Money
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                  <td className="py-3.5 px-4 text-slate-300">₹{p.selling_price}</td>
                  <td className="py-3.5 px-4 text-slate-400">₹{p.cost_price}</td>
                  <td className="py-3.5 px-4 text-slate-400">₹{p.payment_fee_avg + p.delivery_cost_avg + p.packaging_cost}</td>
                  <td className={`py-3.5 px-4 font-bold ${p.true_contribution_margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{p.true_contribution_margin} ({p.contribution_margin_pct}%)
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{p.total_units_sold}</td>
                  <td className={`py-3.5 px-4 font-bold ${p.total_actual_contribution >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{p.total_actual_contribution.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
