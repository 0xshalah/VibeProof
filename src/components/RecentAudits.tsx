import React from 'react';
import { AuditFeedItem } from '../types';
import { gradeOf } from '../services/auditEngine';
import { BOTCHAIN_NETWORKS } from '../config/botchain';

interface RecentAuditsProps {
  audits: AuditFeedItem[];
  onSelectAudit?: (item: AuditFeedItem) => void;
}

export const RecentAudits: React.FC<RecentAuditsProps> = ({ audits, onSelectAudit }) => {
  return (
    <section id="proofs" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-2 h-2 rounded-full bg-safe dot-live"></span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Recent Certified Audits</h2>
        <span className="chip h-7 px-3 inline-flex items-center rounded-full border border-zinc-800 bg-ink-800 font-mono text-[11px] text-zinc-400">
          live feed · BOT Chain
        </span>
      </div>

      <div id="feedGrid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {audits.map((f, idx) => {
          const g = gradeOf(f.score);
          const net = BOTCHAIN_NETWORKS[f.net] || BOTCHAIN_NETWORKS.testnet;

          return (
            <article
              key={`${f.tx}-${idx}`}
              onClick={() => onSelectAudit?.(f)}
              className="rise-in rounded-xl border border-zinc-800 bg-ink-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-9 h-9 grid place-items-center rounded-lg border ${
                    g.key === 'safe'
                      ? 'border-safe/40 bg-safe/10 text-safe'
                      : g.key === 'warn'
                      ? 'border-warn/40 bg-warn/10 text-warn'
                      : 'border-crit/40 bg-crit/10 text-crit'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2.5 4.5 5.6v5.2c0 4.7 3.2 8.6 7.5 10.7 4.3-2.1 7.5-6 7.5-10.7V5.6L12 2.5Z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] font-bold text-white truncate">{f.name}</p>
                  <p className="font-mono text-[10.5px] text-zinc-500">by {f.who}</p>
                </div>
                <span
                  className={`chip h-7 px-2.5 inline-flex items-center rounded-full border font-mono text-xs font-extrabold ${g.chip}`}
                >
                  {f.score}
                </span>
              </div>
              <div className="mt-3.5 flex items-center gap-2 font-mono text-[10.5px] text-zinc-500">
                <a
                  href={`${net.explorerUrl}/tx/${f.tx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-cyber transition-colors"
                >
                  {f.tx}
                </a>
                <span className="flex-1"></span>
                <span className="chip h-5 px-2 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 text-zinc-400">
                  {f.net === 'mainnet' ? 'Mainnet 677' : 'Testnet 968'}
                </span>
                <span>{f.ago}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
