'use client';

import { useEffect, useState } from 'react';
import { Layers, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScenarioResultSnapshot } from '@/lib/db/types';

export default function ScenariosPage() {
  const [salesPct, setSalesPct] = useState(0);
  const [pricePct, setPricePct] = useState(0);
  const [inventoryPurchase, setInventoryPurchase] = useState(0);
  const [discountPct, setDiscountPct] = useState(0);
  const [mktgSpend, setMktgSpend] = useState(0);
  const [opexPct, setOpexPct] = useState(0);

  const [res, setRes] = useState<ScenarioResultSnapshot | null>(null);

  const runSimulation = () => {
    fetch('/api/business/biz_rukmini_store/scenarios/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sales_change_pct: salesPct,
        price_change_pct: pricePct,
        inventory_purchase_amount: inventoryPurchase,
        discount_depth_pct: discountPct,
        marketing_spend: mktgSpend,
        opex_change_pct: opexPct,
      }),
    })
      .then(r => r.json())
      .then(setRes);
  };

  useEffect(() => {
    runSimulation();
  }, [salesPct, pricePct, inventoryPurchase, discountPct, mktgSpend, opexPct]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" /> Scenario / What-If Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Test business decisions deterministically before committing real capital.
          </p>
        </div>

        <button
          onClick={() => {
            setSalesPct(0);
            setPricePct(0);
            setInventoryPurchase(0);
            setDiscountPct(0);
            setMktgSpend(0);
            setOpexPct(0);
          }}
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 hover:text-slate-900 font-semibold shadow-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset All Sliders
        </button>
      </div>


      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Adjustable Decision Assumptions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Sales Volume Change (%)</span>
              <span className="font-extrabold text-emerald-700">{salesPct}%</span>
            </div>
            <input type="range" min="-50" max="50" value={salesPct} onChange={e => setSalesPct(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Inventory Purchase (₹)</span>
              <span className="font-extrabold text-amber-700">₹{inventoryPurchase.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="0" max="500000" step="25000" value={inventoryPurchase} onChange={e => setInventoryPurchase(Number(e.target.value))} className="w-full accent-amber-600 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Price Change (%)</span>
              <span className="font-extrabold text-teal-700">{pricePct}%</span>
            </div>
            <input type="range" min="-20" max="30" value={pricePct} onChange={e => setPricePct(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Discount Depth (%)</span>
              <span className="font-extrabold text-rose-700">{discountPct}%</span>
            </div>
            <input type="range" min="0" max="30" value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} className="w-full accent-rose-600 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Marketing Spend (₹)</span>
              <span className="font-extrabold text-emerald-700">₹{mktgSpend.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="0" max="100000" step="5000" value={mktgSpend} onChange={e => setMktgSpend(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">OpEx Change (%)</span>
              <span className="font-extrabold text-slate-700">{opexPct}%</span>
            </div>
            <input type="range" min="-20" max="40" value={opexPct} onChange={e => setOpexPct(Number(e.target.value))} className="w-full accent-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>


      {res?.warning_notes && res.warning_notes.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1 shadow-xs">
          {res.warning_notes.map((w, i) => (
            <div key={i} className="text-xs font-semibold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}


      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Deterministic Propagated Impact Matrix</span>
          <span className={`text-xs px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
            res?.risk_level === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
            res?.risk_level === 'Medium' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
            'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            Risk Level: {res?.risk_level || 'Low'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="py-3 px-4">Financial Metric</th>
                <th className="py-3 px-4">Current State</th>
                <th className="py-3 px-4">Scenario State</th>
                <th className="py-3 px-4">Difference</th>
                <th className="py-3 px-4">% Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {res && [
                { label: 'Revenue (Quarterly)', data: res.revenue },
                { label: 'Gross Profit', data: res.gross_profit },
                { label: 'Net Profit', data: res.net_profit },
                { label: 'End Cash (90d)', data: res.end_cash },
                { label: 'Min Cash (90d)', data: res.min_cash },
                { label: 'Inventory Value', data: res.inventory_val },
                { label: 'Receivables', data: res.receivables },
                { label: 'Payables', data: res.payables },
                { label: 'Net Margin %', data: res.margin_pct, isPct: true },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 text-slate-900 font-bold">{row.label}</td>
                  <td className="py-3.5 px-4 text-slate-600">{row.isPct ? `${row.data.current}%` : `₹${row.data.current.toLocaleString('en-IN')}`}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-extrabold">{row.isPct ? `${row.data.scenario}%` : `₹${row.data.scenario.toLocaleString('en-IN')}`}</td>
                  <td className={`py-3.5 px-4 font-extrabold ${row.data.diff >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {row.data.diff > 0 ? `+${row.data.diff.toLocaleString('en-IN')}` : row.data.diff.toLocaleString('en-IN')}
                  </td>
                  <td className={`py-3.5 px-4 font-extrabold ${row.data.pct_change >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {row.data.pct_change > 0 ? `+${row.data.pct_change}%` : `${row.data.pct_change}%`}
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
