export interface DashboardNetwork {
  key: 'testnet' | 'mainnet';
  name: string;
  id: number;
  hex: string;
  rpc: string;
  explorer: string;
  faucet: string;
  baseBlock: number;
}

export const DASHBOARD_NETWORKS: Record<'testnet' | 'mainnet', DashboardNetwork> = {
  testnet: {
    key: 'testnet',
    name: 'BOT Chain Testnet',
    id: 968,
    hex: '0x3C8',
    rpc: 'https://rpc.bohr.life',
    explorer: 'https://scan.bohr.life',
    faucet: 'https://faucet.botchain.ai/basic',
    baseBlock: 3412880
  },
  mainnet: {
    key: 'mainnet',
    name: 'BOT Chain Mainnet',
    id: 677,
    hex: '0x2A5',
    rpc: 'https://rpc.botchain.ai',
    explorer: 'https://scan.botchain.ai',
    faucet: 'Alokasi organizer via Telegram',
    baseBlock: 22859700
  }
};

export const VIBEPROOF_ADDR = '0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578';

export interface DashboardAuditRecord {
  id: string;
  name: string;
  score: number;
  issues: { c: number; h: number; m: number; l: number };
  min: number;
  auditor: string;
  certified: boolean;
  summary: string;
  hash: string;
  tx: string;
  net: 'testnet' | 'mainnet';
  block: number;
  time: Date;
}

export function fnv1a(str: string, seed: number): number {
  let h = 0x811c9dc5 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function keccakMock(str: string): string {
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += fnv1a(str + '::' + i, 0x9e3779b9 + i * 2654435761)
      .toString(16)
      .padStart(8, '0');
  }
  return '0x' + out;
}

export function shortHash(h: string, a = 6, b = 4): string {
  if (!h) return '';
  if (h.length <= a + b + 2) return h;
  return h.slice(0, a + 2) + '…' + h.slice(-b);
}

export function gradeOf(score: number): {
  key: 'safe' | 'warn' | 'crit';
  color: string;
  verdict: string;
  chip: string;
} {
  if (score >= 80)
    return {
      key: 'safe',
      color: '#10b981',
      verdict: 'PASSED — SAFE',
      chip: 'border-safe/50 bg-safe/10 text-safe'
    };
  if (score >= 50)
    return {
      key: 'warn',
      color: '#f59e0b',
      verdict: 'WARNINGS DETECTED',
      chip: 'border-warn/50 bg-warn/10 text-warn'
    };
  return {
    key: 'crit',
    color: '#f43f5e',
    verdict: 'CRITICAL RISK',
    chip: 'border-crit/50 bg-crit/10 text-crit'
  };
}

export function agoLabel(min: number): string {
  if (min < 60) return min + ' mnt lalu';
  if (min < 1440) return Math.round(min / 60) + ' jam lalu';
  return Math.round(min / 1440) + ' hr lalu';
}

type SeedRow = [string, number, number, number, number, number, number, string, boolean, string];

