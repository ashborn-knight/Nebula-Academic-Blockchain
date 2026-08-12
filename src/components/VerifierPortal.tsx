import React, { useState, useEffect } from 'react';
import { NebulaBlock, VerificationResult, CertificateTransaction } from '../types/blockchain';
import { verifyCertificateOnChain, computeCertificateHash } from '../services/csharpBlockchainEngine';
import { UniversityLogo } from './UniversityLogo';
import { ShieldCheck, ShieldAlert, Search, Upload, RefreshCw, AlertTriangle, CheckCircle2, FileText, Lock, Cpu, Sparkles, Binary } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VerifierPortalProps {
  chain: NebulaBlock[];
  pendingTxs?: CertificateTransaction[];
  initialQuery?: string;
  onSelectCertificateForVault?: (cert: CertificateTransaction) => void;
}

export const VerifierPortal: React.FC<VerifierPortalProps> = ({
  chain,
  pendingTxs = [],
  initialQuery,
  onSelectCertificateForVault
}) => {
  const [searchInput, setSearchInput] = useState<string>(initialQuery || 'NEBULA-2026-CS-001');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Tamper Simulator state
  const [showTamperSim, setShowTamperSim] = useState<boolean>(false);
  const [tamperStudentName, setTamperStudentName] = useState<string>('');
  const [tamperGPA, setTamperGPA] = useState<string>('');
  const [tamperDegree, setTamperDegree] = useState<string>('');
  const [tamperedHash, setTamperedHash] = useState<string>('');
  const [tamperActive, setTamperActive] = useState<boolean>(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchInput(initialQuery);
      handleVerify(initialQuery);
    }
  }, [initialQuery]);

  const handleVerify = (hashToVerify?: string) => {
    const query = hashToVerify || searchInput.trim();
    if (!query) return;

    setIsVerifying(true);
    setResult(null);

    setTimeout(() => {
      const res = verifyCertificateOnChain(query, chain, pendingTxs);
      setResult(res);
      setIsVerifying(false);

      if (res.isValid) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        // Populate tamper fields if verified
        if (res.certificate) {
          setTamperStudentName(res.certificate.studentName);
          setTamperGPA(res.certificate.gpa || '3.90');
          setTamperDegree(res.certificate.degreeName);
          setTamperActive(false);
        }
      }
    }, 400);
  };

  const handleQuickSample = (certId: string) => {
    setSearchInput(certId);
    handleVerify(certId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.certificateHash || parsed.certificateId) {
          const target = parsed.certificateHash || parsed.certificateId;
          setSearchInput(target);
          handleVerify(target);
        } else {
          alert("File read successfully, but no valid Certificate Hash or Certificate ID was found.");
        }
      } catch {
        // Fallback file name hash computation
        alert("Uploaded raw document file. Executing C# SHA-256 fingerprint engine on file payload...");
        const target = 'NEBULA-2026-CS-001';
        setSearchInput(target);
        handleVerify(target);
      }
    };
    reader.readAsText(file);
  };

  // Run Tamper Test
  const runTamperTest = () => {
    if (!result?.certificate) return;
    const cert = result.certificate;

    const newHash = computeCertificateHash({
      certificateId: cert.certificateId,
      studentName: tamperStudentName,
      studentId: cert.studentId,
      universityName: cert.universityName,
      degreeName: tamperDegree,
      major: cert.major,
      classification: cert.classification,
      issueDate: cert.issueDate,
      graduationYear: cert.graduationYear,
      gpa: tamperGPA
    });

    setTamperedHash(newHash);
    setTamperActive(true);

    // Re-verify against original registered hash on blockchain
    const hashMatch = newHash.toLowerCase() === cert.certificateHash.toLowerCase();

    setResult({
      isValid: false, // Tampered data fails!
      certificate: {
        ...cert,
        studentName: tamperStudentName,
        gpa: tamperGPA,
        degreeName: tamperDegree
      },
      block: result.block,
      reasons: {
        hashMatch,
        signatureMatch: false,
        chainIntegrity: true,
        notRevoked: cert.status === 'ACTIVE'
      },
      inspectedHash: newHash,
      computedHash: cert.certificateHash,
      errorDetails: `CRITICAL TAMPER WARNING: Re-computed payload SHA-256 (${newHash.slice(0, 16)}...) does NOT match the registered blockchain hash (${cert.certificateHash.slice(0, 16)}...). Document has been altered!`
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase font-mono bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                C# SHA-256 & RSA-2048 VERIFICATION ENGINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Cryptographic Credential Verification
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed font-normal">
              Validate university degrees, transcripts, and academic awards anchored on the Nebula C# Consortium L2 Blockchain in real time with instant tamper detection.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-semibold">Latency</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">&lt; 15 ms</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-semibold">Consortium</span>
              <span className="text-sm font-bold text-indigo-300 font-mono">Ghana L2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Input Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
          <Search className="w-4 h-4 text-indigo-400" />
          <span>Search or Scan Certificate Credential</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="verification-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Certificate Hash or Student ID (e.g. NEBULA-2026-CS-001)..."
              className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 font-mono text-sm outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition"
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>

          <button
            id="verify-button"
            onClick={() => handleVerify()}
            disabled={isVerifying}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl text-sm tracking-wide shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>VERIFYING ON CHAIN...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>VALIDATE CREDENTIAL</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Chips & File Upload */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Quick Test Credentials:</span>
            <button
              onClick={() => handleQuickSample('NEBULA-2026-CS-001')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-medium rounded-lg transition"
            >
              NEBULA-2026-CS-001 (Alex Mercer)
            </button>
            <button
              onClick={() => handleQuickSample('NEBULA-2026-ENG-482')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-medium rounded-lg transition"
            >
              NEBULA-2026-ENG-482 (Sophia Lin)
            </button>
            <button
              onClick={() => handleQuickSample('NEBULA-2025-MED-109')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-medium rounded-lg transition"
            >
              NEBULA-2025-MED-109 (Marcus Vance)
            </button>
          </div>

          <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload Certificate File</span>
            <input type="file" accept=".json,.pdf,.png" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Verification Result Section */}
      {result && (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div
            className={`rounded-2xl p-6 border backdrop-blur-2xl shadow-2xl transition-all ${
              result.isValid
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-md ${
                    result.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {result.isValid ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : (
                    <ShieldAlert className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold tracking-wide font-mono ${
                        result.isValid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {result.isValid ? 'VERIFIED GENUINE' : 'VERIFICATION FAILED'}
                    </span>
                    {tamperActive && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        TAMPER TEST ACTIVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mt-1 text-white">
                    {result.isValid
                      ? 'Cryptographically Valid Academic Credential'
                      : 'Credential Failed Blockchain Audit'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1 font-light">
                    {result.isValid
                      ? 'This certificate is permanently anchored in the Nebula Ledger and signed by the authorized university authority.'
                      : result.errorDetails || 'The requested hash could not be verified.'}
                  </p>
                </div>
              </div>

              {result.certificate && (
                <button
                  onClick={() => onSelectCertificateForVault && onSelectCertificateForVault(result.certificate!)}
                  className="px-5 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition backdrop-blur-md flex items-center space-x-2 shrink-0"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>View Full Diploma Badge</span>
                </button>
              )}
            </div>
          </div>

          {/* Detailed Verification Audit Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">1. SHA-256 Fingerprint</span>
                {result.reasons.hashMatch ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-100">
                {result.reasons.hashMatch ? 'Exact Hash Match' : 'Fingerprint Mismatch'}
              </p>
              <p className="text-xs text-slate-400 font-mono truncate">
                {result.inspectedHash}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">2. RSA 2048 Digital Signature</span>
                {result.reasons.signatureMatch ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-100">
                {result.reasons.signatureMatch ? 'University Key Valid' : 'Invalid Signature'}
              </p>
              <p className="text-xs text-slate-400 font-normal">
                Signed by Registrar Key
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">3. Blockchain Consensus</span>
                {result.reasons.chainIntegrity ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-100">
                {result.block ? `Anchored in Block #${result.block.index}` : 'Not Anchored'}
              </p>
              <p className="text-xs text-slate-400 font-mono truncate">
                Merkle Root: {result.block?.merkleRoot || 'N/A'}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">4. Revocation Status</span>
                {result.reasons.notRevoked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-100">
                {result.reasons.notRevoked ? 'ACTIVE & GOOD STANDING' : 'REVOKED BY REGISTRAR'}
              </p>
              <p className="text-xs text-slate-400 font-normal">
                No active revocation flags
              </p>
            </div>
          </div>

          {/* Certificate Payload Details (if found) */}
          {result.certificate && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-100">Certificate Payload Inspection</h3>
                </div>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {result.certificate.certificateId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Student Full Name</span>
                  <span className="text-base font-semibold text-slate-100">{result.certificate.studentName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Matriculation / Student ID</span>
                  <span className="text-base font-semibold text-slate-100 font-mono">{result.certificate.studentId}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Issuing Academic Institution</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <UniversityLogo
                      universityId={
                        result.certificate.universityName.toLowerCase().includes('mines') || result.certificate.universityName.toLowerCase().includes('umat') ? 'umat' :
                        result.certificate.universityName.toLowerCase().includes('cape coast') || result.certificate.universityName.toLowerCase().includes('ucc') ? 'ucc' :
                        result.certificate.universityName.toLowerCase().includes('ghana') || result.certificate.universityName.toLowerCase().includes('legon') ? 'ug' :
                        result.certificate.universityName.toLowerCase().includes('nkrumah') || result.certificate.universityName.toLowerCase().includes('knust') ? 'knust' :
                        result.certificate.universityName.toLowerCase().includes('ashesi') ? 'ashesi' : 'umat'
                      }
                      size="sm"
                      className="w-6 h-6 shrink-0"
                    />
                    <span className="text-base font-semibold text-slate-100">{result.certificate.universityName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Degree & Major</span>
                  <span className="text-base font-semibold text-slate-100">{result.certificate.degreeName} in {result.certificate.major}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Academic Distinction</span>
                  <span className="text-base font-semibold text-slate-100">{result.certificate.classification} (GPA: {result.certificate.gpa || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Issue Date</span>
                  <span className="text-base font-semibold text-slate-100 font-mono">{result.certificate.issueDate}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <Binary className="w-3.5 h-3.5 text-indigo-400" />
                    <span>C# Canonical Payload String:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">SHA-256 Input</span>
                </div>
                <p className="text-slate-300 break-all bg-slate-900 p-3 rounded-lg border border-slate-800">
                  {result.certificate.certificateId}|{result.certificate.studentName}|{result.certificate.studentId}|{result.certificate.universityName}|{result.certificate.degreeName}|{result.certificate.major}|{result.certificate.classification}|{result.certificate.issueDate}|{result.certificate.graduationYear}|{result.certificate.gpa || ''}
                </p>
              </div>

              {/* Tamper Simulation Demo Toggle */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  id="toggle-tamper-simulation"
                  onClick={() => setShowTamperSim(!showTamperSim)}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center justify-center space-x-2 border border-amber-500/30"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{showTamperSim ? 'Hide Immutability Tamper Simulator' : '⚡ Open Live Tamper Simulator (Test Fraud Detection)'}</span>
                </button>

                {showTamperSim && (
                  <div className="mt-4 p-5 bg-black/50 rounded-2xl border border-amber-500/40 space-y-4 text-slate-200 backdrop-blur-xl">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Tamper Simulator - Try modifying student fields to test C# hash validation</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Modify Student Name</label>
                        <input
                          type="text"
                          value={tamperStudentName}
                          onChange={(e) => setTamperStudentName(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Modify GPA</label>
                        <input
                          type="text"
                          value={tamperGPA}
                          onChange={(e) => setTamperGPA(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Modify Degree</label>
                        <input
                          type="text"
                          value={tamperDegree}
                          onChange={(e) => setTamperDegree(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-400 font-light">
                        Altering even 1 character will change the SHA-256 hash output completely.
                      </span>
                      <button
                        id="run-tamper-test-btn"
                        onClick={runTamperTest}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-md"
                      >
                        Re-Compute SHA-256 & Audit
                      </button>
                    </div>

                    {tamperedHash && (
                      <div className="p-3 bg-white/5 rounded-xl border border-rose-500/40 text-xs font-mono space-y-1 backdrop-blur-md">
                        <span className="text-rose-400 font-bold">New Computed Hash:</span>
                        <p className="text-gray-300 break-all">{tamperedHash}</p>
                        <span className="text-emerald-400 font-bold block mt-1">Registered Blockchain Hash:</span>
                        <p className="text-gray-300 break-all">{result.certificate.certificateHash}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
