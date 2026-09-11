import React, { useState, useMemo, useRef } from 'react';
import { ringSVG, gradeOf, esc } from '../../data/suiteData';

interface RepoImporterViewProps {
  showToast?: (msg: string, type?: 'ok' | 'err' | 'warn' | 'info') => void;
}

interface RepoFile {
  p: string;
  loc: number;
  score: number | null;
  scanned: boolean;
  sel: boolean;
  inherits: string[];
  calls: string[];
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  kind: 'core' | 'oz' | 'iface';
}

const REPOS: Record<string, Omit<RepoFile, 'scanned' | 'sel'>[]> = {
  'defi-vault-foundry': [
    { p: 'src/EtherVault.sol', loc: 39, score: 28, inherits: ['ReentrancyGuard', 'Ownable'], calls: ['IERC20.transfer'] },
    { p: 'src/RewardToken.sol', loc: 112, score: 88, inherits: ['ERC20', 'Ownable'], calls: [] },
    { p: 'src/StakingRewards.sol', loc: 184, score: 61, inherits: ['ReentrancyGuard'], calls: ['RewardToken.mint', 'EtherVault.deposit'] },
    { p: 'src/interfaces/IERC20.sol', loc: 14, score: 99, inherits: [], calls: [] },
    { p: 'lib/openzeppelin/Ownable.sol', loc: 88, score: 99, inherits: ['Context'], calls: [] },
    { p: 'lib/openzeppelin/ERC20.sol', loc: 246, score: 97, inherits: ['IERC20', 'Context'], calls: [] },
    { p: 'test/EtherVault.t.sol', loc: 96, score: null, inherits: ['Test'], calls: ['EtherVault.withdraw'] }
  ],
  'nft-minting-hardhat': [
    { p: 'contracts/GenesisPass.sol', loc: 148, score: 38, inherits: ['ERC721', 'Ownable'], calls: [] },
    { p: 'contracts/MerkleWhitelist.sol', loc: 64, score: 91, inherits: [], calls: [] },
    { p: 'contracts/RoyaltySplitter.sol', loc: 52, score: 74, inherits: ['Ownable'], calls: ['GenesisPass.owner'] },
    { p: 'contracts/interfaces/IERC2981.sol', loc: 11, score: 99, inherits: [], calls: [] }
  ],
  'cross-chain-bridge': [
    { p: 'src/BridgeMessenger.sol', loc: 210, score: 54, inherits: ['Ownable', 'ReentrancyGuard'], calls: ['OracleAggregator.latestAnswer'] },
    { p: 'src/OracleAggregator.sol', loc: 96, score: 90, inherits: ['Ownable'], calls: [] },
    { p: 'src/TokenLocker.sol', loc: 78, score: 83, inherits: ['SafeERC20'], calls: ['IERC20.transfer'] }
  ]
};

const GRAPH_LAYOUT: Record<string, GraphNode[]> = {
  'defi-vault-foundry': [
    { id: 'EtherVault', x: 120, y: 80, kind: 'core' },
    { id: 'StakingRewards', x: 380, y: 210, kind: 'core' },
    { id: 'RewardToken', x: 640, y: 80, kind: 'core' },
    { id: 'Ownable', x: 120, y: 330, kind: 'oz' },
    { id: 'ReentrancyGuard', x: 380, y: 350, kind: 'oz' },
    { id: 'ERC20', x: 640, y: 330, kind: 'oz' },
    { id: 'IERC20', x: 640, y: 210, kind: 'iface' }
  ],
  'nft-minting-hardhat': [
    { id: 'GenesisPass', x: 150, y: 100, kind: 'core' },
    { id: 'MerkleWhitelist', x: 420, y: 80, kind: 'core' },
    { id: 'RoyaltySplitter', x: 420, y: 250, kind: 'core' },
    { id: 'ERC721', x: 150, y: 330, kind: 'oz' },
    { id: 'Ownable', x: 640, y: 180, kind: 'oz' },
    { id: 'IERC2981', x: 640, y: 330, kind: 'iface' }
  ],
  'cross-chain-bridge': [
    { id: 'BridgeMessenger', x: 380, y: 90, kind: 'core' },
    { id: 'OracleAggregator', x: 130, y: 250, kind: 'core' },
    { id: 'TokenLocker', x: 630, y: 250, kind: 'core' },
    { id: 'Ownable', x: 250, y: 370, kind: 'oz' },
    { id: 'ReentrancyGuard', x: 520, y: 370, kind: 'oz' },
    { id: 'SafeERC20', x: 630, y: 110, kind: 'oz' }
  ],
  'custom': [
    { id: 'Contract A', x: 180, y: 110, kind: 'core' },
    { id: 'Contract B', x: 520, y: 110, kind: 'core' },
    { id: 'Ownable', x: 350, y: 320, kind: 'oz' }
  ]
};

