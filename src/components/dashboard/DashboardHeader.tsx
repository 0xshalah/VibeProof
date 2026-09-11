import React, { useRef, useEffect } from 'react';
import { WalletAccount } from '../../types';

interface DashboardHeaderProps {
  network: 'testnet' | 'mainnet';
  onSelectNetwork: (net: 'testnet' | 'mainnet') => void;
  wallet: WalletAccount | null;
  onConnectWallet: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSidebar: () => void;
  onOpenAuditStudio: () => void;
  scrollPct: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  network,
  onSelectNetwork,
  wallet,
  onConnectWallet,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  onOpenAuditStudio,
  scrollPct
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div
        id="scrollProgress"
        className="fixed top-0 left-0 h-[2px] z-[60] bg-gradient-to-r from-cyber via-cyber-600 to-safe transition-all duration-75"
        style={{ width: `${scrollPct}%` }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass border-b border-zinc-800/80">
        <nav
          className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3"
          aria-label="Navigasi dashboard"
        >
          {/* Mobile sidebar button */}
          <button
            id="sidebarToggle"
            onClick={onToggleSidebar}
            className="lg:hidden h-10 w-10 grid place-items-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
            aria-label="Buka sidebar"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {/* Logo brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 shrink-0 group text-left cursor-pointer"
          >
            <span className="relative grid place-items-center w-9 h-9 rounded-xl border border-cyber/40 bg-cyber/10">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-cyber"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2.5 4.5 5.6v5.2c0 4.7 3.2 8.6 7.5 10.7 4.3-2.1 7.5-6 7.5-10.7V5.6L12 2.5Z" />
                <path d="m9 11.8 2.2 2.2L15.4 9.6" />
              </svg>
              <span className="absolute inset-0 rounded-xl shadow-glow-cyber opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Vibe<span className="text-cyber">Proof</span>
            </span>
            <span className="chip hidden sm:inline-flex items-center h-6 px-2.5 rounded-full border border-zinc-700 bg-ink-800 text-zinc-300 text-[10px] font-bold tracking-widest uppercase">
              Dashboard
            </span>
          </button>

          {/* Global search */}
          <label className="relative hidden md:block flex-1 max-w-md mx-2">
            <span className="sr-only">Cari kontrak atau hash</span>
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.4-4.4" />
            </svg>
            <input
              ref={searchInputRef}
              id="globalSearch"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari kontrak, code hash, atau TX…  ( / )"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-ink-800 border border-zinc-800 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-cyber/60 focus:outline-none focus:ring-1 focus:ring-cyber/40 transition-colors"
            />
          </label>

          <div className="flex-1 md:hidden" />

          {/* Network switcher */}
          <div
            className="flex items-center rounded-full border border-zinc-800 bg-ink-800 p-1"
            role="group"
            aria-label="Pilih jaringan BOT Chain"
          >
            <button
              id="netBtnTestnet"
              onClick={() => onSelectNetwork('testnet')}
              className={`net-btn chip h-8 px-3 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                network === 'testnet' ? 'bg-cyber text-ink-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Testnet (968)
            </button>
            <button
              id="netBtnMainnet"
              onClick={() => onSelectNetwork('mainnet')}
              className={`net-btn chip h-8 px-3 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                network === 'mainnet' ? 'bg-safe text-ink-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mainnet (677)
            </button>
          </div>

          {/* Wallet button */}
          <button
            id="walletBtn"
            onClick={onConnectWallet}
            className={`chip h-10 px-4 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2 ${
              wallet
                ? 'border border-zinc-700 bg-ink-800 text-zinc-200 hover:border-safe/60'
                : 'border border-cyber/50 bg-cyber/10 text-cyber hover:bg-cyber/20'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
              <path d="M3 7.5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5.5A2.5 2.5 0 0 1 3 7.5Z" />
              <circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            <span id="walletLabel">
              {wallet ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-safe dot-live inline-block mr-1" />
                  <span className="font-mono">
                    {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
                  </span>{' '}
                  <span className="text-zinc-600">|</span>{' '}
                  <span className="font-mono text-safe">
                    {wallet.balance || '12.45 BOT'}
                  </span>
                </>
              ) : (
                'Connect MetaMask'
              )}
            </span>
          </button>

          {/* New Scan button */}
          <button
            id="headerNewScanBtn"
            onClick={onOpenAuditStudio}
            className="btn-cyber chip hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-cyber text-ink-900 text-xs font-extrabold cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Scan
          </button>
        </nav>
      </header>
    </>
  );
};
