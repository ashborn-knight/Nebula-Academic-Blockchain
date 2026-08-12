using System;
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
                    leaves.Add(leaves.Last());
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
