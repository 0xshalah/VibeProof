import React, { useState, useMemo } from 'react';
import { PATCHES, DIFF, ringSVG, gradeOf, hl, esc, PatchItem, DiffEntry } from '../../data/suiteData';

interface PatchStudioViewProps {
  onNavigate?: (viewId: string) => void;
  showToast?: (msg: string, type?: 'ok' | 'err' | 'warn' | 'info') => void;
}

const SEV_CHIP: Record<string, string> = {
  critical: 'border-crit/50 bg-crit/10 text-crit',
  high: 'border-orange-400/50 bg-orange-400/10 text-orange-400',
  medium: 'border-warn/50 bg-warn/10 text-warn',
  low: 'border-zinc-600 bg-zinc-700/40 text-zinc-300'
};

export const PatchStudioView: React.FC<PatchStudioViewProps> = ({
  showToast = (_msg?: string, _type?: 'ok' | 'err' | 'warn' | 'info') => {}
}) => {
  const [selectedPatches, setSelectedPatches] = useState<Set<string>>(new Set(['guard']));
  const [diffMode, setDiffMode] = useState<'split' | 'unified'>('split');
  const [reauditLogs, setReauditLogs] = useState<string[]>([]);
  const [isReauditing, setIsReauditing] = useState(false);
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);

  // Score calculation
  const score = useMemo(() => {
    const sumDelta = PATCHES
      .filter(p => selectedPatches.has(p.id))
      .reduce((s, p) => s + p.delta, 0);
    return Math.min(99, 28 + sumDelta);
  }, [selectedPatches]);

  const displayScore = animatedScore !== null ? animatedScore : score;
  const grade = gradeOf(displayScore);

  const counters = useMemo(() => {
    const has = (id: string) => selectedPatches.has(id);
    return {
      c: has('guard') && has('origin') ? 0 : 2,
      h: has('access') ? (has('origin') ? 0 : 1) : 2,
      m: has('safeerc') ? 0 : 1,
      l: has('events') ? 0 : 1
    };
  }, [selectedPatches]);

  const patchedSourceCode = useMemo(() => {
    const out: string[] = [];
    DIFF.forEach(e => {
      if (e.t === 'blank') { out.push(''); return; }
      if (e.t === 'ctx') { out.push(e.s || ''); return; }
      if (e.t === 'del') {
        if (!e.p || !selectedPatches.has(e.p)) out.push(e.s || '');
        return;
      }
      if (e.t === 'add' && e.p && selectedPatches.has(e.p)) {
        out.push(e.s || '');
      }
    });
    return out.join('\n');
  }, [selectedPatches]);

  // Diff rows generation
  const diffData = useMemo(() => {
    const rows: { t: 'ctx' | 'del' | 'add' | 'blank' | 'mod'; l: string | null; r: string | null; ln: number | string; rn: number | string }[] = [];
    let L = 1;
    let R = 1;

    DIFF.forEach(e => {
      if (e.t === 'blank') {
        rows.push({ t: 'blank', l: '', r: '', ln: '', rn: '' });
        return;
      }
      if (e.t === 'ctx') {
        rows.push({ t: 'ctx', l: e.s || '', r: e.s || '', ln: L++, rn: R++ });
        return;
      }
      if (e.t === 'del') {
        if (e.p && selectedPatches.has(e.p)) {
          rows.push({ t: 'del', l: e.s || '', r: null, ln: L++, rn: '' });
        } else {
          rows.push({ t: 'ctx', l: e.s || '', r: e.s || '', ln: L++, rn: R++ });
        }
        return;
      }
      if (e.t === 'add' && e.p && selectedPatches.has(e.p)) {
        rows.push({ t: 'add', l: null, r: e.s || '', ln: '', rn: R++ });
      }
    });

    // Merge adjacent del/add into aligned pairs
    const out: typeof rows = [];
    for (let i = 0; i < rows.length; i++) {
      const cur = rows[i];
      const nxt = rows[i + 1];
      if (cur.t === 'del' && nxt && nxt.t === 'add') {
        out.push({ t: 'mod', l: cur.l, r: nxt.r, ln: cur.ln, rn: nxt.rn });
        i++;
      } else {
        out.push(cur);
      }
    }

    // Unified diff lines
    const uni: string[] = [
      '--- a/src/EtherVault.sol',
      '+++ b/src/EtherVault.sol',
      '@@ AI-generated remediation patch @@'
    ];
    out.forEach(r => {
      if (r.t === 'blank') { uni.push(' '); return; }
      if (r.t === 'mod') { uni.push('-' + r.l); uni.push('+' + r.r); return; }
      if (r.t === 'del') { uni.push('-' + r.l); return; }
      if (r.t === 'add') { uni.push('+' + r.r); return; }
      uni.push(' ' + r.l);
    });

    return { rows: out, unified: uni.join('\n') };
  }, [selectedPatches]);

  const togglePatch = (id: string) => {
    setSelectedPatches(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAnimatedScore(null);
  };

  const handleApplyAll = () => {
    setSelectedPatches(new Set(PATCHES.map(p => p.id)));
    setAnimatedScore(null);
    showToast('5 patch diterapkan.', 'ok');
  };

  const handleClearAll = () => {
    setSelectedPatches(new Set());
    setAnimatedScore(null);
    showToast('Patch direset ke source vulnerable.', 'info');
  };

  const handleReaudit = () => {
    setIsReauditing(true);
    setReauditLogs([]);
    const lines = [
      `<span class="text-cyber">›</span> re-parsing patched AST · ${DIFF.filter(e => e.p && selectedPatches.has(e.p)).length} hunks applied`,
      '<span class="text-cyber">›</span> re-running 42 heuristics (SWC registry)…',
      `<span class="text-cyber">›</span> reentrancy graph traversal → ${counters.c === 0 ? '<span class="text-safe">no vulnerable path</span>' : `<span class="text-crit">${counters.c} critical</span>`}`,
      `<span class="text-cyber">›</span> access control matrix → ${counters.h === 0 ? '<span class="text-safe">all setters guarded</span>' : `${counters.h} high`}`,
      '<span class="text-cyber">›</span> new keccak256 code hash: 0x9a83…f4b0',
      `<span class="text-safe">✓ Re-audit selesai — Security Score 28 → ${score} (${grade.verdict})</span>`
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < lines.length) {
        setReauditLogs(prev => [...prev, lines[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setIsReauditing(false);
        // Animate score from 28 to target score
        let from = 28;
        const target = score;
        const duration = 800;
        const startTime = Date.now();
        const animInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / duration);
          const current = Math.round(from + (target - from) * (1 - Math.pow(1 - progress, 3)));
          setAnimatedScore(current);
          if (progress >= 1) {
            clearInterval(animInterval);
            setAnimatedScore(null);
            showToast(`Re-audit: score melonjak 28 → ${target}`, 'ok');
          }
        }, 16);
      }
    }, 240);
  };

  const handleOpenRemix = () => {
    navigator.clipboard.writeText(patchedSourceCode);
    window.open('https://remix.ethereum.org', '_blank');
    showToast('Remix terbuka — paste source yang sudah disalin.', 'info');
  };

  const handleDownloadSol = () => {
    const blob = new Blob([patchedSourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EtherVault.patched.sol';
    a.click();
    URL.revokeObjectURL(url);
    showToast('EtherVault.patched.sol diunduh.', 'ok');
  };

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(diffData.unified);
    showToast('Unified diff disalin ke clipboard.', 'ok');
  };

  const handleExportZip = () => {
    const bundle = [
      '# VibeProof Patch Bundle (simulated zip contents)',
      '',
      'foundry.toml',
      '  [profile.default]',
      '  src = "src"',
      '  out = "out"',
      '  libs = ["lib"]',
      '',
      'src/EtherVault.sol',
      '----------------------------------------',
      patchedSourceCode,
      '',
      'test/ExploitTest.t.sol',
      '----------------------------------------',
      '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\nimport {Test} from "forge-std/Test.sol";\nimport {EtherVault} from "../src/EtherVault.sol";\n\ncontract ExploitTest is Test {\n    // PoC validation code\n}',
      '',
      'remix-urls.txt',
      'https://remix.ethereum.org/#version=soljson-v0.8.24+commit.e11b9ed9.js',
      '',
      'vibeproof-report.md',
      `Security Score: ${score}/100 · Verdict: ${grade.verdict}`
    ].join('\n');

    const blob = new Blob([bundle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibeproof-patch-bundle.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Bundle Foundry diekspor (simulated zip).', 'ok');
  };

  return (
    <section id="view-patch" className="space-y-5">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-safe/25">
        <div className="absolute inset-0 suite-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40"></div>
        <div className="relative p-6 flex flex-wrap items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-xl border border-safe/40 bg-safe/10 text-safe">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v6m0 0 3-3m-3 3-3-3" />
              <path d="M4 14h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" />
            </svg>
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="chip text-[10px] font-extrabold tracking-[0.25em] uppercase text-safe">Priority #2 · High Utility</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">1-Click AI Patch & Remediation Studio</h1>
            <p className="mt-1 text-[13px] text-zinc-400">
              Pilih patch per finding, lihat diff hijau/merah ala GitHub PR, lalu re-audit instan untuk melihat lonjakan skor secara live.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-ink-800/80 px-4 py-2.5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Score</span>
              <span id="scoreBefore" className="font-mono text-lg font-extrabold text-crit">28</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
              <span
                id="scoreAfter"
                className={`font-mono text-lg font-extrabold ${grade.key === 'safe' ? 'text-safe' : grade.key === 'warn' ? 'text-warn' : 'text-crit'}`}
              >
                {displayScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[330px_minmax(0,1fr)] gap-5 items-start">
        {/* Left Column: Patches & Re-Audit Controls */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 bg-ink-850 flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Available Patches</p>
              <span className="flex-1"></span>
              <button
                id="applyAll"
                onClick={handleApplyAll}
                className="chip h-7 px-2.5 rounded-md border border-cyber/40 bg-cyber/10 text-cyber text-[10px] font-bold hover:bg-cyber/20 transition-colors cursor-pointer"
              >
                Apply all
              </button>
              <button
                id="clearAll"
                onClick={handleClearAll}
                className="chip h-7 px-2.5 rounded-md border border-zinc-700 bg-ink-700 text-zinc-400 text-[10px] font-bold hover:text-white transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
            <div id="patchList" className="divide-y divide-zinc-800/80">
              {PATCHES.map(p => {
                const on = selectedPatches.has(p.id);
                return (
                  <label key={p.id} className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-ink-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => togglePatch(p.id)}
                      className="mt-1 w-4 h-4 accent-cyan-400 shrink-0 cursor-pointer"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[12.5px] font-bold text-zinc-100">{p.title}</span>
                        <span className={`chip h-5 px-1.5 inline-flex items-center rounded border text-[9px] font-extrabold tracking-widest uppercase ${SEV_CHIP[p.sev]}`}>
                          {p.sev}
                        </span>
                        <span className="chip h-5 px-1.5 inline-flex items-center rounded bg-safe/10 border border-safe/40 text-safe font-mono text-[9.5px] font-bold">
                          +{p.delta}
                        </span>
                      </span>
                      <span className="block mt-1 text-[11.5px] text-zinc-500">{p.desc}</span>
                      <span className="block mt-1 font-mono text-[10px] text-zinc-600">fixes: {p.fixes}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Instant Re-Audit</p>
            <div className="flex items-center gap-4">
              <div
                id="patchRing"
                className="shrink-0"
                dangerouslySetInnerHTML={{ __html: ringSVG(displayScore, 72, 5) }}
              ></div>
              <div className="min-w-0">
                <p
                  id="patchVerdict"
                  className={`chip text-[11px] font-extrabold tracking-widest uppercase ${grade.key === 'safe' ? 'text-safe' : grade.key === 'warn' ? 'text-warn' : 'text-crit'}`}
                >
                  {grade.verdict}
                </p>
                <p className="mt-1 font-mono text-[10.5px] text-zinc-500" id="patchCounters">
                  C {counters.c} · H {counters.h} · M {counters.m} · L {counters.l}
                </p>
              </div>
            </div>

            {reauditLogs.length > 0 && (
              <div
                id="reauditLog"
                className="rounded-lg border border-zinc-800 bg-ink-900 px-3 py-2 font-mono text-[10.5px] leading-5 text-zinc-500 space-y-0.5"
              >
                {reauditLogs.map((line, idx) => (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: line }}></div>
                ))}
              </div>
            )}

            <button
              id="reauditBtn"
              disabled={isReauditing}
              onClick={handleReaudit}
              className="btn-cyber chip w-full h-11 rounded-xl bg-cyber text-ink-900 text-xs font-extrabold inline-flex items-center justify-center gap-2 hover:brightness-110 transition cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
              Re-Audit Patched Code
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="exportRemix"
                onClick={handleOpenRemix}
                className="chip h-10 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
              >
                Open in Remix ↗
              </button>
              <button
                id="exportSol"
                onClick={handleDownloadSol}
                className="chip h-10 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
              >
                Download .sol
              </button>
              <button
                id="exportDiff"
                onClick={handleCopyDiff}
                className="chip h-10 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
              >
                Copy unified diff
              </button>
              <button
                id="exportZip"
                onClick={handleExportZip}
                className="chip h-10 rounded-lg border border-safe/50 bg-safe/10 text-safe text-[11px] font-bold hover:bg-safe/20 transition-colors cursor-pointer"
              >
                Export Foundry zip
              </button>
            </div>
            <p className="font-mono text-[10px] text-zinc-600 leading-relaxed">
              Export zip berisi <span className="text-zinc-400">src/EtherVault.sol</span>, <span className="text-zinc-400">test/ExploitTest.t.sol</span>, <span className="text-zinc-400">foundry.toml</span> & <span className="text-zinc-400">remix-urls.txt</span> (simulated bundle).
            </p>
          </div>
        </div>

        {/* Right Column: Side-by-Side Diff */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-ink-850">
            <h3 className="text-sm font-bold text-white">Side-by-Side Diff</h3>
            <span className="chip h-6 px-2.5 inline-flex items-center rounded-full bg-crit/10 border border-crit/40 font-mono text-[10px] text-crit">
              − vulnerable
            </span>
            <span className="chip h-6 px-2.5 inline-flex items-center rounded-full bg-safe/10 border border-safe/40 font-mono text-[10px] text-safe">
              + AI secured
            </span>
            <span className="flex-1"></span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDiffMode('split')}
                className={`dtab chip h-8 px-3 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  diffMode === 'split' ? 'border border-cyber/50 bg-cyber/10 text-cyber' : 'border border-zinc-700 bg-ink-700 text-zinc-400 hover:text-white'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setDiffMode('unified')}
                className={`dtab chip h-8 px-3 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  diffMode === 'unified' ? 'border border-cyber/50 bg-cyber/10 text-cyber' : 'border border-zinc-700 bg-ink-700 text-zinc-400 hover:text-white'
                }`}
              >
                Unified
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-zinc-800 border-b border-zinc-800 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <div className="bg-ink-850 px-4 py-2">
              EtherVault.sol <span className="text-crit normal-case">(vulnerable · score 28)</span>
            </div>
            <div className="bg-ink-850 px-4 py-2">
              EtherVault.sol <span className="text-safe normal-case">(AI secured · score <span id="diffScore">{displayScore}</span>)</span>
            </div>
          </div>

          {diffMode === 'split' ? (
            <div id="diffSplit" className="scroll-thin max-h-[560px] overflow-auto bg-ink-900">
              {diffData.rows.map((r, idx) => {
                if (r.t === 'blank') {
                  return (
                    <div key={idx} className="d-row">
                      <div className="bg-ink-900 px-2 py-1 text-right font-mono text-[10px] text-zinc-700"></div>
                      <div className="bg-ink-900"></div>
                      <div className="bg-ink-900 px-2 py-1 text-right font-mono text-[10px] text-zinc-700"></div>
                      <div className="bg-ink-900"></div>
                    </div>
                  );
                }
                const lc = r.t === 'add' ? 'd-ctx' : (r.t === 'del' || r.t === 'mod' ? 'd-del' : 'd-ctx');
                const rc = r.t === 'del' ? 'd-ctx' : (r.t === 'add' || r.t === 'mod' ? 'd-add' : 'd-ctx');
                const mark = r.t === 'mod' || r.t === 'del' ? '−' : (r.t === 'add' ? '+' : ' ');
                const mark2 = r.t === 'mod' || r.t === 'add' ? '+' : ' ';

                return (
                  <div key={idx} className="d-row font-mono text-[11.5px] leading-[1.55]">
                    <div className="px-2 py-0.5 text-right text-zinc-700 bg-ink-900 select-none border-r border-zinc-800/70">
                      {r.ln || ''}
                    </div>
                    <div className={`px-3 py-0.5 whitespace-pre overflow-x-auto ${lc} text-zinc-300`}>
                      {r.l != null && (
                        <>
                          <span className={`mr-2 ${r.t === 'mod' || r.t === 'del' ? 'text-crit font-bold' : 'text-zinc-700'}`}>
                            {mark}
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: hl(r.l, 'sol') }}></span>
                        </>
                      )}
                    </div>
                    <div className="px-2 py-0.5 text-right text-zinc-700 bg-ink-900 select-none border-r border-zinc-800/70">
                      {r.rn || ''}
                    </div>
                    <div className={`px-3 py-0.5 whitespace-pre overflow-x-auto ${rc} text-zinc-300`}>
                      {r.r != null && (
                        <>
                          <span className={`mr-2 ${r.t === 'mod' || r.t === 'add' ? 'text-safe font-bold' : 'text-zinc-700'}`}>
                            {mark2}
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: hl(r.r, 'sol') }}></span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <pre
              id="diffUnified"
              className="code scroll-thin max-h-[560px] overflow-auto px-4 py-3 bg-ink-900 text-zinc-300 font-mono text-xs"
            >
              {diffData.unified.split('\n').map((line, idx) => {
                const cls = line.startsWith('+')
                  ? 'text-safe'
                  : line.startsWith('-')
                  ? 'text-crit'
                  : line.startsWith('@')
                  ? 'text-cyber'
                  : 'text-zinc-500';
                return (
                  <span key={idx} className={`block ${cls}`}>
                    {line}
                  </span>
                );
              })}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
};
