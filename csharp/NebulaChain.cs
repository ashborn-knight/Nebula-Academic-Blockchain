using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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

                if (currentBlock.Hash != currentBlock.CalculateHash())
                {
                    return false;
                }

                if (currentBlock.PreviousHash != previousBlock.Hash)
                {
                    return false;
                }

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
            var reportBuilder = new StringBuilder();
            reportBuilder.AppendLine("=================================================");
            reportBuilder.AppendLine("       NEBULA CRYPTOGRAPHIC VERIFICATION LOG     ");
            reportBuilder.AppendLine("=================================================");

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

            if (foundTx.Status == "REVOKED")
            {
                reportBuilder.AppendLine("[FAILED] Certificate status is marked REVOKED by institution.");
                auditReport = reportBuilder.ToString();
                return false;
            }
            reportBuilder.AppendLine("[PASS] Certificate Status: ACTIVE");

            bool isSigValid = CryptoUtils.VerifySignature(foundTx.CertificateHash, foundTx.DigitalSignature, publicKeyPem);
            if (!isSigValid)
            {
                reportBuilder.AppendLine("[FAILED] Digital Signature verification failed against Issuer Public Key.");
                auditReport = reportBuilder.ToString();
                return false;
            }
            reportBuilder.AppendLine("[PASS] Digital Signature Verified (RSA-SHA256)");

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
