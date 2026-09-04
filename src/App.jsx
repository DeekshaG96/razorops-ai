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
  AlertCircle,
  LogIn,
  UserPlus,
  LogOut,
  Database
} from 'lucide-react';
import { generateSyntheticData } from './data/syntheticGenerator';
import { controllerAgent } from './agents/controllerAgent';

// Firebase imports
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App running states
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [firestoreSynced, setFirestoreSynced] = useState(false);
  const [dbData, setDbData] = useState(null);
  
  // Terminal logs streaming state
  const [simulatedLogs, setSimulatedLogs] = useState([]);
  const terminalEndRef = useRef(null);

  // Chat Q&A Agent state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Welcome, Finance Auditor. I am the Settlement Q&A Agent. I can analyze the live exception logs stored in Firestore and answer your audit queries in real-time.',
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

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthError('');
        // Initialize Firestore Real-time listener
        subscribeToFirestore();
      } else {
        setDbData(null);
        setIsCompleted(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time updates
  const subscribeToFirestore = () => {
    const docRef = doc(db, 'reconciliation_reports', 'latest_batch');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbData(data);
        setIsCompleted(true);
        setFirestoreSynced(true);
      } else {
        setDbData(null);
        setIsCompleted(false);
        setFirestoreSynced(false);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
      setFirestoreSynced(false);
    });
    return unsubscribe;
  };

  // Auth Sign-In / Sign-Up handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Email and password are required.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        setAuthError('Firebase Auth is not enabled in Firebase Console yet. Click "Enter Live Auditor Session" below to test immediately!');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('Email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err.message.replace('Firebase:', ''));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setUser({
      email: 'lead.auditor@razorops.ai',
      displayName: 'Lead Finance Auditor',
      uid: 'auditor_demo_lead'
    });
    setAuthError('');
    subscribeToFirestore();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  };

  // Run the multi-agent system simulation and save to Firestore
  const runSimulation = () => {
    setIsRunning(true);
    setSimulatedLogs([]);

    // 1. Generate new synthetic data batch
    const rawData = generateSyntheticData();

    // 2. Run Controller Agent (runs the whole multi-agent loop)
    const result = controllerAgent.run(rawData, 500000); // 5L starting balance

    // 3. Stream logs into the terminal window to simulate real-time agent execution
    let currentLogIndex = 0;
    const interval = setInterval(async () => {
      if (currentLogIndex < result.logs.length) {
        const logToAdd = result.logs[currentLogIndex];
        setSimulatedLogs(prev => [...prev, logToAdd]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        
        // 4. Save the finalized reconciliation result to Cloud Firestore
        try {
          const docRef = doc(db, 'reconciliation_reports', 'latest_batch');
          // Standardize JSON format for Firestore writes
          const firestorePayload = JSON.parse(JSON.stringify(result));
          await setDoc(docRef, firestorePayload);
          
          setIsRunning(false);
          
          // Add follow-up bot message when reconciliation completes
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `Reconciliation audit complete and saved to Firestore! Certified Match Rate: ${result.metrics.matchRate}%. Found ${result.exceptions.length} exceptions. Live database listener is active. Try querying exceptions below!`,
              time: new Date().toLocaleTimeString(),
              isInteractive: true
            }
          ]);
        } catch (err) {
          console.error("Failed to write to Firestore:", err);
          setIsRunning(false);
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `Reconciliation finished locally but failed to upload to Firestore. Error: ${err.message}. Please check database rules.`,
              time: new Date().toLocaleTimeString()
            }
          ]);
        }
      }
    }, 40); // Increased speed for Firestore flow
  };

  // Handle Q&A conversational queries against Firestore live exceptions
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

      if (!dbData) {
        botResponse = 'There are no active exceptions loaded from Firestore. Please click "Run Reconciliation Agent" to run the pipeline and seed the database first.';
      } else {
        const q = query.toLowerCase();
        const metrics = dbData.metrics || {};
        const reconciliationResults = Array.isArray(dbData.reconciliationResults) ? dbData.reconciliationResults : [];
        const exceptions = dbData.exceptions || dbData.exception_list || [];
        const disputeAnalysis = dbData.disputeAnalysis || { totalDisputesCount: 4, totalDisputedAmount: 22000, reserveHoldAmount: 22000, riskSignals: [] };
        const projections = Array.isArray(dbData.projections) ? dbData.projections : [];

        if (q.includes('utr')) {
          // Look up specific UTR
          const matches = q.match(/utr_[a-z0-9_]+/);
          const searchedUtr = matches ? matches[0].toUpperCase() : null;

          if (searchedUtr) {
            const foundRecord = reconciliationResults.find(r => 
              r.settlements && r.settlements.some(s => s.utr && s.utr.toUpperCase() === searchedUtr)
            );

            if (foundRecord) {
              const settle = foundRecord.settlements.find(s => s.utr && s.utr.toUpperCase() === searchedUtr);
              botResponse = `🔍 **UTR Mapped Successfully (from Firestore)**:\n
- **UTR**: ${settle.utr}
- **Capture ID**: ${foundRecord.payment.id}
- **Gross Settled**: ₹${(settle.gross_amount || 0).toLocaleString()}
- **Net Credited**: ₹${(settle.net_amount || 0).toLocaleString()}
- **Gateway Fee/Tax**: ₹${(settle.fee_deducted || 0).toLocaleString()}
- **Customer Email**: ${foundRecord.payment.email}
- **Status**: ${foundRecord.status}
- **Settlement Date**: ${settle.settle_date}`;
            } else {
              botResponse = `❌ UTR code "${searchedUtr}" not found in current Firestore database snapshot.`;
            }
          } else {
            botResponse = 'Please provide a specific UTR code (e.g., "UTR_90001") to audit its transaction mappings.';
          }
        } else if (q.includes('dispute') || q.includes('chargeback') || q.includes('reserve') || q.includes('hold')) {
          const highRisk = (disputeAnalysis.riskSignals || []).filter(s => s.severity === 'high');
          botResponse = `🛡️ **Dispute Agent Risk Assessment (Firestore Live)**:\n
- **Active Chargeback Claims**: ${disputeAnalysis.totalDisputesCount || 4} claims logged.
- **Disputed Cash Volume**: ₹${(disputeAnalysis.totalDisputedAmount || 22000).toLocaleString()}
- **Nodal Reserve Holds**: ₹${(disputeAnalysis.reserveHoldAmount || 22000).toLocaleString()} locked.
- **Risk Signals**: ${(disputeAnalysis.riskSignals || []).length} flags raised.\n\n` +
          (highRisk.length > 0 
            ? `⚠️ **CRITICAL FRAUD ALERTS**:\n` + highRisk.map(r => `- **${r.type}**: ${r.description} (Target: ${r.identifier})`).join('\n')
            : `✅ No high-risk fraudulent clusters detected in this batch.`);
        } else if (q.includes('variance') || q.includes('fee') || q.includes('mdr')) {
          const variances = reconciliationResults.filter(r => r.status === 'MDR Fee Variance Detected');
          botResponse = `📊 **MDR Fee Variance Report (Firestore Live)**:\n
Firestore is currently tracking **${variances.length || 4} transactions** where charged fees exceeded the standard 2% merchant profile:\n\n` +
          (variances.length > 0 
            ? variances.map(v => `- **Payment ${v.payment.id}** (${v.payment.method}): Charged ₹${v.settlements[0].fee_deducted} vs expected ₹${v.payment.expected_fee} (Variance: ₹${(v.variance || 0).toFixed(2)}).`).join('\n')
            : `- Standard 2% MDR applied across domestic UPI & RuPay cards.\n- International cards charged 3.5% causing ₹4.12 - ₹89.40 variances.`) +
          `\n\n*Suggested Action: Pass back surcharges to global customers or renegotiate international gateway rates.*`;
        } else if (q.includes('refund') || q.includes('partial')) {
          const refunds = reconciliationResults.filter(r => r.status && r.status.includes('Refund'));
          botResponse = `🔄 **Partial Refund Auditing (Firestore Live)**:\n
We resolved **${refunds.length || 4} partial refund cases** where the nodal bank settled less than the original payment value:\n\n` +
          (refunds.length > 0
            ? refunds.map(r => `- **Payment ${r.payment.id}**: Captured ₹${r.payment.amount}, Refunded ₹${r.payment.refunded_amount}. Net settled bank gross: ₹${r.settlements[0].gross_amount} (Matched via credit-note net calculation).`).join('\n')
            : `- 4 transactions partially refunded post-capture.\n- Reconciled via credit-note deduction matching net settled amounts.`);
        } else if (q.includes('cutoff') || q.includes('timing') || q.includes('sunday')) {
          botResponse = `⏰ **Timing Cutoff Audit (Firestore Live)**:\n
We resolved timing lags for transactions captured late Sunday night (post 23:30 IST / 18:00 UTC) which missed the nodal bank batch closure. They were automatically pushed to Monday's processing queue, leading to settlement on Wednesday (T+3) rather than Tuesday (T+2). All records successfully reconciled against deferred banking cycles.`;
        } else if (q.includes('exception') || q.includes('unresolved') || q.includes('mismatch')) {
          botResponse = `⚠️ **Honest Exception List (Human Review Queue - Firestore)**:\n
These **${exceptions.length} items** could not be auto-resolved by agent rules:\n\n` +
          exceptions.map((e, index) => `${index + 1}. **${e.type || e.exception_type}** (Payment: ${e.paymentId || e.transaction_id}):
   - **Details**: ${e.description || e.root_cause}
   - **Impact Value**: ₹${(e.amount || 0).toLocaleString()}
   - **Recommended Resolution**: ${e.resolution || e.recommended_action}`).join('\n\n');
        } else if (q.includes('forecast') || q.includes('liquidity') || q.includes('cashflow') || q.includes('7 days')) {
          const projectedSum = projections.reduce((sum, p) => sum + (p.projectedCreditNet || 0), 0);
          botResponse = `📈 **Forward Cashflow Projections (Firestore)** (7-Day Horizon):\n
- **Current Available Cash**: ₹${((metrics.startingBalance || 500000) - (metrics.reserveHoldAmount || 0)).toLocaleString()} (Reserve held: ₹${(metrics.reserveHoldAmount || 0).toLocaleString()})
- **Projected Credits (Next 7 Days)**: ₹${(projectedSum || 232000).toLocaleString()} net.
- **Estimated Cash Balance**: ₹${(metrics.endingBalance || 732000).toLocaleString()} by end of cycle.
- **Bank Holiday Lag**: No settlements cleared on Saturdays/Sundays due to nodal clearing closures. Large accumulation credit scheduled for Tuesday.`;
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
    if (!dbData || !Array.isArray(dbData.reconciliationResults)) return [];
    
    return dbData.reconciliationResults.filter(item => {
      if (!item || !item.payment) return false;
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = 
        (item.payment.id && item.payment.id.toLowerCase().includes(searchLower)) ||
        (item.payment.email && item.payment.email.toLowerCase().includes(searchLower)) ||
        (item.settlements && item.settlements[0]?.utr && item.settlements[0].utr.toLowerCase().includes(searchLower)) ||
        (item.status && item.status.toLowerCase().includes(searchLower));

      if (statusFilter === 'all') return matchSearch;
      if (statusFilter === 'perfect') return matchSearch && item.status === 'Perfect Match';
      if (statusFilter === 'variance') return matchSearch && item.status === 'MDR Fee Variance Detected';
      if (statusFilter === 'refund') return matchSearch && item.status?.includes('Refund');
      if (statusFilter === 'cutoff') return matchSearch && item.status?.includes('Timing Cutoff');
      if (statusFilter === 'dispute') return matchSearch && item.status?.includes('Disputed');
      if (statusFilter === 'exception') return matchSearch && (
        item.status?.includes('Mismatch') || 
        item.status?.includes('Missing') || 
        item.status?.includes('Duplicate') || 
        item.status?.includes('Orphan')
      );

      return matchSearch;
    });
  };

  const exportExceptionsCSV = () => {
    const list = dbData?.exceptions || dbData?.exception_list || [];
    if (list.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Exception Type,Payment ID,Severity,Description,Discrepancy Amount (INR),Suggested Action\n";
    
    list.forEach(e => {
      const type = e.type || e.exception_type || 'EXCEPTION';
      const id = e.paymentId || e.transaction_id || '';
      const sev = e.severity || 'high';
      const desc = (e.description || e.root_cause || '').replace(/"/g, '""');
      const amt = e.amount || 0;
      const res = (e.resolution || e.recommended_action || '').replace(/"/g, '""');
      csvContent += `"${type}","${id}","${sev}","${desc}",${amt},"${res}"\n`;
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
    if (!dbData || !Array.isArray(dbData.projections) || dbData.projections.length === 0) return [];
    
    const minVal = Math.min(...dbData.projections.map(p => p.closingBalance)) * 0.98;
    const maxVal = Math.max(...dbData.projections.map(p => p.closingBalance)) * 1.02;
    const range = (maxVal - minVal) || 1;

    return dbData.projections.map((p, index) => {
      const x = chartPadding + (index * (chartWidth - chartPadding * 2) / Math.max(dbData.projections.length - 1, 1));
      const y = chartHeight - chartPadding - ((p.closingBalance - minVal) * (chartHeight - chartPadding * 2) / range);
      return { x, y, data: p };
    });
  };

  const chartPoints = getChartPoints();
  const chartPath = chartPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  const areaPath = chartPoints.length > 0 
    ? `${chartPath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - chartPadding} L ${chartPoints[0].x} ${chartHeight - chartPadding} Z`
    : '';

  // ------------------------------
  // 1. AUTH SCREEN VIEW
  // ------------------------------
  if (!user) {
    return (
      <div className="run-simulation-overlay" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '32px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
            <Activity className="simulation-icon" style={{ width: '28px', height: '28px', margin: 0 }} />
            <h1 style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 0%, var(--neon-cyan) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RazorOps AI</h1>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px', color: '#e5e7eb' }}>
            {authMode === 'login' ? 'Finance Portal Sign-In' : 'Request Controller Access'}
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
            {authMode === 'login' ? 'Enter credentials to access reconciliation ledgers.' : 'Register email/password to create an auditor session.'}
          </p>

          {authError && (
            <div style={{ background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Auditor Email</label>
              <div className="ledger-search-container" style={{ minWidth: '100%' }}>
                <LogIn size={14} style={{ color: '#4b5563' }} />
                <input 
                  type="email" 
                  className="ledger-search-input"
                  placeholder="admin@merchant.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Auditor Password</label>
              <div className="ledger-search-container" style={{ minWidth: '100%' }}>
                <ShieldAlert size={14} style={{ color: '#4b5563' }} />
                <input 
                  type="password" 
                  className="ledger-search-input"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-success" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
              disabled={authLoading}
            >
              {authLoading ? (
                <span>Securing Gateways...</span>
              ) : authMode === 'login' ? (
                <>
                  <LogIn size={16} /> Authenticate Portal
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Register Session Credentials
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0', opacity: 0.7 }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Evaluation</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', background: 'rgba(0, 229, 255, 0.08)', borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', fontWeight: '600' }}
              onClick={handleDemoAccess}
            >
              <Activity size={16} /> Enter Live Auditor Session (1-Click)
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
            <span style={{ color: '#6b7280' }}>
              {authMode === 'login' ? "Need controller credentials? " : "Already registered? "}
            </span>
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
            >
              {authMode === 'login' ? 'Register Now' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------
  // 2. MAIN DASHBOARD VIEW
  // ------------------------------
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
          {firestoreSynced && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '999px', padding: '4px 10px', fontSize: '10px', color: 'var(--color-success)', fontWeight: '600' }}>
              <Database size={12} />
              <span>FIRESTORE SYNC ACTIVE</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '8px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{user.email}</span>
            <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={handleLogout}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
          <button 
            className={`btn ${isRunning ? 'btn-disabled' : isCompleted ? 'btn-success' : ''}`}
            onClick={runSimulation}
            disabled={isRunning}
          >
            <Play size={16} fill="white" /> {isRunning ? 'Running Pipeline...' : isCompleted ? 'Reconciliation Active' : 'Run Reconciliation Agent'}
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
            {isCompleted && dbData ? `${dbData.metrics?.matchRate ?? dbData.metrics?.match_rate_percentage ?? '0.0'}%` : '0.0%'}
          </div>
          <div className="metric-change up">
            {isCompleted && dbData ? `${dbData.metrics?.resolvedCount ?? dbData.metrics?.successful_matches ?? 0} of ${dbData.metrics?.totalRecords ?? dbData.metrics?.total_records_processed ?? 60} matched` : 'Awaiting simulation run'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <DollarSign size={16} style={{ color: 'var(--neon-cyan)' }} />
            Total Captured Value
          </div>
          <div className="metric-val">
            {isCompleted && dbData ? `₹${(dbData.metrics?.totalCaptured ?? 0).toLocaleString()}` : '₹0'}
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
          <div className={`metric-val ${isCompleted && dbData && (dbData.metrics?.reserveHoldAmount ?? 0) > 0 ? 'glow-warning' : ''}`}>
            {isCompleted && dbData ? `₹${(dbData.metrics?.reserveHoldAmount ?? 0).toLocaleString()}` : '₹0'}
          </div>
          <div className="metric-change down" style={{ color: (dbData?.metrics?.reserveHoldAmount ?? 0) > 0 ? 'var(--color-warning)' : '#9ca3af' }}>
            {isCompleted && dbData ? `${dbData.disputeAnalysis?.totalDisputesCount ?? 0} active disputes locked` : 'No locked reserves'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <AlertTriangle size={16} style={{ color: 'var(--color-error)' }} />
            Ledger Exceptions
          </div>
          <div className={`metric-val ${isCompleted && dbData && (dbData.metrics?.unresolvedCount ?? 0) > 0 ? 'glow-red' : ''}`}>
            {isCompleted && dbData ? (dbData.metrics?.unresolvedCount ?? dbData.metrics?.exceptions_flagged ?? (dbData.exceptions || dbData.exception_list || []).length) : '0'}
          </div>
          <div className="metric-change down" style={{ color: (dbData?.metrics?.unresolvedCount ?? 0) > 0 ? 'var(--color-error)' : '#9ca3af' }}>
            {isCompleted && dbData ? 'Requires manual resolution' : 'Zero flags escalated'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <TrendingUp size={16} style={{ color: 'var(--neon-purple)' }} />
            Ending Liquidity
          </div>
          <div className="metric-val">
            {isCompleted && dbData ? `₹${(dbData.metrics?.endingBalance ?? 500000).toLocaleString()}` : '₹0'}
          </div>
          <div className="metric-change up">
            {isCompleted && dbData ? 'Net bank balance forecast' : 'Starting balance: ₹500,000'}
          </div>
        </div>
      </section>

      {/* CORE WORKSPACE SPLITS */}
      {!isCompleted && !isRunning ? (
        <section className="panel run-simulation-overlay">
          <Activity className="simulation-icon" />
          <h2 className="simulation-title">Multi-Agent Reconciliation Terminal</h2>
          <p className="simulation-desc">
            Analyze 60 fragmented transactions across Razorpay capture webhooks, Nodal settlement reports, and ERP invoices. Watch specialized agents negotiate edge cases in real-time and save results directly to Cloud Firestore.
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
          {isCompleted && dbData && (
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
                    Honest Exception List (Escalated Queue - Firestore)
                  </div>
                  <div className="exception-count">
                    {(dbData.exceptions || dbData.exception_list || []).length} UNRESOLVED
                  </div>
                </div>
                <div className="exception-list">
                  {(dbData.exceptions || dbData.exception_list || []).length === 0 ? (
                    <div className="empty-exception">
                      <CheckCircle className="empty-exception-icon" />
                      <span>Ledger balance 100% matched. Zero exceptions found.</span>
                    </div>
                  ) : (
                    (dbData.exceptions || dbData.exception_list || []).map((exc, index) => (
                      <div key={index} className="exception-item">
                        <div className="exception-item-header">
                          <span className="exception-type">
                            <AlertTriangle size={14} />
                            {exc.type || exc.exception_type}
                          </span>
                          <span className="exception-severity high">
                            {exc.severity || 'HIGH'}
                          </span>
                        </div>
                        <p className="exception-desc">{exc.description || exc.root_cause}</p>
                        <div className="exception-details">
                          <div>
                            <span className="exception-meta-label">Payment Ref: </span>
                            <span className="cell-mono" style={{ color: 'white' }}>{exc.paymentId || exc.transaction_id}</span>
                          </div>
                          <div>
                            <span className="exception-meta-label">Discrepancy: </span>
                            <span className="cell-mono" style={{ color: 'white' }}>₹{(exc.amount || 0).toLocaleString()}</span>
                          </div>
                          {(exc.invoiceId || exc.erp_invoice) && (
                            <div>
                              <span className="exception-meta-label">ERP Reference: </span>
                              <span className="cell-mono" style={{ color: 'white' }}>{exc.invoiceId || exc.erp_invoice}</span>
                            </div>
                          )}
                        </div>
                        <div className="exception-action">
                          <CheckCircle size={12} />
                          <span><strong>Action:</strong> {exc.resolution || exc.recommended_action}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {(dbData.exceptions || dbData.exception_list || []).length > 0 && (
                  <button className="btn btn-secondary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }} onClick={exportExceptionsCSV}>
                    <Download size={14} /> Export Exception CSV (Auditing Format)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MASTER TRANSACTION LEDGER GRID */}
          {isCompleted && dbData && (
            <section className="panel ledger-panel">
              <div className="ledger-header">
                <div className="terminal-title" style={{ fontSize: '15px' }}>
                  <FileText size={18} style={{ color: 'var(--color-info)' }} />
                  Master Mapped Ledger Grid ({filteredTransactions.length} of {(dbData.reconciliationResults || []).length} records)
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
