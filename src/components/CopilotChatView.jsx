// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\CopilotChatView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Clock, 
  ShieldCheck, 
  CornerDownRight, 
  RotateCw,
  HelpCircle
} from 'lucide-react';
import { askSettlementCopilot } from '../utils/geminiApi';

export default function CopilotChatView({
  contextData,
  geminiApiKey,
  chatMessages,
  setChatMessages
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const promptSuggestions = [
    "Summarize our open reconciliation exceptions",
    "Why is ₹80,000 locked in dispute reserve?",
    "Explain the timing cutoff delay on pay_99001122",
    "What is our projected liquidity over the next 7 days?",
    "Explain the weekend settlement lag for Indian nodal accounts"
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (queryText) => {
    const text = queryText || inputQuery;
    if (!text || !text.trim() || isTyping) return;

    const userMessage = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await askSettlementCopilot(text.trim(), contextData, geminiApiKey);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: response.answer,
          source: response.source,
          time: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Copilot error: ${err.message}`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Settlement & Audit Copilot</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>{geminiApiKey ? 'Gemini 1.5 Flash (Live)' : 'RazorOps Neural Copilot'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conversational reasoning agent grounded in active reconciliation batches, chargeback metrics, and nodal logs.
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            {geminiApiKey ? '⚡ API Key Active' : 'ℹ️ Using local engine (Enter Gemini API Key in Settings for live LLM)'}
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
            Suggested Audit Inquiries
          </span>
          <div className="flex items-center flex-wrap gap-2">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isTyping}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all text-left disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px]">
        
        {/* Messages Container */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          {chatMessages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isBot 
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed shadow-md ${
                  isBot 
                    ? 'bg-slate-900 border border-slate-800 text-slate-200' 
                    : 'bg-blue-600 text-white'
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-bold text-[11px] opacity-80">
                      {isBot ? (msg.source || 'RazorOps Copilot') : 'Auditor'}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {msg.time}
                    </span>
                  </div>

                  <div className="whitespace-pre-line text-[12px]">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs">
                <RotateCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400">
                Reasoning across current batch ledger & Firestore logs...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about reconciliation variances, dispute holds, or bank cutoffs..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
