import React, { useState } from 'react';
import { TabType } from '../types/blockchain';
import { CONSORTIUM_UNIVERSITIES, ConsortiumUniversityNode } from '../data/consortiumUniversities';
import { UniversityLogo } from './UniversityLogo';
import { Shield, University, Award, Network, Cpu, FileCheck, Wallet, CheckCircle2, Sun, Moon, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  blockCount: number;
  pendingCount: number;
  isLightMode?: boolean;
  toggleTheme?: () => void;
  activeUniversity?: ConsortiumUniversityNode;
  setActiveUniversity?: (uni: ConsortiumUniversityNode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  blockCount,
  pendingCount,
  isLightMode = false,
  toggleTheme,
  activeUniversity = CONSORTIUM_UNIVERSITIES[0],
  setActiveUniversity
}) => {
  const [showNodeSelector, setShowNodeSelector] = useState<boolean>(false);

  const currentWalletDisplay = `${activeUniversity.walletAddress.substring(0, 6)}...${activeUniversity.walletAddress.substring(36)}`;

  return (
    <header className="bg-[#0b0f19]/90 border-b border-slate-800/80 text-white sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between py-2.5 gap-3">
          
          {/* Top Row / Left: Logo & Brand + Mobile Controls */}
          <div className="flex items-center justify-between shrink-0 gap-4">
            {/* Logo & System Name */}
            <div className="flex items-center space-x-3 cursor-pointer group shrink-0" onClick={() => setActiveTab('verify')}>
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-slate-700/80 group-hover:border-indigo-500/50 transition bg-slate-900 flex items-center justify-center shrink-0">
                <img
                  src="/src/assets/images/nebula_logo_1786232635621.jpg"
                  alt="Nebula Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="shrink-0">
                <span className="text-lg font-bold tracking-tight text-white font-sans block leading-none">NEBULA</span>
                <p className="text-[11px] text-slate-400 hidden sm:block font-normal leading-tight mt-0.5">
                  Ghana Academic Credential Network
                </p>
              </div>
            </div>

            {/* Mobile / Tablet Controls (Node selector & Theme) */}
            <div className="flex items-center space-x-2 xl:hidden">
              <button
                onClick={() => setShowNodeSelector(!showNodeSelector)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-mono"
              >
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-amber-300">{activeUniversity.shortName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {toggleTheme && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
                >
                  {isLightMode ? <Moon className="w-4 h-4 text-slate-900" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </button>
              )}
            </div>
          </div>

          {/* Center: Main Navigation Segmented Tabs */}
          <nav className="flex items-center bg-slate-900/90 border border-slate-800/90 p-1 rounded-xl self-center xl:self-auto w-full xl:w-auto justify-start sm:justify-center overflow-x-auto no-scrollbar shrink-0">
            <button
              id="nav-tab-verify"
              onClick={() => setActiveTab('verify')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'verify'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Verify Credential</span>
            </button>

            <button
              id="nav-tab-issue"
              onClick={() => setActiveTab('issue')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'issue'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <University className="w-4 h-4" />
              <span>Registrar Portal</span>
            </button>

            <button
              id="nav-tab-vault"
              onClick={() => setActiveTab('vault')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'vault'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Student Vault</span>
            </button>

            <button
              id="nav-tab-explorer"
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'explorer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Network className="w-4 h-4 text-indigo-400" />
              <span>Chain Explorer</span>
            </button>
          </nav>

          {/* Right Section: Desktop Node Selector & Network Stats */}
          <div className="hidden xl:flex items-center space-x-3 relative shrink-0">
            {/* Network Status Pill */}
            <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold text-[11px]">ONLINE</span>
              <span className="text-slate-600">|</span>
              <div className="flex items-center space-x-1 text-[11px]">
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span className="text-indigo-300 font-bold">#{blockCount}</span>
              </div>
            </div>

            {/* University Node & Wallet Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowNodeSelector(!showNodeSelector)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs transition font-mono"
                title="Active Registrar Authority Wallet Node"
              >
                <UniversityLogo universityId={activeUniversity.id} size="sm" className="w-5 h-5 shrink-0" />
                <span className="flex items-center space-x-1.5">
                  <span className="font-bold text-amber-300">{activeUniversity.shortName}</span>
                  <span className="text-slate-500">({currentWalletDisplay})</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* University Node Dropdown Selector */}
              {showNodeSelector && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-50 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <University className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Switch Consortium Node</span>
                    </span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">Consortium</span>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {CONSORTIUM_UNIVERSITIES.map((uni) => {
                      const isActive = uni.id === activeUniversity.id;
                      return (
                        <button
                          key={uni.id}
                          onClick={() => {
                            if (setActiveUniversity) setActiveUniversity(uni);
                            setShowNodeSelector(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between border ${
                            isActive
                              ? 'bg-indigo-600/20 border-indigo-500/40 text-white font-bold'
                              : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <UniversityLogo universityId={uni.id} size="sm" className="w-6 h-6 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-white font-bold truncate">{uni.shortName}</span>
                                {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono truncate">
                                {uni.walletAddress}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0 ml-2">
                            #{uni.id.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition border shadow-sm flex items-center justify-center ${
                  isLightMode
                    ? 'bg-amber-400 text-slate-900 border-amber-500'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
                }`}
                title={isLightMode ? 'Switch to Dark Mode' : 'Switch to High-Contrast Light Mode'}
                aria-label="Toggle Theme"
              >
                {isLightMode ? (
                  <Moon className="w-4 h-4 text-slate-900" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
