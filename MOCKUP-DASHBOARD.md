<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>VibeProof Dashboard — Audit Portfolio & On-Chain Certificates on BOT Chain</title>
<meta name="description" content="Dashboard VibeProof: pantau portfolio audit smart contract, security score, sertifikat on-chain, dan verifikasi proof via VibeProof.sol di BOT Chain (Testnet 968 / Mainnet 677)." />

<!-- Fonts: Fontsource CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/plus-jakarta-sans/index.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono/index.css" />

<!-- Tailwind CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink:   { 950:'#07080c', 900:'#090a0f', 850:'#0c0e14', 800:'#0f1117', 700:'#141720', 600:'#181b23', 500:'#1f232e' },
        cyber: { DEFAULT:'#00F0FF', 600:'#06b6d4', 700:'#0e7490' },
        safe:  '#10b981',
        warn:  '#f59e0b',
        crit:  '#f43f5e'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"','Plus Jakarta Sans','Inter','system-ui','sans-serif'],
        mono: ['"JetBrains Mono Variable"','JetBrains Mono','ui-monospace','SFMono-Regular','monospace']
      },
      boxShadow: {
        'glow-cyber': '0 0 0 1px rgba(0,240,255,.30), 0 0 28px -6px rgba(0,240,255,.50)',
        'glow-safe' : '0 0 0 1px rgba(16,185,129,.35), 0 0 28px -6px rgba(16,185,129,.50)',
        'glow-crit' : '0 0 0 1px rgba(244,63,94,.35), 0 0 28px -6px rgba(244,63,94,.45)'
      }
    }
  }
}
</script>

