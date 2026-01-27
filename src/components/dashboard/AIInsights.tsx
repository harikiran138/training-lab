"use client"

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sparkles, Send, Bot, Zap, ShieldCheck, Activity, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIInsights() {
  const [input, setInput] = useState('');
  const [intelligence, setIntelligence] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // @ts-ignore
  const { messages, append, isLoading } = useChat({
    api: '/api/ai',
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: 'You are the Institutional Performance Analyst. I provide official insights on placement readiness, branch risk indices, and academic efficiency.'
      }
    ]
  } as any);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/intelligence/recommendations');
        const data = await res.json();
        if (data && data.length > 0) {
          setIntelligence(data[0]);
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
      if (data && data.length > 0) {
        setIntelligence(data[0]);
      }
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input;
    setInput('');
    // @ts-ignore
    await append({ role: 'user', content: userMessage });
  };

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded text-[#1E3A8A]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-extrabold text-[#1E3A8A] uppercase tracking-wider leading-none">Intelligence Engine</h3>
            <p className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-widest">Institutional AI v5.0</p>
          </div>
        </div>
        <button 
          onClick={runIntelligenceAudit}
          disabled={isAuditing}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {isAuditing ? 'Auditing...' : <><Zap className="w-3 h-3" /> Execute Audit</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Intelligence Report Card */}
        {intelligence && (
          <div className="bg-blue-50/30 border border-blue-100 rounded p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
                 <span className="text-[10px] font-extrabold text-[#1E3A8A] uppercase tracking-widest">Automated System Remark</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                intelligence.risk_level === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                intelligence.risk_level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                'bg-emerald-50 text-emerald-700 border-emerald-100'
              )}>
                Risk: {intelligence.risk_level}
              </span>
            </div>
            
            <p className="text-[13px] font-medium leading-relaxed text-slate-700 italic border-l-2 border-[#1E3A8A] pl-4">
              "{intelligence.insight_text}"
            </p>

            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Procedural Recommendations:</h4>
              <div className="grid grid-cols-1 gap-2">
                {(intelligence.action_plan || []).map((rec: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center bg-white p-2.5 rounded border border-slate-100">
                     <div className={cn(
                       "w-1.5 h-1.5 rounded-full shrink-0",
                       rec.priority === 'High' ? 'bg-rose-500' : 'bg-blue-400'
                     )} />
                     <p className="text-[11px] text-slate-600 font-bold">{rec.task}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
            {messages.filter(m => m.role !== 'system').map((m: any) => (
            <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? 'flex-row-reverse' : '')}>
                <div className={cn(
                    "w-8 h-8 rounded shrink-0 flex items-center justify-center border",
                    m.role === 'user' ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-100'
                )}>
                    {m.role === 'user' ? <div className="text-[10px] font-bold text-slate-400">YOU</div> : <Bot className="w-4 h-4 text-[#1E3A8A]" />}
                </div>
                <div className={cn(
                    "p-3 rounded text-[13px] max-w-[85%] border shadow-sm",
                    m.role === 'user' 
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] rounded-tr-none font-medium' 
                        : 'bg-white text-slate-700 border-slate-100 rounded-tl-none font-medium leading-relaxed'
                )}>
                    {m.content}
                </div>
            </div>
            ))}
            {isLoading && (
            <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[#1E3A8A]" />
                </div>
                <div className="w-12 h-8 bg-slate-50 border border-slate-100 rounded rounded-tl-none"></div>
            </div>
            )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="relative">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inquire institutional query..."
                className="w-full bg-white border border-slate-200 rounded px-4 py-3 pr-10 text-[12px] font-medium focus:ring-1 focus:ring-blue-100 transition-all outline-none"
            />
            <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#1E3A8A] hover:bg-blue-50 rounded transition-colors disabled:opacity-30"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
      </form>
    </div>
  );
}
