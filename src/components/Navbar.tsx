import React from 'react';
import { Shield, ExternalLink, Globe, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { WalletState } from '../types';
import { BOT_CHAIN_TESTNET, BOT_CHAIN_MAINNET } from '../config/botchain';

interface NavbarProps {
  wallet: WalletState;
  selectedChainId: number;
  onSelectChain: (chainId: number) => void;
  onConnectWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  selectedChainId,
  onSelectChain,
  onConnectWallet,
}) => {
  const isBOTChain = wallet.chainId === 968 || wallet.chainId === 677;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center">
                Vibe<span className="text-cyan-400">Proof</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                BOT Chain
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              AI Smart Contract Auditor & On-Chain Certification
            </p>
          </div>
        </div>

        {/* Action Controls & Wallet */}
        <div className="flex items-center gap-3">
          {/* Network Selector */}
          <div className="relative inline-flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-1 text-xs">
            <button
              onClick={() => onSelectChain(968)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedChainId === 968
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Testnet (968)
            </button>
            <button
              onClick={() => onSelectChain(677)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedChainId === 677
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mainnet (677)
            </button>
          </div>

          {/* Faucet Link (Testnet only) */}
          {selectedChainId === 968 && (
            <a
              href="https://faucet.botchain.ai/basic"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Faucet
            </a>
          )}

          {/* Telegram Support Link */}
          <a
            href="https://t.me/+s7_5oMxQWRtlNjQ1"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <span>Telegram</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Connect Wallet Button */}
          {wallet.isConnected && wallet.address ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <p className="text-xs font-mono font-medium text-zinc-200">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </p>
                {wallet.botBalance !== null && (
                  <p className="text-[10px] text-cyan-400 font-mono">
                    {wallet.botBalance} BOT
                  </p>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              disabled={wallet.isConnecting}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-500/10 cursor-pointer disabled:opacity-60"
            >
              <Globe className="w-3.5 h-3.5" />
              {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
