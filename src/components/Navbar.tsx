import React, { useState } from 'react';
import { WalletAccount } from '../types';

interface NavbarProps {
  currentNetwork: 'testnet' | 'mainnet';
  onSelectNetwork: (network: 'testnet' | 'mainnet') => void;
  wallet: WalletAccount | null;
  isConnectingWallet: boolean;
  onConnectWallet: () => void;
  onOpenDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentNetwork,
  onSelectNetwork,
  wallet,
  isConnectingWallet,
  onConnectWallet,
  onOpenDashboard
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-zinc-800/80">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3" aria-label="Navigasi utama">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 shrink-0 group">
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
            <span className="absolute inset-0 rounded-xl shadow-glow-cyber opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Vibe<span className="text-cyber">Proof</span>
          </span>
          <span className="chip hidden sm:inline-flex items-center h-6 px-2.5 rounded-full border border-cyber/40 bg-cyber/10 text-cyber text-[10px] font-bold tracking-widest uppercase">
            BOT Chain
          </span>
        </a>

        <div className="flex-1"></div>

        {/* Network Switcher */}
        <div
          className="flex items-center rounded-full border border-zinc-800 bg-ink-800 p-1"
          role="group"
          aria-label="Pilih jaringan BOT Chain"
        >
          <button
            onClick={() => onSelectNetwork('testnet')}
            data-net="testnet"
            className={`net-btn chip h-8 px-3 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              currentNetwork === 'testnet'
                ? 'bg-cyber text-ink-900'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Testnet (968)
          </button>
          <button
            onClick={() => onSelectNetwork('mainnet')}
            data-net="mainnet"
            className={`net-btn chip h-8 px-3 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              currentNetwork === 'mainnet'
                ? 'bg-safe text-ink-900'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mainnet (677)
          </button>
        </div>

        {/* Dashboard Switcher Button */}
        {onOpenDashboard && (
          <button
            id="navDashboardBtn"
            onClick={onOpenDashboard}
            className="chip h-10 px-3.5 inline-flex items-center gap-2 rounded-lg border border-cyber/40 bg-cyber/10 text-xs font-bold text-cyber hover:bg-cyber/20 transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
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
            Dashboard
          </button>
        )}

        {/* Quick links */}
        <div className="hidden lg:flex items-center gap-1.5">
          <a
            href="https://faucet.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="chip h-10 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-cyber hover:bg-ink-700 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              strokeLinecap="round"
            >
              <path d="M12 3v6m0 0 3-3m-3 3L9 6" />
              <path d="M5 13a7 7 0 0 0 14 0c0-2-1.5-3.5-2.5-4.5h-9C6.5 9.5 5 11 5 13Z" />
            </svg>
            Faucet BOT
          </a>
          <a
            href="https://t.me/BOTChain_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="chip h-10 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-cyber hover:bg-ink-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M21.9 4.6 19 19.3c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.6 7c.4-.3-.1-.5-.6-.2L7.7 13.3l-4.4-1.4c-1-.3-1-1 .2-1.4l17.2-6.6c.8-.3 1.5.2 1.2 1.7Z" />
            </svg>
            Telegram
          </a>
          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="chip h-10 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-cyber hover:bg-ink-700 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.4-4.4" />
            </svg>
            BOTScan
          </a>
        </div>

        {/* Wallet */}
        {wallet ? (
          <button
            id="walletBtn"
            onClick={onConnectWallet}
            className="chip h-10 px-3.5 rounded-lg border border-zinc-700 bg-ink-800 text-xs font-bold text-zinc-200 hover:border-safe/60 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-safe dot-live inline-block"></span>
            <span className="font-mono">
              {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-safe">{wallet.balance} BOT</span>
          </button>
        ) : (
          <button
            id="walletBtn"
            onClick={onConnectWallet}
            disabled={isConnectingWallet}
            className="chip h-10 px-4 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              strokeLinecap="round"
            >
              <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
              <path d="M3 7.5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5.5A2.5 2.5 0 0 1 3 7.5Z" />
              <circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            <span id="walletLabel">
              {isConnectingWallet ? 'Approve in wallet…' : 'Connect MetaMask'}
            </span>
          </button>
        )}

        {/* Mobile menu button */}
        <button
          id="mobileMenuBtn"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="lg:hidden h-10 w-10 grid place-items-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          aria-label="Buka menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            strokeLinecap="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div id="mobileMenu" className="lg:hidden border-t border-zinc-800/80 bg-ink-850 px-4 py-3 space-y-1">
          {onOpenDashboard && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDashboard();
              }}
              className="w-full chip flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-cyber bg-cyber/10 border border-cyber/30 hover:bg-cyber/20"
            >
              📊 Audit Command Center (Dashboard)
            </button>
          )}
          <a
            href="https://faucet.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="chip flex h-11 items-center gap-2 rounded-lg px-3 text-sm text-zinc-300 hover:bg-ink-700"
          >
            💧 Faucet BOT Token
          </a>
          <a
            href="https://t.me/BOTChain_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="chip flex h-11 items-center gap-2 rounded-lg px-3 text-sm text-zinc-300 hover:bg-ink-700"
          >
            ✈️ Telegram Community
          </a>
          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="chip flex h-11 items-center gap-2 rounded-lg px-3 text-sm text-zinc-300 hover:bg-ink-700"
          >
            🔍 BOTScan Explorer
          </a>
        </div>
      )}
    </header>
  );
};
