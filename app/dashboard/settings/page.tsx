'use client';

import { Settings, Info, LogOut, Sliders, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useStoredJson, removeStoredKey } from '@/lib/hooks/useStoredJson';

export default function SettingsPage() {
  const router = useRouter();
  const session = useStoredJson<{ phone?: string }>('merchantos_phone_session');
  const twinProfile = useStoredJson<{ businessName?: string; category?: string }>('merchantos_twin_profile');
  const businessName = twinProfile?.businessName ?? "Rukmini's Kirana & General Store";
  const category = (twinProfile?.category ?? 'Retail / Kirana / Staples').replace('_', ' ').toUpperCase();
  const userPhone = session?.phone ?? '+91 98765 43210';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    removeStoredKey('merchantos_phone_session');
    router.push('/login');
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" /> Settings & Prototype Boundary
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage business configuration, team access roles, and system boundaries.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout Session
        </button>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 border border-emerald-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" /> Prototype Boundary Statement
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          &quot;This is a prototype. MerchantOS does not currently access your real bank, GST, or payment data. All figures are based on data you import or enter, or on demo data.&quot;
        </p>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Active Business Profile</h2>
          <Link
            href="/dashboard/twin"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" /> Calibrate Twin
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-500 font-medium">Business Name</div>
            <div className="text-slate-900 font-bold mt-1 text-sm">{businessName}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-500 font-medium">Category</div>
            <div className="text-slate-900 font-bold mt-1 text-sm capitalize">{category}</div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Role-Based Access Control (RBAC) & Active Auth
          </span>
          <span className="text-xs text-slate-500 font-medium">1 Active Merchant User</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rukmini Devi (Owner)</span>
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5 font-mono">
              Phone: {userPhone} • ID: usr_rukmini_01
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-extrabold uppercase self-start sm:self-auto shrink-0">
            Owner Role (Verified)
          </span>
        </div>
      </div>
    </div>
  );
}


