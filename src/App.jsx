// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Layers,
  ArrowRight,
  Database,
  Lock,
  Mail,
  Zap,
  Globe,
  UserCheck
} from 'lucide-react';

// Firebase imports
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Agents & Data Generators
import { generateSyntheticData } from './data/syntheticGenerator';
import { controllerAgent } from './agents/controllerAgent';
import { 
  parseFileToJSON, 
  normalizePayments, 
  normalizeSettlements, 
  normalizeInvoices, 
  normalizeDisputes 
} from './utils/csvParser';

// Modular SaaS Views & Authentic Razorpay Layout
import RazorpaySidebar from './components/RazorpaySidebar';
import RazorpayTopbar from './components/RazorpayTopbar';
import ReconciliationStudio from './components/ReconciliationStudio';
import MasterLedgerView from './components/MasterLedgerView';
import ExceptionsDesk from './components/ExceptionsDesk';
import LiquidityForecastView from './components/LiquidityForecastView';
import CopilotChatView from './components/CopilotChatView';
import HistoricalBatchesView from './components/HistoricalBatchesView';
import SettingsHub from './components/SettingsHub';
import AuthModal from './components/AuthModal';
import LoginPage from './components/LoginPage';

export default function App() {
  // Navigation & Layout (Defaults to normal login page, or preserves URL hash/guest session)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['studio', 'ledger', 'exceptions', 'forecast', 'copilot', 'history', 'settings', 'login'].includes(hash)) {
        return hash;
      }
      if (sessionStorage.getItem('razorops_guest_mode') === 'true') {
        return 'studio';
      }
    }
    return 'login';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auth state
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Ingestion Mode & Uploaded Files
  const [ingestionMode, setIngestionMode] = useState('upload'); // 'upload' | 'demo'
  const [uploadedFiles, setUploadedFiles] = useState({
    razorpay: null,
    bank: null,
    erp: null
  });

  // Reconciliation Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [firestoreSynced, setFirestoreSynced] = useState(false);
  const [dbData, setDbData] = useState(null);
  const [activeBatchId, setActiveBatchId] = useState('latest_batch');
  const [simulatedLogs, setSimulatedLogs] = useState([]);
  const terminalEndRef = useRef(null);

  // Firestore Historical Batches
  const [historicalBatches, setHistoricalBatches] = useState([]);

  // HITL Resolved Exceptions
  const [resolvedExceptionIds, setResolvedExceptionIds] = useState({});

  // Settings & Credentials (never expose .env secrets into editable input states)
  const [razorpayKeyId, setRazorpayKeyId] = useState(() => localStorage.getItem('razorops_rzp_key_id') || '');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(() => localStorage.getItem('razorops_rzp_key_secret') || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(() => {
    const saved = localStorage.getItem('razorops_openai_api_key') || '';
    return (saved && saved === import.meta.env?.VITE_OPENAI_API_KEY) ? '' : saved;
  });
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    const saved = localStorage.getItem('razorops_gemini_api_key') || '';
    return (saved && saved === import.meta.env?.VITE_GEMINI_API_KEY) ? '' : saved;
  });
  const [mdrRates, setMdrRates] = useState(() => {
    try {
      const saved = localStorage.getItem('razorops_mdr_rates');
      return saved ? JSON.parse(saved) : { card: 2.0, upi: 0.0, netbanking: 1.8, gst: 18.0 };
    } catch {
      return { card: 2.0, upi: 0.0, netbanking: 1.8, gst: 18.0 };
    }
  });

  // Copilot Chat Messages
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Welcome, Finance Auditor. I am your autonomous Settlement & Audit Copilot. I analyze live payment batches, bank UTR timings, chargeback reserves, and nodal cutoffs in real time.',
      time: new Date().toLocaleTimeString()
    }
  ]);

  // Terminal Auto-Scroll
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulatedLogs]);

  // URL Hash Synchronization (#login, #studio, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['studio', 'ledger', 'exceptions', 'forecast', 'copilot', 'history', 'settings', 'login'].includes(hash)) {
        setActiveTab((prev) => (prev !== hash ? hash : prev));
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Update hash when activeTab changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.replace('#', '') !== activeTab) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  // Fetch Firestore Historical Batches
  const fetchHistoricalBatches = async () => {
    try {
      const batchesRef = collection(db, 'reconciliation_batches');
      const q = query(batchesRef, orderBy('timestamp', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      const batches = [];
      querySnapshot.forEach((doc) => {
        batches.push({ id: doc.id, ...doc.data() });
      });
      if (batches.length > 0) {
        setHistoricalBatches(batches);
      }
    } catch (err) {
      console.warn("Could not fetch historical batches from Firestore:", err.message);
    }
  };

  // Subscribe to latest batch in Firestore
  const subscribeToFirestore = () => {
    try {
      const docRef = doc(db, 'reconciliation_reports', 'latest_batch');
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDbData(data);
          setIsCompleted(true);
          setFirestoreSynced(true);
        }
      }, (error) => {
        console.warn("Firestore subscription note (offline fallback active):", error.message);
        setFirestoreSynced(false);
      });
      return unsubscribe;
    } catch (err) {
      console.warn("Firestore listener initialization failed:", err.message);
    }
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthError('');
        subscribeToFirestore();
        fetchHistoricalBatches();
      } else {
        // Auto-run synthetic demo data if not yet loaded
        if (!dbData) {
          const demoData = generateSyntheticData();
          const demoResult = controllerAgent.run(demoData);
          setDbData(demoResult);
          setIsCompleted(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auth Handlers
  const handleEmailAuth = async (email, password, isSignUp) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      if (!isSignUp) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      if (err.code === 'auth/configuration-not-found') {
        setAuthError('Firebase Auth email provider is in sandbox. Use "1-Click Live Auditor Sign In" above!');
      } else if (err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password.');
      } else {
        setAuthError(err.message.replace('Firebase:', ''));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuditorLogin = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('razorops_guest_mode', 'true');
    }
    setUser({
      email: 'lead.auditor@razorops.ai',
      displayName: 'Lead Compliance Auditor',
      uid: 'auditor_session_lead',
      photoURL: null
    });
    setAuthError('');
    setIsAuthModalOpen(false);
    subscribeToFirestore();
    fetchHistoricalBatches();
    setActiveTab('studio');
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('razorops_guest_mode', 'true');
      }
      setActiveTab('studio');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message.replace('Firebase:', ''));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    // 1. Immediately reset state and navigation to avoid any hanging UI
    setUser(null);
    setAuthError('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('razorops_guest_mode');
      localStorage.removeItem('razorops_guest_mode');
      window.location.hash = 'login';
    }
    setActiveTab('login');

    // 2. Perform Firebase Auth signOut asynchronously
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out err:", err);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (type, file) => {
    const rawRows = await parseFileToJSON(file);
    if (!rawRows || rawRows.length === 0) {
      throw new Error(`File ${file.name} appears to be empty.`);
    }

    let normalizedData = [];
    if (type === 'razorpay') {
      normalizedData = normalizePayments(rawRows);
    } else if (type === 'bank') {
      normalizedData = normalizeSettlements(rawRows);
    } else if (type === 'erp') {
      normalizedData = normalizeInvoices(rawRows);
    }

    setUploadedFiles(prev => ({
      ...prev,
      [type]: {
        name: file.name,
        size: file.size,
        rowsCount: normalizedData.length,
        data: normalizedData
      }
    }));
  };

  const handleRemoveFile = (type) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }));
  };

  // Run Multi-Agent Engine
  const handleRunEngine = async () => {
    setIsRunning(true);
    setSimulatedLogs([]);

    let datasetToReconcile;
    let batchLabel = 'Multi-Source Upload Batch';

    if (ingestionMode === 'upload') {
      const payments = uploadedFiles.razorpay?.data || [];
      if (payments.length === 0) {
        setIsRunning(false);
        alert('Please upload a Razorpay settlement file or click Instant Demo Stream.');
        return;
      }
      const settlements = normalizeSettlements(uploadedFiles.bank?.data, payments);
      const invoices = normalizeInvoices(uploadedFiles.erp?.data, payments);
      const disputes = normalizeDisputes([], payments);

      datasetToReconcile = { payments, settlements, invoices, disputes };
      batchLabel = `Upload: ${uploadedFiles.razorpay?.name || 'settlements.csv'}`;
    } else {
      datasetToReconcile = generateSyntheticData();
      batchLabel = 'Automated Demo Stream (61 Records)';
    }

    // Run the Controller Agent
    const result = controllerAgent.run(datasetToReconcile);
    const generatedBatchId = `batch_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;

    // Stream logs into terminal
    const logs = result.logs || [];
    let logIdx = 0;
    const interval = setInterval(async () => {
      if (logIdx < logs.length) {
        const batchLogs = logs.slice(logIdx, logIdx + 5);
        setSimulatedLogs(prev => [...prev, ...batchLogs]);
        logIdx += 5;
      } else {
        clearInterval(interval);

        // Finalize state
        setDbData(result);
        setIsCompleted(true);
        setIsRunning(false);
        setActiveBatchId(generatedBatchId);

        // Add follow-up copilot notification
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `Reconciliation audit certified! Match Rate: ${result.metrics.matchRate}%. Loaded ${result.exceptions.length} exceptions into controller engine. Ready for interactive HITL resolution!`,
            time: new Date().toLocaleTimeString()
          }
        ]);

        // Save to Cloud Firestore
        try {
          const batchPayload = {
            batchId: generatedBatchId,
            sourceType: batchLabel,
            timestamp: new Date().toISOString(),
            metrics: result.metrics,
            exceptions: result.exceptions,
            projections: result.projections,
            reconciliationResults: result.reconciliationResults
          };

          // Save latest batch
          await setDoc(doc(db, 'reconciliation_reports', 'latest_batch'), JSON.parse(JSON.stringify(result)));
          // Save historical batch record
          await setDoc(doc(db, 'reconciliation_batches', generatedBatchId), JSON.parse(JSON.stringify(batchPayload)));

          setFirestoreSynced(true);
          fetchHistoricalBatches();
        } catch (err) {
          console.warn("Firestore save fallback (local active):", err.message);
        }
      }
    }, 120);
  };

  // HITL Exception Resolution
  const handleResolveException = async (paymentId, memo) => {
    setResolvedExceptionIds(prev => ({
      ...prev,
      [paymentId]: memo
    }));

    if (!dbData) return;

    // Update local state
    const updatedResults = (dbData.reconciliationResults || []).map(item => {
      if (item.paymentId === paymentId) {
        return {
          ...item,
          status: 'Dispatched to Nodal Desk',
          notes: `Resolved via ${memo.memoId} (${memo.actionNote})`
        };
      }
      return item;
    });

    const newUnresolvedCount = Math.max(0, (dbData.metrics?.unresolvedCount || 1) - 1);
    const newResolvedCount = (dbData.metrics?.resolvedCount || 0) + 1;
    const newMatchRate = parseFloat(((newResolvedCount / (dbData.metrics?.totalRecords || 1)) * 100).toFixed(1));

    const updatedData = {
      ...dbData,
      metrics: {
        ...dbData.metrics,
        unresolvedCount: newUnresolvedCount,
        resolvedCount: newResolvedCount,
        matchRate: newMatchRate
      },
      reconciliationResults: updatedResults
    };

    setDbData(updatedData);

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'reconciliation_reports', 'latest_batch'), JSON.parse(JSON.stringify(updatedData)));
    } catch (err) {
      console.warn("Firestore sync warning:", err.message);
    }
  };

  // Load Past Batch from Firestore
  const handleLoadBatch = (batch) => {
    setDbData(batch);
    setActiveBatchId(batch.batchId || batch.id);
    setActiveTab('studio');
  };

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem('razorops_rzp_key_id', razorpayKeyId);
    localStorage.setItem('razorops_rzp_key_secret', razorpayKeySecret);
    localStorage.setItem('razorops_openai_api_key', openaiApiKey);
    localStorage.setItem('razorops_gemini_api_key', geminiApiKey);
    localStorage.setItem('razorops_mdr_rates', JSON.stringify(mdrRates));
  };

  // Pre-load demo dataset on mount if none exists & clean any accidental storage of env secrets
  useEffect(() => {
    if (!dbData) {
      const demoData = generateSyntheticData();
      const result = controllerAgent.run(demoData);
      setDbData(result);
    }
    // Clean any prior localStorage saves of environment keys
    if (localStorage.getItem('razorops_openai_api_key') === import.meta.env?.VITE_OPENAI_API_KEY) {
      localStorage.removeItem('razorops_openai_api_key');
    }
    if (localStorage.getItem('razorops_gemini_api_key') === import.meta.env?.VITE_GEMINI_API_KEY) {
      localStorage.removeItem('razorops_gemini_api_key');
    }
  }, []);

  // Dedicated Full-Screen Razorpay Merchant Login Portal
  if (activeTab === 'login') {
    return (
      <LoginPage
        user={user}
        onSignOut={handleSignOut}
        onAuditorLogin={() => {
          handleAuditorLogin();
        }}
        onGoogleSignIn={async () => {
          await handleGoogleSignIn();
        }}
        onEmailAuth={async (email, password, isSignUp) => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('razorops_guest_mode', 'true');
          }
          await handleEmailAuth(email, password, isSignUp);
          setActiveTab('studio');
        }}
        authError={authError}
        authLoading={authLoading}
        onSkipToDashboard={() => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('razorops_guest_mode', 'true');
          }
          setActiveTab('studio');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans flex antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-blue-400/[0.06] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-sky-300/[0.06] rounded-full blur-[140px]" />
      </div>

      {/* Razorpay Left Sidebar */}
      <RazorpaySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignOut={handleSignOut}
        onAuditorLogin={() => setIsAuthModalOpen(true)}
        firestoreSynced={firestoreSynced}
        unresolvedCount={dbData?.metrics?.unresolvedCount || dbData?.exceptions?.length || 0}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace Column with Topbar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        
        {/* Razorpay Topbar */}
        <RazorpayTopbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
          onRunEngine={handleRunEngine}
          isRunning={isRunning}
          user={user}
          onAuditorLogin={handleAuditorLogin}
          onSignOut={handleSignOut}
          unresolvedCount={dbData?.metrics?.unresolvedCount || dbData?.exceptions?.length || 0}
        />

        {/* Main Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Sleek Evaluator Notice (if not logged in) */}
          {!user && (
            <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
              <div className="flex items-center space-x-3 text-xs">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-950 tracking-tight text-sm">Evaluator Sandbox Session</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Live Execution Enabled</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Testing Razorpay Track 4? You can open the dedicated Merchant Login Portal or authenticate in 1-click.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto flex-shrink-0">
                <button
                  id="open-login-portal-banner-btn"
                  onClick={() => setActiveTab('login')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#0c2340] hover:bg-[#163a66] text-white rounded-xl text-xs font-bold shadow-sm whitespace-nowrap transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Open Merchant Login Page</span>
                </button>
                <button
                  onClick={handleAuditorLogin}
                  className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>1-Click Fast Pass</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 1: Studio */}
          {activeTab === 'studio' && (
            <ReconciliationStudio
              mode={ingestionMode}
              setMode={setIngestionMode}
              onRunEngine={handleRunEngine}
              isRunning={isRunning}
              metrics={dbData?.metrics || {}}
              simulatedLogs={simulatedLogs}
              terminalEndRef={terminalEndRef}
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
              activeBatchId={activeBatchId}
            />
          )}

          {/* Tab 2: Master Ledger */}
          {activeTab === 'ledger' && (
            <MasterLedgerView
              reconciliationResults={dbData?.reconciliationResults || []}
              metrics={dbData?.metrics || {}}
            />
          )}

          {/* Tab 3: Exceptions Desk */}
          {activeTab === 'exceptions' && (
            <ExceptionsDesk
              exceptions={dbData?.exceptions || []}
              resolvedExceptionIds={resolvedExceptionIds}
              onResolveException={handleResolveException}
            />
          )}

          {/* Tab 4: Liquidity Forecast */}
          {activeTab === 'forecast' && (
            <LiquidityForecastView
              projections={dbData?.projections || []}
              metrics={dbData?.metrics || {}}
            />
          )}

          {/* Tab 5: Copilot Chat */}
          {activeTab === 'copilot' && (
            <CopilotChatView
              contextData={dbData}
              openaiApiKey={openaiApiKey}
              setOpenaiApiKey={setOpenaiApiKey}
              geminiApiKey={geminiApiKey}
              setGeminiApiKey={setGeminiApiKey}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
            />
          )}

          {/* Tab 6: Historical Batches */}
          {activeTab === 'history' && (
            <HistoricalBatchesView
              historicalBatches={historicalBatches}
              onLoadBatch={handleLoadBatch}
              activeBatchId={activeBatchId}
            />
          )}

          {/* Tab 7: Settings */}
          {activeTab === 'settings' && (
            <SettingsHub
              razorpayKeyId={razorpayKeyId}
              setRazorpayKeyId={setRazorpayKeyId}
              razorpayKeySecret={razorpayKeySecret}
              setRazorpayKeySecret={setRazorpayKeySecret}
              openaiApiKey={openaiApiKey}
              setOpenaiApiKey={setOpenaiApiKey}
              geminiApiKey={geminiApiKey}
              setGeminiApiKey={setGeminiApiKey}
              mdrRates={mdrRates}
              setMdrRates={setMdrRates}
              onSaveSettings={handleSaveSettings}
            />
          )}

        </main>

        {/* Razorpay Minimalist Footer */}
        <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 bg-white mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="font-bold text-slate-700">Razorpay OpsAI</span>
              <span>•</span>
              <span className="text-slate-500">Autonomous 3-Way Reconciliation & Liquidity Copilot</span>
            </div>
            <div className="text-[10.5px] text-slate-400">
              Razorpay Hackathon Track 4 • Powered by Multi-Agent Architecture & Google Gemini 2.5 Flash
            </div>
          </div>
        </footer>

      </div>

      {/* Razorpay Authentic Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuditorLogin={handleAuditorLogin}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailAuth={handleEmailAuth}
        authError={authError}
        authLoading={authLoading}
      />

    </div>
  );
}
