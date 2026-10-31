import React, { useState } from 'react';
import { 
  INITIAL_NEO4J_NODES, 
  INITIAL_NEO4J_RELATIONSHIPS, 
  SAMPLE_CYPHER_QUERIES 
} from '../../data/trackMockData';
import type { Neo4jNode } from '../../types';
import { 
  Network, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Database,
  Filter
} from 'lucide-react';

export const Neo4jGraphExplorer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<Neo4jNode | null>(INITIAL_NEO4J_NODES[0]);
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [queryExecuted, setQueryExecuted] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number>(8.4);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setQueryExecuted(true);
      setLatencyMs(Number((6.5 + Math.random() * 3.5).toFixed(1)));
    }, 280);
  };

  const getNodeColor = (type: Neo4jNode['type']) => {
    switch (type) {
      case 'PATIENT': return { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', dot: '#DC2626' };
      case 'HOSPITAL': return { bg: '#ECFDF5', border: '#10B981', text: '#065F46', dot: '#059669' };
      case 'DOCTOR': return { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', dot: '#2563EB' };
      case 'SPECIALTY': return { bg: '#FAF5FF', border: '#A855F7', text: '#6B21A8', dot: '#9333EA' };
      case 'EQUIPMENT': return { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', dot: '#D97706' };
      case 'BED': return { bg: '#EEF2FF', border: '#6366F1', text: '#3730A3', dot: '#4F46E5' };
      case 'ALLERGY': return { bg: '#FFF1F2', border: '#F43F5E', text: '#9F1239', dot: '#E11D48' };
      default: return { bg: '#F8FAFC', border: '#94A3B8', text: '#334155', dot: '#64748B' };
    }
  };

  const filteredNodes = selectedTypeFilter === 'ALL'
    ? INITIAL_NEO4J_NODES
    : INITIAL_NEO4J_NODES.filter(n => n.type === selectedTypeFilter);

  return (
    <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 border border-emerald-500/30 space-y-5 oled-glow-emerald bg-white/80 backdrop-blur-2xl shadow-xl">
      {/* Track Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <Network className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold">
                NEO4J TRACK: KNOWLEDGE GRAPH ENGINE
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                Cypher 5.x • Index-Free Adjacency
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Real-Time Emergency Multi-Resource Graph Traversal
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold">
            <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Neo4j Engine Active ({latencyMs}ms)</span>
          </span>
        </div>
      </div>

      {/* Why Neo4j Callout */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-xs flex items-start gap-2.5 text-emerald-950 font-mono shadow-2xs">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Why Neo4j solves this better than relational SQL:</strong> Emergency hospital allocation is a high-stakes multi-constraint graph problem. SQL requires 6+ complex table JOINs that choke under high concurrency. Neo4j executes pointer-hopping traversal across <strong>(Emergency) ➔ (Specialty) ➔ (Free Doctor) ➔ (Hospital) ➔ (Locked ICU Bay)</strong> in <strong>{latencyMs}ms</strong> with zero schema bottlenecks.
        </p>
      </div>

      {/* Filter and Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-700 uppercase text-[10px]">Filter Graph:</span>
          {['ALL', 'PATIENT', 'HOSPITAL', 'DOCTOR', 'SPECIALTY', 'BED', 'EQUIPMENT', 'ALLERGY'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                selectedTypeFilter === type
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-slate-400 hidden sm:inline">
          💡 Click any node to inspect properties & relationships
        </span>
      </div>

      {/* Responsive Graph Canvas (Fixed Height & Safe Overflow) */}
      <div className="relative w-full rounded-2xl border border-slate-200/90 shadow-inner bg-slate-50/50 overflow-x-auto">
        <div className="relative min-w-[780px] h-[420px] p-2 bg-gradient-to-b from-white/90 to-slate-50/80">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-70"></div>

          {/* SVG Canvas for Relationship Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>
              <marker id="arrow-allergy" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
              </marker>
            </defs>

            {INITIAL_NEO4J_RELATIONSHIPS.map((rel) => {
              const src = INITIAL_NEO4J_NODES.find(n => n.id === rel.source);
              const tgt = INITIAL_NEO4J_NODES.find(n => n.id === rel.target);
              if (!src || !tgt || src.x === undefined || tgt.x === undefined || src.y === undefined || tgt.y === undefined) return null;

              const isAllergy = rel.type.includes('ALLERGY');
              const lineColor = isAllergy ? '#F87171' : '#94A3B8';
              const markerId = isAllergy ? 'url(#arrow-allergy)' : 'url(#arrow)';

              return (
                <g key={rel.id}>
                  <line
                    x1={src.x + 60}
                    y1={src.y + 18}
                    x2={tgt.x + 60}
                    y2={tgt.y + 18}
                    stroke={lineColor}
                    strokeWidth={isExecuting ? '2.5' : '1.75'}
                    strokeDasharray={isAllergy ? '4 3' : 'none'}
                    markerEnd={markerId}
                    className="transition-all duration-300"
                  />
                  <rect
                    x={(src.x + tgt.x) / 2 + 10}
                    y={(src.y + tgt.y) / 2 + 6}
                    width={rel.label.length * 6.5 + 8}
                    height="16"
                    rx="4"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <text
                    x={(src.x + tgt.x) / 2 + 10 + (rel.label.length * 6.5 + 8) / 2}
                    y={(src.y + tgt.y) / 2 + 18}
                    fontSize="9"
                    fontFamily="monospace"
                    fill={isAllergy ? '#DC2626' : '#475569'}
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {rel.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Graph Nodes */}
          {filteredNodes.map((node) => {
            const colors = getNodeColor(node.type);
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`absolute z-10 px-3 py-2 rounded-2xl border-2 text-xs font-mono cursor-pointer transition-all duration-200 shadow-sm flex items-center gap-2 select-none ${
                  isSelected ? 'scale-110 shadow-xl ring-4 ring-emerald-500/25 z-20' : 'hover:scale-105'
                }`}
                style={{
                  left: `${node.x ?? 0}px`,
                  top: `${node.y ?? 0}px`,
                  backgroundColor: colors.bg,
                  borderColor: isSelected ? colors.dot : colors.border,
                  color: colors.text,
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: colors.dot }}></span>
                <span className="font-bold text-[11px] truncate max-w-[150px]">{node.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspector + Cypher Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Node Properties Inspector */}
        <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 space-y-2 font-mono text-xs shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900">
                Neo4j Node Inspector: {selectedNode?.label}
              </span>
            </div>
            {selectedNode && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                (:{selectedNode.type})
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-2 pt-1 text-[11px]">
              <div className="text-[10px] text-slate-400">Node Graph Identifier: <strong className="text-slate-700">{selectedNode.id}</strong></div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                {Object.entries(selectedNode.properties).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                    <span className="text-slate-500 font-semibold">{k}:</span>
                    <span className="font-bold text-slate-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-center py-4">Click any node above to inspect its graph properties</div>
          )}
        </div>

        {/* Live Cypher Query Console */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-3 font-mono text-xs shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">Neo4j Cypher Query Console</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeQueryIndex}
                onChange={(e) => setActiveQueryIndex(Number(e.target.value))}
                className="bg-slate-800 text-[10px] text-slate-300 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none cursor-pointer"
              >
                {SAMPLE_CYPHER_QUERIES.map((q, idx) => (
                  <option key={idx} value={idx}>{q.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleRunQuery}
                disabled={isExecuting}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
              >
                {isExecuting ? (
                  <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-2.5 h-2.5" />
                )}
                <span>Run</span>
              </button>
            </div>
          </div>

          <pre className="text-[10px] text-emerald-300 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed select-all">
            {SAMPLE_CYPHER_QUERIES[activeQueryIndex].cypher}
          </pre>

          {queryExecuted && (
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Traversal Success: 3 Matches Found in {latencyMs}ms</span>
              </span>
              <span>Adjacency Hops: 5 Hops</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
