import React, { useState } from 'react';
import {
  DashboardAuditRecord,
  DASHBOARD_TREND,
  DASHBOARD_NETWORKS,
  VIBEPROOF_ADDR,
  gradeOf,
  agoLabel,
  shortHash
} from '../../data/dashboardData';
import { ScoreRing } from './ScoreRing';

interface OverviewViewProps {
  network: 'testnet' | 'mainnet';
  audits: DashboardAuditRecord[];
  onOpenAuditStudio: () => void;
  onGoToVerify: () => void;
  onGoToAudits: () => void;
  onOpenCert: (audit: DashboardAuditRecord) => void;
  onAddToast: (msg: string, type?: 'cyber' | 'safe' | 'warn' | 'crit') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  network,
  audits,
  onOpenAuditStudio,
  onGoToVerify,
  onGoToAudits,
  onOpenCert,
  onAddToast
}) => {
  const net = DASHBOARD_NETWORKS[network];

  // Tooltip state for Trend Chart
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    d: string;
    score: number;
    count: number;
  } | null>(null);

  // Copy contract address helper
  const handleCopyAddr = () => {
    navigator.clipboard.writeText(VIBEPROOF_ADDR);
    onAddToast('Contract address disalin ke clipboard!', 'cyber');
  };

  // KPIs
  const certified = audits.filter((a) => a.certified);
  const totalIssues = audits.reduce(
    (s, a) => s + a.issues.c + a.issues.h + a.issues.m + a.issues.l,
    0
  );
  const critBlocked = audits.reduce((s, a) => s + a.issues.c, 0);
  const avg = audits.length
    ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length)
    : 0;
  const gas = (certified.length * 0.00021).toFixed(5);

  const kpis = [
    {
      label: 'Total Audits (getTotalAudits)',
      value: audits.length,
      delta: '+3 minggu ini',
      icon: 'M8 6h13M8 12h13M8 18h13',
      tone: 'text-cyber'
    },
    {
      label: 'Avg Security Score',
      value: avg + '/100',
      delta: '+6 vs periode lalu',
      icon: 'M12 3v18M5 10l7-7 7 7',
      tone: 'text-safe'
    },
    {
      label: 'Critical Issues Blocked',
      value: critBlocked,
      delta: totalIssues + ' total findings',
      icon: 'M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z',
      tone: 'text-crit'
    },
    {
      label: 'Certificates Minted',
      value: certified.length,
      delta: 'via certifyAudit()',
      icon: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-3 6-1.6 6 4.6-2.4 4.6 2.4-1.6-6',
      tone: 'text-warn'
    },
    {
      label: 'Gas Used (Certify)',
      value: gas,
      delta: 'BOT · ±21,480 gas/mint',
      icon: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
      tone: 'text-cyber'
    }
  ];

  // Trend Chart Math
  const trendData = DASHBOARD_TREND[network];
  const W = 640;
  const H = 220;
  const P = { t: 16, r: 14, b: 28, l: 34 };
  const minVal = 30;
  const maxVal = 100;
  const getX = (i: number) => P.l + (i * (W - P.l - P.r)) / (trendData.length - 1);
  const getY = (v: number) => P.t + (1 - (v - minVal) / (maxVal - minVal)) * (H - P.t - P.b);

  const trendLinePath = trendData
    .map((p, i) => (i ? 'L' : 'M') + getX(i).toFixed(1) + ' ' + getY(p.score).toFixed(1))
    .join(' ');
  const trendAreaPath = `${trendLinePath} L${getX(trendData.length - 1)} ${H - P.b} L${P.l} ${
    H - P.b
  } Z`;

  // Severity Distribution Donut Math
  const aggIssues = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  audits.forEach((a) => {
    aggIssues.Critical += a.issues.c;
    aggIssues.High += a.issues.h;
    aggIssues.Medium += a.issues.m;
    aggIssues.Low += a.issues.l;
  });
  const issueColors: Record<string, string> = {
    Critical: '#f43f5e',
    High: '#fb923c',
    Medium: '#f59e0b',
    Low: '#52525b'
  };
  const totalFindings =
    Object.values(aggIssues).reduce((a, b) => a + b, 0) || 1;
  const donutC = 2 * Math.PI * 54;
  let accumulatedDonut = 0;
  const donutSegments = Object.entries(aggIssues).map(([k, val]) => {
    const len = donutC * (val / totalFindings);
    const strokeDashoffset = -accumulatedDonut;
    accumulatedDonut += len;
    return {
      name: k,
      val,
      color: issueColors[k],
      dashArray: `${len} ${donutC - len}`,
      offset: strokeDashoffset
    };
  });

  // Top Risky Contracts
  const riskyContracts = audits
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Recent Audits & Activity
  const recentAudits = audits
    .slice()
    .sort((a, b) => a.min - b.min)
    .slice(0, 6);
  const activityEvents = audits
    .filter((a) => a.certified)
    .slice()
    .sort((a, b) => a.min - b.min)
    .slice(0, 6);

  return (
    <section id="view-overview" className="space-y-5">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800">
        <div className="absolute inset-0 dash-bg opacity-40" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-ink-900/30"
          aria-hidden="true"
        />
        <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="chip inline-flex items-center gap-2 h-7 px-3 rounded-full border border-cyber/40 bg-cyber/10 text-cyber text-[10px] font-extrabold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber dot-live" /> Track: AI +
              Verifiable Security Certification
            </p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Audit Command Center
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl leading-relaxed">
              Pantau seluruh portfolio audit vibe-coded Anda, security score, dan sertifikat
              on-chain yang tercatat permanen di{' '}
              <span className="text-zinc-200 font-semibold">VibeProof.sol</span> — BOT Chain
              Testnet & Mainnet.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                id="bannerCopyAddr"
                onClick={handleCopyAddr}
                className="chip h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-ink-800/80 font-mono text-[11px] text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
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
                <span id="bannerAddr">0x97E0…F578</span>
              </button>
              <span className="chip h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-ink-800/80 font-mono text-[11px] text-zinc-400">
                Girl Meets Tech × On Chain Consultancy · Vol.2
              </span>
            </div>
          </div>

          <div className="flex lg:flex-col gap-3 shrink-0">
            <button
              id="bannerCertifyBtn"
              onClick={onOpenAuditStudio}
              className="btn-cyber chip h-12 px-6 rounded-xl bg-cyber text-ink-900 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
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
              </svg>
              Certify New Contract
            </button>
            <button
              id="bannerVerifyBtn"
              onClick={onGoToVerify}
              className="chip h-12 px-6 rounded-xl border border-zinc-700 bg-ink-800/80 text-sm font-semibold text-zinc-200 hover:border-cyber/50 hover:text-cyber transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              Verify a Proof
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div id="kpiGrid" className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map((k, idx) => (
          <div
            key={idx}
            className="rise-in rounded-2xl border border-zinc-800 bg-ink-800 p-4 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`grid place-items-center w-8 h-8 rounded-lg border border-zinc-800 bg-ink-700 ${k.tone}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={k.icon} />
                </svg>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-tight">
                {k.label}
              </p>
            </div>
            <p className="mt-3 font-mono text-2xl font-extrabold text-white">{k.value}</p>
            <p className="mt-1 font-mono text-[10px] text-zinc-500">{k.delta}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Trend chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-ink-800 p-5">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h3 className="text-sm font-bold text-white">Security Score Trend</h3>
            <span className="chip h-6 px-2.5 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400">
              14 hari terakhir
            </span>
            <span className="flex-1" />
            <span className="chip inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-cyber" /> avg score
            </span>
            <span className="chip inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-safe/70" /> audits
            </span>
          </div>

          <div id="trendWrap" className="relative">
            <svg id="trendChart" viewBox="0 0 640 220" className="w-full h-auto">
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines and y labels */}
              {[40, 60, 80, 100].map((v) => (
                <React.Fragment key={v}>
                  <line
                    x1={P.l}
                    y1={getY(v)}
                    x2={W - P.r}
                    y2={getY(v)}
                    stroke="#1f232e"
                    strokeWidth="1"
                  />
                  <text
                    x={P.l - 8}
                    y={getY(v) + 3.5}
                    textAnchor="end"
                    fontSize="9"
                    fill="#52525b"
                    fontFamily="monospace"
                  >
                    {v}
                  </text>
                </React.Fragment>
              ))}

              {/* Date labels */}
              {trendData.map((p, i) =>
                i % 2 === 0 ? (
                  <text
                    key={i}
                    x={getX(i)}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#52525b"
                    fontFamily="monospace"
                  >
                    {p.d}
                  </text>
                ) : null
              )}

              {/* Volume bars */}
              {trendData.map((p, i) => (
                <rect
                  key={i}
                  x={getX(i) - 4}
                  y={H - P.b - p.count * 6}
                  width="8"
                  height={p.count * 6}
                  rx="2"
                  fill="rgba(16,185,129,0.28)"
                />
              ))}

              {/* Area fill */}
              <path d={trendAreaPath} fill="url(#tg)" />

              {/* Trend line */}
              <path
                id="trendLine"
                d={trendLinePath}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots */}
              {trendData.map((p, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(p.score)}
                  r="3"
                  fill="#090a0f"
                  stroke="#00F0FF"
                  strokeWidth="2"
                />
              ))}

              {/* Hover zones */}
              {trendData.map((p, i) => (
                <rect
                  key={i}
                  x={getX(i) - 12}
                  y={P.t}
                  width="24"
                  height={H - P.t - P.b}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      x: getX(i),
                      d: p.d,
                      score: p.score,
                      count: p.count
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                id="chartTip"
                className="absolute top-2 rounded-lg border border-zinc-700 bg-ink-900/95 px-3 py-2 font-mono text-[10.5px] text-zinc-200 shadow-lg pointer-events-none transition-all"
                style={{
                  left: `${Math.min(500, Math.max(10, hoveredPoint.x - 60))}px`,
                  opacity: 1
                }}
              >
                <span className="text-cyber font-bold">{hoveredPoint.d}</span> · avg{' '}
                <span className="text-white font-bold">{hoveredPoint.score}</span> ·{' '}
                {hoveredPoint.count} audits
              </div>
            )}
          </div>
        </div>

        {/* Severity Donut Distribution */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5">
          <h3 className="text-sm font-bold text-white mb-4">Severity Distribution</h3>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <svg id="donutChart" viewBox="0 0 140 140" className="w-36 h-36">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#141720" strokeWidth="14" />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.name}
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.offset}
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div id="donutTotal" className="font-mono text-2xl font-extrabold text-white">
                    {totalFindings}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                    findings
                  </div>
                </div>
              </div>
            </div>

            <ul id="donutLegend" className="flex-1 space-y-2.5 font-mono text-[11px]">
              {donutSegments.map((seg) => (
                <li key={seg.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: seg.color }}
                  />
                  <span className="text-zinc-400 flex-1">{seg.name}</span>
                  <span className="text-white font-bold">{seg.val}</span>
                  <span className="text-zinc-600 w-10 text-right">
                    {Math.round((seg.val / totalFindings) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 rounded-lg border border-zinc-800 bg-ink-850 px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Top Risky Contracts
            </p>
            <ul id="topRisky" className="space-y-2.5">
              {riskyContracts.map((a) => {
                const g = gradeOf(a.score);
                return (
                  <li key={a.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-zinc-300 flex-1 truncate">
                        {a.name}
                      </span>
                      <span
                        className="font-mono text-[11px] font-bold"
                        style={{ color: g.color }}
                      >
                        {a.score}
                      </span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-ink-600 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${a.score}%`, background: g.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Audits + Activity Timeline */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent table */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
            <h3 className="text-sm font-bold text-white">Recent Audits</h3>
            <span className="flex-1" />
            <button
              id="overviewViewAllBtn"
              onClick={onGoToAudits}
              className="chip h-8 px-3 rounded-lg border border-zinc-700 text-[11px] font-bold text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
            >
              View all →
            </button>
          </div>
          <div className="overflow-x-auto scroll-thin">
            <table className="tbl w-full text-left font-mono text-[11.5px]">
              <thead>
                <tr className="bg-ink-850">
                  <th className="px-5 py-2.5">Contract</th>
                  <th className="px-3 py-2.5">Score</th>
                  <th className="px-3 py-2.5">Verdict</th>
                  <th className="px-3 py-2.5 hidden sm:table-cell">TX</th>
                  <th className="px-5 py-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody id="recentTbody">
                {recentAudits.map((a) => {
                  const g = gradeOf(a.score);
                  return (
                    <tr
                      key={a.id}
                      onClick={() => {
                        if (a.certified) {
                          onOpenCert(a);
                        } else {
                          onAddToast('Kontrak ini belum disertifikasi on-chain.', 'warn');
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <td className="px-5 py-3 text-zinc-200 font-bold">{a.name}</td>
                      <td className="px-3 py-3">
                        <ScoreRing score={a.score} size={34} />
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`chip h-6 px-2.5 inline-flex items-center rounded-full border text-[9.5px] font-extrabold tracking-widest uppercase ${g.chip}`}
                        >
                          {g.verdict}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <a
                          className="text-zinc-500 hover:text-cyber"
                          href={`${net.explorer}/tx/${a.tx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {shortHash(a.tx, 6, 4)}
                        </a>
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-500">
                        {agoLabel(a.min)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AuditIssued Events Timeline */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-safe dot-live" />
            <h3 className="text-sm font-bold text-white">AuditIssued Events</h3>
          </div>
          <ol id="activityList" className="relative border-l border-zinc-800 ml-2 space-y-5">
            {activityEvents.map((a) => {
              const g = gradeOf(a.score);
              return (
                <li key={a.id} className="ml-5 relative">
                  <span
                    className="absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 border-ink-800"
                    style={{ background: g.color }}
                  />
                  <p className="font-mono text-[11px] text-zinc-300">
                    <span className="text-cyber">AuditIssued</span> · {a.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                    score {a.score} · {shortHash(a.tx, 8, 4)} · {agoLabel(a.min)}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};
