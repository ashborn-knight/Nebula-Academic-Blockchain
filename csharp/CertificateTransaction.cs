using System;
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
            return $"{CertificateId}|{StudentName?.Trim()}|{StudentId?.Trim()}|{UniversityName?.Trim()}|{DegreeName?.Trim()}|{Major?.Trim()}|{Classification?.Trim()}|{IssueDate}|{GraduationYear}|{Gpa ?? ""}";
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
