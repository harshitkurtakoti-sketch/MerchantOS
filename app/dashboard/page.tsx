'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  DollarSign,
  Layers,
  LineChart,
  ShoppingBag
} from 'lucide-react';

export default function CommandCenter() {
  const router = useRouter();
  const [health, setHealth] = useState<any>(null);
  const [twin, setTwin] = useState<any>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [aiInput, setAiInput] = useState('');

  useEffect(() => {
    fetch('/api/demo/seed', { method: 'POST' }).then(() => {
      fetch('/api/business/biz_rukmini_store/financial-health').then(r => r.json()).then(setHealth);
      fetch('/api/business/biz_rukmini_store/digital-twin').then(r => r.json()).then(setTwin);
      fetch('/api/business/biz_rukmini_store/risk').then(r => r.json()).then(d => setRisks(d.risk_events || []));
    });
  }, []);

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    router.push(`/dashboard/agent?q=${encodeURIComponent(aiInput)}`);
  };

  if (!health || !twin) {
    return (
      <div className="p-8 text-center text-slate-400 animate-pulse text-xs font-medium">
        Initializing Merchant Digital Twin & Loading Command Center...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 border border-emerald-200/80 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" /> AI Decision Assistant
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">"Can I afford ₹3 Lakhs of inventory?"</h1>
            <p className="text-xs text-slate-600 mt-1">Ask any financial question — MerchantOS simulates the impact before you act.</p>
          </div>

          <form onSubmit={handleAskAI} className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Ask a financial decision question..."
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              className="w-full md:w-80 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-xs"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1 shrink-0"
            >
              Ask <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" /> Business Health Score
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              {health.confidence} Confidence
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-900">{health.score}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-auto">
              Healthy
            </span>
          </div>

          <div className="space-y-1.5 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Cash Stability</span>
              <span className="text-slate-900 font-bold">{health.sub_scores.cash_stability}/100</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Profitability</span>
              <span className="text-slate-900 font-bold">{health.sub_scores.profitability}/100</span>
            </div>
          </div>

          <Link href="/dashboard/health" className="text-xs text-emerald-700 hover:text-emerald-800 font-bold mt-4 flex items-center gap-1">
            View full breakdown <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" /> Cash & Working Capital
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Current Balance</span>
          </div>

          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">₹{twin.money.cash_balance.toLocaleString('en-IN')}</div>
            <div className="text-xs text-slate-500 mt-1">
              Net Working Capital: <span className="text-emerald-700 font-extrabold">₹{twin.money.net_working_capital.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Open Receivables</div>
              <div className="text-slate-900 font-bold mt-0.5">₹{twin.money.open_receivables.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Open Payables</div>
              <div className="text-slate-900 font-bold mt-0.5">₹{twin.money.open_payables.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <Link href="/dashboard/time-machine" className="text-xs text-emerald-700 hover:text-emerald-800 font-bold mt-4 flex items-center gap-1">
            Open Financial Time Machine <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Active Risk Flags
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
              {risks.length} Requires Review
            </span>
          </div>

          <div className="space-y-2 my-2">
            {risks.slice(0, 2).map((r, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs">
                <div className="font-bold text-amber-900">{r.rule_triggered}</div>
                <div className="text-[11px] text-amber-800/80 mt-0.5">{r.evidence.phrasing_template || 'Review recommended.'}</div>
              </div>
            ))}
          </div>

          <Link href="/dashboard/risk" className="text-xs text-amber-700 hover:text-amber-800 font-bold mt-4 flex items-center gap-1">
            Review all risk events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Time Machine', desc: '90-Day Cash Horizon', href: '/dashboard/time-machine', icon: LineChart },
          { label: 'Scenario Simulator', desc: 'Run What-If Models', href: '/dashboard/scenarios', icon: Layers },
          { label: 'Commerce Intelligence', desc: 'True Product Margins', href: '/dashboard/commerce', icon: ShoppingBag },
          { label: 'Reverse Loan Simulator', desc: 'Evaluate Loan Impact', href: '/dashboard/loan-simulator', icon: TrendingUp },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{item.label}</div>
                <div className="text-[10px] text-slate-500">{item.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

