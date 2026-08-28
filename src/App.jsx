// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Activity, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle, 
  DollarSign, 
  Search, 
  Filter, 
  FileText, 
  Terminal as TerminalIcon, 
  CornerDownRight, 
  Download,
  AlertCircle
} from 'lucide-react';
import { generateSyntheticData } from './data/syntheticGenerator';
import { controllerAgent } from './agents/controllerAgent';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [syntheticData, setSyntheticData] = useState(null);
  const [reconData, setReconData] = useState(null);
  
  // Terminal logs streaming state
  const [simulatedLogs, setSimulatedLogs] = useState([]);
  const terminalEndRef = useRef(null);

  // Chat Q&A Agent state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Welcome, Finance Auditor. I am the Settlement Q&A Agent. Run the multi-agent reconciliation to begin auditing, then ask me about transactions, disputes, fee variances, cutoff delays, or cash projections.',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Table filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Interactive Chart state
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Auto-scroll references
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulatedLogs]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Run the multi-agent system simulation
  const runSimulation = () => {
    setIsRunning(true);
    setIsCompleted(false);
    setSimulatedLogs([]);

    // 1. Generate new synthetic data batch
    const rawData = generateSyntheticData();
    setSyntheticData(rawData);

    // 2. Run Controller Agent (runs the whole multi-agent loop)
    const result = controllerAgent.run(rawData, 500000); // 5L starting balance

    // 3. Stream logs into the terminal window to simulate real-time agent execution
    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < result.logs.length) {
        const logToAdd = result.logs[currentLogIndex];
        setSimulatedLogs(prev => [...prev, logToAdd]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setReconData(result);
        setIsRunning(false);
        setIsCompleted(true);
        
        // Add follow-up bot message when reconciliation completes
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `Reconciliation audit complete. Certified Match Rate: ${result.metrics.matchRate}%. Found ${result.exceptions.length} exceptions. You can now run detailed queries. Try clicking the quick actions below!`,
            time: new Date().toLocaleTimeString(),
            isInteractive: true
          }
        ]);
      }
    }, 80); // Speed of streaming logs
  };

  // Reset dashboard state
  const resetSimulation = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setSimulatedLogs([]);
    setReconData(null);
    setSyntheticData(null);
    setChatMessages([
      {
        sender: 'bot',
        text: 'Welcome, Finance Auditor. I am the Settlement Q&A Agent. Run the multi-agent reconciliation to begin auditing, then ask me about transactions, disputes, fee variances, cutoff delays, or cash projections.',
        time: new Date().toLocaleTimeString()
      }
    ]);
    setSearchQuery('');
    setStatusFilter('all');
    setHoveredPoint(null);
  };

  // Handle Q&A conversational queries
  const handleSendMessage = (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    // Add user message
    const updatedMessages = [
      ...chatMessages,
      { sender: 'user', text: query, time: new Date().toLocaleTimeString() }
    ];
    setChatMessages(updatedMessages);
    if (!textToSend) setChatInput('');

    // Think state
    setTimeout(() => {
      let botResponse = '';

      if (!isCompleted || !reconData) {
        botResponse = 'Please trigger the "Run Reconciliation Agent" simulation in the header first, so I can analyze the ledger data and audit logs.';
      } else {
        const q = query.toLowerCase();
        const { metrics, reconciliationResults, exceptions, disputeAnalysis, projections } = reconData;

        if (q.includes('utr')) {
          // Look up specific UTR
          const matches = q.match(/utr_[a-z0-9_]+/);
          const searchedUtr = matches ? matches[0].toUpperCase() : null;

          if (searchedUtr) {
            const foundRecord = reconciliationResults.find(r => 
              r.settlements.some(s => s.utr && s.utr.toUpperCase() === searchedUtr)
            );

            if (foundRecord) {
              const settle = foundRecord.settlements.find(s => s.utr.toUpperCase() === searchedUtr);
              botResponse = `🔍 **UTR Mapped Successfully**:\n
- **UTR**: ${settle.utr}
- **Capture ID**: ${foundRecord.payment.id}
- **Gross Settled**: ₹${settle.gross_amount.toLocaleString()}
- **Net Credited**: ₹${settle.net_amount.toLocaleString()}
- **Gateway Fee/Tax**: ₹${settle.fee_deducted.toLocaleString()}
- **Customer Email**: ${foundRecord.payment.email}
- **Status**: ${foundRecord.status}
- **Settlement Date**: ${settle.settle_date}`;
            } else {
              botResponse = `❌ UTR code "${searchedUtr}" not found in current settlement batch. Please verify the code.`;
            }
          } else {
            botResponse = 'Please provide a specific UTR code (e.g., "UTR_90001" or "UTR_var_90041") to audit its transaction mappings.';
          }
        } else if (q.includes('dispute') || q.includes('chargeback') || q.includes('reserve') || q.includes('hold')) {
          const highRisk = disputeAnalysis.riskSignals.filter(s => s.severity === 'high');
          botResponse = `🛡️ **Dispute Agent Risk Assessment**:\n
- **Active Chargeback Claims**: ${disputeAnalysis.totalDisputesCount} claims logged.
- **Disputed Cash Volume**: ₹${disputeAnalysis.totalDisputedAmount.toLocaleString()}
- **Nodal Reserve Holds**: ₹${disputeAnalysis.reserveHoldAmount.toLocaleString()} locked.
- **Risk Signals**: ${disputeAnalysis.riskSignals.length} flags raised.\n\n` +
          (highRisk.length > 0 
            ? `⚠️ **CRITICAL FRAUD ALERTS**:\n` + highRisk.map(r => `- **${r.type}**: ${r.description} (Target: ${r.identifier})`).join('\n')
            : `✅ No high-risk fraudulent clusters detected in this batch.`);
        } else if (q.includes('variance') || q.includes('fee') || q.includes('mdr')) {
          const variances = reconciliationResults.filter(r => r.status === 'MDR Fee Variance Detected');
          botResponse = `📊 **MDR Fee Variance Report**:\n
The Reconciliation Agent flagged **${variances.length} transactions** where charged fees exceeded the standard 2% merchant profile:\n\n` +
          variances.map(v => `- **Payment ${v.payment.id}** (${v.payment.method}): Charged ₹${v.settlements[0].fee_deducted} vs expected ₹${v.payment.expected_fee} (International/Premium Card surcharge). Variance: ₹${v.variance.toFixed(2)}.`).join('\n') +
          `\n\n*Suggested Action: Pass back surcharges to global customers or renegotiate international gateway rates.*`;
        } else if (q.includes('refund') || q.includes('partial')) {
          const refunds = reconciliationResults.filter(r => r.status.includes('Refund'));
          botResponse = `🔄 **Partial Refund Auditing**:\n
We resolved **${refunds.length} partial refund cases** where the nodal bank settled less than the original payment value:\n\n` +
          refunds.map(r => `- **Payment ${r.payment.id}**: Captured ₹${r.payment.amount}, Refunded ₹${r.payment.refunded_amount}. Net settled bank gross: ₹${r.settlements[0].gross_amount} (Matched via credit-note net calculation).`).join('\n');
        } else if (q.includes('cutoff') || q.includes('timing') || q.includes('sunday')) {
          const cutoffs = reconciliationResults.filter(r => r.status.includes('Timing Cutoff'));
          botResponse = `⏰ **Timing Cutoff Audit**:\n
We resolved **${cutoffs.length} cutoff-lag cases**:\n\n` +
          `Transactions captured late Sunday night (post 23:30 IST / 18:00 UTC) missed the nodal bank batch closure. They were automatically pushed to Monday's processing queue, leading to settlement on Wednesday (T+3) rather than Tuesday (T+2). All records successfully reconciled against deferred banking cycles.`;
        } else if (q.includes('exception') || q.includes('unresolved') || q.includes('mismatch')) {
          botResponse = `⚠️ **Honest Exception List (Human Review Required)**:\n
These **${exceptions.length} items** could not be auto-resolved by agent rules:\n\n` +
          exceptions.map((e, index) => `${index + 1}. **${e.type}** (Payment: ${e.paymentId}):
   - **Details**: ${e.description}
   - **Impact Value**: ₹${e.amount.toLocaleString()}
   - **Recommended Resolution**: ${e.resolution}`).join('\n\n');
        } else if (q.includes('forecast') || q.includes('liquidity') || q.includes('cashflow') || q.includes('7 days')) {
          botResponse = `📈 **Forward Cashflow Projections** (7-Day Horizon):\n
- **Current Available Cash**: ₹${(metrics.startingBalance - metrics.reserveHoldAmount).toLocaleString()} (Reserve held: ₹${metrics.reserveHoldAmount.toLocaleString()})
- **Projected Credits (Next 7 Days)**: ₹${projections.reduce((sum, p) => sum + p.projectedCreditNet, 0).toLocaleString()} net.
- **Estimated Cash Balance**: ₹${metrics.endingBalance.toLocaleString()} by end of cycle.
- **Bank Holiday Lag**: No settlements cleared on Saturdays/Sundays due to nodal clearing closures. Large accumulation credit scheduled for Tuesday, 2026-08-25.`;
        } else {
          botResponse = `💬 I understood your query, but for specific financial auditing, please ask about:
- **"exceptions"** to see unresolved ledger mismatches.
- **"disputes"** or **"reserves"** to audit chargeback holds.
- **"fee variance"** to inspect international MDR overcharges.
- **"timing cutoffs"** to review late Sunday transaction logs.
- **"forecast"** to check the 7-day liquidity forecast.
- **"UTR [code]"** to locate a specific bank credit UTR details.`;
        }
      }

      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: botResponse, time: new Date().toLocaleTimeString() }
      ]);
    }, 400);
  };

  // Filter and search ledger data
  const getFilteredTransactions = () => {
    if (!reconData) return [];
    
    return reconData.reconciliationResults.filter(item => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = 
        item.payment.id.toLowerCase().includes(searchLower) ||
        (item.payment.email && item.payment.email.toLowerCase().includes(searchLower)) ||
        (item.settlements[0]?.utr && item.settlements[0].utr.toLowerCase().includes(searchLower)) ||
        item.status.toLowerCase().includes(searchLower);

      // Status filter
      if (statusFilter === 'all') return matchSearch;
      if (statusFilter === 'perfect') return matchSearch && item.status === 'Perfect Match';
      if (statusFilter === 'variance') return matchSearch && item.status === 'MDR Fee Variance Detected';
      if (statusFilter === 'refund') return matchSearch && item.status.includes('Refund');
      if (statusFilter === 'cutoff') return matchSearch && item.status.includes('Timing Cutoff');
      if (statusFilter === 'dispute') return matchSearch && item.status.includes('Disputed');
      if (statusFilter === 'exception') return matchSearch && (
        item.status.includes('Mismatch') || 
        item.status.includes('Missing') || 
        item.status.includes('Duplicate') || 
        item.status.includes('Orphan')
      );

      return matchSearch;
    });
  };

  // CSV Exporter for Exception List
  const exportExceptionsCSV = () => {
    if (!reconData || reconData.exceptions.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Exception Type,Payment ID,Severity,Description,Discrepancy Amount (INR),Suggested Action\n";
    
    reconData.exceptions.forEach(e => {
      csvContent += `"${e.type}","${e.paymentId}","${e.severity}","${e.description}",${e.amount},"${e.resolution}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `razorops_exceptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = getFilteredTransactions();

  // Custom Chart Dimensions
  const chartWidth = 550;
  const chartHeight = 200;
  const chartPadding = 35;

  // Prepare Chart Coordinates
  const getChartPoints = () => {
    if (!reconData || reconData.projections.length === 0) return [];
    
    const minVal = Math.min(...reconData.projections.map(p => p.closingBalance)) * 0.98;
    const maxVal = Math.max(...reconData.projections.map(p => p.closingBalance)) * 1.02;
    const range = maxVal - minVal;

    return reconData.projections.map((p, index) => {
      const x = chartPadding + (index * (chartWidth - chartPadding * 2) / (reconData.projections.length - 1));
      const y = chartHeight - chartPadding - ((p.closingBalance - minVal) * (chartHeight - chartPadding * 2) / range);
      return { x, y, data: p };
    });
  };

  const chartPoints = getChartPoints();
  const chartPath = chartPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  const areaPath = chartPoints.length > 0 
    ? `${chartPath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - chartPadding} L ${chartPoints[0].x} ${chartHeight - chartPadding} Z`
    : '';

  return (
    <div className="dashboard">
      {/* HEADER SECTION */}
      <header className="panel header">
        <div className="header-title-container">
          <div className="header-logo">
            <Activity className="simulation-icon" style={{ width: '28px', height: '28px', margin: 0, animation: isRunning ? 'pulse-glow 1.5s infinite' : 'none' }} />
            RazorOps AI
          </div>
          <span className="header-badge">Finance Controller v2.6</span>
        </div>
        <div className="header-actions">
          {isCompleted && (
            <button className="btn btn-secondary" onClick={resetSimulation}>
              <RotateCcw size={16} /> Reset
            </button>
          )}
          <button 
            className={`btn ${isRunning ? 'btn-disabled' : isCompleted ? 'btn-success' : ''}`}
            onClick={runSimulation}
            disabled={isRunning}
          >
            <Play size={16} fill="white" /> {isRunning ? 'Reconciling Batch...' : isCompleted ? 'Audit Certified' : 'Run Reconciliation Agent'}
          </button>
        </div>
      </header>

      {/* METRICS HUD */}
      <section className="panel metrics-grid">
        <div className="metric-card">
          <div className="metric-label">
            <CheckCircle size={16} className="text-success" style={{ color: 'var(--color-success)' }} />
            Match Rate (Accuracy)
          </div>
          <div className={`metric-val ${isCompleted ? 'glow-blue' : ''}`}>
            {isCompleted ? `${reconData.metrics.matchRate}%` : '0.0%'}
          </div>
          <div className="metric-change up">
            {isCompleted ? `${reconData.metrics.resolvedCount} of ${reconData.metrics.totalRecords} matched` : 'Awaiting simulation run'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <DollarSign size={16} style={{ color: 'var(--neon-cyan)' }} />
            Total Captured Value
          </div>
          <div className="metric-val">
            {isCompleted ? `₹${reconData.metrics.totalCaptured.toLocaleString()}` : '₹0'}
          </div>
          <div className="metric-change" style={{ color: '#9ca3af' }}>
            Razorpay captured logs
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <ShieldAlert size={16} style={{ color: 'var(--color-warning)' }} />
            Dispute Reserve holds
          </div>
          <div className={`metric-val ${isCompleted && reconData.metrics.reserveHoldAmount > 0 ? 'glow-warning' : ''}`}>
            {isCompleted ? `₹${reconData.metrics.reserveHoldAmount.toLocaleString()}` : '₹0'}
          </div>
          <div className="metric-change down" style={{ color: reconData?.metrics.reserveHoldAmount > 0 ? 'var(--color-warning)' : '#9ca3af' }}>
            {isCompleted ? `${reconData.disputeAnalysis.totalDisputesCount} active disputes locked` : 'No locked reserves'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <AlertTriangle size={16} style={{ color: 'var(--color-error)' }} />
            Ledger Exceptions
          </div>
          <div className={`metric-val ${isCompleted && reconData.metrics.unresolvedCount > 0 ? 'glow-red' : ''}`}>
            {isCompleted ? reconData.metrics.unresolvedCount : '0'}
          </div>
          <div className="metric-change down" style={{ color: reconData?.metrics.unresolvedCount > 0 ? 'var(--color-error)' : '#9ca3af' }}>
            {isCompleted ? 'Requires manual resolution' : 'Zero flags escalated'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <TrendingUp size={16} style={{ color: 'var(--neon-purple)' }} />
            Ending Liquidity
          </div>
          <div className="metric-val">
            {isCompleted ? `₹${reconData.metrics.endingBalance.toLocaleString()}` : '₹0'}
          </div>
          <div className="metric-change up">
            {isCompleted ? 'Net bank balance forecast' : 'Starting balance: ₹500,000'}
          </div>
        </div>
      </section>

      {/* CORE WORKSPACE SPLITS */}
      {!isCompleted && !isRunning ? (
        <section className="panel run-simulation-overlay">
          <Activity className="simulation-icon" />
          <h2 className="simulation-title">Multi-Agent Reconciliation Terminal</h2>
          <p className="simulation-desc">
            Analyze 60 fragmented transactions across Razorpay capture webhooks, Nodal settlement reports, and ERP invoices. Watch specialized agents negotiate edge cases (MDR rates, Sunday timing cutoffs, chargeback reserves) in real-time.
          </p>
          <button className="btn" onClick={runSimulation}>
            <Play size={16} fill="white" /> Launch Reconciliation Simulation
          </button>
        </section>
      ) : (
        <>
          {/* SPLIT COLUMN - TOP: Terminal and Chat */}
          <div className="split-layout-top">
            
            {/* AGENT TERMINAL */}
            <div className="panel terminal-panel">
              <div className="terminal-header">
                <div className="terminal-title">
                  <TerminalIcon size={16} style={{ color: 'var(--color-info)' }} />
                  Agent Execution Log (Multi-Agent Subsystems)
                </div>
                <div className="terminal-controls">
                  <span className={`terminal-indicator ${isRunning ? 'running' : 'idle'}`}></span>
                  <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                    {isRunning ? 'AGENT CONVERSATION ACTIVE' : 'TERMINAL SUSPENDED'}
                  </span>
                </div>
              </div>
              <div className="terminal-body">
                {simulatedLogs.map((log, index) => (
                  <div key={index} className={`log-line ${log.level}`}>
                    <div className="log-meta">
                      <span className="log-time">{log.timestamp.split('T')[1].slice(0, 8)}</span>
                      <span>[</span>
                      <span className={`log-agent ${
                        log.agent.includes('Controller') ? 'controller' : 
                        log.agent.includes('Reconciliation') ? 'reconciliation' :
                        log.agent.includes('Dispute') ? 'dispute' : 'forecaster'
                      }`}>
                        {log.agent}
                      </span>
                      <span>]</span>
                      {log.paymentId && <span className="log-tx-id" style={{ color: 'rgba(255,255,255,0.4)' }}>{log.paymentId}</span>}
                    </div>
                    <span className="log-text">{log.message}</span>
                  </div>
                ))}
                {isRunning && (
                  <div className="log-line" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', opacity: 0.6 }}>
                    <span className="terminal-indicator running" style={{ width: '6px', height: '6px' }}></span>
                    <span className="log-text" style={{ fontStyle: 'italic', fontFamily: 'var(--font-sans)', fontSize: '11px' }}>Agent is reasoning...</span>
                  </div>
                )}
                <div ref={terminalEndRef}></div>
              </div>
            </div>

            {/* AUDIT Q&A AGENT CHAT PANEL */}
            <div className="panel chat-panel">
              <div className="chat-header">
                <div className="chat-title">
                  <MessageSquare size={16} style={{ color: 'var(--neon-purple)' }} />
                  Settlement Auditing Agent Q&A
                </div>
              </div>
              <div className="chat-body">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.sender}`}>
                    <span className="chat-message-sender">
                      {msg.sender === 'bot' ? 'Settlement Agent' : 'Auditor'}
                    </span>
                    <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                    {msg.isInteractive && (
                      <div className="chat-quick-replies" style={{ marginTop: '10px' }}>
                        <button className="chip" onClick={() => handleSendMessage('Show unresolved exceptions')}>
                          ⚠️ Show Exceptions
                        </button>
                        <button className="chip" onClick={() => handleSendMessage('Show chargebacks and reserve holds')}>
                          🛡️ Dispute Audits
                        </button>
                        <button className="chip" onClick={() => handleSendMessage('Show MDR fee variances')}>
                          📊 Fee Variances
                        </button>
                        <button className="chip" onClick={() => handleSendMessage('Explain Sunday timing cutoffs')}>
                          ⏰ Timing Lags
                        </button>
                        <button className="chip" onClick={() => handleSendMessage('Show 7-day cash forecast')}>
                          📈 Liquidity Forecast
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>
              <form 
                className="chat-input-container" 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder={isCompleted ? "Ask me about exceptions, UTR codes, disputes..." : "Awaiting reconciliation loop..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={!isCompleted}
                />
                <button 
                  type="submit" 
                  className="chat-send-btn" 
                  disabled={!isCompleted || !chatInput.trim()}
                >
                  <CornerDownRight size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* SPLIT COLUMN - BOTTOM: SVG Forecast & Exception List */}
          {isCompleted && (
            <div className="split-layout-bottom">
              
              {/* LIQUIDITY FORECAST CHART */}
              <div className="panel chart-container">
                <div className="chart-header">
                  <div className="terminal-title">
                    <TrendingUp size={16} style={{ color: 'var(--neon-cyan)' }} />
                    Liquidity Forecasting Pipeline (T+2 Calendar Projections)
                  </div>
                  <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                    7-DAY HORIZON
                  </span>
                </div>
                <div className="chart-canvas-container">
                  <svg className="chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                    <defs>
                      <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--razor-blue)" />
                        <stop offset="50%" stopColor="var(--neon-cyan)" />
                        <stop offset="100%" stopColor="var(--neon-purple)" />
                      </linearGradient>
                      <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--bg-main)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((grid, index) => {
                      const y = chartPadding + (index * (chartHeight - chartPadding * 2) / 4);
                      return (
                        <line 
                          key={index}
                          x1={chartPadding} 
                          y1={y} 
                          x2={chartWidth - chartPadding} 
                          y2={y} 
                          className="chart-grid-line" 
                        />
                      );
                    })}

                    {/* Area under line */}
                    {areaPath && <path d={areaPath} className="chart-line-bg" />}

                    {/* Glowing chart path */}
                    {chartPath && <path d={chartPath} className="chart-line" />}

                    {/* Interaction Points */}
                    {chartPoints.map((pt, index) => (
                      <circle 
                        key={index}
                        cx={pt.x} 
                        cy={pt.y} 
                        r={hoveredPoint?.index === index ? 6 : 4} 
                        className="chart-dot"
                        onMouseEnter={() => setHoveredPoint({ index, ...pt })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}

                    {/* X axis labels */}
                    {chartPoints.map((pt, index) => (
                      <text 
                        key={index}
                        x={pt.x} 
                        y={chartHeight - 12} 
                        className="chart-label"
                      >
                        {pt.data.date.split('-')[2]}/{pt.data.date.split('-')[1]}
                      </text>
                    ))}
                  </svg>

                  {/* Interactive Chart Tooltip */}
                  {hoveredPoint && (
                    <div 
                      className="chart-tooltip"
                      style={{ 
                        left: `${hoveredPoint.x + 10}px`, 
                        top: `${hoveredPoint.y - 80}px`,
                      }}
                    >
                      <span style={{ fontWeight: '700', color: 'white' }}>
                        {hoveredPoint.data.date} ({hoveredPoint.data.dayName})
                      </span>
                      <span style={{ color: '#9ca3af' }}>
                        Closing Balance: <strong style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>₹{hoveredPoint.data.closingBalance.toLocaleString()}</strong>
                      </span>
                      <span style={{ color: '#9ca3af' }}>
                        Net Inflow: <strong style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>+₹{hoveredPoint.data.projectedCreditNet.toLocaleString()}</strong>
                      </span>
                      {hoveredPoint.data.transactionCount > 0 && (
                        <span style={{ color: '#6b7280', fontSize: '9px', fontStyle: 'italic' }}>
                          Includes {hoveredPoint.data.transactionCount} transactions
                        </span>
                      )}
                      {hoveredPoint.data.explanations.length > 0 && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px', marginTop: '4px', fontSize: '9px', color: 'var(--color-warning)' }}>
                          ⚠️ {hoveredPoint.data.explanations[0].split('(')[1]?.replace(')', '') || 'Weekend Delay'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* HONEST EXCEPTION LIST */}
              <div className="panel exception-panel">
                <div className="exception-header">
                  <div className="terminal-title">
                    <AlertCircle size={16} style={{ color: 'var(--color-error)' }} />
                    Honest Exception List (Escalated Queue)
                  </div>
                  <div className="exception-count">
                    {reconData.exceptions.length} UNRESOLVED
                  </div>
                </div>
                <div className="exception-list">
                  {reconData.exceptions.length === 0 ? (
                    <div className="empty-exception">
                      <CheckCircle className="empty-exception-icon" />
                      <span>Ledger balance 100% matched. Zero exceptions found.</span>
                    </div>
                  ) : (
                    reconData.exceptions.map((exc, index) => (
                      <div key={index} className="exception-item">
                        <div className="exception-item-header">
                          <span className="exception-type">
                            <AlertTriangle size={14} />
                            {exc.type}
                          </span>
                          <span className="exception-severity high">
                            {exc.severity}
                          </span>
                        </div>
                        <p className="exception-desc">{exc.description}</p>
                        <div className="exception-details">
                          <div>
                            <span className="exception-meta-label">Payment Ref: </span>
                            <span className="cell-mono" style={{ color: 'white' }}>{exc.paymentId}</span>
                          </div>
                          <div>
                            <span className="exception-meta-label">Discrepancy: </span>
                            <span className="cell-mono" style={{ color: 'white' }}>₹{exc.amount.toLocaleString()}</span>
                          </div>
                          {exc.invoiceId && (
                            <div>
                              <span className="exception-meta-label">ERP Reference: </span>
                              <span className="cell-mono" style={{ color: 'white' }}>{exc.invoiceId}</span>
                            </div>
                          )}
                        </div>
                        <div className="exception-action">
                          <CheckCircle size={12} />
                          <span><strong>Action:</strong> {exc.resolution}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {reconData.exceptions.length > 0 && (
                  <button className="btn btn-secondary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }} onClick={exportExceptionsCSV}>
                    <Download size={14} /> Export Exception CSV (Auditing Format)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MASTER TRANSACTION LEDGER GRID */}
          {isCompleted && (
            <section className="panel ledger-panel">
              <div className="ledger-header">
                <div className="terminal-title" style={{ fontSize: '15px' }}>
                  <FileText size={18} style={{ color: 'var(--color-info)' }} />
                  Master Mapped Ledger Grid ({filteredTransactions.length} of {reconData.reconciliationResults.length} records)
                </div>
                
                <div className="ledger-search-filters">
                  <div className="ledger-search-container">
                    <Search size={14} style={{ color: '#4b5563' }} />
                    <input 
                      type="text" 
                      className="ledger-search-input"
                      placeholder="Search payment ID, email, UTR..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="ledger-search-container" style={{ minWidth: 'auto', padding: '0 8px' }}>
                    <Filter size={14} style={{ color: '#4b5563' }} />
                    <select 
                      className="ledger-filter-select"
                      style={{ border: 'none', padding: '8px 4px', background: 'transparent' }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Records</option>
                      <option value="perfect">Perfect Matches</option>
                      <option value="variance">MDR Fee Variances</option>
                      <option value="refund">Partial Refunds</option>
                      <option value="cutoff">Timing Cutoffs</option>
                      <option value="dispute">Disputes & Holds</option>
                      <option value="exception">Unresolved Exceptions</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>Payment Capture (Razorpay)</th>
                      <th>ERP Invoice</th>
                      <th>Bank Settlement (Nodal)</th>
                      <th>Net Credited</th>
                      <th>Fee / Tax (MDR)</th>
                      <th>Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((item, index) => {
                      const pay = item.payment;
                      const inv = item.invoice;
                      const settle = item.settlements[0];
                      const isExc = item.status.includes('Mismatch') || item.status.includes('Missing') || item.status.includes('Duplicate') || item.status.includes('Orphan');

                      return (
                        <tr key={index} style={{ background: isExc ? 'rgba(239,68,68,0.015)' : 'none' }}>
                          <td>
                            <div className="cell-mono" style={{ fontWeight: '600', color: 'white' }}>{pay.id}</div>
                            <div className="cell-amount">₹{pay.amount.toLocaleString()}</div>
                            <div className="cell-sub">{pay.email} • {pay.method}</div>
                          </td>
                          <td>
                            {inv ? (
                              <>
                                <div className="cell-mono">{inv.id}</div>
                                <div className="cell-amount">₹{inv.amount.toLocaleString()}</div>
                                <div className="cell-sub">{new Date(inv.created_at).toLocaleDateString()}</div>
                              </>
                            ) : (
                              <span style={{ color: 'var(--color-error)', fontStyle: 'italic', fontSize: '11px' }}>Missing ERP Record</span>
                            )}
                          </td>
                          <td>
                            {settle && settle.utr ? (
                              <>
                                <div className="cell-mono">{settle.utr}</div>
                                <div className="cell-sub">Date: {settle.settle_date}</div>
                              </>
                            ) : settle?.status === 'on_hold' ? (
                              <span style={{ color: 'var(--color-warning)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldAlert size={12} /> Dispute Reserve Hold
                              </span>
                            ) : (
                              <span style={{ color: 'var(--color-error)', fontStyle: 'italic', fontSize: '11px' }}>Missing UTR / Credit</span>
                            )}
                          </td>
                          <td className="cell-amount">
                            {settle ? `₹${settle.net_amount.toLocaleString()}` : '₹0'}
                          </td>
                          <td className="cell-amount">
                            {settle ? `₹${settle.fee_deducted.toLocaleString()}` : `₹${pay.expected_fee.toLocaleString()} (Est.)`}
                            {item.variance > 0 && (
                              <div style={{ color: 'var(--color-warning)', fontSize: '10px' }}>
                                Variance: +₹{item.variance.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${
                              item.status === 'Perfect Match' ? 'perfect-match' :
                              item.status === 'Timing Cutoff Resolved' ? 'cutoff-match' :
                              item.status === 'MDR Fee Variance Detected' ? 'variance-match' :
                              item.status === 'Partial Refund Mismatch Resolved' ? 'refund-resolved' :
                              item.status === 'Disputed Hold - Resolved' ? 'dispute-resolved' : 'exception'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                          No records found matching search queries or selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
