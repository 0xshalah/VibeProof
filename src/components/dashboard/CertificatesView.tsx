import React from 'react';
import {
  DashboardAuditRecord,
  DASHBOARD_NETWORKS,
  gradeOf,
  agoLabel,
  shortHash
} from '../../data/dashboardData';
import { ScoreRing } from './ScoreRing';

interface CertificatesViewProps {
  network: 'testnet' | 'mainnet';
  audits: DashboardAuditRecord[];
  onOpenCert: (audit: DashboardAuditRecord) => void;
  onOpenAuditStudio: () => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  network,
  audits,
  onOpenCert,
  onOpenAuditStudio
}) => {
  const net = DASHBOARD_NETWORKS[network];
  const certifiedList = audits.filter((a) => a.certified);

  return (
    <section id="view-certificates" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          On-Chain Certificates
        </h2>
        <span className="chip h-7 px-3 inline-flex items-center rounded-full border border-safe/40 bg-safe/10 text-safe text-[11px] font-bold">
          minted via certifyAudit()
        </span>
        <span className="flex-1" />
        <span
          id="certCountLabel"
          className="chip h-7 px-3 inline-flex items-center rounded-full border border-zinc-800 bg-ink-800 font-mono text-[11px] text-zinc-400"
        >
          {certifiedList.length} certificates · {net.name}
        </span>
      </div>

      <div id="certGrid" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {certifiedList.map((a) => {
          const g = gradeOf(a.score);
          return (
            <article
              key={a.id}
              className="rise-in rounded-2xl border border-zinc-800 bg-ink-800 p-4 hover:border-zinc-600 transition-colors flex flex-col"
            >
              <div className="flex items-center gap-3">
                <ScoreRing score={a.score} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] font-bold text-white truncate">
                    {a.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                    {shortHash(a.hash, 8, 4)}
                  </p>
                </div>
                <span
                  className={`chip h-6 px-2 inline-flex items-center rounded-full border text-[9px] font-extrabold tracking-widest uppercase ${g.chip}`}
                >
                  {g.key === 'safe' ? 'SAFE' : g.key === 'warn' ? 'WARN' : 'CRIT'}
                </span>
              </div>

              <dl className="mt-3.5 rounded-lg border border-zinc-800 bg-ink-850 divide-y divide-zinc-800/70 font-mono text-[10.5px]">
                <div className="flex gap-2 px-3 py-1.5">
                  <dt className="w-14 text-zinc-600">TX</dt>
                  <dd className="flex-1 truncate text-zinc-400">
                    {shortHash(a.tx, 10, 6)}
                  </dd>
                </div>
                <div className="flex gap-2 px-3 py-1.5">
                  <dt className="w-14 text-zinc-600">Block</dt>
                  <dd className="text-zinc-400">#{a.block.toLocaleString('en-US')}</dd>
                </div>
                <div className="flex gap-2 px-3 py-1.5">
                  <dt className="w-14 text-zinc-600">Minted</dt>
                  <dd className="text-zinc-400">{agoLabel(a.min)}</dd>
                </div>
              </dl>

              <div className="mt-3.5 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenCert(a)}
                  className="chip h-9 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-[11px] font-bold hover:bg-cyber/20 transition-colors cursor-pointer"
                >
                  View Certificate
                </button>
                <a
                  href={`${net.explorer}/tx/${a.tx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip h-9 rounded-lg border border-zinc-700 bg-ink-700 text-zinc-300 text-[11px] font-bold hover:border-cyber/60 hover:text-cyber transition-colors inline-flex items-center justify-center"
                >
                  BOTScan ↗
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {certifiedList.length === 0 && (
        <div
          id="certEmpty"
          className="rounded-2xl border border-dashed border-zinc-700 px-6 py-16 text-center"
        >
          <p className="text-4xl">🏅</p>
          <h4 className="mt-3 text-base font-bold text-zinc-200">
            Belum ada sertifikat di jaringan ini
          </h4>
          <p className="mt-1.5 text-sm text-zinc-500">
            Jalankan scan di Audit Studio lalu mint proof on-chain.
          </p>
          <button
            onClick={onOpenAuditStudio}
            className="chip mt-5 h-11 px-5 inline-flex items-center rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors cursor-pointer"
          >
            Buka Audit Studio →
          </button>
        </div>
      )}
    </section>
  );
};
