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
  Globe
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

// Modular SaaS Views
import Navigation from './components/Navigation';
import ReconciliationStudio from './components/ReconciliationStudio';
import MasterLedgerView from './components/MasterLedgerView';
import ExceptionsDesk from './components/ExceptionsDesk';
import LiquidityForecastView from './components/LiquidityForecastView';
import CopilotChatView from './components/CopilotChatView';
import HistoricalBatchesView from './components/HistoricalBatchesView';
import SettingsHub from './components/SettingsHub';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('studio');

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

  // Settings & Credentials
  const [razorpayKeyId, setRazorpayKeyId] = useState(() => localStorage.getItem('razorops_rzp_key_id') || '');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(() => localStorage.getItem('razorops_rzp_key_secret') || '');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('razorops_gemini_api_key') || '');
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
      if (err.code === 'auth/configuration-not-found') {
        setAuthError('Firebase Auth is in sandbox mode. Click "Enter Live Auditor Session" to test immediately!');
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
    setUser({
      email: 'lead.auditor@razorops.ai',
      displayName: 'Lead Compliance Auditor',
      uid: 'auditor_session_lead',
      photoURL: null
    });
    setAuthError('');
    subscribeToFirestore();
    fetchHistoricalBatches();
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message.replace('Firebase:', ''));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out err:", err);
    }
    setUser(null);
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
    localStorage.setItem('razorops_gemini_api_key', geminiApiKey);
    localStorage.setItem('razorops_mdr_rates', JSON.stringify(mdrRates));
  };

  // Pre-load demo dataset on mount if none exists
  useEffect(() => {
    if (!dbData) {
      const demoData = generateSyntheticData();
      const result = controllerAgent.run(demoData);
      setDbData(result);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      
      {/* SaaS Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignOut={handleSignOut}
        onAuditorLogin={handleAuditorLogin}
        firestoreSynced={firestoreSynced}
        unresolvedCount={dbData?.metrics?.unresolvedCount || dbData?.exceptions?.length || 0}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Auth Barrier Notice (if not logged in) */}
        {!user && (
          <div className="mb-6 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Evaluator Sandbox Session Active</h3>
                <p className="text-xs text-slate-400">
                  You are previewing RazorOps AI with full multi-agent reconciliation privileges. Authenticate below to link live Cloud Firestore merchant accounts.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleAuditorLogin}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 whitespace-nowrap"
              >
                1-Click Auditor Session
              </button>
              <button
                onClick={handleGoogleSignIn}
                className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap"
              >
                Google Sign In
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
            metrics={dbData?.metrics}
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
            geminiApiKey={geminiApiKey}
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
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
            mdrRates={mdrRates}
            setMdrRates={setMdrRates}
            onSaveSettings={handleSaveSettings}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">RazorOps AI</span>
            <span>•</span>
            <span>Razorpay Autonomous Reconciliation & Liquidity Copilot</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Certified Multi-Agent Compliance Engine • Built for Razorpay Hackathon Track 4
          </div>
        </div>
      </footer>

    </div>
  );
}
