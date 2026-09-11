import { NetworkConfig } from '../types';

export const BOT_CHAIN_TESTNET: NetworkConfig = {
  chainId: 968,
  hexChainId: '0x3C8',
  name: 'BOT Chain Testnet',
  rpcUrl: 'https://rpc.bohr.life',
  symbol: 'BOT',
  explorerUrl: 'https://scan.bohr.life',
  faucetUrl: 'https://faucet.botchain.ai/basic',
  isTestnet: true,
};

export const BOT_CHAIN_MAINNET: NetworkConfig = {
  chainId: 677,
  hexChainId: '0x2A5',
  name: 'BOT Chain Mainnet',
  rpcUrl: 'https://rpc.botchain.ai',
  symbol: 'BOT',
  explorerUrl: 'https://scan.botchain.ai',
  isTestnet: false,
};

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  968: BOT_CHAIN_TESTNET,
  677: BOT_CHAIN_MAINNET,
};

// Default deployed contract address on BOT Chain
// If not yet deployed to Mainnet by the user, this fallback address is provided
export const VIBEPROOF_CONTRACT_ADDRESSES: Record<number, string> = {
  968: '0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578', // Testnet contract address
  677: '0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578', // Mainnet target contract address
};

export const VIBEPROOF_ABI = [
  'function certifyAudit(bytes32 _codeHash, string _projectName, uint8 _securityScore, string _verdict, string _reportSummary) external',
  'function getAudit(bytes32 _codeHash) external view returns (tuple(bytes32 codeHash, string projectName, uint8 securityScore, string auditVerdict, string reportSummary, address auditorWallet, uint256 timestamp, bool exists))',
  'function isCodeCertified(bytes32 _codeHash) external view returns (bool)',
  'function getTotalAudits() external view returns (uint256)',
  'function getLatestAudits(uint256 limit) external view returns (tuple(bytes32 codeHash, string projectName, uint8 securityScore, string auditVerdict, string reportSummary, address auditorWallet, uint256 timestamp, bool exists)[])',
  'event AuditIssued(bytes32 indexed codeHash, string projectName, uint8 securityScore, string auditVerdict, address indexed auditorWallet, uint256 timestamp)',
];