<style>
  :root { color-scheme: dark; }
  ::selection { background: rgba(0,240,255,.25); color: #e4feff; }

  .scroll-thin::-webkit-scrollbar { width: 8px; height: 8px; }
  .scroll-thin::-webkit-scrollbar-thumb { background: #262a35; border-radius: 8px; }
  .scroll-thin::-webkit-scrollbar-thumb:hover { background: #343a48; }
  .scroll-thin::-webkit-scrollbar-track { background: transparent; }

  .glass { background: rgba(9,10,15,.72); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
  .grid-lines {
    background-image:
      linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
    background-size: 44px 44px;
  }
  .dash-bg {
    background-image: url('https://image.qwenlm.ai/public_source/fd9e50b2-dd67-4b96-aeb8-ca7c2ba7dd2d/155619159-0b65-447a-91d9-ab8842613436.png');
    background-size: cover; background-position: center;
  }
  .mask-fade-b { -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 100%); mask-image: linear-gradient(to bottom, black 30%, transparent 100%); }

  @keyframes pulseDot { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.55);} 70% { box-shadow: 0 0 0 7px rgba(16,185,129,0);} }
  .dot-live { animation: pulseDot 2s infinite; }
  @keyframes spin360 { to { transform: rotate(360deg);} }
  .spin { animation: spin360 .9s linear infinite; }
  @keyframes riseIn { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
  .rise-in { animation: riseIn .45s cubic-bezier(.22,1,.36,1) both; }
  @keyframes floaty { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-5px);} }
  .floaty { animation: floaty 5s ease-in-out infinite; }

  .btn-cyber { transition: box-shadow .25s ease, transform .15s ease, background-color .2s ease, border-color .2s ease; }
  .btn-cyber:hover { box-shadow: 0 0 0 1px rgba(0,240,255,.45), 0 0 34px -6px rgba(0,240,255,.55); transform: translateY(-1px); }
  .btn-cyber:active { transform: translateY(0); }

  .chip { white-space: nowrap; }

  .nav-item { transition: background-color .18s ease, color .18s ease, border-color .18s ease; }
  .nav-item.active { background: rgba(0,240,255,.08); color: #00F0FF; border-color: rgba(0,240,255,.35); }

  .tbl th { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #71717a; font-weight: 700; }
  .tbl td { border-top: 1px solid rgba(39,39,42,.7); }
  .tbl tbody tr { transition: background-color .15s ease; }
  .tbl tbody tr:hover { background: rgba(24,27,35,.6); }

  .console-line { animation: riseIn .3s ease both; }

  #chartTip { pointer-events: none; transition: opacity .15s ease, transform .1s ease; }

  .cert-frame { background:
      radial-gradient(120% 90% at 50% 0%, rgba(0,240,255,.10), transparent 55%),
      linear-gradient(180deg, #10131b, #0b0d13); }
</style>
</head>

<body class="bg-ink-900 text-zinc-300 font-sans antialiased min-h-screen">

<div id="scrollProgress" class="fixed top-0 left-0 h-[2px] w-0 z-[60] bg-gradient-to-r from-cyber via-cyber-600 to-safe"></div>

<!-- ══════════════════ STICKY HEADER ══════════════════ -->
<header class="sticky top-0 z-50 glass border-b border-zinc-800/80">
  <nav class="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3" aria-label="Navigasi dashboard">
    <button id="sidebarToggle" class="lg:hidden h-10 w-10 grid place-items-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white" aria-label="Buka sidebar">
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>

    <a href="#" class="flex items-center gap-2.5 shrink-0 group">
      <span class="relative grid place-items-center w-9 h-9 rounded-xl border border-cyber/40 bg-cyber/10">
        <svg viewBox="0 0 24 24" class="w-5 h-5 text-cyber" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.5 4.5 5.6v5.2c0 4.7 3.2 8.6 7.5 10.7 4.3-2.1 7.5-6 7.5-10.7V5.6L12 2.5Z"/>
          <path d="m9 11.8 2.2 2.2L15.4 9.6"/>
        </svg>
        <span class="absolute inset-0 rounded-xl shadow-glow-cyber opacity-0 group-hover:opacity-100 transition-opacity"></span>
      </span>
      <span class="text-lg font-extrabold tracking-tight text-white">Vibe<span class="text-cyber">Proof</span></span>
      <span class="chip hidden sm:inline-flex items-center h-6 px-2.5 rounded-full border border-zinc-700 bg-ink-800 text-zinc-300 text-[10px] font-bold tracking-widest uppercase">Dashboard</span>
    </a>

    <!-- global search -->
    <label class="relative hidden md:block flex-1 max-w-md mx-2">
      <span class="sr-only">Cari kontrak atau hash</span>
      <svg viewBox="0 0 24 24" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/></svg>
      <input id="globalSearch" placeholder="Cari kontrak, code hash, atau TX…  ( / )"
             class="w-full h-10 pl-9 pr-3 rounded-lg bg-ink-800 border border-zinc-800 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-cyber/60 focus:outline-none focus:ring-1 focus:ring-cyber/40 transition-colors" />
    </label>

    <div class="flex-1 md:hidden"></div>

    <!-- network switcher -->
    <div class="flex items-center rounded-full border border-zinc-800 bg-ink-800 p-1" role="group" aria-label="Pilih jaringan BOT Chain">
      <button data-net="testnet" class="net-btn chip h-8 px-3 rounded-full text-xs font-semibold transition-colors">Testnet (968)</button>
      <button data-net="mainnet" class="net-btn chip h-8 px-3 rounded-full text-xs font-semibold transition-colors">Mainnet (677)</button>
    </div>

    <!-- wallet -->
    <button id="walletBtn" class="chip h-10 px-4 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors inline-flex items-center gap-2">
      <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1"/><path d="M3 7.5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5.5A2.5 2.5 0 0 1 3 7.5Z"/><circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none"/></svg>
      <span id="walletLabel">Connect MetaMask</span>
    </button>

    <a href="index.html" class="btn-cyber chip hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-cyber text-ink-900 text-xs font-extrabold">
      <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      New Scan
    </a>
  </nav>
</header>

<div class="max-w-[1600px] mx-auto flex">

  <!-- ══════════════════ SIDEBAR ══════════════════ -->
  <div id="sidebarBackdrop" class="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm hidden lg:hidden"></div>
  <aside id="sidebar" class="fixed lg:sticky z-[56] lg:z-0 top-16 lg:top-16 left-0 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-zinc-800 bg-ink-850 -translate-x-full lg:translate-x-0 transition-transform duration-300 flex flex-col overflow-y-auto scroll-thin">
    <nav class="p-3 space-y-1" aria-label="Menu dashboard">
      <button data-view="overview" class="nav-item active w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700">
        <svg viewBox="0 0 24 24" class="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/></svg>
        Overview
      </button>
      <button data-view="audits" class="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>
        My Audits
        <span id="navAuditCount" class="ml-auto chip h-5 px-2 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400">0</span>
      </button>
      <button data-view="certificates" class="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5.5"/><path d="m8.8 13.5-1.6 7 4.8-2.6 4.8 2.6-1.6-7"/></svg>
        Certificates
        <span id="navCertCount" class="ml-auto chip h-5 px-2 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400">0</span>
      </button>
      <button data-view="verify" class="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z"/><path d="m9.5 11.6 1.8 1.8 3.4-3.6"/></svg>
        Verify Proof
      </button>
      <button data-view="contract" class="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v5h5"/><path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="m10 12-2 2.5L10 17M14 12l2 2.5L14 17"/></svg>
        VibeProof.sol
      </button>

      <p class="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">External</p>
      <a href="index.html" class="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/><path d="M11 8v6M8 11h6"/></svg>
        Audit Studio
      </a>
      <a id="sideExplorer" href="https://scan.bohr.life" target="_blank" rel="noopener" class="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
        BOTScan Explorer
      </a>
      <a href="https://t.me/BOTChain_ai" target="_blank" rel="noopener" class="nav-item w-full h-11 px-3 rounded-lg border border-transparent flex items-center gap-3 text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-ink-700">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor"><path d="M21.9 4.6 19 19.3c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.6 7c.4-.3-.1-.5-.6-.2L7.7 13.3l-4.4-1.4c-1-.3-1-1 .2-1.4l17.2-6.6c.8-.3 1.5.2 1.2 1.7Z"/></svg>
        Telegram Community
      </a>
    </nav>

    <div class="mt-auto p-3 space-y-3">
      <!-- contract mini card -->
      <div class="rounded-xl border border-zinc-800 bg-ink-800 p-3">
        <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">VibeProof.sol</p>
        <p id="sideAddr" class="font-mono text-[10.5px] text-cyber break-all">0x97E0…F578</p>
        <div class="mt-2 flex items-center gap-1.5">
          <span class="chip h-5 px-2 inline-flex items-center rounded-full bg-safe/10 border border-safe/40 text-safe text-[9px] font-extrabold tracking-widest uppercase">Verified</span>
          <span class="chip h-5 px-2 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[9px] text-zinc-400">solc ^0.8.20</span>
        </div>
      </div>
      <!-- chain health -->
      <div class="rounded-xl border border-zinc-800 bg-ink-800 p-3 font-mono text-[10.5px]">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-safe dot-live"></span>
          <span id="sideNetName" class="text-zinc-300 font-bold">BOT Chain Testnet</span>
        </div>
        <div class="mt-2 space-y-1 text-zinc-500">
          <div class="flex justify-between"><span>Chain ID</span><span id="sideChainId" class="text-zinc-300">968</span></div>
          <div class="flex justify-between"><span>Block</span><span id="sideBlock" class="text-cyber">#3,412,880</span></div>
          <div class="flex justify-between"><span>Gas</span><span class="text-zinc-300">1.2 gwei</span></div>
          <div class="flex justify-between"><span>RPC</span><span id="sideRpcPing" class="text-safe">182ms</span></div>
        </div>
      </div>
    </div>
  </aside>

  <!-- ══════════════════ MAIN ══════════════════ -->
  <main class="flex-1 min-w-0 px-4 sm:px-6 py-6">

    <!-- ─────────── VIEW: OVERVIEW ─────────── -->
    <section id="view-overview" class="space-y-5">
      <!-- banner -->
      <div class="relative overflow-hidden rounded-2xl border border-zinc-800">
        <div class="absolute inset-0 dash-bg opacity-40" aria-hidden="true"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-ink-900/30" aria-hidden="true"></div>
        <div class="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="flex-1 min-w-0">
            <p class="chip inline-flex items-center gap-2 h-7 px-3 rounded-full border border-cyber/40 bg-cyber/10 text-cyber text-[10px] font-extrabold tracking-widest uppercase">
              <span class="w-1.5 h-1.5 rounded-full bg-cyber dot-live"></span> Track: AI + Verifiable Security Certification
            </p>
            <h1 class="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Audit Command Center</h1>
            <p class="mt-2 text-sm text-zinc-400 max-w-xl leading-relaxed">
              Pantau seluruh portfolio audit vibe-coded Anda, security score, dan sertifikat on-chain yang tercatat permanen di <span class="text-zinc-200 font-semibold">VibeProof.sol</span> — BOT Chain Testnet & Mainnet.
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <button id="bannerCopyAddr" class="chip h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-ink-800/80 font-mono text-[11px] text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors">
                <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>
                <span id="bannerAddr">0x97E0…F578</span>
              </button>
              <span class="chip h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-ink-800/80 font-mono text-[11px] text-zinc-400">Girl Meets Tech × On Chain Consultancy · Vol.2</span>
            </div>
          </div>
          <div class="flex lg:flex-col gap-3 shrink-0">
            <a href="index.html" class="btn-cyber chip h-12 px-6 rounded-xl bg-cyber text-ink-900 text-sm font-extrabold inline-flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/></svg>
              Certify New Contract
            </a>
            <button id="bannerVerifyBtn" class="chip h-12 px-6 rounded-xl border border-zinc-700 bg-ink-800/80 text-sm font-semibold text-zinc-200 hover:border-cyber/50 hover:text-cyber transition-colors inline-flex items-center justify-center gap-2">
              Verify a Proof
            </button>
          </div>
        </div>
      </div>

      <!-- KPI cards -->
      <div id="kpiGrid" class="grid grid-cols-2 xl:grid-cols-5 gap-4"></div>

      <!-- charts -->
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 rounded-2xl border border-zinc-800 bg-ink-800 p-5">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <h3 class="text-sm font-bold text-white">Security Score Trend</h3>
            <span class="chip h-6 px-2.5 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400">14 hari terakhir</span>
            <span class="flex-1"></span>
            <span class="chip inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-500"><span class="w-2 h-2 rounded-full bg-cyber"></span> avg score</span>
            <span class="chip inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-500"><span class="w-2 h-2 rounded-full bg-safe/70"></span> audits</span>
          </div>
          <div id="trendWrap" class="relative">
            <svg id="trendChart" viewBox="0 0 640 220" class="w-full h-auto"></svg>
            <div id="chartTip" class="absolute opacity-0 rounded-lg border border-zinc-700 bg-ink-900/95 px-3 py-2 font-mono text-[10.5px] text-zinc-200 shadow-lg"></div>
          </div>
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-ink-800 p-5">
          <h3 class="text-sm font-bold text-white mb-4">Severity Distribution</h3>
          <div class="flex items-center gap-5">
            <div class="relative shrink-0">
              <svg id="donutChart" viewBox="0 0 140 140" class="w-36 h-36"></svg>
              <div class="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div id="donutTotal" class="font-mono text-2xl font-extrabold text-white">0</div>
                  <div class="text-[9px] uppercase tracking-widest text-zinc-500">findings</div>
                </div>
              </div>
            </div>
            <ul id="donutLegend" class="flex-1 space-y-2.5 font-mono text-[11px]"></ul>
          </div>
          <div class="mt-5 rounded-lg border border-zinc-800 bg-ink-850 px-3.5 py-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Top Risky Contracts</p>
            <ul id="topRisky" class="space-y-2.5"></ul>
          </div>
        </div>
      </div>

      <!-- recent + activity -->
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
          <div class="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
            <h3 class="text-sm font-bold text-white">Recent Audits</h3>
            <span class="flex-1"></span>
            <button data-goto="audits" class="goto-btn chip h-8 px-3 rounded-lg border border-zinc-700 text-[11px] font-bold text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors">View all →</button>
          </div>
          <div class="overflow-x-auto scroll-thin">
            <table class="tbl w-full text-left font-mono text-[11.5px]">
              <thead><tr class="bg-ink-850"><th class="px-5 py-2.5">Contract</th><th class="px-3 py-2.5">Score</th><th class="px-3 py-2.5">Verdict</th><th class="px-3 py-2.5 hidden sm:table-cell">TX</th><th class="px-5 py-2.5 text-right">Time</th></tr></thead>
              <tbody id="recentTbody"></tbody>
            </table>
          </div>
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-ink-800 p-5">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-1.5 h-1.5 rounded-full bg-safe dot-live"></span>
            <h3 class="text-sm font-bold text-white">AuditIssued Events</h3>
          </div>
          <ol id="activityList" class="relative border-l border-zinc-800 ml-2 space-y-5"></ol>
        </div>
      </div>
    </section>

    <!-- ─────────── VIEW: MY AUDITS ─────────── -->
    <section id="view-audits" class="space-y-4 hidden">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-xl font-extrabold text-white tracking-tight">My Audits</h2>
        <span id="auditsCountLabel" class="chip h-7 px-3 inline-flex items-center rounded-full border border-zinc-800 bg-ink-800 font-mono text-[11px] text-zinc-400">0 records</span>
        <span class="flex-1"></span>
        <div class="flex flex-wrap items-center gap-2">
          <button data-filter="all"      class="filter-chip chip h-9 px-3.5 rounded-full border border-cyber/50 bg-cyber/10 text-cyber text-[11px] font-bold">All</button>
          <button data-filter="safe"     class="filter-chip chip h-9 px-3.5 rounded-full border border-zinc-700 bg-ink-800 text-zinc-400 text-[11px] font-bold hover:border-safe/60">Safe</button>
          <button data-filter="warn"     class="filter-chip chip h-9 px-3.5 rounded-full border border-zinc-700 bg-ink-800 text-zinc-400 text-[11px] font-bold hover:border-warn/60">Warning</button>
          <button data-filter="crit"     class="filter-chip chip h-9 px-3.5 rounded-full border border-zinc-700 bg-ink-800 text-zinc-400 text-[11px] font-bold hover:border-crit/60">Critical</button>
          <select id="sortSelect" class="chip h-9 px-3 rounded-lg bg-ink-800 border border-zinc-800 font-mono text-[11px] text-zinc-300 focus:border-cyber/60 focus:outline-none">
            <option value="newest">Newest first</option>
            <option value="score-desc">Score: high → low</option>
            <option value="score-asc">Score: low → high</option>
          </select>
        </div>
      </div>

      <div class="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
        <div class="overflow-x-auto scroll-thin">
          <table class="tbl w-full text-left font-mono text-[11.5px]">
            <thead><tr class="bg-ink-850">
              <th class="px-5 py-3">Contract</th><th class="px-3 py-3">Score</th><th class="px-3 py-3">Verdict</th>
              <th class="px-3 py-3 hidden md:table-cell">Issues C/H/M/L</th><th class="px-3 py-3 hidden lg:table-cell">Code Hash</th>
              <th class="px-3 py-3 hidden sm:table-cell">TX</th><th class="px-3 py-3 hidden lg:table-cell">Time</th><th class="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody id="auditsTbody"></tbody>
          </table>
        </div>
        <div id="auditsEmpty" class="hidden px-6 py-16 text-center">
          <p class="text-4xl">🔍</p>
          <h4 class="mt-3 text-base font-bold text-zinc-200">Tidak ada audit yang cocok</h4>
          <p class="mt-1.5 text-sm text-zinc-500">Coba ubah kata kunci pencarian atau filter severity.</p>
        </div>
      </div>
    </section>

    <!-- ─────────── VIEW: CERTIFICATES ─────────── -->
    <section id="view-certificates" class="space-y-4 hidden">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-xl font-extrabold text-white tracking-tight">On-Chain Certificates</h2>
        <span class="chip h-7 px-3 inline-flex items-center rounded-full border border-safe/40 bg-safe/10 text-safe text-[11px] font-bold">minted via certifyAudit()</span>
        <span class="flex-1"></span>
        <span id="certCountLabel" class="chip h-7 px-3 inline-flex items-center rounded-full border border-zinc-800 bg-ink-800 font-mono text-[11px] text-zinc-400">0 certificates</span>
      </div>
      <div id="certGrid" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"></div>
      <div id="certEmpty" class="hidden rounded-2xl border border-dashed border-zinc-700 px-6 py-16 text-center">
        <p class="text-4xl">🏅</p>
        <h4 class="mt-3 text-base font-bold text-zinc-200">Belum ada sertifikat di jaringan ini</h4>
        <p class="mt-1.5 text-sm text-zinc-500">Jalankan scan di Audit Studio lalu mint proof on-chain.</p>
        <a href="index.html" class="chip mt-5 h-11 px-5 inline-flex items-center rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors">Buka Audit Studio →</a>
      </div>
    </section>

    <!-- ─────────── VIEW: VERIFY PROOF ─────────── -->
    <section id="view-verify" class="space-y-4 hidden max-w-3xl">
      <div>
        <h2 class="text-xl font-extrabold text-white tracking-tight">Verify On-Chain Proof</h2>
        <p class="mt-1.5 text-sm text-zinc-500">Query langsung ke <code class="font-mono text-cyber">VibeProof.getAudit(bytes32)</code> — bukti audit tidak dapat dipalsukan karena tercatat permanen di BOT Chain.</p>
      </div>

      <div class="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
        <div class="flex border-b border-zinc-800 bg-ink-850">
          <button id="vtabHash" class="vtab chip h-11 px-5 text-xs font-bold text-cyber border-b-2 border-cyber -mb-px">By Code Hash</button>
          <button id="vtabSrc"  class="vtab chip h-11 px-5 text-xs font-bold text-zinc-500 border-b-2 border-transparent -mb-px hover:text-zinc-300">By Solidity Source</button>
        </div>

        <div class="p-5">
          <div id="vpaneHash" class="space-y-4">
            <label class="block">
              <span class="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Code Hash (bytes32)</span>
              <input id="verifyInput" spellcheck="false" placeholder="0x8f3a…e8f"
                     class="mt-1.5 w-full h-11 px-3.5 rounded-lg bg-ink-900 border border-zinc-800 font-mono text-xs text-zinc-200 focus:border-cyber/60 focus:outline-none focus:ring-1 focus:ring-cyber/40 transition-colors" />
            </label>
            <div class="flex flex-wrap gap-2">
              <span class="chip h-8 px-2.5 inline-flex items-center text-[10px] text-zinc-600">Contoh:</span>
              <button class="sample-hash chip h-8 px-3 rounded-lg border border-zinc-700 bg-ink-700 font-mono text-[10.5px] text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors"></button>
              <button class="sample-hash chip h-8 px-3 rounded-lg border border-zinc-700 bg-ink-700 font-mono text-[10.5px] text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors"></button>
              <button class="sample-hash chip h-8 px-3 rounded-lg border border-zinc-700 bg-ink-700 font-mono text-[10.5px] text-zinc-300 hover:border-cyber/60 hover:text-cyber transition-colors"></button>
            </div>
          </div>

          <div id="vpaneSrc" class="space-y-4 hidden">
            <label class="block">
              <span class="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Tempel Solidity Source</span>
              <textarea id="verifySrc" rows="7" spellcheck="false" placeholder="// paste contract source…"
                        class="code-input scroll-thin mt-1.5 w-full resize-y rounded-lg bg-ink-900 border border-zinc-800 px-3.5 py-3 font-mono text-[11.5px] leading-5 text-zinc-300 focus:border-cyber/60 focus:outline-none whitespace-pre"></textarea>
            </label>
            <p class="font-mono text-[11px] text-zinc-500">Keccak-256 (deterministic): <span id="verifySrcHash" class="text-cyber break-all">0x…</span></p>
          </div>

          <button id="verifyBtn" class="btn-cyber chip w-full h-12 rounded-xl bg-cyber text-ink-900 text-sm font-extrabold inline-flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z"/><path d="m9.5 11.6 1.8 1.8 3.4-3.6"/></svg>
            Verify On-Chain
          </button>
        </div>

        <div id="verifyConsole" class="hidden border-t border-zinc-800 bg-ink-900 px-5 py-4 font-mono text-[11px] leading-6 text-zinc-500"></div>
      </div>

      <div id="verifyResult" class="hidden"></div>
    </section>

    <!-- ─────────── VIEW: CONTRACT ─────────── -->
    <section id="view-contract" class="space-y-4 hidden">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-xl font-extrabold text-white tracking-tight">VibeProof.sol — Deployment & ABI</h2>
        <span class="chip h-7 px-3 inline-flex items-center rounded-full border border-safe/40 bg-safe/10 text-safe text-[10px] font-extrabold tracking-widest uppercase">Verified on BOTScan</span>
      </div>

      <!-- deployment + params -->
      <div class="grid lg:grid-cols-2 gap-4">
        <div class="rounded-2xl border border-zinc-800 bg-ink-800 p-5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Deployment</p>
          <div class="flex items-start gap-3">
            <span class="grid place-items-center w-10 h-10 rounded-lg border border-cyber/40 bg-cyber/10 shrink-0">
              <svg viewBox="0 0 24 24" class="w-5 h-5 text-cyber" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v5h5"/><path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/></svg>
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-mono text-[12.5px] font-bold text-white break-all">0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578</p>
              <p class="mt-1 font-mono text-[10.5px] text-zinc-500">Solidity ^0.8.20 · MIT · optimizer 200 runs · identical address on both networks</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button id="copyAddrBtn" class="chip h-9 px-3 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors">Copy Address</button>
                <a id="explorerAddrLink" href="https://scan.bohr.life/address/0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578" target="_blank" rel="noopener" class="chip h-9 px-3 inline-flex items-center rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors">View on BOTScan ↗</a>
              </div>
            </div>
          </div>
          <dl class="mt-5 space-y-2 font-mono text-[11px] border-t border-zinc-800 pt-4">
            <div class="flex gap-3"><dt class="w-28 shrink-0 text-zinc-500">Testnet (968)</dt><dd class="text-zinc-300">rpc.bohr.life · scan.bohr.life</dd></div>
            <div class="flex gap-3"><dt class="w-28 shrink-0 text-zinc-500">Mainnet (677)</dt><dd class="text-zinc-300">rpc.botchain.ai · scan.botchain.ai</dd></div>
            <div class="flex gap-3"><dt class="w-28 shrink-0 text-zinc-500">Gas Token</dt><dd class="text-zinc-300">BOT · faucet: faucet.botchain.ai/basic</dd></div>
          </dl>
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-ink-800 p-5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">README Badges</p>
          <div class="flex flex-wrap gap-2">
            <span class="chip inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-cyber/50 bg-cyber/10 text-cyber text-[11px] font-extrabold">⛓ BOT Chain · Testnet & Mainnet</span>
            <span class="chip inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-safe/50 bg-safe/10 text-safe text-[11px] font-extrabold">👩‍💻 Girl Meets Tech · Build Week Vol.2</span>
            <span class="chip inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-warn/50 bg-warn/10 text-warn text-[11px] font-extrabold">⚖ License · MIT</span>
          </div>
          <button id="copyBadgeMd" class="chip mt-4 h-9 px-3.5 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors">Copy Badge Markdown</button>

          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-6 mb-3">Local Development</p>
          <div class="space-y-2">
            <div class="flex items-center gap-2 rounded-lg border border-zinc-800 bg-ink-900 px-3 py-2 font-mono text-[11px] text-zinc-300"><span class="text-cyber">$</span><span class="flex-1 truncate">git clone https://github.com/yourusername/vibeproof.git && cd vibeproof</span><button class="copy-cmd text-zinc-600 hover:text-cyber" data-cmd="git clone https://github.com/yourusername/vibeproof.git && cd vibeproof">⧉</button></div>
            <div class="flex items-center gap-2 rounded-lg border border-zinc-800 bg-ink-900 px-3 py-2 font-mono text-[11px] text-zinc-300"><span class="text-cyber">$</span><span class="flex-1 truncate">npm install</span><button class="copy-cmd text-zinc-600 hover:text-cyber" data-cmd="npm install">⧉</button></div>
            <div class="flex items-center gap-2 rounded-lg border border-zinc-800 bg-ink-900 px-3 py-2 font-mono text-[11px] text-zinc-300"><span class="text-cyber">$</span><span class="flex-1 truncate">npm run dev</span><button class="copy-cmd text-zinc-600 hover:text-cyber" data-cmd="npm run dev">⧉</button></div>
            <div class="flex items-center gap-2 rounded-lg border border-zinc-800 bg-ink-900 px-3 py-2 font-mono text-[11px] text-zinc-300"><span class="text-cyber">$</span><span class="flex-1 truncate">npm run build</span><button class="copy-cmd text-zinc-600 hover:text-cyber" data-cmd="npm run build">⧉</button></div>
          </div>
        </div>
      </div>

      <!-- functions -->
      <div class="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-800 bg-ink-850 flex items-center gap-3">
          <h3 class="text-sm font-bold text-white">Contract Functions</h3>
          <span class="chip h-6 px-2.5 inline-flex items-center rounded-full bg-ink-700 border border-zinc-800 font-mono text-[10px] text-zinc-400">4 functions · 1 event</span>
          <span class="flex-1"></span>
          <button id="copyAbiBtn" class="chip h-8 px-3 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors">Copy ABI</button>
        </div>
        <div id="fnList" class="divide-y divide-zinc-800/80"></div>
        <div id="fnConsole" class="hidden border-t border-zinc-800 bg-ink-900 px-5 py-4 font-mono text-[11px] leading-6 text-zinc-500"></div>
      </div>
    </section>

  </main>
</div>

<!-- ══════════════════ FOOTER ══════════════════ -->
<footer class="border-t border-zinc-800 bg-ink-850 mt-8">
  <div class="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex flex-wrap items-center gap-3 font-mono text-[11px] text-zinc-600">
    <span>© 2025 VibeProof · Built for Girl Meets Tech × On Chain Consultancy — Build Week Hackathon Vol.2</span>
    <span class="flex-1"></span>
    <span class="chip hidden sm:inline">VibeProof.sol @ BOT Chain 968 / 677 · gas: BOT</span>
  </div>
</footer>

<!-- ══════════════════ CERTIFICATE MODAL ══════════════════ -->
<div id="certModal" class="fixed inset-0 z-[70] hidden" role="dialog" aria-modal="true" aria-label="Sertifikat audit on-chain">
  <div id="certBackdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
  <div class="absolute inset-0 overflow-y-auto scroll-thin p-4 sm:p-8 grid place-items-center">
    <div id="certPanel" class="relative w-full max-w-lg rounded-2xl border border-cyber/30 cert-frame shadow-glow-cyber overflow-hidden transition-all duration-300 scale-95 opacity-0">
      <div class="px-6 pt-6 pb-4 text-center border-b border-dashed border-zinc-700/80">
        <span class="chip inline-flex items-center gap-2 h-8 px-4 rounded-full border border-cyber/50 bg-cyber/10 text-cyber text-[10px] font-extrabold tracking-[0.2em] uppercase">
          <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z"/><path d="m9.5 11.6 1.8 1.8 3.4-3.6"/></svg>
          Verified Audit Proof — BOT Chain
        </span>
        <button id="certClose" class="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-lg text-zinc-500 hover:text-white hover:bg-ink-700 transition-colors" aria-label="Tutup sertifikat">
          <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </div>

      <div class="p-6">
        <div class="flex items-center gap-4">
          <div id="certSeal" class="shrink-0 w-16 h-16 grid place-items-center rounded-full border-2 border-safe bg-safe/10">
            <svg viewBox="0 0 24 24" class="w-8 h-8 text-safe" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12.5 4 4L18 8"/></svg>
          </div>
          <div class="min-w-0">
            <h3 id="certContract" class="font-mono text-lg font-extrabold text-white truncate">—</h3>
            <p class="mt-0.5 font-mono text-[11px] text-zinc-500" id="certChain">—</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span id="certScore" class="chip h-7 px-3 inline-flex items-center rounded-full bg-safe/15 border border-safe/50 text-safe font-mono text-xs font-extrabold">—</span>
              <span id="certVerdict" class="chip h-7 px-3 inline-flex items-center rounded-full bg-safe/10 border border-safe/40 text-safe text-[10px] font-extrabold tracking-widest uppercase">—</span>
            </div>
          </div>
        </div>

        <dl class="mt-5 rounded-xl border border-zinc-800 bg-ink-900/80 divide-y divide-zinc-800/80 font-mono text-[11.5px]">
          <div class="flex gap-3 px-4 py-2.5"><dt class="w-28 shrink-0 text-zinc-500">Code Hash</dt><dd id="certCodeHash" class="flex-1 break-all text-cyber">—</dd></div>
          <div class="flex gap-3 px-4 py-2.5"><dt class="w-28 shrink-0 text-zinc-500">Auditor</dt><dd id="certWallet" class="flex-1 break-all text-zinc-300">—</dd></div>
          <div class="flex gap-3 px-4 py-2.5"><dt class="w-28 shrink-0 text-zinc-500">TX Hash</dt><dd id="certTx" class="flex-1 break-all text-zinc-300">—</dd></div>
          <div class="flex gap-3 px-4 py-2.5"><dt class="w-28 shrink-0 text-zinc-500">Block</dt><dd id="certBlock" class="flex-1 text-zinc-300">—</dd></div>
          <div class="flex gap-3 px-4 py-2.5"><dt class="w-28 shrink-0 text-zinc-500">Timestamp</dt><dd id="certTime" class="flex-1 text-zinc-300">—</dd></div>
        </dl>

        <div class="mt-4 rounded-lg border border-zinc-800 bg-ink-900/60 px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Report Summary</p>
          <p id="certSummary" class="text-[12px] leading-relaxed text-zinc-400">—</p>
        </div>

        <div class="mt-5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">GitHub README Badge</p>
          <div class="rounded-lg border border-zinc-800 bg-ink-900 p-3">
            <div class="flex items-center gap-2 mb-3">
              <span class="chip inline-flex overflow-hidden rounded font-mono text-[10px] font-bold h-5">
                <span class="px-2 bg-[#555] text-white grid place-items-center">VibeProof</span>
                <span id="badgePreviewScore" class="px-2 bg-safe text-white grid place-items-center">—</span>
              </span>
              <span class="text-[10px] text-zinc-600 font-mono">preview</span>
            </div>
            <code id="badgeMarkdown" class="block font-mono text-[10.5px] text-zinc-400 break-all leading-relaxed"></code>
            <button id="copyBadgeBtn" class="chip mt-3 h-9 px-3.5 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors">Copy Markdown</button>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a id="certExplorerBtn" href="#" target="_blank" rel="noopener" class="chip h-11 px-4 rounded-lg bg-cyber text-ink-900 text-xs font-extrabold inline-flex items-center justify-center gap-2 hover:brightness-110 transition">View on BOTScan Explorer ↗</a>
          <button id="shareXBtn" class="chip h-11 px-4 rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-100 inline-flex items-center justify-center gap-2 hover:border-cyber/60 transition-colors">
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M17.7 3H21l-7.3 8.3L22.2 21h-6.8l-5.3-6.2L4 21H.7l7.8-8.9L1.5 3h7l4.8 5.7L17.7 3Zm-1.2 16h1.9L6.9 4.9H4.9L16.5 19Z"/></svg>
            Share on X
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="toasts" class="fixed bottom-5 right-5 z-[80] space-y-2 w-[calc(100vw-2.5rem)] max-w-sm"></div>

<script>
/* ═══════════════════════════════════════════════════════════
   VibeProof Dashboard — SPA mock (state-driven, modular)
   ═══════════════════════════════════════════════════════════ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- Networks (sesuai README) ---------- */
const NETWORKS = {
  testnet: { key:'testnet', name:'BOT Chain Testnet', id:968, hex:'0x3C8', rpc:'https://rpc.bohr.life',   explorer:'https://scan.bohr.life',   faucet:'https://faucet.botchain.ai/basic', baseBlock:3412880 },
  mainnet: { key:'mainnet', name:'BOT Chain Mainnet', id:677, hex:'0x2A5', rpc:'https://rpc.botchain.ai', explorer:'https://scan.botchain.ai',   faucet:'Alokasi organizer via Telegram',   baseBlock:22859700 }
};
const VIBEPROOF_ADDR = '0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578';

/* ---------- Utilities ---------- */
function fnv1a(str, seed) { let h = 0x811c9dc5 ^ seed; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
function keccakMock(str) { let out = ''; for (let i = 0; i < 8; i++) out += fnv1a(str + '::' + i, 0x9e3779b9 + i * 2654435761).toString(16).padStart(8, '0'); return '0x' + out; }
function shortHash(h, a = 6, b = 4) { return h.slice(0, a + 2) + '…' + h.slice(-b); }
function gradeOf(score) {
  if (score >= 80) return { key:'safe', color:'#10b981', verdict:'PASSED — SAFE',     chip:'border-safe/50 bg-safe/10 text-safe' };
  if (score >= 50) return { key:'warn', color:'#f59e0b', verdict:'WARNINGS DETECTED', chip:'border-warn/50 bg-warn/10 text-warn' };
  return            { key:'crit', color:'#f43f5e', verdict:'CRITICAL RISK',     chip:'border-crit/50 bg-crit/10 text-crit' };
}
function agoLabel(min) {
  if (min < 60) return min + ' mnt lalu';
  if (min < 1440) return Math.round(min / 60) + ' jam lalu';
  return Math.round(min / 1440) + ' hr lalu';
}
function toast(msg, type = 'info') {
  const colors = { info:'border-cyber/50 text-cyber', ok:'border-safe/50 text-safe', warn:'border-warn/50 text-warn', err:'border-crit/50 text-crit' };
  const el = document.createElement('div');
  el.className = 'rise-in flex items-start gap-2.5 rounded-xl border ' + colors[type] + ' bg-ink-800/95 backdrop-blur px-4 py-3 text-[12.5px] font-medium shadow-lg';
  el.innerHTML = '<span class="mt-0.5 w-1.5 h-1.5 rounded-full bg-current shrink-0"></span><span class="text-zinc-200">' + msg + '</span>';
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 420); }, 3200);
}
async function copyText(txt, label = 'Tersalin ke clipboard') {
  try { await navigator.clipboard.writeText(txt); toast(label, 'ok'); }
  catch (e) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(label, 'ok'); }
}
function ringSVG(score, size) {
  const g = gradeOf(score), C = 2 * Math.PI * 14;
  return '<span class="relative inline-grid place-items-center shrink-0" style="width:' + size + 'px;height:' + size + 'px">' +
    '<svg viewBox="0 0 36 36" class="w-full h-full -rotate-90"><circle cx="18" cy="18" r="14" stroke="#1f232e" stroke-width="3.5" fill="none"/>' +
    '<circle cx="18" cy="18" r="14" stroke="' + g.color + '" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + (C * (1 - score / 100)) + '"/></svg>' +
    '<span class="absolute font-mono font-extrabold text-white" style="font-size:' + Math.round(size * 0.32) + 'px">' + score + '</span></span>';
}

/* ---------- Mock dataset (getLatestAudits) ---------- */
const SEED = {
  testnet: [
    ['VulnerableVault.sol', 28, 2,2,1,1,   4, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true,  'Reentrancy pada withdraw() + autentikasi tx.origin; kontrak dapat dikuras penuh. Wajib perbaikan sebelum deploy.'],
    ['TokenRegistry.sol',   58, 0,1,3,2,  22, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true,  'verifyToken() tanpa access control dan return value ERC-20 tidak diverifikasi.'],
    ['SafeDAppVault.sol',   96, 0,0,0,1,  61, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true,  'ReentrancyGuard + checks-effects-interactions diterapkan konsisten; layak produksi.'],
    ['LunaStake.sol',       91, 0,0,1,2, 130, '0x9aC177b0eF44c2A5d1B8031f77e09c77', true,  'Staking reward math aman; satu catatan informatif rounding.'],
    ['YieldRouterV2.sol',   47, 1,2,2,1, 190, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', true,  'Unchecked low-level call pada router hop; potensi loss of funds.'],
    ['NFTMintPass.sol',     74, 0,1,2,3, 320, '0x77bD0c52a19E4f6B8820d3C55e11aa04', true,  'Mint signature replay window terlalu lebar; perketat nonce.'],
    ['GovBridge.sol',       88, 0,0,1,2, 480, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true,  'Multisig threshold tepat; tambahkan timelock untuk upgrade.'],
    ['TokenVesting.sol',    83, 0,0,2,2, 720, '0xC4e819d77b0A2f6E9031b8D5aa44c209', true,  'Cliff vesting benar; event release belum lengkap.'],
    ['FlashLoanPool.sol',   35, 2,1,2,2,1500, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', true,  'Callback flash loan tidak memvalidasi caller; drain vector kritis.'],
    ['StableSwapAmm.sol',   69, 0,1,3,1,1560, '0x9aC177b0eF44c2A5d1B8031f77e09c77', true,  'Slippage guard opsional; invariant curve perlu fuzzing lanjutan.'],
    ['AirdropClaimer.sol',  94, 0,0,0,2,2900, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true,  'Merkle proof verifikasi solid; claim sekali pakai terjamin.'],
    ['StakingRewards.sol',  61, 0,1,2,3,3000, '0xC4e819d77b0A2f6E9031b8D5aa44c209', true,  'Reward rate dapat diubah owner tanpa timelock.'],
    ['OracleAggregator.sol',87, 0,0,1,2,4300, '0x77bD0c52a19E4f6B8820d3C55e11aa04', true,  'Median aggregation aman; tambah fallback saat signer offline.'],
    ['PresaleVault.sol',    22, 3,2,1,1,5800, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', false, 'Owner dapat mengubah harga & withdraw penuh; centralization kritis.']
  ],
  mainnet: [
    ['SafeDAppVault.sol',   96, 0,0,0,1,  18, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true,  'ReentrancyGuard + checks-effects-interactions diterapkan konsisten; layak produksi.'],
    ['MetaPayWallet.sol',   89, 0,0,1,2,  70, '0x9aC177b0eF44c2A5d1B8031f77e09c77', true,  'Session key scope tepat; tambahkan spending limit harian.'],
    ['GovBridge.sol',       92, 0,0,1,1, 180, '0x38bF4d01c9aE77e5b021Ff6cD81a20A4', true,  'Multisig + timelock aktif; message replay protection lengkap.'],
    ['YieldRouterV2.sol',   54, 1,1,3,1, 360, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', true,  'Slippage parameter user-supplied tanpa bound; perlu clamp.'],
    ['TokenVesting.sol',    84, 0,0,2,2, 540, '0xC4e819d77b0A2f6E9031b8D5aa44c209', true,  'Vesting schedule benar; dokumentasikan edge case revoke.'],
    ['StakingRewards.sol',  71, 0,1,2,2, 840, '0xC4e819d77b0A2f6E9031b8D5aa44c209', true,  'Reward rate mutable; tambahkan timelock 48 jam.'],
    ['LunaStake.sol',       95, 0,0,0,1,1440, '0x9aC177b0eF44c2A5d1B8031f77e09c77', true,  'Audit ulang pasca-upgrade v1.2 bersih.'],
    ['NFTMintPass.sol',     38, 2,2,1,2,1500, '0x77bD0c52a19E4f6B8820d3C55e11aa04', false, 'Signature malleability + unlimited mint window; blocking issue.'],
    ['OracleAggregator.sol',90, 0,0,1,1,2880, '0x77bD0c52a19E4f6B8820d3C55e11aa04', true,  'Price feed redundancy baik.'],
    ['FlashLoanPool.sol',   63, 0,2,2,2,4320, '0x52Ffb319cD20a4E87710c9d5Aa33e1De', true,  'Callback validation diperbaiki; sisa risiko_donation minor.']
  ]
};
function buildAudits(net) {
  return SEED[net].map((row, i) => {
    const [name, score, c, h, m, l, min, auditor, certified, summary] = row;
    const hash = keccakMock(net + ':' + name + ':' + i);
    return {
      id: net + '-' + i, name, score, issues:{ c, h, m, l }, min, auditor, certified, summary,
      hash, tx: keccakMock('tx:' + hash), net,
      block: NETWORKS[net].baseBlock - Math.floor(min * 3.1),
      time: new Date(Date.now() - min * 60000)
    };
  });
}
const TREND = {
  testnet: [52,48,55,61,58,66,63,71,69,76,74,81,79,84].map((s, i) => ({ d: (i + 1) + '/6', score: s, count: 1 + (i % 4) })),
  mainnet: [70,74,72,79,83,80,86,84,88,85,90,89,92,94].map((s, i) => ({ d: (i + 1) + '/6', score: s, count: 1 + (i % 3) }))
};

/* ---------- App state ---------- */
const state = { network:'testnet', wallet:null, view:'overview', filter:'all', sort:'newest', search:'', vtab:'hash' };
const auditsOf = net => buildAudits(net);

/* ---------- Header / sidebar chrome ---------- */
function setNetwork(key) {
  state.network = key;
  $$('.net-btn').forEach(b => {
    const on = b.dataset.net === key;
    b.className = 'net-btn chip h-8 px-3 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ' +
      (on ? (key === 'testnet' ? 'bg-cyber text-ink-900' : 'bg-safe text-ink-900') : 'text-zinc-400 hover:text-white');
  });
  const n = NETWORKS[key];
  $('#sideNetName').textContent = n.name;
  $('#sideChainId').textContent = n.id + ' (' + n.hex + ')';
  $('#sideBlock').textContent = '#' + n.baseBlock.toLocaleString('en-US');
  $('#sideExplorer').href = n.explorer;
  $('#explorerAddrLink').href = n.explorer + '/address/' + VIBEPROOF_ADDR;
  renderAll();
  toast('Network: ' + n.name + ' (Chain ID ' + n.id + ')', 'info');
}
$$('.net-btn').forEach(b => b.addEventListener('click', () => setNetwork(b.dataset.net)));

function renderWallet() {
  const lbl = $('#walletLabel'), btn = $('#walletBtn');
  if (state.wallet) {
    btn.className = 'chip h-10 px-3.5 rounded-lg border border-zinc-700 bg-ink-800 text-xs font-bold text-zinc-200 hover:border-safe/60 transition-colors inline-flex items-center gap-2';
    lbl.innerHTML = '<span class="w-2 h-2 rounded-full bg-safe dot-live inline-block"></span> <span class="font-mono">0x38bF…20a4</span> <span class="text-zinc-600">|</span> <span class="font-mono text-safe">12.45 BOT</span>';
  } else {
    btn.className = 'chip h-10 px-4 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors inline-flex items-center gap-2';
    lbl.textContent = 'Connect MetaMask';
  }
}
$('#walletBtn').addEventListener('click', () => {
  if (state.wallet) { state.wallet = null; renderWallet(); toast('Wallet terputus.', 'info'); return; }
  $('#walletLabel').textContent = 'Approve in wallet…';
  setTimeout(() => { state.wallet = { address:'0x38bF4d01c9aE77e5b021Ff6cD81a20A4' }; renderWallet(); toast('Wallet terhubung · ' + NETWORKS[state.network].name, 'ok'); }, 900);
});

/* sidebar drawer */
function openSidebar() { $('#sidebar').classList.remove('-translate-x-full'); $('#sidebarBackdrop').classList.remove('hidden'); }
function closeSidebar() { $('#sidebar').classList.add('-translate-x-full'); $('#sidebarBackdrop').classList.add('hidden'); }
$('#sidebarToggle').addEventListener('click', openSidebar);
$('#sidebarBackdrop').addEventListener('click', closeSidebar);

/* view switching */
function setView(v) {
  state.view = v;
  ['overview','audits','certificates','verify','contract'].forEach(k => $('#view-' + k).classList.toggle('hidden', k !== v));
  $$('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
$$('.nav-item[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
$$('.goto-btn').forEach(b => b.addEventListener('click', () => setView(b.dataset.goto)));
$('#bannerVerifyBtn').addEventListener('click', () => setView('verify'));

/* global search */
$('#globalSearch').addEventListener('input', e => { state.search = e.target.value.trim().toLowerCase(); setView('audits'); renderAudits(); });
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); $('#globalSearch').focus(); }
  if (e.key === 'Escape') { closeCert(); closeSidebar(); }
});

/* ---------- Overview renderers ---------- */
function renderKPIs() {
  const list = auditsOf(state.network);
  const certified = list.filter(a => a.certified);
  const totalIssues = list.reduce((s, a) => s + a.issues.c + a.issues.h + a.issues.m + a.issues.l, 0);
  const critBlocked = list.reduce((s, a) => s + a.issues.c, 0);
  const avg = Math.round(list.reduce((s, a) => s + a.score, 0) / list.length);
  const gas = (certified.length * 0.00021).toFixed(5);
  const kpis = [
    { label:'Total Audits (getTotalAudits)', value:list.length, delta:'+3 minggu ini', icon:'M8 6h13M8 12h13M8 18h13', tone:'text-cyber' },
    { label:'Avg Security Score', value:avg + '/100', delta:'+6 vs periode lalu', icon:'M12 3v18M5 10l7-7 7 7', tone:'text-safe' },
    { label:'Critical Issues Blocked', value:critBlocked, delta:totalIssues + ' total findings', icon:'M12 3 5 6v5c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V6l-7-3Z', tone:'text-crit' },
    { label:'Certificates Minted', value:certified.length, delta:'via certifyAudit()', icon:'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-3 6-1.6 6 4.6-2.4 4.6 2.4-1.6-6', tone:'text-warn' },
    { label:'Gas Used (Certify)', value:gas, delta:'BOT · ±21,480 gas/mint', icon:'M13 2 4 14h6l-1 8 9-12h-6l1-8Z', tone:'text-cyber' }
  ];
  $('#kpiGrid').innerHTML = kpis.map(k =>
    '<div class="rise-in rounded-2xl border border-zinc-800 bg-ink-800 p-4 hover:border-zinc-600 transition-colors">' +
      '<div class="flex items-center gap-2.5"><span class="grid place-items-center w-8 h-8 rounded-lg border border-zinc-800 bg-ink-700 ' + k.tone + '"><svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="' + k.icon + '"/></svg></span>' +
      '<p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-tight">' + k.label + '</p></div>' +
      '<p class="mt-3 font-mono text-2xl font-extrabold text-white">' + k.value + '</p>' +
      '<p class="mt-1 font-mono text-[10px] text-zinc-500">' + k.delta + '</p>' +
    '</div>').join('');
}

function renderTrend() {
  const data = TREND[state.network];
  const W = 640, H = 220, P = { t:16, r:14, b:28, l:34 }, min = 30, max = 100;
  const x = i => P.l + i * (W - P.l - P.r) / (data.length - 1);
  const y = v => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  let grid = '', labels = '';
  [40, 60, 80, 100].forEach(v => {
    grid += '<line x1="' + P.l + '" y1="' + y(v) + '" x2="' + (W - P.r) + '" y2="' + y(v) + '" stroke="#1f232e" stroke-width="1"/>' +
            '<text x="' + (P.l - 8) + '" y="' + (y(v) + 3.5) + '" text-anchor="end" font-size="9" fill="#52525b" font-family="monospace">' + v + '</text>';
  });
  data.forEach((p, i) => { if (i % 2 === 0) labels += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="9" fill="#52525b" font-family="monospace">' + p.d + '</text>'; });
  const bars = data.map((p, i) => '<rect x="' + (x(i) - 4) + '" y="' + (H - P.b - p.count * 6) + '" width="8" height="' + (p.count * 6) + '" rx="2" fill="rgba(16,185,129,.28)"/>').join('');
  const line = data.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.score).toFixed(1)).join(' ');
  const area = line + ' L' + x(data.length - 1) + ' ' + (H - P.b) + ' L' + P.l + ' ' + (H - P.b) + ' Z';
  const dots = data.map((p, i) => '<circle cx="' + x(i) + '" cy="' + y(p.score) + '" r="3" fill="#090a0f" stroke="#00F0FF" stroke-width="2"/>').join('');
  const hovers = data.map((p, i) => '<rect data-i="' + i + '" x="' + (x(i) - 12) + '" y="' + P.t + '" width="24" height="' + (H - P.t - P.b) + '" fill="transparent" class="hover-zone"/>').join('');
  $('#trendChart').innerHTML =
    '<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00F0FF" stop-opacity=".22"/><stop offset="100%" stop-color="#00F0FF" stop-opacity="0"/></linearGradient></defs>' +
    grid + bars + '<path d="' + area + '" fill="url(#tg)"/>' +
    '<path id="trendLine" d="' + line + '" fill="none" stroke="#00F0FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    dots + labels + hovers;
  const path = $('#trendLine');
  const len = path.getTotalLength();
  path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
  requestAnimationFrame(() => { path.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)'; path.style.strokeDashoffset = '0'; });

  const tip = $('#chartTip'), wrap = $('#trendWrap');
  $$('.hover-zone', $('#trendChart')).forEach(z => {
    z.addEventListener('mouseenter', () => {
      const p = data[+z.dataset.i];
      tip.innerHTML = '<span class="text-cyber font-bold">' + p.d + '</span> · avg <span class="text-white font-bold">' + p.score + '</span> · ' + p.count + ' audits';
      const r = wrap.getBoundingClientRect(), zr = z.getBoundingClientRect();
      tip.style.left = Math.min(r.width - 150, Math.max(0, zr.left - r.left - 40)) + 'px';
      tip.style.top = '8px'; tip.style.opacity = '1';
    });
    z.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
  });
}

function renderDonut() {
  const list = auditsOf(state.network);
  const agg = { Critical:0, High:0, Medium:0, Low:0 };
  list.forEach(a => { agg.Critical += a.issues.c; agg.High += a.issues.h; agg.Medium += a.issues.m; agg.Low += a.issues.l; });
  const colors = { Critical:'#f43f5e', High:'#fb923c', Medium:'#f59e0b', Low:'#52525b' };
  const total = Object.values(agg).reduce((a, b) => a + b, 0) || 1;
  const C = 2 * Math.PI * 54;
  let acc = 0, segs = '';
  Object.entries(agg).forEach(([k, v]) => {
    const len = C * (v / total);
    segs += '<circle class="donut-seg" cx="70" cy="70" r="54" fill="none" stroke="' + colors[k] + '" stroke-width="14" stroke-dasharray="0 ' + C + '" data-target="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-acc) + '" transform="rotate(-90 70 70)" style="transition: stroke-dasharray .9s cubic-bezier(.22,1,.36,1)"/>';
    acc += len;
  });
  $('#donutChart').innerHTML = '<circle cx="70" cy="70" r="54" fill="none" stroke="#141720" stroke-width="14"/>' + segs;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('.donut-seg').forEach(s => s.setAttribute('stroke-dasharray', s.dataset.target));
  }));
  $('#donutTotal').textContent = total;
  $('#donutLegend').innerHTML = Object.entries(agg).map(([k, v]) =>
    '<li class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background:' + colors[k] + '"></span><span class="text-zinc-400 flex-1">' + k + '</span><span class="text-white font-bold">' + v + '</span><span class="text-zinc-600 w-10 text-right">' + Math.round(v / total * 100) + '%</span></li>').join('');

  const risky = list.slice().sort((a, b) => a.score - b.score).slice(0, 3);
  $('#topRisky').innerHTML = risky.map(a => {
    const g = gradeOf(a.score);
    return '<li><div class="flex items-center gap-2"><span class="font-mono text-[11px] text-zinc-300 flex-1 truncate">' + a.name + '</span><span class="font-mono text-[11px] font-bold" style="color:' + g.color + '">' + a.score + '</span></div>' +
      '<div class="mt-1 h-1 rounded-full bg-ink-600 overflow-hidden"><div class="h-full rounded-full" style="width:' + a.score + '%;background:' + g.color + '"></div></div></li>';
  }).join('');
}

function verdictPill(score) {
  const g = gradeOf(score);
  return '<span class="chip h-6 px-2.5 inline-flex items-center rounded-full border text-[9.5px] font-extrabold tracking-widest uppercase ' + g.chip + '">' + g.verdict + '</span>';
}
function renderRecent() {
  const list = auditsOf(state.network).slice().sort((a, b) => a.min - b.min).slice(0, 6);
  const net = NETWORKS[state.network];
  $('#recentTbody').innerHTML = list.map(a =>
    '<tr class="cursor-pointer" data-cert="' + a.id + '">' +
      '<td class="px-5 py-3 text-zinc-200 font-bold">' + a.name + '</td>' +
      '<td class="px-3 py-3">' + ringSVG(a.score, 34) + '</td>' +
      '<td class="px-3 py-3">' + verdictPill(a.score) + '</td>' +
      '<td class="px-3 py-3 hidden sm:table-cell"><a class="text-zinc-500 hover:text-cyber" href="' + net.explorer + '/tx/' + a.tx + '" target="_blank" rel="noopener">' + shortHash(a.tx, 6, 4) + '</a></td>' +
      '<td class="px-5 py-3 text-right text-zinc-500">' + agoLabel(a.min) + '</td>' +
    '</tr>').join('');
  $$('#recentTbody tr').forEach(tr => tr.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const rec = auditsOf(state.network).find(x => x.id === tr.dataset.cert);
    if (rec && rec.certified) openCert(rec); else toast('Kontrak ini belum disertifikasi on-chain.', 'warn');
  }));

  const events = auditsOf(state.network).filter(a => a.certified).slice().sort((a, b) => a.min - b.min).slice(0, 6);
  $('#activityList').innerHTML = events.map(a => {
    const g = gradeOf(a.score);
    return '<li class="ml-5 relative"><span class="absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 border-ink-800" style="background:' + g.color + '"></span>' +
      '<p class="font-mono text-[11px] text-zinc-300"><span class="text-cyber">AuditIssued</span> · ' + a.name + '</p>' +
      '<p class="mt-0.5 font-mono text-[10px] text-zinc-600">score ' + a.score + ' · ' + shortHash(a.tx, 8, 4) + ' · ' + agoLabel(a.min) + '</p></li>';
  }).join('');
}

