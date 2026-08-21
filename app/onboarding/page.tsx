'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Database, Upload, FileSpreadsheet, ArrowRight, CheckCircle, Sparkles, Phone } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex items-center justify-center p-6 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-xl w-full bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Setup MerchantOS Twin</h1>
            <p className="text-xs text-slate-500 mt-1">Configure business profile & select data initialization</p>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
          >
            <Phone className="w-3 h-3 text-emerald-600" /> Phone OTP
          </Link>
        </div>


        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Business Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Business Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              >
                <option value="retail">Retail / Kirana / General Store</option>
                <option value="d2c">D2C / E-Commerce Brand</option>
                <option value="msme_manufacturing">MSME Manufacturing / Distribution</option>
                <option value="msme_services">MSME Professional Services</option>
              </select>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              Continue to Data Selection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Data Initialization Source:</h2>

            <button
              onClick={handleSeedDemo}
              disabled={loading}
              className="w-full p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-500 text-left transition-all group flex items-start justify-between shadow-xs"
            >
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Load Demo Dataset (Rukmini's Store)
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Pre-populates 6 months of realistic transactions, 15 SKUs, supplier concentration anomaly, and overdue receivables.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
            </button>

            <button
              onClick={() => router.push('/dashboard/import')}
              className="w-full p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-all flex items-start gap-3 shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Import CSV / XLSX Files</div>
                <p className="text-xs text-slate-500 mt-1">Upload your own transaction, sales, and inventory exports with field mapping.</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-all flex items-start gap-3 shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Start Manual Entry</div>
                <p className="text-xs text-slate-500 mt-1">Enter your initial cash balance, products, and recurring expenses manually.</p>
              </div>
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 text-center block mt-4 font-medium"
            >
              ← Back to Business Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
