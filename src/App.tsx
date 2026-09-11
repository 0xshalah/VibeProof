import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SolidityEditor } from './components/SolidityEditor';
import { AuditReport } from './components/AuditReport';
import { RecentAudits } from './components/RecentAudits';
import { ReferenceCard } from './components/ReferenceCard';
import { CertificateModal } from './components/CertificateModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { Dashboard } from './components/dashboard/Dashboard';

import { PRESETS, LIVE_FEED, SCAN_STEPS } from './data/sampleContracts';
import {
  computeKeccak256,
  auditSolidityCode,
  shortHash
} from './services/auditEngine';
import {
  hasMetaMask,
  requestWalletConnection,
  addOrSwitchBotChain,
  broadcastCertificationOnChain
} from './services/web3Service';
import {
  AuditReportData,
  AuditFeedItem,
  CertifiedAuditData,
  ToastMessage,
  WalletAccount
} from './types';

export default function App() {
  // App view mode: 'dashboard' (MOCKUP-DASHBOARD.html) or 'studio' (MOCKUP.html)
  const [appMode, setAppMode] = useState<'dashboard' | 'studio'>(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('studio')) {
      return 'studio';
    }
    return 'dashboard';
  });

  // Scroll progress bar state
  const [scrollPct, setScrollPct] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      setScrollPct(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Network selection ('testnet' (968) or 'mainnet' (677))
  const [currentNetwork, setCurrentNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  // Contract & Editor state
  const [activePreset, setActivePreset] = useState<'vulnerable' | 'registry' | 'safe' | null>('vulnerable');
  const [fileName, setFileName] = useState<string>(PRESETS.vulnerable.file);
  const [code, setCode] = useState<string>(PRESETS.vulnerable.code);
  const [hasCopiedHash, setHasCopiedHash] = useState<boolean>(false);

  // Deterministic Keccak-256 code hash
  const codeHash = useMemo(() => computeKeccak256(code), [code]);

  // Audit Report state
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'result'>('result');
  const [report, setReport] = useState<AuditReportData | null>(PRESETS.vulnerable.result);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);

  // Live Audits Feed state
  const [feed, setFeed] = useState<AuditFeedItem[]>(LIVE_FEED);

  // Web3 Wallet state
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);

  // Certification state
  const [isCertifying, setIsCertifying] = useState<boolean>(false);
  const [certifyStepText, setCertifyStepText] = useState<string>('');
  const [hasCertified, setHasCertified] = useState<boolean>(false);
  const [certifiedData, setCertifiedData] = useState<CertifiedAuditData | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'cyber' | 'safe' | 'warn' | 'crit' = 'cyber') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to MetaMask account / chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const onAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet(null);
          addToast('MetaMask terputus.', 'warn');
        } else {
          setWallet((prev) => (prev ? { ...prev, address: accounts[0] } : null));
        }
      };

      const onChainChanged = (hexChain: string) => {
        const chainId = parseInt(hexChain, 16);
        if (chainId === 968) setCurrentNetwork('testnet');
        if (chainId === 677) setCurrentNetwork('mainnet');
      };

      window.ethereum.on?.('accountsChanged', onAccountsChanged);
      window.ethereum.on?.('chainChanged', onChainChanged);

      return () => {
        window.ethereum.removeListener?.('accountsChanged', onAccountsChanged);
        window.ethereum.removeListener?.('chainChanged', onChainChanged);
      };
    }
  }, [addToast]);

  // Preset Selection handler
  const handleSelectPreset = useCallback(
    (key: 'vulnerable' | 'registry' | 'safe') => {
      const p = PRESETS[key];
      setActivePreset(key);
      setFileName(p.file);
      setCode(p.code);
      setReport(p.result);
      setPhase('result');
      setHasCertified(false);
      setCertifiedData(null);
      addToast(`Preset ${p.file} dimuat.`, 'cyber');
    },
    [addToast]
  );

  // Copy Code Hash
  const handleCopyCodeHash = useCallback(() => {
    navigator.clipboard.writeText(codeHash);
    setHasCopiedHash(true);
    addToast('Keccak-256 hash disalin ke clipboard!', 'cyber');
    setTimeout(() => setHasCopiedHash(false), 2000);
  }, [codeHash, addToast]);

  // Run AI Scan with progress animation
  const handleRunScan = useCallback(async () => {
    if (!code.trim() || isScanning) return;

    setIsScanning(true);
    setPhase('scanning');
    setScanProgress(0);
    setScanStepIndex(0);
    setHasCertified(false);
    setCertifiedData(null);

    const stepCount = SCAN_STEPS.length;
    const stepDuration = 320; // 320ms per step

    for (let i = 0; i < stepCount; i++) {
      setScanStepIndex(i);
      setScanProgress(Math.round(((i + 1) / stepCount) * 100));
      await new Promise((res) => setTimeout(res, stepDuration));
    }

    const calculatedReport = auditSolidityCode(code);
    setReport(calculatedReport);
    setIsScanning(false);
    setPhase('result');
    addToast(`Scan selesai! Security Score: ${calculatedReport.score}/100.`, calculatedReport.score >= 80 ? 'safe' : calculatedReport.score >= 50 ? 'warn' : 'crit');
  }, [code, isScanning, addToast]);

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to run scan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunScan();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunScan]);

  // Wallet Connection
  const handleConnectWallet = useCallback(async () => {
    setIsConnectingWallet(true);
    try {
      if (hasMetaMask()) {
        const info = await requestWalletConnection(currentNetwork);
        setWallet({
          address: info.address,
          balance: info.balance,
          isRealMetaMask: true
        });
        addToast(`MetaMask terhubung: ${info.address.slice(0, 6)}…${info.address.slice(-4)}`, 'safe');
      } else {
        // High fidelity demo wallet simulation
        await new Promise((res) => setTimeout(res, 500));
        const demoAddr = '0x38bF32D15779E102e3532C66981881775f0a20a4';
        setWallet({
          address: demoAddr,
          balance: '12.45',
          isRealMetaMask: false
        });
        addToast('MetaMask simulation: 0x38bF…20a4 terhubung (12.45 BOT).', 'safe');
      }
    } catch (err: any) {
      addToast(err.message || 'Gagal menghubungkan wallet', 'crit');
    } finally {
      setIsConnectingWallet(false);
    }
  }, [currentNetwork, addToast]);

  // Network Switcher
  const handleSelectNetwork = useCallback(
    async (net: 'testnet' | 'mainnet') => {
      setCurrentNetwork(net);
      if (wallet?.isRealMetaMask) {
        try {
          await addOrSwitchBotChain(net);
          addToast(`Beralih ke BOT Chain ${net.toUpperCase()}.`, 'safe');
        } catch (err: any) {
          console.warn('Switch network error:', err);
        }
      } else {
        addToast(`Jaringan aktif: BOT Chain ${net.toUpperCase()} (${net === 'testnet' ? '968' : '677'}).`, 'cyber');
      }
    },
    [wallet, addToast]
  );

  // Certify on BOT Chain
  const handleCertify = useCallback(async () => {
    if (!report || isCertifying) return;

    setIsCertifying(true);
    const activeWalletAddr = wallet?.address || '0x38bF32D15779E102e3532C66981881775f0a20a4';

    try {
      const proof = await broadcastCertificationOnChain({
        contractName: fileName,
        codeHash,
        score: report.score,
        verdict: report.verdict,
        walletAddress: activeWalletAddr,
        networkKey: currentNetwork,
        onStep: (text) => setCertifyStepText(text)
      });

      const cert: CertifiedAuditData = {
        fileName,
        score: report.score,
        verdict: report.verdict,
        codeHash,
        walletAddress: activeWalletAddr,
        txHash: proof.tx,
        blockNumber: proof.block,
        timestamp: proof.time,
        network: currentNetwork
      };

      setCertifiedData(cert);
      setHasCertified(true);
      setIsCertModalOpen(true);

      // Prepend to live audits feed
      setFeed((prev) => [
        {
          name: fileName,
          who: shortHash(activeWalletAddr, 6, 4),
          score: report.score,
          tx: shortHash(proof.tx, 6, 4),
          net: currentNetwork,
          ago: 'Just now'
        },
        ...prev
      ]);

      addToast('Attestation tersimpan di BOT Chain!', 'safe');
    } catch (err: any) {
      addToast(`Gagal mencatat audit: ${err.message}`, 'crit');
    } finally {
      setIsCertifying(false);
      setCertifyStepText('');
    }
  }, [report, isCertifying, wallet, fileName, codeHash, currentNetwork, addToast]);

  // Preview State switcher for Evaluator & Judge demonstration
  const handlePreviewStateChange = useCallback(
    (stateKey: 'idle' | 'scanning' | 'safe' | 'warning' | 'critical') => {
      if (stateKey === 'idle') {
        setPhase('idle');
        setHasCertified(false);
        addToast('Preview state: IDLE', 'cyber');
      } else if (stateKey === 'scanning') {
        handleRunScan();
      } else if (stateKey === 'safe') {
        handleSelectPreset('safe');
      } else if (stateKey === 'warning') {
        handleSelectPreset('registry');
      } else if (stateKey === 'critical') {
        handleSelectPreset('vulnerable');
      }
    },
    [handleRunScan, handleSelectPreset, addToast]
  );

  // Copy Contract Source from Reference Card
  const handleCopyContractSource = useCallback(() => {
    navigator.clipboard.writeText(code);
    addToast('Solidity contract source disalin!', 'cyber');
  }, [code, addToast]);

  // Add BOT Chain to MetaMask from Reference Card
  const handleAddChainToWallet = useCallback(async () => {
    if (hasMetaMask()) {
      try {
        await addOrSwitchBotChain(currentNetwork);
        addToast(`BOT Chain ${currentNetwork.toUpperCase()} ditambahkan ke MetaMask!`, 'safe');
      } catch (err: any) {
        addToast(`Gagal menambahkan chain: ${err.message}`, 'crit');
      }
    } else {
      addToast(
        `Parameter BOT Chain ${currentNetwork.toUpperCase()} siap (RPC: ${
          currentNetwork === 'testnet' ? 'https://testnet-rpc.botchain.ai' : 'https://rpc.botchain.ai'
        }).`,
        'cyber'
      );
    }
  }, [currentNetwork, addToast]);

  if (appMode === 'dashboard') {
    return (
      <Dashboard
        onOpenAuditStudio={() => setAppMode('studio')}
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
      />
    );
  }

  return (
    <div id="top" className="bg-ink-900 text-zinc-300 font-sans antialiased min-h-screen selection:bg-cyber/25 selection:text-[#e4feff]">
      {/* Scroll Progress Bar */}
      <div
        id="scrollProgress"
        style={{ width: `${scrollPct}%` }}
        className="fixed top-0 left-0 h-[2px] z-[60] bg-gradient-to-r from-cyber via-cyber-600 to-safe"
      ></div>

      {/* Navigation Header */}
      <Navbar
        currentNetwork={currentNetwork}
        onSelectNetwork={handleSelectNetwork}
        wallet={wallet}
        isConnectingWallet={isConnectingWallet}
        onConnectWallet={handleConnectWallet}
        onOpenDashboard={() => setAppMode('dashboard')}
      />

      {/* Main Sections */}
      <main>
        {/* Hero Section */}
        <Hero
          onStartScanClick={() => {
            const el = document.getElementById('workspace');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onViewProofsClick={() => {
            setAppMode('dashboard');
          }}
        />

        {/* Core Workspace Section */}
        <section id="workspace" className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="chip text-[11px] font-bold tracking-[0.25em] uppercase text-cyber">
                Core Workspace
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Interactive Audit Studio
              </h2>
            </div>
            <span className="chip hidden sm:inline-flex items-center gap-2 h-8 px-3 rounded-full border border-zinc-800 bg-ink-800 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber dot-live"></span> engine v2.3 · solc 0.8.24
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Left: Solidity Editor */}
            <SolidityEditor
              code={code}
              onCodeChange={(newVal) => {
                setCode(newVal);
                setActivePreset(null);
              }}
              fileName={fileName}
              onFileNameChange={setFileName}
              activePreset={activePreset}
              onSelectPreset={handleSelectPreset}
              isScanning={isScanning}
              onRunScan={handleRunScan}
              codeHash={codeHash}
              onCopyHash={handleCopyCodeHash}
              hasCopiedHash={hasCopiedHash}
            />

            {/* Right: Audit Report */}
            <AuditReport
              phase={phase}
              report={report}
              fileName={fileName}
              codeHash={codeHash}
              scanProgress={scanProgress}
              scanStepIndex={scanStepIndex}
              onRunDemoScan={handleRunScan}
              onPreviewStateChange={handlePreviewStateChange}
              onCertifyClick={handleCertify}
              isCertifying={isCertifying}
              certifyStepText={certifyStepText}
              hasCertified={hasCertified}
              onViewCertProof={() => setIsCertModalOpen(true)}
            />
          </div>
        </section>

        {/* Recent Certified Audits Live Feed */}
        <RecentAudits
          audits={feed}
          onSelectAudit={(item) => {
            setCertifiedData({
              fileName: item.name,
              score: item.score,
              verdict: item.score >= 80 ? 'PASSED — SAFE' : item.score >= 50 ? 'WARNINGS DETECTED' : 'CRITICAL RISK',
              codeHash: '0x8f3a9e1204859123847190283471902834719028347190283471902834719028',
              walletAddress: item.who,
              txHash: item.tx,
              blockNumber: 4210928,
              timestamp: '2025-05-18 12:00:00 UTC',
              network: item.net
            });
            setIsCertModalOpen(true);
          }}
        />

        {/* Developer & Judge Reference Card */}
        <ReferenceCard
          onCopyContractSource={handleCopyContractSource}
          onAddChainToWallet={handleAddChainToWallet}
          onCopyValue={(val, label) => {
            navigator.clipboard.writeText(val);
            addToast(`${label} disalin ke clipboard!`, 'cyber');
          }}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* On-Chain Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        data={certifiedData}
        onCopyBadge={() => {
          addToast('Embed badge disalin ke clipboard!', 'cyber');
        }}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