/* ---------- Audits view ---------- */
function filteredAudits() {
  let list = auditsOf(state.network);
  if (state.filter !== 'all') list = list.filter(a => gradeOf(a.score).key === state.filter);
  if (state.search) list = list.filter(a => a.name.toLowerCase().includes(state.search) || a.hash.includes(state.search) || a.tx.includes(state.search));
  if (state.sort === 'newest') list.sort((a, b) => a.min - b.min);
  if (state.sort === 'score-desc') list.sort((a, b) => b.score - a.score);
  if (state.sort === 'score-asc') list.sort((a, b) => a.score - b.score);
  return list;
}
function renderAudits() {
  const list = filteredAudits(), net = NETWORKS[state.network];
  $('#auditsCountLabel').textContent = list.length + ' records · ' + net.name;
  $('#auditsEmpty').classList.toggle('hidden', list.length > 0);
  $('#auditsTbody').innerHTML = list.map(a =>
    '<tr>' +
      '<td class="px-5 py-3"><p class="text-zinc-200 font-bold">' + a.name + '</p><p class="text-[10px] text-zinc-600">' + shortHash(a.auditor, 6, 4) + '</p></td>' +
      '<td class="px-3 py-3">' + ringSVG(a.score, 36) + '</td>' +
      '<td class="px-3 py-3">' + verdictPill(a.score) + '</td>' +
      '<td class="px-3 py-3 hidden md:table-cell"><span class="text-crit">' + a.issues.c + '</span>/<span class="text-orange-400">' + a.issues.h + '</span>/<span class="text-warn">' + a.issues.m + '</span>/<span class="text-zinc-400">' + a.issues.l + '</span></td>' +
      '<td class="px-3 py-3 hidden lg:table-cell text-zinc-500">' + shortHash(a.hash, 6, 3) + '</td>' +
      '<td class="px-3 py-3 hidden sm:table-cell"><a class="text-zinc-500 hover:text-cyber" href="' + net.explorer + '/tx/' + a.tx + '" target="_blank" rel="noopener">' + shortHash(a.tx, 6, 4) + '</a></td>' +
      '<td class="px-3 py-3 hidden lg:table-cell text-zinc-500">' + agoLabel(a.min) + '</td>' +
      '<td class="px-5 py-3 text-right"><div class="inline-flex gap-1.5">' +
        '<button data-open="' + a.id + '" class="chip h-8 px-2.5 rounded-lg border border-zinc-700 bg-ink-700 text-[10.5px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors">Certificate</button>' +
        '<button data-hashcopy="' + a.hash + '" class="chip h-8 px-2.5 rounded-lg border border-zinc-700 bg-ink-700 text-[10.5px] font-bold text-zinc-400 hover:border-cyber/60 hover:text-cyber transition-colors" title="Copy code hash">⧉</button>' +
      '</div></td>' +
    '</tr>').join('');
  $$('#auditsTbody [data-open]').forEach(b => b.addEventListener('click', () => {
    const rec = auditsOf(state.network).find(x => x.id === b.dataset.open);
    if (rec.certified) openCert(rec); else toast(rec.name + ' belum di-mint on-chain (status: draft report).', 'warn');
  }));
  $$('#auditsTbody [data-hashcopy]').forEach(b => b.addEventListener('click', () => copyText(b.dataset.hashcopy, 'Code hash disalin')));
}
$$('.filter-chip').forEach(b => b.addEventListener('click', () => {
  state.filter = b.dataset.filter;
  $$('.filter-chip').forEach(x => {
    const on = x.dataset.filter === state.filter;
    x.className = 'filter-chip chip h-9 px-3.5 rounded-full border text-[11px] font-bold transition-colors ' +
      (on ? (state.filter === 'safe' ? 'border-safe/50 bg-safe/10 text-safe' : state.filter === 'warn' ? 'border-warn/50 bg-warn/10 text-warn' : state.filter === 'crit' ? 'border-crit/50 bg-crit/10 text-crit' : 'border-cyber/50 bg-cyber/10 text-cyber')
          : 'border-zinc-700 bg-ink-800 text-zinc-400 hover:border-zinc-500');
  });
  renderAudits();
}));
$('#sortSelect').addEventListener('change', e => { state.sort = e.target.value; renderAudits(); });

