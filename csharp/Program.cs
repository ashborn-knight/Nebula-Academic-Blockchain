using System;
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
            Console.WriteLine(" Course Project: Programming with C# (.NET 10.0 / .NET 9.0 / .NET 8.0)");
            Console.WriteLine("==================================================================\n");

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
            Console.WriteLine($" -> Signature: {cert.DigitalSignature[..24]}...\n");

            // 4. Add to Mempool and Mine Block
            chain.AddTransaction(cert);
            Console.WriteLine("[MINER] Mining Block #1 on Nebula Ledger (Proof-of-Authority + PoW)...");
            var block1 = chain.MinePendingTransactions("Nebula Consortium Node #1");

            Console.WriteLine($"[BLOCK MINED]");
            Console.WriteLine($" -> Block Index: #{block1.Index}");
            Console.WriteLine($" -> Block Hash: {block1.Hash}");
            Console.WriteLine($" -> Merkle Root: {block1.MerkleRoot}");
            Console.WriteLine($" -> Nonce: {block1.Nonce}\n");

            // 5. Verify Certificate on Blockchain
            Console.WriteLine("[VERIFIER] Performing Cryptographic Audit & Validation...");
            bool isVerified = chain.VerifyCertificate(cert.CertificateHash, publicKeyPem, out string auditReport);

            Console.WriteLine(auditReport);
            Console.WriteLine($"\nFINAL RESULT: Certificate Validated = {isVerified}");

            Console.WriteLine("\nPress any key to enter CLI Mode or exit...");
        }
    }
}
