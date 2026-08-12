import React, { useState } from 'react';
import { TabType, CertificateTransaction } from './types/blockchain';
import { createInitialBlockchain, mineBlockInChain } from './services/csharpBlockchainEngine';
import { CONSORTIUM_UNIVERSITIES, ConsortiumUniversityNode } from './data/consortiumUniversities';
import { Header } from './components/Header';
import { VerifierPortal } from './components/VerifierPortal';
import { IssuerPortal } from './components/IssuerPortal';
import { StudentVault } from './components/StudentVault';
import { ChainExplorer } from './components/ChainExplorer';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('verify');
  const [blockchainState, setBlockchainState] = useState(() => createInitialBlockchain());
  const [selectedVaultCert, setSelectedVaultCert] = useState<CertificateTransaction | null>(null);
  const [verifySearchQuery, setVerifySearchQuery] = useState<string>('NEBULA-2026-CS-001');
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [activeUniversity, setActiveUniversity] = useState<ConsortiumUniversityNode>(CONSORTIUM_UNIVERSITIES[0]);

  const toggleTheme = () => {
    setIsLightMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
      return next;
    });
  };

  const { chain, pendingTxs } = blockchainState;

  // Mine pending transactions onto block
  const handleMineBlock = (nodeName: string, difficulty: number = 3) => {
    if (pendingTxs.length === 0) {
      // Demo tx if mempool empty
      const demoTx: CertificateTransaction = {
        id: `tx-${Date.now()}`,
        certificateId: `NEBULA-2026-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: 'Jordan Vance',
        studentId: 'STU-772910',
        universityName: nodeName || 'Nebula Technological University',
        degreeName: 'Bachelor of Science',
        major: 'Computer Science',
        classification: 'First Class Honors',
        issueDate: new Date().toISOString().split('T')[0],
        graduationYear: 2026,
        gpa: '3.95',
        certificateHash: '89a2b109c37e94f8101239840291049201948291048201948291048201948291',
        digitalSignature: 'SIG_RSA2048_NEBULA_MINTED_DEMO',
        status: 'ACTIVE',
        timestamp: Math.floor(Date.now() / 1000)
      };

      const result = mineBlockInChain(chain, [demoTx], nodeName, difficulty);
      setBlockchainState({
        chain: result.updatedChain,
        pendingTxs: []
      });
    } else {
      const result = mineBlockInChain(chain, pendingTxs, nodeName, difficulty);
      setBlockchainState({
        chain: result.updatedChain,
        pendingTxs: []
      });
    }
  };

  const handleRevokeCertificate = (certId: string) => {
    // Search chain and update status
    const updatedChain = chain.map(block => {
      const updatedTxs = block.transactions.map(tx => {
        if (tx.certificateId.toLowerCase() === certId.toLowerCase() || tx.certificateHash.toLowerCase() === certId.toLowerCase() || tx.studentId.toLowerCase() === certId.toLowerCase()) {
          return { ...tx, status: 'REVOKED' as const };
        }
        return tx;
      });
      return { ...block, transactions: updatedTxs };
    });

    // Also update in pendingTxs if any
    const updatedPending = pendingTxs.map(tx => {
      if (tx.certificateId.toLowerCase() === certId.toLowerCase() || tx.certificateHash.toLowerCase() === certId.toLowerCase() || tx.studentId.toLowerCase() === certId.toLowerCase()) {
        return { ...tx, status: 'REVOKED' as const };
      }
      return tx;
    });

    setBlockchainState({
      chain: updatedChain,
      pendingTxs: updatedPending
    });
  };

  const handleSelectCertForVault = (cert: CertificateTransaction) => {
    setSelectedVaultCert(cert);
    setActiveTab('vault');
  };

  const handleVerifyCertQuery = (query: string) => {
    setVerifySearchQuery(query);
    setActiveTab('verify');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col relative overflow-x-hidden selection:bg-indigo-500 selection:text-white bg-grid-pattern">
      {/* Subdued Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navigation Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blockCount={chain.length}
        pendingCount={pendingTxs.length}
        isLightMode={isLightMode}
        toggleTheme={toggleTheme}
        activeUniversity={activeUniversity}
        setActiveUniversity={setActiveUniversity}
      />

      {/* Main Tab Content */}
      <main className="flex-1 z-10">
        {activeTab === 'verify' && (
          <VerifierPortal
            chain={chain}
            pendingTxs={pendingTxs}
            initialQuery={verifySearchQuery}
            onSelectCertificateForVault={handleSelectCertForVault}
          />
        )}

        {activeTab === 'issue' && (
          <IssuerPortal
            chain={chain}
            pendingTxs={pendingTxs}
            setPendingTxs={(updater) => {
              if (typeof updater === 'function') {
                setBlockchainState(prev => ({ ...prev, pendingTxs: updater(prev.pendingTxs) }));
              } else {
                setBlockchainState(prev => ({ ...prev, pendingTxs: updater }));
              }
            }}
            onMineBlock={handleMineBlock}
            onRevokeCertificate={handleRevokeCertificate}
            onSelectCertificateForVault={handleSelectCertForVault}
            onVerifyCertificate={handleVerifyCertQuery}
            activeUniversity={activeUniversity}
            setActiveUniversity={setActiveUniversity}
          />
        )}

        {activeTab === 'vault' && (
          <StudentVault
            chain={chain}
            pendingTxs={pendingTxs}
            selectedCert={selectedVaultCert}
            onVerifyCertificate={handleVerifyCertQuery}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'explorer' && (
          <ChainExplorer
            chain={chain}
            pendingTxs={pendingTxs}
            onMineBlock={handleMineBlock}
            isLightMode={isLightMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="z-10 bg-[#0b0f19]/90 border-t border-slate-800/80 backdrop-blur-md py-6 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="tracking-wide">© 2026 NEBULA BLOCKCHAIN SYSTEMS • Academic Certificate Verification</span>
          <span className="text-slate-400">CRYPTOGRAPHIC ENGINE: .NET C# SHA-256 & RSA-2048</span>
        </div>
      </footer>
    </div>
  );
}
