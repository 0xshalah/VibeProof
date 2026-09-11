import React, { useEffect } from 'react';
import {
  DashboardAuditRecord,
  DASHBOARD_NETWORKS,
  gradeOf
} from '../../data/dashboardData';

interface DashboardCertModalProps {
  audit: DashboardAuditRecord | null;
  onClose: () => void;
  onAddToast: (msg: string, type?: 'cyber' | 'safe' | 'warn' | 'crit') => void;
}

export const DashboardCertModal: React.FC<DashboardCertModalProps> = ({
  audit,
  onClose,
  onAddToast
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!audit) return null;

  const net = DASHBOARD_NETWORKS[audit.net];
  const g = gradeOf(audit.score);
  const badgeMd = `[![VibeProof Security Score](https://img.shields.io/badge/vibeproof-${audit.score}%20%2F%20100-${g.key === 'safe' ? '10b981' : g.key === 'warn' ? 'f59e0b' : 'f43f5e'}?style=flat-square)](https://scan.bohr.life/tx/${audit.tx})`;
  const tweetText = encodeURIComponent(
    `Audited ${audit.name} with VibeProof on BOT Chain! Score: ${audit.score}/100 (${g.verdict}). Certified on-chain at VibeProof.sol 🛡️🚀`
  );
  const shareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const copyBadgeMarkdown = () => {
    navigator.clipboard.writeText(badgeMd);
    onAddToast('Badge markdown disalin ke clipboard!', 'cyber');
  };

  return (
    <div
      id="certModal"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md grid place-items-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl my-8 rounded-3xl border border-zinc-700 cert-frame p-6 sm:p-8 text-center shadow-2xl"
      >
        <button
          id="modalClose"
          onClick={onClose}
          className="absolute right-4 top-4 h-9 w-9 grid place-items-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
          aria-label="Tutup modal"
        >
          ✕
        </button>

        <div
          id="modalSeal"
          className="mx-auto w-16 h-16 rounded-2xl border-2 grid place-items-center text-2xl"
          style={{
            borderColor: g.color,
            background: `${g.color}15`,
            color: g.color
          }}
        >
          {g.key === 'safe' ? '🛡️' : g.key === 'warn' ? '⚠️' : '🚨'}
        </div>

        <p className="mt-4 text-[10.5px] font-mono tracking-widest uppercase text-cyber">
          VIBEPROOF ON-CHAIN AUDIT CERTIFICATE
        </p>
        <h3 id="modalName" className="mt-1 text-2xl font-extrabold text-white">
          {audit.name}
        </h3>
        <p id="modalChain" className="mt-0.5 text-xs text-zinc-400">
          {net.name} (Chain ID {net.id})
        </p>

        <div className="mt-5 inline-flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-ink-850">
          <span
            id="modalScore"
            className="font-mono text-3xl font-extrabold"
            style={{ color: g.color }}
          >
            {audit.score}
          </span>
          <div className="text-left">
            <p
              id="modalVerdict"
              className="font-mono text-xs font-bold"
              style={{ color: g.color }}
            >
              {g.verdict}
            </p>
            <p className="text-[10px] text-zinc-500">Certified by VibeProof.sol</p>
          </div>
        </div>

        <dl className="mt-6 rounded-xl border border-zinc-800 bg-ink-900 divide-y divide-zinc-800 text-left font-mono text-[11px]">
          <div className="px-4 py-2 flex flex-col sm:flex-row sm:justify-between">
            <dt className="text-zinc-500">Code Hash</dt>
            <dd id="modalHash" className="text-cyber break-all">
              {audit.hash}
            </dd>
          </div>
          <div className="px-4 py-2 flex flex-col sm:flex-row sm:justify-between">
            <dt className="text-zinc-500">Auditor</dt>
            <dd id="modalAuditor" className="text-zinc-300 break-all">
              {audit.auditor}
            </dd>
          </div>
          <div className="px-4 py-2 flex flex-col sm:flex-row sm:justify-between">
            <dt className="text-zinc-500">TX Hash</dt>
            <dd id="modalTx" className="text-zinc-300 break-all">
              {audit.tx}
            </dd>
          </div>
          <div className="px-4 py-2 flex justify-between">
            <dt className="text-zinc-500">Block</dt>
            <dd id="modalBlock" className="text-zinc-300">
              #{audit.block.toLocaleString('en-US')}
            </dd>
          </div>
          <div className="px-4 py-2 flex justify-between">
            <dt className="text-zinc-500">Timestamp</dt>
            <dd id="modalTime" className="text-zinc-300">
              {audit.time.toLocaleString('id-ID')}
            </dd>
          </div>
        </dl>

        <div className="mt-5 text-left">
          <p className="text-[10.5px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
            Report Summary
          </p>
          <p
            id="modalSummary"
            className="text-xs text-zinc-300 rounded-xl border border-zinc-800 bg-ink-900 p-3 leading-relaxed font-mono"
          >
            {audit.summary}
          </p>
        </div>

        <div className="mt-5 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-zinc-500">
              GitHub README Badge
            </p>
            <button
              id="modalCopyBadge"
              onClick={copyBadgeMarkdown}
              className="chip text-[10px] text-cyber hover:underline cursor-pointer"
            >
              Copy Markdown
            </button>
          </div>
          <div
            id="modalBadgePreview"
            className="p-2.5 rounded-lg border border-zinc-800 bg-ink-900 font-mono text-[10.5px] text-zinc-400 break-all select-all"
          >
            {badgeMd}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <a
            id="modalExplorerBtn"
            href={`${net.explorer}/tx/${audit.tx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="chip h-10 px-4 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors inline-flex items-center gap-2"
          >
            View on BOTScan Explorer ↗
          </a>
          <a
            id="modalShareX"
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chip h-10 px-4 rounded-lg border border-zinc-700 bg-ink-700 text-zinc-200 text-xs font-bold hover:border-cyber/60 transition-colors inline-flex items-center gap-2"
          >
            Share on X
          </a>
        </div>
      </div>
    </div>
  );
};
