import React, { useState } from 'react';
import { CertificateTransaction, NebulaBlock } from '../types/blockchain';
import { computeCertificateHash, generateRSAKeyPair, signCertificateHash } from '../services/csharpBlockchainEngine';
import { CONSORTIUM_UNIVERSITIES, ConsortiumUniversityNode } from '../data/consortiumUniversities';
import { UniversityLogo } from './UniversityLogo';
import { University, Key, Award, PlusCircle, Check, ShieldAlert, Sparkles, RefreshCw, FileSpreadsheet, Layers, Search, ShieldCheck, ExternalLink, Copy, Upload, Download, Lock, Unlock, Shield, LogOut, CheckCircle2, Wallet, UserCheck } from 'lucide-react';

interface IssuerPortalProps {
  chain: NebulaBlock[];
  pendingTxs: CertificateTransaction[];
  setPendingTxs: React.Dispatch<React.SetStateAction<CertificateTransaction[]>>;
  onMineBlock: (nodeName: string) => void;
  onRevokeCertificate: (certId: string) => void;
  onSelectCertificateForVault?: (cert: CertificateTransaction) => void;
  onVerifyCertificate?: (query: string) => void;
  activeUniversity?: ConsortiumUniversityNode;
  setActiveUniversity?: (uni: ConsortiumUniversityNode) => void;
}

