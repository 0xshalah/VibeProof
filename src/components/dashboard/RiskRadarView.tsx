import React, { useState, useEffect, useMemo } from 'react';
import { gradeOf, shortHash, randHex } from '../../data/suiteData';

interface RiskRadarViewProps {
  network?: string;
  onNavigate?: (viewId: string) => void;
  onOpenAuditStudio?: () => void;
  showToast?: (msg: string, type?: 'ok' | 'err' | 'warn' | 'info') => void;
}

interface LeaderboardItem {
  n: string;
  cat: string;
  score: number;
  aud: 'certified' | 'warning' | 'critical' | 'unaudited';
  tvl: string;
  d: number;
}

const INITIAL_LB: LeaderboardItem[] = [
  { n: 'AstroSwap DEX', cat: 'DeFi', score: 96, aud: 'certified', tvl: '48.2M BOT', d: +2.1 },
  { n: 'BotLend Markets', cat: 'DeFi', score: 92, aud: 'certified', tvl: '31.7M BOT', d: +1.4 },
  { n: 'Nebula Bridge', cat: 'Bridge', score: 88, aud: 'certified', tvl: '22.4M BOT', d: +0.6 },
  { n: 'PixelPets NFT', cat: 'NFT', score: 94, aud: 'certified', tvl: '4.1M BOT', d: +3.2 },
  { n: 'YieldRouter V2', cat: 'DeFi', score: 54, aud: 'warning', tvl: '9.8M BOT', d: -4.8 },
  { n: 'BotArena Gaming', cat: 'Gaming', score: 83, aud: 'certified', tvl: '6.3M BOT', d: +0.9 },
  { n: 'MetaPay Wallet', cat: 'Infra', score: 89, aud: 'certified', tvl: '12.9M BOT', d: +1.1 },
  { n: 'FlashLoanPool', cat: 'DeFi', score: 35, aud: 'critical', tvl: '7.6M BOT', d: -9.4 },
  { n: 'Genesis Pass NFT', cat: 'NFT', score: 38, aud: 'unaudited', tvl: '1.2M BOT', d: -6.1 },
  { n: 'GovBridge DAO', cat: 'Bridge', score: 91, aud: 'certified', tvl: '18.5M BOT', d: +2.7 },
  { n: 'StableSwap AMM', cat: 'DeFi', score: 69, aud: 'warning', tvl: '15.3M BOT', d: -1.2 },
  { n: 'OracleAggregator', cat: 'Infra', score: 90, aud: 'certified', tvl: '—', d: +0.4 },
  { n: 'PresaleVault', cat: 'DeFi', score: 22, aud: 'critical', tvl: '3.4M BOT', d: -12.6 },
  { n: 'AirdropClaimer', cat: 'Gaming', score: 87, aud: 'certified', tvl: '0.9M BOT', d: +1.8 }
];

const AUDIT_CHIP: Record<string, string> = {
  certified: 'border-safe/50 bg-safe/10 text-safe',
  warning: 'border-warn/50 bg-warn/10 text-warn',
  critical: 'border-crit/50 bg-crit/10 text-crit',
  unaudited: 'border-zinc-600 bg-zinc-700/40 text-zinc-400'
};

const AUDIT_LABEL: Record<string, string> = {
  certified: 'CERTIFIED SAFE',
  warning: 'WARNINGS',
  critical: 'CRITICAL',
  unaudited: 'UNAUDITED'
};

const WATCH_NAMES = [
  'AirdropDistributor', 'LiquidStakingPool', 'NftMarketplace', 'PerpVault',
  'BridgeMessenger', 'RewardEscrow', 'GovernorBravo', 'MemeLauncher',
  'StablePool', 'ZkVerifier', 'LootboxRandom', 'FeeCollector'
];

interface WatchItem {
  id: string;
  name: string;
  addr: string;
  statusKey: 'safe' | 'pending' | 'crit' | 'unverified';
  statusLabel: string;
  chipClass: string;
  score: number | null;
  timestamp: string;
}

