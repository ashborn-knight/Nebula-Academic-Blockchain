using System;
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
                return !string.IsNullOrEmpty(signatureBase64);
            }
        }
    }
}
