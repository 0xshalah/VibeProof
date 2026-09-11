import React, { useState } from 'react';
import {
  DASHBOARD_NETWORKS,
  VIBEPROOF_ADDR,
  DASHBOARD_FNS,
  VIBEPROOF_ABI_JSON,
  ContractFunctionItem
} from '../../data/dashboardData';

interface ContractViewProps {
  network: 'testnet' | 'mainnet';
  auditsCount: number;
  onAddToast: (msg: string, type?: 'cyber' | 'safe' | 'warn' | 'crit') => void;
}

export const ContractView: React.FC<ContractViewProps> = ({
  network,
  auditsCount,
  onAddToast
}) => {
  const net = DASHBOARD_NETWORKS[network];

  const [consoleOutput, setConsoleOutput] = useState<{
    fnName: string;
    sig: string;
    out: string;
  } | null>(null);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(VIBEPROOF_ADDR);
    onAddToast('Contract address disalin ke clipboard!', 'cyber');
  };

  const handleCopyBadges = () => {
    const md = `[![VibeProof](https://img.shields.io/badge/vibeproof-96%20·%20passed-10b981?style=flat-square)](https://vibeproof.ai)\n[![Audited on BOT Chain](https://img.shields.io/badge/audited%20on-BOT%20Chain-00F0FF?style=flat-square)](https://scan.bohr.life/address/${VIBEPROOF_ADDR})`;
    navigator.clipboard.writeText(md);
    onAddToast('Markdown badges disalin ke clipboard!', 'cyber');
  };

  const handleCopyABI = () => {
    navigator.clipboard.writeText(VIBEPROOF_ABI_JSON);
    onAddToast('ABI JSON disalin ke clipboard!', 'cyber');
  };

  const handleSimulateFunction = (fn: ContractFunctionItem) => {
    setConsoleOutput({
      fnName: fn.name,
      sig: fn.sig,
      out: fn.out
    });
    onAddToast(`Simulasi ${fn.name} dijalankan.`, 'cyber');
  };

  return (
    <section id="view-contract" className="space-y-5 max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-extrabold text-white tracking-tight">VibeProof.sol</h2>
        <span className="chip h-7 px-3 inline-flex items-center gap-1.5 rounded-full border border-safe/40 bg-safe/10 text-safe text-[11px] font-bold">
          <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
          Verified on BOTScan
        </span>
      </div>

      {/* Deployment Card */}
      <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Contract Address
            </p>
            <p className="mt-1 font-mono text-sm sm:text-base font-bold text-cyber break-all">
              {VIBEPROOF_ADDR}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              id="copyContractAddr"
              onClick={handleCopyAddress}
              className="chip h-9 px-3 rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V6a2 2 0 0 1 2-2h9" />
              </svg>
              Copy Address
            </button>
            <a
              id="viewOnScan"
              href={`${net.explorer}/address/${VIBEPROOF_ADDR}`}
              target="_blank"
              rel="noopener noreferrer"
              className="chip h-9 px-3 rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors inline-flex items-center gap-1.5"
            >
              View on BOTScan ↗
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-zinc-800 font-mono text-[11px]">
          <div>
            <span className="text-zinc-600 block text-[10px] uppercase tracking-widest">
              Compiler
            </span>
            <span className="text-zinc-300">solc v0.8.20</span>
          </div>
          <div>
            <span className="text-zinc-600 block text-[10px] uppercase tracking-widest">
              License
            </span>
            <span className="text-zinc-300">MIT</span>
          </div>
          <div>
            <span className="text-zinc-600 block text-[10px] uppercase tracking-widest">
              Optimized
            </span>
            <span className="text-zinc-300">Yes (200 runs)</span>
          </div>
          <div>
            <span className="text-zinc-600 block text-[10px] uppercase tracking-widest">
              Total Audits
            </span>
            <span id="contractAuditCount" className="text-cyber font-bold">
              {auditsCount} on-chain
            </span>
          </div>
        </div>
      </div>

      {/* Badges Helper */}
      <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">README Badges</h3>
        <p className="text-xs text-zinc-400">
          Tempel badge dinamis di repository GitHub Anda untuk menampilkan skor audit on-chain
          secara publik.
        </p>
        <div className="flex flex-wrap gap-3 py-2">
          <span className="inline-flex rounded overflow-hidden border border-zinc-700 text-[10px] font-mono">
            <span className="bg-zinc-800 text-zinc-300 px-2 py-1 font-bold">vibeproof</span>
            <span className="bg-emerald-600 text-black px-2 py-1 font-extrabold">
              96 · passed
            </span>
          </span>
          <span className="inline-flex rounded overflow-hidden border border-zinc-700 text-[10px] font-mono">
            <span className="bg-zinc-800 text-zinc-300 px-2 py-1 font-bold">audited on</span>
            <span className="bg-cyan-500 text-black px-2 py-1 font-extrabold">
              BOT Chain
            </span>
          </span>
          <span className="inline-flex rounded overflow-hidden border border-zinc-700 text-[10px] font-mono">
            <span className="bg-zinc-800 text-zinc-300 px-2 py-1 font-bold">proof</span>
            <span className="bg-zinc-700 text-zinc-200 px-2 py-1 font-mono">0x97E0…F578</span>
          </span>
        </div>
        <button
          id="copyBadges"
          onClick={handleCopyBadges}
          className="chip h-9 px-3 rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          Copy Markdown Badges
        </button>
      </div>

      {/* Local Development Snippet */}
      <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Local Development & Testing</h3>
        <p className="text-xs text-zinc-400">
          Jalankan unit test, forge script, atau deploy kontrak ke BOT Chain lokal / testnet
          menggunakan template di bawah:
        </p>
        <div className="rounded-xl border border-zinc-800 bg-ink-900 p-4 font-mono text-xs text-zinc-300 space-y-2 overflow-x-auto scroll-thin">
          <p className="text-zinc-500"># 1. Clone & install dependencies</p>
          <p>
            <span className="text-cyber">git clone</span> https://github.com/vibeproof/contracts
            && cd contracts
          </p>
          <p className="text-zinc-500 pt-2"># 2. Run Foundry tests</p>
          <p>
            <span className="text-cyber">forge test</span> -vvv --gas-report
          </p>
          <p className="text-zinc-500 pt-2"># 3. Deploy to BOT Chain Testnet (Chain ID 968)</p>
          <p>
            <span className="text-cyber">forge create</span> src/VibeProof.sol:VibeProof \
          </p>
          <p className="pl-4">--rpc-url https://rpc.bohr.life \</p>
          <p className="pl-4">--private-key $PRIVATE_KEY \</p>
          <p className="pl-4">--verify</p>
        </div>
      </div>

      {/* Functions List */}
      <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Contract Functions</h3>
          <button
            id="copyAbiBtn"
            onClick={handleCopyABI}
            className="chip h-8 px-3 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
          >
            Copy ABI
          </button>
        </div>
        <div id="fnsList" className="divide-y divide-zinc-800">
          {DASHBOARD_FNS.map((fn, idx) => (
            <div key={idx} className="p-4 hover:bg-ink-850 transition-colors">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`chip h-5 px-2 inline-flex items-center rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                    fn.type === 'write'
                      ? 'border border-warn/40 bg-warn/10 text-warn'
                      : 'border border-cyber/40 bg-cyber/10 text-cyber'
                  }`}
                >
                  {fn.type}
                </span>
                <span className="font-mono text-xs font-bold text-white">{fn.name}</span>
                <span className="flex-1" />
                <button
                  onClick={() => handleSimulateFunction(fn)}
                  className="chip h-7 px-2.5 rounded-md border border-zinc-700 bg-ink-700 text-[10px] font-bold text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
                >
                  Simulate
                </button>
              </div>
              <p className="mt-2 font-mono text-[11px] text-zinc-400 break-all">{fn.sig}</p>
              <p className="mt-1 text-xs text-zinc-500">{fn.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Function Simulation Output Console */}
      {consoleOutput && (
        <div
          id="contractConsole"
          className="rounded-2xl border border-zinc-800 bg-ink-900 p-4 font-mono text-[11px] leading-6 text-zinc-400 space-y-1 rise-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-zinc-500">
              SIMULATED CALL: <span className="text-cyber font-bold">{consoleOutput.fnName}</span>
            </span>
            <button
              onClick={() => setConsoleOutput(null)}
              className="text-zinc-600 hover:text-zinc-400 text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-zinc-500">Signature: {consoleOutput.sig}</p>
          <p className="text-safe font-semibold pt-1">{consoleOutput.out}</p>
        </div>
      )}
    </section>
  );
};
