import React, { useState, useEffect } from 'react';
import { CertificateTransaction, NebulaBlock } from '../types/blockchain';
import { Award, QrCode, Share2, Printer, CheckCircle2, ShieldCheck, Download, Copy, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { UniversityLogo } from './UniversityLogo';

interface StudentVaultProps {
  chain: NebulaBlock[];
  pendingTxs?: CertificateTransaction[];
  selectedCert?: CertificateTransaction | null;
  onVerifyCertificate?: (query: string) => void;
  isLightMode?: boolean;
}

export const StudentVault: React.FC<StudentVaultProps> = ({
  chain,
  pendingTxs = [],
  selectedCert,
  onVerifyCertificate,
  isLightMode = false
}) => {
  // Collect all certificates across all blocks + pending mempool
  const allCertificates: CertificateTransaction[] = [];

  // Mined blocks
  chain.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.certificateId !== 'GENESIS-000') {
        allCertificates.push(tx);
      }
    });
  });

  // Pending mempool
  pendingTxs.forEach(tx => {
    if (tx.certificateId !== 'GENESIS-000' && !allCertificates.some(c => c.certificateId === tx.certificateId)) {
      allCertificates.push(tx);
    }
  });

  const [activeCert, setActiveCert] = useState<CertificateTransaction>(
    selectedCert || allCertificates[0] || {
      id: 'tx-001',
      certificateId: 'NEBULA-2026-CS-001',
      studentName: 'Alex Mercer',
      studentId: 'STU-99201',
      universityName: 'Nebula Technological University',
      degreeName: 'Bachelor of Science',
      major: 'Computer Science & Software Engineering',
      classification: 'First Class Honors',
      issueDate: '2026-06-15',
      graduationYear: 2026,
      gpa: '3.94',
      certificateHash: '89a2b109c37e94f8101239840291049201948291048201948291048201948291',
      digitalSignature: 'SIG_RSA2048_NEBULA_ALEX_MERCER_VALID_SIGNATURE_PROVED_8921',
      status: 'ACTIVE',
      timestamp: 1781520000
    }
  );

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCert) {
      setActiveCert(selectedCert);
    } else if (allCertificates.length > 0) {
      const exists = allCertificates.some(c => c.certificateId === activeCert?.certificateId);
      if (!exists) {
        setActiveCert(allCertificates[allCertificates.length - 1]);
      }
    }
  }, [selectedCert, allCertificates]);

  useEffect(() => {
    if (activeCert) {
      const verifyUrl = `${window.location.origin}/?verify=${activeCert.certificateId}`;
      QRCode.toDataURL(verifyUrl, { width: 160, margin: 1 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [activeCert]);

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}/?verify=${activeCert.certificateId}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      const element = document.getElementById('printable-certificate-card');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0d0726',
        logging: false,
        onclone: (clonedDoc) => {
          const tempCanvas = clonedDoc.createElement('canvas');
          tempCanvas.width = 1;
          tempCanvas.height = 1;
          const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });

          const convertColorToRgb = (colorStr: string): string => {
            if (!ctx) return 'rgb(124, 58, 237)';
            try {
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = '#000000';
              ctx.fillStyle = colorStr;
              ctx.fillRect(0, 0, 1, 1);
              const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
              if (a < 255) {
                return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
              }
              return `rgb(${r}, ${g}, ${b})`;
            } catch {
              return 'rgb(124, 58, 237)';
            }
          };

          const replaceOklabInText = (text: string): string => {
            return text.replace(/okl(?:ab|ch)\([^)]+\)/gi, (match) => {
              return convertColorToRgb(match);
            });
          };

          // 1. Sanitize all <style> tag contents in clonedDoc
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((style) => {
            if (style.textContent && (style.textContent.includes('oklab') || style.textContent.includes('oklch'))) {
              style.textContent = replaceOklabInText(style.textContent);
            }
          });

          // 2. Sanitize all inline style attributes
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const styleAttr = htmlEl.getAttribute('style');
            if (styleAttr && (styleAttr.includes('oklab') || styleAttr.includes('oklch'))) {
              htmlEl.setAttribute('style', replaceOklabInText(styleAttr));
            }
          });

          // 3. Override computed oklab/oklch styles and ensure solid background for card elements
          const certCard = clonedDoc.getElementById('printable-certificate-card');
          if (certCard) {
            certCard.style.backgroundColor = '#0d0726';
            certCard.style.backgroundImage = 'radial-gradient(circle at 50% 0%, #2e1065 0%, #0d0726 100%)';
            certCard.style.color = '#ffffff';

            const certElements = [certCard, ...Array.from(certCard.querySelectorAll('*'))] as HTMLElement[];
            certElements.forEach((el) => {
              const computed = window.getComputedStyle(el);
              const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'];
              props.forEach((prop) => {
                const val = computed[prop as any];
                if (val && typeof val === 'string' && (val.includes('oklab') || val.includes('oklch'))) {
                  el.style[prop as any] = replaceOklabInText(val);
                }
              });
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let y = (pdfHeight - imgHeight) / 2;
      if (y < 0) y = 0;

      pdf.addImage(imgData, 'PNG', 0, y, pdfWidth, imgHeight);
      pdf.save(`Nebula_Diploma_${activeCert.certificateId}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      // Fallback
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-sans">Student Credential Vault</h1>
            <p className="text-xs text-slate-400 font-normal font-sans">
              Verified digital diplomas secured on the Nebula C# Blockchain
            </p>
          </div>
        </div>

        {/* Certificate Switcher */}
        {allCertificates.length > 0 && (
          <div className="flex items-center space-x-2 font-sans">
            <span className="text-xs text-slate-400 font-medium">Select Credential:</span>
            <select
              value={activeCert.certificateId}
              onChange={(e) => {
                const found = allCertificates.find(c => c.certificateId === e.target.value);
                if (found) setActiveCert(found);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              {allCertificates.map(cert => (
                <option key={cert.certificateId} value={cert.certificateId} className="bg-slate-900 text-white">
                  {cert.studentName} - {cert.degreeName} ({cert.certificateId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Diploma Presentation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Official Certificate Card (Printable Target) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Official Digital Diploma Artifact
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 border ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md'
                }`}
              >
                <Copy className="w-3.5 h-3.5 text-purple-500" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                  isLightMode
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>

          </div>

          {/* Certificate Design (Frosted Glass & Gold Watermark Style) */}
          <div
            id="printable-certificate-card"
            className="bg-white/5 border border-white/20 backdrop-blur-3xl rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-8 text-white font-serif"
          >
            {/* Background Seal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <ShieldCheck className="w-96 h-96 text-purple-400" />
            </div>

            {/* Top Header Seal */}
            <div className="text-center space-y-3 relative z-10">
              <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg mx-auto border border-white/20">
                <UniversityLogo
                  universityId={
                    activeCert.universityName.toLowerCase().includes('mines') || activeCert.universityName.toLowerCase().includes('umat') ? 'umat' :
                    activeCert.universityName.toLowerCase().includes('cape coast') || activeCert.universityName.toLowerCase().includes('ucc') ? 'ucc' :
                    activeCert.universityName.toLowerCase().includes('ghana') || activeCert.universityName.toLowerCase().includes('legon') ? 'ug' :
                    activeCert.universityName.toLowerCase().includes('nkrumah') || activeCert.universityName.toLowerCase().includes('knust') ? 'knust' :
                    activeCert.universityName.toLowerCase().includes('ashesi') ? 'ashesi' : 'umat'
                  }
                  size="xl"
                  className="w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-md"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase text-white font-serif">
                {activeCert.universityName}
              </h2>
              <p className="text-xs sm:text-sm font-sans tracking-widest uppercase text-indigo-300 font-bold">
                Officially Verified Academic Credential
              </p>
            </div>

            {/* Certificate Body text */}
            <div className="text-center space-y-4 relative z-10 max-w-xl mx-auto">
              <p className="italic text-gray-300 text-sm">Be it known that</p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-amber-200 tracking-tight font-serif border-b-2 border-amber-400/40 pb-2 px-4 inline-block drop-shadow-sm">
                {activeCert.studentName}
              </h3>
              <p className="text-xs font-sans text-gray-400">Student ID: {activeCert.studentId}</p>

              <p className="italic text-gray-300 text-sm pt-2">
                having completed all required academic studies and examinations, is hereby awarded the degree of
              </p>

              <div className="space-y-1 py-2">
                <h4 className="text-2xl font-bold text-white font-serif">{activeCert.degreeName}</h4>
                <p className="text-sm font-sans font-semibold text-purple-300">in {activeCert.major}</p>
                <p className="text-xs font-sans font-bold text-amber-300 uppercase tracking-wider">
                  With {activeCert.classification} (GPA: {activeCert.gpa || 'N/A'})
                </p>
              </div>
            </div>

            {/* Footer Signatures & QR Code */}
            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 font-sans">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] text-gray-400 font-mono block">DATE OF ISSUANCE</span>
                <span className="text-xs font-bold text-white font-mono">{activeCert.issueDate}</span>
                <span className="text-[10px] text-gray-400 font-mono block pt-1">CREDENTIAL ID</span>
                <span className="text-xs font-bold text-purple-300 font-mono">{activeCert.certificateId}</span>
              </div>

              {/* QR Code */}
              {qrDataUrl && (
                <div className="flex flex-col items-center bg-white/10 p-2.5 rounded-2xl border border-white/20 shadow-md backdrop-blur-md">
                  <img src={qrDataUrl} alt="Certificate Verification QR Code" className="w-24 h-24 rounded-lg bg-white p-1" />
                  <span className="text-[9px] font-mono text-gray-300 mt-1">Scan to Verify</span>
                </div>
              )}

              <div className="text-center sm:text-right space-y-1">
                <div className="h-8 border-b border-white/30 w-36 mx-auto sm:ml-auto"></div>
                <span className="text-[10px] text-gray-400 font-bold block">UNIVERSITY REGISTRAR</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center justify-center sm:justify-end space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>RSA-2048 SIGNED</span>
                </span>
              </div>
            </div>

            {/* Bottom Cryptographic Stamp */}
            <div className="p-3 bg-black/40 text-white rounded-xl text-[10px] font-mono space-y-1 relative z-10 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-purple-300 font-bold">
                <span>NEBULA BLOCKCHAIN IMMUTABLE ANCHOR</span>
                <span className="text-emerald-400">STATUS: ACTIVE</span>
              </div>
              <p className="text-gray-400 break-all">SHA-256 HASH: {activeCert.certificateHash}</p>
            </div>
          </div>
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Proof Status</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 backdrop-blur-md">
                <span className="text-gray-400 font-medium">Digital Signature Algorithm:</span>
                <p className="font-mono font-bold text-white">C# RSA-2048 (PKCS#1 v1.5)</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 backdrop-blur-md">
                <span className="text-gray-400 font-medium">Consortium Node Network:</span>
                <p className="font-bold text-white">Nebula Proof-of-Authority Alliance</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 backdrop-blur-md">
                <span className="text-gray-400 font-medium">Verification Status:</span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Immutable</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 text-white shadow-2xl space-y-3">
            <h4 className="font-bold text-sm text-purple-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Sharing Credentials</span>
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Employers or verifiers do not need access to private database accounts. They can simply scan the QR code on your certificate or visit the public verifier portal.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.01] text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center space-x-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Verification Link</span>
              </button>

              {onVerifyCertificate && (
                <button
                  onClick={() => onVerifyCertificate(activeCert.certificateId)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition backdrop-blur-md flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify on Blockchain Portal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