/* ---------- Certificates view ---------- */
function renderCerts() {
  const list = auditsOf(state.network).filter(a => a.certified);
  const net = NETWORKS[state.network];
  $('#certCountLabel').textContent = list.length + ' certificates · ' + net.name;
  $('#certEmpty').classList.toggle('hidden', list.length > 0);
  $('#certGrid').innerHTML = list.map(a => {
    const g = gradeOf(a.score);
    return '<article class="rise-in rounded-2xl border border-zinc-800 bg-ink-800 p-4 hover:border-zinc-600 transition-colors flex flex-col">' +
      '<div class="flex items-center gap-3">' + ringSVG(a.score, 44) +
        '<div class="min-w-0 flex-1"><p class="font-mono text-[13px] font-bold text-white truncate">' + a.name + '</p>' +
        '<p class="mt-0.5 font-mono text-[10px] text-zinc-500">' + shortHash(a.hash, 8, 4) + '</p></div>' +
        '<span class="chip h-6 px-2 inline-flex items-center rounded-full border text-[9px] font-extrabold tracking-widest uppercase ' + g.chip + '">' + (g.key === 'safe' ? 'SAFE' : g.key === 'warn' ? 'WARN' : 'CRIT') + '</span></div>' +
      '<dl class="mt-3.5 rounded-lg border border-zinc-800 bg-ink-850 divide-y divide-zinc-800/70 font-mono text-[10.5px]">' +
        '<div class="flex gap-2 px-3 py-1.5"><dt class="w-14 text-zinc-600">TX</dt><dd class="flex-1 truncate text-zinc-400">' + shortHash(a.tx, 10, 6) + '</dd></div>' +
        '<div class="flex gap-2 px-3 py-1.5"><dt class="w-14 text-zinc-600">Block</dt><dd class="text-zinc-400">#' + a.block.toLocaleString('en-US') + '</dd></div>' +
        '<div class="flex gap-2 px-3 py-1.5"><dt class="w-14 text-zinc-600">Minted</dt><dd class="text-zinc-400">' + agoLabel(a.min) + '</dd></div>' +
      '</dl>' +
      '<div class="mt-3.5 grid grid-cols-2 gap-2">' +
        '<button data-certopen="' + a.id + '" class="chip h-9 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-[11px] font-bold hover:bg-cyber/20 transition-colors">View Certificate</button>' +
        '<a href="' + net.explorer + '/tx/' + a.tx + '" target="_blank" rel="noopener" class="chip h-9 rounded-lg border border-zinc-700 bg-ink-700 text-zinc-300 text-[11px] font-bold hover:border-cyber/60 hover:text-cyber transition-colors inline-flex items-center justify-center">BOTScan ↗</a>' +
      '</div></article>';
  }).join('');
  $$('#certGrid [data-certopen]').forEach(b => b.addEventListener('click', () => openCert(auditsOf(state.network).find(x => x.id === b.dataset.certopen))));
}

