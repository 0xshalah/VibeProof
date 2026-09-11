import React from 'react';

interface HeroProps {
  onStartScanClick: () => void;
  onViewProofsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartScanClick, onViewProofsClick }) => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 hero-bg opacity-30 mask-fade-b" aria-hidden="true"></div>
      <div className="absolute inset-0 grid-lines opacity-60 mask-fade-b" aria-hidden="true"></div>
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-cyber/10 blur-[120px]"
        aria-hidden="true"
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
        {/* Hackathon Header Badge */}
        <span className="chip inline-flex items-center gap-2 h-8 px-4 rounded-full border border-zinc-700/80 bg-ink-800/70 text-[11px] font-semibold tracking-widest uppercase text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-safe dot-live"></span>
          Girl Meets Tech × On Chain Consultancy — Build Week Hackathon Vol.2
        </span>

        {/* Main Headline */}
        <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
          Audit in Seconds.
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-cyber via-cyber-600 to-safe bg-clip-text text-transparent">
            Certify on BOT Chain.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          Di era <em className="text-zinc-200 not-italic font-semibold">vibe coding</em>, ribuan smart contract hasil generate AI
          berangkat ke mainnet dengan bug kritis yang tak terlihat. VibeProof memindai kode Solidity Anda dalam hitungan
          detik, menghitung Security Score 0–100, lalu mengunci bukti audit ber-hash Keccak-256 secara permanen di BOT
          Chain.
        </p>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <span className="chip inline-flex items-center gap-2 h-10 px-4 rounded-full border border-zinc-800 bg-ink-800/80 text-xs font-semibold text-zinc-200">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-cyber"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
            </svg>
            Zero Setup Required
          </span>

          <span className="chip inline-flex items-center gap-2 h-10 px-4 rounded-full border border-zinc-800 bg-ink-800/80 text-xs font-semibold text-zinc-200">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-cyber"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M7 8h10M7 12h10M7 16h6" />
              <rect x="3" y="4" width="18" height="16" rx="3" />
            </svg>
            Deterministic Keccak256 Hash
          </span>

          <span className="chip inline-flex items-center gap-2 h-10 px-4 rounded-full border border-zinc-800 bg-ink-800/80 text-xs font-semibold text-zinc-200">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-cyber"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z" />
              <path d="m9.5 11.6 1.8 1.8 3.4-3.6" />
            </svg>
            Verifiable On-Chain Proof
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="#workspace"
            onClick={(e) => {
              e.preventDefault();
              onStartScanClick();
            }}
            className="chip btn-cyber inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-cyber text-ink-900 text-sm font-extrabold cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.4-4.4" />
            </svg>
            Start Free Scan
          </a>
          <a
            href="#proofs"
            onClick={(e) => {
              e.preventDefault();
              onViewProofsClick();
            }}
            className="chip inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-zinc-700 bg-ink-800/70 text-sm font-semibold text-zinc-200 hover:border-cyber/50 hover:text-cyber transition-colors cursor-pointer"
          >
            View Live Proofs
          </a>
        </div>

        {/* Stats Strip */}
        <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl border border-zinc-800 bg-zinc-800 overflow-hidden max-w-3xl mx-auto">
          <div className="bg-ink-850 px-4 py-4">
            <dt className="text-[10px] uppercase tracking-widest text-zinc-500">Contracts Audited</dt>
            <dd className="mt-1 font-mono text-xl font-bold text-white">1,284</dd>
          </div>
          <div className="bg-ink-850 px-4 py-4">
            <dt className="text-[10px] uppercase tracking-widest text-zinc-500">Avg Scan Time</dt>
            <dd className="mt-1 font-mono text-xl font-bold text-cyber">4.2s</dd>
          </div>
          <div className="bg-ink-850 px-4 py-4">
            <dt className="text-[10px] uppercase tracking-widest text-zinc-500">On-Chain Proofs</dt>
            <dd className="mt-1 font-mono text-xl font-bold text-safe">1,102</dd>
          </div>
          <div className="bg-ink-850 px-4 py-4">
            <dt className="text-[10px] uppercase tracking-widest text-zinc-500">Avg Cert Gas</dt>
            <dd className="mt-1 font-mono text-xl font-bold text-white">0.00021 BOT</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};
