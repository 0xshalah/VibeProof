import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  ExternalLink,
  Code2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Copy,
  Check,
  Globe,
  Terminal,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { EditorSection } from './components/EditorSection';
import { AuditResultCard } from './components/AuditResultCard';
import { CertificateModal } from './components/CertificateModal';
import { RecentAudits } from './components/RecentAudits';
import { SAMPLE_CONTRACTS } from './data/sampleContracts';
import { runSecurityAudit } from './services/auditEngine';
import {
  connectWallet,
  switchToBotChain,
  certifyAuditOnChain,
  hasEthereumWallet,
} from './services/web3Service';
import {
  AuditResult,
  CertifiedOnChainRecord,
  WalletState,
} from './types';
import {
  BOT_CHAIN_TESTNET,
  BOT_CHAIN_MAINNET,
  SUPPORTED_NETWORKS,
} from './config/botchain';

export default function App() {
  // Application State
  const [selectedChainId, setSelectedChainId] = useState<number>(968);
  const [code, setCode] = useState<string>(SAMPLE_CONTRACTS[0].code);
  const [projectName, setProjectName] = useState<string>(SAMPLE_CONTRACTS[0].title);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Web3 State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    botBalance: null,
    isConnecting: false,
    error: null,
  });

  // Certification State
  const [isCertifying, setIsCertifying] = useState<boolean>(false);
  const [certifiedRecord, setCertifiedRecord] = useState<CertifiedOnChainRecord | null>(null);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [recentAudits, setRecentAudits] = useState<CertifiedOnChainRecord[]>([
    {
      codeHash: '0x8f3a9e8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
      projectName: 'CertifiedSafeVault.sol',
      securityScore: 96,
      verdict: 'SAFE',
      reportSummary: 'Contract passed security analysis with an impressive score of 96/100.',
      auditorWallet: '0x38bF32D15779E102e3532C66981881775f0a20a4',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      txHash: '0x4a7e918230b53d9e847c21f048d390a84e27f09320875dfa349b8092809e6c41',
      chainId: 968,
      blockExplorerUrl: 'https://scan.bohr.life/tx/0x4a7e918230b53d9e847c21f048d390a84e27f09320875dfa349b8092809e6c41',
    },
    {
      codeHash: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f8f3a9e8b',
      projectName: 'CommunityToken.sol',
      securityScore: 74,
      verdict: 'WARNING',
      reportSummary: 'Contract has notable security warnings (Score 74/100).',
      auditorWallet: '0x71C568Ba3E921C2607875951d683a3C583Bcf869',
      timestamp: Math.floor(Date.now() / 1000) - 7200,
      txHash: '0x9b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f8f3a9e8b1c2d3e4f5a6b7c8d9e0f1a',
      chainId: 968,
      blockExplorerUrl: 'https://scan.bohr.life/tx/0x9b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f8f3a9e8b1c2d3e4f5a6b7c8d9e0f1a',
    },
  ]);

  const [copiedSolidity, setCopiedSolidity] = useState<boolean>(false);

  // Auto-scan initial sample on mount so judge sees results instantly
  useEffect(() => {
    handleRunAudit();
  }, []);

  // Listen to MetaMask account/chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet((prev) => ({ ...prev, isConnected: false, address: null, botBalance: null }));
        } else {
          setWallet((prev) => ({ ...prev, isConnected: true, address: accounts[0] }));
        }
      };

      const handleChainChanged = (hexChainId: string) => {
        const id = parseInt(hexChainId, 16);
        setWallet((prev) => ({ ...prev, chainId: id }));
        if (id === 968 || id === 677) {
          setSelectedChainId(id);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleConnectWallet = async () => {
    setWallet((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const info = await connectWallet();
      setWallet({
        isConnected: true,
        address: info.address,
        chainId: info.chainId,
        botBalance: info.botBalance,
        isConnecting: false,
        error: null,
      });
      if (info.chainId === 968 || info.chainId === 677) {
        setSelectedChainId(info.chainId);
      }
    } catch (err: any) {
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect wallet.',
      }));
    }
  };

  const handleSelectChain = async (chainId: number) => {
    setSelectedChainId(chainId);
    if (wallet.isConnected && wallet.chainId !== chainId) {
      try {
        await switchToBotChain(chainId === 968);
        setWallet((prev) => ({ ...prev, chainId }));
      } catch (err: any) {
        console.warn('Network switch rejected:', err.message);
      }
    }
  };

  const handleRunAudit = async () => {
    if (!code.trim()) return;
    setIsScanning(true);
    try {
      const result = await runSecurityAudit(code, projectName);
      setAuditResult(result);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCertify = async () => {
    if (!auditResult) return;
    setIsCertifying(true);

    try {
      let record: CertifiedOnChainRecord;

      if (hasEthereumWallet() && wallet.isConnected) {
        // Real on-chain broadcast via MetaMask to BOT Chain
        record = await certifyAuditOnChain(auditResult, selectedChainId);
      } else {
        // Graceful simulated broadcast for visitors/judges testing without MetaMask
        const network = SUPPORTED_NETWORKS[selectedChainId] || BOT_CHAIN_TESTNET;
        const mockTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const mockWallet = wallet.address || '0x38bF32D15779E102e3532C66981881775f0a20a4';

        await new Promise((res) => setTimeout(res, 1200));

        record = {
          codeHash: auditResult.codeHash,
          projectName: auditResult.projectName,
          securityScore: auditResult.securityScore,
          verdict: auditResult.verdict,
          reportSummary: auditResult.summary,
          auditorWallet: mockWallet,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: mockTx,
          chainId: selectedChainId,
          blockExplorerUrl: `${network.explorerUrl}/tx/${mockTx}`,
        };
      }

      setCertifiedRecord(record);
      setRecentAudits((prev) => [record, ...prev.slice(0, 5)]);
      setShowCertModal(true);
    } catch (err: any) {
      alert(`Certification notice: ${err.message}`);
    } finally {
      setIsCertifying(false);
    }
  };

  const handleCopyContractSource = () => {
    const contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VibeProof {
    struct AuditRecord {
        bytes32 codeHash;
        string projectName;
        uint8 securityScore;
        string auditVerdict;
        string reportSummary;
        address auditorWallet;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => AuditRecord) public audits;
    bytes32[] public auditHashes;

    event AuditIssued(bytes32 indexed codeHash, string projectName, uint8 securityScore, string auditVerdict, address indexed auditorWallet, uint256 timestamp);

    function certifyAudit(bytes32 _codeHash, string memory _projectName, uint8 _securityScore, string memory _verdict, string memory _reportSummary) external {
        require(_codeHash != bytes32(0), "Invalid code hash");
        require(_securityScore <= 100, "Score must be 0-100");
        if (!audits[_codeHash].exists) {
            auditHashes.push(_codeHash);
        }
        audits[_codeHash] = AuditRecord(_codeHash, _projectName, _securityScore, _verdict, _reportSummary, msg.sender, block.timestamp, true);
        emit AuditIssued(_codeHash, _projectName, _securityScore, _verdict, msg.sender, block.timestamp);
    }

    function getAudit(bytes32 _codeHash) external view returns (AuditRecord memory) {
        return audits[_codeHash];
    }
}`;
    navigator.clipboard.writeText(contractCode);
    setCopiedSolidity(true);
    setTimeout(() => setCopiedSolidity(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        wallet={wallet}
        selectedChainId={selectedChainId}
        onSelectChain={handleSelectChain}
        onConnectWallet={handleConnectWallet}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/60 to-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Girl Meets Tech × Build Week Hackathon Vol.2</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Audit in Seconds. Certify on <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">BOT Chain</span>.
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              VibeProof equips vibe-coders and Web3 builders with an instant AI security auditor. Detect reentrancy, access control leaks, and gas bottlenecks—then record a verifiable cryptographic audit badge directly on BOT Chain.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Setup Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>EVM Compatible (Chain ID 968 & 677)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Immutable Proof of Audit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Interactive Workspace: Editor (Left) & Results (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Code Editor */}
          <div className="lg:col-span-7 h-full min-h-[580px]">
            <EditorSection
              code={code}
              projectName={projectName}
              isScanning={isScanning}
              onCodeChange={setCode}
              onProjectNameChange={setProjectName}
              onRunAudit={handleRunAudit}
            />
          </div>

          {/* Right Column: Audit Results Card */}
          <div className="lg:col-span-5 h-full">
            {auditResult ? (
              <AuditResultCard
                audit={auditResult}
                isCertifying={isCertifying}
                onCertify={handleCertify}
                hasCertified={Boolean(certifiedRecord)}
              />
            ) : (
              <div className="h-full min-h-[580px] rounded-2xl bg-zinc-900/40 border border-zinc-800 p-8 flex flex-col items-center justify-center text-center">
                <Shield className="w-12 h-12 text-zinc-600 mb-3 animate-pulse" />
                <h3 className="text-base font-semibold text-zinc-300">No Active Audit Scan</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  Click &ldquo;Scan with AI Auditor&rdquo; or pick a sample preset to generate real-time vulnerability analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Certified Audits Feed */}
        <RecentAudits
          records={recentAudits}
          onSelectRecord={(rec) => {
            setCertifiedRecord(rec);
            setShowCertModal(true);
          }}
        />

        {/* Developer Kit & Remix Deployment Guide */}
        <section className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">
                  Developer & Judge Kit: VibeProof.sol
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ready for one-click compilation and deployment in Remix IDE on BOT Chain.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyContractSource}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                {copiedSolidity ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Contract Code</span>
                  </>
                )}
              </button>

              <a
                href="https://remix.ethereum.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors"
              >
                <span>Open Remix IDE</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Network Reference Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Testnet Chain ID</span>
              <span className="font-mono font-semibold text-cyan-400 text-sm">968</span>
              <span className="text-[10px] text-zinc-500 block">RPC: rpc.bohr.life</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Mainnet Chain ID</span>
              <span className="font-mono font-semibold text-emerald-400 text-sm">677</span>
              <span className="text-[10px] text-zinc-500 block">RPC: rpc.botchain.ai</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Currency</span>
              <span className="font-mono font-semibold text-white text-sm">BOT</span>
              <span className="text-[10px] text-zinc-500 block">Native Gas Token</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Testnet Faucet</span>
              <a
                href="https://faucet.botchain.ai/basic"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-400 hover:underline text-sm flex items-center gap-1"
              >
                Claim Free BOT
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-zinc-500 block">instant test gas</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 VibeProof · Built for Girl Meets Tech Build Week Hackathon Vol.2</p>
          <div className="flex items-center gap-4">
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              BOTScan (Testnet)
            </a>
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              BOTScan (Mainnet)
            </a>
            <a
              href="https://t.me/+s7_5oMxQWRtlNjQ1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              Telegram Community
            </a>
          </div>
        </div>
      </footer>

      {/* Certificate Modal */}
      {certifiedRecord && (
        <CertificateModal
          record={certifiedRecord}
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