/* ---------- Verify view ---------- */
function setVTab(t) {
  state.vtab = t;
  $('#vtabHash').className = 'vtab chip h-11 px-5 text-xs font-bold border-b-2 -mb-px ' + (t === 'hash' ? 'text-cyber border-cyber' : 'text-zinc-500 border-transparent hover:text-zinc-300');
  $('#vtabSrc').className  = 'vtab chip h-11 px-5 text-xs font-bold border-b-2 -mb-px ' + (t === 'src'  ? 'text-cyber border-cyber' : 'text-zinc-500 border-transparent hover:text-zinc-300');
  $('#vpaneHash').classList.toggle('hidden', t !== 'hash');
  $('#vpaneSrc').classList.toggle('hidden', t !== 'src');
}
$('#vtabHash').addEventListener('click', () => setVTab('hash'));
$('#vtabSrc').addEventListener('click', () => setVTab('src'));
$('#verifySrc').addEventListener('input', e => { $('#verifySrcHash').textContent = e.target.value ? keccakMock(e.target.value) : '0x…'; });

function fillSamples() {
  const list = auditsOf(state.network).filter(a => a.certified).slice(0, 3);
  $$('.sample-hash').forEach((b, i) => {
    if (!list[i]) return;
    b.textContent = list[i].name + ' · ' + shortHash(list[i].hash, 6, 3);
    b.dataset.hash = list[i].hash;
    b.onclick = () => { $('#verifyInput').value = list[i].hash; toast('Hash contoh diisi.', 'info'); };
  });
}
function consoleLine(box, txt, cls) {
  box.classList.remove('hidden');
  box.insertAdjacentHTML('beforeend', '<div class="console-line ' + (cls || '') + '">' + txt + '</div>');
  box.scrollTop = box.scrollHeight;
}
$('#verifyBtn').addEventListener('click', () => {
  const net = NETWORKS[state.network];
  const hash = state.vtab === 'hash' ? $('#verifyInput').value.trim() : ($('#verifySrc').value ? keccakMock($('#verifySrc').value) : '');
  if (!hash || hash === '0x…') { toast('Masukkan code hash atau tempel Solidity source.', 'warn'); return; }
  const box = $('#verifyConsole'); box.innerHTML = ''; $('#verifyResult').classList.add('hidden');
  consoleLine(box, '<span class="text-cyber">›</span> eth_call VibeProof.getAudit("' + shortHash(hash, 10, 6) + '") @ ' + net.rpc);
  setTimeout(() => consoleLine(box, '<span class="text-cyber">›</span> chainId ' + net.id + ' · block #' + net.baseBlock.toLocaleString('en-US') + ' · latency 182ms'), 420);
  setTimeout(() => consoleLine(box, '<span class="text-cyber">›</span> decoding tuple (codeHash, projectName, securityScore, verdict, reportSummary, auditor, timestamp)…'), 840);
  setTimeout(() => {
    const rec = auditsOf(state.network).find(a => a.hash === hash);
    if (rec && rec.certified) {
      consoleLine(box, '<span class="text-safe">✓ PROOF FOUND — record valid & immutable</span>', 'text-safe');
      renderVerifyResult(rec, true);
    } else if (rec) {
      consoleLine(box, '<span class="text-warn">⚠ record ditemukan namun belum di-mint on-chain</span>');
      renderVerifyResult(rec, false);
    } else {
      consoleLine(box, '<span class="text-crit">✗ revert: AuditNotFound(bytes32)</span>');
      $('#verifyResult').classList.remove('hidden');
      $('#verifyResult').innerHTML =
        '<div class="rise-in rounded-2xl border border-crit/40 bg-crit/[0.07] p-6 text-center">' +
        '<p class="text-4xl">⛔</p><h4 class="mt-3 text-base font-extrabold text-crit">Proof tidak ditemukan</h4>' +
        '<p class="mt-2 text-sm text-zinc-400 max-w-md mx-auto">Code hash <span class="font-mono text-zinc-200">' + shortHash(hash, 10, 6) + '</span> tidak tercatat di VibeProof.sol pada ' + net.name + '. Pastikan source identik bit-per-bit atau coba jaringan lain.</p>' +
        '<button onclick="document.getElementById(\'verifyBtn\').click()" class="chip mt-5 h-10 px-4 rounded-lg border border-zinc-700 bg-ink-800 text-xs font-bold text-zinc-200 hover:border-cyber/60 transition-colors">Coba lagi</button></div>';
    }
  }, 1300);
});
function renderVerifyResult(rec, onchain) {
  const net = NETWORKS[rec.net], g = gradeOf(rec.score);
  $('#verifyResult').classList.remove('hidden');
  $('#verifyResult').innerHTML =
    '<div class="rise-in rounded-2xl border ' + (onchain ? 'border-safe/40' : 'border-warn/40') + ' bg-ink-800 overflow-hidden">' +
      '<div class="px-5 py-4 border-b border-zinc-800 flex flex-wrap items-center gap-3">' +
        '<span class="chip h-7 px-3 inline-flex items-center gap-2 rounded-full border ' + (onchain ? 'border-safe/50 bg-safe/10 text-safe' : 'border-warn/50 bg-warn/10 text-warn') + ' text-[10px] font-extrabold tracking-widest uppercase">' + (onchain ? '✓ VERIFIED ON-CHAIN' : '⚠ DRAFT — NOT MINTED') + '</span>' +
        '<span class="font-mono text-sm font-bold text-white">' + rec.name + '</span>' +
        '<span class="flex-1"></span>' + ringSVG(rec.score, 40) +
      '</div>' +
      '<dl class="grid sm:grid-cols-2 gap-px bg-zinc-800 font-mono text-[11.5px]">' +
        '<div class="bg-ink-850 px-4 py-2.5"><dt class="text-zinc-600 text-[10px] uppercase tracking-widest">codeHash</dt><dd class="mt-0.5 break-all text-cyber">' + rec.hash + '</dd></div>' +
        '<div class="bg-ink-850 px-4 py-2.5"><dt class="text-zinc-600 text-[10px] uppercase tracking-widest">projectName</dt><dd class="mt-0.5 text-zinc-200">' + rec.name.replace('.sol', '') + '</dd></div>' +
        '<div class="bg-ink-850 px-4 py-2.5"><dt class="text-zinc-600 text-[10px] uppercase tracking-widest">securityScore</dt><dd class="mt-0.5 text-zinc-200">' + rec.score + ' (uint8)</dd></div>' +
        '<div class="bg-ink-850 px-4 py-2.5"><dt class="text-zinc-600 text-[10px] uppercase tracking-widest">verdict</dt><dd class="mt-0.5"><span class="chip h-6 px-2 inline-flex items-center rounded-full border text-[9.5px] font-extrabold tracking-widest uppercase ' + g.chip + '">' + g.verdict + '</span></dd></div>' +
        '<div class="bg-ink-850 px-4 py-2.5"><dt class="text-zinc-600 text-[10px] uppercase tracking-widest">auditor</dt><dd class="mt-0.5 break-all text-zinc-300">' + rec.auditor + '</dd></div>' +
        '<div class="bg-ink-850 px-4 py-2.5"><dt class="text-zinc-600 text-[10px] uppercase tracking-widest">timestamp / block</dt><dd class="mt-0.5 text-zinc-300">' + rec.time.toLocaleString('id-ID') + ' · #' + rec.block.toLocaleString('en-US') + '</dd></div>' +
      '</dl>' +
      '<div class="px-5 py-4 bg-ink-850 flex flex-wrap gap-2">' +
        '<button id="vrCert" class="chip h-10 px-4 rounded-lg border border-cyber/50 bg-cyber/10 text-cyber text-xs font-bold hover:bg-cyber/20 transition-colors">Open Certificate</button>' +
        '<a href="' + net.explorer + '/tx/' + rec.tx + '" target="_blank" rel="noopener" class="chip h-10 px-4 inline-flex items-center rounded-lg border border-zinc-700 bg-ink-700 text-xs font-bold text-zinc-200 hover:border-cyber/60 transition-colors">View TX on BOTScan ↗</a>' +
      '</div></div>';
  $('#vrCert').addEventListener('click', () => rec.certified ? openCert(rec) : toast('Record belum di-mint.', 'warn'));
}

