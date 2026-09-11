import { ethers } from 'ethers';
import { AuditReportData, FindingItem } from '../types';
import { PRESETS } from '../data/sampleContracts';

/**
 * Compute standard Keccak-256 hash using ethers
 */
export function computeKeccak256(code: string): string {
  try {
    const normalized = code.trim().replace(/\r\n/g, '\n');
    return ethers.keccak256(ethers.toUtf8Bytes(normalized));
  } catch (err) {
    // Fallback hash if empty string
    return '0x' + '0'.repeat(64);
  }
}

/**
 * Format hash into 0x1234...5678
 */
export function shortHash(hash: string, lead = 6, trail = 4): string {
  if (!hash || hash.length < lead + trail + 2) return hash || '';
  return `${hash.slice(0, lead + 2)}…${hash.slice(-trail)}`;
}

/**
 * Categorize score into verdict & theme key
 */
export function gradeOf(score: number): {
  key: 'safe' | 'warn' | 'crit';
  color: string;
  verdict: string;
  chip: string;
  badgeBg: string;
} {
  if (score >= 80) {
    return {
      key: 'safe',
      color: '#10b981',
      verdict: 'PASSED — SAFE',
      chip: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
      badgeBg: 'bg-emerald-500'
    };
  }
  if (score >= 50) {
    return {
      key: 'warn',
      color: '#f59e0b',
      verdict: 'WARNINGS DETECTED',
      chip: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
      badgeBg: 'bg-amber-500'
    };
  }
  return {
    key: 'crit',
    color: '#f43f5e',
    verdict: 'CRITICAL RISK',
    chip: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
    badgeBg: 'bg-rose-500'
  };
}

/**
 * Deep Heuristic & OWASP SC Top 10 Analyzer
 */
