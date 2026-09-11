import React, { useState } from 'react';
import { WORKFLOW_YAML, SDK_TABS, GUARD_DB, hl, gradeOf, shortHash } from '../../data/suiteData';

interface DevPortalViewProps {
  showToast?: (msg: string, type?: 'ok' | 'err' | 'warn' | 'info') => void;
}

export const DevPortalView: React.FC<DevPortalViewProps> = ({
  showToast = (_msg?: string, _type?: 'ok' | 'err' | 'warn' | 'info') => {}
}) => {
  const [activeSdkTab, setActiveSdkTab] = useState<string>('sol');
  const [ciRunning, setCiRunning] = useState(false);
  const [ciSteps, setCiSteps] = useState<{ label: string; status: 'pending' | 'running' | 'ok' | 'fail' }[]>([]);
  const [ciDone, setCiDone] = useState(false);

  // Firewall simulator state
  const [firewallTarget, setFirewallTarget] = useState('0x38bF4d01c9aE77e5b021Ff6cD81a20A4');
  const [minScore, setMinScore] = useState(80);
  const [firewallResult, setFirewallResult] = useState<{
    allowed: boolean;
    name: string;
    score: number;
    reason: string;
    gasUsed: number;
  } | null>(null);

  const currentSdk = SDK_TABS[activeSdkTab] || SDK_TABS.sol;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Kode disalin ke clipboard.', 'ok');
  };

  // Run CI/CD simulation
  const handleRunCi = () => {
    setCiRunning(true);
    setCiDone(false);
    const stepDefinitions = [
      'Setup Foundry toolchain (nightly-2025)',
      'Checkout repository at commit 8a93ef2',
      'Run VibeProof AST scanner & 42 heuristics',
      'Enforce Security Score gate (min: 80)',
      'Anchor attestation on BOT Chain Testnet (#968)'
    ];

    setCiSteps(stepDefinitions.map(l => ({ label: l, status: 'pending' })));

    let current = 0;
    const interval = setInterval(() => {
      if (current < stepDefinitions.length) {
        setCiSteps(prev => {
          const next = [...prev];
          if (current > 0) next[current - 1].status = 'ok';
          next[current].status = 'running';
          return next;
        });
        current++;
      } else {
        clearInterval(interval);
        setCiSteps(prev => prev.map(s => ({ ...s, status: 'ok' })));
        setCiRunning(false);
        setCiDone(true);
        showToast('CI/CD Gate Passed: Security score 96/100 · Merge allowed.', 'ok');
      }
    }, 450);
  };

  // Test Firewall
  const handleTestFirewall = () => {
    const known = GUARD_DB[firewallTarget] || { name: 'UnknownBytecode.sol', score: 28 };
    const allowed = known.score >= minScore;
    const gasUsed = allowed ? 21450 : 23120;
    setFirewallResult({
      allowed,
      name: known.name,
      score: known.score,
      reason: allowed
        ? `Security score ${known.score}/100 exceeds threshold ${minScore}/100. Interaction permitted.`
        : `Transaction Reverted: InsecureTarget(${known.score}, minScore: ${minScore}). Interaction blocked on-chain.`,
      gasUsed
    });

    showToast(
      allowed ? `Firewall PASSED for ${known.name}` : `Firewall BLOCKED interaction with ${known.name}`,
      allowed ? 'ok' : 'err'
    );
  };

  return (
    <section id="view-dev" className="space-y-5">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyber/25">
        <div className="absolute inset-0 suite-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40"></div>
        <div className="relative p-6 flex flex-wrap items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-xl border border-cyber/40 bg-cyber/10 text-cyber">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="chip text-[10px] font-extrabold tracking-[0.25em] uppercase text-cyber">Priority #7 · Ecosystem Integration</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">Developer Portal, SDK & On-Chain Firewall</h1>
            <p className="mt-1 text-[13px] text-zinc-400">
              Integrasikan VibeProof ke pipeline CI/CD GitHub Actions, gunakan SDK TypeScript/Python, dan pasang firewall on-chain <span className="text-zinc-200 font-mono">IVibeProofGuard</span> untuk menolak interaksi dApp berbahaya.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="chip h-9 px-3 inline-flex items-center rounded-lg border border-zinc-700 bg-ink-800/80 font-mono text-[11px] text-zinc-400">
              npm: @vibeproof/sdk
            </span>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-5 items-start">
        {/* Left Column: CI/CD Security Gate Simulation */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-ink-850 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">GitHub Actions Pipeline</p>
                <h3 className="text-sm font-extrabold text-white">.github/workflows/vibeproof.yml</h3>
              </div>
              <button
                onClick={() => handleCopy(WORKFLOW_YAML)}
                className="chip h-7 px-2.5 rounded-md border border-zinc-700 bg-ink-700 text-[10.5px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Copy YAML
              </button>
            </div>

            <pre
              className="code scroll-thin max-h-[300px] overflow-auto px-4 py-3 bg-ink-950 text-zinc-300 font-mono text-xs"
              dangerouslySetInnerHTML={{ __html: hl(WORKFLOW_YAML, 'yml') }}
            ></pre>
          </div>

          {/* Live CI/CD Simulator */}
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live PR Check Simulator</p>
                <h3 className="text-sm font-extrabold text-white">Pull Request #42 Security Gate</h3>
              </div>
              <button
                disabled={ciRunning}
                onClick={handleRunCi}
                className="chip h-9 px-4 rounded-lg bg-cyber text-ink-900 text-xs font-extrabold hover:brightness-110 transition cursor-pointer"
              >
                {ciRunning ? 'Running Gate…' : '▶ Simulate PR Gate'}
              </button>
            </div>

            {ciSteps.length > 0 && (
              <div className="space-y-2 rounded-xl border border-zinc-800 bg-ink-850 p-3 font-mono text-xs">
                {ciSteps.map((st, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {st.status === 'ok' ? (
                      <span className="text-safe font-bold">✓</span>
                    ) : st.status === 'running' ? (
                      <span className="text-cyber animate-pulse">●</span>
                    ) : (
                      <span className="text-zinc-600">○</span>
                    )}
                    <span className={st.status === 'ok' ? 'text-zinc-200' : st.status === 'running' ? 'text-cyber font-bold' : 'text-zinc-500'}>
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {ciDone && (
              <div className="rounded-xl border border-safe/40 bg-safe/10 p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-safe font-extrabold">
                  <span>✓ ALL CHECKS PASSED</span>
                  <span className="chip px-2 py-0.5 rounded bg-safe/20 text-[10px]">Score: 96/100</span>
                </div>
                <p className="text-zinc-300">
                  Bot VibeProof telah menerbitkan sertifikat on-chain dengan tx{' '}
                  <span className="font-mono text-cyber">0x9a83…f4b0</span> pada BOT Chain Testnet. PR siap di-merge!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SDK Code Tabs & On-Chain Firewall Simulator */}
        <div className="space-y-5">
          {/* SDK Code Tabs */}
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
            <div className="flex flex-wrap border-b border-zinc-800 bg-ink-850">
              {Object.keys(SDK_TABS).map(k => (
                <button
                  key={k}
                  onClick={() => setActiveSdkTab(k)}
                  className={`chip h-10 px-3.5 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
                    activeSdkTab === k ? 'text-cyber border-cyber' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  {SDK_TABS[k].title}
                </button>
              ))}
              <span className="flex-1"></span>
              <button
                onClick={() => handleCopy(currentSdk.code)}
                className="chip self-center mr-3 h-7 px-2.5 rounded-md border border-zinc-700 bg-ink-700 text-[10.5px] font-bold text-zinc-300 hover:text-white cursor-pointer"
              >
                Copy
              </button>
            </div>

            <div className="px-4 py-2 bg-ink-900 border-b border-zinc-800 font-mono text-[11px] text-zinc-500">
              {currentSdk.file}
            </div>

            <pre
              className="code scroll-thin max-h-[300px] overflow-auto px-4 py-3 bg-ink-950 text-zinc-300 font-mono text-xs"
              dangerouslySetInnerHTML={{ __html: hl(currentSdk.code, currentSdk.lang) }}
            ></pre>
          </div>

          {/* Interactive On-Chain Firewall Simulator */}
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Smart Contract Integration</p>
              <h3 className="text-sm font-extrabold text-white">IVibeProofGuard — Live On-Chain Firewall Simulator</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Uji interaksi kontrak lain dengan guard modifier sebelum melakukan deposit/swap/transfer.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Target Contract Address</label>
                <select
                  value={firewallTarget}
                  onChange={e => setFirewallTarget(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-ink-900 px-3 py-2 font-mono text-xs text-zinc-200 outline-none focus:border-cyber cursor-pointer"
                >
                  {Object.entries(GUARD_DB).map(([addr, val]) => (
                    <option key={addr} value={addr}>
                      {val.name} · Score {val.score}/100 · {shortHash(addr, 6, 4)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="flex justify-between font-mono text-[11px] text-zinc-400">
                  <span>Minimum Security Score Threshold</span>
                  <span className="text-cyber font-bold">{minScore}/100</span>
                </span>
                <input
                  type="range"
                  min="40"
                  max="95"
                  value={minScore}
                  onChange={e => setMinScore(Number(e.target.value))}
                  className="w-full mt-1.5 accent-cyan-400 cursor-pointer"
                />
              </div>

              <button
                onClick={handleTestFirewall}
                className="chip w-full h-10 rounded-xl bg-cyber text-ink-900 text-xs font-extrabold hover:brightness-110 transition cursor-pointer"
              >
                Execute guard.checkSecurity()
              </button>

              {firewallResult && (
                <div
                  className={`rounded-xl border p-3.5 space-y-2 font-mono text-xs ${
                    firewallResult.allowed
                      ? 'border-safe/50 bg-safe/10 text-safe'
                      : 'border-crit/50 bg-crit/10 text-crit'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{firewallResult.allowed ? '✓ CALL PERMITTED' : '✗ EXECUTION REVERTED'}</span>
                    <span className="text-[10px] opacity-80">gas: {firewallResult.gasUsed}</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed font-sans">{firewallResult.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
