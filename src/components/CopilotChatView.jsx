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
import { Key, ShieldAlert, CheckCircle2, Cpu } from 'lucide-react';

export default function CopilotChatView({
  contextData,
  openaiApiKey,
  setOpenaiApiKey,
  geminiApiKey,
  setGeminiApiKey,
  chatMessages,
  setChatMessages
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [keyProvider, setKeyProvider] = useState('openai');
  const chatEndRef = useRef(null);

  const activeProvider = openaiApiKey ? 'openai' : geminiApiKey ? 'gemini' : 'autonomous';

  const promptSuggestions = [
    "Lookup payment pay_1001",
    "Why is ₹80,000 locked in dispute reserve?",
    "Explain the timing cutoff delay on pay_99001122",
    "Draft an escalation email to Razorpay Nodal Desk",
    "How are MDR fees and 18% GST calculated?",
    "What is our projected liquidity over next 7 days?"
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const handleSaveQuickKey = (e) => {
    e?.preventDefault();
    const cleanKey = tempKeyInput.trim();
    if (!cleanKey) return;

    if (cleanKey.startsWith('sk-') || keyProvider === 'openai') {
      setOpenaiApiKey(cleanKey);
      localStorage.setItem('razorops_openai_api_key', cleanKey);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `🟢 **OpenAI GPT-4o-mini Live LLM Activated!**\n\nYour API key has been connected securely in your local browser session. Every inquiry will now be analyzed in real time by OpenAI's live generative model with active batch grounding.`,
          source: 'OpenAI GPT-4o-mini (Live Real LLM)',
          time: new Date().toLocaleTimeString()
        }
      ]);
    } else {
      setGeminiApiKey(cleanKey);
      localStorage.setItem('razorops_gemini_api_key', cleanKey);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `🟢 **Google Gemini 1.5 Flash Live LLM Activated!**\n\nYour API key has been connected securely in your local browser session. Every inquiry will now be analyzed in real time by Gemini with active batch grounding.`,
          source: 'Gemini 1.5 Flash (Live Real LLM)',
          time: new Date().toLocaleTimeString()
        }
      ]);
    }

    setTempKeyInput('');
    setShowKeyModal(false);
  };

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
      const response = await askSettlementCopilot(text.trim(), contextData, geminiApiKey, openaiApiKey);
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
          source: 'System',
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
              
              {openaiApiKey ? (
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <Cpu className="w-3 h-3" />
                  <span>Real OpenAI (GPT-4o-mini) Live</span>
                </span>
              ) : geminiApiKey ? (
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Real Gemini (1.5 Flash) Live</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Autonomous Local Engine</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Conversational reasoning agent grounded in active reconciliation batches, chargeback metrics, and nodal logs.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{openaiApiKey ? 'Update OpenAI Key' : geminiApiKey ? 'Update Gemini Key' : '⚡ Connect Real AI Key'}</span>
            </button>
          </div>
        </div>

        {/* Quick Connect Real AI Drawer */}
        {showKeyModal && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Key className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white">Connect Real LLM API Key (OpenAI / Gemini)</span>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="provider" 
                  checked={keyProvider === 'openai'} 
                  onChange={() => setKeyProvider('openai')} 
                  className="accent-emerald-500"
                />
                <span className={keyProvider === 'openai' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>OpenAI (GPT-4o-mini)</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="provider" 
                  checked={keyProvider === 'gemini'} 
                  onChange={() => setKeyProvider('gemini')} 
                  className="accent-indigo-500"
                />
                <span className={keyProvider === 'gemini' ? 'text-indigo-400 font-bold' : 'text-slate-400'}>Google Gemini (1.5 Flash)</span>
              </label>
            </div>

            <form onSubmit={handleSaveQuickKey} className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                placeholder={keyProvider === 'openai' ? 'Paste OpenAI Key: sk-...' : 'Paste Gemini Key: AIzaSy...'}
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
              >
                Activate Real LLM
              </button>
            </form>
            <p className="text-[10px] text-slate-400">
              Keys are stored securely in your local browser storage and never transmitted to third parties except direct calls to OpenAI / Google API endpoints.
            </p>
          </div>
        )}

        {/* Prompt Suggestions */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
            Suggested AI Inquiries
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
                    <span className="font-bold text-[11px] flex items-center space-x-1.5">
                      {isBot ? (
                        msg.source?.includes('OpenAI') ? (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{msg.source}</span>
                          </span>
                        ) : msg.source?.includes('Gemini') ? (
                          <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-semibold flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            <span>{msg.source}</span>
                          </span>
                        ) : (
                          <span className="text-blue-400">{msg.source || 'RazorOps AI Engine'}</span>
                        )
                      ) : (
                        <span className="opacity-90">Auditor</span>
                      )}
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
