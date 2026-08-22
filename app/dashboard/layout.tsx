'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  HeartPulse,
  Cpu,
  LineChart,
  Layers,
  ShoppingBag,
  AlertTriangle,
  Award,
  Calculator,
  MessageSquare,
  Upload,
  History,
  Settings,
  Sparkles,
  Plus,
  FileText,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { QuickCreateModal } from '@/components/QuickCreateModal';
import { supabase } from '@/lib/supabase/client';
import { useStoredJson, removeStoredKey } from '@/lib/hooks/useStoredJson';

const NAV_ITEMS = [
  { label: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Ask AI Co-Pilot', href: '/dashboard/agent', icon: MessageSquare, highlight: true },
  { label: 'Financial Health', href: '/dashboard/health', icon: HeartPulse },
  { label: 'Time Machine', href: '/dashboard/time-machine', icon: LineChart },
  { label: 'Scenario Simulator', href: '/dashboard/scenarios', icon: Layers },
  { label: 'Commerce Intelligence', href: '/dashboard/commerce', icon: ShoppingBag },
  { label: 'Digital Twin', href: '/dashboard/twin', icon: Cpu },
  { label: 'Risk Graph', href: '/dashboard/risk', icon: AlertTriangle },
  { label: 'Finance Readiness', href: '/dashboard/readiness', icon: Award },
  { label: 'Reverse Loan Simulator', href: '/dashboard/loan-simulator', icon: Calculator },
  { label: 'Reports & PDF Export', href: '/dashboard/reports', icon: FileText },
  { label: 'Data Import & OCR', href: '/dashboard/import', icon: Upload },
  { label: 'Audit Trail', href: '/dashboard/audit', icon: History },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface NavContentProps {
  pathname: string;
  userPhone: string;
  merchantName: string;
  onNavigate: () => void;
  onLogout: () => void;
}

function NavContent({ pathname, userPhone, merchantName, onNavigate, onLogout }: NavContentProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <Image
            src="/merchantos_logo.png"
            alt="MerchantOS Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain rounded-lg"
          />
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Merchant<span className="text-emerald-600">OS</span>
          </span>
        </Link>
        <button
          onClick={onNavigate}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80 shadow-xs'
                  : item.highlight
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200/70 hover:border-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto flex items-center gap-1 text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="truncate pr-1">
            <div className="text-xs font-bold text-slate-900 truncate">{merchantName}</div>
            <div className="text-[10px] text-slate-500 truncate font-mono">{userPhone}</div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-2" />
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout Session
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const session = useStoredJson<{ phone?: string }>('merchantos_phone_session');
  const twinProfile = useStoredJson<{ businessName?: string }>('merchantos_twin_profile');
  const userPhone = session?.phone ?? '+91 98765 43210';
  const merchantName = twinProfile?.businessName ?? "Rukmini's Kirana Store";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    removeStoredKey('merchantos_phone_session');
    router.push('/login');
  };

  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <QuickCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <aside className="hidden md:flex w-64 border-r border-slate-200/90 flex-col fixed inset-y-0 left-0 z-40 shadow-xs">
        <NavContent
          pathname={pathname}
          userPhone={userPhone}
          merchantName={merchantName}
          onNavigate={closeMobileNav}
          onLogout={handleLogout}
        />
      </aside>

      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity duration-300 md:hidden ${
          isMobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileNav}
      />

      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent
          pathname={pathname}
          userPhone={userPhone}
          merchantName={merchantName}
          onNavigate={closeMobileNav}
          onLogout={handleLogout}
        />
      </aside>

      <div className="w-full md:pl-64 flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center border border-slate-200 shadow-2xs"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-1.5 md:hidden font-extrabold text-sm text-slate-900">
              <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Merchant<span className="text-emerald-600">OS</span></span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Data State:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
                Live Twin Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/dashboard/twin"
              className="hidden sm:flex text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold items-center gap-1.5 transition-colors shadow-2xs shrink-0 font-mono text-[11px]"
              title="Verified Phone Auth Session"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{userPhone}</span>
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Add</span> Entry
            </button>

            <Link
              href="/dashboard/agent"
              className="text-xs bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">Ask</span> AI
            </Link>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-full pb-24 md:pb-6">{children}</main>

        {/* Mobile Phone Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              pathname === '/dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          <Link
            href="/dashboard/agent"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              pathname === '/dashboard/agent' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Ask AI</span>
          </Link>

          <Link
            href="/dashboard/import"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              pathname === '/dashboard/import' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">OCR Capture</span>
          </Link>

          <Link
            href="/dashboard/scenarios"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              pathname === '/dashboard/scenarios' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Simulate</span>
          </Link>

          <Link
            href="/dashboard/health"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              pathname === '/dashboard/health' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Health</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
