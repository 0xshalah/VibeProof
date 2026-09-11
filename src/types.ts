export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type Verdict = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface VulnerabilityFinding {
  id: string;
  title: string;
  severity: Severity;
  line: number;
  description: string;
  recommendation: string;
  codeSnippet?: string;
  category: 'REENTRANCY' | 'ACCESS_CONTROL' | 'ARITHMETIC' | 'GAS' | 'LOGIC' | 'STANDARDS';
}

export interface AuditResult {
  codeHash: string;
  projectName: string;
  securityScore: number; // 0 - 100
  verdict: Verdict;
  summary: string;
  findings: VulnerabilityFinding[];
  gasAnalysis: {
    efficiencyScore: number;
    tips: string[];
  };
  metrics: {
    totalLines: number;
    functionsCount: number;
    modifiersCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  auditedAt: number;
}

export interface CertifiedOnChainRecord {
  codeHash: string;
  projectName: string;
  securityScore: number;
  verdict: Verdict;
  reportSummary: string;
  auditorWallet: string;
  timestamp: number;
  txHash?: string;
  chainId?: number;
  blockExplorerUrl?: string;
}

export interface NetworkConfig {
  chainId: number;
  hexChainId: string;
  name: string;
  rpcUrl: string;
  symbol: string;
  explorerUrl: string;
  faucetUrl?: string;
  isTestnet: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  botBalance: string | null;
  isConnecting: boolean;
  error: string | null;
}

export interface SampleContractPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'rose';
  code: string;
}
