'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Cpu, LineChart, Layers, Zap, CheckCircle2, Award } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Cpu className="w-5 h-5 text-white font-bold" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Merchant<span className="text-emerald-600">OS</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Command Center
            </Link>
            <Link
              href="/onboarding"
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 shadow-md shadow-slate-900/10 flex items-center gap-1.5"
            >
              Try Demo Business <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-[#FAFAFC]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600" /> AI Recommends. Simulation Proves. Human Decides.
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-6">
            Before your business makes a decision, <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 bg-clip-text text-transparent">
              simulate its financial future.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            MerchantOS builds a living <span className="text-slate-900 font-semibold">digital twin</span> of your small business and lets you test inventory purchases, pricing changes, credit terms, and working-capital loans <span className="text-slate-900 font-semibold">before committing real capital</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all duration-200 shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              Launch Interactive Simulation <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold text-base transition-all duration-200 shadow-sm"
            >
              View Rukmini's Store (Demo)
            </Link>
          </div>

          {/* Loop Visualization */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { step: '01. ASK', desc: 'Plain language business questions' },
              { step: '02. SIMULATE', desc: 'Deterministic 90-day cash twin' },
              { step: '03. EXPLAIN', desc: 'Traceable evidence & source_ref' },
              { step: '04. ACT', desc: 'Human-approved capital execution' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-left">
                <div className="text-xs font-extrabold text-emerald-700 tracking-wider mb-1">{item.step}</div>
                <div className="text-xs text-slate-600 font-medium">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Seven Deterministic Engines. Zero AI Hallucination.</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm leading-relaxed">
            Every score, cash projection, and risk alert is calculated strictly by audited TypeScript math models. The AI layer explains tool outputs — it never invents numbers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Financial Time Machine',
              desc: 'Project cash trajectories 30, 60, 90, or 180 days forward with confidence bands and automated cash-stress dip alerts.',
              icon: LineChart,
              badge: 'Visual Simulation',
            },
            {
              title: 'Scenario / What-If Engine',
              desc: 'Adjust 13+ sliders (sales, discounts, prices, inventory, terms, loans) and see side-by-side propagated impact.',
              icon: Layers,
              badge: 'Deterministic Math',
            },
            {
              title: 'True Contribution Margin',
              desc: 'Expose exact per-SKU net profitability after payment fees, shipping, return costs, discounts, and packaging.',
              icon: ShieldCheck,
              badge: 'Commerce Intelligence',
            },
          ].map((feat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                <feat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mb-2 inline-block border border-emerald-200">
                {feat.badge}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>MerchantOS Prototype v1.0 — Built for Small Business Decision Support. All figures based on demo data.</p>
      </footer>
    </div>
  );
}