/* ---------- Contract view ---------- */
const FNS = [
  { type:'write', name:'certifyAudit', sig:'certifyAudit(bytes32 _codeHash, string _projectName, uint8 _securityScore, string _verdict, string _reportSummary)', desc:'Menyimpan verdict audit on-chain dan emit event AuditIssued. Gas ±21,480 (0.00021 BOT).', out:'→ Transaction sent: 0x4f2a…c91d · status: success (1 confirmation) · event AuditIssued emitted' },
  { type:'read',  name:'getAudit', sig:'getAudit(bytes32 _codeHash) view returns (bytes32, string, uint8, string, string, address, uint256)', desc:'Mengambil record audit tersertifikasi berdasarkan code hash.', out:'→ (0x8f3a…e8f1, "SafeDAppVault", 96, "PASSED — SAFE", "ReentrancyGuard + CEI konsisten…", 0x38bF…20a4, 1749632400)' },
  { type:'read',  name:'getTotalAudits', sig:'getTotalAudits() view returns (uint256)', desc:'Total audit yang pernah dicatat kontrak.', out:'→ 1284' },
  { type:'read',  name:'getLatestAudits', sig:'getLatestAudits(uint256 limit) view returns (Audit[] memory)', desc:'Record terbaru untuk timeline feed frontend.', out:'→ Audit[6]: [VulnerableVault 28, TokenRegistry 58, SafeDAppVault 96, LunaStake 91, YieldRouterV2 47, NFTMintPass 74]' }
];
const ABI_JSON = JSON.stringify([
  { type:'function', name:'certifyAudit', stateMutability:'nonpayable', inputs:[{name:'_codeHash',type:'bytes32'},{name:'_projectName',type:'string'},{name:'_securityScore',type:'uint8'},{name:'_verdict',type:'string'},{name:'_reportSummary',type:'string'}], outputs:[] },
  { type:'function', name:'getAudit', stateMutability:'view', inputs:[{name:'_codeHash',type:'bytes32'}], outputs:[{type:'bytes32'},{type:'string'},{type:'uint8'},{type:'string'},{type:'string'},{type:'address'},{type:'uint256'}] },
  { type:'function', name:'getTotalAudits', stateMutability:'view', inputs:[], outputs:[{type:'uint256'}] },
  { type:'function', name:'getLatestAudits', stateMutability:'view', inputs:[{name:'limit',type:'uint256'}], outputs:[{type:'tuple[]'}] },
  { type:'event', name:'AuditIssued', inputs:[{name:'codeHash',type:'bytes32',indexed:true},{name:'projectName',type:'string',indexed:false},{name:'securityScore',type:'uint8',indexed:false},{name:'verdict',type:'string',indexed:false},{name:'auditor',type:'address',indexed:true},{name:'timestamp',type:'uint256',indexed:false}] }
], null, 2);

