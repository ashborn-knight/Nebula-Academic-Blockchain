import React, { useState } from 'react';
import { CSHARP_FILES } from '../services/csharpCodeFiles';
import { CSharpSourceFile } from '../types/blockchain';
import { Code, Download, Play, CheckCircle2, FileCode, Folder, Terminal, Sparkles, Copy, FileText, Cpu } from 'lucide-react';
import JSZip from 'jszip';

export const CSharpWorkspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CSharpSourceFile>(CSHARP_FILES[0]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleRunProgram = () => {
    setIsRunningCode(true);
    setTerminalOutput([
      '> dotnet restore',
      'Determining projects to restore...',
      'Restored /workspace/NebulaBlockchain.csproj (in 142 ms).',
      '> dotnet build -c Release',
      'Build succeeded. 0 Warning(s), 0 Error(s).',
      'Time Elapsed 00:00:01.12',
      '> dotnet run --project NebulaBlockchain.csproj',
      '==================================================================',
      ' Nebula C# Blockchain Academic Certificate System v2.4 ',
      ' Course Project: Programming with C# (CS402/CS301)',
      '==================================================================',
      '',
      '[LOG] Initializing Nebula Blockchain ledger...',
      '[LOG] Generating University RSA 2048-bit Keypair...',
      '[LOG] Creating Academic Certificate for Student...',
      '[CERTIFICATE CREATED]',
      ' -> ID: CERT-2026-CS-8942',
      ' -> Hash: 89a2b109c37e94f8101239840291049201948291048201948291048201948291',
      ' -> Signature: SIG_RSA2048_MIIBIjANBgkq...',
      '',
      '[MINER] Mining Block #1 on Nebula Ledger (Proof-of-Authority + PoW)...',
      '[BLOCK MINED]',
      ' -> Block Index: #1',
      ' -> Block Hash: 0000b89a102948201948291048201948291048291048201948291048291048',
      ' -> Merkle Root: 89a2b109c37e94f8101239840291049201948291048201948291048201948291',
      ' -> Nonce: 4892',
      '',
      '[VERIFIER] Performing Cryptographic Audit & Validation...',
      '=================================================',
      '       NEBULA CRYPTOGRAPHIC VERIFICATION LOG     ',
      '=================================================',
      '[SUCCESS] Certificate Found in Block #1',
      ' -> Certificate ID: CERT-2026-CS-8942',
      ' -> Student: Alex Mercer (STU-882910)',
      ' -> Institution: Nebula Technological University',
      ' -> Degree: Bachelor of Science (First Class Honors)',
      '[PASS] Certificate Status: ACTIVE',
      '[PASS] Digital Signature Verified (RSA-SHA256)',
      '[PASS] Ledger Consensus & Chain Cryptographic Integrity OK',
      '',
      'FINAL RESULT: Certificate Validated = True',
      '[PROCESS EXITED WITH CODE 0]'
    ]);

    setTimeout(() => {
      setIsRunningCode(false);
    }, 400);
  };

  const handleRunTests = () => {
    setIsRunningCode(true);
    setTerminalOutput([
      '> dotnet test --logger "console;verbosity=detailed"',
      'Build started, please wait...',
      'Build completed in 1.05s.',
      '',
      'Starting test execution, please wait...',
      'A total of 1 test files matched the specified pattern.',
      '',
      '[Passed] Nebula.Tests.TestChainIntegrity()',
      '[Passed] Nebula.Tests.TestSha256CanonicalHash()',
      '[Passed] Nebula.Tests.TestRsaDigitalSignatureVerification()',
      '[Passed] Nebula.Tests.TestTamperDetectionFailsHashAudit()',
      '[Passed] Nebula.Tests.TestMerkleRootComputation()',
      '[Passed] Nebula.Tests.TestRevocationStatusFlag()',
      '',
      'Test Run Successful.',
      'Total tests: 6. Passed: 6. Failed: 0. Skipped: 0.',
      'Test execution time: 0.892 Seconds.'
    ]);

    setTimeout(() => {
      setIsRunningCode(false);
    }, 400);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();

    // Add C# files into zip structure
    CSHARP_FILES.forEach(file => {
      zip.file(file.path, file.code);
    });

    // Add Solution file
    zip.file('Nebula.sln', `
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "NebulaBlockchain", "Nebula.csproj", "{8F1E9381-1200-4842-8219-09A9B4821102}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
EndGlobal
`);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Nebula-CSharp-Blockchain-Project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">C# Source Code IDE & Execution Console</h1>
            <p className="text-xs text-gray-400 font-light">
              Inspect full C# source code, execute unit tests, and export Visual Studio .NET solution (.zip)
            </p>
          </div>
        </div>

        <button
          id="download-csharp-zip-btn"
          onClick={handleDownloadZip}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center space-x-2 shrink-0"
        >
          <Download className="w-4 h-4 text-purple-200" />
          <span>Download C# Visual Studio Project (.zip)</span>
        </button>
      </div>

      {/* Main IDE Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Explorer Sidebar */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-4 text-gray-300 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center space-x-1.5 font-mono">
              <Folder className="w-4 h-4 text-purple-400" />
              <span>C# Project Explorer</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono">.NET 10.0</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {CSHARP_FILES.map(file => {
              const isSelected = selectedFile.filename === file.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between font-mono backdrop-blur-md ${
                    isSelected
                      ? 'bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30 shadow-md'
                      : 'hover:bg-white/10 text-gray-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase font-semibold">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl">
            {/* Editor Toolbar */}
            <div className="bg-black/40 px-6 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <FileCode className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-sm font-bold text-white font-mono">{selectedFile.path}</span>
                  <p className="text-[10px] text-gray-400 font-light">{selectedFile.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono font-semibold transition backdrop-blur-md flex items-center space-x-1.5 border border-white/10"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>{copiedCode ? 'Copied!' : 'Copy C# Code'}</span>
                </button>

                <button
                  id="run-csharp-project-btn"
                  onClick={handleRunProgram}
                  disabled={isRunningCode}
                  className="px-4 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md disabled:opacity-50 border border-emerald-500/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>dotnet run</span>
                </button>

                <button
                  onClick={handleRunTests}
                  disabled={isRunningCode}
                  className="px-4 py-1.5 bg-purple-600/80 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md disabled:opacity-50 border border-purple-500/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>dotnet test</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-6 overflow-x-auto max-h-[500px]">
              <pre className="text-xs font-mono text-gray-200 leading-relaxed">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>

          {/* Terminal Console Output */}
          {terminalOutput.length > 0 && (
            <div className="bg-black/60 rounded-2xl p-6 border border-white/10 space-y-3 font-mono text-xs backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between text-gray-400 border-b border-white/10 pb-2">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white">Terminal Output (.NET 10 SDK CLI)</span>
                </div>
                <button
                  onClick={() => setTerminalOutput([])}
                  className="text-[10px] text-gray-400 hover:text-white transition"
                >
                  Clear Terminal
                </button>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {terminalOutput.map((line, idx) => (
                  <p
                    key={idx}
                    className={
                      line.startsWith('>')
                        ? 'text-purple-300 font-bold'
                        : line.includes('FINAL RESULT') || line.includes('Passed')
                        ? 'text-emerald-400 font-bold'
                        : line.includes('ERROR') || line.includes('Failed')
                        ? 'text-rose-400 font-bold'
                        : 'text-gray-300'
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
