import React, { useState, useEffect } from 'react';
import { DASHBOARD_NETWORKS, DashboardNetwork } from '../../data/dashboardData';

export type DashboardViewType =
  | 'overview'
  | 'exploit'
  | 'patch'
  | 'radar'
  | 'proof'
  | 'repo'
  | 'gas'
  | 'dev'
  | 'audits'
  | 'certificates'
  | 'verify'
  | 'contract';

interface DashboardSidebarProps {
  currentView: DashboardViewType;
  onSelectView: (view: DashboardViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  totalAuditsCount: number;
  certifiedCount: number;
  network: 'testnet' | 'mainnet';
  onOpenAuditStudio: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  totalAuditsCount,
  certifiedCount,
  network,
  onOpenAuditStudio
}) => {
  const netInfo: DashboardNetwork = DASHBOARD_NETWORKS[network];
  const [currentBlock, setCurrentBlock] = useState<number>(netInfo.baseBlock);
  const [rpcPing, setRpcPing] = useState<number>(182);

  // Sync baseBlock when network changes
  useEffect(() => {
    setCurrentBlock(DASHBOARD_NETWORKS[network].baseBlock);
  }, [network]);

  // Live block ticker (increases every 4 seconds) and dynamic RPC ping
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlock((prev) => prev + 1 + Math.floor(Math.random() * 2));
      setRpcPing(150 + Math.floor(Math.random() * 70));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (view: DashboardViewType) => {
    onSelectView(view);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        id="sidebarBackdrop"
        onClick={onClose}
        className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${
          isOpen ? 'block' : 'hidden'
        }`}
      />

      {/* Sidebar Aside */}
      <aside
        id="sidebar"
        className={`fixed lg:sticky z-[56] lg:z-0 top-16 left-0 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-zinc-800 bg-ink-850 transition-transform duration-300 flex flex-col overflow-y-auto scroll-thin ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-3 space-y-1" aria-label="Menu dashboard">
          {/* Overview */}
          <button
            id="navOverviewBtn"
            onClick={() => handleNavClick('overview')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'overview'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="3" y="3" width="8" height="8" rx="2" />
              <rect x="13" y="3" width="8" height="5" rx="2" />
              <rect x="13" y="10" width="8" height="11" rx="2" />
              <rect x="3" y="13" width="8" height="8" rx="2" />
            </svg>
            Overview
          </button>

          <p className="pt-3 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 flex items-center justify-between">
            <span>Security Suite</span>
            <span className="chip text-[9px] font-mono text-cyber">AI + EVM</span>
          </p>

          {/* 1. Exploit Simulator */}
          <button
            id="navExploitBtn"
            onClick={() => handleNavClick('exploit')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'exploit'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-crit" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 3 21 9.5 9.5 21H3v-6.5L14.5 3Z" />
              <path d="m12 6 6 6" />
            </svg>
            Exploit Simulator
            <span className="ml-auto chip h-5 px-1.5 inline-flex items-center rounded bg-crit/15 border border-crit/40 text-crit font-mono text-[9px] font-bold">
              PoC
            </span>
          </button>

          {/* 2. Patch Studio */}
          <button
            id="navPatchBtn"
            onClick={() => handleNavClick('patch')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'patch'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-safe" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v6m0 0 3-3m-3 3-3-3" />
              <path d="M4 14h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" />
            </svg>
            Patch Studio
            <span className="ml-auto chip h-5 px-1.5 inline-flex items-center rounded bg-safe/15 border border-safe/40 text-safe font-mono text-[9px] font-bold">
              1-Click
            </span>
          </button>

          {/* 3. Risk Radar */}
          <button
            id="navRadarBtn"
            onClick={() => handleNavClick('radar')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'radar'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyber" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            Risk Radar
            <span className="ml-auto chip h-5 px-1.5 inline-flex items-center rounded bg-cyber/15 border border-cyber/40 text-cyber font-mono text-[9px] font-bold">
              Live
            </span>
          </button>

          {/* 4. Proof Portal & PDF */}
          <button
            id="navProofBtn"
            onClick={() => handleNavClick('proof')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'proof'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Proof Portal & PDF
            <span className="ml-auto chip h-5 px-1.5 inline-flex items-center rounded bg-ink-700 border border-zinc-700 font-mono text-[9px] text-zinc-300 font-bold">
              Verify
            </span>
          </button>

          {/* 5. Repo Importer */}
          <button
            id="navRepoBtn"
            onClick={() => handleNavClick('repo')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'repo'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            Repo Importer
            <span className="ml-auto chip h-5 px-1.5 inline-flex items-center rounded bg-ink-700 border border-zinc-700 font-mono text-[9px] text-zinc-300 font-bold">
              Batch
            </span>
          </button>

          {/* 6. Gas Profiler */}
          <button
            id="navGasBtn"
            onClick={() => handleNavClick('gas')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'gas'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-safe" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Gas Profiler
            <span className="ml-auto chip h-5 px-1.5 inline-flex items-center rounded bg-safe/15 border border-safe/40 text-safe font-mono text-[9px] font-bold">
              Opcode
            </span>
          </button>

          {/* 7. Developer Portal */}
          <button
            id="navDevBtn"
            onClick={() => handleNavClick('dev')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'dev'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyber" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Developer Portal
            <span className="ml-auto chip h-5 px-1.5 inline-flex items-center rounded bg-cyber/15 border border-cyber/40 text-cyber font-mono text-[9px] font-bold">
              SDK
            </span>
          </button>

          <p className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Audit Records
          </p>

          {/* My Audits */}
          <button
            id="navAuditsBtn"
            onClick={() => handleNavClick('audits')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'audits'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M8 6h13M8 12h13M8 18h13" />
              <circle cx="4" cy="6" r="1" />
              <circle cx="4" cy="12" r="1" />
              <circle cx="4" cy="18" r="1" />
            </svg>
            My Audits
            <span
              id="navAuditCount"
              className="ml-auto chip h-5 px-2 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400"
            >
              {totalAuditsCount}
            </span>
          </button>

          {/* Certificates */}
          <button
            id="navCertificatesBtn"
            onClick={() => handleNavClick('certificates')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'certificates'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="9" r="5.5" />
              <path d="m8.8 13.5-1.6 7 4.8-2.6 4.8 2.6-1.6-7" />
            </svg>
            Certificates
            <span
              id="navCertCount"
              className="ml-auto chip h-5 px-2 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400"
            >
              {certifiedCount}
            </span>
          </button>

          {/* Verify Proof */}
          <button
            id="navVerifyBtn"
            onClick={() => handleNavClick('verify')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'verify'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z" />
              <path d="m9.5 11.6 1.8 1.8 3.4-3.6" />
            </svg>
            Verify Proof
          </button>

          {/* VibeProof.sol */}
          <button
            id="navContractBtn"
            onClick={() => handleNavClick('contract')}
            className={`nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold transition-colors cursor-pointer ${
              currentView === 'contract'
                ? 'active'
                : 'text-zinc-400 hover:text-white hover:bg-ink-700'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 3v5h5" />
              <path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
              <path d="m10 12-2 2.5L10 17M14 12l2 2.5L14 17" />
            </svg>
            VibeProof.sol
          </button>

          <p className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            External
          </p>

          {/* Audit Studio Button */}
          <button
            id="sideAuditStudioLink"
            onClick={() => {
              onOpenAuditStudio();
              onClose();
            }}
            className="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700 text-left cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-cyber"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.4-4.4" />
              <path d="M11 8v6M8 11h6" />
            </svg>
            Audit Studio
          </button>

          {/* BOTScan Explorer */}
          <a
            id="sideExplorer"
            href={netInfo.explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M14 4h6v6" />
              <path d="M20 4 10 14" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            BOTScan Explorer
          </a>

          {/* Telegram Community */}
          <a
            href="https://t.me/BOTChain_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M21.9 4.6 19 19.3c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.6 7c.4-.3-.1-.5-.6-.2L7.7 13.3l-4.4-1.4c-1-.3-1-1 .2-1.4l17.2-6.6c.8-.3 1.5.2 1.2 1.7Z" />
            </svg>
            Telegram Community
          </a>
        </nav>

        <div className="mt-auto p-3 space-y-3">
          {/* Contract mini card */}
          <div className="rounded-xl border border-zinc-800 bg-ink-800 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
              VibeProof.sol
            </p>
            <p id="sideAddr" className="font-mono text-[10.5px] text-cyber break-all">
              0x97E0…F578
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="chip h-5 px-2 inline-flex items-center rounded-full bg-safe/10 border border-safe/40 text-safe text-[9px] font-extrabold tracking-widest uppercase">
                Verified
              </span>
              <span className="chip h-5 px-2 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[9px] text-zinc-400">
                solc ^0.8.20
              </span>
            </div>
          </div>

          {/* Chain health */}
          <div className="rounded-xl border border-zinc-800 bg-ink-800 p-3 font-mono text-[10.5px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-safe dot-live" />
              <span id="sideNetName" className="text-zinc-300 font-bold">
                {netInfo.name}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-zinc-500">
              <div className="flex justify-between">
                <span>Chain ID</span>
                <span id="sideChainId" className="text-zinc-300">
                  {netInfo.id} ({netInfo.hex})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Block</span>
                <span id="sideBlock" className="text-cyber">
                  #{currentBlock.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gas</span>
                <span className="text-zinc-300">1.2 gwei</span>
              </div>
              <div className="flex justify-between">
                <span>RPC</span>
                <span id="sideRpcPing" className="text-safe">
                  {rpcPing}ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
