import React, { useState, useEffect } from 'react';
import { AuditReportData } from '../types';
import { gradeOf, shortHash } from '../services/auditEngine';
import { SCAN_STEPS } from '../data/sampleContracts';

interface AuditReportProps {
  phase: 'idle' | 'scanning' | 'result';
  report: AuditReportData | null;
  fileName: string;
  codeHash: string;
  scanProgress: number;
  scanStepIndex: number;
  onRunDemoScan: () => void;
  onPreviewStateChange: (stateKey: 'idle' | 'scanning' | 'safe' | 'warning' | 'critical') => void;
  onCertifyClick: () => void;
  isCertifying: boolean;
  certifyStepText: string;
  hasCertified: boolean;
  onViewCertProof: () => void;
}

const SEV_META: Record<string, { label: string; chip: string }> = {
  critical: { label: 'CRITICAL', chip: 'border-crit/50 bg-crit/10 text-crit' },
  high: { label: 'HIGH', chip: 'border-orange-400/50 bg-orange-400/10 text-orange-400' },
  medium: { label: 'MEDIUM', chip: 'border-warn/50 bg-warn/10 text-warn' },
  low: { label: 'LOW', chip: 'border-zinc-600 bg-zinc-700/40 text-zinc-300' },
  info: { label: 'INFO', chip: 'border-cyber/40 bg-cyber/10 text-cyber' }
};

