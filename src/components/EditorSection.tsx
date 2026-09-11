import React, { useMemo } from 'react';
import { Play, Code2, Sparkles, Hash, AlertTriangle, ShieldCheck, FileCode } from 'lucide-react';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';
import { calculateCodeHash } from '../services/auditEngine';

interface EditorSectionProps {
  code: string;
  projectName: string;
  isScanning: boolean;
  onCodeChange: (code: string) => void;
  onProjectNameChange: (name: string) => void;
  onRunAudit: () => void;
}

export const EditorSection: React.FC<EditorSectionProps> = ({
  code,
  projectName,
  isScanning,
  onCodeChange,
  onProjectNameChange,
  onRunAudit,
}) => {
  const codeHash = useMemo(() => {
    try {
      return calculateCodeHash(code);
    } catch {
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
  }, [code]);

  const lineCount = useMemo(() => code.split('\n').length, [code]);

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Bar: Contract Name & Presets */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Contract / Project Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              placeholder="e.g. MyVibeVault.sol"
              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div>
          <span className="block text-[11px] font-medium text-zinc-400 mb-1">
            Load Preset Samples:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_CONTRACTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  onCodeChange(sample.code);
                  onProjectNameChange(sample.title);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                title={sample.subtitle}
              >
                {sample.badgeColor === 'rose' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                {sample.badgeColor === 'amber' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                {sample.badgeColor === 'emerald' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 min-h-[380px] bg-zinc-950 font-mono text-xs text-zinc-200">
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="// Paste your Solidity smart contract here..."
          className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-xs leading-relaxed text-zinc-200 placeholder-zinc-600 custom-scrollbar"
          spellCheck={false}
        />
      </div>

      {/* Bottom Bar: Keccak256 Hash & Scan Button */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Code Hash Display */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono overflow-hidden max-w-md w-full">
          <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-[11px] text-zinc-500 shrink-0">Code Hash:</span>
          <span className="truncate text-[11px] text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {codeHash}
          </span>
          <span className="text-[11px] text-zinc-500 shrink-0">({lineCount} lines)</span>
        </div>

        {/* Scan Button */}
        <button
          onClick={onRunAudit}
          disabled={isScanning || !code.trim()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-zinc-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Scanning Contract...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Scan with AI Auditor</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
