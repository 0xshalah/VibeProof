import React, { useState } from 'react';
import {
  DashboardAuditRecord,
  DASHBOARD_NETWORKS,
  gradeOf,
  shortHash,
  keccakMock
} from '../../data/dashboardData';
import { ScoreRing } from './ScoreRing';

interface VerifyViewProps {
  network: 'testnet' | 'mainnet';
  audits: DashboardAuditRecord[];
  onOpenCert: (audit: DashboardAuditRecord) => void;
  onAddToast: (msg: string, type?: 'cyber' | 'safe' | 'warn' | 'crit') => void;
}

interface ConsoleLogLine {
  text: string;
  type?: 'default' | 'safe' | 'warn' | 'crit';
}

export const VerifyView: React.FC<VerifyViewProps> = ({
  network,
  audits,
  onOpenCert,
  onAddToast
}) => {
  const net = DASHBOARD_NETWORKS[network];

  const [vtab, setVTab] = useState<'hash' | 'src'>('hash');
  const [verifyInput, setVerifyInput] = useState<string>('');
  const [verifySrc, setVerifySrc] = useState<string>('');

  const [consoleLines, setConsoleLines] = useState<ConsoleLogLine[]>([]);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{
    status: 'found-certified' | 'found-draft' | 'not-found';
    record?: DashboardAuditRecord;
    queriedHash?: string;
  } | null>(null);

  // Sample certified hashes for fast testing
  const sampleList = audits.filter((a) => a.certified).slice(0, 3);

  // Keccak preview for source code tab
  const srcHash = verifySrc.trim() ? keccakMock(verifySrc) : '0x…';

  const handleVerify = () => {
    const targetHash =
      vtab === 'hash' ? verifyInput.trim() : verifySrc.trim() ? keccakMock(verifySrc) : '';

    if (!targetHash || targetHash === '0x…') {
      onAddToast('Masukkan code hash atau tempel Solidity source.', 'warn');
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);
    setConsoleLines([
      {
        text: `› eth_call VibeProof.getAudit("${shortHash(targetHash, 10, 6)}") @ ${net.rpc}`,
        type: 'default'
      }
    ]);

    setTimeout(() => {
      setConsoleLines((prev) => [
        ...prev,
        {
          text: `› chainId ${net.id} · block #${net.baseBlock.toLocaleString('en-US')} · latency 182ms`,
          type: 'default'
        }
      ]);
    }, 420);

    setTimeout(() => {
      setConsoleLines((prev) => [
        ...prev,
        {
          text: '› decoding tuple (codeHash, projectName, securityScore, verdict, reportSummary, auditor, timestamp)…',
          type: 'default'
        }
      ]);
    }, 840);

    setTimeout(() => {
      const rec = audits.find(
        (a) =>
          a.hash.toLowerCase() === targetHash.toLowerCase() ||
          a.name.toLowerCase() === targetHash.toLowerCase()
      );

      if (rec && rec.certified) {
        setConsoleLines((prev) => [
          ...prev,
          { text: '✓ PROOF FOUND — record valid & immutable', type: 'safe' }
        ]);
        setVerifyResult({ status: 'found-certified', record: rec });
      } else if (rec) {
        setConsoleLines((prev) => [
          ...prev,
          {
            text: '⚠ record ditemukan namun belum di-mint on-chain',
            type: 'warn'
          }
        ]);
        setVerifyResult({ status: 'found-draft', record: rec });
      } else {
        setConsoleLines((prev) => [
          ...prev,
          { text: '✗ revert: AuditNotFound(bytes32)', type: 'crit' }
        ]);
        setVerifyResult({ status: 'not-found', queriedHash: targetHash });
      }
      setIsVerifying(false);
    }, 1300);
  };

  return (
    <section id="view-verify" className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Verify On-Chain Proof
        </h2>
        <p className="mt-1.5 text-sm text-zinc-500">
          Query langsung ke{' '}
          <code className="font-mono text-cyber">VibeProof.getAudit(bytes32)</code> — bukti
          audit tidak dapat dipalsukan karena tercatat permanen di BOT Chain.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
        {/* Sub-tabs */}
        <div className="flex border-b border-zinc-800 bg-ink-850">
          <button
            id="vtabHash"
            onClick={() => setVTab('hash')}
            className={`vtab chip h-11 px-5 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
              vtab === 'hash'
                ? 'text-cyber border-cyber'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            By Code Hash
          </button>
          <button
            id="vtabSrc"
            onClick={() => setVTab('src')}
            className={`vtab chip h-11 px-5 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
              vtab === 'src'
                ? 'text-cyber border-cyber'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            By Solidity Source
          </button>
        </div>

        <div className="p-5">
          {/* Pane 1: Code Hash */}
          {vtab === 'hash' && (
            <div id="vpaneHash" className="space-y-4">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Code Hash (bytes32)
                </span>
                <input
                  id="verifyInput"
                  spellCheck={false}
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="0x8f3a…e8f"
                  className="mt-1.5 w-full h-11 px-3.5 rounded-lg bg-ink-900 border border-zinc-800 font-mono text-xs text-zinc-200 focus:border-cyber/60 focus:outline-none focus:ring-1 focus:ring-cyber/40 transition-colors"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <span className="chip h-8 px-2.5 inline-flex items-center text-[10px] text-zinc-600">
                  Contoh:
                </span>
                {sampleList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setVerifyInput(item.hash);
                      onAddToast(`Hash contoh ${item.name} diisi.`, 'cyber');
                    }}
                    className="sample-hash chip h-8 px-3 rounded-lg border border-zinc-700 bg-ink-700 font-mono text-[10.5px] text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors cursor-pointer"
                  >
                    {item.name} · {shortHash(item.hash, 6, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pane 2: Solidity Source */}
          {vtab === 'src' && (
            <div id="vpaneSrc" className="space-y-4">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Tempel Solidity Source
                </span>
                <textarea
                  id="verifySrc"
                  rows={7}
                  spellCheck={false}
                  value={verifySrc}
                  onChange={(e) => setVerifySrc(e.target.value)}
                  placeholder="// paste contract source…"
                  className="code-input scroll-thin mt-1.5 w-full resize-y rounded-lg bg-ink-900 border border-zinc-800 px-3.5 py-3 font-mono text-[11.5px] leading-5 text-zinc-300 focus:border-cyber/60 focus:outline-none whitespace-pre"
                />
              </label>
              <p className="font-mono text-[11px] text-zinc-500">
                Keccak-256 (deterministic):{' '}
                <span id="verifySrcHash" className="text-cyber break-all">
                  {srcHash}
                </span>
              </p>
            </div>
          )}

          <button
            id="verifyBtn"
            onClick={handleVerify}
            disabled={isVerifying}
            className="btn-cyber chip mt-4 w-full h-12 rounded-xl bg-cyber text-ink-900 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z" />
              <path d="m9.5 11.6 1.8 1.8 3.4-3.6" />
            </svg>
            {isVerifying ? 'Querying BOT Chain…' : 'Verify On-Chain'}
          </button>
        </div>

        {/* Terminal console */}
        {consoleLines.length > 0 && (
          <div
            id="verifyConsole"
            className="border-t border-zinc-800 bg-ink-900 px-5 py-4 font-mono text-[11px] leading-6 space-y-1"
          >
            {consoleLines.map((line, idx) => (
              <div
                key={idx}
                className={`console-line ${
                  line.type === 'safe'
                    ? 'text-safe font-bold'
                    : line.type === 'warn'
                    ? 'text-warn font-semibold'
                    : line.type === 'crit'
                    ? 'text-crit font-bold'
                    : 'text-zinc-500'
                }`}
              >
                {line.text.startsWith('›') && <span className="text-cyber mr-1.5">›</span>}
                {line.text.startsWith('›') ? line.text.slice(1).trim() : line.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Result Card */}
      {verifyResult && (
        <div id="verifyResult" className="rise-in">
          {verifyResult.status === 'not-found' ? (
            <div className="rounded-2xl border border-crit/40 bg-crit/[0.07] p-6 text-center">
              <p className="text-4xl">⛔</p>
              <h4 className="mt-3 text-base font-extrabold text-crit">
                Proof tidak ditemukan
              </h4>
              <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
                Code hash{' '}
                <span className="font-mono text-zinc-200">
                  {shortHash(verifyResult.queriedHash || '', 10, 6)}
                </span>{' '}
                tidak tercatat di VibeProof.sol pada {net.name}. Pastikan source identik
                bit-per-bit atau coba jaringan lain.
              </p>
              <button
                onClick={handleVerify}
                className="chip mt-5 h-10 px-4 rounded-lg border border-zinc-700 bg-ink-800 text-xs font-bold text-zinc-200 hover:border-cyber/60 transition-colors cursor-pointer"
              >
                Coba lagi
              </button>
            </div>
          ) : verifyResult.record ? (
            (() => {
              const rec = verifyResult.record;
              const g = gradeOf(rec.score);
              const onchain = verifyResult.status === 'found-certified';

              return (
                <div
                  className={`rounded-2xl border ${
                    onchain ? 'border-safe/40' : 'border-warn/40'
                  } bg-ink-800 overflow-hidden`}
                >
                  <div className="px-5 py-4 border-b border-zinc-800 flex flex-wrap items-center gap-3">
                    <span
                      className={`chip h-7 px-3 inline-flex items-center gap-2 rounded-full border text-[10px] font-extrabold tracking-widest uppercase ${
                        onchain
                          ? 'border-safe/50 bg-safe/10 text-safe'
                          : 'border-warn/50 bg-warn/10 text-warn'
                      }`}
                    >
                      {onchain ? '✓ VERIFIED ON-CHAIN' : '⚠ DRAFT — NOT MINTED'}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">{rec.name}</span>
                    <span className="flex-1" />
                    <ScoreRing score={rec.score} size={40} />
                  </div>

                  <dl className="grid sm:grid-cols-2 gap-px bg-zinc-800 font-mono text-[11.5px]">
                    <div className="bg-ink-850 px-4 py-2.5">
                      <dt className="text-zinc-600 text-[10px] uppercase tracking-widest">
                        codeHash
                      </dt>
                      <dd className="mt-0.5 break-all text-cyber">{rec.hash}</dd>
                    </div>
                    <div className="bg-ink-850 px-4 py-2.5">
                      <dt className="text-zinc-600 text-[10px] uppercase tracking-widest">
                        projectName
                      </dt>
                      <dd className="mt-0.5 text-zinc-200">
                        {rec.name.replace('.sol', '')}
                      </dd>
                    </div>
                    <div className="bg-ink-850 px-4 py-2.5">
                      <dt className="text-zinc-600 text-[10px] uppercase tracking-widest">
                        securityScore
                      </dt>
                      <dd className="mt-0.5 text-zinc-200">{rec.score} (uint8)</dd>
                    </div>
                    <div className="bg-ink-850 px-4 py-2.5">
                      <dt className="text-zinc-600 text-[10px] uppercase tracking-widest">
                        verdict
                      </dt>
                      <dd className="mt-0.5">
                        <span
                          className={`chip h-6 px-2 inline-flex items-center rounded-full border text-[9.5px] font-extrabold tracking-widest uppercase ${g.chip}`}
                        >
                          {g.verdict}
                        </span>
                      </dd>
                    </div>
                    <div className="bg-ink-850 px-4 py-2.5">
                      <dt className="text-zinc-600 text-[10px] uppercase tracking-widest">
                        auditor
                      </dt>
                      <dd className="mt-0.5 break-all text-zinc-300">{rec.auditor}</dd>
                    </div>
                    <div className="bg-ink-850 px-4 py-2.5">
                      <dt className="text-zinc-600 text-[10px] uppercase tracking-widest">
                        timestamp / block
                      </dt>
                      <dd className="mt-0.5 text-zinc-300">
                        {rec.time.toLocaleString('id-ID')} · #{rec.block.toLocaleString('en-US')}
                      </dd>
                    </div>
                  </dl>

                  <div className="px-5 py-4 bg-ink-850 flex flex-wrap gap-2">
                    <button
                      id="vrCert"
                      onClick={() => {
                        if (rec.certified) {
                          onOpenCert(rec);
                        } else {
                          onAddToast('Record belum di-mint on-chain.', 'warn');
                        }
                      }}
                      className="chip h-10 px-4 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors cursor-pointer"
                    >
                      Open Certificate
                    </button>
                    <a
                      href={`${net.explorer}/tx/${rec.tx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chip h-10 px-4 inline-flex items-center rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 transition-colors"
                    >
                      View TX on BOTScan ↗
                    </a>
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>
      )}
    </section>
  );
};
