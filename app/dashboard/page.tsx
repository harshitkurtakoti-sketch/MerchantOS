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
    // Seed demo data if store empty
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
      <div className="p-8 text-center text-slate-500 animate-pulse text-sm">
        Initializing Merchant Digital Twin & Loading Command Center...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Ask MerchantOS AI Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> AI Decision Assistant
            </div>
            <h1 className="text-xl font-black text-white">"Can I afford ₹3 Lakhs of inventory?"</h1>
            <p className="text-xs text-slate-400 mt-1">Ask any financial question — MerchantOS simulates the impact before you act.</p>
          </div>

          <form onSubmit={handleAskAI} className="w-full md:w-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a financial decision question..."
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              className="w-full md:w-80 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shrink-0"
            >
              Ask <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Top 3 KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-400" /> Business Health Score
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
              {health.confidence} Confidence
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-5xl font-black text-white">{health.score}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
            <span className="text-xs font-bold text-emerald-400 ml-auto">Healthy</span>
          </div>

          <div className="space-y-1.5 mt-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Cash Stability</span>
              <span className="text-white font-semibold">{health.sub_scores.cash_stability}/100</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Profitability</span>
              <span className="text-white font-semibold">{health.sub_scores.profitability}/100</span>
            </div>
          </div>

          <Link href="/dashboard/health" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold mt-4 flex items-center gap-1">
            View full breakdown <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Money & Cash Snapshot */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Cash & Working Capital
            </span>
            <span className="text-[10px] text-slate-400">Current Balance</span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-black text-white">₹{twin.money.cash_balance.toLocaleString('en-IN')}</div>
            <div className="text-xs text-slate-400 mt-1">
              Net Working Capital: <span className="text-emerald-400 font-semibold">₹{twin.money.net_working_capital.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <div className="text-slate-500">Open Receivables</div>
              <div className="text-white font-semibold mt-0.5">₹{twin.money.open_receivables.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-slate-500">Open Payables</div>
              <div className="text-white font-semibold mt-0.5">₹{twin.money.open_payables.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <Link href="/dashboard/time-machine" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold mt-4 flex items-center gap-1">
            Open Financial Time Machine <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Active Risk Alerts */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Active Risk Flags
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">
              {risks.length} Requires Review
            </span>
          </div>

          <div className="space-y-2 my-2">
            {risks.slice(0, 2).map((r, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="font-semibold text-amber-300">{r.rule_triggered}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{r.evidence.phrasing_template || 'Review recommended.'}</div>
              </div>
            ))}
          </div>

          <Link href="/dashboard/risk" className="text-xs text-amber-400 hover:text-amber-300 font-semibold mt-4 flex items-center gap-1">
            Review all risk events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