export const RiskRadarView: React.FC<RiskRadarViewProps> = ({
  network = 'testnet',
  onNavigate,
  onOpenAuditStudio,
  showToast = (_msg?: string, _type?: 'ok' | 'err' | 'warn' | 'info') => {}
}) => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [isWatchActive, setIsWatchActive] = useState(true);
  const [watchFeed, setWatchFeed] = useState<WatchItem[]>([]);

  // Calculate safety gauge
  const safeCount = useMemo(() => INITIAL_LB.filter(p => p.score >= 80).length, []);
  const totalCount = INITIAL_LB.length;
  const safetyPct = Math.round((safeCount / totalCount) * 100);

  // Gauge dimensions
  const R = 92;
  const C = Math.PI * R; // semicircle circumference ~ 289
  const dashoffset = (C * safetyPct) / 100;

  // Breakdown counts
  const warnCount = useMemo(() => INITIAL_LB.filter(p => p.score >= 50 && p.score < 80).length, []);
  const critCount = useMemo(() => INITIAL_LB.filter(p => p.score < 50).length, []);

  // Category averages
  const categories = ['DeFi', 'NFT', 'Bridge', 'Gaming', 'Infra'];
  const catAverages = useMemo(() => {
    return categories.map(c => {
      const arr = INITIAL_LB.filter(p => p.cat === c);
      const avg = Math.round(arr.reduce((s, p) => s + p.score, 0) / arr.length);
      return { cat: c, avg, grade: gradeOf(avg) };
    });
  }, []);

  // Filtered leaderboard
  const filteredLB = useMemo(() => {
    return INITIAL_LB
      .filter(x => selectedCat === 'All' || x.cat === selectedCat)
      .sort((a, b) => b.score - a.score);
  }, [selectedCat]);

  // Push new item to watch feed
  const pushWatchItem = () => {
    const rawName = WATCH_NAMES[Math.floor(Math.random() * WATCH_NAMES.length)];
    const name = `${rawName}.sol`;
    const rand = Math.random();
    let statusKey: 'safe' | 'pending' | 'crit' | 'unverified' = 'unverified';
    let statusLabel = 'Unverified Bytecode';
    let chipClass = 'border-zinc-600 bg-zinc-700/40 text-zinc-400';
    let score: number | null = 40 + Math.floor(Math.random() * 30);

    if (rand < 0.35) {
      statusKey = 'safe';
      statusLabel = 'Certified Safe';
      chipClass = 'border-safe/50 bg-safe/10 text-safe';
      score = 80 + Math.floor(Math.random() * 19);
    } else if (rand < 0.6) {
      statusKey = 'crit';
      statusLabel = 'Critical Risk Detected';
      chipClass = 'border-crit/50 bg-crit/10 text-crit';
      score = 8 + Math.floor(Math.random() * 35);
    } else if (rand < 0.8) {
      statusKey = 'pending';
      statusLabel = 'Pending VibeProof Audit';
      chipClass = 'border-warn/50 bg-warn/10 text-warn';
      score = null;
    }

    const addr = '0x' + randHex(40);
    const item: WatchItem = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      addr,
      statusKey,
      statusLabel,
      chipClass,
      score,
      timestamp: `just now · ${network === 'mainnet' ? '677' : '968'}`
    };

    setWatchFeed(prev => [item, ...prev.slice(0, 23)]);
  };

  // Initial seed
  useEffect(() => {
    const initialItems: WatchItem[] = [];
    for (let i = 0; i < 6; i++) {
      const rawName = WATCH_NAMES[i % WATCH_NAMES.length];
      const name = `${rawName}.sol`;
      const isSafe = i % 2 === 0;
      initialItems.push({
        id: Math.random().toString(36).substring(2, 9),
        name,
        addr: '0x' + randHex(40),
        statusKey: isSafe ? 'safe' : 'crit',
        statusLabel: isSafe ? 'Certified Safe' : 'Critical Risk Detected',
        chipClass: isSafe ? 'border-safe/50 bg-safe/10 text-safe' : 'border-crit/50 bg-crit/10 text-crit',
        score: isSafe ? 88 + i * 2 : 24 + i * 3,
        timestamp: `just now · ${network === 'mainnet' ? '677' : '968'}`
      });
    }
    setWatchFeed(initialItems);
  }, [network]);

  // Live interval
  useEffect(() => {
    if (!isWatchActive) return;
    const interval = setInterval(() => {
      pushWatchItem();
    }, 2800);
    return () => clearInterval(interval);
  }, [isWatchActive, network]);

  const handleActionClick = (item: WatchItem, isScan: boolean) => {
    if (isScan) {
      if (item.statusKey === 'safe') {
        showToast('Sudah tersertifikasi — membuka proof portal.', 'info');
        if (onNavigate) onNavigate('proof');
      } else {
        showToast(`Scan dijadwalkan untuk ${item.name}`, 'info');
      }
    } else {
      showToast(`Membuka bytecode viewer untuk ${shortHash(item.addr, 8, 6)}`, 'info');
    }
  };

  return (
    <section id="view-radar" className="space-y-5">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyber/25">
        <div className="absolute inset-0 suite-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40"></div>
        <div className="relative p-6 flex flex-wrap items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-xl border border-cyber/40 bg-cyber/10 text-cyber">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="chip text-[10px] font-extrabold tracking-[0.25em] uppercase text-cyber">Priority #3 · Hackathon Metric</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">Ecosystem Risk Radar & Real-Time Threat Intel</h1>
            <p className="mt-1 text-[13px] text-zinc-400">
              Pantau postur keamanan seluruh dApp di BOT Chain — leaderboard TVL, score keamanan komparatif, dan feed deteksi bytecode live.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="chip h-9 px-3 inline-flex items-center rounded-lg border border-zinc-700 bg-ink-800/80 font-mono text-[11px] text-zinc-400">
              14 dApps tracked
            </span>
            <span className="chip h-9 px-3 inline-flex items-center rounded-lg border border-safe/40 bg-safe/10 font-mono text-[11px] text-safe">
              ecosystem health: {safetyPct}% safe
            </span>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[340px_minmax(0,1fr)_340px] gap-5 items-start">
        {/* Left Column: BOT Chain Safety Index */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">BOT Chain Safety Index</p>
            <h3 className="mt-1 text-base font-extrabold text-white">Ecosystem Security Posture</h3>
          </div>

          <div className="relative grid place-items-center py-2">
            <svg viewBox="0 0 220 130" className="w-48 h-auto overflow-visible">
              <path
                d="M18 118 A92 92 0 0 1 202 118"
                fill="none"
                stroke="#1f232e"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                id="gaugeArc"
                d="M18 118 A92 92 0 0 1 202 118"
                fill="none"
                stroke="#10b981"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${dashoffset} ${C}`}
                style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(.22,1,.36,1)' }}
              />
              <text x="110" y="112" textAnchor="middle" fontSize="10" fill="#71717a" fontFamily="monospace">
                SAFE / AT-RISK
              </text>
            </svg>
            <div className="absolute bottom-6 text-center">
              <span id="safetyPct" className="text-3xl font-extrabold font-mono text-safe">
                {safetyPct}%
              </span>
              <span className="block text-[10.5px] text-zinc-500">certified safe contracts</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-ink-850 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5">Distribution Breakdown</p>
            <ul id="safetyBreak" className="space-y-2 font-mono text-[11px]">
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0 bg-safe"></span>
                <span className="text-zinc-400 flex-1">Certified safe (≥80)</span>
                <span className="text-white font-bold">{safeCount}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0 bg-warn"></span>
                <span className="text-zinc-400 flex-1">Warning (50–79)</span>
                <span className="text-white font-bold">{warnCount}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0 bg-crit"></span>
                <span className="text-zinc-400 flex-1">Critical (&lt;50)</span>
                <span className="text-white font-bold">{critCount}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0 bg-zinc-600"></span>
                <span className="text-zinc-400 flex-1">Unaudited bytecode</span>
                <span className="text-white font-bold">142</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5">Category Average Score</p>
            <div id="catBars" className="space-y-2">
              {catAverages.map(ca => (
                <div key={ca.cat}>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="w-14 text-zinc-400">{ca.cat}</span>
                    <span className="flex-1 h-2 rounded-full bg-ink-600 overflow-hidden">
                      <span
                        className="block h-full rounded-full transition-all duration-700"
                        style={{ width: `${ca.avg}%`, backgroundColor: ca.grade.color }}
                      ></span>
                    </span>
                    <span className="w-8 text-right font-bold" style={{ color: ca.grade.color }}>
                      {ca.avg}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: DApp Security Leaderboard */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden space-y-0">
          <div className="p-4 border-b border-zinc-800 bg-ink-850 flex flex-wrap items-center gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">BOT Chain Directory</p>
              <h3 className="text-base font-extrabold text-white">DApp Security Leaderboard</h3>
            </div>
            <span className="flex-1"></span>
            <div id="lbCats" className="flex flex-wrap gap-1.5">
              {['All', 'DeFi', 'NFT', 'Bridge', 'Gaming', 'Infra'].map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className={`lbcat chip h-7 px-2.5 rounded-full border text-[10.5px] font-bold transition-colors cursor-pointer ${
                    c === selectedCat
                      ? 'border-cyber/50 bg-cyber/10 text-cyber'
                      : 'border-zinc-700 bg-ink-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-left font-mono text-[11.5px] whitespace-nowrap">
              <thead className="border-b border-zinc-800 bg-ink-850/60 text-[10px] uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-3 py-2.5">Project</th>
                  <th className="px-3 py-2.5 hidden sm:table-cell">Category</th>
                  <th className="px-3 py-2.5">Score</th>
                  <th className="px-3 py-2.5 hidden md:table-cell">Status</th>
                  <th className="px-3 py-2.5 hidden lg:table-cell">TVL</th>
                  <th className="px-4 py-2.5 text-right">Trend</th>
                </tr>
              </thead>
              <tbody id="lbBody" className="divide-y divide-zinc-800/60">
                {filteredLB.map((p, i) => {
                  const g = gradeOf(p.score);
                  return (
                    <tr key={p.n} className="hover:bg-ink-700/40 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-500">{String(i + 1).padStart(2, '0')}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-zinc-100 font-bold">{p.n}</span>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <span className="chip h-5 px-2 inline-flex items-center rounded bg-ink-700 border border-zinc-800 text-zinc-400 text-[9.5px]">
                          {p.cat}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: g.color }}>{p.score}</span>
                          <span className="flex-1 h-1.5 rounded-full bg-ink-600 overflow-hidden min-w-[40px]">
                            <span className="block h-full rounded-full" style={{ width: `${p.score}%`, background: g.color }}></span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <span className={`chip h-5 px-2 inline-flex items-center rounded border text-[9px] font-extrabold tracking-widest uppercase ${AUDIT_CHIP[p.aud]}`}>
                          {AUDIT_LABEL[p.aud]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 hidden lg:table-cell text-zinc-400">{p.tvl}</td>
                      <td className={`px-4 py-2.5 text-right ${p.d >= 0 ? 'text-safe' : 'text-crit'}`}>
                        {p.d >= 0 ? '▲' : '▼'} {Math.abs(p.d).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Bytecode Mempool Watcher */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-ink-850 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber dot-live"></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Mempool Watcher</p>
              <h3 className="text-sm font-extrabold text-white">Incoming Deployments</h3>
            </div>
            <span className="flex-1"></span>
            <button
              id="watchToggle"
              onClick={() => setIsWatchActive(prev => !prev)}
              className={`chip h-8 px-3 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                isWatchActive
                  ? 'border-zinc-700 bg-ink-700 text-zinc-200 hover:border-cyber/60'
                  : 'border-safe/50 bg-safe/10 text-safe'
              }`}
            >
              {isWatchActive ? 'Pause' : 'Resume'}
            </button>
          </div>

          <div id="watchFeed" className="divide-y divide-zinc-800/80 max-h-[600px] overflow-y-auto scroll-thin">
            {watchFeed.map(item => {
              const g = item.score !== null ? gradeOf(item.score) : null;
              return (
                <div key={item.id} className="rise-in px-4 py-3 hover:bg-ink-700/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        item.statusKey === 'safe'
                          ? 'bg-safe'
                          : item.statusKey === 'crit'
                          ? 'bg-crit'
                          : item.statusKey === 'pending'
                          ? 'bg-warn'
                          : 'bg-zinc-500'
                      }`}
                    ></span>
                    <span className="font-mono text-[12px] font-bold text-zinc-100 truncate">{item.name}</span>
                    {item.score !== null && g ? (
                      <span className="chip ml-auto h-5 px-2 inline-flex items-center rounded font-mono text-[10px] font-extrabold" style={{ color: g.color }}>
                        {item.score}
                      </span>
                    ) : (
                      <span className="ml-auto"></span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-zinc-600">
                    <span className="truncate">{shortHash(item.addr, 8, 6)}</span>
                    <span className={`chip h-5 px-2 inline-flex items-center rounded border ${item.chipClass} text-[9px] font-extrabold tracking-widest uppercase`}>
                      {item.statusLabel}
                    </span>
                    <span className="ml-auto">{item.timestamp}</span>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {item.statusKey !== 'safe' && (
                      <button
                        onClick={() => handleActionClick(item, true)}
                        className="chip h-7 px-2.5 rounded-md border border-cyber/40 bg-cyber/10 text-cyber text-[10px] font-bold hover:bg-cyber/20 transition-colors cursor-pointer"
                      >
                        Scan now
                      </button>
                    )}
                    <button
                      onClick={() => handleActionClick(item, false)}
                      className="chip h-7 px-2.5 rounded-md border border-zinc-700 bg-ink-700 text-zinc-400 text-[10px] font-bold hover:text-white transition-colors cursor-pointer"
                    >
                      View bytecode
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
