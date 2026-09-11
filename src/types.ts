export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface FindingItem {
  id?: string;
  sev: SeverityLevel;
  title: string;
  line: number;
  snippet: string;
  fix: string;
  owaspId?: string;
  cwe?: string;
  category?: string;
}

export interface AuditReportData {
  score: number;
  verdict: string;
  scanTime: string;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    gas: number;
  };
  tags: string[];
  summary: string;
  findings: FindingItem[];
  gasTips: string[];
  owaspMatrix?: Record<string, 'PASS' | 'WARN' | 'FAIL'>;
}

export interface ContractPreset {
  id: 'vulnerable' | 'registry' | 'safe';
  file: string;
  code: string;
  title: string;
  subtitle: string;
  badge: string;
  result: AuditReportData;
}

export interface CertifiedAuditData {
  fileName: string;
  score: number;
  verdict: string;
  codeHash: string;
  walletAddress: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  network: 'testnet' | 'mainnet';
}

export interface CertifiedProof {
  contract: string;
  score: number;
  verdict: string;
  codeHash: string;
  wallet: string;
  tx: string;
  block: number;
  time: string;
  net: 'testnet' | 'mainnet';
}

export interface AuditFeedItem {
  name: string;
  who: string;
  score: number;
  tx: string;
  net: 'testnet' | 'mainnet';
  ago: string;
}

export type LiveFeedItem = AuditFeedItem;

export interface NetworkInfo {
  key: 'testnet' | 'mainnet';
  name: string;
  id: number;
  rpc: string;
  explorer: string;
  faucet: string;
}

export interface WalletAccount {
  address: string;
  balance: string;
  isRealMetaMask?: boolean;
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

export interface ToastMessage {
  id: string;
  message: string;
  type: 'cyber' | 'safe' | 'warn' | 'crit';
}
