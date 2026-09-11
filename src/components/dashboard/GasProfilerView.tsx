import React, { useState, useMemo } from 'react';
import { hl } from '../../data/suiteData';

interface GasProfilerViewProps {
  onNavigate?: (viewId: string) => void;
  showToast?: (msg: string, type?: 'ok' | 'err' | 'warn' | 'info') => void;
}

const GAS_FN = [
  { fn: 'deposit()', before: 84210, after: 71940 },
  { fn: 'withdraw()', before: 96480, after: 78120 },
  { fn: 'transfer(address,uint256)', before: 52310, after: 44080 },
  { fn: 'setFee(uint256)', before: 28940, after: 26110 },
  { fn: 'claimRewards()', before: 118200, after: 92430 },
  { fn: 'bulkTransfer(…)', before: 214880, after: 161200 }
];

const GAS_FINDINGS = [
  {
    t: 'Storage slot packing',
    sev: 'high',
    save: 2100,
    before: 'uint256 public feeBps;\naddress public owner;\nbool public paused;',
    after: 'struct Config { uint64 feeBps; bool paused; }\nConfig public config;   // 1 slot\naddress public owner;   // 1 slot'
  },
  {
    t: 'Custom errors vs require()',
    sev: 'medium',
    save: 60,
    before: 'require(bal > 0, "No funds available");',
    after: 'error ZeroBalance();\nif (bal == 0) revert ZeroBalance();'
  },
  {
    t: 'Loop length caching',
    sev: 'medium',
    save: 100,
    before: 'for (uint256 i = 0; i < arr.length; i++) {',
    after: 'uint256 len = arr.length;\nfor (uint256 i; i < len; ) { … unchecked { ++i; } }'
  },
  {
    t: 'calldata instead of memory',
    sev: 'low',
    save: 340,
    before: 'function batch(address[] memory to) external {',
    after: 'function batch(address[] calldata to) external {'
  },
  {
    t: 'Duplicate SLOAD elimination',
    sev: 'high',
    save: 100,
    before: 'totalShares -= a;\nemit Updated(totalShares);',
    after: 'uint256 ts = totalShares - a;\ntotalShares = ts;\nemit Updated(ts);'
  },
  {
    t: 'unchecked arithmetic block',
    sev: 'low',
    save: 45,
    before: '_shares[msg.sender] = bal - amt;',
    after: 'unchecked { _shares[msg.sender] = bal - amt; }'
  }
];

const OPCODES = [
  { n: 'SSTORE', p: 38, c: '#f43f5e' },
  { n: 'SLOAD', p: 22, c: '#f59e0b' },
  { n: 'CALL', p: 18, c: '#00F0FF' },
  { n: 'LOG', p: 9, c: '#10b981' },
  { n: 'Arithmetic', p: 8, c: '#a78bfa' },
  { n: 'Memory/Stack', p: 5, c: '#52525b' }
];

const SEV_CHIP: Record<string, string> = {
  high: 'border-orange-400/50 bg-orange-400/10 text-orange-400',
  medium: 'border-warn/50 bg-warn/10 text-warn',
  low: 'border-zinc-600 bg-zinc-700/40 text-zinc-300'
};

