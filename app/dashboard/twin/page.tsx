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
    return <div className="p-8 text-center text-slate-400 animate-pulse text-xs">Loading Digital Twin State...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-600" /> Merchant Digital Twin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Living state representation of Money, Commerce, and Behavior models.
          </p>
        </div>
        <span className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-mono shadow-xs font-semibold">
          State Version v{twin.version}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Money Model
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Cash Balance:</span>
              <span className="font-bold text-slate-900">₹{twin.money.cash_balance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Revenue (6-Mo):</span>
              <span className="font-semibold text-slate-900">₹{twin.money.total_revenue_ytd.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Open Receivables:</span>
              <span className="font-bold text-emerald-700">₹{twin.money.open_receivables.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Open Payables:</span>
              <span className="font-bold text-rose-600">₹{twin.money.open_payables.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>


        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-teal-700 uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4 text-teal-600" /> Commerce Model
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Active SKUs:</span>
              <span className="font-bold text-slate-900">{twin.commerce.active_skus_count} SKUs</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Inventory Value:</span>
              <span className="font-semibold text-slate-900">₹{twin.commerce.total_inventory_value.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Top Supplier Spend:</span>
              <span className="font-bold text-amber-700">{twin.commerce.top_supplier_spend_pct}%</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Overstocked Items:</span>
              <span className="font-bold text-amber-700">{twin.commerce.overstocked_skus_count} SKUs</span>
            </div>
          </div>
        </div>


        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-700 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-cyan-600" /> Behavior Model
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Cust. Payment Delay:</span>
              <span className="font-bold text-slate-900">{twin.behavior.average_customer_payment_delay_days} Days</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Supplier Payment Terms:</span>
              <span className="font-semibold text-slate-900">{twin.behavior.average_supplier_payment_terms_days} Days</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Order Return Rate:</span>
              <span className="font-semibold text-slate-900">{twin.behavior.order_return_rate_pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
