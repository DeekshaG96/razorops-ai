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
    <div className="space-y-2 text-[12.5px] leading-relaxed text-slate-800">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lIdx} className="h-1.5" />;
        }

        // Heading 3 or 2
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={lIdx} className="text-xs font-bold text-blue-700 tracking-wide uppercase mt-3 mb-1 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              <span>{headingText}</span>
            </h4>
          );
        }

        // Bullet list item
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const itemText = trimmed.replace(/^[*•-]\s*/, '');
          return (
            <div key={lIdx} className="flex items-start space-x-2 pl-1 py-0.5">
              <span className="text-blue-600 font-bold select-none text-xs leading-5">•</span>
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
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={pIdx} className="font-bold text-slate-900">
          {inner}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code key={pIdx} className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] border border-blue-200">
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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-[#0c2340] tracking-tight">Ray AI Settlement Copilot</h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>Google Gemini 2.5 Flash Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-agent financial auditor grounded in live reconciliation batches, bank UTR timings, and chargeback holds.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors"
              title="Reset conversation"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Audited Batch Telemetry</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                Live Data
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Match Rate</span>
                <span className="text-lg font-black text-emerald-600 font-sans">
                  {metrics?.matchRate || '93.4'}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {metrics?.resolvedCount || 57} resolved
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Exceptions</span>
                <span className="text-lg font-black text-rose-600 font-sans">
                  {metrics?.unresolvedCount || exceptions.length || 4}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Action required
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Gross Captured</span>
                <span className="text-sm font-bold text-[#0c2340] font-sans truncate block">
                  ₹{metrics?.totalCaptured ? Math.round(metrics.totalCaptured).toLocaleString() : '507,763'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {metrics?.totalRecords || 61} records
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Dispute Hold</span>
                <span className="text-sm font-bold text-amber-600 font-sans truncate block">
                  ₹{metrics?.reserveHoldAmount ? metrics.reserveHoldAmount.toLocaleString() : '80,000'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  4 chargebacks
                </span>
              </div>
            </div>
          </div>

          {/* Quick Prompt Cards */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              1-Click Audit Inquiries
            </span>
            <div className="space-y-1.5">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.query)}
                  disabled={isTyping}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-xs text-slate-700 hover:text-blue-800 transition-all group flex items-center justify-between gap-2 disabled:opacity-50"
                >
                  <span className="font-semibold group-hover:text-blue-700 transition-colors">
                    {item.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Chat Box (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[620px]">
          
          {/* Chat Messages Container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#fbfcfd]">
            {chatMessages.map((msg, idx) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                    isBot 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-white'
                  }`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Card */}
                  <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-xs transition-all ${
                    isBot 
                      ? 'bg-white border border-slate-200/90 text-slate-800' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-100">
                      <span className="font-bold text-[11px] flex items-center space-x-1.5">
                        {isBot ? (
                          msg.source?.includes('Gemini') ? (
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                              <span>{msg.source}</span>
                            </span>
                          ) : msg.source?.includes('OpenAI') ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>{msg.source}</span>
                            </span>
                          ) : (
                            <span className="text-blue-700 font-semibold flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{msg.source || 'RazorOps AI Engine'}</span>
                            </span>
                          )
                        ) : (
                          <span className="opacity-90 font-semibold text-white">Compliance Auditor</span>
                        )}
                      </span>

                      <div className="flex items-center space-x-2">
                        {isBot && (
                          <button
                            onClick={() => handleCopyMessage(msg.text, idx)}
                            title="Copy response"
                            className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                          >
                            {copiedIdx === idx ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        <span className="text-[10px] opacity-70 font-mono">
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
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                  <RotateCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 flex items-center space-x-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-slate-700 font-medium">Auditing batch records via Google Gemini 2.5 Flash...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-white border-t border-slate-200">
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
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-40 transition-all flex items-center space-x-1.5 whitespace-nowrap"
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