export const AuditReport: React.FC<AuditReportProps> = ({
  phase,
  report,
  fileName,
  codeHash,
  scanProgress,
  scanStepIndex,
  onRunDemoScan,
  onPreviewStateChange,
  onCertifyClick,
  isCertifying,
  certifyStepText,
  hasCertified,
  onViewCertProof
}) => {
  const [displayedScore, setDisplayedScore] = useState(0);

  // Animated score count-up
  useEffect(() => {
    if (phase === 'result' && report) {
      let t0: number | null = null;
      let frameId: number;

      const tick = (ts: number) => {
        if (!t0) t0 = ts;
        const p = Math.min(1, (ts - t0) / 900);
        setDisplayedScore(Math.round(report.score * (1 - Math.pow(1 - p, 3))));
        if (p < 1) {
          frameId = requestAnimationFrame(tick);
        }
      };

      frameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameId);
    } else {
      setDisplayedScore(0);
    }
  }, [phase, report]);

  const grade = report ? gradeOf(report.score) : { key: 'safe', color: '#10b981', verdict: 'PASSED — SAFE', chip: 'border-safe/50 bg-safe/10 text-safe' };
  const C = 364.42;
  const strokeOffset = report ? C * (1 - report.score / 100) : C;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
      {/* Header bar with Preview state pills */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-ink-850">
        <h3 className="text-sm font-bold text-white tracking-wide">Audit Report</h3>
        <span className="flex-1"></span>
        <span className="chip hidden md:inline text-[10px] uppercase tracking-widest text-zinc-600 mr-1">
          Preview state:
        </span>
        <button
          onClick={() => onPreviewStateChange('idle')}
          data-preview="idle"
          className="preview-btn chip h-7 px-2.5 rounded-full border border-zinc-700 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:border-zinc-500 cursor-pointer"
        >
          Idle
        </button>
        <button
          onClick={() => onPreviewStateChange('scanning')}
          data-preview="scanning"
          className="preview-btn chip h-7 px-2.5 rounded-full border border-zinc-700 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:border-cyber/60 cursor-pointer"
        >
          Scanning
        </button>
        <button
          onClick={() => onPreviewStateChange('safe')}
          data-preview="safe"
          className="preview-btn chip h-7 px-2.5 rounded-full border border-zinc-700 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:border-safe/60 cursor-pointer"
        >
          Safe
        </button>
        <button
          onClick={() => onPreviewStateChange('warning')}
          data-preview="warning"
          className="preview-btn chip h-7 px-2.5 rounded-full border border-zinc-700 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:border-warn/60 cursor-pointer"
        >
          Warning
        </button>
        <button
          onClick={() => onPreviewStateChange('critical')}
          data-preview="critical"
          className="preview-btn chip h-7 px-2.5 rounded-full border border-zinc-700 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:border-crit/60 cursor-pointer"
        >
          Critical
        </button>
      </div>

      {/* 1. IDLE STATE */}
      {phase === 'idle' && (
        <div id="stateIdle" className="p-8">
          <div className="rounded-xl border border-dashed border-zinc-700 bg-ink-850/60 px-6 py-14 text-center">
            <div className="mx-auto w-16 h-16 grid place-items-center rounded-2xl border border-zinc-700 bg-ink-700 floaty">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-zinc-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2.5 4.5 5.6v5.2c0 4.7 3.2 8.6 7.5 10.7 4.3-2.1 7.5-6 7.5-10.7V5.6L12 2.5Z" />
                <path d="M12 8v4m0 3.5v.01" />
              </svg>
            </div>
            <h4 className="mt-5 text-base font-bold text-zinc-200">Belum ada audit</h4>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
              Pilih preset kontrak atau tempel kode Solidity Anda, lalu jalankan AI Auditor untuk melihat Security Score &
              temuan kerentanan.
            </p>
            <button
              id="idleRunBtn"
              onClick={onRunDemoScan}
              className="chip mt-6 h-11 px-5 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors cursor-pointer"
            >
              Run demo scan →
            </button>
          </div>
        </div>
      )}

      {/* 2. SCANNING STATE */}
      {phase === 'scanning' && (
        <div id="stateScanning" className="p-6">
          <div className="rounded-xl border border-zinc-800 bg-ink-900 p-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 grid place-items-center rounded-lg border border-cyber/40 bg-cyber/10">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-cyber spin"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 3a9 9 0 1 0 9 9" />
                  <path d="M21 3v6h-6" opacity=".4" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-white">AI Auditor bekerja…</p>
                <p className="font-mono text-[11px] text-zinc-500" id="scanTarget">
                  {fileName || 'Untitled.sol'}
                </p>
              </div>
              <span className="flex-1"></span>
              <span id="scanPct" className="font-mono text-sm text-cyber font-bold">
                {scanProgress}%
              </span>
            </div>

            <div className="mt-4 h-1.5 rounded-full bg-ink-600 overflow-hidden">
              <div
                id="scanBar"
                style={{ width: `${scanProgress}%` }}
                className="h-full bg-gradient-to-r from-cyber-600 to-cyber transition-[width] duration-300"
              ></div>
            </div>

            <div id="scanLog" className="mt-4 font-mono text-[11.5px] leading-6 text-zinc-500 min-h-[150px]">
              {SCAN_STEPS.slice(0, scanStepIndex + 1).map((s, idx) => (
                <div key={idx} className="rise-in">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULT STATE */}
      {phase === 'result' && report && (
        <div id="stateResult">
          {/* Score Header */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 border-b border-zinc-800">
            <div className="relative shrink-0">
              <svg viewBox="0 0 140 140" className="w-36 h-36">
                <circle cx="70" cy="70" r="58" stroke="#1f232e" strokeWidth="10" fill="none" />
                <circle
                  id="dialArc"
                  cx="70"
                  cy="70"
                  r="58"
                  stroke={grade.color}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={strokeOffset}
                  transform="rotate(-90 70 70)"
                  style={{
                    transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1), stroke .4s ease'
                  }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div id="scoreNum" className="font-mono text-4xl font-extrabold text-white">
                    {displayedScore}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500 -mt-0.5">/ 100</div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <span
                id="verdictBadge"
                className={`chip inline-flex items-center gap-2 h-8 px-3.5 rounded-full border text-[11px] font-extrabold tracking-widest uppercase ${grade.chip}`}
              >
                {report.verdict}
              </span>
              <h4 id="resultContract" className="mt-3 font-mono text-sm font-bold text-white truncate">
                {fileName}
              </h4>
              <p className="mt-1 font-mono text-[11px] text-zinc-500" id="resultMeta">
                scan {report.scanTime} · engine v2.3 · solc 0.8.24 · {shortHash(codeHash, 6, 4)}
              </p>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5" id="resultTags">
                {report.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="chip h-6 px-2 inline-flex items-center rounded-md bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Counter Matrix */}
          <div className="grid grid-cols-5 gap-px bg-zinc-800 border-b border-zinc-800">
            <div className="bg-ink-850 px-2 py-3 text-center">
              <div id="cntCritical" className="font-mono text-lg font-extrabold text-crit">
                {report.counts.critical}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-zinc-500">Critical</div>
            </div>
            <div className="bg-ink-850 px-2 py-3 text-center">
              <div id="cntHigh" className="font-mono text-lg font-extrabold text-orange-400">
                {report.counts.high}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-zinc-500">High</div>
            </div>
            <div className="bg-ink-850 px-2 py-3 text-center">
              <div id="cntMedium" className="font-mono text-lg font-extrabold text-warn">
                {report.counts.medium}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-zinc-500">Medium</div>
            </div>
            <div className="bg-ink-850 px-2 py-3 text-center">
              <div id="cntLow" className="font-mono text-lg font-extrabold text-zinc-300">
                {report.counts.low}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-zinc-500">Low</div>
            </div>
            <div className="bg-ink-850 px-2 py-3 text-center">
              <div id="cntGas" className="font-mono text-lg font-extrabold text-cyber">
                {report.counts.gas}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-zinc-500">Gas Tips</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="px-5 sm:px-6 pt-5">
            <div
              id="summaryBox"
              className={`rounded-lg border border-zinc-800 border-l-2 bg-ink-850 px-4 py-3 ${
                grade.key === 'safe'
                  ? 'border-l-safe'
                  : grade.key === 'warn'
                  ? 'border-l-warn'
                  : 'border-l-crit'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                Executive Summary
              </p>
              <p id="summaryText" className="text-[13px] leading-relaxed text-zinc-300">
                {report.summary}
              </p>
            </div>
          </div>

          {/* Findings */}
          <div className="px-5 sm:px-6 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Vulnerability Findings
            </p>
            <div id="findingsList" className="scroll-thin space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {report.findings.length > 0 ? (
                report.findings.map((f, idx) => {
                  const sm = SEV_META[f.sev] || SEV_META.info;
                  return (
                    <article key={idx} className="rise-in rounded-lg border border-zinc-800 bg-ink-850 p-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`chip h-6 px-2 inline-flex items-center rounded-md border text-[9.5px] font-extrabold tracking-widest ${sm.chip}`}
                        >
                          {sm.label}
                        </span>
                        <h5 className="text-[13px] font-bold text-zinc-100 flex-1 min-w-[140px]">{f.title}</h5>
                        <span className="chip h-6 px-2 inline-flex items-center rounded-md bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400">
                          L{f.line}
                        </span>
                      </div>
                      <pre className="scroll-thin mt-2.5 rounded-md border border-zinc-800 bg-ink-900 px-3 py-2 font-mono text-[11px] text-zinc-400 overflow-x-auto whitespace-pre">
                        {f.snippet}
                      </pre>
                      <p className="mt-2 text-[12px] text-zinc-400">
                        <span className="font-bold text-cyber">FIX →</span> {f.fix}
                      </p>
                    </article>
                  );
                })
              ) : (
                <p className="text-[13px] text-zinc-500 rounded-lg border border-dashed border-zinc-700 px-4 py-6 text-center">
                  🎉 Tidak ada temuan kerentanan aktif.
                </p>
              )}
            </div>
          </div>

          {/* Gas Insights */}
          <div className="px-5 sm:px-6 pt-5">
            <div className="rounded-lg border border-cyber/25 bg-cyber/[0.06] px-4 py-3">
              <p className="chip inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyber mb-2">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
                </svg>
                Gas Optimization Insights
              </p>
              <ul id="gasList" className="space-y-1.5 text-[12.5px] text-zinc-300">
                {report.gasTips.map((t, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-cyber shrink-0">⚡</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Certify Button */}
          <div className="p-5 sm:p-6">
            {hasCertified ? (
              <button
                id="certifyBtn"
                onClick={onViewCertProof}
                className="chip w-full h-12 rounded-xl border border-safe/60 bg-safe/15 text-safe text-sm font-extrabold inline-flex items-center justify-center gap-2 hover:bg-safe/25 transition-colors cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="m6 12.5 4 4L18 8" />
                </svg>
                Certified — View On-Chain Proof
              </button>
            ) : isCertifying ? (
              <button
                id="certifyBtn"
                disabled
                className="chip w-full h-12 rounded-xl border border-cyber/50 bg-cyber/10 text-cyber text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-wait"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 spin"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M12 3a9 9 0 1 0 9 9" />
                </svg>
                <span>{certifyStepText || 'Broadcasting to BOT Chain…'}</span>
              </button>
            ) : (
              <button
                id="certifyBtn"
                onClick={onCertifyClick}
                className="chip w-full h-12 rounded-xl border border-safe/50 bg-safe/10 text-safe text-sm font-extrabold inline-flex items-center justify-center gap-2 hover:bg-safe/20 transition-colors cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z" />
                  <path d="m9.5 11.6 1.8 1.8 3.4-3.6" />
                </svg>
                Certify on BOT Chain
              </button>
            )}
            <p className="mt-2 text-center font-mono text-[10.5px] text-zinc-600">
              Estimasi gas: 21,480 · ±0.00021 BOT · 1 confirmation
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
