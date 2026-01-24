'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sparkles, Send, Bot } from 'lucide-react';

export function AIInsights() {
  const [input, setInput] = useState('');
  // @ts-ignore
  const { messages, sendMessage, isLoading } = useChat({
    api: '/api/ai',
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: 'You are an AI analyst. How can I help you with the performance data?'
      }
    ]
  } as any);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    // Use proper message format for sendMessage
    await sendMessage({ role: 'user', content: userMessage } as any);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[500px]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold">AI Performance Analyst</h3>
          <p className="text-xs text-slate-400">Powered by Mistral & Live Data</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.filter(m => m.role !== 'system').map((m: any) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              m.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600'
            }`}>
              {m.role === 'user' ? <div className="text-xs">You</div> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
              m.role === 'user' 
                ? 'bg-slate-800 text-slate-200 rounded-tr-none' 
                : 'bg-indigo-900/30 text-indigo-100 border border-indigo-500/30 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
             </div>
             <div className="p-3 rounded-2xl bg-indigo-900/30 border border-indigo-500/30 rounded-tl-none">
               <span className="flex gap-1">
                 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
               </span>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about risks, trends, or specific branches..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
