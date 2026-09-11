# 🛡️ VibeProof — Implementation Task & Roadmap
**Event**: Girl Meets Tech × On Chain Consultancy — Build Week Hackathon Vol.2  
**Target Chain**: BOT Chain (Testnet: 968 | Mainnet: 677)  
**Track**: AI + Web3 Verifiable Security Certification  

---

## 🎯 Project Overview
**VibeProof** is an AI-powered smart contract security auditor tailored for "vibe coders" and Web3 developers. Users can paste Solidity code or pick sample contracts $\rightarrow$ AI conducts deep vulnerability analysis (Reentrancy, Access Control, Logic Flaws, Gas Inefficiencies) $\rightarrow$ calculates a Safety Score (0-100) $\rightarrow$ certifies the audit on **BOT Chain** via smart contract $\rightarrow$ produces a verifiable on-chain audit badge with explorer proof.

---

## 📋 Master Task Checklist

### Phase 1: Smart Contract Development & Network Specs (Day 1)
- [x] **Task 1.1: Solidity Smart Contract (`contracts/VibeProof.sol`)**
  - [x] Implement `AuditRecord` struct: `codeHash`, `projectName`, `securityScore`, `auditVerdict`, `reportSummary`, `auditorWallet`, `timestamp`, `exists`.
  - [x] Implement `certifyAudit(...)` function with event emission `AuditIssued`.
  - [x] Implement `getAudit(bytes32 _codeHash)` view function.
  - [x] Implement `getAuditByIndex(uint256 index)` & `getTotalAudits()` for public feed.
  - [x] Add batch querying / latest records retrieval for instant frontend display.
- [x] **Task 1.2: BOT Chain Configuration & ABI Definition**
  - [x] Export contract ABI and address configurations.
  - [x] Map Chain IDs: Testnet (`968` / `0x3C8`), Mainnet (`677` / `0x2A5`).
  - [x] Configure RPC URLs (`https://rpc.bohr.life` & `https://rpc.botchain.ai`) and block explorers (`https://scan.bohr.life` & `https://scan.botchain.ai`).

### Phase 2: Core Architecture & Dependencies Setup
- [x] **Task 2.1: Dependencies Installation**
  - [x] Install `ethers` (v6) for Web3 wallet connection and contract interactions.
- [x] **Task 2.2: TypeScript Interfaces & Data Models (`src/types.ts`)**
  - [x] Define `AuditResult`, `VulnerabilityItem`, `ContractAuditMetadata`, `NetworkConfig`, `WalletState`.
  - [x] Define preset sample contracts for instant judge testing (*Vulnerable Bank / Reentrancy*, *Safe ERC20*, *NFT Certificate*).

### Phase 3: AI Engine & Vulnerability Scanner
- [x] **Task 3.1: Hybrid AI Audit Engine (`src/services/auditEngine.ts`)**
  - [x] Implement deep static analysis rules for instant, zero-latency detection:
    - Reentrancy attacks (`call.value`, external calls before state updates).
    - `tx.origin` vs `msg.sender` authorization flaws.
    - Unchecked return values from low-level calls.
    - Missing access control (`onlyOwner` modifier checks).
    - Integer overflow / pragma version considerations.
    - Floating / outdated compiler pragmas.
  - [x] Connect with Gemini AI endpoint (`/api/audit` or client-side GoogleGenAI instance) with prompt engineering for vulnerability breakdown, line-number pinpointing, and remediation snippets.
  - [x] Automatic fallback to local static scanner if offline / network issue occurs (100% zero-failure guarantee for judges).

### Phase 4: Web3 & BOT Chain Wallet Provider
- [x] **Task 4.1: Web3 Provider & MetaMask Integration (`src/services/web3Service.ts`)**
  - [x] Connect wallet with `ethers.BrowserProvider`.
  - [x] One-click automatic network switch to BOT Chain Testnet or Mainnet (`wallet_addEthereumChain` / `wallet_switchEthereumChain`).
  - [x] Account change and chain change listeners with real-time UI updates.
  - [x] Transaction submission to `certifyAudit` on BOT Chain with status feedback (pending, confirmed, failed).
  - [x] Transaction hash parsing with direct links to `scan.botchain.ai` or `scan.bohr.life`.

### Phase 5: Modern UI/UX Engineering
- [x] **Task 5.1: Navigation Bar & Header (`src/components/Navbar.tsx`)**
  - [x] Brand logo with cyber/security aesthetic.
  - [x] Network indicator badge (BOT Chain Testnet / Mainnet / Unsupported).
  - [x] "Switch to BOT Chain" button if on wrong chain.
  - [x] Connect Wallet button displaying truncated address, BOT balance, and disconnect option.
  - [x] Quick links: Guidebook, BOT Explorer, Faucet, Telegram.
- [x] **Task 5.2: Code Editor & Analysis Input Panel (`src/components/EditorSection.tsx`)**
  - [x] Solidity code input area with line count and clean typography.
  - [x] Preset sample selector pills:
    - 🚨 *Reentrancy Vulnerable Vault*
    - ⚠️ *Insecure Ownership Transfer*
    - 🛡️ *Secure Mintable ERC-20*
  - [x] Real-time SHA-256 / keccak256 code hash computation preview.
  - [x] "Scan with AI Auditor" primary CTA button with animated loading states.
- [x] **Task 5.3: Audit Results & Safety Score Card (`src/components/AuditResultCard.tsx`)**
  - [x] Radial/meter Safety Score display (0 - 100) with color grading (Emerald = Safe, Amber = Warning, Rose = Critical).
  - [x] Severity breakdown counters: Critical, High, Medium, Low, Gas.
  - [x] Vulnerability detail accordion: Title, Line number, Impact explanation, and Fix recommendations.
  - [x] "Certify on BOT Chain" on-chain minting button.
- [x] **Task 5.4: Verifiable On-Chain Certificate Badge (`src/components/CertificateModal.tsx`)**
  - [x] Cryptographic proof card displaying Project Name, Code Hash, Safety Score, Auditor Address, Timestamp, and BOT Chain TX Hash.
  - [x] Direct links to block explorer.
  - [x] Copyable embed badge markdown for GitHub README (e.g., `![VibeProof: 95/100](...)`).
  - [x] 1-Click "Share on X" pre-filled with project details and tagging `@BOTChain_ai`.
- [x] **Task 5.5: Recent On-Chain Audits Feed (`src/components/RecentAudits.tsx`)**
  - [x] List of recent contracts certified on BOT Chain for social proof.

### Phase 6: Testing, Build & Submission Preparation
- [x] **Task 6.1: Code Quality & Compilation**
  - [x] Run `compile_applet` and verify zero TypeScript or bundle errors.
  - [x] Test end-to-end flow: Load preset $\rightarrow$ Run audit $\rightarrow$ Connect wallet $\rightarrow$ Mint certification $\rightarrow$ View explorer link.
- [x] **Task 6.2: Hackathon Deliverables Kit**
  - [x] Formulate complete `README.md` with deployment instructions, contract addresses, and architecture guide.
  - [x] Prepare script/template for the X (Twitter) video demo and post tagging `@BOTChain_ai`.
  - [x] Prepare custom domain deployment guide ($1-$1.50 reimbursement instructions).

---

## 📅 Execution Schedule
- **Step 1**: Install `ethers` & initialize `TASK.md`.
- **Step 2**: Create `VibeProof.sol` contract file and configuration parameters.
- **Step 3**: Implement types, hybrid AI audit engine, and Web3 integration service.
- **Step 4**: Build full responsive UI components with modern dark cyber theme.
- **Step 5**: Test build, verify zero errors, and prepare submission checklist.
