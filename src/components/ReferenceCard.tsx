import React from 'react';

interface ReferenceCardProps {
  onCopyContractSource: () => void;
  onAddChainToWallet: () => void;
  onCopyValue: (val: string, label: string) => void;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  onCopyContractSource,
  onAddChainToWallet,
  onCopyValue
}) => {
  return (
    <section id="network" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 bg-ink-850 flex flex-wrap items-center gap-3">
          <h2 className="text-base font-extrabold text-white">Developer & Judge Reference Card</h2>
          <span className="chip h-6 px-2.5 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400">
            EVM Compatible
          </span>
          <span className="flex-1"></span>
          <div className="flex flex-wrap gap-2">
            <button
              id="copySourceBtn"
              onClick={onCopyContractSource}
              className="chip h-10 px-4 rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
            >
              Copy Solidity Contract Source
            </button>
            <a
              href="https://remix.ethereum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="chip h-10 px-4 inline-flex items-center rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors"
            >
              Open Remix IDE ↗
            </a>
            <button
              id="addChainBtn"
              onClick={onAddChainToWallet}
              className="chip h-10 px-4 rounded-lg border border-cyber/50 bg-cyber/10 text-xs font-bold text-cyber hover:bg-cyber/20 transition-colors cursor-pointer"
            >
              Add BOT Chain to Wallet
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-zinc-800">
          {/* Testnet */}
          <div className="bg-ink-850 p-5">
            <p className="chip inline-flex items-center gap-2 h-7 px-3 rounded-full border border-cyber/40 bg-cyber/10 text-cyber text-[10px] font-extrabold tracking-widest uppercase mb-4">
              Testnet · Chain ID 968
            </p>
            <dl className="space-y-2.5 font-mono text-[12px]">
              <div className="flex items-center gap-2">
                <dt className="w-24 shrink-0 text-zinc-500">RPC URL</dt>
                <dd className="rpc-val flex-1 truncate text-zinc-300">https://testnet-rpc.botchain.ai</dd>
                <button
                  onClick={() => onCopyValue('https://testnet-rpc.botchain.ai', 'Testnet RPC URL')}
                  className="copy-rpc text-zinc-600 hover:text-cyber cursor-pointer transition-colors"
                  aria-label="Copy RPC testnet"
                >
                  ⧉
                </button>
              </div>
              <div className="flex items-center gap-2">
                <dt className="w-24 shrink-0 text-zinc-500">Explorer</dt>
                <dd className="rpc-val flex-1 truncate text-zinc-300">https://testnet-scan.botchain.ai</dd>
                <button
                  onClick={() => onCopyValue('https://testnet-scan.botchain.ai', 'Testnet Explorer URL')}
                  className="copy-rpc text-zinc-600 hover:text-cyber cursor-pointer transition-colors"
                  aria-label="Copy explorer testnet"
                >
                  ⧉
                </button>
              </div>
              <div className="flex items-center gap-2">
                <dt className="w-24 shrink-0 text-zinc-500">Gas Token</dt>
                <dd className="text-zinc-300">BOT</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="w-24 shrink-0 text-zinc-500">Faucet</dt>
                <dd className="rpc-val flex-1 truncate text-zinc-300">https://faucet.botchain.ai</dd>
                <button
                  onClick={() => onCopyValue('https://faucet.botchain.ai', 'Faucet URL')}
                  className="copy-rpc text-zinc-600 hover:text-cyber cursor-pointer transition-colors"
                  aria-label="Copy faucet"
                >
                  ⧉
                </button>
              </div>
            </dl>
          </div>

          {/* Mainnet */}
          <div className="bg-ink-850 p-5">
            <p className="chip inline-flex items-center gap-2 h-7 px-3 rounded-full border border-safe/40 bg-safe/10 text-safe text-[10px] font-extrabold tracking-widest uppercase mb-4">
              Mainnet · Chain ID 677
            </p>
            <dl className="space-y-2.5 font-mono text-[12px]">
              <div className="flex items-center gap-2">
                <dt className="w-24 shrink-0 text-zinc-500">RPC URL</dt>
                <dd className="rpc-val flex-1 truncate text-zinc-300">https://rpc.botchain.ai</dd>
                <button
                  onClick={() => onCopyValue('https://rpc.botchain.ai', 'Mainnet RPC URL')}
                  className="copy-rpc text-zinc-600 hover:text-cyber cursor-pointer transition-colors"
                  aria-label="Copy RPC mainnet"
                >
                  ⧉
                </button>
              </div>
              <div className="flex items-center gap-2">
                <dt className="w-24 shrink-0 text-zinc-500">Explorer</dt>
                <dd className="rpc-val flex-1 truncate text-zinc-300">https://scan.botchain.ai (BOTScan)</dd>
                <button
                  onClick={() => onCopyValue('https://scan.botchain.ai', 'Mainnet Explorer URL')}
                  className="copy-rpc text-zinc-600 hover:text-cyber cursor-pointer transition-colors"
                  aria-label="Copy explorer mainnet"
                >
                  ⧉
                </button>
              </div>
              <div className="flex items-center gap-2">
                <dt className="w-24 shrink-0 text-zinc-500">Gas Token</dt>
                <dd className="text-zinc-300">BOT</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="w-24 shrink-0 text-zinc-500">Block Limit</dt>
                <dd className="text-zinc-300">35,000,000</dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="px-5 py-3 border-t border-zinc-800 bg-ink-850 font-mono text-[10.5px] text-zinc-600">
          Parameter mainnet diverifikasi via ChainList (chain 677 · currency BOT · explorer botscan) · nilai testnet
          bersifat mock untuk demo hackathon.
        </p>
      </div>
    </section>
  );
};