export const GasProfilerView: React.FC<GasProfilerViewProps> = ({
  onNavigate,
  showToast = (_msg?: string, _type?: 'ok' | 'err' | 'warn' | 'info') => {}
}) => {
  // Calculator state
  const [gasSaved, setGasSaved] = useState(24800);
  const [dailyTx, setDailyTx] = useState(15000);
  const [gwei, setGwei] = useState(1.5);
  const [tokenPrice, setTokenPrice] = useState(0.85);

  // Financial calculations
  const botPerTx = (gasSaved * gwei * 1e9) / 1e18;
  const per1k = botPerTx * 1000;
  const perDay = botPerTx * dailyTx;
  const perMon = perDay * 30;
  const perYear = perDay * 365;

  const fmt = (v: number) => {
    if (v < 0.001) return v.toExponential(2);
    if (v < 1) return v.toFixed(5);
    if (v < 100) return v.toFixed(3);
    return Math.round(v).toLocaleString('en-US');
  };

  const handleApplyToPatch = (title: string) => {
    showToast(`Optimasi "${title}" dikirim ke Patch Studio.`, 'ok');
    if (onNavigate) onNavigate('patch');
  };

  return (
    <section id="view-gas" className="space-y-5">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-safe/25">
        <div className="absolute inset-0 suite-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40"></div>
        <div className="relative p-6 flex flex-wrap items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-xl border border-safe/40 bg-safe/10 text-safe">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="chip text-[10px] font-extrabold tracking-[0.25em] uppercase text-safe">Priority #6 · Real-World Impact</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">Opcode Gas Profiler & Financial Savings Calculator</h1>
            <p className="mt-1 text-[13px] text-zinc-400">
              Analisis konsumsi gas pada level bytecode opcode EVM dan kalkulasikan penghematan biaya transaksi riil dalam token BOT & USD.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="chip h-9 px-3 inline-flex items-center rounded-lg border border-safe/40 bg-safe/10 font-mono text-[11px] text-safe">
              avg savings: −{gasSaved.toLocaleString('en-US')} gas / tx
            </span>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
        {/* Left Column: Benchmarks, Opcode Stack & Findings */}
        <div className="space-y-5">
          {/* Function Gas Benchmark Table */}
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-ink-850">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Function Profiling</p>
              <h3 className="text-sm font-extrabold text-white">Execution Gas Benchmark (Before vs After)</h3>
            </div>
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-left font-mono text-[11.5px] whitespace-nowrap">
                <thead className="border-b border-zinc-800 bg-ink-850/60 text-[10px] uppercase tracking-widest text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5">Function</th>
                    <th className="px-3 py-2.5">Before</th>
                    <th className="px-3 py-2.5">Optimized</th>
                    <th className="px-3 py-2.5">Net Saved</th>
                    <th className="px-4 py-2.5">Reduction</th>
                  </tr>
                </thead>
                <tbody id="gasBody" className="divide-y divide-zinc-800/60">
                  {GAS_FN.map(f => {
                    const saved = f.before - f.after;
                    const pct = Math.round((saved / f.before) * 100);
                    return (
                      <tr key={f.fn} className="hover:bg-ink-700/40 transition-colors">
                        <td className="px-4 py-2.5 text-zinc-200 font-bold">{f.fn}</td>
                        <td className="px-3 py-2.5 text-zinc-500">{f.before.toLocaleString('en-US')}</td>
                        <td className="px-3 py-2.5 text-safe">{f.after.toLocaleString('en-US')}</td>
                        <td className="px-3 py-2.5 text-white font-bold">
                          −{saved.toLocaleString('en-US')} <span className="text-zinc-500">({pct}%)</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="block h-1.5 rounded-full bg-ink-600 overflow-hidden w-28">
                            <span
                              className="block h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-400"
                              style={{ width: `${Math.min(100, pct * 3)}%` }}
                            ></span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* EVM Opcode Gas Distribution */}
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">EVM Opcode Analysis</p>
              <h3 className="text-sm font-extrabold text-white">Opcode Gas Consumption Breakdown</h3>
            </div>

            {/* Stacked bar */}
            <div id="opcodeStack" className="h-3 rounded-full overflow-hidden flex w-full">
              {OPCODES.map(op => (
                <span
                  key={op.n}
                  style={{ width: `${op.p}%`, backgroundColor: op.c }}
                  title={`${op.n} ${op.p}%`}
                ></span>
              ))}
            </div>

            <div id="opcodeBars" className="grid sm:grid-cols-2 gap-3">
              {OPCODES.map(op => (
                <div key={op.n}>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="w-24 text-zinc-400">{op.n}</span>
                    <span className="flex-1 h-2 rounded-full bg-ink-600 overflow-hidden">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${op.p * 2.4}%`, backgroundColor: op.c }}
                      ></span>
                    </span>
                    <span className="w-10 text-right text-zinc-300 font-bold">{op.p}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Gas Optimization Findings */}
          <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-ink-850">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gas Heuristics</p>
              <h3 className="text-sm font-extrabold text-white">AI-Detected Gas Optimization Opportunities</h3>
            </div>

            <div id="gasFindings" className="divide-y divide-zinc-800/80">
              {GAS_FINDINGS.map((f, i) => (
                <div key={i} className="px-4 py-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`chip h-5 px-2 inline-flex items-center rounded border text-[9px] font-extrabold tracking-widest uppercase ${SEV_CHIP[f.sev]}`}>
                      {f.sev}
                    </span>
                    <span className="text-[12.5px] font-bold text-zinc-100">{f.t}</span>
                    <span className="flex-1"></span>
                    <span className="chip h-5 px-2 inline-flex items-center rounded bg-safe/10 border border-safe/40 font-mono text-[9.5px] text-safe font-bold">
                      −{f.save.toLocaleString('en-US')} gas
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <pre
                      className="code rounded-md border border-crit/25 bg-crit/[0.06] px-2.5 py-2 text-[10.5px] text-zinc-400 overflow-x-auto scroll-thin font-mono"
                      dangerouslySetInnerHTML={{ __html: hl(f.before, 'sol') }}
                    ></pre>
                    <pre
                      className="code rounded-md border border-safe/25 bg-safe/[0.06] px-2.5 py-2 text-[10.5px] text-zinc-300 overflow-x-auto scroll-thin font-mono"
                      dangerouslySetInnerHTML={{ __html: hl(f.after, 'sol') }}
                    ></pre>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(f.after);
                        showToast('Snippet optimasi disalin', 'ok');
                      }}
                      className="chip h-7 px-2.5 rounded-md border border-zinc-700 bg-ink-700 text-[10px] font-bold text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
                    >
                      Copy optimized
                    </button>
                    <button
                      onClick={() => handleApplyToPatch(f.t)}
                      className="chip h-7 px-2.5 rounded-md border border-cyber/40 bg-cyber/10 text-[10px] font-bold text-cyber hover:bg-cyber/20 transition-colors cursor-pointer"
                    >
                      Apply to Patch Studio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Savings Calculator */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-5 sticky top-20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ROI Simulation</p>
            <h3 className="text-base font-extrabold text-white">Financial Savings Calculator</h3>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="flex justify-between font-mono text-[11px] text-zinc-400">
                <span>Gas saved per tx</span>
                <span id="g1v" className="text-safe font-bold">{gasSaved.toLocaleString('en-US')}</span>
              </span>
              <input
                id="g1"
                type="range"
                min="5000"
                max="200000"
                step="1000"
                value={gasSaved}
                onChange={e => setGasSaved(Number(e.target.value))}
                className="w-full mt-2 accent-emerald-400"
              />
            </label>

            <label className="block">
              <span className="flex justify-between font-mono text-[11px] text-zinc-400">
                <span>Daily transactions</span>
                <span id="g2v" className="text-cyber font-bold">{dailyTx.toLocaleString('en-US')}</span>
              </span>
              <input
                id="g2"
                type="range"
                min="500"
                max="200000"
                step="500"
                value={dailyTx}
                onChange={e => setDailyTx(Number(e.target.value))}
                className="w-full mt-2 accent-cyan-400"
              />
            </label>

            <label className="block">
              <span className="flex justify-between font-mono text-[11px] text-zinc-400">
                <span>Gas price (Gwei)</span>
                <span id="g3v" className="text-warn font-bold">{gwei.toFixed(1)}</span>
              </span>
              <input
                id="g3"
                type="range"
                min="0.1"
                max="50"
                step="0.1"
                value={gwei}
                onChange={e => setGwei(Number(e.target.value))}
                className="w-full mt-2 accent-amber-400"
              />
            </label>

            <label className="block">
              <span className="flex justify-between font-mono text-[11px] text-zinc-400">
                <span>BOT token price</span>
                <span id="g4v" className="text-white font-bold">${tokenPrice.toFixed(2)}</span>
              </span>
              <input
                id="g4"
                type="range"
                min="0.05"
                max="10"
                step="0.05"
                value={tokenPrice}
                onChange={e => setTokenPrice(Number(e.target.value))}
                className="w-full mt-2 accent-zinc-200"
              />
            </label>
          </div>

          {/* Results Display */}
          <div className="rounded-xl border border-zinc-800 bg-ink-850 p-4 space-y-3 font-mono">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-500">Per 1,000 Transactions</p>
              <p id="s1k" className="text-lg font-extrabold text-safe">{fmt(per1k)} BOT</p>
              <p id="s1ku" className="text-[11px] text-zinc-500">≈ ${(per1k * tokenPrice).toFixed(2)} · {(gasSaved * 1000 / 1000).toFixed(1)}k gas units</p>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500">Daily Savings ({dailyTx.toLocaleString('en-US')} txs)</p>
              <p id="sday" className="text-lg font-extrabold text-white">{fmt(perDay)} BOT</p>
              <p id="sdayu" className="text-[11px] text-zinc-500">≈ ${(perDay * tokenPrice).toFixed(2)}</p>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500">Monthly Savings (30 days)</p>
              <p id="smon" className="text-lg font-extrabold text-cyber">{fmt(perMon)} BOT</p>
              <p id="smonu" className="text-[11px] text-zinc-500">≈ ${(perMon * tokenPrice).toFixed(2)}</p>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500">Annual Projected Savings</p>
              <p id="syear" className="text-2xl font-extrabold text-emerald-400">{fmt(perYear)} BOT</p>
              <p id="syearu" className="text-[11px] text-zinc-500">≈ ${(perYear * tokenPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
