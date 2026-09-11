import React, { useState, useMemo } from 'react';
import {
  DashboardAuditRecord,
  DASHBOARD_NETWORKS,
  gradeOf,
  agoLabel,
  shortHash
} from '../../data/dashboardData';
import { ScoreRing } from './ScoreRing';

interface AuditsViewProps {
  network: 'testnet' | 'mainnet';
  audits: DashboardAuditRecord[];
  searchQuery: string;
  onOpenCert: (audit: DashboardAuditRecord) => void;
  onAddToast: (msg: string, type?: 'cyber' | 'safe' | 'warn' | 'crit') => void;
}

export const AuditsView: React.FC<AuditsViewProps> = ({
  network,
  audits,
  searchQuery,
  onOpenCert,
  onAddToast
}) => {
  const net = DASHBOARD_NETWORKS[network];
  const [filter, setFilter] = useState<'all' | 'safe' | 'warn' | 'crit'>('all');
  const [sort, setSort] = useState<'newest' | 'score-desc' | 'score-asc'>('newest');

  const filteredList = useMemo(() => {
    let list = [...audits];

    // Filter by severity grade
    if (filter !== 'all') {
      list = list.filter((a) => gradeOf(a.score).key === filter);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.hash.toLowerCase().includes(q) ||
          a.tx.toLowerCase().includes(q) ||
          a.auditor.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'newest') list.sort((a, b) => a.min - b.min);
    if (sort === 'score-desc') list.sort((a, b) => b.score - a.score);
    if (sort === 'score-asc') list.sort((a, b) => a.score - b.score);

    return list;
  }, [audits, filter, searchQuery, sort]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    onAddToast('Code hash disalin ke clipboard!', 'cyber');
  };

  return (
    <section id="view-audits" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-extrabold text-white tracking-tight">My Audits</h2>
        <span
          id="auditsCountLabel"
          className="chip h-7 px-3 inline-flex items-center rounded-full border border-zinc-800 bg-ink-800 font-mono text-[11px] text-zinc-400"
        >
          {filteredList.length} records · {net.name}
        </span>
        <span className="flex-1" />

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`filter-chip chip h-9 px-3.5 rounded-full border text-[11px] font-bold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'border-cyber/50 bg-cyber/10 text-cyber'
                : 'border-zinc-700 bg-ink-800 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`filter-chip chip h-9 px-3.5 rounded-full border text-[11px] font-bold transition-colors cursor-pointer ${
              filter === 'safe'
                ? 'border-safe/50 bg-safe/10 text-safe'
                : 'border-zinc-700 bg-ink-800 text-zinc-400 hover:border-safe/60'
            }`}
          >
            Safe
          </button>
          <button
            onClick={() => setFilter('warn')}
            className={`filter-chip chip h-9 px-3.5 rounded-full border text-[11px] font-bold transition-colors cursor-pointer ${
              filter === 'warn'
                ? 'border-warn/50 bg-warn/10 text-warn'
                : 'border-zinc-700 bg-ink-800 text-zinc-400 hover:border-warn/60'
            }`}
          >
            Warning
          </button>
          <button
            onClick={() => setFilter('crit')}
            className={`filter-chip chip h-9 px-3.5 rounded-full border text-[11px] font-bold transition-colors cursor-pointer ${
              filter === 'crit'
                ? 'border-crit/50 bg-crit/10 text-crit'
                : 'border-zinc-700 bg-ink-800 text-zinc-400 hover:border-crit/60'
            }`}
          >
            Critical
          </button>

          <select
            id="sortSelect"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as 'newest' | 'score-desc' | 'score-asc')
            }
            className="chip h-9 px-3 rounded-lg bg-ink-800 border border-zinc-800 font-mono text-[11px] text-zinc-300 focus:border-cyber/60 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="score-desc">Score: high → low</option>
            <option value="score-asc">Score: low → high</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="tbl w-full text-left font-mono text-[11.5px]">
            <thead>
              <tr className="bg-ink-850">
                <th className="px-5 py-3">Contract</th>
                <th className="px-3 py-3">Score</th>
                <th className="px-3 py-3">Verdict</th>
                <th className="px-3 py-3 hidden md:table-cell">Issues C/H/M/L</th>
                <th className="px-3 py-3 hidden lg:table-cell">Code Hash</th>
                <th className="px-3 py-3 hidden sm:table-cell">TX</th>
                <th className="px-3 py-3 hidden lg:table-cell">Time</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="auditsTbody">
              {filteredList.map((a) => {
                const g = gradeOf(a.score);
                return (
                  <tr key={a.id}>
                    <td className="px-5 py-3">
                      <p className="text-zinc-200 font-bold">{a.name}</p>
                      <p className="text-[10px] text-zinc-600">
                        {shortHash(a.auditor, 6, 4)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <ScoreRing score={a.score} size={36} />
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`chip h-6 px-2.5 inline-flex items-center rounded-full border text-[9.5px] font-extrabold tracking-widest uppercase ${g.chip}`}
                      >
                        {g.verdict}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-crit font-bold">{a.issues.c}</span>/
                      <span className="text-orange-400 font-bold">{a.issues.h}</span>/
                      <span className="text-warn font-bold">{a.issues.m}</span>/
                      <span className="text-zinc-400">{a.issues.l}</span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell text-zinc-500">
                      {shortHash(a.hash, 6, 3)}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <a
                        className="text-zinc-500 hover:text-cyber"
                        href={`${net.explorer}/tx/${a.tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {shortHash(a.tx, 6, 4)}
                      </a>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell text-zinc-500">
                      {agoLabel(a.min)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => {
                            if (a.certified) {
                              onOpenCert(a);
                            } else {
                              onAddToast(
                                `${a.name} belum di-mint on-chain (status: draft report).`,
                                'warn'
                              );
                            }
                          }}
                          className="chip h-8 px-2.5 rounded-lg border border-zinc-700 bg-ink-700 text-[10.5px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
                        >
                          Certificate
                        </button>
                        <button
                          onClick={() => copyHash(a.hash)}
                          className="chip h-8 px-2.5 rounded-lg border border-zinc-700 bg-ink-700 text-[10.5px] font-bold text-zinc-400 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
                          title="Copy code hash"
                        >
                          ⧉
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div id="auditsEmpty" className="px-6 py-16 text-center">
            <p className="text-4xl">🔍</p>
            <h4 className="mt-3 text-base font-bold text-zinc-200">
              Tidak ada audit yang cocok
            </h4>
            <p className="mt-1.5 text-sm text-zinc-500">
              Coba ubah kata kunci pencarian atau filter severity.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
