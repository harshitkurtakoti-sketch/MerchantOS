'use client';

import { useEffect, useState } from 'react';
import { HeartPulse, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export default function FinancialHealthPage() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch('/api/business/biz_rukmini_store/financial-health')
      .then(r => r.json())
      .then(setHealth);
  }, []);

  if (!health) {
    return <div className="p-8 text-center text-slate-400 animate-pulse text-xs">Calculating Business Health Score...</div>;
  }

  const subItems = [
    { key: 'cash_stability', name: 'Cash Stability Score', weight: '25%', score: health.sub_scores.cash_stability, desc: 'Target: 30 days operating expense cash buffer.' },
    { key: 'profitability', name: 'Profitability Score', weight: '20%', score: health.sub_scores.profitability, desc: 'Target: 15% net profit margin baseline.' },
    { key: 'customer_payment_reliability', name: 'Customer Payment Reliability', weight: '20%', score: health.sub_scores.customer_payment_reliability, desc: 'Percentage of on-time vs overdue customer receivables.' },
    { key: 'inventory_efficiency', name: 'Inventory Efficiency', weight: '20%', score: health.sub_scores.inventory_efficiency, desc: 'Balanced stock turnover rate avoiding overstocking.' },
    { key: 'supplier_dependency', name: 'Supplier Dependency (Inverted)', weight: '15%', score: health.sub_scores.supplier_dependency, desc: 'Single supplier spend concentration risk score.' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-emerald-600" /> Financial Health Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          A single explainable 0–100 score summarizing business health, backed by audited sub-scores.
        </p>
      </div>

      {/* Main Score Hero */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-emerald-50/50 border-4 border-emerald-500 shadow-lg shadow-emerald-500/10">
            <div className="text-center">
              <span className="text-4xl font-black text-slate-900">{health.score}</span>
              <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Status: Healthy (≥75)
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Overall Business Health</h2>
            <p className="text-xs text-slate-500 mt-1">
              Calculated across 180 days of verified transaction and commerce data.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 w-full md:w-64">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Confidence Rating:</span>
            <span className="font-bold text-emerald-700">{health.confidence}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">History Window:</span>
            <span className="font-bold text-slate-900">{health.history_days} Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Sub-Score Formula:</span>
            <span className="font-semibold text-slate-700">Audited Math</span>
          </div>
        </div>
      </div>

      {/* Sub-Score Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Weighted Sub-Score Breakdown</h3>

        <div className="grid grid-cols-1 gap-3">
          {subItems.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {item.weight}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200 hidden sm:block">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.score}%` }} />
                </div>
                <span className="text-base font-black text-slate-900 w-12 text-right">{item.score}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
