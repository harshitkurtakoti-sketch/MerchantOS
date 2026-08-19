'use client';

import { Settings, ShieldCheck, Users, Info } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" /> Settings & Prototype Boundary
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage business configuration, team access roles, and system boundaries.
        </p>
      </div>

      {/* Explicit Prototype Boundary Disclosure Box per PRD Section 18 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/30 border border-emerald-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Info className="w-4 h-4" /> Prototype Boundary Statement
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          "This is a prototype. MerchantOS does not currently access your real bank, GST, or payment data. All figures are based on data you import or enter, or on demo data."
        </p>
      </div>

      {/* Business Profile */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Business Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500">Business Name</div>
            <div className="text-white font-bold mt-1">Rukmini's Kirana & General Store</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500">Category</div>
            <div className="text-white font-bold mt-1">Retail / Kirana / Staples</div>
          </div>
        </div>
      </div>

      {/* RBAC Team Access */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Role-Based Access Control (RBAC)</span>
          <span className="text-xs text-slate-400">1 Active Member</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white">Rukmini Devi (Owner)</div>
            <div className="text-slate-500">rukmini@kirana.store</div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
            Owner Role
          </span>
        </div>
      </div>
    </div>
  );
}
