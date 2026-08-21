'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PhoneLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the OTP code');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Set mock auth cookie / session item
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchantos_phone_session', JSON.stringify({ phone, authenticatedAt: new Date().toISOString() }));
      }
      router.push('/dashboard');
    }, 800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between max-w-md w-full mx-auto pt-2">
        <Link href="/" className="flex items-center gap-2">
          <img src="/merchantos_logo.png" alt="MerchantOS" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-black text-lg text-slate-900 tracking-tight">
            Merchant<span className="text-emerald-600">OS</span>
          </span>
        </Link>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
          Supabase Auth / Test Mode
        </span>
      </header>

      {/* Main Form Container */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          {/* Title Area */}
          <div className="space-y-1 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
              {step === 1 ? <Phone className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {step === 1 ? 'Merchant Mobile Login' : 'Enter 6-Digit Verification Code'}
            </h1>
            <p className="text-xs text-slate-500">
              {step === 1
                ? 'Enter your registered phone number to receive a secure login OTP.'
                : `We sent a verification code to ${phone}`}
            </p>
          </div>

          {/* Progress Pill */}
          <div className="flex items-center justify-center gap-2">
            <div className={`h-1.5 rounded-full transition-all ${step === 1 ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 2 ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200'}`} />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Step 1: Phone Number Input */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Demo Mode: Using fixed test OTP <strong className="font-mono">123456</strong> for instant verification on loaner devices.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending OTP Code...' : 'Send Login OTP'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification Input */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  6-Digit OTP Code
                </label>
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-11 h-12 text-center text-lg font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-900"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Verifying Session...'
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Verify & Access MerchantOS
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium block"
              >
                ← Edit phone number ({phone})
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400 max-w-md mx-auto">
        Protected by Supabase Auth RLS Policies. AI recommends. Simulation proves. Human decides.
      </footer>
    </div>
  );
}
