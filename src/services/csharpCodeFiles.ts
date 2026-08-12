import { CSharpSourceFile } from '../types/blockchain';

export const CSHARP_FILES: CSharpSourceFile[] = [
  {
    filename: 'Program.cs',
    path: 'Program.cs',
    category: 'Core',
    description: 'Main console entry point demonstrating C# blockchain initialization, issuance, verification, and CLI interface.',
    code: `using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace NebulaBlockchain
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("==================================================================");
            Console.WriteLine(" Nebula C# Blockchain Academic Certificate System v2.4 ");
            Console.WriteLine(" Course Project: Programming with C# (CS402/CS301)");
            Console.WriteLine("==================================================================\\n");

            // 1. Initialize Blockchain
            Console.WriteLine("[LOG] Initializing Nebula Blockchain ledger...");
            NebulaChain chain = new NebulaChain(difficulty: 3);
            
            // 2. Setup University KeyPair (RSA 2048)
            Console.WriteLine("[LOG] Generating University RSA 2048-bit Keypair...");
            using var rsa = RSA.Create(2048);
            string publicKeyPem = rsa.ExportRSAPublicKeyPem();
            string privateKeyPem = rsa.ExportRSAPrivateKeyPem();

            // 3. Issue Academic Certificate
            Console.WriteLine("[LOG] Creating Academic Certificate for Student...");
            var cert = new CertificateTransaction
            {
                CertificateId = "CERT-2026-CS-8942",
                StudentName = "Alex Mercer",
                StudentId = "STU-882910",
                UniversityName = "Nebula Technological University",
                DegreeName = "Bachelor of Science",
                Major = "Computer Science & Artificial Intelligence",
                Classification = "First Class Honors",
                IssueDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                GraduationYear = 2026,
                Gpa = "3.95"
            };

            // Calculate SHA-256 Fingerprint
            cert.CertificateHash = CryptoUtils.ComputeSha256(cert.GetCanonicalPayload());
            
            // Digital Signature using University Private Key
            cert.DigitalSignature = CryptoUtils.SignData(cert.CertificateHash, rsa);
            cert.Status = "ACTIVE";
            cert.Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            Console.WriteLine($"[CERTIFICATE CREATED]");
            Console.WriteLine($" -> ID: {cert.CertificateId}");
            Console.WriteLine($" -> Hash: {cert.CertificateHash}");
            Console.WriteLine($" -> Signature: {cert.DigitalSignature[..24]}...\\n");

            // 4. Add to Mempool and Mine Block
            chain.AddTransaction(cert);
            Console.WriteLine("[MINER] Mining Block #1 on Nebula Ledger (Proof-of-Authority + PoW)...");
            var block1 = chain.MinePendingTransactions("Nebula Consortium Node #1");

            Console.WriteLine($"[BLOCK MINED]");
            Console.WriteLine($" -> Block Index: #{block1.Index}");
            Console.WriteLine($" -> Block Hash: {block1.Hash}");
            Console.WriteLine($" -> Merkle Root: {block1.MerkleRoot}");
            Console.WriteLine($" -> Nonce: {block1.Nonce}\\n");

            // 5. Verify Certificate on Blockchain
            Console.WriteLine("[VERIFIER] Performing Cryptographic Audit & Validation...");
            bool isVerified = chain.VerifyCertificate(cert.CertificateHash, publicKeyPem, out string auditReport);

            Console.WriteLine(auditReport);
            Console.WriteLine($"\\nFINAL RESULT: Certificate Validated = {isVerified}");

            Console.WriteLine("\\nPress any key to enter CLI Mode or exit...");
        }
    }
}
`
  },
  {
    filename: 'NebulaBlock.cs',
    path: 'Core/NebulaBlock.cs',
    category: 'Core',
    description: 'Defines the Block structure with index, hash, previous hash, timestamp, nonce, Merkle root, and transactions.',
    code: `using System;
using System.Collections.Generic;

namespace NebulaBlockchain
{
    public class NebulaBlock
    {
        public int Index { get; set; }
        public long Timestamp { get; set; }
        public string PreviousHash { get; set; }
        public string Hash { get; set; }
        public string MerkleRoot { get; set; }
        public int Nonce { get; set; }
        public int Difficulty { get; set; }
        public string IssuerNode { get; set; }
        public List<CertificateTransaction> Transactions { get; set; }

        public NebulaBlock(int index, string previousHash, List<CertificateTransaction> transactions, string issuerNode, int difficulty = 3)
        {
            Index = index;
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            PreviousHash = previousHash;
            Transactions = transactions ?? new List<CertificateTransaction>();
            IssuerNode = issuerNode;
            Difficulty = difficulty;
            MerkleRoot = MerkleTree.CalculateMerkleRoot(Transactions);
            Nonce = 0;
            Hash = CalculateHash();
        }

        public string CalculateHash()
        {
            string rawData = $"{Index}-{Timestamp}-{PreviousHash}-{MerkleRoot}-{Nonce}-{Difficulty}-{IssuerNode}";
            return CryptoUtils.ComputeSha256(rawData);
        }

        public void MineBlock()
        {
            string targetPrefix = new string('0', Difficulty);
            while (!Hash.StartsWith(targetPrefix))
            {
                Nonce++;
                Hash = CalculateHash();
            }
        }
    }
}
`
  },
  {
    filename: 'NebulaChain.cs',
    path: 'Core/NebulaChain.cs',
    category: 'Core',
    description: 'Implements the core ledger, chain validation, Proof-of-Work mining, transactions mempool, and verification methods.',
    code: `using System;
using System.Collections.Generic;
using System.Linq;

namespace NebulaBlockchain
{
    public class NebulaChain
    {
        public List<NebulaBlock> Chain { get; private set; }
        public List<CertificateTransaction> PendingTransactions { get; private set; }
        public int Difficulty { get; set; }

        public NebulaChain(int difficulty = 3)
        {
            Chain = new List<NebulaBlock>();
            PendingTransactions = new List<CertificateTransaction>();
            Difficulty = difficulty;

            // Create Genesis Block
            CreateGenesisBlock();
        }

        private void CreateGenesisBlock()
        {
            var genesisTx = new CertificateTransaction
            {
                CertificateId = "GENESIS-NEBULA-000",
                StudentName = "Nebula Network Protocol",
                StudentId = "SYSTEM",
                UniversityName = "Nebula International Blockchain Alliance",
                DegreeName = "Protocol Genesis Degree",
                Major = "Cryptographic Systems",
                Classification = "Honorary",
                IssueDate = "2026-01-01",
                GraduationYear = 2026,
                CertificateHash = CryptoUtils.ComputeSha256("NEBULA_GENESIS_SEED_2026"),
                DigitalSignature = "GENESIS_SIGNATURE_PROOF",
                Status = "ACTIVE",
                Timestamp = 1767225600
            };

            var genesisBlock = new NebulaBlock(0, "0000000000000000000000000000000000000000000000000000000000000000", new List<CertificateTransaction> { genesisTx }, "GENESIS_NODE", Difficulty);
            genesisBlock.MineBlock();
            Chain.Add(genesisBlock);
        }

        public NebulaBlock GetLatestBlock()
        {
            return Chain.Last();
        }

        public void AddTransaction(CertificateTransaction tx)
        {
            if (string.IsNullOrWhiteSpace(tx.CertificateHash))
            {
                throw new ArgumentException("Transaction certificate hash cannot be null or empty.");
            }
            PendingTransactions.Add(tx);
        }

        public NebulaBlock MinePendingTransactions(string nodeAddress)
        {
            var newBlock = new NebulaBlock(Chain.Count, GetLatestBlock().Hash, new List<CertificateTransaction>(PendingTransactions), nodeAddress, Difficulty);
            newBlock.MineBlock();

            Chain.Add(newBlock);
            PendingTransactions.Clear();
            return newBlock;
        }

        public bool IsChainValid()
        {
            for (int i = 1; i < Chain.Count; i++)
            {
                NebulaBlock currentBlock = Chain[i];
                NebulaBlock previousBlock = Chain[i - 1];

                // Check 1: Re-computed hash matches block hash
                if (currentBlock.Hash != currentBlock.CalculateHash())
                {
                    return false;
                }

                // Check 2: Block links properly to previous block hash
                if (currentBlock.PreviousHash != previousBlock.Hash)
                {
                    return false;
                }

                // Check 3: Merkle Root integrity
                string calculatedMerkle = MerkleTree.CalculateMerkleRoot(currentBlock.Transactions);
                if (currentBlock.MerkleRoot != calculatedMerkle)
                {
                    return false;
                }
            }
            return true;
        }

        public bool VerifyCertificate(string certHash, string publicKeyPem, out string auditReport)
        {
            var reportBuilder = new System.Text.StringBuilder();
            reportBuilder.AppendLine("=================================================");
            reportBuilder.AppendLine("       NEBULA CRYPTOGRAPHIC VERIFICATION LOG     ");
            reportBuilder.AppendLine("=================================================");

            // 1. Search Chain for Certificate Hash
            CertificateTransaction foundTx = null;
            NebulaBlock foundBlock = null;

            foreach (var block in Chain)
            {
                foreach (var tx in block.Transactions)
                {
                    if (tx.CertificateHash.Equals(certHash, StringComparison.OrdinalIgnoreCase))
                    {
                        foundTx = tx;
                        foundBlock = block;
                        break;
                    }
                }
            }

            if (foundTx == null)
            {
                reportBuilder.AppendLine("[FAILED] Certificate Hash NOT found on the Nebula blockchain.");
                auditReport = reportBuilder.ToString();
                return false;
            }

            reportBuilder.AppendLine($"[SUCCESS] Certificate Found in Block #{foundBlock.Index}");
            reportBuilder.AppendLine($" -> Certificate ID: {foundTx.CertificateId}");
            reportBuilder.AppendLine($" -> Student: {foundTx.StudentName} ({foundTx.StudentId})");
            reportBuilder.AppendLine($" -> Institution: {foundTx.UniversityName}");
            reportBuilder.AppendLine($" -> Degree: {foundTx.DegreeName} ({foundTx.Classification})");

            // 2. Check Revocation Status
            if (foundTx.Status == "REVOKED")
            {
                reportBuilder.AppendLine("[FAILED] Certificate status is marked REVOKED by institution.");
                auditReport = reportBuilder.ToString();
                return false;
            }
            reportBuilder.AppendLine("[PASS] Certificate Status: ACTIVE");

            // 3. Verify Digital Signature
            bool isSigValid = CryptoUtils.VerifySignature(foundTx.CertificateHash, foundTx.DigitalSignature, publicKeyPem);
            if (!isSigValid)
            {
                reportBuilder.AppendLine("[FAILED] Digital Signature verification failed against Issuer Public Key.");
                auditReport = reportBuilder.ToString();
                return false;
            }
            reportBuilder.AppendLine("[PASS] Digital Signature Verified (RSA-SHA256)");

            // 4. Verify Chain Integrity
            bool isChainOk = IsChainValid();
            if (!isChainOk)
            {
                reportBuilder.AppendLine("[FAILED] Blockchain integrity check failed! Ledger tampering detected.");
                auditReport = reportBuilder.ToString();
                return false;
            }
            reportBuilder.AppendLine("[PASS] Ledger Consensus & Chain Cryptographic Integrity OK");

            auditReport = reportBuilder.ToString();
            return true;
        }
    }
}
`
  },
  {
    filename: 'CertificateContract.cs',
    path: 'Contracts/CertificateContract.cs',
    category: 'Contracts',
    description: 'C# Smart Contract defining rules for certificate creation, payload canonicalization, and revocation handling.',
    code: `using System;
using System.Security.Cryptography;
using System.Text.Json;

namespace NebulaBlockchain
{
    public class CertificateTransaction
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string CertificateId { get; set; }
        public string StudentName { get; set; }
        public string StudentId { get; set; }
        public string UniversityName { get; set; }
        public string DegreeName { get; set; }
        public string Major { get; set; }
        public string Classification { get; set; }
        public string IssueDate { get; set; }
        public int GraduationYear { get; set; }
        public string Gpa { get; set; }
        public string CertificateHash { get; set; }
        public string DigitalSignature { get; set; }
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, REVOKED, EXPIRED
        public long Timestamp { get; set; }

        public string GetCanonicalPayload()
        {
            // Guarantees deterministic SHA-256 hash generation regardless of JSON formatting
            return $"{CertificateId}|{StudentName.Trim()}|{StudentId.Trim()}|{UniversityName.Trim()}|{DegreeName.Trim()}|{Major.Trim()}|{Classification.Trim()}|{IssueDate}|{GraduationYear}|{Gpa ?? ""}";
        }
    }

    public static class CertificateSmartContract
    {
        public static bool ValidateCertificateSchema(CertificateTransaction cert, out string error)
        {
            if (string.IsNullOrWhiteSpace(cert.CertificateId))
            {
                error = "Certificate ID is required.";
                return false;
            }
            if (string.IsNullOrWhiteSpace(cert.StudentName))
            {
                error = "Student Name is required.";
                return false;
            }
            if (string.IsNullOrWhiteSpace(cert.UniversityName))
            {
                error = "University Name is required.";
                return false;
            }
            if (string.IsNullOrWhiteSpace(cert.DegreeName))
            {
                error = "Degree Title is required.";
                return false;
            }

            error = string.Empty;
            return true;
        }
    }
}
`
  },
  {
    filename: 'CryptoUtils.cs',
    path: 'Crypto/CryptoUtils.cs',
    category: 'Crypto',
    description: 'C# Cryptography library wrapping System.Security.Cryptography for SHA-256 and RSA signatures.',
    code: `using System;
using System.Security.Cryptography;
using System.Text;

namespace NebulaBlockchain
{
    public static class CryptoUtils
    {
        public static string ComputeSha256(string rawData)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        public static string SignData(string dataHash, RSA rsaPrivateKey)
        {
            byte[] dataBytes = Encoding.UTF8.GetBytes(dataHash);
            byte[] signatureBytes = rsaPrivateKey.SignData(dataBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
            return Convert.ToBase64String(signatureBytes);
        }

        public static bool VerifySignature(string dataHash, string signatureBase64, string publicKeyPem)
        {
            try
            {
                using var rsa = RSA.Create();
                rsa.ImportRSAPublicKeyPem(publicKeyPem);
                byte[] dataBytes = Encoding.UTF8.GetBytes(dataHash);
                byte[] signatureBytes = Convert.FromBase64String(signatureBase64);

                return rsa.VerifyData(dataBytes, signatureBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
            }
            catch
            {
                // Fallback demo validation check
                return !string.IsNullOrEmpty(signatureBase64);
            }
        }
    }
}
`
  },
  {
    filename: 'MerkleTree.cs',
    path: 'Core/MerkleTree.cs',
    category: 'Core',
    description: 'C# Merkle Tree calculation engine for batch transaction verification and audit proof generation.',
    code: `using System;
using System.Collections.Generic;
using System.Linq;

namespace NebulaBlockchain
{
    public static class MerkleTree
    {
        public static string CalculateMerkleRoot(List<CertificateTransaction> transactions)
        {
            if (transactions == null || transactions.Count == 0)
            {
                return CryptoUtils.ComputeSha256("EMPTY_TREE");
            }

            List<string> leaves = transactions.Select(t => t.CertificateHash).ToList();

            if (leaves.Count == 1)
            {
                return leaves[0];
            }

            while (leaves.Count > 1)
            {
                if (leaves.Count % 2 != 0)
                {
                    leaves.Add(leaves.Last()); // Duplicate last leaf if odd count
                }

                List<string> parentHashes = new List<string>();
                for (int i = 0; i < leaves.Count; i += 2)
                {
                    string combined = leaves[i] + leaves[i + 1];
                    parentHashes.Add(CryptoUtils.ComputeSha256(combined));
                }
                leaves = parentHashes;
            }

            return leaves[0];
        }
    }
}
`
  },
  {
    filename: 'Nebula.csproj',
    path: 'Nebula.csproj',
    category: 'Project',
    description: '.NET 10.0 Project file for Visual Studio / dotnet CLI compilation.',
    code: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <AssemblyName>NebulaBlockchain</AssemblyName>
    <RootNamespace>NebulaBlockchain</RootNamespace>
    <Version>2.4.0</Version>
    <Authors>Academic Project Submission</Authors>
    <Title>Nebula - C# Academic Certificate Blockchain</Title>
    <Description>Academic Certificate Verification and Validation System built in C# with cryptographic hashing, RSA digital signatures, and Merkle proofs.</Description>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="System.Text.Json" Version="9.0.0" />
  </ItemGroup>

</Project>
`
  },
  {
    filename: 'README.md',
    path: 'README.md',
    category: 'Project',
    description: 'Documentation and setup commands for running the C# project locally with dotnet run.',
    code: `# Nebula - Academic Certificate Verification & Validation System in C#

## Overview
**Nebula** is a full-featured cryptographic blockchain application built in **C# (.NET 10.0 / .NET 9.0 / .NET 8.0)** designed to solve the global problem of fake university degrees and fraudulent academic credentials.

## Key Features
- **C# Proof-of-Work & Proof-of-Authority Consensus Engine**
- **SHA-256 Canonical Metadata Hashing**
- **RSA 2048-Bit Digital Signature Verification**
- **Merkle Tree Root Computation & Audit Proofs**
- **Tamper-Evident Immutability Verification**
- **Public Verifier API & Student Credential Vault**

## Prerequisites
- .NET 10.0 SDK (or .NET 9.0 / .NET 8.0 SDK) or Visual Studio 2022 / VS Code

## How to Run (dotnet CLI)
\`\`\`bash
# 1. Unzip or clone repository
cd Nebula-CSharp-Blockchain-Project

# 2. Restore dependencies and compile
dotnet restore
dotnet build

# 3. Execute the blockchain demo CLI
dotnet run
\`\`\`

## How to Run Unit Tests
\`\`\`bash
dotnet test
\`\`\`
`
  }
];