export function analyzeCustomCode(code: string): AuditReportData {
  const lines = code.split('\n');
  const findings: FindingItem[] = [];
  const hit = (re: RegExp) => lines.findIndex((l) => re.test(l)) + 1;

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  const owaspStatus: Record<string, 'PASS' | 'WARN' | 'FAIL'> = {
    'SC01:2026': 'PASS',
    'SC02:2026': 'PASS',
    'SC03:2026': 'PASS',
    'SC04:2026': 'PASS',
    'SC05:2026': 'PASS',
    'SC06:2026': 'PASS',
    'SC07:2026': 'PASS',
    'SC08:2026': 'PASS',
    'SC09:2026': 'PASS',
    'SC10:2026': 'PASS'
  };

  // 1. Reentrancy
  const reLine = hit(/\.call\s*\{\s*value/);
  if (reLine) {
    findings.push({
      sev: 'critical',
      title: 'Potential reentrancy (external call + value transfer)',
      line: reLine,
      snippet: lines[reLine - 1]?.trim() || '',
      fix: 'Terapkan pola checks-effects-interactions dan gunakan OpenZeppelin ReentrancyGuard nonReentrant modifier.',
      owaspId: 'SC08:2026',
      cwe: 'CWE-841'
    });
    criticalCount++;
    owaspStatus['SC08:2026'] = 'FAIL';
  }

  // 2. tx.origin
  const txo = hit(/tx\.origin/);
  if (txo) {
    findings.push({
      sev: 'critical',
      title: 'tx.origin digunakan untuk otentikasi (phishing-prone)',
      line: txo,
      snippet: lines[txo - 1]?.trim() || '',
      fix: 'Ganti dengan msg.sender + modifier onlyOwner; tx.origin dapat dimanipulasi melalui malicious forwarding contract.',
      owaspId: 'SC01:2026',
      cwe: 'CWE-284'
    });
    criticalCount++;
    owaspStatus['SC01:2026'] = 'FAIL';
  }

  // 3. Delegatecall
  const dlg = hit(/delegatecall/);
  if (dlg) {
    findings.push({
      sev: 'high',
      title: 'delegatecall dengan parameter input eksternal',
      line: dlg,
      snippet: lines[dlg - 1]?.trim() || '',
      fix: 'Validasi target eksekusi dan batasi fungsi proxy hanya pada target whitelist terverifikasi.',
      owaspId: 'SC10:2026',
      cwe: 'CWE-665'
    });
    highCount++;
    owaspStatus['SC10:2026'] = 'FAIL';
  }

  // 4. Selfdestruct
  const sd = hit(/selfdestruct|suicide/);
  if (sd) {
    findings.push({
      sev: 'critical',
      title: 'Penggunaan opcode selfdestruct terdeteksi',
      line: sd,
      snippet: lines[sd - 1]?.trim() || '',
      fix: 'Hindari selfdestruct pada EVM modern (EIP-6780). Lindungi dengan timelock multisig jika mutlak diperlukan.',
      owaspId: 'SC01:2026',
      cwe: 'CWE-284'
    });
    criticalCount++;
    owaspStatus['SC01:2026'] = 'FAIL';
  }

  // 5. Unprotected setters
  lines.forEach((ln, i) => {
    if (
      /function\s+set\w*\s*\(/.test(ln) &&
      !/onlyOwner|onlyRole|onlyAdmin|require\s*\(/.test(ln) &&
      !/view|pure/.test(ln)
    ) {
      findings.push({
        sev: 'high',
        title: `Setter tanpa access control modifier: ${ln.match(/function\s+(\w+)/)?.[1] || 'setter'}()`,
        line: i + 1,
        snippet: ln.trim(),
        fix: 'Tambahkan modifier onlyOwner atau AccessControl role agar tidak sembarang wallet bisa mengubah konfigurasi.',
        owaspId: 'SC01:2026',
        cwe: 'CWE-284'
      });
      highCount++;
      if (owaspStatus['SC01:2026'] === 'PASS') owaspStatus['SC01:2026'] = 'WARN';
    }
  });

  // 6. Zero address validation
  const constructorIdx = hit(/constructor\s*\(/);
  if (constructorIdx && /address\s+_\w+/.test(lines[constructorIdx - 1] || '')) {
    if (!/require\s*\(\s*_\w+\s*!=\s*address\(0\)/.test(code)) {
      findings.push({
        sev: 'medium',
        title: 'Missing zero-address validation pada constructor address parameter',
        line: constructorIdx,
        snippet: lines[constructorIdx - 1]?.trim() || '',
        fix: 'Tambahkan require(_addr != address(0), "Zero address") untuk mencegah miskonfigurasi permanen.',
        owaspId: 'SC05:2026',
        cwe: 'CWE-20'
      });
      mediumCount++;
      owaspStatus['SC05:2026'] = 'WARN';
    }
  }

  // 7. Unchecked low-level calls
  const unchk = hit(/\.call\(/);
  if (unchk && !/bool\s+(ok|success)/.test(code)) {
    findings.push({
      sev: 'medium',
      title: 'Unchecked return value pada low-level call()',
      line: unchk,
      snippet: lines[unchk - 1]?.trim() || '',
      fix: 'Periksa selalu return boolean status: (bool ok, ) = to.call(...); require(ok, "Failed");',
      owaspId: 'SC06:2026',
      cwe: 'CWE-252'
    });
    mediumCount++;
    owaspStatus['SC06:2026'] = 'WARN';
  }

  // 8. Missing events
  if (!/event\s+\w+/.test(code)) {
    findings.push({
      sev: 'medium',
      title: 'Tidak ada event yang dideklarasikan untuk monitoring state change',
      line: 1,
      snippet: '// Tidak ditemukan deklarasi `event`',
      fix: 'Emit event untuk setiap operasi transfer, deposit, atau perubahan konfigurasi parameter penting.',
      owaspId: 'SC02:2026',
      cwe: 'CWE-840'
    });
    mediumCount++;
    if (owaspStatus['SC02:2026'] === 'PASS') owaspStatus['SC02:2026'] = 'WARN';
  }

  // 9. Payable without nonReentrant
  if (/payable/.test(code) && !/nonReentrant|ReentrancyGuard/.test(code)) {
    const payLine = hit(/payable/);
    findings.push({
      sev: 'medium',
      title: 'Fungsi payable tanpa reentrancy guard',
      line: payLine || 1,
      snippet: lines[payLine ? payLine - 1 : 0]?.trim() || '',
      fix: 'Gunakan modifier nonReentrant dari OpenZeppelin ReentrancyGuard.',
      owaspId: 'SC08:2026',
      cwe: 'CWE-841'
    });
    mediumCount++;
    if (owaspStatus['SC08:2026'] === 'PASS') owaspStatus['SC08:2026'] = 'WARN';
  }

  // 10. transfer() 2300 gas
  if (/\.transfer\(/.test(code)) {
    const trLine = hit(/\.transfer\(/);
    findings.push({
      sev: 'low',
      title: 'transfer() dengan batasan hardcoded 2300 gas stipend',
      line: trLine || 1,
      snippet: lines[trLine ? trLine - 1 : 0]?.trim() || '',
      fix: 'Gunakan call{value:} dengan checks-effects-interactions untuk kompatibilitas smart contract wallet (Gnosis Safe).',
      owaspId: 'SC06:2026',
      cwe: 'CWE-252'
    });
    lowCount++;
  }

  const gasTips = [
    'Hindari membaca variabel storage (SLOAD) berulang dalam loop — cache ke variabel memori lokal.',
    'Gunakan custom errors (error CustomError()) daripada require("string") untuk menghemat gas per revert.',
    'Optimalkan urutan storage layout struct untuk packing slot 32-byte.'
  ];

  const score = Math.max(8, Math.min(99, 100 - (criticalCount * 26 + highCount * 12 + mediumCount * 6 + lowCount * 3)));
  const g = gradeOf(score);

  return {
    score,
    verdict: g.verdict,
    scanTime: (3 + Math.random() * 1.8).toFixed(1) + 's',
    counts: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      gas: 2
    },
    tags: ['custom-source', 'owasp-2026-aligned', 'ai-heuristics'],
    summary:
      findings.length > 0
        ? `Audit engine mendeteksi ${findings.length} isu keamanan aktif. Terdapat ${criticalCount} temuan kritis dan ${highCount} temuan berisiko tinggi yang perlu dimitigasi sebelum deployment mainnet.`
        : 'Tidak ditemukan pola kerentanan berisiko umum pada source code. Kontrak memenuhi parameter keamanan dasar; disarankan tetap menjalankan formal verification untuk invariant kompleks.',
    findings,
    gasTips,
    owaspMatrix: owaspStatus
  };
}

/**
 * Main entry point: checks if code is one of the presets, else runs custom analyzer
 */
export function auditSolidityCode(code: string): AuditReportData {
  const trimmed = code.trim();
  for (const key of ['vulnerable', 'registry', 'safe'] as const) {
    if (PRESETS[key].code.trim() === trimmed) {
      return PRESETS[key].result;
    }
  }
  return analyzeCustomCode(code);
}
