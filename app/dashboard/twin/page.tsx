'use client';

import { useEffect, useState } from 'react';
import {
  Cpu,
  DollarSign,
  ShoppingBag,
  Activity,
  Sliders,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { DigitalTwinSnapshot } from '@/lib/engines/digital_twin';

export default function DigitalTwinPage() {
  const [twin, setTwin] = useState<DigitalTwinSnapshot | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // Calibration Form State
  const [cashAdj, setCashAdj] = useState('0');
  const [customerDelay, setCustomerDelay] = useState('14');
  const [supplierTerms, setSupplierTerms] = useState('30');

  const fetchTwin = () => {
    fetch('/api/business/biz_rukmini_store/digital-twin')
      .then((r) => r.json())
      .then((data) => {
        setTwin(data);
        if (data?.behavior) {
          setCustomerDelay(String(data.behavior.average_customer_payment_delay_days || 14));
          setSupplierTerms(String(data.behavior.average_supplier_payment_terms_days || 30));
        }
      });
  };

  useEffect(() => {
    fetchTwin();
  }, []);

  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/business/biz_rukmini_store/digital-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cash_adjustment: Number(cashAdj),
          customer_delay_days: Number(customerDelay),
          supplier_terms_days: Number(supplierTerms),
        }),
      });
      const data = await res.json();
      if (data.twin) {
        setTwin(data.twin);
        setSavedMsg('Twin state re-calibrated & engines updated!');
        setTimeout(() => {
          setSavedMsg('');
          setIsCalibrating(false);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!twin) {
    return (
      <div className="p-8 text-center text-slate-400 animate-pulse text-xs font-medium">
        Loading Digital Twin State...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" /> Merchant Digital Twin
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Living state representation of Money, Commerce, and Behavior models.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 font-mono shadow-2xs font-semibold">
            State v{twin.version}
          </span>
          <button
            onClick={() => setIsCalibrating(true)}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" /> Calibrate Twin
          </button>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Money Model */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" /> Money Model
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Cash Balance:</span>
              <span className="font-extrabold text-slate-900">₹{twin.money.cash_balance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Revenue (YTD):</span>
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
            <div className="flex justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <span className="text-emerald-800 font-bold">Net Working Capital:</span>
              <span className="font-black text-emerald-900">₹{twin.money.net_working_capital.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Commerce Model */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-teal-700 uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-teal-600 shrink-0" /> Commerce Model
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Active
            </span>
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
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Key Supplier</span>
              <span className="font-bold text-slate-900 truncate block">{twin.commerce.top_supplier_name}</span>
            </div>
          </div>
        </div>

        {/* Behavior Model */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-700 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-cyan-600 shrink-0" /> Behavior Model
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Cust. Payment Delay:</span>
              <span className="font-bold text-slate-900">{twin.behavior.average_customer_payment_delay_days} Days</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Supplier Terms:</span>
              <span className="font-semibold text-slate-900">{twin.behavior.average_supplier_payment_terms_days} Days</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Order Return Rate:</span>
              <span className="font-semibold text-slate-900">{twin.behavior.order_return_rate_pct}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-900">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Continuous Calibration
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">
                Every imported bill & entry recalculates the twin state in real-time.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calibration Modal */}
      {isCalibrating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                <Sliders className="w-4 h-4 text-emerald-600" /> Calibrate Digital Twin
              </div>
              <button
                onClick={() => setIsCalibrating(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {savedMsg}
              </div>
            )}

            <form onSubmit={handleSaveCalibration} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Cash Balance Manual Adjustment (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={cashAdj}
                  onChange={(e) => setCashAdj(e.target.value)}
                  placeholder="e.g. +50000 or -20000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">Offset adjustment to match bank statement</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Customer Credit Payment Delay (Days)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={customerDelay}
                  onChange={(e) => setCustomerDelay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Supplier Credit Payment Terms (Days)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={supplierTerms}
                  onChange={(e) => setSupplierTerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCalibrating(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  {saving ? 'Re-calibrating...' : 'Save & Recompute Twin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

