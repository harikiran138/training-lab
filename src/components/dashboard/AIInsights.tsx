"use client"

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sparkles, Send, Bot, Zap, ShieldCheck, Activity, Bell, ChevronRight, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Insight } from '@/services/InsightService';

export function AIInsights() {
  const [input, setInput] = useState('');
  const [systemInsights, setSystemInsights] = useState<Insight[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  // Corrected: use append instead of sendMessage
  const { messages, append, isLoading } = useChat({
    api: '/api/ai',
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: 'You are the Institutional Performance Analyst. Provide strategic advice based on the data shared.'
      }
    ]
  });

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/intelligence/recommendations');
        const data = await res.json();
        if (Array.isArray(data)) {
          // Map legacy Recommendations to unified Insight interface
          const mapped: Insight[] = data.map(r => ({
            id: r._id,
            type: r.risk_level === 'High' ? 'attention' : 'neutral',
            title: 'System Remark',
            description: r.insight_text,
            sentiment: r.risk_level === 'High' ? 'negative' : 'neutral'
          }));
          setSystemInsights(mapped);
        }
      } catch (e) {
        console.error('Failed to fetch initial insights:', e);
      }
    };
    fetchLatest();
  }, []);

  const runIntelligenceAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/intelligence/GLOBAL?type=Department&refresh=true');
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: Insight[] = data.map(r => ({
          id: r._id,
          type: r.risk_level === 'High' ? 'attention' : 'neutral',
          title: 'Audit Finding',
          description: r.insight_text,
          sentiment: r.risk_level === 'High' ? 'negative' : 'neutral'
        }));
        setSystemInsights(mapped);
      }
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input;
    setInput('');
    await append({ role: 'user', content: userMessage });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col h-[700px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 rotate-3 group-hover:rotate-0 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-none">Intelligence Engine</h3>
            <p className="text-[10px] text-indigo-600 font-black uppercase mt-1.5 tracking-[0.2em]">Institutional AI v5.0 // Synchronized</p>
          </div>
        </div>
        <button
          onClick={runIntelligenceAudit}
          disabled={isAuditing}
          className="flex items-center gap-3 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-slate-900/10"
        >
          {isAuditing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Zap className="w-4 h-4 text-amber-400" />}
          Execute Deep Audit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-slate-50/30">

        {/* System Insights Section */}
        {systemInsights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certified System Insights</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemInsights.slice(0, 2).map((insight) => (
                <div key={insight.id} className={cn(
                  "p-5 rounded-3xl border transition-all hover:shadow-md",
                  insight.sentiment === 'negative' ? 'bg-rose-50/50 border-rose-100' : 'bg-white border-slate-100'
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    {insight.sentiment === 'negative' ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : <TrendingUp className="w-4 h-4 text-indigo-500" />}
                    <h4 className={cn("text-xs font-black uppercase", insight.sentiment === 'negative' ? 'text-rose-700' : 'text-slate-900')}>
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic">
                    "{insight.description}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executive Generative Stream</span>
          </div>
          {messages.filter(m => m.role !== 'system').map((m) => (
            <div key={m.id} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300", m.role === 'user' ? 'flex-row-reverse' : '')}>
              <div className={cn(
                "w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border-2",
                m.role === 'user' ? 'bg-white border-slate-200 shadow-sm' : 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-200 shadow-lg'
              )}>
                {m.role === 'user' ? <div className="text-[10px] font-black text-slate-400 uppercase">USR</div> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-5 rounded-[2rem] text-[13px] max-w-[85%] border shadow-sm leading-relaxed",
                m.role === 'user'
                  ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none font-medium'
                  : 'bg-white text-slate-700 border-slate-100 rounded-tl-none font-medium'
              )}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="w-16 h-10 bg-white border border-slate-100 rounded-[2rem] rounded-tl-none"></div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleMessageSubmit} className="p-6 bg-white border-t border-slate-100">
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Inquire institutional analytical query..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 pr-14 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest opacity-60">
          Powered by Gemini 1.5 Pro Institutional Layer
        </p>
      </form>
    </div>
  );
}
