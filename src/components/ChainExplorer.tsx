import React, { useState } from 'react';
import { NebulaBlock, CertificateTransaction, NodePeer } from '../types/blockchain';
import { DEFAULT_PEERS } from '../services/csharpBlockchainEngine';
import { UniversityLogo } from './UniversityLogo';
import { Network, Cpu, ArrowRight, Layers, Pickaxe, CheckCircle2, Shield, Eye, Database, Terminal, Clock, Lock } from 'lucide-react';

interface ChainExplorerProps {
  chain: NebulaBlock[];
  pendingTxs: CertificateTransaction[];
  onMineBlock: (nodeName: string, difficulty?: number) => void;
  isLightMode?: boolean;
}

export const ChainExplorer: React.FC<ChainExplorerProps> = ({
  chain,
  pendingTxs,
  onMineBlock,
  isLightMode = false
}) => {
  const [selectedBlock, setSelectedBlock] = useState<NebulaBlock>(chain[chain.length - 1]);
  const [difficulty, setDifficulty] = useState<number>(3);
  const [minerNode, setMinerNode] = useState<string>('Nebula Genesis Consortium Node');
  const [isMining, setIsMining] = useState<boolean>(false);

  const handleMine = () => {
    setIsMining(true);
    setTimeout(() => {
      onMineBlock(minerNode, difficulty);
      setIsMining(false);
      setSelectedBlock(chain[chain.length - 1]);
    }, 600);
  };

  const cardBg = isLightMode
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-sm';

  const subCardBg = isLightMode
    ? 'bg-slate-50 border-slate-200 text-slate-900'
    : 'bg-slate-950 border-slate-800 text-slate-100';

  const labelColor = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const headingColor = isLightMode ? 'text-slate-900' : 'text-slate-100';
  const valueColor = isLightMode ? 'text-slate-800' : 'text-slate-300';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className={`border rounded-2xl p-6 sm:p-8 space-y-4 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isLightMode ? 'bg-purple-100 border border-purple-200 text-purple-700' : 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
            }`}>
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${headingColor}`}>Nebula C# Blockchain Ledger Explorer</h1>
              <p className={`text-xs ${labelColor} font-light`}>
                Live visualization of blocks, Merkle roots, Proof-of-Work difficulty, and peer consortium validators
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono ${
              isLightMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-gray-300 backdrop-blur-md'
            }`}>
              <span className={labelColor}>Total Height:</span>{' '}
              <span className={isLightMode ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'}>#{chain.length}</span>
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono ${
              isLightMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-gray-300 backdrop-blur-md'
            }`}>
              <span className={labelColor}>Mempool:</span>{' '}
              <span className={isLightMode ? 'text-amber-700 font-bold' : 'text-amber-400 font-bold'}>{pendingTxs.length} pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Block Chain Sequence Graph */}
      <div className={`border rounded-2xl p-6 space-y-4 ${cardBg}`}>
        <h2 className={`text-base font-bold flex items-center space-x-2 ${headingColor}`}>
          <Layers className="w-5 h-5 text-purple-500" />
          <span>Blockchain Block Hierarchy (Click Block to Inspect)</span>
        </h2>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-2">
          {chain.map((block, idx) => {
            const isSelected = selectedBlock.index === block.index;
            return (
              <React.Fragment key={block.hash + idx}>
                <div
                  id={`block-item-${block.index}`}
                  onClick={() => setSelectedBlock(block)}
                  className={`shrink-0 w-64 p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? isLightMode
                        ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-slate-900 border-purple-500 shadow-lg ring-2 ring-purple-400 scale-105'
                        : 'bg-gradient-to-br from-purple-900/60 to-blue-900/60 text-white border-purple-500/60 shadow-xl ring-2 ring-purple-500/40 scale-105'
                      : isLightMode
                        ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-purple-400 hover:bg-slate-100'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:border-purple-500/30 hover:bg-white/10 backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        block.index === 0
                          ? isLightMode ? 'bg-purple-200 text-purple-900 border border-purple-300' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : isSelected
                          ? isLightMode ? 'bg-purple-300 text-purple-950 border border-purple-400' : 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                          : isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {block.index === 0 ? 'GENESIS BLOCK' : `BLOCK #${block.index}`}
                    </span>
                    <span className={`text-[10px] font-mono ${labelColor}`}>
                      {new Date(block.timestamp * 1000).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className={`text-[10px] uppercase tracking-wider block font-mono ${labelColor}`}>Hash:</span>
                    <p className={`text-xs font-mono font-bold truncate ${isLightMode ? 'text-purple-900' : 'text-white'}`}>{block.hash}</p>
                  </div>

                  <div className={`flex items-center justify-between pt-2 border-t text-[10px] font-mono ${
                    isLightMode ? 'border-slate-200 text-slate-600' : 'border-white/10 text-gray-300'
                  }`}>
                    <span>Tx Count: {block.transactions.length}</span>
                    <span>Nonce: {block.nonce}</span>
                  </div>
                </div>

                {idx < chain.length - 1 && (
                  <ArrowRight className={`w-5 h-5 shrink-0 ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Block Inspection + Mining Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selected Block Details */}
        <div className={`lg:col-span-2 border rounded-2xl p-6 space-y-6 ${cardBg}`}>
          <div className={`flex items-center justify-between border-b pb-4 ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-purple-500" />
              <h3 className={`text-lg font-bold ${headingColor}`}>Block #{selectedBlock.index} Inspection</h3>
            </div>
            <span className={`px-3 py-1 rounded-full font-mono text-xs border ${
              isLightMode ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            }`}>
              Target Difficulty: {selectedBlock.difficulty} Target ({'0'.repeat(selectedBlock.difficulty)})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className={`p-3 rounded-xl border space-y-1 ${subCardBg}`}>
              <span className={`${labelColor} block`}>Block SHA-256 Hash:</span>
              <p className={`${isLightMode ? 'text-emerald-800' : 'text-emerald-400'} font-bold break-all`}>{selectedBlock.hash}</p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${subCardBg}`}>
              <span className={`${labelColor} block`}>Previous Block Hash:</span>
              <p className={`${valueColor} break-all`}>{selectedBlock.previousHash}</p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${subCardBg}`}>
              <span className={`${labelColor} block`}>C# Merkle Tree Root:</span>
              <p className={`${isLightMode ? 'text-purple-800' : 'text-purple-300'} font-bold break-all`}>{selectedBlock.merkleRoot}</p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${subCardBg}`}>
              <span className={`${labelColor} block`}>Miner / Issuer Node:</span>
              <p className={`${isLightMode ? 'text-purple-800' : 'text-purple-300'} font-bold truncate`}>{selectedBlock.issuerNode}</p>
            </div>
          </div>

          {/* Block Transactions List */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${labelColor}`}>
              Transactions In Block ({selectedBlock.transactions.length})
            </h4>

            <div className="space-y-3">
              {selectedBlock.transactions.map((tx, idx) => (
                <div key={tx.id + idx} className={`p-4 rounded-xl border space-y-2 text-xs ${subCardBg}`}>
                  <div className="flex items-center justify-between font-mono">
                    <span className={`font-bold ${isLightMode ? 'text-purple-800' : 'text-purple-300'}`}>{tx.certificateId}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'ACTIVE'
                          ? isLightMode ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isLightMode ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className={`${labelColor} block text-[10px]`}>Student:</span>
                      <span className={`font-semibold ${headingColor}`}>{tx.studentName} ({tx.studentId})</span>
                    </div>
                    <div>
                      <span className={`${labelColor} block text-[10px]`}>Institution:</span>
                      <span className={`font-semibold ${headingColor}`}>{tx.universityName}</span>
                    </div>
                  </div>

                  <div className={`pt-2 border-t font-mono text-[10px] flex items-center justify-between ${
                    isLightMode ? 'border-slate-200 text-slate-500' : 'border-white/10 text-gray-400'
                  }`}>
                    <span className="truncate">Hash: {tx.certificateHash}</span>
                    <span className={`shrink-0 font-bold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>RSA Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mining Console & Consortium Nodes Sidebar */}
        <div className="space-y-6">
          {/* Mining Control Panel */}
          <div className={`border rounded-2xl p-6 space-y-4 ${cardBg}`}>
            <div className="flex items-center space-x-2">
              <Pickaxe className="w-5 h-5 text-amber-500" />
              <h3 className={`font-bold text-base ${headingColor}`}>C# Block Miner Simulator</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`${valueColor} font-semibold block mb-1`}>PoW Difficulty (Target Zeroes)</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none ${
                    isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white backdrop-blur-md'
                  }`}
                >
                  <option value={2} className={isLightMode ? 'bg-white text-slate-900' : 'bg-[#09031a]'}>Difficulty 2 (Prefix 00)</option>
                  <option value={3} className={isLightMode ? 'bg-white text-slate-900' : 'bg-[#09031a]'}>Difficulty 3 (Prefix 000)</option>
                  <option value={4} className={isLightMode ? 'bg-white text-slate-900' : 'bg-[#09031a]'}>Difficulty 4 (Prefix 0000)</option>
                </select>
              </div>

              <div>
                <label className={`${valueColor} font-semibold block mb-1`}>Validator Node Name</label>
                <input
                  type="text"
                  value={minerNode}
                  onChange={(e) => setMinerNode(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none ${
                    isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white backdrop-blur-md'
                  }`}
                />
              </div>

              <button
                id="mine-block-sidebar-btn"
                onClick={handleMine}
                disabled={isMining || pendingTxs.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-[1.01] text-slate-950 font-extrabold rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isMining ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Mining Nonce...</span>
                  </>
                ) : (
                  <>
                    <Pickaxe className="w-4 h-4" />
                    <span>Mine {pendingTxs.length} Pending Txs into Block #{chain.length}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Consortium Nodes Peer Status */}
          <div className={`border rounded-2xl p-6 space-y-4 ${cardBg}`}>
            <h3 className={`font-bold text-sm flex items-center space-x-2 ${headingColor}`}>
              <Database className="w-4 h-4 text-purple-500" />
              <span>Consortium Node Network</span>
            </h3>

            <div className="space-y-3">
              {DEFAULT_PEERS.map(peer => {
                const uniId =
                  peer.name.toLowerCase().includes('mines') || peer.name.toLowerCase().includes('umat') ? 'umat' :
                  peer.name.toLowerCase().includes('cape coast') || peer.name.toLowerCase().includes('ucc') ? 'ucc' :
                  peer.name.toLowerCase().includes('ghana') || peer.name.toLowerCase().includes('legon') ? 'ug' :
                  peer.name.toLowerCase().includes('nkrumah') || peer.name.toLowerCase().includes('knust') ? 'knust' :
                  peer.name.toLowerCase().includes('ashesi') ? 'ashesi' : 'umat';

                return (
                  <div key={peer.id} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${subCardBg}`}>
                    <div className="flex items-center space-x-3">
                      <UniversityLogo universityId={uniId} size="sm" className="w-7 h-7 shrink-0" />
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${headingColor}`}>{peer.name}</span>
                        <span className={`text-[10px] font-mono ${labelColor}`}>{peer.region}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          peer.status === 'ONLINE'
                            ? isLightMode ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isLightMode ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {peer.status}
                      </span>
                      <span className={`text-[10px] block font-mono mt-0.5 ${labelColor}`}>{peer.latencyMs}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
