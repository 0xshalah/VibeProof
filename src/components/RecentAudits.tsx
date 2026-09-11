import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Clock } from 'lucide-react';
import { CertifiedOnChainRecord } from '../types';

interface RecentAuditsProps {
  records: CertifiedOnChainRecord[];
  onSelectRecord: (record: CertifiedOnChainRecord) => void;
}

export const RecentAudits: React.FC<RecentAuditsProps> = ({
  records,
  onSelectRecord,
}) => {
  if (records.length === 0) return null;

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Recent On-Chain Audits
          </h3>
          <p className="text-xs text-zinc-400">
            Smart contracts recently verified & certified on BOT Chain
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {records.length} Recorded
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectRecord(item)}
            className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer group hover:bg-zinc-900/60"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-semibold text-sm text-zinc-200 group-hover:text-cyan-300 transition-colors truncate">
                {item.projectName}
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  item.securityScore >= 80
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : item.securityScore >= 50
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {item.securityScore}/100
              </span>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 truncate mb-2">
              Hash: {item.codeHash.slice(0, 14)}...
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
              <span className="truncate">
                By {item.auditorWallet.slice(0, 6)}...{item.auditorWallet.slice(-4)}
              </span>
              <span className="text-cyan-400 font-medium group-hover:underline flex items-center gap-0.5">
                View Badge →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
