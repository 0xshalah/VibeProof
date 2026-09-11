import React, { useRef, useEffect } from 'react';
import { shortHash } from '../services/auditEngine';

interface SolidityEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  activePreset: 'vulnerable' | 'registry' | 'safe' | null;
  onSelectPreset: (preset: 'vulnerable' | 'registry' | 'safe') => void;
  isScanning: boolean;
  onRunScan: () => void;
  codeHash: string;
  onCopyHash: () => void;
  hasCopiedHash: boolean;
}

export const SolidityEditor: React.FC<SolidityEditorProps> = ({
  code,
  onCodeChange,
  fileName,
  onFileNameChange,
  activePreset,
  onSelectPreset,
  isScanning,
  onRunScan,
  codeHash,
  onCopyHash,
  hasCopiedHash
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const lineCount = lines.length;

  // Synchronize gutter scroll with textarea scroll
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [code]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-ink-850">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="w-2.5 h-2.5 rounded-full bg-crit/70"></i>
          <i className="w-2.5 h-2.5 rounded-full bg-warn/70"></i>
          <i className="w-2.5 h-2.5 rounded-full bg-safe/70"></i>
        </span>

        <label className="relative flex-1 min-w-[160px]">
          <span className="sr-only">Nama smart contract</span>
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M14 3v5h5" />
            <path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          </svg>
          <input
            id="contractName"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            spellCheck="false"
            className="chip w-full h-10 pl-9 pr-3 rounded-lg bg-ink-900 border border-zinc-800 font-mono text-xs text-zinc-200 focus:border-cyber/60 focus:outline-none focus:ring-1 focus:ring-cyber/40 transition-colors"
          />
        </label>

        <span className="chip h-7 px-2.5 inline-flex items-center rounded-md bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400">
          Solidity ^0.8
        </span>
      </div>

      {/* Preset Chips */}
      <div
        className="px-4 py-3 border-b border-zinc-800 flex flex-wrap gap-2"
        role="group"
        aria-label="Preset smart contract"
      >
        <button
          onClick={() => onSelectPreset('vulnerable')}
          data-preset="vulnerable"
          className={`preset-chip chip h-10 px-3.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
            activePreset === 'vulnerable'
              ? 'border-crit/50 bg-crit/15 text-crit'
              : 'border-zinc-700 bg-ink-700 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          🚨 Vulnerable Ether Vault
        </button>

        <button
          onClick={() => onSelectPreset('registry')}
          data-preset="registry"
          className={`preset-chip chip h-10 px-3.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
            activePreset === 'registry'
              ? 'border-warn/50 bg-warn/15 text-warn'
              : 'border-zinc-700 bg-ink-700 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          ⚠️ Insecure Token Registry
        </button>

        <button
          onClick={() => onSelectPreset('safe')}
          data-preset="safe"
          className={`preset-chip chip h-10 px-3.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
            activePreset === 'safe'
              ? 'border-safe/50 bg-safe/15 text-safe'
              : 'border-zinc-700 bg-ink-700 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          🛡️ Certified Safe Vault
        </button>
      </div>

      {/* Code Area with Scanning Sweep & Gutter */}
      <div className="relative">
        <div
          id="scanSweep"
          className={`pointer-events-none absolute inset-0 overflow-hidden z-10 ${
            isScanning ? '' : 'hidden'
          }`}
        >
          <div className="scan-sweep h-16 w-full bg-gradient-to-b from-transparent via-cyber/10 to-transparent"></div>
        </div>

        <div className="flex h-[400px] bg-ink-900">
          <div
            id="gutter"
            ref={gutterRef}
            className="scroll-thin shrink-0 w-12 overflow-hidden py-4 border-r border-zinc-800/80 bg-ink-850 font-mono text-[12.5px] leading-6 text-zinc-600 text-right select-none"
            aria-hidden="true"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="pr-3">
                {i + 1}
              </div>
            ))}
          </div>

          <textarea
            id="codeInput"
            ref={textareaRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={handleScroll}
            spellCheck="false"
            aria-label="Editor kode Solidity"
            placeholder="// Paste your Solidity smart contract here..."
            className="code-input scroll-thin flex-1 resize-none bg-transparent px-4 py-4 font-mono text-[12.5px] leading-6 text-zinc-300 focus:outline-none whitespace-pre overflow-auto"
          />
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 border-t border-zinc-800 bg-ink-850 font-mono text-[11px] text-zinc-500">
        <span className="chip inline-flex items-center gap-1.5">
          <span className="text-zinc-600">Code Hash:</span>
          <span id="codeHashShort" className="text-cyber">
            {codeHash ? shortHash(codeHash, 6, 3) : '0x0000…0000'}
          </span>
          <button
            id="copyHashBtn"
            onClick={onCopyHash}
            className="ml-1 text-zinc-600 hover:text-cyber transition-colors cursor-pointer"
            title="Copy full hash"
            aria-label="Copy code hash"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
          </button>
        </span>
        <span className="chip" id="lineCount">
          {lineCount} lines
        </span>
        <span className="chip hidden sm:inline">UTF-8</span>
        <span className="flex-1"></span>
        <span className="chip text-zinc-600">/Ctrl + Enter = scan</span>
      </div>

      {/* Scan CTA */}
      <div className="px-4 py-4 border-t border-zinc-800 bg-ink-850">
        <button
          id="scanBtn"
          onClick={onRunScan}
          disabled={isScanning}
          className="btn-cyber chip w-full h-12 rounded-xl bg-cyber text-ink-900 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer hover:bg-cyan-300 disabled:opacity-50"
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
            <path d="M11 8v6M8 11h6" />
          </svg>
          Scan with AI Auditor
        </button>
      </div>
    </div>
  );
};
