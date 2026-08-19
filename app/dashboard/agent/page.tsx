'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Send, Sparkles, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  evidence?: any;
  confidence?: string;
  source_refs?: string[];
  recommended_range?: string;
}

const SUGGESTIONS = [
  'Which bank is most likely to sanction my loan at what interest rate?',
  'What are the best items to buy from my supplier right now?',
  'Can I afford ₹3L of inventory?',
  'What is my current Health Score breakdown?',
  'Which products are currently losing money?',
];


function AgentPageContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'agent',
      text: "Hello Rukmini! I am your MerchantOS Decision Co-Pilot. Ask me any question about your cash flow, inventory, pricing, or financing readiness. Every number I surface is calculated deterministically by our underlying engines.",
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);

  const handleSend = async (qText?: string) => {
    const query = qText || input;
    if (!query.trim()) return;

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = { id: userMsgId, role: 'user', text: query };

    setMessages(prev => [...prev, userMsg]);
    if (!qText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, business_id: 'biz_rukmini_store' }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        role: 'agent',
        text: data.answer,
        evidence: data.evidence,
        confidence: data.confidence,
        source_refs: data.source_refs,
        recommended_range: data.recommended_range,
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ) {
      handleSend(initialQ);
    }
  }, [initialQ]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 flex flex-col h-[calc(100vh-7.5rem)] sm:h-[calc(100vh-6rem)] font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" /> AI Decision Agent
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tool-calling financial decision co-pilot. All answers are backed by deterministic engine calculations.
          </p>
        </div>
        <span className="text-[10px] sm:text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-extrabold shrink-0">
          Strict Evidence Guardrails Active
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            className="text-xs bg-white border border-slate-200 hover:border-emerald-500/50 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors shadow-2xs font-medium shrink-0"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-3 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-inner">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-full sm:max-w-2xl rounded-2xl p-3 sm:p-4 text-xs space-y-3 shadow-2xs ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200/90 text-slate-800'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

              {m.recommended_range && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold">
                  Recommended Range: {m.recommended_range}
                </div>
              )}

              {m.evidence && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedMsgId(expandedMsgId === m.id ? null : m.id)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Why? Show Evidence & Tool Sources ({m.source_refs?.length || 0})
                    {expandedMsgId === m.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {expandedMsgId === m.id && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-[11px]">
                      <div className="font-bold text-slate-800">Deterministic Engine Evidence:</div>
                      <pre className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-[10px] overflow-x-auto">
                        {JSON.stringify(m.evidence, null, 2)}
                      </pre>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {m.source_refs?.map((ref, rIdx) => (
                          <span key={rIdx} className="text-[9px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 animate-pulse shadow-xs font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
              Running deterministic tools & generating response...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a decision question (e.g. Can I afford ₹3L inventory?)..."
          className="flex-1 bg-white border border-slate-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all shadow-xs"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 shrink-0"
        >
          Send <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

export default function AgentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse text-xs">Loading AI Decision Co-Pilot...</div>}>
      <AgentPageContent />
    </Suspense>
  );
}

