import React from 'react';
import { CertifiedAuditData } from '../types';
import { gradeOf } from '../services/auditEngine';
import { BOTCHAIN_NETWORKS } from '../config/botchain';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertifiedAuditData | null;
  onCopyBadge: (badgeText: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  data,
  onCopyBadge
}) => {
  if (!isOpen || !data) return null;

  const net = BOTCHAIN_NETWORKS[data.network] || BOTCHAIN_NETWORKS.testnet;
  const g = gradeOf(data.score);
  const explorerTxUrl = `${net.explorerUrl}/tx/${data.txHash}`;

  const badgeMarkdown = `[![VibeProof Certified](https://img.shields.io/badge/VibeProof-${data.score}%2F100_${g.verdict.replace(/ /g, '_')}-${g.color.replace('#', '')}?logo=ethereum)](https://vibeproof.botchain.ai/audit/${data.txHash})`;

  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Smart Contract ${data.fileName} certified on @BOTChain_ai with Security Score ${data.score}/100 via VibeProof! Tx: ${data.txHash} #BOTChain #Hackathon #Web3Security`
  )}`;

  return (
    <div
      id="certModal"
      className="fixed inset-0 z-[70] grid place-items-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-zinc-700 bg-ink-900 shadow-2xl overflow-hidden my-8 rise-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ribbons */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyber via-safe to-cyber"></div>

        <button
          id="closeModalBtn"
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 grid place-items-center cursor-pointer"
          aria-label="Tutup modal"
        >
          ✕
        </button>

        <div className="cert-frame p-6 sm:p-8">
          {/* Seal */}
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl border border-safe/50 bg-safe/10 text-safe grid place-items-center shadow-glow-safe">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2.5 4.5 5.6v5.2c0 4.7 3.2 8.6 7.5 10.7 4.3-2.1 7.5-6 7.5-10.7V5.6L12 2.5Z" />
                <path d="m9 11.8 2.2 2.2L15.4 9.6" />
              </svg>
            </span>
            <div>
              <p className="chip text-[10.5px] font-extrabold uppercase tracking-widest text-safe">
                Certified On-Chain
              </p>
              <h3 className="text-xl font-extrabold text-white">BOT Chain Audit Attestation</h3>
            </div>
          </div>

          {/* Meta list */}
          <dl className="mt-6 space-y-3 font-mono text-xs rounded-xl border border-zinc-800 bg-ink-850/80 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <dt className="w-32 shrink-0 text-zinc-500">Contract Name</dt>
              <dd id="modalContract" className="text-white font-bold truncate">
                {data.fileName}
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <dt className="w-32 shrink-0 text-zinc-500">Security Score</dt>
              <dd id="modalScore" className="text-white font-bold">
                <span className={`chip px-2 py-0.5 rounded-full border text-[11px] ${g.chip}`}>
                  {data.score} / 100 · {g.verdict}
                </span>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <dt className="w-32 shrink-0 text-zinc-500">Code Keccak256</dt>
              <dd id="modalCodeHash" className="text-cyber break-all font-mono">
                {data.codeHash}
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <dt className="w-32 shrink-0 text-zinc-500">Attestation Tx</dt>
              <dd className="text-zinc-300 break-all">
                <a
                  id="modalTxLink"
                  href={explorerTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyber hover:underline"
                >
                  {data.txHash}
                </a>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <dt className="w-32 shrink-0 text-zinc-500">Network</dt>
              <dd id="modalNet" className="text-zinc-300">
                {data.network === 'mainnet' ? 'Mainnet (Chain ID 677)' : 'Testnet (Chain ID 968)'}
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <dt className="w-32 shrink-0 text-zinc-500">Timestamp</dt>
              <dd id="modalTime" className="text-zinc-400">
                {data.timestamp}
              </dd>
            </div>
          </dl>

          {/* Badge Generator */}
          <div className="mt-6">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Embed Badge (Markdown)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="badgeInput"
                readOnly
                className="scroll-thin flex-1 h-10 px-3 rounded-lg bg-ink-800 border border-zinc-700 font-mono text-[11px] text-zinc-300 focus:outline-none"
                value={badgeMarkdown}
              />
              <button
                id="copyBadgeBtn"
                onClick={() => onCopyBadge(badgeMarkdown)}
                className="chip h-10 px-3.5 rounded-lg border border-zinc-700 bg-ink-800 text-xs font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a
              id="modalExplorerBtn"
              href={explorerTxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="chip btn-cyber flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-cyber text-ink-900 text-xs font-extrabold"
            >
              View on BOTScan Explorer ↗
            </a>
            <a
              id="shareTwitterBtn"
              href={shareTwitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="chip h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-ink-800 text-xs font-bold text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              Share on X
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
