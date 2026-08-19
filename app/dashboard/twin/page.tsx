'use client';

import { useEffect, useState } from 'react';
import { Cpu, DollarSign, ShoppingBag, Activity } from 'lucide-react';

export default function DigitalTwinPage() {
  const [twin, setTwin] = useState<any>(null);

  useEffect(() => {
    fetch('/api/business/biz_rukmini_store/digital-twin')
      .then(r => r.json())
      .then(setTwin);
  }, []);

  if (!twin) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Digital Twin State...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" /> Merchant Digital Twin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Living state representation of Money, Commerce, and Behavior models.
          </p>
        </div>
        <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono">
          State Version v{twin.version}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Money State */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <DollarSign className="w-4 h-4" /> Money Model
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Cash Balance:</span>
              <span className="font-bold text-white">₹{twin.money.cash_balance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Revenue (6-Mo):</span>
              <span className="font-semibold text-white">₹{twin.money.total_revenue_ytd.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Open Receivables:</span>
              <span className="font-semibold text-emerald-400">₹{twin.money.open_receivables.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Open Payables:</span>
              <span className="font-semibold text-rose-400">₹{twin.money.open_payables.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Commerce State */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4" /> Commerce Model
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Active SKUs:</span>
              <span className="font-bold text-white">{twin.commerce.active_skus_count} SKUs</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Inventory Value:</span>
              <span className="font-semibold text-white">₹{twin.commerce.total_inventory_value.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Top Supplier Spend:</span>
              <span className="font-semibold text-amber-400">{twin.commerce.top_supplier_spend_pct}%</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Overstocked Items:</span>
              <span className="font-semibold text-amber-300">{twin.commerce.overstocked_skus_count} SKUs</span>
            </div>
          </div>
        </div>

        {/* Behavior State */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Activity className="w-4 h-4" /> Behavior Model
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Cust. Payment Delay:</span>
              <span className="font-bold text-white">{twin.behavior.average_customer_payment_delay_days} Days</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Supplier Payment Terms:</span>
              <span className="font-semibold text-white">{twin.behavior.average_supplier_payment_terms_days} Days</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-950">
              <span className="text-slate-400">Order Return Rate:</span>
              <span className="font-semibold text-white">{twin.behavior.order_return_rate_pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
