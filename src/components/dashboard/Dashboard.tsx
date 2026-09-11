import React, { useState, useEffect, useMemo } from 'react';
import {
  DashboardAuditRecord,
  buildAudits,
  DASHBOARD_NETWORKS
} from '../../data/dashboardData';
import { WalletAccount } from '../../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar, DashboardViewType } from './DashboardSidebar';
import { OverviewView } from './OverviewView';
import { AuditsView } from './AuditsView';
import { CertificatesView } from './CertificatesView';
import { VerifyView } from './VerifyView';
import { ContractView } from './ContractView';
import { ExploitSimulatorView } from './ExploitSimulatorView';
import { PatchStudioView } from './PatchStudioView';
import { RiskRadarView } from './RiskRadarView';
import { ProofPortalView } from './ProofPortalView';
import { RepoImporterView } from './RepoImporterView';
import { GasProfilerView } from './GasProfilerView';
import { DevPortalView } from './DevPortalView';
import { DashboardCertModal } from './DashboardCertModal';
import { DashboardToastContainer, ToastItem } from './DashboardToastContainer';

interface DashboardProps {
  onOpenAuditStudio: () => void;
  wallet: WalletAccount | null;
  onConnectWallet: () => void;
  initialView?: DashboardViewType;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenAuditStudio,
  wallet,
  onConnectWallet,
  initialView = 'overview'
}) => {
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [currentView, setCurrentView] = useState<DashboardViewType>(initialView);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedCert, setSelectedCert] = useState<DashboardAuditRecord | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [scrollPct, setScrollPct] = useState<number>(0);

  // Cached audits by network
  const testnetAudits = useMemo(() => buildAudits('testnet'), []);
  const mainnetAudits = useMemo(() => buildAudits('mainnet'), []);

  const audits = network === 'testnet' ? testnetAudits : mainnetAudits;
  const certifiedCount = audits.filter((a) => a.certified).length;

  // Track scroll progress for the top indicator bar
  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      setScrollPct(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToast = (msg: string, tone: 'cyber' | 'safe' | 'warn' | 'crit' = 'cyber') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, msg, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectNetwork = (net: 'testnet' | 'mainnet') => {
    setNetwork(net);
    addToast(
      `Jaringan beralih ke ${DASHBOARD_NETWORKS[net].name} (${DASHBOARD_NETWORKS[net].id})`,
      'cyber'
    );
  };

  // If search query is typed and not in audits view, switch to audits view automatically
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && currentView !== 'audits') {
      setCurrentView('audits');
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-zinc-100 flex flex-col font-sans">
      {/* Sticky Top Header */}
      <DashboardHeader
        network={network}
        onSelectNetwork={handleSelectNetwork}
        wallet={wallet}
        onConnectWallet={onConnectWallet}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenAuditStudio={onOpenAuditStudio}
        scrollPct={scrollPct}
      />

      {/* Main Container with Sidebar + View Content */}
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex">
        <DashboardSidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          totalAuditsCount={audits.length}
          certifiedCount={certifiedCount}
          network={network}
          onOpenAuditStudio={onOpenAuditStudio}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {currentView === 'overview' && (
            <OverviewView
              network={network}
              audits={audits}
              onOpenAuditStudio={onOpenAuditStudio}
              onGoToVerify={() => setCurrentView('verify')}
              onGoToAudits={() => setCurrentView('audits')}
              onOpenCert={setSelectedCert}
              onAddToast={addToast}
            />
          )}

          {currentView === 'exploit' && (
            <ExploitSimulatorView
              showToast={(msg, tone) =>
                addToast(msg, tone === 'err' ? 'crit' : tone === 'ok' ? 'safe' : 'cyber')
              }
            />
          )}

          {currentView === 'patch' && (
            <PatchStudioView
              showToast={(msg, tone) =>
                addToast(msg, tone === 'err' ? 'crit' : tone === 'ok' ? 'safe' : 'cyber')
              }
            />
          )}

          {currentView === 'radar' && (
            <RiskRadarView
              onOpenAuditStudio={onOpenAuditStudio}
              showToast={(msg, tone) =>
                addToast(msg, tone === 'err' ? 'crit' : tone === 'ok' ? 'safe' : 'cyber')
              }
            />
          )}

          {currentView === 'proof' && (
            <ProofPortalView
              network={network}
              showToast={(msg, tone) =>
                addToast(msg, tone === 'err' ? 'crit' : tone === 'ok' ? 'safe' : 'cyber')
              }
            />
          )}

          {currentView === 'repo' && (
            <RepoImporterView
              showToast={(msg, tone) =>
                addToast(msg, tone === 'err' ? 'crit' : tone === 'ok' ? 'safe' : 'cyber')
              }
            />
          )}

          {currentView === 'gas' && (
            <GasProfilerView
              onNavigate={(viewId) => setCurrentView(viewId as DashboardViewType)}
              showToast={(msg, tone) =>
                addToast(msg, tone === 'err' ? 'crit' : tone === 'ok' ? 'safe' : 'cyber')
              }
            />
          )}

          {currentView === 'dev' && (
            <DevPortalView
              showToast={(msg, tone) =>
                addToast(msg, tone === 'err' ? 'crit' : tone === 'ok' ? 'safe' : 'cyber')
              }
            />
          )}

          {currentView === 'audits' && (
            <AuditsView
              network={network}
              audits={audits}
              searchQuery={searchQuery}
              onOpenCert={setSelectedCert}
              onAddToast={addToast}
            />
          )}

          {currentView === 'certificates' && (
            <CertificatesView
              network={network}
              audits={audits}
              onOpenCert={setSelectedCert}
              onOpenAuditStudio={onOpenAuditStudio}
            />
          )}

          {currentView === 'verify' && (
            <VerifyView
              network={network}
              audits={audits}
              onOpenCert={setSelectedCert}
              onAddToast={addToast}
            />
          )}

          {currentView === 'contract' && (
            <ContractView
              network={network}
              auditsCount={audits.length}
              onAddToast={addToast}
            />
          )}

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-zinc-800/80 text-xs text-zinc-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-safe dot-live" />
              <span>BOT Chain · EVM Compatible · High Throughput</span>
            </div>
            <p>Girl Meets Tech Hackathon × On Chain Consultancy · Track 2 (AI)</p>
            <p className="text-zinc-600">Built with 💙 for the vibe coding movement</p>
          </footer>
        </main>
      </div>

      {/* Certificate Modal */}
      <DashboardCertModal
        audit={selectedCert}
        onClose={() => setSelectedCert(null)}
        onAddToast={addToast}
      />

      {/* Toast Host */}
      <DashboardToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};
