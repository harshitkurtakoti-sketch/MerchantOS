'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Database, Upload, FileSpreadsheet, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("Rukmini's Kirana & General Store");
  const [category, setCategory] = useState('retail');
  const [loading, setLoading] = useState(false);

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white">Setup MerchantOS Twin</h1>
            <p className="text-xs text-slate-400 mt-1">Configure business profile & select data initialization</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Step {step} of 2
          </span>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Business Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Business Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="retail">Retail / Kirana / General Store</option>
                <option value="d2c">D2C / E-Commerce Brand</option>
                <option value="msme_manufacturing">MSME Manufacturing / Distribution</option>
                <option value="msme_services">MSME Professional Services</option>
              </select>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              Continue to Data Selection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">Select Data Initialization Source:</h2>

            <button
              onClick={handleSeedDemo}
              disabled={loading}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/40 hover:border-emerald-500 text-left transition-all group flex items-start justify-between"
            >
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Load Demo Dataset (Rukmini's Store)
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Pre-populates 6 months of realistic transactions, 15 SKUs, supplier concentration anomaly, and overdue receivables.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
            </button>

            <button
              onClick={() => router.push('/dashboard/import')}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Import CSV / XLSX Files</div>
                <p className="text-xs text-slate-400 mt-1">Upload your own transaction, sales, and inventory exports with field mapping.</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Start Manual Entry</div>
                <p className="text-xs text-slate-400 mt-1">Enter your initial cash balance, products, and recurring expenses manually.</p>
              </div>
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 text-center block mt-4"
            >
              ← Back to Business Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