function renderFns() {
  $('#fnList').innerHTML = FNS.map((f, i) =>
    '<div class="px-5 py-4 flex flex-wrap items-start gap-3">' +
      '<span class="chip h-6 px-2.5 inline-flex items-center rounded-md border text-[9.5px] font-extrabold tracking-widest uppercase ' + (f.type === 'write' ? 'border-warn/50 bg-warn/10 text-warn' : 'border-cyber/40 bg-cyber/10 text-cyber') + '">' + f.type + '</span>' +
      '<div class="flex-1 min-w-[220px]"><p class="font-mono text-[12.5px] font-bold text-zinc-100 break-all">' + f.sig + '</p><p class="mt-1 text-[12px] text-zinc-500">' + f.desc + '</p></div>' +
      '<button data-fn="' + i + '" class="chip h-9 px-3.5 rounded-lg border border-zinc-700 bg-ink-700 text-[11px] font-bold text-zinc-200 hover:border-cyber/60 hover:text-cyber transition-colors">Simulate</button>' +
    '</div>').join('');
  $$('#fnList [data-fn]').forEach(b => b.addEventListener('click', () => {
    const f = FNS[+b.dataset.fn], box = $('#fnConsole'); box.innerHTML = '';
    consoleLine(box, '<span class="text-cyber">›</span> ' + (f.type === 'write' ? 'eth_sendTransaction' : 'eth_call') + ' → VibeProof.' + f.name + '() @ ' + NETWORKS[state.network].rpc);
    if (f.type === 'write' && !state.wallet) consoleLine(box, '<span class="text-warn">› MetaMask tidak terdeteksi — menjalankan simulated broadcast (visitor mode)</span>');
    setTimeout(() => consoleLine(box, '<span class="text-safe">' + f.out + '</span>'), 600);
  }));
}
$('#copyAbiBtn').addEventListener('click', () => copyText(ABI_JSON, 'ABI JSON disalin'));
$('#copyAddrBtn').addEventListener('click', () => copyText(VIBEPROOF_ADDR, 'Contract address disalin'));
$('#bannerCopyAddr').addEventListener('click', () => copyText(VIBEPROOF_ADDR, 'Contract address disalin'));
$$('.copy-cmd').forEach(b => b.addEventListener('click', () => copyText(b.dataset.cmd, 'Command disalin')));
$('#copyBadgeMd').addEventListener('click', () => copyText(
  '[![BOT Chain](https://img.shields.io/badge/BOT_Chain-Testnet_%26_Mainnet-00F0FF?style=for-the-badge&logo=ethereum)](https://scan.botchain.ai)\n' +
  '[![Girl Meets Tech](https://img.shields.io/badge/Girl_Meets_Tech-Build_Week_Vol.2-10B981?style=for-the-badge)](#)\n' +
  '[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#)', 'Badge markdown README disalin'));

