import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-ink-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-lg border border-cyber/40 bg-cyber/10">
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
            </span>
            <span className="font-extrabold text-white">
              Vibe<span className="text-cyber">Proof</span>
            </span>
          </div>
          <p className="mt-3 text-[13px] text-zinc-500 leading-relaxed">
            AI-Powered Smart Contract Auditor & On-Chain Certification on BOT Chain. Audit bersifat advisory — bukan
            pengganti manual review profesional.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Community</p>
          <ul className="space-y-2 text-[13px]">
            <li>
              <a
                className="hover:text-cyber transition-colors"
                href="https://t.me/BOTChain_ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram Community
              </a>
            </li>
            <li>
              <a
                className="hover:text-cyber transition-colors"
                href="https://x.com/BOTChain_ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                X / Twitter — @BOTChain_ai
              </a>
            </li>
            <li>
              <a
                className="hover:text-cyber transition-colors"
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                BOTScan Explorer
              </a>
            </li>
            <li>
              <a
                className="hover:text-cyber transition-colors"
                href="https://faucet.botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                Faucet BOT Token
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Hackathon</p>
          <p className="text-[13px] text-zinc-400 leading-relaxed">
            Built for{' '}
            <span className="text-zinc-200 font-semibold">
              Girl Meets Tech × On Chain Consultancy — Build Week Hackathon Vol.2
            </span>
            . Deployed & certified on BOT Chain (Testnet 968 / Mainnet 677).
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex flex-wrap items-center gap-3 font-mono text-[11px] text-zinc-600">
          <span>© 2025 VibeProof. All rights reserved.</span>
          <span className="flex-1"></span>
          <span className="chip">keccak256-anchored proofs · EVM · gas: BOT</span>
        </div>
      </div>
    </footer>
  );
};
