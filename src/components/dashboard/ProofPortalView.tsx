import React, { useState, useMemo } from 'react';
import { PROOFS, NETWORKS, ringSVG, qrSVG, gradeOf, shortHash, ProofItem } from '../../data/suiteData';

interface ProofPortalViewProps {
  network?: string;
  showToast?: (msg: string, type?: 'ok' | 'err' | 'warn' | 'info') => void;
}

export const ProofPortalView: React.FC<ProofPortalViewProps> = ({
  network = 'testnet',
  showToast = (_msg?: string, _type?: 'ok' | 'err' | 'warn' | 'info') => {}
}) => {
  const [proofIdx, setProofIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'public' | 'og' | 'pdf'>('public');

  const net = NETWORKS[network] || NETWORKS.testnet;
  const p: ProofItem = PROOFS[proofIdx] || PROOFS[0];
  const g = gradeOf(p.score);

  const permalink = `https://vibeproof.botchain.ai/proof/${p.hash}`;
  const docId = `VP-${net.id}-${p.hash.slice(2, 10).toUpperCase()}`;
  const badgeMd = `[![VibeProof: ${p.score}/100](https://vibeproof.botchain.ai/badge/${p.hash.slice(2, 10)}.svg)](${permalink})`;
  const ogImageUrl = `https://vibeproof.botchain.ai/api/og/${p.hash.slice(2, 18)}.png`;

  const copyText = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    showToast(msg, 'ok');
  };

  const handleShareX = () => {
    const text = `Verifiable security proof: ${p.name} scored ${p.score}/100 on @BOTChain_ai via VibeProof 🛡️ ${permalink} #VibeProof #BOTChain`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrintPdf = () => {
    showToast('Dialog print terbuka — pilih "Save as PDF".', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <section id="view-proof" className="space-y-5">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyber/25">
        <div className="absolute inset-0 suite-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40"></div>
        <div className="relative p-6 flex flex-wrap items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-xl border border-cyber/40 bg-cyber/10 text-cyber">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="chip text-[10px] font-extrabold tracking-[0.25em] uppercase text-cyber">Priority #4 · Trust Anchor</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">Verifiable Audit Proof Portal & PDF Exporter</h1>
            <p className="mt-1 text-[13px] text-zinc-400">
              Audit bukti nyata yang di-anchor on-chain ke BOT Chain via <span className="text-zinc-200 font-mono">certifyAudit()</span> — lengkap dengan permalink publik, badge README, dan PDF ber-watermark kriptografis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              id="proofSelect"
              value={proofIdx}
              onChange={e => setProofIdx(Number(e.target.value))}
              className="chip h-10 px-3 rounded-lg border border-zinc-700 bg-ink-800 font-mono text-xs text-zinc-200 cursor-pointer"
            >
              {PROOFS.map((item, idx) => (
                <option key={idx} value={idx}>
                  {item.name} · {item.score}/100 · {gradeOf(item.score).verdict}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-zinc-800 bg-ink-850 rounded-t-2xl px-2">
        <button
          onClick={() => setActiveTab('public')}
          className={`ptab chip h-11 px-4 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'public' ? 'text-cyber border-cyber' : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Public Verification Page
        </button>
        <button
          onClick={() => setActiveTab('og')}
          className={`ptab chip h-11 px-4 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'og' ? 'text-cyber border-cyber' : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Social Share Card (OG Preview)
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`ptab chip h-11 px-4 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'pdf' ? 'text-cyber border-cyber' : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Audit Report PDF Preview
        </button>
      </div>

      {/* Tab 1: Public Verification Page */}
      {activeTab === 'public' && (
        <div id="ppane-public" className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-ink-800 p-4">
            <span className="font-mono text-xs text-zinc-400">Permalink publik:</span>
            <input
              id="permalink"
              type="text"
              readOnly
              value={permalink}
              className="flex-1 min-w-[280px] rounded-lg border border-zinc-700 bg-ink-900 px-3 py-2 font-mono text-xs text-cyber select-all"
            />
            <button
              id="copyPermalink"
              onClick={() => copyText(permalink, 'Permalink publik disalin')}
              className="chip h-9 px-3 rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
            >
              Copy link
            </button>
            <button
              id="pubShareX"
              onClick={handleShareX}
              className="chip h-9 px-3 rounded-lg border border-cyber/50 bg-cyber/10 text-xs font-bold text-cyber hover:bg-cyber/20 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              Share on 𝕏
            </button>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
            {/* Main Proof Details */}
            <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                <div
                  id="pubRing"
                  className="shrink-0"
                  dangerouslySetInnerHTML={{ __html: ringSVG(p.score, 110, 6) }}
                ></div>
                <div className="flex-1 min-w-[240px]">
                  <p className="chip text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                    Verified On-Chain Audit Proof · <span id="pubNet">{net.name} · {net.id}</span>
                  </p>
                  <h2 id="pubContract" className="mt-1 text-2xl font-extrabold text-white">{p.name}</h2>
                  <span
                    id="pubVerdict"
                    className={`mt-2 chip inline-flex items-center h-8 px-3.5 rounded-full border text-[11px] font-extrabold tracking-widest uppercase ${g.chip}`}
                  >
                    {g.verdict}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Executive Summary</p>
                <p id="pubSummary" className="text-[13.5px] leading-relaxed text-zinc-300">
                  {p.summary}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-ink-850 p-4 space-y-2.5 font-mono text-[11.5px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">On-Chain Attestation Details</p>
                <div className="flex flex-wrap gap-2 justify-between">
                  <span className="text-zinc-500">Bytecode Keccak256</span>
                  <span id="pubHash" className="text-zinc-200 truncate max-w-[340px]">{p.hash}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-between">
                  <span className="text-zinc-500">Auditor Signer</span>
                  <span id="pubAuditor" className="text-zinc-200">{p.auditor}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-between">
                  <span className="text-zinc-500">Attestation TX</span>
                  <span id="pubTx" className="text-cyber truncate max-w-[340px]">{p.tx}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-between">
                  <span className="text-zinc-500">Block Number</span>
                  <span id="pubBlock" className="text-zinc-300">
                    #{p.block.toLocaleString('en-US')} · {new Date(Date.now() - p.min * 60000).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' })}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-end">
                  <a
                    id="pubExplorer"
                    href={`${net.explorer}/tx/${p.tx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="chip text-[11px] font-bold text-cyber hover:underline inline-flex items-center gap-1"
                  >
                    View on BOT Chain Explorer ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar: Embed Badge & QR */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Embed Badge di GitHub</p>
                <div className="inline-flex rounded-md overflow-hidden font-mono text-xs font-bold border border-zinc-700">
                  <span className="bg-ink-700 px-2.5 py-1 text-zinc-300">vibeproof</span>
                  <span
                    id="pubBadgeScore"
                    className={`px-2 grid place-items-center ${g.key === 'safe' ? 'bg-safe' : g.key === 'warn' ? 'bg-warn' : 'bg-crit'} text-white font-extrabold`}
                  >
                    {p.score}/100
                  </span>
                </div>
                <pre
                  id="pubBadgeMd"
                  className="code rounded-lg bg-ink-900 border border-zinc-800 p-2 text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap select-all font-mono"
                >
                  {badgeMd}
                </pre>
                <button
                  id="pubCopyBadge"
                  onClick={() => copyText(badgeMd, 'Badge markdown disalin')}
                  className="chip w-full h-8 rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 transition-colors cursor-pointer"
                >
                  Copy badge markdown
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-4 text-center space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">On-Chain QR Verification</p>
                <div
                  id="qrBox"
                  className="grid place-items-center bg-white p-3 rounded-xl mx-auto w-fit"
                  dangerouslySetInnerHTML={{ __html: qrSVG(`${net.explorer}/tx/${p.tx}`, 168) }}
                ></div>
                <p id="qrCaption" className="font-mono text-[10px] text-zinc-500 truncate">
                  {`${net.explorer}/tx/${shortHash(p.tx, 10, 6)}`}
                </p>
                <p className="text-[11px] text-zinc-500">Scan dengan smartphone untuk memverifikasi tx di BOT Chain.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Social Share Card (OG Preview) */}
      {activeTab === 'og' && (
        <div id="ppane-og" className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Auto-Generated Social Card</p>
                <h3 className="text-base font-extrabold text-white">Dynamic 1200×630 OpenGraph Preview</h3>
              </div>
              <span className="flex-1"></span>
              <button
                id="copyOgUrl"
                onClick={() => copyText(ogImageUrl, 'OG image URL disalin')}
                className="chip h-9 px-3 rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 transition-colors cursor-pointer"
              >
                Copy image URL
              </button>
              <button
                id="ogShareX"
                onClick={handleShareX}
                className="chip h-9 px-4 rounded-lg bg-cyber text-ink-900 text-xs font-extrabold hover:brightness-110 transition cursor-pointer"
              >
                Share on 𝕏 (Twitter)
              </button>
            </div>

            {/* OG Frame Simulation */}
            <div className="overflow-hidden rounded-xl border border-zinc-700 bg-ink-900 p-2 sm:p-4">
              <div className="w-full max-w-[800px] mx-auto aspect-[1200/630] rounded-lg overflow-hidden border border-zinc-700 bg-ink-950 relative flex flex-col justify-between p-8 sm:p-12 shadow-2xl">
                {/* Background watermarks */}
                <div className="absolute inset-0 suite-bg opacity-15 pointer-events-none"></div>
                <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-cyber/10 blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-cyber text-ink-900 font-extrabold text-lg grid place-items-center font-mono">
                      VP
                    </span>
                    <div>
                      <span className="font-extrabold text-lg tracking-wider text-white">VIBEPROOF</span>
                      <span className="block text-[10px] font-mono text-zinc-500">AI SMART CONTRACT AUDITOR</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-zinc-400 px-3 py-1 rounded-full border border-zinc-700 bg-ink-800">
                    BOT Chain Verified
                  </span>
                </div>

                {/* Middle info */}
                <div className="relative my-auto flex items-center justify-between gap-6 z-10">
                  <div className="space-y-3">
                    <span
                      id="ogVerdict"
                      className={`inline-flex items-center h-10 px-4 rounded-full border-2 text-base font-extrabold tracking-widest uppercase ${
                        g.key === 'safe'
                          ? 'border-safe/60 bg-safe/10 text-safe'
                          : g.key === 'warn'
                          ? 'border-warn/60 bg-warn/10 text-warn'
                          : 'border-crit/60 bg-crit/10 text-crit'
                      }`}
                    >
                      {g.verdict}
                    </span>
                    <h1 id="ogContract" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {p.name}
                    </h1>
                    <p className="font-mono text-xs text-zinc-400 flex items-center gap-2">
                      <span>Hash: {shortHash(p.hash, 8, 6)}</span>
                      <span>·</span>
                      <span id="ogChain">{net.name} · {net.id}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Security Score</p>
                    <div
                      id="ogScore"
                      className={`text-7xl sm:text-8xl font-extrabold font-mono leading-none ${
                        g.key === 'safe' ? 'text-safe' : g.key === 'warn' ? 'text-warn' : 'text-crit'
                      }`}
                    >
                      {p.score}
                    </div>
                    <p className="font-mono text-xs text-zinc-400 mt-1">out of 100</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="relative pt-4 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-500 z-10">
                  <span>Audited on BOT Chain · tx {shortHash(p.tx, 8, 6)}</span>
                  <span>vibeproof.botchain.ai</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-ink-850 p-3 font-mono text-xs text-zinc-400 space-y-1">
              <p>Image URL: <span className="text-cyber">{ogImageUrl}</span></p>
              <p>Meta Title: <span className="text-zinc-200">VibeProof Audit — {p.name} ({p.score}/100)</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Report PDF Preview */}
      {activeTab === 'pdf' && (
        <div id="ppane-pdf" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-ink-800 p-4">
            <span className="font-mono text-xs text-zinc-400">Document ID:</span>
            <span id="pdfId" className="font-mono text-xs text-cyber font-bold">{docId}</span>
            <span className="flex-1"></span>
            <button
              id="pdfDownload"
              onClick={handlePrintPdf}
              className="chip h-10 px-4 rounded-xl bg-cyber text-ink-900 text-xs font-extrabold inline-flex items-center gap-2 hover:brightness-110 transition cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Download PDF / Print
            </button>
          </div>

          {/* Clean White Paper Styled Document Preview */}
          <div className="rounded-2xl border border-zinc-800 bg-white text-zinc-900 p-8 sm:p-12 shadow-2xl space-y-8 font-sans">
            <div className="border-b-4 border-cyan-500 pb-5 flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">VibeProof — Security Audit Report</h1>
                <p className="font-mono text-xs sm:text-sm text-zinc-600 mt-1">
                  {p.name} · {net.name} (Chain ID {net.id})
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Security Score</p>
                <p className="font-mono text-4xl sm:text-5xl font-extrabold leading-none" style={{ color: g.color }}>
                  {p.score}/100
                </p>
                <p className="text-xs font-extrabold uppercase tracking-wider mt-1" style={{ color: g.color }}>
                  {g.verdict}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-extrabold tracking-widest uppercase text-zinc-500 mb-2">1 · Executive Summary</h2>
              <p className="text-sm leading-relaxed text-zinc-700">{p.summary}</p>
            </div>

            <div>
              <h2 className="text-xs font-extrabold tracking-widest uppercase text-zinc-500 mb-2">2 · Scope & Methodology</h2>
              <p className="text-sm leading-relaxed text-zinc-700">
                Static AST analysis (solc 0.8.24), 42 SWC-based vulnerability heuristics, reentrancy graph traversal, access-control matrix review, unchecked-call detection, and opcode-level gas profiling. Audit evidence anchored on BOT Chain via <span className="font-mono text-xs font-semibold">VibeProof.certifyAudit()</span> at 0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578.
              </p>
            </div>

            <div>
              <h2 className="text-xs font-extrabold tracking-widest uppercase text-zinc-500 mb-2">3 · Audit Findings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-zinc-200">
                  <thead className="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-200">
                    <tr>
                      <th className="p-2.5 border-r border-zinc-200">Severity</th>
                      <th className="p-2.5 border-r border-zinc-200">Finding</th>
                      <th className="p-2.5 border-r border-zinc-200">Line</th>
                      <th className="p-2.5">Remediation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {p.findings.map((f, i) => {
                      const col = f[0] === 'Critical' ? '#e11d48' : f[0] === 'High' ? '#f97316' : f[0] === 'Medium' ? '#d97706' : '#52525b';
                      return (
                        <tr key={i}>
                          <td className="p-2.5 font-bold border-r border-zinc-200" style={{ color: col }}>{f[0]}</td>
                          <td className="p-2.5 border-r border-zinc-200">{f[1]}</td>
                          <td className="p-2.5 font-mono border-r border-zinc-200">L{f[2]}</td>
                          <td className="p-2.5">{f[3]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-extrabold tracking-widest uppercase text-zinc-500 mb-2">4 · On-Chain Attestation</h2>
              <table className="font-mono text-xs w-full">
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-2 text-zinc-500 w-36">Network</td>
                    <td className="py-2 text-zinc-800">{net.name} ({net.id}) · {net.rpc}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-zinc-500">Code Hash</td>
                    <td className="py-2 text-zinc-800 break-all">{p.hash}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-zinc-500">Transaction</td>
                    <td className="py-2 text-zinc-800 break-all">{p.tx}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-zinc-500">Block</td>
                    <td className="py-2 text-zinc-800">#{p.block.toLocaleString('en-US')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-zinc-500">Timestamp</td>
                    <td className="py-2 text-zinc-800">{new Date(Date.now() - p.min * 60000).toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-zinc-500">Auditor</td>
                    <td className="py-2 text-zinc-800">{p.auditor}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-zinc-500">Doc ID</td>
                    <td className="py-2 text-zinc-800 font-bold">{docId}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t border-zinc-200 flex flex-wrap justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>© 2025 VibeProof · Girl Meets Tech × On Chain Consultancy Vol.2</span>
              <span>WATERMARK: VIBEPROOF VERIFIED · {docId}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hidden container for window.print() */}
      <div id="printArea" className="hidden print:block">
        <div style={{ fontFamily: 'ui-sans-serif, system-ui', color: '#111', padding: '32px' }}>
          <div style={{ borderBottom: '4px solid #06b6d4', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>VibeProof — Smart Contract Security Audit Report</h1>
              <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555', margin: '6px 0 0' }}>
                {p.name} · {net.name} (Chain ID {net.id})
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#777', margin: 0 }}>Security Score</p>
              <p style={{ fontFamily: 'monospace', fontSize: '34px', fontWeight: 800, margin: 0, color: g.color }}>{p.score}/100</p>
              <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.12em', color: g.color, margin: 0 }}>{g.verdict}</p>
            </div>
          </div>
          <h2 style={{ fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#666', margin: '22px 0 6px' }}>1 · Executive Summary</h2>
          <p style={{ fontSize: '12.5px', lineHeight: 1.65, margin: 0 }}>{p.summary}</p>
          <h2 style={{ fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#666', margin: '22px 0 6px' }}>2 · Scope & Methodology</h2>
          <p style={{ fontSize: '12.5px', lineHeight: 1.65, margin: 0 }}>
            Static AST analysis (solc 0.8.24), 42 SWC-based vulnerability heuristics, reentrancy graph traversal, access-control matrix review, unchecked-call detection, and opcode-level gas profiling. Audit evidence anchored on BOT Chain via VibeProof.certifyAudit() at 0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578.
          </p>
          <h2 style={{ fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#666', margin: '22px 0 6px' }}>3 · Findings</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ background: '#f4f4f5', textAlign: 'left' }}>
                <th style={{ border: '1px solid #e4e4e7', padding: '6px' }}>Severity</th>
                <th style={{ border: '1px solid #e4e4e7', padding: '6px' }}>Finding</th>
                <th style={{ border: '1px solid #e4e4e7', padding: '6px' }}>Line</th>
                <th style={{ border: '1px solid #e4e4e7', padding: '6px' }}>Remediation</th>
              </tr>
            </thead>
            <tbody>
              {p.findings.map((f, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #e4e4e7', padding: '6px', fontWeight: 700 }}>{f[0]}</td>
                  <td style={{ border: '1px solid #e4e4e7', padding: '6px' }}>{f[1]}</td>
                  <td style={{ border: '1px solid #e4e4e7', padding: '6px', fontFamily: 'monospace' }}>L{f[2]}</td>
                  <td style={{ border: '1px solid #e4e4e7', padding: '6px' }}>{f[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 style={{ fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#666', margin: '22px 0 6px' }}>4 · On-Chain Attestation</h2>
          <table style={{ fontFamily: 'monospace', fontSize: '11px', width: '100%' }}>
            <tbody>
              <tr><td style={{ padding: '3px 8px 3px 0', color: '#777', width: '110px' }}>Network</td><td style={{ padding: '3px 0' }}>{net.name} ({net.id})</td></tr>
              <tr><td style={{ padding: '3px 8px 3px 0', color: '#777' }}>Code Hash</td><td style={{ padding: '3px 0' }}>{p.hash}</td></tr>
              <tr><td style={{ padding: '3px 8px 3px 0', color: '#777' }}>Transaction</td><td style={{ padding: '3px 0' }}>{p.tx}</td></tr>
              <tr><td style={{ padding: '3px 8px 3px 0', color: '#777' }}>Block</td><td style={{ padding: '3px 0' }}>#{p.block.toLocaleString('en-US')}</td></tr>
              <tr><td style={{ padding: '3px 8px 3px 0', color: '#777' }}>Timestamp</td><td style={{ padding: '3px 0' }}>{new Date(Date.now() - p.min * 60000).toLocaleString('id-ID')}</td></tr>
              <tr><td style={{ padding: '3px 8px 3px 0', color: '#777' }}>Auditor</td><td style={{ padding: '3px 0' }}>{p.auditor}</td></tr>
              <tr><td style={{ padding: '3px 8px 3px 0', color: '#777' }}>Doc ID</td><td style={{ padding: '3px 0' }}>{docId}</td></tr>
            </tbody>
          </table>
          <div style={{ marginTop: '26px', borderTop: '1px solid #e4e4e7', paddingTop: '10px', fontFamily: 'monospace', fontSize: '10px', color: '#777', display: 'flex', justifyContent: 'space-between' }}>
            <span>© 2025 VibeProof · Girl Meets Tech × On Chain Consultancy Vol.2</span>
            <span>WATERMARK: VIBEPROOF VERIFIED · {docId}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
