using System;
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
