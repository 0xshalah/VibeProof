import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Share2,
  Sparkles,
  QrCode,
  Hash,
} from 'lucide-react';
import { CertifiedOnChainRecord } from '../types';
import { SUPPORTED_NETWORKS } from '../config/botchain';

interface CertificateModalProps {
  record: CertifiedOnChainRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const network = SUPPORTED_NETWORKS[record.chainId || 968];
  const explorerUrl = record.blockExplorerUrl || `${network.explorerUrl}/tx/${record.txHash}`;

  const badgeMarkdown = `[![VibeProof Certified: ${record.securityScore}/100](https://img.shields.io/badge/VibeProof_BOT_Chain-${record.securityScore}%2F100-${record.securityScore >= 80 ? 'emerald' : record.securityScore >= 50 ? 'amber' : 'red'})](${explorerUrl})`;

  const handleCopyBadge = () => {
    navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(record.codeHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const tweetText = encodeURIComponent(
    `🛡️ My smart contract "${record.projectName}" was just audited & certified on @BOTChain_ai via #VibeProof! \n\n` +
      `📊 Safety Score: ${record.securityScore}/100 (${record.verdict})\n` +
      `🔗 Verified on BOT Chain Explorer: ${explorerUrl}\n\n` +
      `Built for Build Week Hackathon Vol.2 with @BOTChain_ai! 🚀`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">On-Chain Audit Certificate</h3>
              <p className="text-xs text-zinc-400">Permanently recorded on {network.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-5">
          {/* Certificate Card Preview */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-cyan-500/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  VERIFIED AUDIT PROOF
                </span>
                <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  {record.projectName}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  {record.securityScore}
                  <span className="text-sm text-zinc-500">/100</span>
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-emerald-400/80 font-semibold">
                  {record.verdict}
                </span>
              </div>
            </div>

            {/* Cryptographic Details */}
            <div className="space-y-2 text-xs font-mono border-t border-zinc-800/80 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Chain:</span>
                <span className="text-zinc-300 font-sans font-medium">
                  {network.name} ({network.chainId})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Auditor:</span>
                <span className="text-zinc-300">
                  {record.auditorWallet.slice(0, 6)}...{record.auditorWallet.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Code Hash:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-300">
                    {record.codeHash.slice(0, 10)}...{record.codeHash.slice(-6)}
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="text-zinc-400 hover:text-white"
                    title="Copy full hash"
                  >
                    {copiedHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {record.txHash && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">TX Hash:</span>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {record.txHash.slice(0, 8)}...{record.txHash.slice(-6)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Markdown README Badge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">GitHub README Badge</span>
              <button
                onClick={handleCopyBadge}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                {copiedBadge ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-400 border border-zinc-800 break-all select-all">
              {badgeMarkdown}
            </div>
          </div>

          {/* Action Buttons: Explorer & Share on X */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on Explorer
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${tweetText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-black hover:bg-zinc-900 border border-zinc-700 transition-all shadow-md"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              Share on X (@BOTChain_ai)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
