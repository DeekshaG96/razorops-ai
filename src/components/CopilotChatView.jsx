// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\CopilotChatView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  RotateCw,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { askSettlementCopilot } from '../utils/geminiApi';

/**
 * Format markdown text with bold, bullet points, headers, inline code, and currency highlighting.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-[12.5px] leading-relaxed text-slate-200">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lIdx} className="h-1.5" />;
        }

        // Heading 3 or 2
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={lIdx} className="text-xs font-bold text-white tracking-wide uppercase mt-3 mb-1 flex items-center space-x-1.5 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              <span>{headingText}</span>
            </h4>
          );
        }

        // Bullet list item
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const itemText = trimmed.replace(/^[*•-]\s*/, '');
          return (
            <div key={lIdx} className="flex items-start space-x-2 pl-1 py-0.5">
              <span className="text-blue-400 font-bold select-none text-xs leading-5">•</span>
              <div className="flex-1">
                {renderInlineStyles(itemText)}
              </div>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={lIdx}>
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parse inline **bold**, `code`, and ₹ amounts
 */
function renderInlineStyles(str) {
  // Regex to match **bold** or `code`
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={pIdx} className="font-semibold text-white">
          {inner}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code key={pIdx} className="px-1.5 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700/60">
          {inner}
        </code>
      );
    }
    return part;
  });
}

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
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);

  const { metrics = {}, exceptions = [] } = contextData || {};

  const quickPrompts = [
    { label: "Audit Top Exception", query: "Perform a deep audit on payment pay_1001 with root cause and resolution." },
    { label: "Explain Dispute Lock", query: "Why is ₹80,000 locked in dispute reserve across the 4 active chargebacks?" },
    { label: "Timing Cutoff Rule", query: "Explain why payment pay_99001122 captured Sunday 22:30 IST is delayed to Tuesday." },
    { label: "Draft Escalation Memo", query: "Draft an executive escalation memo to Razorpay Nodal Operations for the unsettled UTR." },
    { label: "MDR & GST Calculation", query: "Explain the exact formula for Razorpay MDR fee deductions and 18% GST in India." },
    { label: "7-Day Cashflow Outlook", query: "What is our 7-day liquidity projection and how do weekend bank cutoffs affect cash?" }
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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Copilot error: ${err.message}`,
          source: 'System',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        sender: 'bot',
        text: 'Session reset. I am ready to analyze live payment batches, chargeback escrow, and nodal clearing cutoffs.',
        source: 'RazorOps AI Engine',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner Card */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Settlement & Audit Copilot</h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Google Gemini 2.5 Flash Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-agent financial auditor grounded in live reconciliation batches, bank UTR timings, and chargeback holds.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-colors"
              title="Reset conversation"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Quick Insights & Prompts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Context Mini-Cards */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Audited Batch Telemetry</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Live Data
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-medium">Match Rate</span>
                <span className="text-lg font-black text-emerald-400 font-sans">
                  {metrics?.matchRate || '93.4'}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {metrics?.resolvedCount || 57} resolved
                </span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-medium">Exceptions</span>
                <span className="text-lg font-black text-rose-400 font-sans">
                  {metrics?.unresolvedCount || exceptions.length || 4}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Action required
                </span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-medium">Gross Captured</span>
                <span className="text-sm font-bold text-white font-sans truncate block">
                  ₹{metrics?.totalCaptured ? Math.round(metrics.totalCaptured).toLocaleString() : '511,790'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {metrics?.totalRecords || 61} records
                </span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-medium">Dispute Hold</span>
                <span className="text-sm font-bold text-amber-400 font-sans truncate block">
                  ₹{metrics?.reserveHoldAmount ? metrics.reserveHoldAmount.toLocaleString() : '80,000'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  4 chargebacks
                </span>
              </div>
            </div>
          </div>

          {/* Quick Prompt Cards */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1-Click Audit Inquiries
            </span>
            <div className="space-y-1.5">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.query)}
                  disabled={isTyping}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-blue-600/10 border border-slate-800/80 hover:border-blue-500/30 text-xs text-slate-300 hover:text-white transition-all group flex items-center justify-between gap-2 disabled:opacity-50"
                >
                  <span className="font-medium group-hover:text-blue-300 transition-colors">
                    {item.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Chat Box (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[620px] backdrop-blur-sm">
          
          {/* Chat Messages Container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
            {chatMessages.map((msg, idx) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md ${
                    isBot 
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20 ring-1 ring-white/10' 
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Card */}
                  <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-lg transition-all ${
                    isBot 
                      ? 'bg-slate-900 border border-slate-800/80 text-slate-200' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  }`}>
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-800/50">
                      <span className="font-bold text-[11px] flex items-center space-x-1.5">
                        {isBot ? (
                          msg.source?.includes('Gemini') ? (
                            <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-semibold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                              <span>{msg.source}</span>
                            </span>
                          ) : msg.source?.includes('OpenAI') ? (
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{msg.source}</span>
                            </span>
                          ) : (
                            <span className="text-blue-400 font-semibold flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{msg.source || 'RazorOps AI Engine'}</span>
                            </span>
                          )
                        ) : (
                          <span className="opacity-90 font-semibold">Compliance Auditor</span>
                        )}
                      </span>

                      <div className="flex items-center space-x-2">
                        {isBot && (
                          <button
                            onClick={() => handleCopyMessage(msg.text, idx)}
                            title="Copy response"
                            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                          >
                            {copiedIdx === idx ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        <span className="text-[10px] opacity-60 font-mono">
                          {msg.time}
                        </span>
                      </div>
                    </div>

                    {/* Message Content with Markdown Parsing */}
                    {isBot ? (
                      <FormattedMessage text={msg.text} />
                    ) : (
                      <div className="whitespace-pre-line text-[12.5px] leading-relaxed">
                        {msg.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs">
                  <RotateCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-slate-300">Auditing batch records via Google Gemini 2.5 Flash...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-slate-900/95 border-t border-slate-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask about payment variances, RBI timing rules, UTRs, or dispute reserves..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center space-x-1.5 whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
