# 🛡️ VibeProof — Implementation Task & Roadmap
**Event**: Girl Meets Tech × On Chain Consultancy — Build Week Hackathon Vol.2  
**Target Chain**: BOT Chain (Testnet: 968 | Mainnet: 677)  
**Track**: AI + Web3 Verifiable Security Certification  

---

## 🎯 Project Overview
**VibeProof** is an AI-powered smart contract security auditor tailored for "vibe coders" and Web3 developers. Users can paste Solidity code or pick sample contracts $\rightarrow$ AI conducts deep vulnerability analysis (Reentrancy, Access Control, Logic Flaws, Gas Inefficiencies) $\rightarrow$ calculates a Safety Score (0-100) $\rightarrow$ certifies the audit on **BOT Chain** via smart contract $\rightarrow$ produces a verifiable on-chain audit badge with explorer proof.

---

## 📋 Master Task Checklist

> 💡 **Workflow Note**:
> - **Frontend Mockup**: Desain dan kode mockup statis dibuat oleh **AI Agent milik User** (`MOCKUP.html`).
> - **Porting & Integration**: Telah berhasil di-porting sepenuhnya ke tech stack utama (React 19 + TypeScript + Vite + Tailwind CSS v4) serta diintegrasikan dengan logic mesin audit AI, Web3 (MetaMask/Ethers.js), dan smart contract BOT Chain.

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
  - [x] Configure RPC URLs (`https://testnet-rpc.botchain.ai` & `https://rpc.botchain.ai`) and block explorers (`https://testnet-scan.botchain.ai` & `https://scan.botchain.ai`).

### Phase 2: Core Architecture & Dependencies Setup
- [x] **Task 2.1: Dependencies Installation**
  - [x] Install `ethers` (v6) for Web3 wallet connection and contract interactions.
- [x] **Task 2.2: TypeScript Interfaces & Data Models (`src/types.ts`)**
  - [x] Define `AuditReportData`, `FindingItem`, `CertifiedProof`, `NetworkInfo`, `WalletAccount`, `NetworkConfig`.
  - [x] Define preset sample contracts for instant judge testing (*Vulnerable Ether Vault*, *Insecure Token Registry*, *Certified Safe Vault*).

### Phase 3: AI Engine & Vulnerability Scanner (OWASP Top 10 2026 Alignment)
- [x] **Task 3.1: OWASP Smart Contract Rules Dictionary (`src/data/owaspRules.ts`)**
  - [x] Define standard taxonomy for OWASP SC Top 10 (2026 Edition):
    - `SC01:2026` — Access Control Flaws (Top financial loss category, missing modifiers, tx.origin).
    - `SC02:2026` — Business Logic Flaws (Reward draining, state transition inconsistency).
    - `SC03:2026` — Price Oracle Manipulation (Spot AMM reserve reliance, TWAP absence).
    - `SC04:2026` — Flash Loan–Facilitated Attacks (Single-transaction liquidity amplification).
    - `SC05:2026` — Lack of Input Validation (Zero-address checks, array length mismatch).
    - `SC06:2026` — Unchecked External Calls (Unsafe call/send return value handling).
    - `SC07:2026` — Arithmetic Errors & Precision Loss (Division before multiplication, share rounding).
    - `SC08:2026` — Reentrancy Attacks (State changes after external calls, cross-function reentrancy).
    - `SC09:2026` — Integer Overflow & Underflow (Legacy pragmas <0.8.0, unchecked block misuse).
    - `SC10:2026` — Proxy & Upgradeability Flaws (Uninitialized implementations, storage collisions).
- [x] **Task 3.2: Hybrid AI Audit Engine (`src/services/auditEngine.ts`)**
  - [x] Implement deep static analysis rules mapped directly to OWASP categories.
  - [x] Enrich vulnerability output with `owaspId`, `severity`, `cwe`, remediation guide, and safe code snippets.
  - [x] Connect with deterministic Keccak-256 calculation and dynamic score generation.
  - [x] Automatic fallback to local static scanner if offline / network issue occurs (100% zero-failure guarantee for judges).

### Phase 4: Web3 & BOT Chain Wallet Provider
- [x] **Task 4.1: Web3 Provider & MetaMask Integration (`src/services/web3Service.ts`)**
  - [x] Connect wallet with `ethers.BrowserProvider`.
  - [x] One-click automatic network switch to BOT Chain Testnet or Mainnet (`wallet_addEthereumChain` / `wallet_switchEthereumChain`).
  - [x] Account change and chain change listeners with real-time UI updates.
  - [x] Transaction submission to `certifyAudit` on BOT Chain with status feedback (pending, confirmed, failed).
  - [x] Transaction hash parsing with direct links to `scan.botchain.ai` or `testnet-scan.botchain.ai`.

### Phase 5: Modern UI/UX Engineering (Porting Mockup dari AI Agent User)
- [x] **Task 5.1: Review & Cleanse Mockup Statis dari AI Agent User**
  - [x] Inspect file markup, style, layout structure, and design tokens dari AI Agent (`MOCKUP.html`).
- [x] **Task 5.2: Porting Component Structure ke React + Tailwind**
  - [x] Navigation Bar & BOT Chain Network Selector (`src/components/Navbar.tsx`).
  - [x] Hero section with Hackathon badges, stats, and CTAs (`src/components/Hero.tsx`).
  - [x] Code Editor & Sample Contract Presets Section (`src/components/SolidityEditor.tsx`).
  - [x] Audit Results & Interactive Safety Score Meter with SVG radial gauge (`src/components/AuditReport.tsx`).
  - [x] OWASP Top 10 Compliance Matrix (10 indicator badges / categories coverage).
  - [x] Verifiable On-Chain Certificate Modal & Share Badges (`src/components/CertificateModal.tsx`).
  - [x] Public On-Chain Audits Feed (`src/components/RecentAudits.tsx`).
  - [x] Developer & Judge Reference Card with one-click RPC parameter copies (`src/components/ReferenceCard.tsx`).
  - [x] Toast notification system (`src/components/ToastContainer.tsx`).
- [x] **Task 5.3: Wiring Up Dynamic Logic & State Management**
  - [x] Hubungkan UI dengan Web3 service (Connect MetaMask, switch chain, balance).
  - [x] Hubungkan UI dengan AI audit scanner (real-time keccak256, run scan, display results).
  - [x] Hubungkan UI dengan smart contract certification (`certifyAudit`, modal pop-up, explorer link).

### Phase 6: Testing, Build & Submission Preparation
- [x] **Task 6.1: Code Quality & Compilation**
  - [x] Run `lint_applet` and verify zero TypeScript or bundle errors.
  - [x] Run `compile_applet` and verify successful production build.
  - [x] Test end-to-end flow: Load preset $\rightarrow$ Run audit $\rightarrow$ Connect wallet $\rightarrow$ Mint certification $\rightarrow$ View explorer link.
- [ ] **Task 6.2: Hackathon Deliverables Kit**
  - [ ] Formulate complete `README.md` with deployment instructions, contract addresses, and architecture guide.
  - [ ] Prepare script/template for the X (Twitter) video demo and post tagging `@BOTChain_ai`.
  - [ ] Prepare custom domain deployment guide ($1-$1.50 reimbursement instructions).
