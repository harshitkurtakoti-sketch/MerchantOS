'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, AlertCircle, Sparkles, TrendingUp, CheckCircle2, ArrowRight, PackageCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ProductMarginSummary } from '@/lib/engines/commerce';
import { ProcurementRecommendation } from '@/lib/engines/procurement';

export default function CommerceIntelligencePage() {
  const [products, setProducts] = useState<ProductMarginSummary[]>([]);
  const [procurement, setProcurement] = useState<{
    total_capital_recommended: number;
    total_projected_profit: number;
    recommendations: ProcurementRecommendation[];
  } | null>(null);

  useEffect(() => {
    fetch('/api/business/biz_rukmini_store/commerce/profitability')
      .then(r => r.json())
      .then(d => setProducts(d.products || []));

    fetch('/api/business/biz_rukmini_store/procurement')
      .then(r => r.json())
      .then(setProcurement);
  }, []);

  const losingProducts = products.filter(p => p.is_losing_money);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" /> Commerce Intelligence & Smart Buying Advisor
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Expose true product profitability and discover the most profitable inventory items to restock right now with evidence references.
        </p>
      </div>

      {/* Smart Purchasing Advisor Section */}
      {procurement && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  AI & Engine Procurement
                </span>
                <span className="text-xs text-slate-300">Supplier: Shree Laxmi Wholesalers</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Best Items to Purchase Right Now
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Recommended Spend</div>
                <div className="font-extrabold text-emerald-300 text-sm">₹{procurement.total_capital_recommended.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Est. Net Profit</div>
                <div className="font-extrabold text-teal-300 text-sm">+₹{procurement.total_projected_profit.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {procurement.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  rec.priority_score === 'HIGH_PRIORITY'
                    ? 'bg-emerald-900/30 border-emerald-500/40 hover:border-emerald-400'
                    : rec.priority_score === 'OPPORTUNITY'
                    ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    : rec.priority_score === 'AVOID_RESTOCKING'
                    ? 'bg-rose-950/30 border-rose-800/40 opacity-75'
                    : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">{rec.product_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rec.sku}</div>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-extrabold shrink-0 ${
                        rec.priority_score === 'HIGH_PRIORITY'
                          ? 'bg-emerald-500 text-slate-950'
                          : rec.priority_score === 'OPPORTUNITY'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : rec.priority_score === 'AVOID_RESTOCKING'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {rec.priority_score.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{rec.buying_rationale}</p>

                  <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-white/10 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-black/20">
                      <div className="text-[9px] text-slate-400">Order Qty</div>
                      <div className="font-bold text-white text-xs">{rec.recommended_order_quantity} pcs</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/20">
                      <div className="text-[9px] text-slate-400">Capital</div>
                      <div className="font-bold text-emerald-300 text-xs">₹{rec.total_investment_required.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/20">
                      <div className="text-[9px] text-slate-400">Net Profit</div>
                      <div className={`font-bold text-xs ${rec.projected_net_profit >= 0 ? 'text-teal-300' : 'text-rose-300'}`}>
                        +₹{rec.projected_net_profit.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>True Unit Margin: <strong className="text-emerald-400">₹{rec.true_margin_per_unit} ({rec.margin_pct}%)</strong></span>
                    <span>ROI: <strong className="text-teal-400">+{rec.roi_pct}%</strong></span>
                  </div>
                </div>

                {rec.priority_score !== 'AVOID_RESTOCKING' ? (
                  <Link
                    href={`/dashboard/scenarios?inv=${rec.total_investment_required}`}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm text-center"
                  >
                    Simulate Purchase in Scenarios <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <div className="text-[10px] text-rose-300 text-center py-1 font-semibold flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Do Not Restock Until Cost Normalized
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {losingProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-extrabold text-rose-900">
              {losingProducts.length} Product(s) Currently Losing Money Per Order
            </div>
            <div className="text-xs text-rose-800 mt-0.5">
              These SKUs appear profitable on gross price minus product cost, but produce negative net contribution when payment fees, shipping, and packaging are deducted.
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">SKU Net Contribution Ranking</span>
          <span className="text-xs text-slate-500 font-medium">{products.length} Active SKUs Analyzed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
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
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.map((p, idx) => (
                <tr key={idx} className={`hover:bg-slate-50/60 ${p.is_losing_money ? 'bg-rose-50/40' : ''}`}>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {p.name}
                      {p.is_losing_money && (
                        <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-extrabold">
                          Losing Money
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                  <td className="py-3.5 px-4 text-slate-800">₹{p.selling_price}</td>
                  <td className="py-3.5 px-4 text-slate-600">₹{p.cost_price}</td>
                  <td className="py-3.5 px-4 text-slate-600">₹{p.payment_fee_avg + p.delivery_cost_avg + p.packaging_cost}</td>
                  <td className={`py-3.5 px-4 font-extrabold ${p.true_contribution_margin >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ₹{p.true_contribution_margin} ({p.contribution_margin_pct}%)
                  </td>
                  <td className="py-3.5 px-4 text-slate-800">{p.total_units_sold}</td>
                  <td className={`py-3.5 px-4 font-extrabold ${p.total_actual_contribution >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
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