const SEED: Record<'testnet' | 'mainnet', SeedRow[]> = {
  testnet: [
    ['VulnerableVault.sol', 28, 2, 2, 1, 1, 4, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true, 'Reentrancy pada withdraw() + autentikasi tx.origin; kontrak dapat dikuras penuh. Wajib perbaikan sebelum deploy.'],
    ['TokenRegistry.sol', 58, 0, 1, 3, 2, 22, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true, 'verifyToken() tanpa access control dan return value ERC-20 tidak diverifikasi.'],
    ['SafeDAppVault.sol', 96, 0, 0, 0, 1, 61, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true, 'ReentrancyGuard + checks-effects-interactions diterapkan konsisten; layak produksi.'],
    ['LunaStake.sol', 91, 0, 0, 1, 2, 130, '0x9aC177b0eF44c2A5d1B8031f77e09c77', true, 'Staking reward math aman; satu catatan informatif rounding.'],
    ['YieldRouterV2.sol', 47, 1, 2, 2, 1, 190, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', true, 'Unchecked low-level call pada router hop; potensi loss of funds.'],
    ['NFTMintPass.sol', 74, 0, 1, 2, 3, 320, '0x77bD0c52a19E4f6B8820d3C55e11aa04', true, 'Mint signature replay window terlalu lebar; perketat nonce.'],
    ['GovBridge.sol', 88, 0, 0, 1, 2, 480, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true, 'Multisig threshold tepat; tambahkan timelock untuk upgrade.'],
    ['TokenVesting.sol', 83, 0, 0, 2, 2, 720, '0xC4e819d77b0A2f6E9031b8D5aa44c209', true, 'Cliff vesting benar; event release belum lengkap.'],
    ['FlashLoanPool.sol', 35, 2, 1, 2, 2, 1500, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', true, 'Callback flash loan tidak memvalidasi caller; drain vector kritis.'],
    ['StableSwapAmm.sol', 69, 0, 1, 3, 1, 1560, '0x9aC177b0eF44c2A5d1B8031f77e09c77', true, 'Slippage guard opsional; invariant curve perlu fuzzing lanjutan.'],
    ['AirdropClaimer.sol', 94, 0, 0, 0, 2, 2900, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true, 'Merkle proof verifikasi solid; claim sekali pakai terjamin.'],
    ['StakingRewards.sol', 61, 0, 1, 2, 3, 3000, '0xC4e819d77b0A2f6E9031b8D5aa44c209', true, 'Reward rate dapat diubah owner tanpa timelock.'],
    ['OracleAggregator.sol', 87, 0, 0, 1, 2, 4300, '0x77bD0c52a19E4f6B8820d3C55e11aa04', true, 'Median aggregation aman; tambah fallback saat signer offline.'],
    ['PresaleVault.sol', 22, 3, 2, 1, 1, 5800, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', false, 'Owner dapat mengubah harga & withdraw penuh; centralization kritis.']
  ],
  mainnet: [
    ['SafeDAppVault.sol', 96, 0, 0, 0, 1, 18, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true, 'ReentrancyGuard + checks-effects-interactions diterapkan konsisten; layak produksi.'],
    ['MetaPayWallet.sol', 89, 0, 0, 1, 2, 70, '0x9aC177b0eF44c2A5d1B8031f77e09c77', true, 'Session key scope tepat; tambahkan spending limit harian.'],
    ['GovBridge.sol', 92, 0, 0, 1, 1, 180, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true, 'Multisig + timelock aktif; message replay protection lengkap.'],
    ['YieldRouterV2.sol', 54, 1, 1, 3, 1, 360, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', true, 'Slippage parameter user-supplied tanpa bound; perlu clamp.'],
    ['TokenVesting.sol', 84, 0, 0, 2, 2, 540, '0xC4e819d77b0A2f6E9031b8D5aa44c209', true, 'Vesting schedule benar; dokumentasikan edge case revoke.'],
    ['StakingRewards.sol', 71, 0, 1, 2, 2, 840, '0xC4e819d77b0A2f6E9031b8D5aa44c209', true, 'Reward rate mutable; tambahkan timelock 48 jam.'],
    ['LunaStake.sol', 95, 0, 0, 0, 1, 1440, '0x9aC177b0eF44c2A5d1B8031f77e09c77', true, 'Audit ulang pasca-upgrade v1.2 bersih.'],
    ['NFTMintPass.sol', 38, 2, 2, 1, 2, 1500, '0x77bD0c52a19E4f6B8820d3C55e11aa04', false, 'Signature malleability + unlimited mint window; blocking issue.'],
    ['OracleAggregator.sol', 90, 0, 0, 1, 1, 2880, '0x77bD0c52a19E4f6B8820d3C55e11aa04', true, 'Price feed redundancy baik.'],
    ['FlashLoanPool.sol', 63, 0, 2, 2, 2, 4320, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', true, 'Callback validation diperbaiki; sisa risiko_donation minor.']
  ]
};

export function buildAudits(net: 'testnet' | 'mainnet'): DashboardAuditRecord[] {
  return SEED[net].map((row, i) => {
    const [name, score, c, h, m, l, min, auditor, certified, summary] = row;
    const hash = keccakMock(net + ':' + name + ':' + i);
    return {
      id: net + '-' + i,
      name,
      score,
      issues: { c, h, m, l },
      min,
      auditor,
      certified,
      summary,
      hash,
      tx: keccakMock('tx:' + hash),
      net,
      block: DASHBOARD_NETWORKS[net].baseBlock - Math.floor(min * 3.1),
      time: new Date(Date.now() - min * 60000)
    };
  });
}

export const DASHBOARD_TREND = {
  testnet: [52, 48, 55, 61, 58, 66, 63, 71, 69, 76, 74, 81, 79, 84].map((s, i) => ({
    d: i + 1 + '/6',
    score: s,
    count: 1 + (i % 4)
  })),
  mainnet: [70, 74, 72, 79, 83, 80, 86, 84, 88, 85, 90, 89, 92, 94].map((s, i) => ({
    d: i + 1 + '/6',
    score: s,
    count: 1 + (i % 3)
  }))
};

export interface ContractFunctionItem {
  type: 'read' | 'write';
  name: string;
  sig: string;
  desc: string;
  out: string;
}

export const DASHBOARD_FNS: ContractFunctionItem[] = [
  {
    type: 'write',
    name: 'certifyAudit',
    sig: 'certifyAudit(bytes32 _codeHash, string _projectName, uint8 _securityScore, string _verdict, string _reportSummary)',
    desc: 'Menyimpan verdict audit on-chain dan emit event AuditIssued. Gas ±21,480 (0.00021 BOT).',
    out: '→ Transaction sent: 0x4f2a…c91d · status: success (1 confirmation) · event AuditIssued emitted'
  },
  {
    type: 'read',
    name: 'getAudit',
    sig: 'getAudit(bytes32 _codeHash) view returns (bytes32, string, uint8, string, string, address, uint256)',
    desc: 'Mengambil record audit tersertifikasi berdasarkan code hash.',
    out: '→ (0x8f3a…e8f1, "SafeDAppVault", 96, "PASSED — SAFE", "ReentrancyGuard + CEI konsisten…", 0x38bF…20a4, 1749632400)'
  },
  {
    type: 'read',
    name: 'getTotalAudits',
    sig: 'getTotalAudits() view returns (uint256)',
    desc: 'Total audit yang pernah dicatat kontrak.',
    out: '→ 1284'
  },
  {
    type: 'read',
    name: 'getLatestAudits',
    sig: 'getLatestAudits(uint256 limit) view returns (Audit[] memory)',
    desc: 'Record terbaru untuk timeline feed frontend.',
    out: '→ Audit[6]: [VulnerableVault 28, TokenRegistry 58, SafeDAppVault 96, LunaStake 91, YieldRouterV2 47, NFTMintPass 74]'
  }
];

export const VIBEPROOF_ABI_JSON = JSON.stringify(
  [
    {
      type: 'function',
      name: 'certifyAudit',
      stateMutability: 'nonpayable',
      inputs: [
        { name: '_codeHash', type: 'bytes32' },
        { name: '_projectName', type: 'string' },
        { name: '_securityScore', type: 'uint8' },
        { name: '_verdict', type: 'string' },
        { name: '_reportSummary', type: 'string' }
      ],
      outputs: []
    },
    {
      type: 'function',
      name: 'getAudit',
      stateMutability: 'view',
      inputs: [{ name: '_codeHash', type: 'bytes32' }],
      outputs: [
        { type: 'bytes32' },
        { type: 'string' },
        { type: 'uint8' },
        { type: 'string' },
        { type: 'string' },
        { type: 'address' },
        { type: 'uint256' }
      ]
    },
    {
      type: 'function',
      name: 'getTotalAudits',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint256' }]
    },
    {
      type: 'function',
      name: 'getLatestAudits',
      stateMutability: 'view',
      inputs: [{ name: 'limit', type: 'uint256' }],
      outputs: [{ type: 'tuple[]' }]
    },
    {
      type: 'event',
      name: 'AuditIssued',
      inputs: [
        { name: 'codeHash', type: 'bytes32', indexed: true },
        { name: 'projectName', type: 'string', indexed: false },
        { name: 'securityScore', type: 'uint8', indexed: false },
        { name: 'verdict', type: 'string', indexed: false },
        { name: 'auditor', type: 'address', indexed: true },
        { name: 'timestamp', type: 'uint256', indexed: false }
      ]
    }
  ],
  null,
  2
);
