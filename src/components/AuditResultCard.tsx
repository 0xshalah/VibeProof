import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { AuditResult, VulnerabilityFinding } from '../types';

interface AuditResultCardProps {
  audit: AuditResult;
  isCertifying: boolean;
  onCertify: () => void;
  hasCertified: boolean;
}

export const AuditResultCard: React.FC<AuditResultCardProps> = ({
  audit,
  isCertifying,
  onCertify,
  hasCertified,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            PASSED — SAFE
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            WARNINGS DETECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            CRITICAL VULNERABILITIES
          </span>
        );
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Header: Score & Verdict */}
      <div className="p-6 border-b border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Radial / Score Box */}
          <div
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-mono font-bold shadow-inner ${getScoreColor(
              audit.securityScore
            )}`}
          >
            <span className="text-3xl leading-none">{audit.securityScore}</span>
            <span className="text-[10px] uppercase font-sans tracking-wider opacity-75 mt-1">
              / 100 Score
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {audit.projectName}
              </h2>
            </div>
            {getVerdictBadge(audit.verdict)}
          </div>
        </div>

        {/* Certify Button */}
        <button
          onClick={onCertify}
          disabled={isCertifying}
          className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
            hasCertified
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-zinc-950 shadow-cyan-500/20 active:scale-[0.98]'
          }`}
        >
          {isCertifying ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Broadcasting to BOT Chain...</span>
            </>
          ) : hasCertified ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Certified on BOT Chain (View Badge)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Certify on BOT Chain</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Counter Bar */}
      <div className="grid grid-cols-4 border-b border-zinc-800 bg-zinc-950/40 text-center divide-x divide-zinc-800">
        <div className="py-2.5">
          <span className="block text-xs font-semibold text-rose-400">
            {audit.metrics.criticalCount}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Critical</span>
        </div>
        <div className="py-2.5">
          <span className="block text-xs font-semibold text-amber-400">
            {audit.metrics.highCount}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">High</span>
        </div>
        <div className="py-2.5">
          <span className="block text-xs font-semibold text-yellow-400">
            {audit.metrics.mediumCount}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Medium</span>
        </div>
        <div className="py-2.5">
          <span className="block text-xs font-semibold text-cyan-400">
            {audit.metrics.lowCount}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Low</span>
        </div>
      </div>

      {/* Findings & Gas Report List */}
      <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        {/* Executive Summary */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
          <span className="font-semibold text-white block mb-1">Executive Summary:</span>
          {audit.summary}
        </div>

        {/* Vulnerability Items */}
        {audit.findings.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Detailed Vulnerability Findings ({audit.findings.length})
            </h3>
            {audit.findings.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="font-semibold text-sm text-zinc-100">{item.title}</span>
                  </div>
                  {item.line > 0 && (
                    <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      Line {item.line}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mb-2 leading-relaxed">{item.description}</p>

                {item.codeSnippet && (
                  <div className="mb-2 p-2 rounded bg-zinc-900 font-mono text-[11px] text-rose-300 border border-rose-950/60">
                    <code>{item.codeSnippet}</code>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-900/30 text-xs text-cyan-300 flex items-start gap-2">
                  <span className="font-semibold text-cyan-400 shrink-0">Fix:</span>
                  <span>{item.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-300">No Critical Flaws Detected</p>
            <p className="text-xs text-emerald-400/80 mt-1">
              Contract structure conforms to recommended EVM security patterns.
            </p>
          </div>
        )}

        {/* Gas Optimization Tips */}
        {audit.gasAnalysis.tips.length > 0 && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-200">
                Gas Optimization Opportunities
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
              {audit.gasAnalysis.tips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