/* ---------- Certificate modal ---------- */
function openCert(rec) {
  const net = NETWORKS[rec.net], g = gradeOf(rec.score);
  $('#certContract').textContent = rec.name;
  $('#certChain').textContent = net.name + ' · Chain ID ' + net.id;
  $('#certScore').textContent = rec.score + '/100';
  $('#certScore').className = 'chip h-7 px-3 inline-flex items-center rounded-full border font-mono text-xs font-extrabold ' + g.chip;
  $('#certVerdict').textContent = g.verdict;
  $('#certVerdict').className = 'chip h-7 px-3 inline-flex items-center rounded-full border text-[10px] font-extrabold tracking-widest uppercase ' + g.chip;
  $('#certSeal').className = 'shrink-0 w-16 h-16 grid place-items-center rounded-full border-2 ' + (g.key === 'safe' ? 'border-safe bg-safe/10' : g.key === 'warn' ? 'border-warn bg-warn/10' : 'border-crit bg-crit/10');
  $('#certSeal').firstElementChild.className = 'w-8 h-8 ' + (g.key === 'safe' ? 'text-safe' : g.key === 'warn' ? 'text-warn' : 'text-crit');
  $('#certCodeHash').textContent = rec.hash;
  $('#certWallet').textContent = rec.auditor;
  $('#certTx').textContent = rec.tx;
  $('#certBlock').textContent = '#' + rec.block.toLocaleString('en-US');
  $('#certTime').textContent = rec.time.toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'medium' });
  $('#certSummary').textContent = rec.summary;
  $('#certExplorerBtn').href = net.explorer + '/tx/' + rec.tx;
  const md = '[![VibeProof: ' + rec.score + '/100](https://vibeproof.botchain.ai/badge/' + rec.hash.slice(2, 10) + '.svg)](' + net.explorer + '/tx/' + rec.tx + ')';
  $('#badgeMarkdown').textContent = md;
  $('#badgePreviewScore').textContent = rec.score + '/100';
  $('#badgePreviewScore').className = 'px-2 grid place-items-center ' + (g.key === 'safe' ? 'bg-safe' : g.key === 'warn' ? 'bg-warn' : 'bg-crit') + ' text-white';
  $('#copyBadgeBtn').onclick = () => copyText(md, 'Markdown badge disalin untuk README');
  $('#shareXBtn').onclick = () => {
    const txt = encodeURIComponent('I just verified ' + rec.name + ' with a ' + rec.score + '/100 security score on @BOTChain_ai using VibeProof 🛡️⚡ tx: ' + shortHash(rec.tx, 10, 6) + ' #VibeProof #BOTChain #GirlMeetsTech');
    window.open('https://twitter.com/intent/tweet?text=' + txt, '_blank');
  };
  const modal = $('#certModal'), panel = $('#certPanel');
  modal.classList.remove('hidden'); document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => { panel.classList.remove('scale-95', 'opacity-0'); panel.classList.add('scale-100', 'opacity-100'); });
}
function closeCert() {
  const modal = $('#certModal'), panel = $('#certPanel');
  if (modal.classList.contains('hidden')) return;
  panel.classList.add('scale-95', 'opacity-0'); panel.classList.remove('scale-100', 'opacity-100');
  setTimeout(() => { modal.classList.add('hidden'); document.body.style.overflow = ''; }, 220);
}
$('#certClose').addEventListener('click', closeCert);
$('#certBackdrop').addEventListener('click', closeCert);

/* ---------- Live block ticker ---------- */
setInterval(() => {
  const n = NETWORKS[state.network];
  n.baseBlock += 1 + Math.floor(Math.random() * 2);
  $('#sideBlock').textContent = '#' + n.baseBlock.toLocaleString('en-US');
  $('#sideRpcPing').textContent = (150 + Math.floor(Math.random() * 70)) + 'ms';
}, 4000);

/* ---------- Scroll progress ---------- */
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  $('#scrollProgress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive:true });

/* ---------- Boot ---------- */
function renderAll() {
  const list = auditsOf(state.network);
  $('#navAuditCount').textContent = list.length;
  $('#navCertCount').textContent = list.filter(a => a.certified).length;
  renderKPIs(); renderTrend(); renderDonut(); renderRecent(); renderAudits(); renderCerts(); fillSamples(); renderFns();
}
renderWallet();
setNetwork('testnet');
setView('overview');
</script>
</body>
</html>