const KIND_STYLE = {
  core: { fill: '#101320', stroke: '#00F0FF', text: '#e0fbff' },
  oz: { fill: '#12161d', stroke: '#10b981', text: '#a7f3d0' },
  iface: { fill: '#12161d', stroke: '#52525b', text: '#d4d4d8' }
};

export const RepoImporterView: React.FC<RepoImporterViewProps> = ({
  showToast = (_msg?: string, _type?: 'ok' | 'err' | 'warn' | 'info') => {}
}) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/botchain-defi/defi-vault-foundry');
  const [activeKey, setActiveKey] = useState('defi-vault-foundry');
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>(() => {
    return REPOS['defi-vault-foundry'].map(f => ({
      ...f,
      scanned: f.score !== null,
      sel: true
    }));
  });
  const [nodes, setNodes] = useState<GraphNode[]>(() => {
    return GRAPH_LAYOUT['defi-vault-foundry'].map(n => ({ ...n }));
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ pct: number; label: string }>({ pct: 0, label: '' });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; nodeX: number; nodeY: number } | null>(null);

  const loadRepo = (key: string) => {
    setActiveKey(key);
    const files = (REPOS[key] || REPOS['defi-vault-foundry']).map(f => ({
      ...f,
      scanned: f.score !== null,
      sel: true
    }));
    setRepoFiles(files);
    setNodes((GRAPH_LAYOUT[key] || GRAPH_LAYOUT['custom']).map(n => ({ ...n })));
    setSelectedNodeId(null);
    showToast(`Repo dimuat: ${files.length} file Solidity terdeteksi.`, 'ok');
  };

  // Build edges
  const edges = useMemo(() => {
    const edgeList: { a: string; b: string; k: 'inherits' | 'calls' }[] = [];
    repoFiles.forEach(f => {
      const base = f.p.split('/').pop()?.replace('.sol', '') || '';
      const from = nodes.find(n => n.id === base);
      if (!from) return;
      f.inherits.forEach(i => {
        const t = nodes.find(n => n.id === i);
        if (t) edgeList.push({ a: from.id, b: t.id, k: 'inherits' });
      });
      f.calls.forEach(c => {
        const t = c.split('.')[0];
        const to = nodes.find(n => n.id === t);
        if (to && to.id !== from.id) edgeList.push({ a: from.id, b: to.id, k: 'calls' });
      });
    });
    return edgeList;
  }, [repoFiles, nodes]);

  // Aggregate stats
  const scannedFiles = repoFiles.filter(f => f.scanned && f.score !== null);
  const totalLoc = repoFiles.reduce((s, f) => s + f.loc, 0);
  const totalCalls = repoFiles.reduce((s, f) => s + f.calls.length, 0);
  const avgScore = scannedFiles.length
    ? Math.round(scannedFiles.reduce((s, f) => s + (f.score || 0), 0) / scannedFiles.length)
    : 0;

  // Batch scan simulation
  const handleBatchScan = () => {
    const targets = repoFiles.map((f, i) => i).filter(i => repoFiles[i].sel);
    if (!targets.length) {
      showToast('Pilih minimal satu file.', 'warn');
      return;
    }
    setIsScanning(true);
    let done = 0;
    const interval = setInterval(() => {
      if (done >= targets.length) {
        clearInterval(interval);
        setIsScanning(false);
        setScanProgress({ pct: 100, label: 'Batch audit selesai ✓' });
        showToast(`Batch audit ${targets.length} kontrak selesai.`, 'ok');
        return;
      }
      const idx = targets[done];
      setRepoFiles(prev => {
        const next = [...prev];
        const f = next[idx];
        const assignedScore = f.score !== null
          ? f.score
          : Math.max(18, Math.min(99, 100 - Math.floor((f.loc % 7) * 9) - (f.p.includes('test') || f.p.includes('interfaces') ? 0 : 12)));
        next[idx] = { ...f, score: assignedScore, scanned: true };
        return next;
      });
      done++;
      const pct = Math.round((done / targets.length) * 100);
      setScanProgress({ pct, label: `Scanning ${repoFiles[targets[done - 1]]?.p}` });
    }, 380);
  };

  // Drag and drop custom file analysis
  const handleFileDrop = (files: File[]) => {
    const sols = files.filter(f => f.name.endsWith('.sol'));
    if (!sols.length) {
      showToast(`Hanya file .sol yang dianalisis (${files.length} file diterima).`, 'warn');
      return;
    }
    let pending = sols.length;
    sols.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result || '');
        const loc = src.split('\n').length;
        let s = 96;
        if (/tx\.origin/.test(src)) s -= 30;
        if (/\.call\s*\{\s*value/.test(src) && !/nonReentrant/.test(src)) s -= 28;
        if (/delegatecall/.test(src)) s -= 12;
        if (/selfdestruct/.test(src)) s -= 25;
        const score = Math.max(8, Math.min(99, s));
        const inheritsMatch = src.match(/contract\s+\w+\s+is\s+([^{]+)\{/);
        const inherits = inheritsMatch ? inheritsMatch[1].split(',').map(x => x.trim()) : [];

        setRepoFiles(prev => [
          ...prev,
          {
            p: file.name,
            loc,
            score,
            scanned: true,
            sel: true,
            inherits,
            calls: []
          }
        ]);

        pending--;
        if (pending === 0) {
          showToast(`${sols.length} file .sol dianalisis lokal.`, 'ok');
        }
      };
      reader.readAsText(file);
    });
  };

  // Drag handler for SVG nodes
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      nodeX: node.x,
      nodeY: node.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !svgRef.current) return;
    const { id, startX, startY, nodeX, nodeY } = dragRef.current;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 440 / rect.height;

    const dx = (e.clientX - startX) * scaleX;
    const dy = (e.clientY - startY) * scaleY;

    setNodes(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              x: Math.max(90, Math.min(710, Math.round(nodeX + dx))),
              y: Math.max(34, Math.min(400, Math.round(nodeY + dy)))
            }
          : n
      )
    );
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const selectedFile = repoFiles.find(f => f.p.split('/').pop()?.replace('.sol', '') === selectedNodeId);

  return (
    <section id="view-repo" className="space-y-5" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyber/25">
        <div className="absolute inset-0 suite-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40"></div>
        <div className="relative p-6 flex flex-wrap items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-xl border border-cyber/40 bg-cyber/10 text-cyber">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="chip text-[10px] font-extrabold tracking-[0.25em] uppercase text-cyber">Priority #5 · Multi-Contract</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">GitHub & Multi-File Repository Importer</h1>
            <p className="mt-1 text-[13px] text-zinc-400">
              Impor proyek Foundry atau Hardhat utuh — batch audit seluruh kontrak dalam satu klik dan inspeksi graph topologi relasi pewarisan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="chip h-9 px-3 inline-flex items-center rounded-lg border border-zinc-700 bg-ink-800/80 font-mono text-[11px] text-zinc-400">
              {repoFiles.length} contracts loaded
            </span>
          </div>
        </div>
      </div>

      {/* Repo Input Box & Drag/Drop */}
      <div className="rounded-2xl border border-zinc-800 bg-ink-800 p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <input
            id="repoUrl"
            type="text"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/org/repo"
            className="flex-1 min-w-[280px] rounded-xl border border-zinc-700 bg-ink-900 px-4 py-2.5 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyber outline-none"
          />
          <button
            id="loadRepo"
            onClick={() => {
              const matched = Object.keys(REPOS).find(k => repoUrl.includes(k)) || 'defi-vault-foundry';
              loadRepo(matched);
            }}
            className="chip h-10 px-5 rounded-xl bg-cyber text-ink-900 text-xs font-extrabold hover:brightness-110 transition cursor-pointer"
          >
            Load Repo
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="text-zinc-500">Presets:</span>
          {[
            { label: 'defi-vault (Foundry)', key: 'defi-vault-foundry' },
            { label: 'nft-minting (Hardhat)', key: 'nft-minting-hardhat' },
            { label: 'cross-chain-bridge', key: 'cross-chain-bridge' }
          ].map(p => (
            <button
              key={p.key}
              onClick={() => {
                setRepoUrl(`https://github.com/botchain-defi/${p.key}`);
                loadRepo(p.key);
              }}
              className={`repo-preset chip h-7 px-3 rounded-lg border text-[10.5px] font-bold transition-colors cursor-pointer ${
                activeKey === p.key
                  ? 'border-cyber/50 bg-cyber/10 text-cyber'
                  : 'border-zinc-700 bg-ink-700 text-zinc-300 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Drag & Drop File Zone */}
        <div
          id="dropzone"
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const files = (Array.from(e.dataTransfer.files || []) as unknown) as File[];
            handleFileDrop(files);
          }}
          className="rounded-xl border border-dashed border-zinc-700 bg-ink-900/60 p-4 text-center hover:border-cyber/50 transition-colors"
        >
          <input
            id="fileInput"
            type="file"
            multiple
            accept=".sol"
            onChange={e => {
              const files = (Array.from(e.target.files || []) as unknown) as File[];
              handleFileDrop(files);
            }}
            className="hidden"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="M12 12v9" />
              <path d="m8 17 4-4 4 4" />
            </svg>
            <p className="text-xs text-zinc-300">
              Drop multiple file <span className="text-cyber font-mono font-bold">.sol</span> di sini atau klik untuk browse lokal
            </p>
          </label>
        </div>
      </div>

      <div className="grid xl:grid-cols-[380px_minmax(0,1fr)] gap-5 items-start">
        {/* Left Column: File Tree & Batch Audit */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden space-y-4">
          <div className="p-4 border-b border-zinc-800 bg-ink-850 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Repository Tree</p>
              <h3 className="text-sm font-extrabold text-white">{repoFiles.length} contracts</h3>
            </div>
            <button
              id="scanAll"
              disabled={isScanning}
              onClick={handleBatchScan}
              className="chip h-9 px-4 rounded-lg bg-cyber text-ink-900 text-xs font-extrabold hover:brightness-110 transition cursor-pointer"
            >
              {isScanning ? 'Scanning…' : 'Batch Audit All'}
            </button>
          </div>

          {/* Batch progress */}
          {isScanning && (
            <div id="batchBar" className="px-4">
              <div className="flex justify-between font-mono text-[10px] text-zinc-400 mb-1">
                <span id="batchLabel">{scanProgress.label}</span>
                <span id="batchPct" className="text-cyber font-bold">{scanProgress.pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-ink-700 overflow-hidden">
                <div
                  id="batchFill"
                  className="h-full bg-cyber transition-all duration-300"
                  style={{ width: `${scanProgress.pct}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* File list */}
          <div id="fileTree" className="divide-y divide-zinc-800/80 max-h-[440px] overflow-y-auto scroll-thin">
            {repoFiles.map((f, i) => {
              const g = f.score !== null ? gradeOf(f.score) : null;
              return (
                <div key={f.p} className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-700/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={f.sel}
                    onChange={e => {
                      const checked = e.target.checked;
                      setRepoFiles(prev => prev.map((item, idx) => idx === i ? { ...item, sel: checked } : item));
                    }}
                    className="w-4 h-4 accent-cyan-400 shrink-0 cursor-pointer"
                  />
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-zinc-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M14 3v5h5" />
                    <path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                  </svg>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[11.5px] text-zinc-200 truncate">{f.p}</span>
                    <span className="block font-mono text-[10px] text-zinc-600">
                      {f.loc} LOC{f.inherits.length ? ` · inherits ${f.inherits.join(', ')}` : ''}
                    </span>
                  </span>
                  {f.scanned && g ? (
                    <span className={`chip h-6 px-2 inline-flex items-center rounded border font-mono text-[10px] font-extrabold ${g.chip}`}>
                      {f.score}
                    </span>
                  ) : (
                    <span className="chip h-6 px-2 inline-flex items-center rounded border border-zinc-700 bg-ink-700 font-mono text-[10px] text-zinc-500">
                      not scanned
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="p-4 border-t border-zinc-800 bg-ink-850 flex items-center gap-4">
            <div
              id="repoRing"
              className="shrink-0"
              dangerouslySetInnerHTML={{ __html: ringSVG(avgScore, 52, 4) }}
            ></div>
            <div className="min-w-0 text-[11px] font-mono">
              <p className="text-zinc-300 font-bold">
                Portfolio Avg: <span className="text-cyber">{avgScore}/100</span>
              </p>
              <p className="text-zinc-500">
                {totalLoc.toLocaleString('en-US')} total LOC · {totalCalls} external calls
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contract Dependency Graph */}
        <div className="rounded-2xl border border-zinc-800 bg-ink-800 overflow-hidden space-y-0">
          <div className="p-4 border-b border-zinc-800 bg-ink-850 flex flex-wrap items-center gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Interactive Architecture</p>
              <h3 className="text-sm font-extrabold text-white">Contract Dependency & Inheritance Graph</h3>
            </div>
            <span className="flex-1"></span>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyber"></span> Core
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-safe"></span> OpenZeppelin
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600"></span> Interface
              </span>
              <button
                id="graphReset"
                onClick={() => {
                  setSelectedNodeId(null);
                  setNodes((GRAPH_LAYOUT[activeKey] || GRAPH_LAYOUT['custom']).map(n => ({ ...n })));
                  showToast('Layout graph direset.', 'info');
                }}
                className="chip h-7 px-2.5 rounded-md border border-zinc-700 bg-ink-700 text-zinc-300 hover:text-white cursor-pointer"
              >
                Reset layout
              </button>
            </div>
          </div>

          <div className="bg-ink-950 p-2 select-none relative">
            <svg
              ref={svgRef}
              id="depGraph"
              viewBox="0 0 800 440"
              className="w-full h-auto min-h-[360px]"
            >
              <defs>
                <marker id="gArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="#52525b" />
                </marker>
                <marker id="gArrowHi" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="#00F0FF" />
                </marker>
              </defs>

              {/* Edges */}
              {edges.map((e, idx) => {
                const a = nodes.find(n => n.id === e.a);
                const b = nodes.find(n => n.id === e.b);
                if (!a || !b) return null;
                const isHi = selectedNodeId === e.a || selectedNodeId === e.b;
                const mx = (a.x + b.x) / 2;
                const my = (a.y + b.y) / 2 - 30;

                return (
                  <g key={idx}>
                    <path
                      d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`}
                      fill="none"
                      stroke={isHi ? '#00F0FF' : '#3f3f46'}
                      strokeWidth={isHi ? 2 : 1.3}
                      markerEnd={isHi ? 'url(#gArrowHi)' : 'url(#gArrow)'}
                      opacity={selectedNodeId && !isHi ? 0.3 : 0.9}
                      strokeDasharray={e.k === 'inherits' ? undefined : '5 4'}
                    />
                    {isHi && (
                      <text x={mx} y={my - 4} textAnchor="middle" fontSize="9.5" fill="#67e8f9" fontFamily="monospace">
                        {e.k}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(n => {
                const k = KIND_STYLE[n.kind] || KIND_STYLE.core;
                const isSel = selectedNodeId === n.id;
                const rec = repoFiles.find(f => f.p.split('/').pop()?.replace('.sol', '') === n.id);

                return (
                  <g
                    key={n.id}
                    className="gnode cursor-move"
                    transform={`translate(${n.x},${n.y})`}
                    onClick={() => setSelectedNodeId(prev => prev === n.id ? null : n.id)}
                    onPointerDown={e => handlePointerDown(n.id, e)}
                  >
                    <rect
                      x="-84"
                      y="-24"
                      width="168"
                      height="48"
                      rx="12"
                      fill={k.fill}
                      stroke={isSel ? '#00F0FF' : k.stroke}
                      strokeWidth={isSel ? 2.2 : 1.2}
                      style={{ filter: isSel ? 'drop-shadow(0 0 10px rgba(0,240,255,.45))' : undefined }}
                    />
                    <text x="0" y="-3" textAnchor="middle" fontSize="12" fontWeight="700" fill={k.text}>
                      {esc(n.id)}
                    </text>
                    <text x="0" y="14" textAnchor="middle" fontSize="9.5" fill="#71717a" fontFamily="monospace">
                      {rec ? (rec.scanned ? `score ${rec.score ?? '—'} · ${rec.loc} LOC` : `${rec.loc} LOC`) : n.kind}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div id="nodeDetail" className="p-4 border-t border-zinc-800 bg-ink-850 font-mono text-[11.5px] text-zinc-400">
            {selectedFile && selectedNodeId ? (
              <div>
                <span className="text-zinc-200 font-bold">{selectedFile.p}</span> · {selectedFile.loc} LOC ·{' '}
                {selectedFile.scanned && selectedFile.score !== null ? (
                  <>score <span style={{ color: gradeOf(selectedFile.score).color }}>{selectedFile.score}</span></>
                ) : (
                  'not scanned'
                )}
                <div className="mt-1 text-zinc-600">
                  inherits: {selectedFile.inherits.join(', ') || '—'} · external calls: {selectedFile.calls.join(', ') || 'none'}
                </div>
              </div>
            ) : (
              'Klik node untuk melihat detail kontrak, pewarisan, dan panggilan eksternal. Drag node untuk memindahkan posisinya.'
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