export const IssuerPortal: React.FC<IssuerPortalProps> = ({
  chain,
  pendingTxs,
  setPendingTxs,
  onMineBlock,
  onRevokeCertificate,
  onSelectCertificateForVault,
  onVerifyCertificate,
  activeUniversity = CONSORTIUM_UNIVERSITIES[0],
  setActiveUniversity
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'single' | 'batch' | 'keys' | 'revoke'>('single');

  // Registrar Authentication Security Lock State
  const [isRegistrarAuthenticated, setIsRegistrarAuthenticated] = useState<boolean>(false);
  const [registrarPin, setRegistrarPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Key Pair State
  const [keys, setKeys] = useState<{ publicKeyPem: string; privateKeyPem: string }>(() => generateRSAKeyPair());

  // Form State initialized from activeUniversity
  const [selectedNode, setSelectedNode] = useState<ConsortiumUniversityNode>(activeUniversity);
  const [studentName, setStudentName] = useState<string>(activeUniversity.defaultStudent.studentName);
  const [studentId, setStudentId] = useState<string>(activeUniversity.defaultStudent.studentId);
  const [universityName, setUniversityName] = useState<string>(activeUniversity.name);
  const [degreeName, setDegreeName] = useState<string>(activeUniversity.defaultStudent.degreeName);
  const [major, setMajor] = useState<string>(activeUniversity.defaultStudent.major);
  const [classification, setClassification] = useState<string>(activeUniversity.defaultStudent.classification);
  const [gpa, setGPA] = useState<string>(activeUniversity.defaultStudent.gpa);
  const [certificateId, setCertificateId] = useState<string>(`NEBULA-2026-${activeUniversity.shortName}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Keep internal selectedNode synced with activeUniversity if activeUniversity changes externally
  React.useEffect(() => {
    setSelectedNode(activeUniversity);
    setUniversityName(activeUniversity.name);
  }, [activeUniversity]);

  const handleSelectUniversityNode = (node: ConsortiumUniversityNode) => {
    setSelectedNode(node);
    if (setActiveUniversity) {
      setActiveUniversity(node);
    }
    setUniversityName(node.name);
    setStudentName(node.defaultStudent.studentName);
    setStudentId(node.defaultStudent.studentId);
    setDegreeName(node.defaultStudent.degreeName);
    setMajor(node.defaultStudent.major);
    setClassification(node.defaultStudent.classification);
    setGPA(node.defaultStudent.gpa);
    setCertificateId(`NEBULA-2026-${node.shortName}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const [issueSuccess, setIssueSuccess] = useState<string | null>(null);
  const [lastIssuedCert, setLastIssuedCert] = useState<CertificateTransaction | null>(null);
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  // Revoke state
  const [revokeCertId, setRevokeCertId] = useState<string>('');
  const [revokeMsg, setRevokeMsg] = useState<string | null>(null);

  // Batch state
  const [parsedStudents, setParsedStudents] = useState<{ studentName: string; studentId: string; degreeName: string; major: string; gpa: string; classification: string }[]>([]);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  const parseBatchFile = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
      if (row.length === 0 || row.every(c => !c)) continue;

      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx] || '';
      });

      const sName = obj['student name'] || obj['studentname'] || obj['name'] || row[0] || 'Unknown Student';
      const sId = obj['student id'] || obj['studentid'] || obj['id'] || row[1] || `STU-${Math.floor(10000 + Math.random() * 90000)}`;
      const sDeg = obj['degree name'] || obj['degreename'] || obj['degree'] || row[2] || 'Bachelor of Science';
      const sMaj = obj['major'] || obj['department'] || row[3] || 'Computer Science';
      const sGpa = obj['gpa'] || row[4] || '3.80';
      const sClass = obj['classification'] || row[5] || 'First Class Honors';

      results.push({
        studentName: sName,
        studentId: sId,
        degreeName: sDeg,
        major: sMaj,
        gpa: sGpa,
        classification: sClass
      });
    }

    return results;
  };

  const handleIssueParsedBatch = () => {
    if (parsedStudents.length === 0) return;

    const newTxs: CertificateTransaction[] = parsedStudents.map((item, idx) => {
      const certId = `NEBULA-2026-BATCH-${Math.floor(1000 + Math.random() * 9000)}-${idx + 1}`;
      const certHash = computeCertificateHash({
        certificateId: certId,
        studentName: item.studentName,
        studentId: item.studentId,
        universityName,
        degreeName: item.degreeName,
        major: item.major,
        classification: item.classification,
        issueDate,
        graduationYear: new Date(issueDate).getFullYear() || 2026,
        gpa: item.gpa
      });

      const sig = signCertificateHash(certHash, keys.privateKeyPem);

      return {
        id: `tx-batch-${Date.now()}-${idx}`,
        certificateId: certId,
        studentName: item.studentName,
        studentId: item.studentId,
        universityName,
        degreeName: item.degreeName,
        major: item.major,
        classification: item.classification,
        issueDate,
        graduationYear: new Date(issueDate).getFullYear() || 2026,
        gpa: item.gpa,
        certificateHash: certHash,
        digitalSignature: sig,
        status: 'ACTIVE',
        timestamp: Math.floor(Date.now() / 1000)
      };
    });

    setPendingTxs(prev => [...prev, ...newTxs]);
    setLastIssuedCert(newTxs[0]);
    setIssueSuccess(`Successfully batch-issued & RSA-signed all ${newTxs.length} student certificates to the Nebula ledger!`);
    setParsedStudents([]);
    setBatchSuccessMsg(null);
  };

  // Directory Search Filter
  const [dirSearch, setDirSearch] = useState<string>('');

  // Collect all issued certificates across chain blocks and pending mempool
  const allIssuedCerts: { cert: CertificateTransaction; blockLabel: string; isPending: boolean }[] = [];

  // Mined blocks
  chain.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.certificateId !== 'GENESIS-000') {
        allIssuedCerts.push({ cert: tx, blockLabel: `Block #${block.index}`, isPending: false });
      }
    });
  });

  // Pending mempool
  pendingTxs.forEach(tx => {
    allIssuedCerts.push({ cert: tx, blockLabel: 'Mempool Pending', isPending: true });
  });

  const filteredDirectory = allIssuedCerts.filter(({ cert }) => {
    if (!dirSearch.trim()) return true;
    const q = dirSearch.toLowerCase();
    return (
      cert.studentName.toLowerCase().includes(q) ||
      cert.studentId.toLowerCase().includes(q) ||
      cert.certificateId.toLowerCase().includes(q) ||
      cert.degreeName.toLowerCase().includes(q)
    );
  });

  const handleGenerateKeys = () => {
    const newKeys = generateRSAKeyPair();
    setKeys(newKeys);
  };

  const handleIssueSingle = (e: React.FormEvent) => {
    e.preventDefault();

    const certHash = computeCertificateHash({
      certificateId,
      studentName,
      studentId,
      universityName,
      degreeName,
      major,
      classification,
      issueDate,
      graduationYear: new Date(issueDate).getFullYear() || 2026,
      gpa
    });

    const sig = signCertificateHash(certHash, keys.privateKeyPem);

    const newTx: CertificateTransaction = {
      id: `tx-${Date.now()}`,
      certificateId,
      studentName,
      studentId,
      universityName,
      degreeName,
      major,
      classification,
      issueDate,
      graduationYear: new Date(issueDate).getFullYear() || 2026,
      gpa,
      certificateHash: certHash,
      digitalSignature: sig,
      status: 'ACTIVE',
      timestamp: Math.floor(Date.now() / 1000)
    };

    setPendingTxs(prev => [...prev, newTx]);
    setLastIssuedCert(newTx);
    setIssueSuccess(`Certificate ${certificateId} for ${studentName} successfully issued & signed!`);

    // Reset form with new random ID
    setCertificateId(`NEBULA-2026-CS-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleBatchIssueSample = () => {
    const batchList = [
      { name: 'Chloe Bennett', id: 'STU-99011', degree: 'B.Sc. Cyber Security', gpa: '3.85' },
      { name: 'David Okafor', id: 'STU-99012', degree: 'B.Sc. Artificial Intelligence', gpa: '3.98' },
      { name: 'Elena Rostova', id: 'STU-99013', degree: 'M.Sc. Data Science', gpa: '4.00' }
    ];

    const newTxs: CertificateTransaction[] = batchList.map(item => {
      const certId = `NEBULA-2026-GRAD-${Math.floor(1000 + Math.random() * 9000)}`;
      const certHash = computeCertificateHash({
        certificateId: certId,
        studentName: item.name,
        studentId: item.id,
        universityName,
        degreeName: item.degree,
        major: item.degree,
        classification: 'First Class Honors',
        issueDate: new Date().toISOString().split('T')[0],
        graduationYear: 2026,
        gpa: item.gpa
      });

      return {
        id: `tx-${Date.now()}-${item.id}`,
        certificateId: certId,
        studentName: item.name,
        studentId: item.id,
        universityName,
        degreeName: item.degree,
        major: item.degree,
        classification: 'First Class Honors',
        issueDate: new Date().toISOString().split('T')[0],
        graduationYear: 2026,
        gpa: item.gpa,
        certificateHash: certHash,
        digitalSignature: signCertificateHash(certHash, keys.privateKeyPem),
        status: 'ACTIVE',
        timestamp: Math.floor(Date.now() / 1000)
      };
    });

    setPendingTxs(prev => [...prev, ...newTxs]);
    setLastIssuedCert(newTxs[0]);
    setIssueSuccess(`Successfully batch-issued ${batchList.length} certificates to the Nebula ledger!`);
  };

  const handleRevokeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertId) return;

    onRevokeCertificate(revokeCertId);
    setRevokeMsg(`Revocation block notice for certificate ID/Student ID ${revokeCertId} broadcast to network.`);
    setRevokeCertId('');
  };

  const handleCopy = (certId: string) => {
    navigator.clipboard.writeText(certId);
    setCopiedCertId(certId);
    setTimeout(() => setCopiedCertId(null), 2500);
  };

  if (!isRegistrarAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 relative overflow-hidden">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">University Registrar Access Control</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
              To prevent unauthorized issuance of academic credentials, access to the Registrar Minting Portal requires institutional authentication.
            </p>
          </div>

          {/* Key Security Principles Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-100">Role Access Control</h3>
              <p className="text-slate-400 text-[11px]">
                Only verified university administrative staff possess permissioned access to entry portals.
              </p>
            </div>
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
              <Key className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-slate-100">RSA Private Key</h3>
              <p className="text-slate-400 text-[11px]">
                Each issued degree is signed by the University's confidential RSA-2048 private key.
              </p>
            </div>
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-slate-100">Consortium Validation</h3>
              <p className="text-slate-400 text-[11px]">
                Peer validator nodes reject any certificate lacking authentic institutional signatures.
              </p>
            </div>
          </div>

          {/* Unlock Form */}
          <div className="max-w-md mx-auto p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (registrarPin === 'ADMIN2026' || registrarPin.trim() === '1234' || registrarPin.trim().toLowerCase() === 'admin') {
                  setIsRegistrarAuthenticated(true);
                  setPinError(false);
                } else {
                  setPinError(true);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enter Registrar Access Passcode / Security PIN:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={registrarPin}
                    onChange={(e) => setRegistrarPin(e.target.value)}
                    placeholder="Enter PIN (e.g. ADMIN2026)"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                </div>
                {pinError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-mono">
                    Invalid PIN! Try typing <strong className="text-white">ADMIN2026</strong> or click quick demo unlock.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Authenticate & Enter Registrar Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistrarAuthenticated(true);
                    setPinError(false);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold transition border border-emerald-500/30 flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quick Demo Unlock (Simulate SSO Registrar Auth)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Sub Header & Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <University className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white">University Registrar Portal</h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>AUTHENTICATED</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Authority node for minting academic credentials onto the Nebula Blockchain
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation + Lock Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRegistrarAuthenticated(false)}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-rose-300 border border-slate-800 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 mr-2"
            title="Lock Registrar Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>

          <button
            onClick={() => setActiveSubTab('single')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'single'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Issue Credential
          </button>
          <button
            onClick={() => setActiveSubTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'batch'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg border border-white/20'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Batch Issuance
          </button>
          <button
            onClick={() => setActiveSubTab('keys')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'keys'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg border border-white/20'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            RSA Authority Keys
          </button>
          <button
            onClick={() => setActiveSubTab('revoke')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'revoke'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg border border-white/20'
                : 'bg-white/5 border border-white/10 text-rose-300 hover:bg-white/10'
            }`}
          >
            Revocation Registry
          </button>
        </div>
      </div>

      {/* Success Notification Banner with Direct Action Links */}
      {issueSuccess && (
        <div className="p-5 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/50 backdrop-blur-xl rounded-2xl text-emerald-100 text-sm font-semibold flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-base">{issueSuccess}</p>
              <p className="text-xs text-emerald-300/80 font-mono font-normal">
                Cryptographic RSA-2048 Digital Signature attached & broadcast.
              </p>
            </div>
          </div>

          {lastIssuedCert && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onSelectCertificateForVault && (
                <button
                  id="view-last-issued-cert-vault"
                  onClick={() => onSelectCertificateForVault(lastIssuedCert)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-lg flex items-center space-x-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>View Certificate (Vault)</span>
                </button>
              )}

              {onVerifyCertificate && (
                <button
                  id="verify-last-issued-cert"
                  onClick={() => onVerifyCertificate(lastIssuedCert.certificateId)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition backdrop-blur-md flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify on Blockchain</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending Transactions Mempool Banner */}
      {pendingTxs.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 backdrop-blur-2xl rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <Layers className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm">
                {pendingTxs.length} Pending Transactions in Mempool
              </h3>
              <p className="text-xs text-amber-200/80 font-light">
                Ready to be mined into Block #{chain.length} by Consortium Validators.
              </p>
            </div>
          </div>

          <button
            id="mine-block-button"
            onClick={() => onMineBlock(universityName)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-[1.02] text-slate-950 rounded-xl text-xs font-extrabold transition shadow-lg flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mine Block #{chain.length} Now</span>
          </button>
        </div>
      )}

      {/* Single Issuance Form */}
      {activeSubTab === 'single' && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-purple-400" />
                <span>Issue Single Academic Certificate</span>
              </h2>
              <p className="text-xs text-gray-400">
                Digitally sign academic credentials using C# RSA-2048 and issue to the Nebula ledger.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 self-start sm:self-auto">
              Algorithm: C# SHA-256 + RSA-2048
            </span>
          </div>

          {/* Active Consortium Authority Node Selector Card */}
          <div className="p-5 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <University className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-purple-300 font-mono font-bold uppercase tracking-wider">Active Authority Node:</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">ONLINE</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{selectedNode.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300 font-mono mt-0.5">
                    <span className="flex items-center space-x-1">
                      <Wallet className="w-3.5 h-3.5 text-purple-400" />
                      <span>Wallet: <strong className="text-amber-300">{selectedNode.walletAddress.substring(0, 10)}...{selectedNode.walletAddress.substring(34)}</strong></span>
                    </span>
                    <span className="text-gray-400">| Node: {selectedNode.nodeRegion}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectUniversityNode(selectedNode)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center space-x-1.5 shrink-0"
              >
                <UserCheck className="w-4 h-4 text-emerald-300" />
                <span>Load {selectedNode.shortName} Demo Student</span>
              </button>
            </div>

            {/* University Switcher Buttons */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                <p className="text-xs text-indigo-200 font-semibold flex items-center space-x-1.5">
                  <span>Switch University Authority Node:</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {CONSORTIUM_UNIVERSITIES.map((uni) => {
                  const isSelected = selectedNode.id === uni.id || universityName === uni.name;
                  return (
                    <button
                      key={uni.id}
                      type="button"
                      onClick={() => handleSelectUniversityNode(uni)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm ring-2 ring-indigo-400/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <UniversityLogo universityId={uni.id} size="sm" className="w-5 h-5 shrink-0" />
                      <span>{uni.shortName}</span>
                      <span className="text-[10px] opacity-75 font-mono">({uni.walletAddress.substring(0, 6)})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <form onSubmit={handleIssueSingle} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Student ID / Matriculation *
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  University / Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              {/* PoA Consortium Authority Mismatch Warning Box */}
              {universityName.trim().toLowerCase() !== selectedNode.name.trim().toLowerCase() && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-4 bg-amber-950/40 border border-amber-500/50 rounded-2xl text-amber-200 text-xs space-y-2.5">
                  <div className="flex items-center space-x-2 font-bold text-amber-300 text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>⚠️ Consortium PoA Security Alert: Node Wallet Mismatch</span>
                  </div>
                  <p className="leading-relaxed">
                    You are issuing a degree for <strong className="text-white bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-500/30">"{universityName}"</strong> using <strong className="text-purple-300">{selectedNode.shortName}'s</strong> Authority Node Wallet (<code className="font-mono text-amber-300">{selectedNode.walletAddress.substring(0, 10)}...</code>).
                  </p>
                  <p className="text-gray-300">
                    <strong>What happens on the blockchain?</strong> In Proof of Authority (PoA), each university's wallet address is cryptographically bound to its identity. If {selectedNode.shortName} issues a certificate for another institution, the Verifier Engine will flag it on-chain as a <strong>"Cross-Institutional Impersonation / Authority Mismatch"</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setUniversityName(selectedNode.name)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition text-xs shadow"
                    >
                      Reset Issuer Name to {selectedNode.shortName}
                    </button>
                    {CONSORTIUM_UNIVERSITIES.find(u => u.name.toLowerCase().includes(universityName.toLowerCase()) || universityName.toLowerCase().includes(u.shortName.toLowerCase())) && (
                      <button
                        type="button"
                        onClick={() => {
                          const matched = CONSORTIUM_UNIVERSITIES.find(u => u.name.toLowerCase().includes(universityName.toLowerCase()) || universityName.toLowerCase().includes(u.shortName.toLowerCase()));
                          if (matched) handleSelectUniversityNode(matched);
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition text-xs shadow"
                      >
                        Switch Signing Wallet Node to Matched University
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Degree Title *
                </label>
                <input
                  type="text"
                  required
                  value={degreeName}
                  onChange={(e) => setDegreeName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Major / Discipline *
                </label>
                <input
                  type="text"
                  required
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Academic Classification / Honors
                </label>
                <input
                  type="text"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Cumulative GPA
                </label>
                <input
                  type="text"
                  value={gpa}
                  onChange={(e) => setGPA(e.target.value)}
                  placeholder="3.95"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Certificate Unique ID *
                </label>
                <input
                  type="text"
                  required
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Graduation / Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm outline-none backdrop-blur-md focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/10 text-white font-mono text-xs space-y-1 backdrop-blur-md">
              <span className="text-gray-400 block font-semibold">Live SHA-256 Fingerprint Preview:</span>
              <p className="text-purple-300 break-all">
                {computeCertificateHash({
                  certificateId,
                  studentName,
                  studentId,
                  universityName,
                  degreeName,
                  major,
                  classification,
                  issueDate,
                  graduationYear: 2026,
                  gpa
                })}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                id="submit-issue-credential"
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-500/30 flex items-center space-x-2"
              >
                <Award className="w-5 h-5" />
                <span>Sign & Issue Credential to Mempool</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Issuance SubTab */}
      {activeSubTab === 'batch' && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Batch Student Import & Certificate Generator</h2>
                <p className="text-xs text-gray-400 font-light">
                  Upload Excel/CSV rosters for large graduating classes (5 to 5,000+ students) with automated Merkle tree signing
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const csvHeader = "Student Name,Student ID,Degree Name,Major,GPA,Classification\n";
                const csvRows = "Chloe Bennett,STU-99011,Bachelor of Science,Cyber Security,3.85,First Class Honors\nDavid Okafor,STU-99012,Bachelor of Science,Artificial Intelligence,3.98,First Class Honors\nElena Rostova,STU-99013,Master of Science,Data Science,4.00,Distinction\nMarcus Vance,STU-99014,Doctor of Medicine,Genomics Healthcare,3.92,High Distinction\nSarah Jenkins,STU-99015,Bachelor of Engineering,Software Engineering,3.75,First Class Honors";
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'nebula_student_batch_template.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition backdrop-blur-md flex items-center space-x-2 border border-white/10 shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Excel/CSV Template</span>
            </button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  if (content) {
                    const parsed = parseBatchFile(content);
                    if (parsed.length > 0) {
                      setParsedStudents(parsed);
                      setBatchSuccessMsg(`Successfully parsed ${parsed.length} student records from ${file.name}!`);
                    } else {
                      setBatchSuccessMsg(`Could not find valid student columns in ${file.name}. Download template for formatting.`);
                    }
                  }
                };
                reader.readAsText(file);
              }
            }}
            className="p-8 border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10 rounded-2xl text-center space-y-3 transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Drag and Drop Excel (.xlsx / .csv) Class Roster File</p>
              <p className="text-xs text-gray-400 font-light mt-1">
                Supports student lists of any size (5 to 5,000+ entries) • Automatic RSA-2048 Batch Signing
              </p>
            </div>
            <div className="pt-2">
              <label className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer inline-flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Browse Local File</span>
                <input
                  type="file"
                  accept=".csv,.txt,.tsv,.xlsx"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) {
                          const parsed = parseBatchFile(content);
                          if (parsed.length > 0) {
                            setParsedStudents(parsed);
                            setBatchSuccessMsg(`Successfully parsed ${parsed.length} student records from ${file.name}!`);
                          } else {
                            setBatchSuccessMsg(`Could not find valid student columns in ${file.name}. Download template for formatting.`);
                          }
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {batchSuccessMsg && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{batchSuccessMsg}</span>
            </div>
          )}

          {/* Parsed Students List Preview */}
          {parsedStudents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">
                  Parsed Class Roster ({parsedStudents.length} Students Ready to Issue)
                </h3>
                <button
                  onClick={() => setParsedStudents([])}
                  className="text-xs text-rose-400 hover:underline font-mono"
                >
                  Clear Roster
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl divide-y divide-white/10 bg-black/40">
                {parsedStudents.map((st, idx) => (
                  <div key={idx} className="p-3 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                    <div>
                      <span className="font-bold text-white">{st.studentName}</span>
                      <span className="text-purple-300 font-mono ml-2">({st.studentId})</span>
                    </div>
                    <div className="text-gray-400 font-mono text-[11px]">
                      {st.degreeName} • GPA: {st.gpa || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleIssueParsedBatch}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.01] text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Digitally Sign & Issue All {parsedStudents.length} Certificates to Ledger</span>
              </button>
            </div>
          )}

          {/* Quick Preset Sample Batch */}
          {parsedStudents.length === 0 && (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4 backdrop-blur-md">
              <h3 className="font-bold text-white text-sm">Or Load Demo Class Batch (3 Students)</h3>
              <ul className="divide-y divide-white/10 text-xs font-mono">
                <li className="py-2.5 flex justify-between">
                  <span className="text-white">Chloe Bennett (STU-99011)</span>
                  <span className="text-gray-400">B.Sc. Cyber Security (GPA: 3.85)</span>
                </li>
                <li className="py-2.5 flex justify-between">
                  <span className="text-white">David Okafor (STU-99012)</span>
                  <span className="text-gray-400">B.Sc. Artificial Intelligence (GPA: 3.98)</span>
                </li>
                <li className="py-2.5 flex justify-between">
                  <span className="text-white">Elena Rostova (STU-99013)</span>
                  <span className="text-gray-400">M.Sc. Data Science (GPA: 4.00)</span>
                </li>
              </ul>

              <button
                onClick={handleBatchIssueSample}
                className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/10 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Issue Demo Batch (3 Certificates)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Key Manager SubTab */}
      {activeSubTab === 'keys' && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <Key className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-lg font-bold text-white">University Authority RSA Key Pair</h2>
                <p className="text-xs text-gray-400 font-light">
                  Used by C# CryptoUtils to digitally sign certificate hashes with System.Security.Cryptography
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateKeys}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition backdrop-blur-md flex items-center space-x-2 border border-white/10"
            >
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span>Re-Generate KeyPair</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="space-y-2">
              <span className="font-bold text-gray-300 block">Public Key PEM (Published to Blockchain):</span>
              <textarea
                readOnly
                value={keys.publicKeyPem}
                rows={6}
                className="w-full p-3 bg-[#09031a]/90 text-emerald-400 rounded-xl border border-white/10 text-xs font-mono outline-none"
              />
            </div>
            <div className="space-y-2">
              <span className="font-bold text-gray-300 block">Private Key PEM (Secure University Vault):</span>
              <textarea
                readOnly
                value={keys.privateKeyPem}
                rows={6}
                className="w-full p-3 bg-[#09031a]/90 text-purple-300 rounded-xl border border-white/10 text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Revocation Registry SubTab */}
      {activeSubTab === 'revoke' && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Certificate Revocation Registry</h2>
              <p className="text-xs text-gray-400 font-light">
                Broadcast revocation transaction to invalidate compromised or fraudulent diplomas
              </p>
            </div>
          </div>

          {revokeMsg && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-200 text-sm font-semibold shadow-lg">
              {revokeMsg}
            </div>
          )}

          <form onSubmit={handleRevokeSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Enter Certificate ID or Hash to Revoke
              </label>
              <input
                type="text"
                required
                value={revokeCertId}
                onChange={(e) => setRevokeCertId(e.target.value)}
                placeholder="e.g. NEBULA-2026-CS-001"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm outline-none backdrop-blur-md focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:scale-[1.02] text-white font-bold rounded-xl text-sm transition shadow-lg"
            >
              Broadcast Revocation State Update
            </button>
          </form>
        </div>
      )}

      {/* Issued Student Certificates Directory & Registry */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Issued Student Certificates Directory</h2>
              <p className="text-xs text-gray-400 font-light">
                Registered student credentials across the C# blockchain ledger ({allIssuedCerts.length} Total)
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={dirSearch}
              onChange={(e) => setDirSearch(e.target.value)}
              placeholder="Search student, ID, or cert..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-purple-500/60 transition font-mono"
            />
          </div>
        </div>

        {filteredDirectory.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs font-mono">
            No matching student certificates found in registry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map(({ cert, blockLabel, isPending }) => (
              <div
                key={cert.id + cert.certificateId}
                className="bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl p-5 space-y-4 transition backdrop-blur-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{cert.studentName}</h3>
                      <p className="text-xs font-mono text-purple-300">ID: {cert.studentId}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        cert.status === 'REVOKED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {cert.status === 'REVOKED' ? 'REVOKED' : isPending ? 'MEMPOOL PENDING' : 'ACTIVE'}
                    </span>
                  </div>

                  <div className="text-xs space-y-0.5 text-gray-300 font-sans">
                    <p className="font-semibold">{cert.degreeName}</p>
                    <p className="text-gray-400 text-[11px]">{cert.major}</p>
                    {cert.gpa && <p className="text-amber-300 font-mono text-[11px]">GPA: {cert.gpa} ({cert.classification})</p>}
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-gray-400 flex items-center justify-between">
                    <span>Cert ID: {cert.certificateId}</span>
                    <span className="text-purple-400 font-bold">{blockLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  {onSelectCertificateForVault && (
                    <button
                      onClick={() => onSelectCertificateForVault(cert)}
                      className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1 shadow-md"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>View Certificate</span>
                    </button>
                  )}

                  {onVerifyCertificate && (
                    <button
                      onClick={() => onVerifyCertificate(cert.certificateId)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-semibold border border-white/10 transition backdrop-blur-md flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verify</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(cert.certificateId)}
                    title="Copy Certificate ID"
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/10 transition"
                  >
                    {copiedCertId === cert.certificateId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
